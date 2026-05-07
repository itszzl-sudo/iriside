const fs = require('fs');
const path = require('path');
const { HelloWorldGenerator } = require('../src/hello-world/HelloWorldGenerator');

console.log('\n' + '='.repeat(60));
console.log('手动测试 - 生成所有Hello World变体到output目录');
console.log('='.repeat(60) + '\n');

const outputDir = path.join(__dirname, '..', 'output', 'test-hello-worlds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const allTests = [];

// 测试所有变体
console.log('📦 生成12种快速变体...\n');
const variants = [
  'minimal', 'styled', 'animated', 'interactive', 'responsive',
  'dark', 'neon', '3d', 'particle', 'game', 'music', 'canvas'
];

variants.forEach(variant => {
  const code = HelloWorldGenerator.variants[variant]();
  const filename = `variant-${variant}.html`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, code, 'utf8');
  
  const stats = {
    name: variant,
    file: filename,
    lines: code.split('\n').length,
    size: (code.length / 1024).toFixed(2) + 'KB',
    hasStyle: code.includes('<style>'),
    hasScript: code.includes('<script>')
  };
  
  allTests.push(stats);
  console.log(`✅ ${variant.padEnd(12)} - ${stats.lines}行, ${stats.size}, 样式:${stats.hasStyle?'✓':'✗'}, 脚本:${stats.hasScript?'✓':'✗'}`);
});

// 测试所有关卡
console.log('\n📚 生成7关渐进式学习...\n');
for (let i = 0; i < 7; i++) {
  const code = HelloWorldGenerator.levels[i]();
  const filename = `level-${i + 1}.html`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, code, 'utf8');
  
  const stats = {
    name: `Level ${i + 1}`,
    file: filename,
    lines: code.split('\n').length,
    size: (code.length / 1024).toFixed(2) + 'KB'
  };
  
  allTests.push(stats);
  console.log(`✅ 第${(i + 1).toString().padEnd(2)}关 - ${stats.lines}行, ${stats.size}`);
}

// 测试所有挑战
console.log('\n🎮 生成4种挑战模式...\n');
const challenges = ['random', 'timer', 'ai', 'reverse'];
challenges.forEach(type => {
  const code = HelloWorldGenerator.challenges[type]();
  const filename = `challenge-${type}.html`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, code, 'utf8');
  
  const stats = {
    name: type,
    file: filename,
    lines: code.split('\n').length,
    size: (code.length / 1024).toFixed(2) + 'KB'
  };
  
  allTests.push(stats);
  console.log(`✅ ${type.padEnd(8)} - ${stats.lines}行, ${stats.size}`);
});

// 测试所有实验室功能
console.log('\n🧪 生成4种实验室功能...\n');
const labs = ['mix', 'evolve', 'remix', 'mutation'];
labs.forEach(type => {
  const code = HelloWorldGenerator.labs[type]();
  const filename = `lab-${type}.html`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, code, 'utf8');
  
  const stats = {
    name: type,
    file: filename,
    lines: code.split('\n').length,
    size: (code.length / 1024).toFixed(2) + 'KB'
  };
  
  allTests.push(stats);
  console.log(`✅ ${type.padEnd(8)} - ${stats.lines}行, ${stats.size}`);
});

// 统计
console.log('\n' + '='.repeat(60));
console.log('测试统计');
console.log('='.repeat(60));
console.log(`\n总计生成: ${allTests.length} 个文件`);
console.log(`总代码行数: ${allTests.reduce((sum, t) => sum + t.lines, 0)} 行`);
console.log(`总文件大小: ${allTests.reduce((sum, t) => sum + parseFloat(t.size), 0).toFixed(2)} KB`);
console.log(`\n输出目录: ${outputDir}`);

// 生成索引文件
const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hello World 测试索引</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 30px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .card h3 { margin-top: 0; color: #667eea; }
    .card a {
      display: inline-block;
      margin: 5px;
      padding: 8px 16px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .card a:hover { background: #764ba2; }
    .stats { color: #666; font-size: 14px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>🚀 Hello World 测试索引</h1>
  <p>共生成 ${allTests.length} 个测试文件，点击查看预览</p>
  
  <div class="grid">
    <div class="card">
      <h3>📝 快速变体 (12种)</h3>
      ${variants.map(v => `<a href="variant-${v}.html">${v}</a>`).join('')}
    </div>
    
    <div class="card">
      <h3>📚 渐进式学习 (7关)</h3>
      ${[1,2,3,4,5,6,7].map(i => `<a href="level-${i}.html">第${i}关</a>`).join('')}
    </div>
    
    <div class="card">
      <h3>🎮 挑战模式 (4种)</h3>
      ${challenges.map(c => `<a href="challenge-${c}.html">${c}</a>`).join('')}
    </div>
    
    <div class="card">
      <h3>🧪 实验室功能 (4种)</h3>
      ${labs.map(l => `<a href="lab-${l}.html">${l}</a>`).join('')}
    </div>
  </div>
  
  <div style="margin-top: 40px; color: #999; text-align: center;">
    生成时间: ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

const indexPath = path.join(outputDir, 'index.html');
fs.writeFileSync(indexPath, indexHtml, 'utf8');

console.log(`\n✅ 索引文件已生成: ${indexPath}`);
console.log('\n💡 在浏览器中打开 index.html 查看所有测试结果\n');
