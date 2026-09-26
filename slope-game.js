const canvas = document.querySelector('#slopeGame');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const input = { left: false, right: false };
const player = { x: 0, z: 0, vx: 0 };
const segments = [];
const obstacles = [];
const segmentLength = 8;
let running = false;
let started = false;
let elapsed = 0;
let speed = 15;
let score = 0;
let best = Number(localStorage.getItem('quickGamesSlopeBest') || 0);
let last = performance.now();
let awarded = false;

document.querySelector('#bestScore').textContent = best;

function routeCenter(index) {
  if (index < 10) return 0;
  return Math.sin(index * .42) * 1.6 + Math.sin(index * .17 + 1.2) * .8;
}
function makeCourse() {
  for (let index = 0; index < 240; index += 1) {
    const center = routeCenter(index);
    const width = 9.2 - Math.min(2.1, index * .008) + Math.sin(index * .71) * .25;
    segments.push({ z: index * segmentLength, center, width: Math.max(6.3, width), length: segmentLength, hue: index % 5 });
  }
  for (let index = 8; index < 226; index += 7) {
    const center = routeCenter(index);
    const lane = ((index * 13) % 5 - 2) * 1.35;
    obstacles.push({ z: index * segmentLength + 2, x: center + lane, width: index % 3 === 0 ? 1.8 : 1.25, height: index % 4 === 0 ? 2.4 : 1.75 });
    if (index % 5 === 0) obstacles.push({ z: index * segmentLength + 5.5, x: center - lane * .7, width: 1.1, height: 1.5 });
  }
}
makeCourse();

function segmentAt(z) {
  const safeZ = Math.max(0, Math.min(segments[segments.length - 1].z + segmentLength - .001, z));
  const index = Math.min(segments.length - 1, Math.floor(safeZ / segmentLength));
  const current = segments[index];
  const next = segments[Math.min(index + 1, segments.length - 1)];
  const blend = Math.min(1, (safeZ - current.z) / segmentLength);
  return { z: safeZ, center: current.center + (next.center - current.center) * blend, width: current.width + (next.width - current.width) * blend, length: segmentLength, hue: current.hue };
}
function slopeHeight(z) { return Math.sin(z * .045) * .85 + Math.sin(z * .016 + 1.4) * .55 - z * .0015; }
function setStatus(text) { document.querySelector('#slopeStatus').textContent = text; }
function updateHud() {
  document.querySelector('#slopeScore').textContent = score;
  document.querySelector('#slopeSpeed').textContent = `${(speed / 15).toFixed(1)}x`;
  document.querySelector('#bestScore').textContent = Math.max(best, score);
}
function endRun(reason) {
  if (!running) return;
  running = false;
  best = Math.max(best, score);
  localStorage.setItem('quickGamesSlopeBest', String(best));
  const earned = typeof quickplayAward === 'function' ? quickplayAward(Math.max(15, Math.floor(score / 20))) : 0;
  document.querySelector('#slopeResultTitle').textContent = reason;
  document.querySelector('#slopeResultScore').textContent = `Score ${score} · Best ${best} · +${earned} points`;
  document.querySelector('#slopeResult').hidden = false;
}
function reset() {
  running = false; started = false; awarded = false; elapsed = 0; speed = 15; score = 0; player.x = 0; player.z = 0; player.vx = 0;
  document.querySelector('#slopeStart').hidden = false;
  document.querySelector('#slopeResult').hidden = true;
  setStatus('A / D or ← / → to steer');
  updateHud();
}
function startRun() {
  running = true; started = true; elapsed = 0; speed = 15; score = 0; player.x = 0; player.z = 0; player.vx = 0;
  document.querySelector('#slopeStart').hidden = true;
  document.querySelector('#slopeResult').hidden = true;
  setStatus('A / D or ← / → to steer');
  updateHud();
}
function update(dt) {
  if (!running) return;
  elapsed += dt;
  speed = Math.min(36, 15 + elapsed * .72);
  score = Math.floor(elapsed * 10);
  const keyDirection = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.vx += keyDirection * 34 * dt;
  player.vx *= Math.pow(.08, dt);
  player.vx = Math.max(-12, Math.min(12, player.vx));
  player.x += player.vx * dt;
  player.z += speed * dt;
  const road = segmentAt(player.z + 1);
  if (!road || Math.abs(player.x - road.center) > road.width / 2 - .25) { endRun('You left the slope.'); return; }
  const hit = obstacles.some(obstacle => Math.abs(player.z - obstacle.z) < 1.35 && Math.abs(player.x - obstacle.x) < obstacle.width / 2 + .45);
  if (hit) { endRun('You hit a red block.'); return; }
  updateHud();
}

function project(x, y, z) {
  // A lower camera with a real perspective falloff keeps the road visible
  // from the player to the horizon instead of making it look like a thin line.
  const cameraZ = player.z - 20;
  const depth = Math.max(3, z - cameraZ);
  const scale = 1 / (1 + depth * .018);
  const horizon = 120;
  const groundY = horizon + 6000 / depth;
  return { x: W / 2 + (x - player.x * .2) * 76 * scale, y: groundY - y * 72 * scale, scale };
}
function drawStar(x, y, size) {
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) { const angle = -Math.PI / 2 + point * Math.PI / 5; const radius = point % 2 ? size * .42 : size; const px = x + Math.cos(angle) * radius; const py = y + Math.sin(angle) * radius; if (!point) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
  ctx.closePath(); ctx.fill();
}
function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H); gradient.addColorStop(0, '#c8a9df'); gradient.addColorStop(.66, '#ecdafa'); gradient.addColorStop(1, '#b994cf'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(105,73,137,.2)'; ctx.beginPath(); ctx.moveTo(0, 355); ctx.quadraticCurveTo(150, 300, 300, 352); ctx.quadraticCurveTo(460, 405, 620, 335); ctx.quadraticCurveTo(790, 280, 960, 350); ctx.lineTo(960, 560); ctx.lineTo(0, 560); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,255,.8)';
  for (let i = 0; i < 20; i += 1) { const x = (i * 137 + 47) % W; const y = 55 + ((i * 83) % 230); drawStar(x, y, 5 + (i % 3) * 2); }
  ctx.fillStyle = 'rgba(103,68,134,.2)'; ctx.fillRect(0, 365, W, 175);
}
function drawGround() {
  const nearLeft = project(-28, -1.4, player.z - 6);
  const nearRight = project(28, -1.4, player.z - 6);
  const farLeft = project(-32, -1.4, player.z + 185);
  const farRight = project(32, -1.4, player.z + 185);
  ctx.fillStyle = 'rgba(46,28,67,.6)';
  ctx.beginPath();
  ctx.moveTo(nearLeft.x, nearLeft.y);
  ctx.lineTo(nearRight.x, nearRight.y);
  ctx.lineTo(farRight.x, farRight.y);
  ctx.lineTo(farLeft.x, farLeft.y);
  ctx.closePath();
  ctx.fill();
}
function drawRoad(segment) {
  const nearZ = segment.z; const farZ = segment.z + segment.length; const nearRoad = segmentAt(nearZ); const farRoad = segmentAt(farZ); const nearHalf = nearRoad.width / 2; const farHalf = farRoad.width / 2;
  const nearY = slopeHeight(nearZ); const farY = slopeHeight(farZ);
  const nearLeft = project(nearRoad.center - nearHalf, nearY, nearZ); const nearRight = project(nearRoad.center + nearHalf, nearY, nearZ); const farLeft = project(farRoad.center - farHalf, farY, farZ); const farRight = project(farRoad.center + farHalf, farY, farZ);
  const nearBottomLeft = project(nearRoad.center - nearHalf, nearY - 1.2, nearZ); const nearBottomRight = project(nearRoad.center + nearHalf, nearY - 1.2, nearZ); const farBottomLeft = project(farRoad.center - farHalf, farY - 1.2, farZ); const farBottomRight = project(farRoad.center + farHalf, farY - 1.2, farZ);
  ctx.fillStyle = 'rgba(48,28,67,.28)'; ctx.beginPath(); ctx.moveTo(nearLeft.x + 10, nearLeft.y + 13); ctx.lineTo(nearRight.x + 10, nearRight.y + 13); ctx.lineTo(farRight.x + 10, farRight.y + 13); ctx.lineTo(farLeft.x + 10, farLeft.y + 13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#563d71'; ctx.beginPath(); ctx.moveTo(nearLeft.x, nearLeft.y); ctx.lineTo(nearBottomLeft.x, nearBottomLeft.y); ctx.lineTo(farBottomLeft.x, farBottomLeft.y); ctx.lineTo(farLeft.x, farLeft.y); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(nearRight.x, nearRight.y); ctx.lineTo(farRight.x, farRight.y); ctx.lineTo(farBottomRight.x, farBottomRight.y); ctx.lineTo(nearBottomRight.x, nearBottomRight.y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = segment.hue % 2 ? '#7665ff' : '#6658e9'; ctx.beginPath(); ctx.moveTo(nearLeft.x, nearLeft.y); ctx.lineTo(nearRight.x, nearRight.y); ctx.lineTo(farRight.x, farRight.y); ctx.lineTo(farLeft.x, farLeft.y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ff4770'; ctx.lineWidth = Math.max(2, 4 * nearLeft.scale); ctx.beginPath(); ctx.moveTo(nearLeft.x, nearLeft.y); ctx.lineTo(farLeft.x, farLeft.y); ctx.moveTo(nearRight.x, nearRight.y); ctx.lineTo(farRight.x, farRight.y); ctx.stroke();
  if (segment.hue % 2 === 0) { const markZ = segment.z + 3.5; const markRoad = segmentAt(markZ); const mark = project(markRoad.center, slopeHeight(markZ) + .02, markZ); ctx.fillStyle = 'rgba(255,255,255,.32)'; ctx.fillRect(mark.x - 2 * mark.scale, mark.y, 4 * mark.scale, 16 * mark.scale); }
}
function drawObstacle(obstacle) {
  const base = project(obstacle.x, slopeHeight(obstacle.z), obstacle.z); const top = project(obstacle.x, slopeHeight(obstacle.z) + obstacle.height, obstacle.z); const width = obstacle.width * 34 * base.scale;
  ctx.fillStyle = '#9f164d'; ctx.fillRect(base.x - width / 2 + 7 * base.scale, top.y + 7 * base.scale, width, base.y - top.y);
  ctx.fillStyle = '#ff355f'; ctx.fillRect(base.x - width / 2, top.y, width, base.y - top.y);
  ctx.fillStyle = '#ff9ab0'; ctx.fillRect(base.x - width / 2 + 4 * base.scale, top.y + 5 * base.scale, width * .35, 4 * base.scale);
}
function drawBall() {
  const point = project(player.x, slopeHeight(player.z) + .72, player.z); const radius = 19 * point.scale;
  ctx.fillStyle = 'rgba(38,19,57,.3)'; ctx.beginPath(); ctx.ellipse(point.x, point.y + radius * 1.1, radius * 1.45, radius * .35, 0, 0, Math.PI * 2); ctx.fill();
  const ballGradient = ctx.createRadialGradient(point.x - radius * .4, point.y - radius * .5, radius * .15, point.x, point.y, radius * 1.2); ballGradient.addColorStop(0, '#fff0f4'); ballGradient.addColorStop(.18, '#ffb0bd'); ballGradient.addColorStop(.62, '#ff4770'); ballGradient.addColorStop(1, '#bc164f'); ctx.fillStyle = ballGradient; ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a204e'; ctx.lineWidth = Math.max(2, 3 * point.scale); ctx.stroke();
}
function render() {
  drawBackground();
  drawGround();
  segments.filter(segment => segment.z > player.z - 8 && segment.z < player.z + 185).sort((a, b) => b.z - a.z).forEach(drawRoad);
  obstacles.filter(obstacle => obstacle.z > player.z - 4 && obstacle.z < player.z + 100).sort((a, b) => b.z - a.z).forEach(drawObstacle);
  drawBall();
}
function setKey(key, value, button) { input[key] = value; if (button) button.classList.toggle('is-held', value); }
const keyMap = { a: 'left', ArrowLeft: 'left', d: 'right', ArrowRight: 'right' };
window.addEventListener('keydown', event => { const key = keyMap[event.key] || keyMap[event.key.toLowerCase()]; if (key) { event.preventDefault(); if (!started) startRun(); setKey(key, true); } });
window.addEventListener('keyup', event => { const key = keyMap[event.key] || keyMap[event.key.toLowerCase()]; if (key) { event.preventDefault(); setKey(key, false); } });
document.querySelector('#slopeStartButton').addEventListener('click', startRun);
document.querySelectorAll('[data-slope-key]').forEach(button => { const key = button.dataset.slopeKey; button.addEventListener('pointerdown', event => { event.preventDefault(); if (!started) startRun(); button.setPointerCapture(event.pointerId); setKey(key, true, button); }); button.addEventListener('pointerup', () => setKey(key, false, button)); button.addEventListener('pointercancel', () => setKey(key, false, button)); });
document.querySelector('#slopeAgain').addEventListener('click', reset); reset();
requestAnimationFrame(function loop(now) { const dt = Math.min((now - last) / 1000, .04); last = now; update(dt); render(); requestAnimationFrame(loop); });
