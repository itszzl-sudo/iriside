export class FocusTracker {
  constructor() {
    this.currentFocus = null;
    this.focusHistory = [];
    this.explorations = new Map();
    this.inferenceQueue = [];
    this.isBackgroundRunning = false;
    this.maxHistorySize = 50;
    this.inferenceTimeout = 5000;
  }

  setFocus(focus) {
    const timestamp = Date.now();
    
    if (this.currentFocus) {
      this.persistExploration(this.currentFocus);
    }
    
    const previousFocus = this.currentFocus;
    this.currentFocus = {
      ...focus,
      timestamp,
      id: this.generateFocusId(focus),
      status: 'active',
      quickInferences: [],
      deepInferences: [],
      recommendations: []
    };
    
    if (previousFocus) {
      this.focusHistory.push({
        ...previousFocus,
        endTime: timestamp,
        duration: timestamp - previousFocus.timestamp
      });
      
      if (this.focusHistory.length > this.maxHistorySize) {
        this.focusHistory.shift();
      }
    }
    
    const quickInferences = this.quickInference(this.currentFocus);
    this.currentFocus.quickInferences = quickInferences;
    
    this.scheduleDeepInference(this.currentFocus);
    
    return {
      current: this.currentFocus,
      quick: quickInferences,
      switched: previousFocus ? {
        from: previousFocus.id,
        to: this.currentFocus.id
      } : null
    };
  }

  generateFocusId(focus) {
    return `${focus.type}-${focus.target}-${Date.now()}`;
  }

  quickInference(focus) {
    const inferences = [];
    
    switch (focus.type) {
      case 'file':
        inferences.push(...this.inferFileContext(focus));
        break;
      case 'code':
        inferences.push(...this.inferCodeContext(focus));
        break;
      case 'error':
        inferences.push(...this.inferErrorContext(focus));
        break;
      case 'feature':
        inferences.push(...this.inferFeatureContext(focus));
        break;
      case 'performance':
        inferences.push(...this.inferPerformanceContext(focus));
        break;
    }
    
    return inferences.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  inferFileContext(focus) {
    const inferences = [];
    const target = focus.target;
    
    if (target.includes('.test.') || target.includes('.spec.')) {
      inferences.push({
        type: 'testing',
        priority: 9,
        message: '测试文件，可能需要运行测试',
        action: 'run-test',
        details: '执行相关测试用例'
      });
    }
    
    if (target.includes('config')) {
      inferences.push({
        type: 'configuration',
        priority: 8,
        message: '配置文件，检查配置完整性',
        action: 'check-config',
        details: '验证配置项是否齐全'
      });
    }
    
    if (target.includes('component') || target.includes('Component')) {
      inferences.push({
        type: 'component',
        priority: 8,
        message: '组件文件，可能需要关联测试和文档',
        action: 'check-related',
        details: '检查相关测试文件和文档'
      });
    }
    
    return inferences;
  }

  inferCodeContext(focus) {
    const inferences = [];
    const code = focus.code || '';
    
    if (code.includes('TODO') || code.includes('FIXME')) {
      inferences.push({
        type: 'todo',
        priority: 9,
        message: '发现待办事项',
        action: 'show-todos',
        details: '列出所有TODO/FIXME项'
      });
    }
    
    if (code.includes('console.log') || code.includes('debugger')) {
      inferences.push({
        type: 'debug',
        priority: 8,
        message: '发现调试代码',
        action: 'clean-debug',
        details: '建议清理console.log和debugger'
      });
    }
    
    if (code.includes('any') && focus.language === 'TypeScript') {
      inferences.push({
        type: 'type-safety',
        priority: 7,
        message: '使用了any类型',
        action: 'suggest-types',
        details: '建议使用更具体的类型'
      });
    }
    
    return inferences;
  }

  inferErrorContext(focus) {
    const inferences = [];
    
    inferences.push({
      type: 'fix',
      priority: 10,
      message: `错误: ${focus.message}`,
      action: 'suggest-fix',
      details: '分析错误原因并提供修复建议'
    });
    
    inferences.push({
      type: 'prevent',
      priority: 7,
      message: '预防类似错误',
      action: 'add-check',
      details: '添加检查防止再次发生'
    });
    
    return inferences;
  }

  inferFeatureContext(focus) {
    const inferences = [];
    
    inferences.push({
      type: 'implementation',
      priority: 9,
      message: `实现功能: ${focus.target}`,
      action: 'suggest-impl',
      details: '提供实现建议和最佳实践'
    });
    
    inferences.push({
      type: 'testing',
      priority: 8,
      message: '添加功能测试',
      action: 'add-tests',
      details: '生成测试用例'
    });
    
    inferences.push({
      type: 'documentation',
      priority: 7,
      message: '编写功能文档',
      action: 'add-docs',
      details: '生成API文档'
    });
    
    return inferences;
  }

  inferPerformanceContext(focus) {
    const inferences = [];
    
    inferences.push({
      type: 'optimization',
      priority: 9,
      message: '性能优化建议',
      action: 'analyze-perf',
      details: '分析性能瓶颈'
    });
    
    inferences.push({
      type: 'profiling',
      priority: 8,
      message: '运行性能分析',
      action: 'run-profiler',
      details: '生成性能报告'
    });
    
    return inferences;
  }

  scheduleDeepInference(focus) {
    const task = {
      focusId: focus.id,
      focus,
      status: 'pending',
      startTime: Date.now(),
      results: []
    };
    
    this.inferenceQueue.push(task);
    
    if (!this.isBackgroundRunning) {
      this.runBackgroundInference();
    }
  }

  async runBackgroundInference() {
    this.isBackgroundRunning = true;
    
    while (this.inferenceQueue.length > 0) {
      const task = this.inferenceQueue[0];
      
      if (task.focusId !== this.currentFocus?.id) {
        task.status = 'paused';
      } else {
        task.status = 'running';
        
        try {
          const results = await this.deepInference(task.focus);
          task.results = results;
          task.status = 'completed';
          
          if (task.focusId === this.currentFocus?.id) {
            this.currentFocus.deepInferences = results;
            this.currentFocus.recommendations = this.generateRecommendations(results);
          }
          
          this.persistExploration(task.focus);
          
        } catch (error) {
          task.status = 'error';
          task.error = error.message;
        }
      }
      
      this.inferenceQueue.shift();
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isBackgroundRunning = false;
  }

  async deepInference(focus) {
    const results = [];
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push({
      category: 'alternatives',
      items: await this.exploreAlternatives(focus)
    });
    
    results.push({
      category: 'dependencies',
      items: await this.analyzeDependencies(focus)
    });
    
    results.push({
      category: 'impacts',
      items: await this.analyzeImpacts(focus)
    });
    
    results.push({
      category: 'best-practices',
      items: await this.suggestBestPractices(focus)
    });
    
    return results;
  }

  async exploreAlternatives(focus) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        approach: '方案A',
        description: '当前方法',
        pros: ['熟悉', '快速'],
        cons: ['可能不是最优']
      },
      {
        approach: '方案B',
        description: '替代方法',
        pros: ['更优雅', '可维护'],
        cons: ['需要学习']
      },
      {
        approach: '方案C',
        description: '第三方方案',
        pros: ['成熟', '社区支持'],
        cons: ['依赖外部']
      }
    ];
  }

  async analyzeDependencies(focus) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      { item: '依赖项A', status: 'required', reason: '核心功能' },
      { item: '依赖项B', status: 'optional', reason: '增强功能' }
    ];
  }

  async analyzeImpacts(focus) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      { area: '性能', impact: 'positive', degree: 'medium' },
      { area: '可维护性', impact: 'positive', degree: 'high' },
      { area: '兼容性', impact: 'neutral', degree: 'none' }
    ];
  }

  async suggestBestPractices(focus) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { practice: '单元测试', importance: 'high', reason: '保证质量' },
      { practice: '代码审查', importance: 'high', reason: '发现潜在问题' },
      { practice: '文档完善', importance: 'medium', reason: '便于维护' }
    ];
  }

  generateRecommendations(inferences) {
    const recommendations = [];
    
    inferences.forEach(inf => {
      if (inf.category === 'alternatives') {
        const best = inf.items.reduce((a, b) => 
          (b.pros.length - b.cons.length) > (a.pros.length - a.cons.length) ? b : a
        );
        recommendations.push({
          type: 'approach',
          priority: 8,
          message: `推荐使用: ${best.approach}`,
          reason: best.description
        });
      }
      
      if (inf.category === 'best-practices') {
        inf.items.filter(p => p.importance === 'high').forEach(practice => {
          recommendations.push({
            type: 'best-practice',
            priority: 9,
            message: `建议: ${practice.practice}`,
            reason: practice.reason
          });
        });
      }
    });
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  persistExploration(focus) {
    if (!focus || !focus.id) return;
    
    const exploration = {
      id: focus.id,
      type: focus.type,
      target: focus.target,
      timestamp: focus.timestamp,
      quickInferences: focus.quickInferences || [],
      deepInferences: focus.deepInferences || [],
      recommendations: focus.recommendations || [],
      status: focus.status,
      completed: focus.deepInferences?.length > 0
    };
    
    this.explorations.set(focus.id, exploration);
    
    this.saveToStorage(exploration);
  }

  saveToStorage(exploration) {
    try {
      const stored = JSON.parse(localStorage.getItem('ast-ide-explorations') || '[]');
      
      const existing = stored.findIndex(e => e.id === exploration.id);
      if (existing >= 0) {
        stored[existing] = exploration;
      } else {
        stored.push(exploration);
      }
      
      const trimmed = stored.slice(-this.maxHistorySize);
      localStorage.setItem('ast-ide-explorations', JSON.stringify(trimmed));
      
    } catch (error) {
      console.error('保存探索记录失败:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem('ast-ide-explorations') || '[]');
      
      stored.forEach(exploration => {
        this.explorations.set(exploration.id, exploration);
        
        if (!exploration.completed) {
          this.inferenceQueue.push({
            focusId: exploration.id,
            focus: exploration,
            status: 'pending',
            results: []
          });
        }
      });
      
      if (this.inferenceQueue.length > 0 && !this.isBackgroundRunning) {
        this.runBackgroundInference();
      }
      
    } catch (error) {
      console.error('加载探索记录失败:', error);
    }
  }

  getHistory() {
    return this.focusHistory.slice().reverse();
  }

  getExploration(focusId) {
    return this.explorations.get(focusId);
  }

  getAllExplorations() {
    return Array.from(this.explorations.values()).reverse();
  }

  getCurrentStatus() {
    return {
      currentFocus: this.currentFocus,
      queueLength: this.inferenceQueue.length,
      isBackgroundRunning: this.isBackgroundRunning,
      historyCount: this.focusHistory.length,
      explorationsCount: this.explorations.size
    };
  }
}
