<template>
  <div id="app">
    <div class="header">
      <h1>AST-IDE</h1>
      <div class="header-actions">
        <button @click="showHistory = !showHistory" class="header-btn">📜 历史</button>
        <button @click="showTemplates = !showTemplates" class="header-btn">📋 模板</button>
        <ModeSwitch :mode="currentMode" @change="handleModeChange" />
      </div>
    </div>
    
    <div class="main-container">
      <ChatBox 
        :messages="messages"
        :mode="currentMode"
        @send="handleSend"
      />
      
      <!-- 历史记录面板 -->
      <div v-if="showHistory" class="history-panel">
        <div class="panel-header">
          <h3>历史记录</h3>
          <button @click="showHistory = false">×</button>
        </div>
        <div class="history-list">
          <div 
            v-for="(item, index) in history" 
            :key="index"
            class="history-item"
            @click="loadHistory(item)"
          >
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
            <div class="history-prompt">{{ item.prompt }}</div>
            <div class="history-preview">点击查看</div>
          </div>
          <div v-if="history.length === 0" class="empty-history">
            暂无历史记录
          </div>
        </div>
      </div>
      
      <!-- 快捷模板面板 -->
      <div v-if="showTemplates" class="templates-panel">
        <div class="panel-header">
          <h3>快捷模板</h3>
          <button @click="showTemplates = false">×</button>
        </div>
        <div class="templates-list">
          <div 
            v-for="(template, index) in templates" 
            :key="index"
            class="template-item"
            @click="useTemplate(template)"
          >
            <div class="template-icon">{{ template.icon }}</div>
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.desc }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预览面板（主显示区） -->
      <div v-if="showPreview" class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <div class="preview-actions">
            <button @click="toggleCode" :title="showCode ? '隐藏代码' : '查看代码'">
              {{ showCode ? '👁️ 隐藏代码' : '👁️ 查看代码' }}
            </button>
            <button @click="downloadFile" title="下载文件">⬇️ 下载</button>
            <button @click="openInBrowser" title="在浏览器打开">🌐 打开</button>
            <button @click="optimizeCode" title="AI优化">✨ 优化</button>
            <button @click="showPreview = false">×</button>
          </div>
        </div>
        <div class="preview-content">
          <iframe :srcdoc="previewContent" class="preview-frame"></iframe>
          <div v-if="showCode" class="code-overlay">
            <pre><code>{{ currentCode }}</code></pre>
            <button @click="copyCode" class="copy-btn">📋 复制代码</button>
          </div>
        </div>
        <!-- 自动提示 -->
        <div v-if="validation" class="validation-info">
          <span v-if="validation.errors > 0" class="error">⚠️ {{ validation.errors }} 个问题</span>
          <span v-if="validation.warnings > 0" class="warning">💡 {{ validation.warnings }} 个建议</span>
          <span v-if="validation.valid" class="success">✅ 验证通过</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import ChatBox from './components/ChatBox.vue';
import ModeSwitch from './components/ModeSwitch.vue';

export default {
  name: 'App',
  components: {
    ChatBox,
    ModeSwitch
  },
  setup() {
    const currentMode = ref('vibe');
    const messages = ref([]);
    const showPreview = ref(false);
    const previewContent = ref('');
    const currentCode = ref('');
    const currentFile = ref(null);
    const showCode = ref(false);
    const showHistory = ref(false);
    const showTemplates = ref(false);
    const validation = ref(null);
    const history = ref([]);
    
    const templates = ref([
      { icon: '📊', name: '数据表格', desc: '美观的数据展示表格', prompt: '创建一个美观的数据表格，包含姓名、年龄、职业、薪资，带头像和操作按钮' },
      { icon: '📝', name: '登录表单', desc: '现代风格登录页面', prompt: '创建一个现代风格的登录表单，包含用户名、密码输入框，带记住我和忘记密码功能' },
      { icon: '🎨', name: '产品卡片', desc: '电商产品展示卡片', prompt: '创建一个精美的产品展示卡片，包含图片、标题、价格、评分和购买按钮' },
      { icon: '📈', name: '数据图表', desc: '可视化数据图表', prompt: '创建一个数据可视化图表，展示销售数据的柱状图或折线图' },
      { icon: '📱', name: '个人主页', desc: '个人介绍页面', prompt: '创建一个个人主页，包含头像、简介、技能展示和社交链接' },
      { icon: '🛒', name: '购物车', desc: '购物车界面', prompt: '创建一个购物车页面，包含商品列表、数量调整、总价计算和结算按钮' },
      { icon: '📰', name: '新闻列表', desc: '新闻资讯列表', prompt: '创建一个新闻列表页面，包含标题、摘要、时间、图片和阅读更多按钮' },
      { icon: '💬', name: '聊天界面', desc: '即时通讯界面', prompt: '创建一个聊天界面，包含消息列表、输入框、发送按钮和在线状态' }
    ]);

    // 加载历史记录
    onMounted(() => {
      const saved = localStorage.getItem('ast-ide-history');
      if (saved) {
        history.value = JSON.parse(saved);
      }
    });

    const handleModeChange = (mode) => {
      currentMode.value = mode;
      messages.value.push({
        type: 'system',
        content: `已切换到 ${mode === 'vibe' ? 'Vibe模式' : 'Spec模式'}`,
        timestamp: Date.now()
      });
    };

    const handleSend = async (userInput) => {
      messages.value.push({
        type: 'user',
        content: userInput,
        timestamp: Date.now()
      });

      messages.value.push({
        type: 'assistant',
        content: '🎨 正在生成...',
        timestamp: Date.now(),
        loading: true
      });

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userInput,
            mode: currentMode.value
          })
        });

        const result = await response.json();
        
        // 保存到历史
        const historyItem = {
          timestamp: Date.now(),
          prompt: userInput,
          code: result.code,
          file: result.file,
          preview: result.code
        };
        history.value.unshift(historyItem);
        if (history.value.length > 20) history.value.pop();
        localStorage.setItem('ast-ide-history', JSON.stringify(history.value));
        
        // 更新当前状态
        currentCode.value = result.code;
        currentFile.value = result.file;
        validation.value = result.validation;
        
        // 自动预览（不显示代码）
        if (result.language === 'html') {
          previewContent.value = result.code;
          showPreview.value = true;
          showCode.value = false; // 默认隐藏代码
        }
        
        // 显示简洁消息
        messages.value[messages.value.length - 1] = {
          type: 'assistant',
          content: `✅ 已生成！\n📁 ${result.file}\n${result.validation ? (result.validation.valid ? '✅ 验证通过' : `⚠️ ${result.validation.errors}个问题`) : ''}`,
          timestamp: Date.now()
        };
        
      } catch (error) {
        messages.value[messages.value.length - 1] = {
          type: 'assistant',
          content: `❌ 错误: ${error.message}`,
          timestamp: Date.now()
        };
      }
    };

    const loadHistory = (item) => {
      currentCode.value = item.code;
      currentFile.value = item.file;
      previewContent.value = item.code;
      showPreview.value = true;
      showCode.value = false;
      showHistory.value = false;
    };

    const useTemplate = (template) => {
      showTemplates.value = false;
      handleSend(template.prompt);
    };

    const toggleCode = () => {
      showCode.value = !showCode.value;
    };

    const copyCode = async () => {
      await navigator.clipboard.writeText(currentCode.value);
      alert('代码已复制到剪贴板');
    };

    const downloadFile = () => {
      if (currentFile.value) {
        window.open(`/output/${currentFile.value}`, '_blank');
      }
    };

    const openInBrowser = async () => {
      if (currentFile.value) {
        await fetch('/api/open-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: currentFile.value })
        });
      }
    };

    const optimizeCode = async () => {
      messages.value.push({
        type: 'user',
        content: '✨ 优化当前页面',
        timestamp: Date.now()
      });
      
      await handleSend(`优化这个HTML页面，提升美观度和用户体验：\n${currentCode.value}`);
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return {
      currentMode,
      messages,
      showPreview,
      previewContent,
      currentCode,
      showCode,
      showHistory,
      showTemplates,
      validation,
      history,
      templates,
      handleModeChange,
      handleSend,
      loadHistory,
      useTemplate,
      toggleCode,
      copyCode,
      downloadFile,
      openInBrowser,
      optimizeCode,
      formatTime
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1e1e1e;
  color: #d4d4d4;
  height: 100vh;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 50px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header h1 {
  font-size: 18px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  padding: 6px 12px;
  background: #2d2d30;
  border: 1px solid #3c3c3c;
  color: #d4d4d4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.header-btn:hover {
  background: #3c3c3c;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.history-panel, .templates-panel {
  position: absolute;
  left: 0;
  top: 0;
  width: 350px;
  height: 100%;
  background: #252526;
  border-right: 1px solid #3c3c3c;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3c3c3c;
}

.panel-header h3 {
  font-size: 14px;
}

.panel-header button {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #858585;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
}

.panel-header button:hover {
  background: #3c3c3c;
  color: #d4d4d4;
}

.history-list, .templates-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-item {
  padding: 12px;
  background: #2d2d30;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}

.history-item:hover {
  background: #3c3c3c;
}

.history-time {
  font-size: 11px;
  color: #858585;
  margin-bottom: 4px;
}

.history-prompt {
  font-size: 13px;
  color: #d4d4d4;
  margin-bottom: 4px;
}

.history-preview {
  font-size: 11px;
  color: #007acc;
}

.empty-history {
  text-align: center;
  color: #858585;
  padding: 40px 20px;
}

.template-item {
  padding: 12px;
  background: #2d2d30;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: center;
}

.template-item:hover {
  background: #3c3c3c;
}

.template-icon {
  font-size: 32px;
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #858585;
}

.preview-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 60%;
  height: 100%;
  background: #252526;
  border-left: 1px solid #3c3c3c;
  display: flex;
  flex-direction: column;
  z-index: 90;
}

.preview-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3c3c3c;
}

.preview-header h3 {
  font-size: 14px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-actions button {
  padding: 6px 12px;
  background: #2d2d30;
  border: 1px solid #3c3c3c;
  color: #d4d4d4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.preview-actions button:hover {
  background: #3c3c3c;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.code-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 30, 0.95);
  overflow: auto;
  padding: 20px;
}

.code-overlay pre {
  background: #2d2d30;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.code-overlay code {
  color: #d4d4d4;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.copy-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  background: #007acc;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.validation-info {
  padding: 8px 16px;
  border-top: 1px solid #3c3c3c;
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.error { color: #f48771; }
.warning { color: #dcdcaa; }
.success { color: #89d185; }
</style>
