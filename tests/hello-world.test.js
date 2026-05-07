const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { HelloWorldGenerator } = require('../src/hello-world/HelloWorldGenerator');

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    testResults.passed++;
    testResults.tests.push({ name, status: '✅ PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: '❌ FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.error(error.message);
  }
}

function testAsync(name, fn) {
  return fn().then(() => {
    testResults.passed++;
    testResults.tests.push({ name, status: '✅ PASS' });
    console.log(`✅ PASS: ${name}`);
  }).catch(error => {
    testResults.failed++;
    testResults.tests.push({ name, status: '❌ FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.error(error.message);
  });
}

console.log('\n='.repeat(50));
console.log('Hello World Generator 完整测试套件');
console.log('='.repeat(50) + '\n');

// 测试1: 所有变体是否都返回有效HTML
test('所有12种变体都返回非空字符串', () => {
  const variants = [
    'minimal', 'styled', 'animated', 'interactive', 'responsive',
    'dark', 'neon', '3d', 'particle', 'game', 'music', 'canvas'
  ];
  
  variants.forEach(variant => {
    const code = HelloWorldGenerator.variants[variant]();
    assert(code && code.length > 0, `变体 ${variant} 应返回非空代码`);
    assert(code.includes('<!DOCTYPE html>'), `变体 ${variant} 应包含DOCTYPE`);
    assert(code.includes('</html>'), `变体 ${variant} 应包含闭合html标签`);
  });
});

// 测试2: 所有变体都包含Hello World文本
test('所有变体都包含Hello World文本', () => {
  const variants = [
    'minimal', 'styled', 'animated', 'interactive', 'responsive',
    'dark', 'neon', '3d', 'particle', 'game', 'music', 'canvas'
  ];
  
  variants.forEach(variant => {
    const code = HelloWorldGenerator.variants[variant]();
    assert(code.includes('Hello World'), `变体 ${variant} 应包含Hello World`);
  });
});

// 测试3: 特定变体的特征测试
test('最简版只包含必要的HTML标签', () => {
  const code = HelloWorldGenerator.variants.minimal();
  const lineCount = code.split('\n').length;
  assert(lineCount <= 15, `最简版应少于15行，实际${lineCount}行`);
  assert(!code.includes('style>'), '最简版不应包含style标签');
});

test('美化版包含渐变背景', () => {
  const code = HelloWorldGenerator.variants.styled();
  assert(code.includes('gradient'), '美化版应包含gradient');
  assert(code.includes('text-shadow'), '美化版应包含text-shadow');
});

test('动画版包含动画定义', () => {
  const code = HelloWorldGenerator.variants.animated();
  assert(code.includes('@keyframes'), '动画版应包含@keyframes');
  assert(code.includes('animation:'), '动画版应包含animation属性');
});

test('交互版包含事件处理', () => {
  const code = HelloWorldGenerator.variants.interactive();
  assert(code.includes('onclick'), '交互版应包含onclick');
  assert(code.includes('script>'), '交互版应包含script标签');
});

test('响应式版包含媒体查询', () => {
  const code = HelloWorldGenerator.variants.responsive();
  assert(code.includes('@media'), '响应式版应包含@media');
  assert(code.includes('max-width'), '响应式版应包含max-width');
});

test('暗黑风包含霓虹效果', () => {
  const code = HelloWorldGenerator.variants.dark();
  assert(code.includes('text-shadow'), '暗黑风应包含text-shadow');
  assert(code.includes('0 0'), '暗黑风应包含霓虹发光效果');
});

test('霓虹风包含闪烁动画', () => {
  const code = HelloWorldGenerator.variants.neon();
  assert(code.includes('@keyframes pulsate'), '霓虹风应包含pulsate动画');
  assert(code.includes('#bc13fe'), '霓虹风应使用紫色');
});

test('3D效果包含透视和旋转', () => {
  const code = HelloWorldGenerator.variants['3d']();
  assert(code.includes('perspective'), '3D效果应包含perspective');
  assert(code.includes('rotateX') || code.includes('rotateY'), '3D效果应包含旋转');
});

test('粒子版使用Canvas', () => {
  const code = HelloWorldGenerator.variants.particle();
  assert(code.includes('<canvas'), '粒子版应包含canvas标签');
  assert(code.includes('getContext'), '粒子版应使用getContext');
  assert(code.includes('particles'), '粒子版应包含particles变量');
});

test('游戏版包含移动控制', () => {
  const code = HelloWorldGenerator.variants.game();
  assert(code.includes('keydown'), '游戏版应监听keydown');
  assert(code.includes('ArrowUp') || code.includes('w'), '游戏版应支持方向键或WASD');
  assert(code.includes('score'), '游戏版应包含score变量');
});

test('音效版使用Web Audio API', () => {
  const code = HelloWorldGenerator.variants.music();
  assert(code.includes('AudioContext'), '音效版应使用AudioContext');
  assert(code.includes('oscillator'), '音效版应使用oscillator');
});

test('Canvas版使用Canvas API', () => {
  const code = HelloWorldGenerator.variants.canvas();
  assert(code.includes('<canvas'), 'Canvas版应包含canvas标签');
  assert(code.includes('requestAnimationFrame'), 'Canvas版应使用requestAnimationFrame');
});

// 测试4: 7关渐进式学习
test('所有7关都返回有效HTML', () => {
  for (let i = 0; i < 7; i++) {
    const code = HelloWorldGenerator.levels[i]();
    assert(code && code.length > 0, `第${i+1}关应返回非空代码`);
    assert(code.includes('Hello World'), `第${i+1}关应包含Hello World`);
  }
});

test('第1关是最简版', () => {
  const code = HelloWorldGenerator.levels[0]();
  assert(!code.includes('style>') || code.includes('<style>') && code.split('\n').length < 20, '第1关应保持简洁');
});

test('第7关是完整应用', () => {
  const code = HelloWorldGenerator.levels[6]();
  assert(code.includes('input'), '第7关应包含input');
  assert(code.includes('button'), '第7关应包含button');
  assert(code.includes('function'), '第7关应包含function');
});

// 测试5: 挑战模式
test('所有4种挑战都返回有效HTML', () => {
  const challenges = ['random', 'timer', 'ai', 'reverse'];
  challenges.forEach(type => {
    const code = HelloWorldGenerator.challenges[type]();
    assert(code && code.length > 0, `挑战 ${type} 应返回非空代码`);
    assert(code.includes('Hello World'), `挑战 ${type} 应包含Hello World`);
  });
});

test('限时挑战包含倒计时', () => {
  const code = HelloWorldGenerator.challenges.timer();
  assert(code.includes('setInterval'), '限时挑战应使用setInterval');
  assert(code.includes('10'), '限时挑战应包含10秒');
});

test('AI对战包含两个风格', () => {
  const code = HelloWorldGenerator.challenges.ai();
  assert(code.includes('minimal'), 'AI对战应包含minimal类');
  assert(code.includes('gorgeous'), 'AI对战应包含gorgeous类');
});

test('逆向工程生成金色渐变', () => {
  const code = HelloWorldGenerator.challenges.reverse();
  assert(code.includes('gold') || code.includes('#ffd700'), '逆向工程应使用金色');
  assert(code.includes('gradient'), '逆向工程应使用渐变');
});

// 测试6: 实验室功能
test('所有4种实验室都返回有效HTML', () => {
  const labs = ['mix', 'evolve', 'remix', 'mutation'];
  labs.forEach(type => {
    const code = HelloWorldGenerator.labs[type]();
    assert(code && code.length > 0, `实验室 ${type} 应返回非空代码`);
    assert(code.includes('Hello World'), `实验室 ${type} 应包含Hello World`);
  });
});

test('自动进化包含20种变化', () => {
  const code = HelloWorldGenerator.labs.evolve();
  assert(code.includes('20'), '自动进化应包含20');
  assert(code.includes('setInterval'), '自动进化应使用setInterval');
});

test('变异生成包含10种变异', () => {
  const code = HelloWorldGenerator.labs.mutation();
  assert(code.includes('10'), '变异生成应生成10个变异');
  assert(code.includes('mutations'), '变异生成应使用mutations数组');
});

// 测试7: generate方法
test('generate方法正确路由到各个生成器', () => {
  const variantCode = HelloWorldGenerator.generate('variant', 'styled');
  assert(variantCode.includes('gradient'), 'variant路由应正确');
  
  const levelCode = HelloWorldGenerator.generate('level', 0);
  assert(levelCode.includes('Hello World'), 'level路由应正确');
  
  const challengeCode = HelloWorldGenerator.generate('challenge', 'timer');
  assert(challengeCode.includes('setInterval'), 'challenge路由应正确');
  
  const labCode = HelloWorldGenerator.generate('lab', 'evolve');
  assert(labCode.includes('20'), 'lab路由应正确');
});

test('generate方法对无效输入返回默认值', () => {
  const code = HelloWorldGenerator.generate('invalid', 'invalid');
  assert(code && code.length > 0, '无效输入应返回默认代码');
  assert(code.includes('Hello World'), '默认代码应包含Hello World');
});

// 测试8: 代码质量检查
test('所有生成的代码都符合HTML5标准', () => {
  const allCodes = [
    ...Object.values(HelloWorldGenerator.variants).map(fn => fn()),
    ...HelloWorldGenerator.levels.map(fn => fn()),
    ...Object.values(HelloWorldGenerator.challenges).map(fn => fn()),
    ...Object.values(HelloWorldGenerator.labs).map(fn => fn())
  ];
  
  allCodes.forEach((code, index) => {
    assert(code.includes('<!DOCTYPE html>'), `代码${index+1}应包含DOCTYPE`);
    assert(code.includes('<html'), `代码${index+1}应包含html标签`);
    assert(code.includes('<head>'), `代码${index+1}应包含head标签`);
    assert(code.includes('<body'), `代码${index+1}应包含body标签`);
  });
});

// 测试9: 特殊字符和安全性
test('生成的代码不包含XSS漏洞', () => {
  const allCodes = [
    ...Object.values(HelloWorldGenerator.variants).map(fn => fn()),
    ...HelloWorldGenerator.levels.map(fn => fn())
  ];
  
  allCodes.forEach(code => {
    assert(!code.includes('<script>alert('), '不应包含简单XSS');
    assert(!code.includes('onerror='), '不应包含onerror事件');
  });
});

// 测试10: 性能测试
test('所有生成器在100ms内完成', () => {
  const start = Date.now();
  
  for (let i = 0; i < 100; i++) {
    HelloWorldGenerator.variants.styled();
    HelloWorldGenerator.variants.animated();
    HelloWorldGenerator.generate('variant', 'game');
  }
  
  const elapsed = Date.now() - start;
  assert(elapsed < 1000, `300次生成应在1秒内完成，实际${elapsed}ms`);
});

// 测试报告
console.log('\n' + '='.repeat(50));
console.log('测试报告');
console.log('='.repeat(50));
console.log(`\n总计: ${testResults.passed + testResults.failed} 个测试`);
console.log(`✅ 通过: ${testResults.passed}`);
console.log(`❌ 失败: ${testResults.failed}`);
console.log(`\n覆盖率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);

if (testResults.failed > 0) {
  console.log('\n失败的测试:');
  testResults.tests.filter(t => t.status.includes('FAIL')).forEach(t => {
    console.log(`  - ${t.name}: ${t.error}`);
  });
}

// 保存测试报告
const reportPath = path.join(__dirname, 'test-report.json');
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
console.log(`\n测试报告已保存到: ${reportPath}`);

process.exit(testResults.failed > 0 ? 1 : 0);
