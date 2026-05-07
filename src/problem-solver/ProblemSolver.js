export class ProblemSolver {
  constructor() {
    this.currentProblem = null;
    this.tasks = [];
    this.executionLog = [];
    this.checkpoints = [];
    this.learnings = [];
  }

  static problemSolvingSteps = [
    {
      phase: '理解问题',
      emoji: '🤔',
      description: '深入理解问题的本质、背景、约束条件',
      questions: [
        '问题的核心是什么？',
        '有哪些已知条件和限制？',
        '期望的解决结果是什么？',
        '为什么这个问题重要？'
      ]
    },
    {
      phase: '分解问题',
      emoji: '🔪',
      description: '将复杂问题拆分成可管理的小任务',
      techniques: [
        '自顶向下分解',
        '按功能模块划分',
        '按时间顺序拆分',
        '按依赖关系梳理'
      ]
    },
    {
      phase: '制定计划',
      emoji: '📋',
      description: '制定详细的执行计划和优先级',
      steps: [
        '确定任务优先级',
        '分析任务依赖关系',
        '估算时间和资源',
        '设置检查点'
      ]
    },
    {
      phase: '执行方案',
      emoji: '⚡',
      description: '按计划逐步执行各个子任务',
      practices: [
        '专注当前任务',
        '记录执行过程',
        '及时验证结果',
        '保持灵活性'
      ]
    },
    {
      phase: '检查验证',
      emoji: '✅',
      description: '验证每个步骤的正确性和完整性',
      checks: [
        '是否符合预期？',
        '是否满足约束？',
        '是否有遗漏？',
        '是否需要调整？'
      ]
    },
    {
      phase: '调整优化',
      emoji: '🔧',
      description: '根据检查结果调整方案和执行',
      adjustments: [
        '修正错误方向',
        '优化执行效率',
        '处理意外情况',
        '更新后续计划'
      ]
    },
    {
      phase: '总结复盘',
      emoji: '📚',
      description: '总结经验教训，形成知识积累',
      outputs: [
        '记录解决过程',
        '提炼关键经验',
        '形成可复用方案',
        '改进解决方法'
      ]
    }
  ];

  static commonPatterns = {
    '开发项目': {
      steps: ['需求分析', '架构设计', '技术选型', '编码实现', '测试验证', '部署上线', '维护优化'],
      dependencies: [[0], [0], [1], [1,2], [3], [4], [5]]
    },
    '学习新技能': {
      steps: ['了解基础概念', '寻找学习资源', '制定学习计划', '动手实践', '总结归纳', '应用提升'],
      dependencies: [[], [0], [0,1], [2], [3], [4]]
    },
    '解决Bug': {
      steps: ['复现问题', '定位原因', '分析影响范围', '设计修复方案', '实施修复', '验证修复', '回归测试'],
      dependencies: [[], [0], [1], [1], [3], [4], [5]]
    },
    '写文章': {
      steps: ['确定主题', '收集素材', '构思大纲', '撰写初稿', '修改润色', '排版发布'],
      dependencies: [[], [0], [0,1], [2], [3], [4]]
    },
    '做决策': {
      steps: ['明确决策目标', '收集相关信息', '分析各种选项', '评估风险收益', '做出决定', '执行并跟踪'],
      dependencies: [[], [0], [1], [2], [3], [4]]
    },
    '优化流程': {
      steps: ['分析现状流程', '识别瓶颈问题', '设计优化方案', '小范围试点', '评估效果', '全面推广'],
      dependencies: [[], [0], [1], [2], [3], [4]]
    }
  };

  analyzeProblem(problemDescription) {
    const analysis = {
      originalProblem: problemDescription,
      timestamp: new Date().toISOString(),
      phases: [],
      identifiedPattern: null,
      estimatedComplexity: 'medium',
      keywords: []
    };

    const keywords = this.extractKeywords(problemDescription);
    analysis.keywords = keywords;

    const pattern = this.matchPattern(problemDescription);
    if (pattern) {
      analysis.identifiedPattern = pattern;
      analysis.phases = this.generatePhasesFromPattern(pattern);
    } else {
      analysis.phases = this.generateDefaultPhases(problemDescription);
    }

    analysis.estimatedComplexity = this.estimateComplexity(problemDescription, analysis.phases);

    return analysis;
  }

  extractKeywords(text) {
    const keywordPatterns = [
      '开发', '项目', '学习', '技能', 'Bug', '问题', '文章', '决策', '优化', '流程',
      '设计', '实现', '测试', '部署', '分析', '修复', '创建', '构建', '改进'
    ];
    
    return keywordPatterns.filter(kw => text.includes(kw));
  }

  matchPattern(text) {
    for (const [patternName, patternData] of Object.entries(ProblemSolver.commonPatterns)) {
      if (text.includes(patternName) || 
          patternData.steps.some(step => text.includes(step))) {
        return { name: patternName, ...patternData };
      }
    }
    return null;
  }

  generatePhasesFromPattern(pattern) {
    return pattern.steps.map((step, index) => ({
      name: step,
      index,
      status: 'pending',
      dependencies: pattern.dependencies[index] || [],
      estimatedTime: this.estimateStepTime(step),
      description: this.generateStepDescription(step)
    }));
  }

  generateDefaultPhases(problemText) {
    return ProblemSolver.problemSolvingSteps.map((step, index) => ({
      ...step,
      index,
      status: 'pending',
      tasks: [],
      estimatedTime: '待定'
    }));
  }

  estimateStepTime(step) {
    const timeMap = {
      '需求分析': '1-2天',
      '架构设计': '2-3天',
      '编码实现': '3-7天',
      '测试验证': '1-3天',
      '部署上线': '0.5-1天',
      '定位原因': '0.5-2小时',
      '实施修复': '1-4小时'
    };
    
    return timeMap[step] || '视具体情况而定';
  }

  generateStepDescription(step) {
    const descriptions = {
      '需求分析': '收集和整理需求，明确功能点和约束条件',
      '架构设计': '设计系统整体架构和技术方案',
      '编码实现': '按照设计文档进行代码编写',
      '测试验证': '执行测试用例，验证功能正确性'
    };
    
    return descriptions[step] || `执行${step}相关任务`;
  }

  estimateComplexity(text, phases) {
    const wordCount = text.length;
    const phaseCount = phases.length;
    
    if (wordCount > 200 || phaseCount > 8) {
      return 'high';
    } else if (wordCount < 50 || phaseCount < 4) {
      return 'low';
    }
    return 'medium';
  }

  createExecutionPlan(analysis) {
    const plan = {
      problem: analysis.originalProblem,
      phases: analysis.phases,
      totalSteps: analysis.phases.length,
      currentStep: 0,
      progress: 0,
      estimatedTime: this.calculateTotalTime(analysis.phases),
      criticalPath: this.findCriticalPath(analysis.phases),
      parallelizable: this.findParallelizableTasks(analysis.phases)
    };

    return plan;
  }

  calculateTotalTime(phases) {
    return phases.length + ' 个步骤';
  }

  findCriticalPath(phases) {
    const maxDeps = Math.max(...phases.map(p => p.dependencies?.length || 0));
    return phases.filter(p => (p.dependencies?.length || 0) === maxDeps);
  }

  findParallelizableTasks(phases) {
    const noDeps = phases.filter(p => !p.dependencies || p.dependencies.length === 0);
    return noDeps.length > 1 ? noDeps : [];
  }

  executeStep(plan, stepIndex) {
    if (stepIndex >= plan.phases.length) {
      return { success: false, message: '步骤索引超出范围' };
    }

    const step = plan.phases[stepIndex];
    
    const dependencyCheck = this.checkDependencies(plan, step);
    if (!dependencyCheck.ready) {
      return { 
        success: false, 
        message: `依赖未满足: ${dependencyCheck.pending.join(', ')}` 
      };
    }

    step.status = 'in-progress';
    step.startTime = new Date().toISOString();

    plan.currentStep = stepIndex;
    plan.progress = ((stepIndex + 1) / plan.totalSteps) * 100;

    return {
      success: true,
      step,
      message: `开始执行: ${step.name || step.phase}`,
      guidance: this.generateGuidance(step)
    };
  }

  checkDependencies(plan, step) {
    if (!step.dependencies || step.dependencies.length === 0) {
      return { ready: true, pending: [] };
    }

    const pendingDeps = step.dependencies
      .filter(depIndex => plan.phases[depIndex].status !== 'completed')
      .map(depIndex => plan.phases[depIndex].name || plan.phases[depIndex].phase);

    return {
      ready: pendingDeps.length === 0,
      pending: pendingDeps
    };
  }

  generateGuidance(step) {
    const guidances = {
      '理解问题': [
        '列出问题的关键要素',
        '画出问题的可视化图表',
        '与相关方确认理解是否一致'
      ],
      '分解问题': [
        '使用思维导图或树状图',
        '确保每个子任务独立可执行',
        '标注任务间的依赖关系'
      ],
      '制定计划': [
        '使用甘特图规划时间线',
        '为每个任务设置检查点',
        '预留缓冲时间应对变化'
      ],
      '执行方案': [
        '专注当前任务，避免多任务',
        '定期记录进度和问题',
        '保持与计划的对照'
      ],
      '检查验证': [
        '对照预期结果逐项检查',
        '请他人帮忙review',
        '考虑边界情况和异常'
      ],
      '调整优化': [
        '记录偏差原因',
        '更新后续计划',
        '分享调整经验'
      ],
      '总结复盘': [
        '记录成功经验',
        '总结失败教训',
        '形成可复用模板'
      ]
    };

    return guidances[step.phase || step.name] || [
      '明确任务目标',
      '准备必要资源',
      '按步骤执行'
    ];
  }

  completeStep(plan, stepIndex, result) {
    const step = plan.phases[stepIndex];
    step.status = 'completed';
    step.endTime = new Date().toISOString();
    step.result = result;

    this.executionLog.push({
      step: step.name || step.phase,
      status: 'completed',
      timestamp: step.endTime,
      result
    });

    const nextSteps = this.findNextExecutableSteps(plan);
    
    return {
      success: true,
      message: `完成: ${step.name || step.phase}`,
      nextSteps,
      progress: plan.progress,
      checkpoint: this.createCheckpoint(step, result)
    };
  }

  findNextExecutableSteps(plan) {
    return plan.phases
      .filter(phase => phase.status === 'pending')
      .filter(phase => this.checkDependencies(plan, phase).ready)
      .map(phase => phase.name || phase.phase);
  }

  createCheckpoint(step, result) {
    const checkpoint = {
      step: step.name || step.phase,
      timestamp: new Date().toISOString(),
      checks: [
        '任务是否完成？',
        '结果是否符合预期？',
        '是否有需要记录的问题？'
      ],
      result
    };

    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  generateLearningNotes() {
    if (this.executionLog.length === 0) {
      return [];
    }

    const learnings = [
      {
        category: '效率提升',
        content: '记录各步骤实际耗时，优化预估模型'
      },
      {
        category: '风险识别',
        content: '总结遇到的问题，形成风险检查清单'
      },
      {
        category: '方法改进',
        content: '提炼有效的解决方法，形成最佳实践'
      },
      {
        category: '知识积累',
        content: '记录关键技术点，构建知识库'
      }
    ];

    this.learnings = learnings;
    return learnings;
  }

  visualizePlan(plan) {
    const lines = [];
    lines.push('\n📊 问题解决计划\n');
    lines.push('━'.repeat(50));
    
    plan.phases.forEach((phase, index) => {
      const statusEmoji = {
        'pending': '⏸️',
        'in-progress': '▶️',
        'completed': '✅'
      }[phase.status];

      const indent = '  '.repeat(
        phase.dependencies ? Math.min(phase.dependencies.length, 3) : 0
      );

      lines.push(`${indent}${statusEmoji} ${index + 1}. ${phase.name || phase.phase}`);
      
      if (phase.estimatedTime) {
        lines.push(`${indent}   ⏱️ 预估: ${phase.estimatedTime}`);
      }
      
      if (phase.dependencies && phase.dependencies.length > 0) {
        const depNames = phase.dependencies
          .map(i => plan.phases[i].name || plan.phases[i].phase);
        lines.push(`${indent}   🔗 依赖: ${depNames.join(', ')}`);
      }
    });

    lines.push('\n' + '━'.repeat(50));
    lines.push(`总步骤: ${plan.totalSteps}`);
    lines.push(`进度: ${plan.progress.toFixed(1)}%`);
    lines.push(`可并行: ${plan.parallelizable.length} 个任务`);

    return lines.join('\n');
  }
}
