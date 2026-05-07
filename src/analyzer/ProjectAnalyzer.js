const fs = require('fs');
const path = require('path');

export class ProjectAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.analysis = null;
  }

  analyze() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      structure: this.analyzeStructure(),
      codebase: this.analyzeCodebase(),
      quality: this.analyzeQuality(),
      gaps: this.analyzeGaps(),
      opportunities: this.analyzeOpportunities(),
      recommendations: []
    };

    this.analysis.recommendations = this.generateRecommendations();
    return this.analysis;
  }

  analyzeStructure() {
    const structure = {
      hasPackageJson: false,
      hasReadme: false,
      hasTests: false,
      hasDocs: false,
      hasConfig: false,
      directories: [],
      files: [],
      totalFiles: 0,
      totalSize: 0
    };

    try {
      const items = fs.readdirSync(this.projectPath, { withFileTypes: true });
      
      items.forEach(item => {
        if (item.isDirectory()) {
          structure.directories.push(item.name);
        } else {
          structure.files.push(item.name);
          structure.totalFiles++;
          
          const filePath = path.join(this.projectPath, item.name);
          const stats = fs.statSync(filePath);
          structure.totalSize += stats.size;
        }
      });

      structure.hasPackageJson = structure.files.includes('package.json');
      structure.hasReadme = structure.files.includes('README.md') || structure.files.includes('readme.md');
      structure.hasTests = structure.directories.includes('tests') || structure.directories.includes('test');
      structure.hasDocs = structure.directories.includes('docs') || structure.directories.includes('doc');
      structure.hasConfig = structure.files.some(f => f.includes('config'));

    } catch (error) {
      console.error('分析结构失败:', error.message);
    }

    return structure;
  }

  analyzeCodebase() {
    const codebase = {
      languages: {},
      frameworks: [],
      patterns: [],
      complexity: 'unknown'
    };

    try {
      if (fs.existsSync(path.join(this.projectPath, 'package.json'))) {
        const pkg = JSON.parse(
          fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
        );

        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.vue || deps.vue3) codebase.frameworks.push('Vue');
        if (deps.react) codebase.frameworks.push('React');
        if (deps.angular) codebase.frameworks.push('Angular');
        if (deps.express) codebase.frameworks.push('Express');
        if (deps.vite) codebase.frameworks.push('Vite');
        if (deps.webpack) codebase.frameworks.push('Webpack');

        if (deps.typescript) codebase.languages['TypeScript'] = true;
        if (deps.jest || deps.mocha) codebase.patterns.push('Unit Testing');
        if (deps.eslint) codebase.patterns.push('Linting');
        if (deps.prettier) codebase.patterns.push('Code Formatting');
      }
    } catch (error) {
      console.error('分析代码库失败:', error.message);
    }

    return codebase;
  }

  analyzeQuality() {
    const quality = {
      hasTests: false,
      testCoverage: 0,
      hasLinting: false,
      hasFormatting: false,
      hasDocumentation: false,
      hasCI: false,
      score: 0
    };

    try {
      const pkgPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        quality.hasTests = !!(deps.jest || deps.mocha || deps.ava);
        quality.hasLinting = !!(deps.eslint);
        quality.hasFormatting = !!(deps.prettier);
        quality.hasDocumentation = fs.existsSync(path.join(this.projectPath, 'README.md'));
        quality.hasCI = fs.existsSync(path.join(this.projectPath, '.github')) ||
                       fs.existsSync(path.join(this.projectPath, '.gitlab-ci.yml'));
      }

      let score = 0;
      if (quality.hasTests) score += 25;
      if (quality.hasLinting) score += 20;
      if (quality.hasFormatting) score += 15;
      if (quality.hasDocumentation) score += 20;
      if (quality.hasCI) score += 20;
      quality.score = score;

    } catch (error) {
      console.error('分析质量失败:', error.message);
    }

    return quality;
  }

  analyzeGaps() {
    const gaps = [];

    if (!this.analysis?.structure?.hasReadme) {
      gaps.push({
        type: 'documentation',
        severity: 'high',
        message: '缺少README文档',
        suggestion: '创建README.md说明项目用途、安装和使用方法'
      });
    }

    if (!this.analysis?.structure?.hasTests) {
      gaps.push({
        type: 'testing',
        severity: 'high',
        message: '缺少测试目录',
        suggestion: '添加tests目录，编写单元测试提高代码质量'
      });
    }

    if (!this.analysis?.quality?.hasCI) {
      gaps.push({
        type: 'ci',
        severity: 'medium',
        message: '缺少CI/CD配置',
        suggestion: '添加GitHub Actions或GitLab CI自动化测试和部署'
      });
    }

    if (this.analysis?.quality?.score < 50) {
      gaps.push({
        type: 'quality',
        severity: 'medium',
        message: '项目质量分数较低',
        suggestion: '添加测试、linting、文档等提高项目质量'
      });
    }

    return gaps;
  }

  analyzeOpportunities() {
    const opportunities = [];

    if (this.analysis?.codebase?.frameworks?.includes('Vue')) {
      opportunities.push({
        type: 'optimization',
        message: 'Vue项目可以添加组件库',
        suggestion: '考虑添加Element Plus、Ant Design Vue或Naive UI提高开发效率'
      });
    }

    if (!this.analysis?.codebase?.patterns?.includes('Unit Testing')) {
      opportunities.push({
        type: 'testing',
        message: '可以添加测试框架',
        suggestion: '添加Jest或Vitest进行单元测试'
      });
    }

    opportunities.push({
      type: 'performance',
      message: '性能优化机会',
      suggestion: '分析打包大小、添加懒加载、优化资源加载'
    });

    opportunities.push({
      type: 'security',
      message: '安全性增强',
      suggestion: '添加依赖安全检查、输入验证、XSS防护'
    });

    return opportunities;
  }

  generateRecommendations() {
    const recommendations = [];

    const gaps = this.analysis?.gaps || [];
    gaps.forEach(gap => {
      recommendations.push({
        priority: gap.severity === 'high' ? 1 : gap.severity === 'medium' ? 2 : 3,
        category: gap.type,
        title: gap.message,
        description: gap.suggestion,
        action: this.getActionForGap(gap),
        emoji: this.getEmojiForType(gap.type)
      });
    });

    const opportunities = this.analysis?.opportunities || [];
    opportunities.forEach(opp => {
      recommendations.push({
        priority: 3,
        category: opp.type,
        title: opp.message,
        description: opp.suggestion,
        action: this.getActionForOpportunity(opp),
        emoji: this.getEmojiForType(opp.type)
      });
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  getActionForGap(gap) {
    const actions = {
      documentation: '创建README.md',
      testing: '初始化测试框架',
      ci: '添加CI配置',
      quality: '质量改进计划'
    };
    return actions[gap.type] || '改进';
  }

  getActionForOpportunity(opp) {
    const actions = {
      optimization: '查看建议',
      testing: '添加测试',
      performance: '性能分析',
      security: '安全检查'
    };
    return actions[opp.type] || '了解更多';
  }

  getEmojiForType(type) {
    const emojis = {
      documentation: '📄',
      testing: '🧪',
      ci: '🔄',
      quality: '✨',
      optimization: '⚡',
      performance: '🚀',
      security: '🔒'
    };
    return emojis[type] || '💡';
  }

  getContextualSuggestions(context) {
    const suggestions = [];

    if (context.hasCode && !context.hasTests) {
      suggestions.push({
        type: 'immediate',
        message: '为新代码添加测试',
        priority: 'high'
      });
    }

    if (context.isNewFile) {
      suggestions.push({
        type: 'immediate',
        message: '为新文件添加文档注释',
        priority: 'medium'
      });
    }

    if (context.hasErrors) {
      suggestions.push({
        type: 'immediate',
        message: '修复错误后再继续开发',
        priority: 'high'
      });
    }

    return suggestions;
  }

  getNextSteps() {
    const steps = [];

    if (!this.analysis?.structure?.hasReadme) {
      steps.push({
        step: 1,
        action: '创建项目文档',
        command: '创建 README.md',
        time: '10分钟'
      });
    }

    if (!this.analysis?.structure?.hasTests) {
      steps.push({
        step: steps.length + 1,
        action: '初始化测试',
        command: 'npm install --save-dev jest',
        time: '5分钟'
      });
    }

    steps.push({
      step: steps.length + 1,
      action: '代码质量检查',
      command: 'npm run lint (如已配置)',
      time: '2分钟'
    });

    return steps;
  }
}
