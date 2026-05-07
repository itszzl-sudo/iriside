const puppeteer = require('puppeteer');
const assert = require('assert');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ETests() {
  console.log('\n='.repeat(50));
  console.log('E2E测试 - Hello World功能');
  console.log('='.repeat(50) + '\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  async function test(name, fn) {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: '✅ PASS' });
      console.log(`✅ PASS: ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: '❌ FAIL', error: error.message });
      console.log(`❌ FAIL: ${name}`);
      console.error(error.message);
    }
  }
  
  try {
    console.log('启动浏览器，访问 http://localhost:3000...\n');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(1000);
    
    // 测试1: 页面加载
    await test('页面成功加载', async () => {
      const title = await page.title();
      assert(title.includes('AST-IDE') || title.length > 0, '页面标题应存在');
    });
    
    // 测试2: 底部按钮存在
    await test('底部"从Hello World开始"按钮存在', async () => {
      const button = await page.$('.hello-world-btn');
      assert(button !== null, '按钮应存在');
      const text = await page.evaluate(el => el.textContent, button);
      assert(text.includes('Hello World'), '按钮文本应包含Hello World');
    });
    
    // 测试3: 点击按钮展开面板
    await test('点击按钮展开Hello World面板', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      const panel = await page.$('.hello-world-panel');
      assert(panel !== null, '面板应展开');
    });
    
    // 测试4: 渐进式学习路径显示
    await test('渐进式学习路径显示7关', async () => {
      const levels = await page.$$('.level-card');
      assert(levels.length === 7, `应有7关，实际${levels.length}关`);
    });
    
    // 测试5: 挑战模式按钮
    await test('挑战模式有4个按钮', async () => {
      const buttons = await page.$$('.challenge-btn');
      assert(buttons.length === 4, `应有4个挑战按钮，实际${buttons.length}个`);
    });
    
    // 测试6: 快速变体按钮
    await test('快速变体有12个按钮', async () => {
      const buttons = await page.$$('.variant-btn');
      assert(buttons.length === 12, `应有12个变体按钮，实际${buttons.length}个`);
    });
    
    // 测试7: 实验室按钮
    await test('实验室有4个按钮', async () => {
      const buttons = await page.$$('.lab-btn');
      assert(buttons.length === 4, `应有4个实验室按钮，实际${buttons.length}个`);
    });
    
    // 测试8: 测试最简版生成
    await test('点击"最简版"生成代码', async () => {
      await page.evaluate(() => {
        document.querySelector('.variant-btn').click();
      });
      await sleep(2000);
      
      const preview = await page.$('.preview-panel');
      assert(preview !== null, '预览面板应显示');
    });
    
    // 测试9: 预览内容包含Hello World
    await test('预览内容包含Hello World', async () => {
      const frame = await page.$('.preview-frame');
      assert(frame !== null, 'iframe应存在');
      
      const frameContent = await frame.contentFrame();
      const body = await frameContent.$('body');
      const text = await frameContent.evaluate(el => el.textContent, body);
      assert(text.includes('Hello World'), '预览应包含Hello World');
    });
    
    // 测试10: 测试美化版
    await test('点击"美化版"生成带样式的代码', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      
      const buttons = await page.$$('.variant-btn');
      await buttons[1].click();
      await sleep(2000);
      
      const frame = await page.$('.preview-frame');
      const frameContent = await frame.contentFrame();
      const h1 = await frameContent.$('h1');
      assert(h1 !== null, 'h1标签应存在');
    });
    
    // 测试11: 测试动画版
    await test('点击"动画版"生成带动画的代码', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      
      const buttons = await page.$$('.variant-btn');
      await buttons[2].click();
      await sleep(2000);
      
      const frame = await page.$('.preview-frame');
      const frameContent = await frame.contentFrame();
      const style = await frameContent.$('style');
      assert(style !== null, 'style标签应存在');
    });
    
    // 测试12: 测试游戏化版本
    await test('点击"游戏化"生成可交互游戏', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      
      const buttons = await page.$$('.variant-btn');
      await buttons[9].click();
      await sleep(2000);
      
      const frame = await page.$('.preview-frame');
      const frameContent = await frame.contentFrame();
      const player = await frameContent.$('#player');
      assert(player !== null, '游戏玩家元素应存在');
    });
    
    // 测试13: 测试渐进式学习第1关
    await test('点击第1关生成基础Hello World', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      
      const level = await page.$('.level-card');
      await level.click();
      await sleep(2000);
      
      const preview = await page.$('.preview-panel');
      assert(preview !== null, '预览应显示');
    });
    
    // 测试14: 测试限时挑战
    await test('点击"限时挑战"生成倒计时页面', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      
      const buttons = await page.$$('.challenge-btn');
      await buttons[1].click();
      await sleep(2000);
      
      const frame = await page.$('.preview-frame');
      const frameContent = await frame.contentFrame();
      const timer = await frameContent.$('#timer');
      assert(timer !== null, '计时器元素应存在');
    });
    
    // 测试15: 历史记录保存
    await test('历史记录已保存', async () => {
      await page.click('.header-btn');
      await sleep(500);
      
      const historyItems = await page.$$('.history-item');
      assert(historyItems.length > 0, '应有历史记录');
      
      await page.click('.header-btn');
      await sleep(300);
    });
    
    // 测试16: 关闭面板
    await test('再次点击按钮关闭面板', async () => {
      await page.click('.hello-world-btn');
      await sleep(500);
      
      const panel = await page.$('.hello-world-panel');
      assert(panel === null, '面板应关闭');
    });
    
  } catch (error) {
    console.error('测试执行错误:', error);
  } finally {
    // 测试报告
    console.log('\n' + '='.repeat(50));
    console.log('E2E测试报告');
    console.log('='.repeat(50));
    console.log(`\n总计: ${results.passed + results.failed} 个测试`);
    console.log(`✅ 通过: ${results.passed}`);
    console.log(`❌ 失败: ${results.failed}`);
    console.log(`\n通过率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
    
    if (results.failed > 0) {
      console.log('\n失败的测试:');
      results.tests.filter(t => t.status.includes('FAIL')).forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
      });
    }
    
    await browser.close();
    console.log('\n浏览器已关闭');
  }
  
  return results;
}

runE2ETests().catch(console.error);
