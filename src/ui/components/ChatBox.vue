<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="['message', msg.type]"
      >
        <div class="message-header">
          <span class="sender">{{ getSenderLabel(msg.type) }}</span>
          <span class="time">{{ formatTime(msg.timestamp) }}</span>
        </div>
        <div class="message-content">
          <pre v-if="isCode(msg.content)">{{ msg.content }}</pre>
          <div v-else>{{ msg.content }}</div>
          <div v-if="msg.loading" class="loading">...</div>
        </div>
        <div v-if="msg.type === 'assistant' && !msg.loading" class="message-actions">
          <button @click="$emit('viewAST', msg)">查看AST</button>
          <button>接受</button>
          <button>拒绝</button>
        </div>
      </div>
    </div>
    
    <div class="input-area">
      <textarea 
        v-model="inputText"
        placeholder="输入需求或问题..."
        @keydown.enter.exact.prevent="handleSend"
        rows="3"
      />
      <div class="input-actions">
        <button @click="attachFile">附加文件</button>
        <button class="primary" @click="handleSend">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';

export default {
  name: 'ChatBox',
  props: {
    messages: Array,
    mode: String
  },
  emits: ['send', 'viewAST'],
  setup(props, { emit }) {
    const inputText = ref('');
    const messagesContainer = ref(null);

    const handleSend = () => {
      if (!inputText.value.trim()) return;
      
      emit('send', inputText.value);
      inputText.value = '';
    };

    const attachFile = () => {
      alert('文件附加功能待实现');
    };

    const getSenderLabel = (type) => {
      const labels = {
        user: '用户',
        assistant: 'AI',
        system: '系统'
      };
      return labels[type] || type;
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const isCode = (content) => {
      return content.includes('```') || content.includes('function') || content.includes('const');
    };

    watch(() => props.messages.length, () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    });

    return {
      inputText,
      messagesContainer,
      handleSend,
      attachFile,
      getSenderLabel,
      formatTime,
      isCode
    };
  }
};
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 8px;
  background: #252526;
}

.message.user {
  background: #2d2d30;
  margin-left: 40px;
}

.message.assistant {
  background: #252526;
  margin-right: 40px;
}

.message.system {
  background: #3c3c3c;
  text-align: center;
  margin: 10px 80px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #858585;
}

.message-content {
  line-height: 1.6;
}

.message-content pre {
  background: #1e1e1e;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.loading {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.message-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.message-actions button {
  padding: 6px 12px;
  border: 1px solid #3c3c3c;
  background: #2d2d30;
  color: #d4d4d4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.message-actions button:hover {
  background: #3c3c3c;
}

.input-area {
  border-top: 1px solid #3c3c3c;
  padding: 20px;
  background: #252526;
}

.input-area textarea {
  width: 100%;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  color: #d4d4d4;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.input-area textarea:focus {
  outline: none;
  border-color: #007acc;
}

.input-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.input-actions button {
  padding: 8px 20px;
  border: 1px solid #3c3c3c;
  background: #2d2d30;
  color: #d4d4d4;
  border-radius: 4px;
  cursor: pointer;
}

.input-actions button.primary {
  background: #007acc;
  border-color: #007acc;
}

.input-actions button:hover {
  opacity: 0.9;
}
</style>
