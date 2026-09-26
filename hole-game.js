const canvas = document.querySelector('#holeGame');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const WORLD_W = 2200;
const WORLD_H = 1400;
const keys = { up: false, down: false, left: false, right: false };
const player = { x: 1080, y: 700, radius: 27, score: 0, color: '#11151c' };
const neonSkin = typeof quickplayGetPurchases === 'function' && Number(quickplayGetPurchases().neonSkin || 0) > 0;
const rivals = [
  { name: 'RUBY', x: 500, y: 300, radius: 39, score: 420, color: '#ff4e62', target: null },
  { name: 'MINT', x: 1770, y: 430, radius: 47, score: 570, color: '#71e2bc', target: null },
  { name: 'GOLD', x: 1440, y: 1080, radius: 34, score: 350, color: '#f5cf48', target: null }
];
const objects = [];
let camera = { x: 0, y: 0 };
let time = typeof quickplayUse === 'function' && quickplayUse('timeChip') ? 75 : 60;
let running = true;
let last = performance.now();
let mouseTarget = null;
let toastTimer = 0;
let swallowCount = 0;
let seed = 29;

function random() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function makeObject(kind, x, y, radius, value, color) { objects.push({ kind, x, y, radius, value, color, wobble: random() * 7, alive: true }); }
function createCity() {
  const types = [
    ['tree', 13, 18, 40, '#55a965'], ['bench', 11, 13, 25, '#9d704c'], ['bin', 12, 15, 34, '#647386'], ['person', 9, 22, 30, '#d77988'],
    ['car', 22, 30, 80, '#e65c50'], ['lamp', 14, 18, 48, '#f5d25a'], ['house', 48, 66, 170, '#d88755']
  ];
  for (let i = 0; i < 72; i++) { const type = types[i % types.length]; const x = 90 + random() * 2020; const y = 90 + random() * 1220; makeObject(type[0], x, y, type[1], type[2], type[4]); }
  // A few guaranteed early targets near the player.
  makeObject('tree', 1038, 700, 13, 20, '#55a965'); makeObject('person', 1080, 650, 9, 22, '#d77988'); makeObject('person', 1120, 740, 9, 22, '#7b8ed1'); makeObject('bin', 1120, 700, 12, 18, '#647386'); makeObject('bench', 1080, 790, 11, 16, '#9d704c'); makeObject('car', 1260, 700, 22, 40, '#e65c50');
}
createCity();

function setToast(text, seconds = 2) { document.querySelector('#holeToast').textContent = text; toastTimer = seconds; }
function worldPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: camera.x + (event.clientX - rect.left) * W / rect.width, y: camera.y + (event.clientY - rect.top) * H / rect.height }; }
function moveVector() { return { x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0), y: (keys.down ? 1 : 0) - (keys.up ? 1 : 0) }; }
function canEat(object, radius = player.radius) { return radius >= object.radius * .95; }
function consume(object) { object.alive = false; player.score += object.value; player.radius = Math.min(118, Math.sqrt(player.radius * player.radius + object.radius * object.radius * .28)); swallowCount += 1; if (swallowCount % 4 === 0 || object.kind === 'house') setToast(`+${object.value}  ${object.kind.toUpperCase()} SWALLOWED`, 1); }
function updatePlayer(dt) {
  const direction = moveVector();
  let vx = direction.x, vy = direction.y;
  if (!vx && !vy && mouseTarget) { vx = mouseTarget.x - player.x; vy = mouseTarget.y - player.y; const length = Math.hypot(vx, vy); if (length > 18) { vx /= length; vy /= length; } else { vx = 0; vy = 0; } }
  const length = Math.hypot(vx, vy) || 1;
  if (direction.x || direction.y) { vx /= length; vy /= length; }
  player.x = Math.max(player.radius, Math.min(WORLD_W - player.radius, player.x + vx * 265 * dt));
  player.y = Math.max(player.radius, Math.min(WORLD_H - player.radius, player.y + vy * 265 * dt));
  for (const object of objects) if (object.alive && distance(player, object) < player.radius + Math.max(object.radius * .75, 12) && canEat(object)) consume(object);
  for (const rival of rivals) { if (distance(player, rival) < player.radius + rival.radius * .45) { if (player.radius > rival.radius * 1.15) { player.score += rival.score; player.radius = Math.min(125, player.radius + rival.radius * .35); rival.x = 300 + random() * 1600; rival.y = 200 + random() * 900; rival.radius = 26; setToast(`RIVAL ${rival.name} SWALLOWED`, 2); } else if (rival.radius > player.radius * 1.2) { player.x = WORLD_W / 2; player.y = WORLD_H / 2; player.radius = 27; setToast(`${rival.name} GOT YOU — KEEP GROWING`, 2); } } }
}
function updateRivals(dt) { rivals.forEach(rival => { rival.score += (7 + rival.radius * .12) * dt; rival.radius = Math.min(105, rival.radius + .22 * dt); if (!rival.target || !rival.target.alive || !canEat(rival.target, rival.radius)) { const possible = objects.filter(o => o.alive && canEat(o, rival.radius)); rival.target = possible.length ? possible[Math.floor(random() * possible.length)] : null; } if (rival.target) { const dx = rival.target.x - rival.x; const dy = rival.target.y - rival.y; const length = Math.hypot(dx, dy) || 1; rival.x += dx / length * (100 + rival.radius) * dt; rival.y += dy / length * (100 + rival.radius) * dt; if (distance(rival, rival.target) < rival.radius + rival.target.radius * .4) { rival.score += rival.target.value; rival.radius = Math.min(105, Math.sqrt(rival.radius * rival.radius + rival.target.radius * rival.target.radius * .18)); rival.target.alive = false; } } }); }
function updateHud() { document.querySelector('#holeTimer').textContent = Math.ceil(Math.max(0, time)); document.querySelector('#holeScore').textContent = player.score; document.querySelector('#holeSize').textContent = (player.radius / 27).toFixed(1); }
function finishRound() { running = false; const rank = 1 + rivals.filter(rival => rival.score > player.score).length; const earned = typeof quickplayAward === 'function' ? quickplayAward(Math.max(25, Math.round(player.score / 10) + (rank === 1 ? 75 : 25))) : 0; document.querySelector('#roundTitle').textContent = `You placed #${rank}`; document.querySelector('#roundSummary').textContent = `${player.score} score · ${earned} points earned · final size ${(player.radius / 27).toFixed(1)}×`; document.querySelector('#roundOver').hidden = false; }
function update(dt) { if (!running) return; time -= dt; if (time <= 0) { time = 0; finishRound(); return; } updatePlayer(dt); updateRivals(dt); camera.x += (player.x - W / 2 - camera.x) * Math.min(1, dt * 5); camera.y += (player.y - H / 2 - camera.y) * Math.min(1, dt * 5); camera.x = Math.max(0, Math.min(WORLD_W - W, camera.x)); camera.y = Math.max(0, Math.min(WORLD_H - H, camera.y)); updateHud(); if (toastTimer > 0) toastTimer -= dt; }

function sx(value) { return value - camera.x; }
function sy(value) { return value - camera.y; }
function drawCity() {
  ctx.fillStyle = '#8ec99a'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#354b54'; for (let x = -camera.x % 230 - 230; x < W + 230; x += 230) ctx.fillRect(x, 0, 76, H); for (let y = -camera.y % 210 - 210; y < H + 210; y += 210) ctx.fillRect(0, y, W, 65);
  ctx.strokeStyle = '#567078'; ctx.lineWidth = 3; for (let x = -camera.x % 230 - 230; x < W + 230; x += 230) { ctx.beginPath(); ctx.moveTo(x + 16, 0); ctx.lineTo(x + 16, H); ctx.stroke(); } for (let y = -camera.y % 210 - 210; y < H + 210; y += 210) { ctx.beginPath(); ctx.moveTo(0, y + 16); ctx.lineTo(W, y + 16); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.23)'; ctx.font = '900 10px Arial'; ctx.fillText('QUICK GAMES AVE', 14, 18); ctx.fillText('CAMPUS ROAD', 670, 18);
}
function drawObject(object) { if (!object.alive) return; const x = sx(object.x), y = sy(object.y); if (x < -100 || x > W + 100 || y < -100 || y > H + 100) return; ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(4, object.radius * .6, object.radius * 1.15, object.radius * .45, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = object.color; ctx.strokeStyle = '#17222c'; ctx.lineWidth = 3; if (object.kind === 'tree') { ctx.beginPath(); ctx.arc(0, -8, object.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#79533e'; ctx.fillRect(-4, 0, 8, 17); } else if (object.kind === 'car') { ctx.fillRect(-object.radius, -object.radius * .5, object.radius * 2, object.radius); ctx.fillStyle = '#b9e8ef'; ctx.fillRect(-object.radius * .56, -object.radius * .37, object.radius * .45, object.radius * .35); ctx.fillRect(object.radius * .1, -object.radius * .37, object.radius * .45, object.radius * .35); } else if (object.kind === 'house') { ctx.fillRect(-object.radius, -object.radius * .55, object.radius * 2, object.radius * 1.2); ctx.fillStyle = '#c1594f'; ctx.beginPath(); ctx.moveTo(-object.radius - 7, -object.radius * .55); ctx.lineTo(0, -object.radius * 1.15); ctx.lineTo(object.radius + 7, -object.radius * .55); ctx.fill(); } else if (object.kind === 'bench') { ctx.fillRect(-object.radius, -3, object.radius * 2, 7); ctx.fillRect(-object.radius + 2, -12, object.radius * 2 - 4, 5); } else if (object.kind === 'person') { ctx.fillStyle = '#f3c1a7'; ctx.beginPath(); ctx.arc(0, -object.radius * .65, object.radius * .42, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = object.color; ctx.beginPath(); ctx.moveTo(-object.radius * .55, object.radius * .5); ctx.lineTo(-object.radius * .3, -object.radius * .25); ctx.lineTo(object.radius * .3, -object.radius * .25); ctx.lineTo(object.radius * .55, object.radius * .5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#17222c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, object.radius * .5); ctx.lineTo(-5, object.radius); ctx.moveTo(3, object.radius * .5); ctx.lineTo(5, object.radius); ctx.stroke(); } else { ctx.fillRect(-object.radius * .6, -object.radius * .6, object.radius * 1.2, object.radius * 1.2); } ctx.restore(); }
function drawHole(hole) { const x = sx(hole.x), y = sy(hole.y); ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(6, hole.radius * .65, hole.radius * 1.14, hole.radius * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = hole.color; ctx.beginPath(); ctx.ellipse(0, 0, hole.radius, hole.radius * .78, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = hole === player && neonSkin ? '#ff3150' : '#0b1118'; ctx.lineWidth = hole === player && neonSkin ? 8 : 5; ctx.shadowColor = hole === player && neonSkin ? '#ff3150' : 'transparent'; ctx.shadowBlur = hole === player && neonSkin ? 18 : 0; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-hole.radius * .2, -hole.radius * .18, hole.radius * .5, hole.radius * .2, -.2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
function drawMiniMap() { const x = W - 145, y = 85, size = 110; ctx.fillStyle = 'rgba(10,15,22,.72)'; ctx.fillRect(x, y, size, size); ctx.strokeStyle = '#8fa2b7'; ctx.strokeRect(x, y, size, size); ctx.fillStyle = '#6f8d74'; ctx.fillRect(x + 8, y + 8, size - 16, size - 16); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + player.x / WORLD_W * size, y + player.y / WORLD_H * size, 4, 0, Math.PI * 2); ctx.fill(); rivals.forEach(rival => { ctx.fillStyle = rival.color; ctx.beginPath(); ctx.arc(x + rival.x / WORLD_W * size, y + rival.y / WORLD_H * size, 3, 0, Math.PI * 2); ctx.fill(); }); ctx.fillStyle = '#d2dce8'; ctx.font = '900 8px Arial'; ctx.fillText('CITY MAP', x + 8, y + size - 8); }
function draw() { drawCity(); objects.forEach(drawObject); rivals.forEach(drawHole); drawHole(player); drawMiniMap(); const ordered = [{ name: 'YOU', score: player.score, you: true }, ...rivals].sort((a, b) => b.score - a.score); document.querySelector('#leaderboard').innerHTML = `<b>LEADERBOARD</b>${ordered.map((item, index) => `<div class="${item.you ? 'you' : ''}">${index + 1}. ${item.name} ${Math.round(item.score)}</div>`).join('')}`; }
function loop(now) { const dt = Math.min((now - last) / 1000, .04); last = now; update(dt); draw(); if (running) requestAnimationFrame(loop); }
function setKey(key, value, button) { keys[key] = value; if (button) button.classList.toggle('held', value); }
const keyMap = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
window.addEventListener('keydown', event => { const key = keyMap[event.key] || keyMap[event.key.toLowerCase()]; if (key) { event.preventDefault(); setKey(key, true); } }); window.addEventListener('keyup', event => { const key = keyMap[event.key] || keyMap[event.key.toLowerCase()]; if (key) { event.preventDefault(); setKey(key, false); } });
canvas.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') mouseTarget = worldPoint(event); }); canvas.addEventListener('pointerleave', () => { mouseTarget = null; }); canvas.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') mouseTarget = worldPoint(event); });
document.querySelectorAll('[data-hole-key]').forEach(button => { const key = button.dataset.holeKey; button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); setKey(key, true, button); }); button.addEventListener('pointerup', () => setKey(key, false, button)); button.addEventListener('pointercancel', () => setKey(key, false, button)); });
document.querySelector('#restartHole').addEventListener('click', () => location.reload()); document.querySelector('#playAgain').addEventListener('click', () => location.reload());
requestAnimationFrame(loop);
