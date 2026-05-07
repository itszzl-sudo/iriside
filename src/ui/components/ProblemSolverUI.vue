<template>
  <div class="problem-solver-ui">
    <div class="solver-header">
      <h2>🧠 复杂问题解决器</h2>
      <p>模拟人类思考过程，系统化解决复杂问题</p>
    </div>

    <div class="solver-body">
      <!-- 输入区 -->
      <div class="input-section">
        <textarea
          v-model="problemDescription"
          placeholder="描述你遇到的复杂问题...&#10;&#10;例如：&#10;- 开发一个用户登录系统&#10;- 学习React框架&#10;- 修复首页加载缓慢的Bug&#10;- 写一篇技术博客"
          rows="5"
        ></textarea>
        
        <div class="quick-patterns">
          <span class="label">快速模板：</span>
          <button 
            v-for="pattern in patterns" 
            :key="pattern"
            @click="applyPattern(pattern)"
            class="pattern-btn"
          >
            {{ pattern }}
          </button>
        </div>

        <button @click="analyzeProblem" class="analyze-btn" :disabled="!problemDescription">
          🔍 分析问题
        </button>
      </div>

      <!-- 分析结果 -->
      <div v-if="analysis" class="analysis-section">
        <div class="analysis-header">
          <h3>📊 问题分析</h3>
          <div class="meta-info">
            <span class="badge">{{ complexityLabel }}</span>
            <span v-if="analysis.identifiedPattern" class="pattern-badge">
              识别模式: {{ analysis.identifiedPattern.name }}
            </span>
          </div>
        </div>

        <div class="keywords" v-if="analysis.keywords.length > 0">
          <strong>关键词：</strong>
          <span v-for="kw in analysis.keywords" :key="kw" class="keyword">{{ kw }}</span>
        </div>

        <!-- 解决步骤 -->
        <div class="phases-container">
          <h4>📋 解决步骤（共{{ analysis.phases.length }}步）</h4>
          
          <div class="phase-list">
            <div
              v-for="(phase, index) in analysis.phases"
              :key="index"
              class="phase-item"
              :class="getPhaseClass(phase)"
            >
              <div class="phase-header">
                <span class="phase-status">{{ getStatusEmoji(phase.status) }}</span>
                <span class="phase-number">{{ index + 1 }}</span>
                <span class="phase-name">{{ phase.name || phase.phase }}</span>
                <span v-if="phase.estimatedTime" class="phase-time">⏱️ {{ phase.estimatedTime }}</span>
              </div>

              <div class="phase-content" v-if="phase.description">
                <p class="phase-desc">{{ phase.description }}</p>
              </div>

              <div class="phase-questions" v-if="phase.questions">
                <strong>思考问题：</strong>
                <ul>
                  <li v-for="q in phase.questions" :key="q">{{ q }}</li>
                </ul>
              </div>

              <div class="phase-techniques" v-if="phase.techniques">
                <strong>可用技巧：</strong>
                <div class="technique-list">
                  <span v-for="t in phase.techniques" :key="t" class="technique">{{ t }}</span>
                </div>
              </div>

              <div class="phase-dependencies" v-if="phase.dependencies && phase.dependencies.length > 0">
                <strong>依赖：</strong>
                <span v-for="depIdx in phase.dependencies" :key="depIdx" class="dependency">
                  {{ analysis.phases[depIdx].name || analysis.phases[depIdx].phase }}
                </span>
              </div>

              <div class="phase-actions" v-if="phase.status !== 'completed'">
                <button 
                  @click="executePhase(index)" 
                  :disabled="!canExecute(phase)"
                  class="execute-btn"
                >
                  {{ phase.status === 'in-progress' ? '⏸️ 进行中...' : '▶️ 开始执行' }}
                </button>
              </div>

              <div class="phase-guidance" v-if="phase.guidance && phase.status === 'in-progress'">
                <strong>💡 执行指导：</strong>
                <ul>
                  <li v-for="g in phase.guidance" :key="g">{{ g }}</li>
                </ul>
              </div>

              <div class="phase-result" v-if="phase.result">
                <strong>✅ 执行结果：</strong>
                <p>{{ phase.result }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 计划可视化 -->
        <div class="plan-visualization">
          <button @click="showVisualization = !showVisualization" class="toggle-btn">
            {{ showVisualization ? '隐藏' : '显示' }}计划可视化
          </button>
          <pre v-if="showVisualization" class="viz-text">{{ visualization }}</pre>
        </div>

        <!-- 进度统计 -->
        <div class="progress-stats">
          <h4>📈 进度统计</h4>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ completedPhases }}</span>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ inProgressPhases }}</span>
              <span class="stat-label">进行中</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ pendingPhases }}</span>
              <span class="stat-label">待执行</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ progress.toFixed(1) }}%</span>
              <span class="stat-label">进度</span>
            </div>
          </div>
        </div>

        <!-- 学习笔记 -->
        <div v-if="learnings.length > 0" class="learning-section">
          <h4>📚 学习笔记</h4>
          <div class="learning-list">
            <div v-for="(learning, index) in learnings" :key="index" class="learning-item">
              <strong>{{ learning.category }}：</strong>
              <span>{{ learning.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { ProblemSolver } from '../../problem-solver/ProblemSolver.js';

export default {
  name: 'ProblemSolverUI',
  setup() {
    const solver = new ProblemSolver();
    
    const problemDescription = ref('');
    const analysis = ref(null);
    const plan = ref(null);
    const learnings = ref([]);
    const showVisualization = ref(false);
    
    const patterns = ['开发项目', '学习新技能', '解决Bug', '写文章', '做决策', '优化流程'];
    
    const complexityLabel = computed(() => {
      if (!analysis.value) return '';
      const labels = { low: '简单', medium: '中等', high: '复杂' };
      return labels[analysis.value.estimatedComplexity];
    });
    
    const progress = computed(() => {
      if (!analysis.value) return 0;
      const completed = analysis.value.phases.filter(p => p.status === 'completed').length;
      return (completed / analysis.value.phases.length) * 100;
    });
    
    const completedPhases = computed(() => {
      return analysis.value?.phases.filter(p => p.status === 'completed').length || 0;
    });
    
    const inProgressPhases = computed(() => {
      return analysis.value?.phases.filter(p => p.status === 'in-progress').length || 0;
    });
    
    const pendingPhases = computed(() => {
      return analysis.value?.phases.filter(p => p.status === 'pending').length || 0;
    });
    
    const visualization = computed(() => {
      return plan.value ? solver.visualizePlan(plan.value) : '';
    });

    const applyPattern = (pattern) => {
      problemDescription.value = `我需要${pattern}`;
    };

    const analyzeProblem = () => {
      analysis.value = solver.analyzeProblem(problemDescription.value);
      plan.value = solver.createExecutionPlan(analysis.value);
    };

    const getPhaseClass = (phase) => {
      return {
        'phase-pending': phase.status === 'pending',
        'phase-running': phase.status === 'in-progress',
        'phase-done': phase.status === 'completed'
      };
    };

    const getStatusEmoji = (status) => {
      return { pending: '⏸️', 'in-progress': '▶️', completed: '✅' }[status];
    };

    const canExecute = (phase) => {
      if (!plan.value) return false;
      if (phase.status === 'completed') return false;
      
      if (!phase.dependencies || phase.dependencies.length === 0) {
        return true;
      }
      
      return phase.dependencies.every(
        depIdx => analysis.value.phases[depIdx].status === 'completed'
      );
    };

    const executePhase = (index) => {
      const result = solver.executeStep(plan.value, index);
      
      if (result.success) {
        analysis.value.phases[index].guidance = result.guidance;
      } else {
        alert(result.message);
      }
    };

    const completePhase = (index, resultText) => {
      const result = solver.completeStep(plan.value, index, resultText);
      
      if (result.success) {
        learnings.value = solver.generateLearningNotes();
      }
    };

    return {
      problemDescription,
      analysis,
      learnings,
      showVisualization,
      patterns,
      complexityLabel,
      progress,
      completedPhases,
      inProgressPhases,
      pendingPhases,
      visualization,
      applyPattern,
      analyzeProblem,
      getPhaseClass,
      getStatusEmoji,
      canExecute,
      executePhase,
      completePhase
    };
  }
};
</script>

<style scoped>
.problem-solver-ui {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
  color: #d4d4d4;
  max-width: 900px;
  margin: 0 auto;
}

.solver-header {
  text-align: center;
  margin-bottom: 30px;
}

.solver-header h2 {
  font-size: 24px;
  margin: 0 0 10px;
}

.solver-header p {
  color: #858585;
  font-size: 14px;
  margin: 0;
}

.input-section textarea {
  width: 100%;
  background: #2d2d30;
  border: 1px solid #3c3c3c;
  color: #d4d4d4;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.quick-patterns {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-patterns .label {
  color: #858585;
  font-size: 13px;
}

.pattern-btn {
  padding: 4px 12px;
  background: #3c3c3c;
  border: none;
  color: #d4d4d4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.pattern-btn:hover {
  background: #007acc;
}

.analyze-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 12px;
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analysis-section {
  margin-top: 30px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.analysis-header h3 {
  margin: 0;
}

.meta-info {
  display: flex;
  gap: 10px;
}

.badge {
  padding: 4px 12px;
  background: #007acc;
  border-radius: 4px;
  font-size: 12px;
}

.pattern-badge {
  padding: 4px 12px;
  background: #43e97b;
  color: #1e1e1e;
  border-radius: 4px;
  font-size: 12px;
}

.keywords {
  margin-bottom: 20px;
}

.keyword {
  display: inline-block;
  padding: 2px 8px;
  background: #3c3c3c;
  border-radius: 3px;
  margin-left: 8px;
  font-size: 12px;
}

.phases-container {
  margin: 20px 0;
}

.phase-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phase-item {
  background: #2d2d30;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #3c3c3c;
}

.phase-pending {
  border-left-color: #858585;
}

.phase-running {
  border-left-color: #007acc;
}

.phase-done {
  border-left-color: #43e97b;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.phase-status {
  font-size: 20px;
}

.phase-number {
  width: 24px;
  height: 24px;
  background: #3c3c3c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.phase-name {
  font-weight: 600;
  flex: 1;
}

.phase-time {
  color: #858585;
  font-size: 12px;
}

.phase-content,
.phase-questions,
.phase-techniques,
.phase-dependencies,
.phase-guidance,
.phase-result {
  margin-top: 12px;
  font-size: 13px;
}

.phase-questions ul,
.phase-guidance ul {
  margin: 8px 0 0;
  padding-left: 20px;
}

.technique-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.technique,
.dependency {
  padding: 4px 10px;
  background: #3c3c3c;
  border-radius: 4px;
  font-size: 12px;
}

.dependency {
  background: #007acc;
}

.phase-actions {
  margin-top: 12px;
}

.execute-btn {
  padding: 8px 20px;
  background: #007acc;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.execute-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.plan-visualization {
  margin: 20px 0;
}

.toggle-btn {
  padding: 8px 16px;
  background: #3c3c3c;
  border: none;
  color: #d4d4d4;
  border-radius: 6px;
  cursor: pointer;
}

.viz-text {
  background: #2d2d30;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 13px;
}

.progress-stats {
  margin: 20px 0;
}

.progress-bar {
  height: 8px;
  background: #3c3c3c;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007acc;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #858585;
  margin-top: 4px;
}

.learning-section {
  margin-top: 20px;
  padding: 16px;
  background: #2d2d30;
  border-radius: 8px;
}

.learning-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.learning-item {
  font-size: 13px;
}
</style>
