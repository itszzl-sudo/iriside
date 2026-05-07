<template>
  <div id="app">
    <div class="header">
      <h1>AST-IDE</h1>
      <ModeSwitch :mode="currentMode" @change="handleModeChange" />
    </div>
    
    <div class="main-container">
      <ChatBox 
        :messages="messages"
        :mode="currentMode"
        @send="handleSend"
        @viewAST="handleViewAST"
      />
      
      <div v-if="showPreview" class="preview-panel">
        <div class="preview-header">
          <h3>实时预览</h3>
          <button @click="openInBrowser" title="在新窗口打开">🌐</button>
          <button @click="showPreview = false">×</button>
        </div>
        <iframe :srcdoc="previewContent" class="preview-frame"></iframe>
      </div>
      
      <ASTViewer 
        v-if="showASTViewer"
        :astData="currentAST"
        @close="showASTViewer = false"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import ChatBox from './components/ChatBox.vue';
import ModeSwitch from './components/ModeSwitch.vue';
import ASTViewer from './components/ASTViewer.vue';

export default {
  name: 'App',
  components: {
    ChatBox,
    ModeSwitch,
    ASTViewer
  },
  setup() {
    const currentMode = ref('vibe');
    const messages = ref([]);
    const showASTViewer = ref(false);
    const currentAST = ref(null);
    const showPreview = ref(false);
    const previewContent = ref('');
    const currentFile = ref(null);
    const generationHistory = ref([]);

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
        content: '正在处理...',
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
        
        // 自动保存到历史
        generationHistory.value.unshift({
          timestamp: Date.now(),
          prompt: userInput,
          code: result.code,
          file: result.file
        });
        
        // 构建显示内容
        let displayContent = result.code || result.message;
        
        // 如果有验证结果，添加提示
        if (result.validation) {
          const validationInfo = [];
          
          if (result.validation.errors > 0) {
            validationInfo.push(`⚠️ 发现 ${result.validation.errors} 个错误`);
          }
          
          if (result.validation.warnings > 0) {
            validationInfo.push(`💡 ${result.validation.warnings} 个优化建议`);
          }
          
          if (validationInfo.length > 0) {
            displayContent += '\n\n---\n**自动验证结果:**\n' + validationInfo.join('\n');
          }
        }
        
        // 添加文件保存信息
        if (result.file) {
          displayContent += `\n\n📁 已自动保存: ${result.file}`;
          currentFile.value = result.file;
        }
        
        messages.value[messages.value.length - 1] = {
          type: 'assistant',
          content: displayContent,
          timestamp: Date.now(),
          astData: result.astData || null,
          hasPreview: result.language === 'html'
        };
        
        // 自动预览HTML
        if (result.language === 'html' && result.code) {
          previewContent.value = result.code;
          showPreview.value = true;
        }
        
      } catch (error) {
        messages.value[messages.value.length - 1] = {
          type: 'assistant',
          content: `错误: ${error.message}\n\n请确保已配置API密钥并启动后端服务`,
          timestamp: Date.now()
        };
      }
    };

    const handleViewAST = (message) => {
      if (message.astData) {
        currentAST.value = message.astData;
        showASTViewer.value = true;
      } else {
        parseAndShowAST(message.content);
      }
    };

    const parseAndShowAST = async (code) => {
      try {
        const response = await fetch('/api/parse-ast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        
        const result = await response.json();
        currentAST.value = result;
        showASTViewer.value = true;
      } catch (error) {
        console.error('解析AST失败:', error);
      }
    };

    const openInBrowser = async () => {
      if (currentFile.value) {
        try {
          await fetch('/api/open-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: currentFile.value })
          });
        } catch (error) {
          console.error('打开预览失败:', error);
        }
      }
    };

    return {
      currentMode,
      messages,
      showASTViewer,
      currentAST,
      showPreview,
      previewContent,
      handleModeChange,
      handleSend,
      handleViewAST,
      openInBrowser
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.preview-panel {
  position: absolute;
  right: 520px;
  top: 0;
  width: 500px;
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
  gap: 12px;
  border-bottom: 1px solid #3c3c3c;
}

.preview-header h3 {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.preview-header button {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #858585;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-header button:hover {
  background: #3c3c3c;
  color: #d4d4d4;
}

.preview-frame {
  flex: 1;
  border: none;
  background: white;
}
</style>
