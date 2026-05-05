import os
import shutil
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ===================== 请手动改这几个路径 =====================
# Astide 源项目根目录
ASTIDE_PROJECT = Path(r"D:/Code/astide_demo")
# Qoder 工作区目录（自动生成镜像项目）
QODER_WORKSPACE = Path(r"C:/Users/你的用户名/.qoder/workspace")
# Qoder 明文缓存目录
QODER_DOC_CACHE = Path(r"C:/Users/你的用户名/AppData/Local/qoder/Cache/docs")
# 导出后存放的知识库目录（给 Astide 用）
EXPORT_KB_DIR = Path(r"D:/Code/astide_kb_auto")
# =============================================================

# 生成镜像项目名
MIRROR_PROJ_NAME = "astide_mirror_auto"
QODER_MIRROR_PROJ = QODER_WORKSPACE / MIRROR_PROJ_NAME

# 监控是否生成新缓存文件
class CacheHandler(FileSystemEventHandler):
    def __init__(self):
        self.got_files = False

    def on_created(self, event):
        if not event.is_directory:
            self.got_files = True

def copy_project_structure(src: Path, dst: Path):
    """复制 Astide 项目结构+配置文件，不用全量代码，只留框架识别关键文件"""
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True, exist_ok=True)

    # 只复制识别技术栈的关键配置文件
    cfg_files = [
        "package.json", "tsconfig.json", "vite.config.js",
        "Cargo.toml", "requirements.txt", "go.mod"
    ]
    for f in cfg_files:
        sf = src / f
        if sf.exists():
            shutil.copy2(sf, dst / f)

    # 复制基础目录结构
    for item in src.iterdir():
        if item.is_dir() and not item.name.startswith((".", "node_modules")):
            shutil.copytree(item, dst / item.name, dirs_exist_ok=True)

def wait_qoder_cache_ready(watch_dir: Path, timeout=300):
    """监控缓存目录，直到生成新文档缓存"""
    event_handler = CacheHandler()
    observer = Observer()
    observer.schedule(event_handler, str(watch_dir), recursive=True)
    observer.start()

    start = time.time()
    print("等待 Qoder 生成项目专属明文知识库缓存...")
    while time.time() - start < timeout:
        if event_handler.got_files:
            break
        time.sleep(2)
    observer.stop()
    observer.join()
    print("Qoder 明文缓存已生成完毕")

def export_cache_kb():
    """导出 Qoder 生成的明文缓存到 Astide 知识库目录"""
    if EXPORT_KB_DIR.exists():
        shutil.rmtree(EXPORT_KB_DIR)
    EXPORT_KB_DIR.mkdir(parents=True)

    # 拷贝所有 md/txt/html 明文文档
    for file in QODER_DOC_CACHE.rglob("*"):
        if file.suffix in [".md", ".txt", ".html"]:
            shutil.copy2(file, EXPORT_KB_DIR / file.name)
    print(f"已导出专属知识库到：{EXPORT_KB_DIR}")

def main():
    print("1. 复制 Astide 项目结构到 Qoder 工作区")
    copy_project_structure(ASTIDE_PROJECT, QODER_MIRROR_PROJ)

    print("2. 请手动打开一次 Qoder，它会自动识别并索引该镜像项目")
    input("回车继续监控缓存...")

    # 等待明文缓存落盘
    wait_qoder_cache_ready(QODER_DOC_CACHE)

    # 导出知识库
    export_cache_kb()
    print("✅ 全自动流程完成，可直接在 Astide 导入该文件夹作为项目知识库")

if __name__ == "__main__":
    main()
