export class HelloWorldGenerator {
  static variants = {
    minimal() {
      return `<!DOCTYPE html>
<html>
<head><title>Hello World</title></head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    styled() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Styled</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', sans-serif;
}
h1 {
  color: white;
  font-size: 4rem;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  letter-spacing: 2px;
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    animated() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Animated</title>
<style>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
@keyframes colorShift {
  0% { color: #667eea; }
  25% { color: #764ba2; }
  50% { color: #f093fb; }
  75% { color: #f5576c; }
  100% { color: #667eea; }
}
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  font-family: sans-serif;
}
h1 {
  font-size: 5rem;
  animation: bounce 2s ease-in-out infinite, colorShift 4s ease infinite;
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    interactive() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Interactive</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d2d30;
  font-family: sans-serif;
}
#hello {
  font-size: 4rem;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  padding: 20px;
  border-radius: 10px;
}
#hello:hover {
  transform: scale(1.1);
  background: rgba(255,255,255,0.1);
}
#hello:active {
  transform: scale(0.95);
}
</style>
</head>
<body>
<h1 id="hello" onclick="changeColor()" ondblclick="explode()">Hello World</h1>
<script>
const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
let colorIndex = 0;
function changeColor() {
  colorIndex = (colorIndex + 1) % colors.length;
  document.getElementById('hello').style.color = colors[colorIndex];
}
function explode() {
  const h1 = document.getElementById('hello');
  h1.style.transform = 'scale(2) rotate(360deg)';
  setTimeout(() => h1.style.transform = 'scale(1)', 500);
}
</script>
</body>
</html>`;
    },

    responsive() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Responsive</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0c29;
  font-family: sans-serif;
}
h1 {
  color: white;
  text-align: center;
}
@media (max-width: 480px) {
  h1 { font-size: 2rem; }
}
@media (min-width: 481px) and (max-width: 768px) {
  h1 { font-size: 3rem; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  h1 { font-size: 4rem; }
}
@media (min-width: 1025px) {
  h1 { font-size: 6rem; }
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    dark() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Dark</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d0d;
  font-family: 'Courier New', monospace;
}
h1 {
  font-size: 5rem;
  color: #00ff00;
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 40px #00ff00,
    0 0 80px #00ff00;
  animation: flicker 1.5s infinite alternate;
}
@keyframes flicker {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    neon() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Neon</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  font-family: sans-serif;
}
h1 {
  font-size: 5rem;
  color: #fff;
  text-shadow:
    0 0 7px #fff,
    0 0 10px #fff,
    0 0 21px #fff,
    0 0 42px #bc13fe,
    0 0 82px #bc13fe,
    0 0 92px #bc13fe,
    0 0 102px #bc13fe,
    0 0 151px #bc13fe;
  animation: pulsate 0.5s ease-in-out infinite alternate;
}
@keyframes pulsate {
  100% {
    text-shadow:
      0 0 4px #fff,
      0 0 11px #fff,
      0 0 19px #fff,
      0 0 40px #bc13fe,
      0 0 80px #bc13fe,
      0 0 90px #bc13fe,
      0 0 100px #bc13fe,
      0 0 150px #bc13fe;
  }
  0% {
    text-shadow:
      0 0 4px #fff,
      0 0 10px #fff,
      0 0 18px #fff,
      0 0 38px #bc13fe,
      0 0 73px #bc13fe,
      0 0 80px #bc13fe,
      0 0 94px #bc13fe,
      0 0 140px #bc13fe;
  }
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    '3d'() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - 3D</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #434343 0%, #000000 100%);
  font-family: sans-serif;
  perspective: 1000px;
}
h1 {
  font-size: 5rem;
  color: white;
  transform: rotateX(20deg) rotateY(-20deg);
  text-shadow: 
    1px 1px 0 #ddd,
    2px 2px 0 #d9d9d9,
    3px 3px 0 #d2d2d2,
    4px 4px 0 #ccc,
    5px 5px 0 #c7c7c7,
    6px 6px 0 #c1c1c1,
    7px 7px 0 #bbb,
    8px 8px 0 #b5b5b5,
    9px 9px 0 #aaa,
    10px 10px 0 #a5a5a5,
    11px 11px 10px rgba(0,0,0,0.5);
  animation: rotate3d 5s ease-in-out infinite;
}
@keyframes rotate3d {
  0%, 100% { transform: rotateX(20deg) rotateY(-20deg); }
  50% { transform: rotateX(-20deg) rotateY(20deg); }
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    },

    particle() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Particle</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
canvas {
  display: block;
}
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const text = 'Hello World';
ctx.font = '80px Arial';
ctx.fillStyle = 'white';
ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2);

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
ctx.clearRect(0, 0, canvas.width, canvas.height);

for (let y = 0; y < imageData.height; y += 4) {
  for (let x = 0; x < imageData.width; x += 4) {
    if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
      particles.push({ x, y, baseX: x, baseY: y, size: 2 });
    }
  }
}

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => {
    const dist = Math.hypot(p.baseX - mouse.x, p.baseY - mouse.y);
    const force = Math.min(100 / dist, 10);
    const angle = Math.atan2(p.baseY - mouse.y, p.baseX - mouse.x);
    
    p.x = p.baseX + Math.cos(angle) * force * 5;
    p.y = p.baseY + Math.sin(angle) * force * 5;
    
    ctx.fillStyle = \`hsl(\${p.x * 0.5}, 100%, 60%)\`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  
  requestAnimationFrame(animate);
}

const mouse = { x: 0, y: 0 };
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

animate();
</script>
</body>
</html>`;
    },

    game() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Game</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  background: #1a1a2e;
  font-family: sans-serif;
  overflow: hidden;
}
#game {
  width: 100vw;
  height: 100vh;
  position: relative;
}
#player {
  position: absolute;
  font-size: 3rem;
  cursor: pointer;
  user-select: none;
}
.star {
  position: absolute;
  font-size: 2rem;
  animation: twinkle 1s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
#score {
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 1.5rem;
}
#instructions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  opacity: 0.7;
}
</style>
</head>
<body>
<div id="game">
  <div id="player">Hello World</div>
  <div id="score">Stars: 0</div>
  <div id="instructions">Use arrow keys or WASD to move. Collect stars!</div>
</div>
<script>
const player = document.getElementById('player');
const game = document.getElementById('game');
let score = 0;
let x = window.innerWidth / 2 - 75;
let y = window.innerHeight / 2 - 30;
player.style.left = x + 'px';
player.style.top = y + 'px';

function spawnStar() {
  const star = document.createElement('div');
  star.className = 'star';
  star.textContent = '⭐';
  star.style.left = Math.random() * (window.innerWidth - 50) + 'px';
  star.style.top = Math.random() * (window.innerHeight - 50) + 'px';
  game.appendChild(star);
  
  star.checkCollision = setInterval(() => {
    const starRect = star.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    if (starRect.left < playerRect.right && starRect.right > playerRect.left &&
        starRect.top < playerRect.bottom && starRect.bottom > playerRect.top) {
      score++;
      document.getElementById('score').textContent = 'Stars: ' + score;
      clearInterval(star.checkCollision);
      star.remove();
      spawnStar();
    }
  }, 100);
}

for (let i = 0; i < 5; i++) spawnStar();

window.addEventListener('keydown', e => {
  const speed = 20;
  if (e.key === 'ArrowUp' || e.key === 'w') y -= speed;
  if (e.key === 'ArrowDown' || e.key === 's') y += speed;
  if (e.key === 'ArrowLeft' || e.key === 'a') x -= speed;
  if (e.key === 'ArrowRight' || e.key === 'd') x += speed;
  
  x = Math.max(0, Math.min(window.innerWidth - 150, x));
  y = Math.max(0, Math.min(window.innerHeight - 60, y));
  
  player.style.left = x + 'px';
  player.style.top = y + 'px';
});
</script>
</body>
</html>`;
    },

    music() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Music</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: sans-serif;
}
h1 {
  font-size: 5rem;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s;
}
h1:active {
  transform: scale(0.95);
}
#keys {
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 10px;
}
.key {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.3);
  border: 2px solid white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
}
.key:hover {
  background: rgba(255,255,255,0.5);
}
.key.active {
  background: rgba(255,255,255,0.8);
  transform: scale(1.1);
}
</style>
</head>
<body>
<h1 id="hello" onclick="playNote(440)">Hello World</h1>
<div id="keys">
  <div class="key" data-note="1">1</div>
  <div class="key" data-note="2">2</div>
  <div class="key" data-note="3">3</div>
  <div class="key" data-note="4">4</div>
  <div class="key" data-note="5">5</div>
  <div class="key" data-note="6">6</div>
  <div class="key" data-note="7">7</div>
</div>
<script>
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];

function playNote(freq) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.frequency.value = freq;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', () => {
    const noteIndex = parseInt(key.dataset.note) - 1;
    playNote(notes[noteIndex]);
    key.classList.add('active');
    setTimeout(() => key.classList.remove('active'), 100);
  });
});

document.addEventListener('keydown', e => {
  const noteNum = parseInt(e.key);
  if (noteNum >= 1 && noteNum <= 7) {
    const key = document.querySelector(\`.key[data-note="\${noteNum}"]\`);
    playNote(notes[noteNum - 1]);
    key.classList.add('active');
    setTimeout(() => key.classList.remove('active'), 100);
  }
});
</script>
</body>
</html>`;
    },

    canvas() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Canvas</title>
<style>
body {
  margin: 0;
  background: #000;
  overflow: hidden;
}
canvas {
  display: block;
}
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let time = 0;

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const text = 'Hello World';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i < text.length; i++) {
    const x = canvas.width/2 - 300 + i * 50;
    const y = canvas.height/2 + Math.sin(time + i * 0.5) * 30;
    
    const hue = (time * 50 + i * 30) % 360;
    ctx.fillStyle = \`hsl(\${hue}, 100%, 60%)\`;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time + i * 0.3) * 0.2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  
  time += 0.02;
  requestAnimationFrame(animate);
}

animate();
</script>
</body>
</html>`;
    }
  };

  static levels = [
    () => HelloWorldGenerator.variants.minimal(),
    () => `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Styled</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
}
h1 {
  color: #0066cc;
  font-size: 48px;
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`,
    () => `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Layout</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  font-family: sans-serif;
}
.container {
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
h1 {
  color: #333;
  font-size: 48px;
  margin: 0;
}
</style>
</head>
<body>
<div class="container">
  <h1>Hello World</h1>
</div>
</body>
</html>`,
    () => HelloWorldGenerator.variants.interactive(),
    () => HelloWorldGenerator.variants.animated(),
    () => HelloWorldGenerator.variants.responsive(),
    () => `<!DOCTYPE html>
<html>
<head>
<title>Hello World App</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: sans-serif;
}
.app {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
h1 {
  margin: 0 0 20px;
  color: #333;
}
input {
  padding: 10px 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 10px;
}
button {
  padding: 10px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}
button:hover {
  background: #764ba2;
}
#result {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}
</style>
</head>
<body>
<div class="app">
  <h1>Hello World</h1>
  <input type="text" id="nameInput" placeholder="输入你的名字">
  <button onclick="greet()">问候</button>
  <div id="result"></div>
</div>
<script>
function greet() {
  const name = document.getElementById('nameInput').value || 'World';
  document.getElementById('result').textContent = 'Hello, ' + name + '!';
}
</script>
</body>
</html>`
  ];

  static challenges = {
    random() {
      const variants = ['styled', 'neon', 'dark'];
      const random = variants[Math.floor(Math.random() * variants.length)];
      return HelloWorldGenerator.variants[random]();
    },
    
    timer() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Timer Challenge</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  font-family: sans-serif;
}
h1 {
  font-size: 5rem;
  transition: color 0.3s;
}
#timer {
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 1.5rem;
}
</style>
</head>
<body>
<h1 id="hello">Hello World</h1>
<div id="timer">10秒</div>
<script>
const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
const hello = document.getElementById('hello');
const timer = document.getElementById('timer');
let seconds = 10;

const interval = setInterval(() => {
  seconds--;
  timer.textContent = seconds + '秒';
  
  if (seconds <= 0) {
    clearInterval(interval);
    clearInterval(colorInterval);
    timer.textContent = '完成!';
  }
}, 1000);

const colorInterval = setInterval(() => {
  hello.style.color = colors[Math.floor(Math.random() * colors.length)];
}, 1000);
</script>
</body>
</html>`;
    },

    ai() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - AI Battle</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  background: #1a1a2e;
  font-family: sans-serif;
  display: flex;
  gap: 20px;
  padding: 20px;
}
.style-card {
  flex: 1;
  background: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}
.style-card:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.style-card.selected {
  box-shadow: 0 0 0 5px #667eea;
}
h1 { margin: 0; }
.label {
  position: absolute;
  bottom: 20px;
  color: #666;
  font-size: 14px;
}
.minimal {
  background: white;
}
.minimal h1 {
  color: #333;
  font-size: 3rem;
}
.gorgeous {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.gorgeous h1 {
  color: white;
  font-size: 4rem;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
</style>
</head>
<body>
<div class="style-card minimal" onclick="select(this)">
  <h1>Hello World</h1>
  <div class="label">极简风格</div>
</div>
<div class="style-card gorgeous" onclick="select(this)">
  <h1>Hello World</h1>
  <div class="label">华丽风格</div>
</div>
<script>
function select(card) {
  document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  setTimeout(() => {
    alert('你选择了 ' + (card.classList.contains('minimal') ? '极简风格' : '华丽风格') + '!');
  }, 300);
}
</script>
</body>
</html>`;
    },

    reverse() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - 3D Gold</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #434343 0%, #000000 100%);
  font-family: 'Georgia', serif;
}
h1 {
  font-size: 6rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
  animation: rotate3d 3s ease-in-out infinite;
  transform-style: preserve-3d;
}
@keyframes rotate3d {
  0%, 100% { transform: perspective(1000px) rotateY(-15deg); }
  50% { transform: perspective(1000px) rotateY(15deg); }
}
</style>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>`;
    }
  };

  static labs = {
    mix() {
      const styles = ['neon', 'dark', 'styled', '3d'];
      const shuffled = styles.sort(() => Math.random() - 0.5).slice(0, 3);
      return HelloWorldGenerator.variants[shuffled[0]]();
    },

    evolve() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Evolving</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  font-family: sans-serif;
}
h1 {
  font-size: 4rem;
  color: white;
  transition: all 0.5s ease;
}
#counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: white;
  font-size: 1rem;
}
</style>
</head>
<body>
<h1 id="hello">Hello World</h1>
<div id="counter">变化: 1/20</div>
<script>
const hello = document.getElementById('hello');
const counter = document.getElementById('counter');
const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
let change = 0;

const interval = setInterval(() => {
  change++;
  if (change > 20) {
    clearInterval(interval);
    counter.textContent = '进化完成!';
    return;
  }
  
  const color = colors[change % colors.length];
  const size = 2 + Math.sin(change * 0.3) * 2;
  const rotation = Math.sin(change * 0.5) * 10;
  
  hello.style.color = color;
  hello.style.fontSize = size + 'rem';
  hello.style.transform = \`rotate(\${rotation}deg)\`;
  counter.textContent = '变化: ' + change + '/20';
}, 500);
</script>
</body>
</html>`;
    },

    remix() {
      return HelloWorldGenerator.variants.particle();
    },

    mutation() {
      return `<!DOCTYPE html>
<html>
<head>
<title>Hello World - Mutation</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  background: #1a1a2e;
  font-family: sans-serif;
  padding: 20px;
  box-sizing: border-box;
}
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}
.mutation {
  background: #2d2d30;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;
}
.mutation:hover {
  transform: scale(1.05);
  background: #3d3d40;
}
.mutation h2 {
  margin: 0 0 10px;
  font-size: 1.5rem;
  transition: all 0.5s;
}
.mutation .desc {
  font-size: 0.8rem;
  color: #858585;
}
</style>
</head>
<body>
<div class="grid" id="grid"></div>
<script>
const mutations = [
  { color: '#667eea', name: 'Basic' },
  { color: '#764ba2', name: 'Purple' },
  { color: '#f093fb', name: 'Pink' },
  { color: '#f5576c', name: 'Coral' },
  { color: '#4facfe', name: 'Blue' },
  { color: '#00f2fe', name: 'Cyan' },
  { color: '#43e97b', name: 'Green' },
  { color: '#38f9d7', name: 'Teal' },
  { color: '#fa709a', name: 'Rose' },
  { color: '#fee140', name: 'Yellow' }
];

const grid = document.getElementById('grid');
mutations.forEach((m, i) => {
  const div = document.createElement('div');
  div.className = 'mutation';
  div.innerHTML = \`<h2 style="color: \${m.color}">Hello World</h2><div class="desc">变异 #\${i+1}</div>\`;
  grid.appendChild(div);
});
</script>
</body>
</html>`;
    }
  };

  static generate(type, variant) {
    if (type === 'variant' && this.variants[variant]) {
      return this.variants[variant]();
    }
    if (type === 'level' && this.levels[variant]) {
      return this.levels[variant]();
    }
    if (type === 'challenge' && this.challenges[variant]) {
      return this.challenges[variant]();
    }
    if (type === 'lab' && this.labs[variant]) {
      return this.labs[variant]();
    }
    return this.variants.minimal();
  }
}
