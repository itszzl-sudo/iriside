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
        
        messages.value[messages.value.length - 1] = {
          type: 'assistant',
          content: result.code || result.message,
          timestamp: Date.now(),
          astData: result.astData || null
        };
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
        // 如果消息没有AST数据，请求后端解析
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

    return {
      currentMode,
      messages,
      showASTViewer,
      currentAST,
      handleModeChange,
      handleSend,
      handleViewAST
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
</style>
