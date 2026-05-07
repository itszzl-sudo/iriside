<template>
  <div class="smart-suggestions-panel">
    <div class="panel-header">
      <h3>💡 智能建议</h3>
      <button @click="refreshAnalysis" class="refresh-btn" :disabled="analyzing">
        {{ analyzing ? '分析中...' : '🔄 刷新分析' }}
      </button>
    </div>

    <!-- 项目健康度 -->
    <div v-if="analysis" class="health-section">
      <div class="health-score">
        <div class="score-circle" :class="scoreClass">
          <span class="score-value">{{ analysis.quality?.score || 0 }}</span>
          <span class="score-label">健康度</span>
        </div>
      </div>
      
      <div class="health-details">
        <div class="detail-item" :class="{ active: analysis.quality?.hasTests }">
          <span class="detail-icon">{{ analysis.quality?.hasTests ? '✅' : '❌' }}</span>
          <span>单元测试</span>
        </div>
        <div class="detail-item" :class="{ active: analysis.quality?.hasLinting }">
          <span class="detail-icon">{{ analysis.quality?.hasLinting ? '✅' : '❌' }}</span>
          <span>代码检查</span>
        </div>
        <div class="detail-item" :class="{ active: analysis.quality?.hasFormatting }">
          <span class="detail-icon">{{ analysis.quality?.hasFormatting ? '✅' : '❌' }}</span>
          <span>格式化</span>
        </div>
        <div class="detail-item" :class="{ active: analysis.quality?.hasDocumentation }">
          <span class="detail-icon">{{ analysis.quality?.hasDocumentation ? '✅' : '❌' }}</span>
          <span>文档</span>
        </div>
        <div class="detail-item" :class="{ active: analysis.quality?.hasCI }">
          <span class="detail-icon">{{ analysis.quality?.hasCI ? '✅' : '❌' }}</span>
          <span>CI/CD</span>
        </div>
      </div>
    </div>

    <!-- 优先建议 -->
    <div v-if="recommendations.length > 0" class="recommendations-section">
      <h4>🎯 优先建议</h4>
      
      <div class="recommendation-list">
        <div
          v-for="(rec, index) in recommendations"
          :key="index"
          class="recommendation-card"
          :class="`priority-${rec.priority}`"
        >
          <div class="rec-header">
            <span class="rec-emoji">{{ rec.emoji }}</span>
            <span class="rec-category">{{ rec.category }}</span>
            <span class="rec-priority">{{ priorityLabel(rec.priority) }}</span>
          </div>
          
          <div class="rec-body">
            <h5>{{ rec.title }}</h5>
            <p>{{ rec.description }}</p>
          </div>
          
          <div class="rec-action">
            <button @click="executeRecommendation(rec)" class="action-btn">
              {{ rec.action }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目结构 -->
    <div v-if="analysis?.structure" class="structure-section">
      <h4>📁 项目结构</h4>
      
      <div class="structure-grid">
        <div class="structure-item">
          <span class="structure-label">目录数</span>
          <span class="structure-value">{{ analysis.structure.directories?.length || 0 }}</span>
        </div>
        <div class="structure-item">
          <span class="structure-label">文件数</span>
          <span class="structure-value">{{ analysis.structure.totalFiles || 0 }}</span>
        </div>
        <div class="structure-item">
          <span class="structure-label">大小</span>
          <span class="structure-value">{{ formatSize(analysis.structure.totalSize || 0) }}</span>
        </div>
      </div>

      <div class="tech-stack" v-if="analysis.codebase?.frameworks?.length > 0">
        <span class="tech-label">技术栈：</span>
        <span v-for="fw in analysis.codebase.frameworks" :key="fw" class="tech-badge">
          {{ fw }}
        </span>
      </div>
    </div>

    <!-- 下一步行动 -->
    <div v-if="nextSteps.length > 0" class="next-steps-section">
      <h4>📋 建议下一步</h4>
      
      <div class="steps-list">
        <div v-for="step in nextSteps" :key="step.step" class="step-item">
          <span class="step-number">{{ step.step }}</span>
          <div class="step-content">
            <div class="step-action">{{ step.action }}</div>
            <div class="step-meta">
              <code class="step-command">{{ step.command }}</code>
              <span class="step-time">⏱️ {{ step.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 机会提示 -->
    <div v-if="opportunities.length > 0" class="opportunities-section">
      <h4>🌟 改进机会</h4>
      
      <div class="opportunity-list">
        <div
          v-for="(opp, index) in opportunities"
          :key="index"
          class="opportunity-item"
          @click="showOpportunityDetail(opp)"
        >
          <span class="opp-icon">{{ getOppIcon(opp.type) }}</span>
          <div class="opp-content">
            <div class="opp-title">{{ opp.message }}</div>
            <div class="opp-suggestion">{{ opp.suggestion }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { ProjectAnalyzer } from '../../analyzer/ProjectAnalyzer.js';

export default {
  name: 'SmartSuggestions',
  setup() {
    const analyzer = new ProjectAnalyzer(process.cwd());
    const analysis = ref(null);
    const analyzing = ref(false);
    
    const recommendations = computed(() => {
      return analysis.value?.recommendations || [];
    });
    
    const opportunities = computed(() => {
      return analysis.value?.opportunities || [];
    });
    
    const nextSteps = computed(() => {
      return analyzer.getNextSteps();
    });
    
    const scoreClass = computed(() => {
      const score = analysis.value?.quality?.score || 0;
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      if (score >= 40) return 'fair';
      return 'poor';
    });

    const refreshAnalysis = async () => {
      analyzing.value = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        analysis.value = analyzer.analyze();
      } catch (error) {
        console.error('分析失败:', error);
      }
      
      analyzing.value = false;
    };

    const priorityLabel = (priority) => {
      return { 1: '高优先', 2: '中优先', 3: '建议' }[priority];
    };

    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const executeRecommendation = (rec) => {
      alert(`执行建议: ${rec.title}\n\n${rec.description}`);
    };

    const showOpportunityDetail = (opp) => {
      alert(`${opp.message}\n\n${opp.suggestion}`);
    };

    const getOppIcon = (type) => {
      return {
        optimization: '⚡',
        testing: '🧪',
        performance: '🚀',
        security: '🔒'
      }[type] || '💡';
    };

    onMounted(() => {
      refreshAnalysis();
    });

    return {
      analysis,
      analyzing,
      recommendations,
      opportunities,
      nextSteps,
      scoreClass,
      refreshAnalysis,
      priorityLabel,
      formatSize,
      executeRecommendation,
      showOpportunityDetail,
      getOppIcon
    };
  }
};
</script>

<style scoped>
.smart-suggestions-panel {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
  color: #d4d4d4;
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

.refresh-btn {
  padding: 6px 16px;
  background: #007acc;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.health-section {
  margin-bottom: 30px;
  display: flex;
  gap: 30px;
  align-items: center;
}

.health-score {
  flex-shrink: 0;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid;
}

.score-circle.excellent {
  border-color: #43e97b;
  background: rgba(67, 233, 123, 0.1);
}

.score-circle.good {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.score-circle.fair {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.score-circle.poor {
  border-color: #f5576c;
  background: rgba(245, 87, 108, 0.1);
}

.score-value {
  font-size: 32px;
  font-weight: bold;
}

.score-label {
  font-size: 12px;
  color: #858585;
}

.health-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  flex: 1;
}

.detail-item {
  padding: 8px 12px;
  background: #2d2d30;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-item.active {
  background: rgba(67, 233, 123, 0.1);
  border: 1px solid #43e97b;
}

.recommendations-section,
.structure-section,
.next-steps-section,
.opportunities-section {
  margin-bottom: 30px;
}

.recommendations-section h4,
.structure-section h4,
.next-steps-section h4,
.opportunities-section h4 {
  margin: 0 0 16px;
  font-size: 16px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-card {
  background: #2d2d30;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid;
}

.recommendation-card.priority-1 {
  border-left-color: #f5576c;
}

.recommendation-card.priority-2 {
  border-left-color: #f093fb;
}

.recommendation-card.priority-3 {
  border-left-color: #667eea;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.rec-emoji {
  font-size: 24px;
}

.rec-category {
  padding: 4px 10px;
  background: #3c3c3c;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
}

.rec-priority {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}

.priority-1 .rec-priority {
  background: #f5576c;
}

.priority-2 .rec-priority {
  background: #f093fb;
}

.priority-3 .rec-priority {
  background: #667eea;
}

.rec-body h5 {
  margin: 0 0 8px;
  font-size: 15px;
}

.rec-body p {
  margin: 0;
  font-size: 13px;
  color: #858585;
}

.rec-action {
  margin-top: 12px;
}

.action-btn {
  padding: 8px 20px;
  background: #007acc;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.structure-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.structure-item {
  text-align: center;
  padding: 16px;
  background: #2d2d30;
  border-radius: 8px;
}

.structure-label {
  display: block;
  font-size: 12px;
  color: #858585;
  margin-bottom: 8px;
}

.structure-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007acc;
}

.tech-stack {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tech-label {
  font-size: 13px;
  color: #858585;
}

.tech-badge {
  padding: 4px 12px;
  background: #007acc;
  border-radius: 4px;
  font-size: 12px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #2d2d30;
  border-radius: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #007acc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-action {
  font-weight: 600;
  margin-bottom: 8px;
}

.step-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-command {
  padding: 4px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  font-size: 12px;
}

.step-time {
  font-size: 12px;
  color: #858585;
}

.opportunity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opportunity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #2d2d30;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.opportunity-item:hover {
  background: #37373d;
}

.opp-icon {
  font-size: 24px;
}

.opp-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.opp-suggestion {
  font-size: 12px;
  color: #858585;
}
</style>
