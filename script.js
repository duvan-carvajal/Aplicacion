// script.js - Ghost Defeater (canvas, teclado y touch)
// Autor: ejemplo para integrar en WebView

(() => {
  // Config
  const CANVAS = document.getElementById('game');
  const ctx = CANVAS.getContext('2d', { alpha: false });
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayText = document.getElementById('overlay-text');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');

  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const levelEl = document.getElementById('level');

  // touch buttons
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const shootBtn = document.getElementById('shootBtn');

  // canvas size handling (fixed internal resolution, scaled by CSS)
  const WIDTH = 900, HEIGHT = 600;
  CANVAS.width = WIDTH; CANVAS.height = HEIGHT;

  // game state
  let running = false;
  let lastTime = 0;
  let accum = 0;

  const player = {
    x: WIDTH / 2,
    y: HEIGHT - 70,
    w: 48,
    h: 28,
    speed: 360, // px/s
    cooldown: 0.2,
    canShoot: 0
  };

  let bullets = [];
  let ghosts = [];
  let spawnTimer = 0;
  let spawnInterval = 1.4; // seconds
  let score = 0, lives = 3, level = 1;

  // controls
  const keys = {};
  let touchLeft = false, touchRight = false, touchShoot = false;

  // helpers
  function rand(min, max){ return Math.random() * (max - min) + min; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  // sounds (simple beep using WebAudio)
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;

  function beep(freq=440, duration=0.08, type='sine', gain=0.12){
    if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    o.stop(audioCtx.currentTime + duration + 0.02);
  }

  // entities
  function spawnGhost(){
    const size = rand(28, 52);
    const x = rand(size/2, WIDTH - size/2);
    const speed = rand(40 + level*5, 90 + level*10);
    const wobble = rand(0.5, 1.6);
    ghosts.push({ x, y:-size, size, speed, wobble, hp: 1 + Math.floor(level/3) });
  }

  function shoot(){
    if(player.canShoot > 0) return;
    bullets.push({ x: player.x, y: player.y - 18, vy: -520 });
    player.canShoot = player.cooldown;
    beep(860,0.06,'square',0.08);
  }

  // collisions
  function rectsOverlap(a,b){
    return Math.abs(a.x - b.x) * 2 < (a.w + b.w) && Math.abs(a.y - b.y) * 2 < (a.h + b.h);
  }

  // update loop
  function update(dt){
    if(!running) return;

    // player input
    let dir = 0;
    if(keys['ArrowLeft'] || keys['a'] || touchLeft) dir -= 1;
    if(keys['ArrowRight']|| keys['d'] || touchRight) dir += 1;
    player.x += dir * player.speed * dt;
    player.x = clamp(player.x, player.w/2, WIDTH - player.w/2);

    // shooting
    if((keys[' '] || keys['k'] || touchShoot) && player.canShoot <= 0) shoot();

    // cooldowns
    if(player.canShoot > 0) player.canShoot -= dt;

    // bullets
    for(let i = bullets.length-1; i >= 0; i--){
      const b = bullets[i];
      b.y += b.vy * dt;
      if(b.y < -20) bullets.splice(i,1);
    }

    // ghosts
    spawnTimer -= dt;
    if(spawnTimer <= 0){
      spawnGhost();
      spawnTimer = spawnInterval;
      // speed up spawn a bit with level
    }

    for(let gi = ghosts.length-1; gi >= 0; gi--){
      const g = ghosts[gi];
      g.y += g.speed * dt;
      g.x += Math.sin((performance.now()/1000) * g.wobble) * 12 * dt * 60; // small wobble
      // collision with bullets
      for(let bi = bullets.length-1; bi >= 0; bi--){
        const b = bullets[bi];
        // approximate boxes
        const rectG = { x:g.x, y:g.y, w:g.size, h:g.size };
        const rectB = { x:b.x, y:b.y, w:8, h:12 };
        if(rectsOverlap(rectG, rectB)){
          bullets.splice(bi,1);
          g.hp -= 1;
          score += 10;
          beep(1200,0.04,'sine',0.06);
          if(g.hp <= 0){
            ghosts.splice(gi,1);
            // small chance to spawn two small ghosts
            if(Math.random() < 0.08){
              ghosts.push({ x:g.x+10, y:g.y, size:18, speed:g.speed*1.2, wobble: rand(1,2), hp:1});
              ghosts.push({ x:g.x-10, y:g.y, size:18, speed:g.speed*1.2, wobble: rand(1,2), hp:1});
            }
          }
          break;
        }
      }
      // ghost reached bottom -> damage
      if(g.y > HEIGHT + 40){
        ghosts.splice(gi,1);
        lives -= 1;
        beep(140,0.15,'sawtooth',0.12);
        if(lives <= 0) gameOver();
      }
      // collision with player (touch)
      const rectG = { x:g.x, y:g.y, w:g.size, h:g.size };
      const rectP = { x:player.x, y:player.y, w:player.w, h:player.h };
      if(rectsOverlap(rectG, rectP)){
        ghosts.splice(gi,1);
        lives -= 1;
        beep(120,0.12,'sawtooth',0.12);
        if(lives <= 0) gameOver();
      }
    }

    // levels: every X points increase level
    const nextLvl = Math.floor(score / 250) + 1;
    if(nextLvl > level){
      level = nextLvl;
      spawnInterval = Math.max(0.4, spawnInterval - 0.15);
      beep(520,0.12,'triangle',0.12);
    }

    // update HUD
    scoreEl.textContent = `Puntos: ${score}`;
    livesEl.textContent = `Vidas: ${lives}`;
    levelEl.textContent = `Nivel: ${level}`;
  }

  // draw
  function draw(){
    // background
    ctx.fillStyle = '#07101a';
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    // draw player (simple ghost-hunter device)
    ctx.save();
    ctx.translate(player.x, player.y);
    // body
    ctx.fillStyle = '#a7f3ff';
    roundRect(ctx, -player.w/2, -player.h/2, player.w, player.h, 8);
    ctx.fill();
    // barrel
    ctx.fillStyle = '#07202b';
    ctx.fillRect(-4, -player.h - 6, 8, 12);
    ctx.restore();

    // bullets
    ctx.fillStyle = '#fff';
    bullets.forEach(b => {
      ctx.fillRect(b.x-3, b.y-10, 6, 12);
    });

    // ghosts
    ghosts.forEach(g => {
      drawGhost(ctx, g.x, g.y, g.size, g.hp);
    });

    // HUD small
    // shadow under player
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + player.h/1.2, player.w*0.6, 8, 0, 0, Math.PI*2);
    ctx.fill();
  }

  function drawGhost(ctx, x, y, size, hp){
    ctx.save();
    ctx.translate(x, y);
    // body
    const grd = ctx.createLinearGradient(0,-size/2,0,size/2);
    grd.addColorStop(0, '#ffe3ee');
    grd.addColorStop(1, '#dca6bf');
    ctx.fillStyle = grd;
    // head (circle)
    ctx.beginPath();
    ctx.arc(0, -size*0.12, size*0.38, Math.PI, 0);
    ctx.fill();
    // body
    ctx.beginPath();
    ctx.moveTo(-size*0.38, -size*0.12);
    ctx.quadraticCurveTo(0, size*0.7, size*0.38, -size*0.12);
    ctx.closePath();
    ctx.fill();

    // eyes
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(-size*0.12, -size*0.05, size*0.06, size*0.09, 0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(size*0.12, -size*0.05, size*0.06, size*0.09, 0,0,Math.PI*2); ctx.fill();
    // small mouth
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, size*0.04, size*0.08, 0, Math.PI, false);
    ctx.stroke();

    // HP indicator small
    if(hp > 1){
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-size*0.28, -size*0.44, size*0.56 * (hp / (1 + Math.floor(level/3))), 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.strokeRect(-size*0.28, -size*0.44, size*0.56, 6);
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // main loop
  function loop(t){
    const dt = Math.min(0.03, (t - lastTime) / 1000 || 0);
    lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // start / restart / gameover
  function startGame(){
    score = 0; lives = 3; level = 1;
    bullets = []; ghosts = [];
    spawnInterval = 1.4;
    spawnTimer = 0.6;
    player.x = WIDTH / 2;
    running = true;
    overlay.classList.add('hidden');
    restartBtn.classList.add('hidden');
    overlayTitle.textContent = '¡A cazar fantasmas!';
    overlayText.textContent = '';
    // warm audio
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    beep(660,0.08,'sine',0.09);
  }

  function gameOver(){
    running = false;
    overlay.classList.remove('hidden');
    overlayTitle.textContent = '¡Has perdido!';
    overlayText.textContent = `Puntos: ${score} — Nivel alcanzado: ${level}`;
    restartBtn.classList.remove('hidden');
    startBtn.classList.add('hidden');
    beep(100,0.25,'sawtooth',0.14);
  }

  // keyboard
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if(e.key === 'Enter' && !running){ startGame(); }
    if(e.key === ' ' || e.key === 'k'){ e.preventDefault(); } // prevent scroll
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  // touch controls
  leftBtn.addEventListener('touchstart', e => { e.preventDefault(); touchLeft = true; });
  leftBtn.addEventListener('touchend', e => { e.preventDefault(); touchLeft = false; });
  rightBtn.addEventListener('touchstart', e => { e.preventDefault(); touchRight = true; });
  rightBtn.addEventListener('touchend', e => { e.preventDefault(); touchRight = false; });
  shootBtn.addEventListener('touchstart', e => { e.preventDefault(); touchShoot = true; shoot(); });
  shootBtn.addEventListener('touchend', e => { e.preventDefault(); touchShoot = false; });

  // also mouse buttons for convenience
  leftBtn.addEventListener('mousedown', () => touchLeft = true);
  leftBtn.addEventListener('mouseup', () => touchLeft = false);
  rightBtn.addEventListener('mousedown', () => touchRight = true);
  rightBtn.addEventListener('mouseup', () => touchRight = false);
  shootBtn.addEventListener('mousedown', () => { touchShoot = true; shoot(); });
  shootBtn.addEventListener('mouseup', () => touchShoot = false);

  // UI buttons
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', () => {
    startBtn.classList.remove('hidden');
    restartBtn.classList.add('hidden');
    overlay.classList.add('hidden');
    startGame();
  });

  // basic responsiveness (scale canvas CSS to max width while keeping aspect)
  function resizeCanvasCSS(){
    const wrap = document.querySelector('#game-wrap');
    const maxW = Math.min(wrap.clientWidth, 1000);
    const cssW = Math.max(320, maxW - 0);
    CANVAS.style.width = cssW + 'px';
    CANVAS.style.height = (cssW * HEIGHT / WIDTH) + 'px';
  }
  window.addEventListener('resize', resizeCanvasCSS);
  resizeCanvasCSS();

  // initial overlay ready
  overlay.classList.remove('hidden');
  startBtn.classList.remove('hidden');
  restartBtn.classList.add('hidden');
  overlayTitle.textContent = 'Ghost Defeater';
  overlayText.textContent = 'Derrota fantasmas, sube de nivel, y no te dejes atrapar.';
  // start animation loop
  requestAnimationFrame(loop);

})();

