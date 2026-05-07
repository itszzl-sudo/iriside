<template>
  <div class="focus-tracker-panel">
    <div class="panel-header">
      <h3>🎯 焦点追踪与推理</h3>
      <div class="status-bar">
        <span class="status-item" :class="{ active: status.isBackgroundRunning }">
          {{ status.isBackgroundRunning ? '🔄 推理中' : '✅ 就绪' }}
        </span>
        <span class="status-item">队列: {{ status.queueLength }}</span>
        <span class="status-item">历史: {{ status.historyCount }}</span>
      </div>
    </div>

    <!-- 当前焦点 -->
    <div v-if="currentFocus" class="current-focus">
      <div class="focus-header">
        <span class="focus-type-badge">{{ currentFocus.type }}</span>
        <span class="focus-target">{{ currentFocus.target }}</span>
        <span class="focus-time">{{ formatTime(currentFocus.timestamp) }}</span>
      </div>

      <!-- 快速推理 -->
      <div class="quick-inferences">
        <h4>⚡ 快速推理</h4>
        <div class="inference-list">
          <div
            v-for="(inf, index) in currentFocus.quickInferences"
            :key="index"
            class="inference-item"
            :class="`priority-${inf.priority >= 9 ? 'high' : inf.priority >= 7 ? 'medium' : 'low'}`"
          >
            <div class="inf-header">
              <span class="inf-badge">{{ inf.type }}</span>
              <span class="inf-message">{{ inf.message }}</span>
            </div>
            <div class="inf-details">{{ inf.details }}</div>
            <button @click="executeAction(inf)" class="inf-action-btn">
              执行
            </button>
          </div>
        </div>
      </div>

      <!-- 深度推理 -->
      <div v-if="currentFocus.deepInferences?.length > 0" class="deep-inferences">
        <h4>🧠 深度推理</h4>
        
        <div v-for="(deep, dIndex) in currentFocus.deepInferences" :key="dIndex" class="deep-section">
          <h5>{{ categoryLabel(deep.category) }}</h5>
          
          <div v-if="deep.category === 'alternatives'" class="alternatives-grid">
            <div v-for="(alt, aIndex) in deep.items" :key="aIndex" class="alternative-card">
              <div class="alt-name">{{ alt.approach }}</div>
              <div class="alt-desc">{{ alt.description }}</div>
              <div class="alt-pros">✓ {{ alt.pros.join(', ') }}</div>
              <div class="alt-cons">✗ {{ alt.cons.join(', ') }}</div>
            </div>
          </div>
          
          <div v-else-if="deep.category === 'dependencies'" class="deps-list">
            <div v-for="(dep, depIndex) in deep.items" :key="depIndex" class="dep-item">
              <span class="dep-name">{{ dep.item }}</span>
              <span class="dep-status" :class="dep.status">{{ dep.status }}</span>
              <span class="dep-reason">{{ dep.reason }}</span>
            </div>
          </div>
          
          <div v-else-if="deep.category === 'impacts'" class="impacts-list">
            <div v-for="(impact, iIndex) in deep.items" :key="iIndex" class="impact-item">
              <span class="impact-area">{{ impact.area }}</span>
              <span class="impact-effect" :class="impact.impact">{{ impact.impact }}</span>
              <span class="impact-degree">{{ impact.degree }}</span>
            </div>
          </div>
          
          <div v-else-if="deep.category === 'best-practices'" class="practices-list">
            <div v-for="(practice, pIndex) in deep.items" :key="pIndex" class="practice-item">
              <span class="practice-name">{{ practice.practice }}</span>
              <span class="practice-importance" :class="practice.importance">{{ practice.importance }}</span>
              <span class="practice-reason">{{ practice.reason }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐 -->
      <div v-if="currentFocus.recommendations?.length > 0" class="recommendations">
        <h4>💡 最佳建议</h4>
        <div class="rec-list">
          <div
            v-for="(rec, rIndex) in currentFocus.recommendations"
            :key="rIndex"
            class="rec-item"
          >
            <span class="rec-icon">{{ rec.type === 'approach' ? '🎯' : '⭐' }}</span>
            <div class="rec-content">
              <div class="rec-message">{{ rec.message }}</div>
              <div class="rec-reason">{{ rec.reason }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 焦点历史 -->
    <div class="focus-history">
      <h4>📜 焦点历史</h4>
      <div class="history-list">
        <div
          v-for="(item, index) in history"
          :key="index"
          class="history-item"
          @click="viewExploration(item.id)"
        >
          <span class="hist-type">{{ item.type }}</span>
          <span class="hist-target">{{ item.target }}</span>
          <span class="hist-time">{{ formatTime(item.timestamp) }}</span>
          <span class="hist-duration">{{ formatDuration(item.duration) }}</span>
          <span class="hist-status" :class="{ completed: item.status === 'completed' }">
            {{ item.status === 'completed' ? '✅' : '⏸️' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 探索记录 -->
    <div class="explorations">
      <h4>🔍 完整探索记录</h4>
      <div class="exploration-stats">
        <span>总计: {{ explorations.length }} 个探索</span>
        <span>已完成: {{ explorations.filter(e => e.completed).length }}</span>
        <span>待完成: {{ explorations.filter(e => !e.completed).length }}</span>
      </div>
      
      <div class="exploration-list">
        <div
          v-for="(exp, eIndex) in explorations"
          :key="eIndex"
          class="exploration-item"
          :class="{ completed: exp.completed }"
          @click="viewExploration(exp.id)"
        >
          <div class="exp-header">
            <span class="exp-type">{{ exp.type }}</span>
            <span class="exp-target">{{ exp.target }}</span>
            <span class="exp-badge">{{ exp.completed ? '完整' : '部分' }}</span>
          </div>
          <div class="exp-meta">
            <span>快速: {{ exp.quickInferences?.length || 0 }}</span>
            <span>深度: {{ exp.deepInferences?.length || 0 }}</span>
            <span>推荐: {{ exp.recommendations?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { FocusTracker } from '../../focus/FocusTracker.js';

export default {
  name: 'FocusTrackerUI',
  setup() {
    const tracker = new FocusTracker();
    
    const currentFocus = ref(null);
    const status = ref({
      isBackgroundRunning: false,
      queueLength: 0,
      historyCount: 0,
      explorationsCount: 0
    });
    const history = ref([]);
    const explorations = ref([]);
    
    let updateInterval = null;

    const updateStatus = () => {
      status.value = tracker.getCurrentStatus();
      history.value = tracker.getHistory();
      explorations.value = tracker.getAllExplorations();
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const formatDuration = (ms) => {
      if (!ms) return '-';
      if (ms < 1000) return `${ms}ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
      return `${(ms / 60000).toFixed(1)}m`;
    };

    const categoryLabel = (category) => {
      const labels = {
        'alternatives': '🎯 替代方案',
        'dependencies': '🔗 依赖分析',
        'impacts': '📊 影响评估',
        'best-practices': '⭐ 最佳实践'
      };
      return labels[category] || category;
    };

    const executeAction = (inference) => {
      alert(`执行: ${inference.action}\n\n${inference.details}`);
    };

    const viewExploration = (id) => {
      const exp = tracker.getExploration(id);
      if (exp) {
        currentFocus.value = exp;
      }
    };

    const setNewFocus = (focusData) => {
      const result = tracker.setFocus(focusData);
      currentFocus.value = result.current;
      updateStatus();
      return result;
    };

    onMounted(() => {
      tracker.loadFromStorage();
      updateStatus();
      
      updateInterval = setInterval(updateStatus, 1000);
    });

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    });

    return {
      currentFocus,
      status,
      history,
      explorations,
      formatTime,
      formatDuration,
      categoryLabel,
      executeAction,
      viewExploration,
      setNewFocus
    };
  }
};
</script>

<style scoped>
.focus-tracker-panel {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
  color: #d4d4d4;
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
}

.status-bar {
  display: flex;
  gap: 16px;
}

.status-item {
  padding: 4px 12px;
  background: #2d2d30;
  border-radius: 4px;
  font-size: 12px;
}

.status-item.active {
  background: #007acc;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.current-focus {
  background: #2d2d30;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.focus-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.focus-type-badge {
  padding: 6px 12px;
  background: #007acc;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.focus-target {
  font-size: 18px;
  font-weight: 600;
}

.focus-time {
  margin-left: auto;
  color: #858585;
  font-size: 13px;
}

.quick-inferences,
.deep-inferences,
.recommendations {
  margin-bottom: 20px;
}

.quick-inferences h4,
.deep-inferences h4,
.recommendations h4 {
  margin: 0 0 12px;
}

.inference-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inference-item {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid;
}

.inference-item.priority-high {
  border-left-color: #f5576c;
}

.inference-item.priority-medium {
  border-left-color: #f093fb;
}

.inference-item.priority-low {
  border-left-color: #667eea;
}

.inf-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.inf-badge {
  padding: 2px 8px;
  background: #3c3c3c;
  border-radius: 3px;
  font-size: 11px;
}

.inf-message {
  font-weight: 600;
}

.inf-details {
  font-size: 12px;
  color: #858585;
  margin-bottom: 8px;
}

.inf-action-btn {
  padding: 4px 12px;
  background: #007acc;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.deep-section {
  margin-bottom: 20px;
}

.deep-section h5 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #858585;
}

.alternatives-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.alternative-card {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
}

.alt-name {
  font-weight: bold;
  margin-bottom: 8px;
}

.alt-desc {
  font-size: 12px;
  color: #858585;
  margin-bottom: 8px;
}

.alt-pros {
  color: #43e97b;
  font-size: 12px;
  margin-bottom: 4px;
}

.alt-cons {
  color: #f5576c;
  font-size: 12px;
}

.deps-list,
.impacts-list,
.practices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dep-item,
.impact-item,
.practice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
  font-size: 13px;
}

.dep-status.required {
  color: #f5576c;
}

.dep-status.optional {
  color: #43e97b;
}

.impact-effect.positive {
  color: #43e97b;
}

.impact-effect.negative {
  color: #f5576c;
}

.impact-effect.neutral {
  color: #858585;
}

.practice-importance.high {
  color: #f5576c;
}

.practice-importance.medium {
  color: #f093fb;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rec-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #1e1e1e;
  border-radius: 6px;
}

.rec-icon {
  font-size: 24px;
}

.rec-message {
  font-weight: 600;
  margin-bottom: 4px;
}

.rec-reason {
  font-size: 12px;
  color: #858585;
}

.focus-history,
.explorations {
  margin-bottom: 20px;
}

.focus-history h4,
.explorations h4 {
  margin: 0 0 12px;
}

.exploration-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #858585;
}

.history-list,
.exploration-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item,
.exploration-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #2d2d30;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.history-item:hover,
.exploration-item:hover {
  background: #37373d;
}

.exploration-item.completed {
  border-left: 3px solid #43e97b;
}

.hist-status.completed {
  color: #43e97b;
}

.exp-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.exp-badge {
  padding: 2px 8px;
  background: #007acc;
  border-radius: 3px;
  font-size: 11px;
}

.exploration-item.completed .exp-badge {
  background: #43e97b;
  color: #1e1e1e;
}

.exp-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #858585;
}
</style>
