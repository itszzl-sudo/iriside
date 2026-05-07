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
        :element-context="selectedElement"
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
        
        <!-- 元素操作面板 -->
        <div v-if="selectedElement" class="element-panel">
          <div class="element-info">
            <span>已选择: {{ selectedElement.tagName }}</span>
            <span v-if="selectedElement.id" class="element-id">#{{ selectedElement.id }}</span>
            <span v-if="selectedElement.text" class="element-text">"{{ selectedElement.text }}"</span>
            <button @click="selectedElement = null; suggestions = []" class="clear-btn">✕</button>
          </div>
          <div class="element-actions">
            <button @click="addElementStyle('边框')" title="添加边框">🖼️ 边框</button>
            <button @click="addElementStyle('阴影')" title="添加阴影">💫 阴影</button>
            <button @click="addElementStyle('圆角')" title="添加圆角">⭕ 圆角</button>
            <button @click="addElementStyle('居中')" title="居中">⬇️ 居中</button>
            <button @click="addElementStyle('注音')" title="添加注音">🎵 注音</button>
            <button @click="addElementStyle('动画')" title="添加动画">🎬 动画</button>
          </div>
          <div class="element-hint">💡 在下方对话框输入针对该元素的修改需求</div>
        </div>
        
        <div class="preview-content">
          <iframe 
            ref="previewFrame"
            :srcdoc="previewContentWithScript" 
            class="preview-frame"
            @load="injectInteractionScript"
          ></iframe>
          <div v-if="showCode" class="code-overlay">
            <pre><code>{{ currentCode }}</code></pre>
            <button @click="copyCode" class="copy-btn">📋 复制代码</button>
          </div>
        </div>
        
        <!-- 智能建议 -->
        <div v-if="suggestions.length > 0" class="suggestions-panel">
          <div class="suggestions-header">💡 智能建议</div>
          <div class="suggestions-list">
            <div 
              v-for="(suggestion, index) in suggestions" 
              :key="index"
              class="suggestion-item"
              @click="applySuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
        
        <!-- 验证提示 -->
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
import { ref, onMounted, computed } from 'vue';
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
    const selectedElement = ref(null);
    const suggestions = ref([]);
    const previewFrame = ref(null);
    
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

    const handleSend = async (userInput, elementContext) => {
      let fullPrompt = userInput;
      
      if (elementContext && currentCode.value) {
        const el = elementContext;
        fullPrompt = `修改当前HTML页面中的 ${el.tagName}${el.id ? '#' + el.id : ''} 元素${el.text ? '（内容："' + el.text + '"）' : ''}：${userInput}\n\n当前代码：\n${currentCode.value}`;
      }
      
      messages.value.push({
        type: 'user',
        content: elementContext 
          ? `针对 ${elementContext.tagName}${elementContext.id ? '#' + elementContext.id : ''}：${userInput}`
          : userInput,
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
            prompt: fullPrompt,
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

    // 注入交互脚本到预览iframe
    const previewContentWithScript = computed(() => {
      if (!previewContent.value) return '';
      
      const script = `
        <script>
          document.addEventListener('click', function(e) {
            e.stopPropagation();
            const el = e.target;
            window.parent.postMessage({
              type: 'element-selected',
              tagName: el.tagName,
              id: el.id,
              className: el.className,
              text: el.innerText?.substring(0, 50)
            }, '*');
          }, true);
        <\/script>
      `;
      
      return previewContent.value.replace('</body>', script + '</body>');
    });

    // 监听iframe消息
    onMounted(() => {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'element-selected') {
          selectedElement.value = event.data;
          generateSuggestions(event.data);
        }
      });
    });

    // 生成智能建议
    const generateSuggestions = (element) => {
      const newSuggestions = [];
      
      if (element.tagName === 'TABLE') {
        newSuggestions.push('添加表格斑马纹');
        newSuggestions.push('添加悬停高亮');
        newSuggestions.push('添加响应式滚动');
      }
      
      if (element.tagName === 'IMG') {
        newSuggestions.push('添加圆角边框');
        newSuggestions.push('添加悬停放大效果');
        newSuggestions.push('添加加载动画');
      }
      
      if (element.tagName === 'BUTTON') {
        newSuggestions.push('添加点击波纹效果');
        newSuggestions.push('添加悬停渐变');
        newSuggestions.push('添加禁用状态');
      }
      
      if (element.tagName === 'INPUT') {
        newSuggestions.push('添加聚焦动画');
        newSuggestions.push('添加验证提示');
        newSuggestions.push('添加图标');
      }
      
      if (element.tagName === 'DIV' || element.tagName === 'SECTION') {
        newSuggestions.push('添加卡片阴影');
        newSuggestions.push('添加渐变背景');
        newSuggestions.push('添加滚动动画');
      }
      
      suggestions.value = newSuggestions;
    };

    // 添加元素样式
    const addElementStyle = async (styleType) => {
      const el = selectedElement.value;
      if (!el) return;
      
      let prompt = '';
      
      switch (styleType) {
        case '边框':
          prompt = `为 ${el.tagName}${el.id ? '#' + el.id : ''} 元素添加美观的边框`;
          break;
        case '阴影':
          prompt = `为 ${el.tagName}${el.id ? '#' + el.id : ''} 元素添加柔和的阴影效果`;
          break;
        case '圆角':
          prompt = `为 ${el.tagName}${el.id ? '#' + el.id : ''} 元素添加圆角`;
          break;
        case '居中':
          prompt = `将 ${el.tagName}${el.id ? '#' + el.id : ''} 元素居中显示`;
          break;
        case '注音':
          prompt = `为 ${el.tagName}${el.id ? '#' + el.id : ''} 元素内的文字添加拼音注音`;
          break;
        case '动画':
          prompt = `为 ${el.tagName}${el.id ? '#' + el.id : ''} 元素添加入场动画`;
          break;
      }
      
      await handleSend(`修改当前HTML页面：${prompt}\n\n当前代码：\n${currentCode.value}`);
    };

    // 应用建议
    const applySuggestion = async (suggestion) => {
      const el = selectedElement.value;
      await handleSend(`修改当前HTML页面：为 ${el.tagName}${el.id ? '#' + el.id : ''} ${suggestion}\n\n当前代码：\n${currentCode.value}`);
      suggestions.value = [];
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
      selectedElement,
      suggestions,
      previewFrame,
      previewContentWithScript,
      handleModeChange,
      handleSend,
      loadHistory,
      useTemplate,
      toggleCode,
      copyCode,
      downloadFile,
      openInBrowser,
      optimizeCode,
      formatTime,
      addElementStyle,
      applySuggestion
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

.element-panel {
  padding: 12px 16px;
  background: #2d2d30;
  border-bottom: 1px solid #3c3c3c;
}

.element-info {
  margin-bottom: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-text {
  color: #ce9178;
  font-style: italic;
}

.clear-btn {
  margin-left: auto;
  padding: 2px 8px;
  background: transparent;
  border: 1px solid #3c3c3c;
  color: #858585;
  border-radius: 3px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #3c3c3c;
  color: #d4d4d4;
}

.element-id {
  color: #dcdcaa;
}

.element-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.element-actions button {
  padding: 6px 12px;
  background: #007acc;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.element-actions button:hover {
  background: #0586e8;
}

.element-hint {
  margin-top: 8px;
  font-size: 11px;
  color: #858585;
}

.suggestions-panel {
  padding: 8px 16px;
  background: #2d2d30;
  border-top: 1px solid #3c3c3c;
}

.suggestions-header {
  font-size: 12px;
  color: #858585;
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-item {
  padding: 6px 12px;
  background: #3c3c3c;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #d4d4d4;
}

.suggestion-item:hover {
  background: #007acc;
  color: white;
}
</style>
