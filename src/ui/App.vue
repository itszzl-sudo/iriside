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

      setTimeout(() => {
        messages.value[messages.value.length - 1] = {
          type: 'assistant',
          content: `已收到需求：${userInput}\n\n代码生成中...`,
          timestamp: Date.now()
        };
      }, 1000);
    };

    const handleViewAST = (astData) => {
      currentAST.value = astData;
      showASTViewer.value = true;
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
