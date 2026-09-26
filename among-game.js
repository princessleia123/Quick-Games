const canvas = document.querySelector('#amongGame');
const ctx = canvas.getContext('2d');
const startScreen = document.querySelector('#startScreen');
const playScreen = document.querySelector('#playScreen');
const toast = document.querySelector('#toast');
const taskProgress = document.querySelector('#taskProgress');
const roomLabel = document.querySelector('#roomLabel');
const roleBadge = document.querySelector('#roleBadge');
const roleText = document.querySelector('#roleText');
const killAction = document.querySelector('#killAction');
const input = { up: false, down: false, left: false, right: false };
const player = { x: 6, y: 8, speed: 4.1, color: '#4d9cff', name: 'Blue' };
const mapView = { cell: 20, x: 60, y: 36 };
const shipMap = Array.from({ length: 26 }, () => Array(42).fill('#'));
const rooms = [
  { name: 'CAFETERIA', x: 2, y: 2, w: 10, h: 6 },
  { name: 'MEDBAY', x: 14, y: 2, w: 8, h: 6 },
  { name: 'SECURITY', x: 25, y: 2, w: 7, h: 6 },
  { name: 'NAVIGATION', x: 34, y: 2, w: 7, h: 6 },
  { name: 'ARMORY', x: 14, y: 10, w: 8, h: 5 },
  { name: 'LAB', x: 25, y: 10, w: 7, h: 5 },
  { name: 'ELECTRICAL', x: 2, y: 17, w: 9, h: 6 },
  { name: 'STORAGE', x: 14, y: 17, w: 8, h: 6 },
  { name: 'ENGINE', x: 25, y: 17, w: 7, h: 6 },
  { name: 'COMMS', x: 34, y: 17, w: 7, h: 6 }
];
const tasks = [
  { name: 'Upload scan data', x: 18, y: 4, done: false },
  { name: 'Check medbay sample', x: 16, y: 5, done: false },
  { name: 'Route nav signal', x: 37, y: 5, done: false },
  { name: 'Sort storage crates', x: 17, y: 20, done: false },
  { name: 'Calibrate reactor', x: 28, y: 20, done: false },
  { name: 'Reroute comms', x: 37, y: 20, done: false }
];
const clues = [
  { name: 'Door access log', x: 10, y: 11, text: '', found: false },
  { name: 'Damaged panel', x: 8, y: 20, text: '', found: false },
  { name: 'Camera buffer', x: 29, y: 5, text: '', found: false },
  { name: 'Dropped access chip', x: 37, y: 11, text: '', found: false },
  { name: 'Rewritten route card', x: 20, y: 20, text: '', found: false }
];
const crew = [
  { name: 'Red', x: 6, y: 4, color: '#f04f59', badge: 'amber', build: 'tall', ink: 'red', lastRoom: 'Cafeteria', imposter: false, dead: false, waypoints: [[6, 4], [10, 10], [8, 16], [17, 13]], waypoint: 0 },
  { name: 'Yellow', x: 18, y: 4, color: '#f5d34b', badge: 'silver', build: 'slim', ink: 'yellow', lastRoom: 'Medbay', imposter: false, dead: false, waypoints: [[18, 4], [23, 10], [19, 15], [17, 19]], waypoint: 0 },
  { name: 'Green', x: 28, y: 4, color: '#66c878', badge: 'violet', build: 'short', ink: 'green', lastRoom: 'Security', imposter: false, dead: false, waypoints: [[28, 4], [28, 10], [33, 15], [28, 19]], waypoint: 0 },
  { name: 'Pink', x: 37, y: 4, color: '#ff9dcc', badge: 'copper', build: 'broad', ink: 'pink', lastRoom: 'Navigation', imposter: false, dead: false, waypoints: [[37, 4], [36, 10], [32, 15], [37, 19]], waypoint: 0 },
  { name: 'Cyan', x: 6, y: 20, color: '#61e6e8', badge: 'blue', build: 'slim', ink: 'cyan', lastRoom: 'Electrical', imposter: false, dead: false, waypoints: [[6, 20], [12, 15], [17, 13], [8, 10]], waypoint: 0 },
  { name: 'Orange', x: 18, y: 20, color: '#f39b46', badge: 'white', build: 'broad', ink: 'orange', lastRoom: 'Storage', imposter: false, dead: false, waypoints: [[18, 20], [22, 15], [28, 10], [25, 20]], waypoint: 0 },
  { name: 'Purple', x: 28, y: 20, color: '#b084ef', badge: 'green', build: 'tall', ink: 'purple', lastRoom: 'Engine', imposter: false, dead: false, waypoints: [[28, 20], [32, 15], [28, 10], [22, 13]], waypoint: 0 },
  { name: 'White', x: 37, y: 20, color: '#e8edf2', badge: 'black', build: 'short', ink: 'white', lastRoom: 'Comms', imposter: false, dead: false, waypoints: [[37, 20], [34, 15], [38, 10], [28, 13]], waypoint: 0 }
];
let playerImposter = false;
let imposterIndex = 0;
let taskCount = 0;
let killCount = 0;
let running = false;
let won = false;
let lastTime = performance.now();
let toastTimer = 0;
let visionRadius = 180;
let wrongAccusations = 0;

function carveRect(x, y, w, h) { for (let row = y; row < y + h; row += 1) for (let col = x; col < x + w; col += 1) shipMap[row][col] = '.'; }
rooms.forEach(room => carveRect(room.x, room.y, room.w, room.h));
carveRect(5, 8, 34, 9);
carveRect(6, 6, 2, 4);
carveRect(17, 6, 2, 4);
carveRect(28, 6, 2, 4);
carveRect(36, 6, 2, 4);

function worldToScreen(x, y) { return { x: mapView.x + x * mapView.cell, y: mapView.y + y * mapView.cell }; }
function say(message, seconds = 2.5) { toast.textContent = message; toastTimer = seconds; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function isWall(x, y) { const col = Math.floor(x); const row = Math.floor(y); return row < 0 || row >= shipMap.length || col < 0 || col >= shipMap[0].length || shipMap[row][col] === '#'; }
function currentRoom() { return rooms.find(room => player.x > room.x && player.x < room.x + room.w && player.y > room.y && player.y < room.y + room.h)?.name || 'CORRIDOR'; }
function refreshCluePanel() { const found = clues.filter(item => item.found).length; document.querySelector('#clueProgress').textContent = `${found} / ${clues.length} clues found`; document.querySelector('#clueList').innerHTML = clues.filter(item => item.found).map(item => `• ${item.name}`).join('<br>'); }
function updateTasks() { taskCount = tasks.filter(task => task.done).length; taskProgress.textContent = `${taskCount} / ${tasks.length} complete`; document.querySelectorAll('.task-line').forEach((line, index) => line.classList.toggle('done', !!tasks[index]?.done)); }
function nearTask() { return tasks.find(task => !task.done && distance(player, task) < 1.2); }
function nearClue() { return clues.find(clue => !clue.found && distance(player, clue) < 1.2); }
function nearCrew() { return crew.find(person => !person.dead && distance(player, person) < 1.25); }
function assignRoles() {
  const round = Number(localStorage.getItem('quickGamesAmongRound') || 0);
  const roleSlot = (round * 7 + Math.floor(Math.random() * (crew.length + 1))) % (crew.length + 1);
  localStorage.setItem('quickGamesAmongRound', String(round + 1));
  playerImposter = roleSlot === 0;
  imposterIndex = playerImposter ? -1 : roleSlot - 1;
  crew.forEach((person, index) => { person.imposter = !playerImposter && index === imposterIndex; });
  const suspect = playerImposter ? crew[0] : crew[imposterIndex];
  const decoy = crew.find(person => person !== suspect);
  clues[0].text = `The reader logged a ${suspect.badge} stripe entering the central hall. The name field is missing and the clock is 90 seconds slow.`;
  clues[1].text = `A damaged panel has a faint ${suspect.ink} fleck in the sealant. The lighting makes the color hard to trust.`;
  clues[2].text = `A camera buffer shows a ${suspect.build} silhouette leaving ${suspect.lastRoom}. The visor glare hides the face.`;
  clues[3].text = `An access chip was dropped near Navigation. Its outer casing matches the ${suspect.badge} issue batch, but several crew received one.`;
  clues[4].text = `A route card was rewritten in ${decoy.ink} ink. The handwriting is too smudged to identify the author.`;
  roleText.textContent = playerImposter ? 'IMPOSTOR' : 'INNOCENT';
  roleText.style.color = playerImposter ? '#ff5b6e' : '#7be6c2';
  killAction.hidden = !playerImposter;
  roleBadge.classList.toggle('is-impostor', playerImposter);
}
function winGame(message) { won = true; const earned = typeof quickplayAward === 'function' ? quickplayAward(130 + taskCount * 30 + clues.filter(item => item.found).length * 20 + killCount * 35) : 0; say(`${message} +${earned} points.`, 99); }
function useAction() {
  if (won) return;
  const task = nearTask();
  if (task) { task.done = true; updateTasks(); say(playerImposter ? `${task.name} faked.` : `${task.name} complete.`); return; }
  if (playerImposter) { say('You are the impostor. Move close to a crewmate and use K.'); return; }
  const clue = nearClue();
  if (clue) { clue.found = true; const found = clues.filter(item => item.found).length; refreshCluePanel(); say(clue.text, 4); if (found === clues.length) say('The evidence forms a pattern, but one route card may be a decoy.', 5); return; }
  const person = nearCrew();
  if (person) {
    const evidenceFound = clues.filter(item => item.found).length;
    if (person.imposter) {
      if (taskCount < 4 || evidenceFound < 4) { say(`Not enough to accuse yet. Finish 4 tasks and compare 4 clues.`); }
      else winGame(`IMPOSTOR ${person.name} FOUND.`);
    } else {
      wrongAccusations += 1;
      say(`${person.name} does not match the full evidence trail. ${wrongAccusations > 1 ? 'The crew is getting suspicious.' : 'Keep comparing the details.'}`);
    }
    return;
  }
  say('Move closer to a clue, task, or crewmate.');
}
function eliminateAction() {
  if (!playerImposter) { say('Only the impostor can eliminate crewmates.'); return; }
  const person = nearCrew();
  if (!person) { say('Move close to a crewmate first.'); return; }
  person.dead = true; killCount += 1; say(`${person.name} eliminated. Stay hidden.`);
  if (killCount >= 3) winGame('YOU WIN AS THE IMPOSTOR.');
}
function reportAction() { const body = crew.find(person => person.dead && distance(player, person) < 1.5); say(body ? 'Body reported. Look for the impostor.' : 'No body nearby.'); }
function toggleMap() { const map = document.querySelector('#mapOverlay'); map.hidden = !map.hidden; }
function chooseNextWaypoint(person) { person.waypoint = (person.waypoint + 1) % person.waypoints.length; }
function moveCrew(person, dt) { if (person.dead) return; const target = { x: person.waypoints[person.waypoint][0], y: person.waypoints[person.waypoint][1] }; const dx = target.x - person.x; const dy = target.y - person.y; const len = Math.hypot(dx, dy); if (len < .12) { chooseNextWaypoint(person); return; } const step = Math.min(len, .65 * dt); person.x += dx / len * step; person.y += dy / len * step; }
function physics(dt) {
  if (!running || won) return;
  const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0); const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0); const length = Math.hypot(dx, dy) || 1;
  const stepX = dx / length * player.speed * dt; const stepY = dy / length * player.speed * dt; const nextX = player.x + stepX; const nextY = player.y + stepY;
  if (!isWall(nextX, player.y)) player.x = nextX;
  if (!isWall(player.x, nextY)) player.y = nextY;
  crew.forEach(person => moveCrew(person, dt));
}
function drawMapBase() {
  ctx.fillStyle = '#020304'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const mapWidth = shipMap[0].length * mapView.cell;
  const mapHeight = shipMap.length * mapView.cell;
  ctx.fillStyle = '#0b0e14'; ctx.fillRect(mapView.x - 12, mapView.y - 12, mapWidth + 24, mapHeight + 24);
  for (let row = 0; row < shipMap.length; row += 1) for (let col = 0; col < shipMap[row].length; col += 1) { const x = mapView.x + col * mapView.cell; const y = mapView.y + row * mapView.cell; if (shipMap[row][col] === '#') { ctx.fillStyle = '#050609'; ctx.fillRect(x, y, mapView.cell, mapView.cell); ctx.strokeStyle = '#4b5668'; ctx.strokeRect(x + .5, y + .5, mapView.cell - 1, mapView.cell - 1); } else { ctx.fillStyle = (row + col) % 2 ? '#212a38' : '#1b2431'; ctx.fillRect(x, y, mapView.cell, mapView.cell); ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.strokeRect(x + .5, y + .5, mapView.cell - 1, mapView.cell - 1); } }
  rooms.forEach(room => { const p = worldToScreen(room.x, room.y); ctx.fillStyle = '#c7d2e3'; ctx.font = '900 11px Arial'; ctx.fillText(room.name, p.x + 8, p.y + 18); });
  drawFurniture();
}
function drawFurniture() {
  const p = worldToScreen;
  ctx.fillStyle = '#46546a'; ctx.strokeStyle = '#080a0e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(p(6, 4.5).x, p(6, 4.5).y, 52, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  [[4.2,4.5],[7.8,4.5],[6,3.2],[6,5.8]].forEach(([x,y]) => { ctx.fillStyle = '#77859a'; ctx.beginPath(); ctx.arc(p(x,y).x,p(x,y).y,7,0,Math.PI*2); ctx.fill(); });
  [[14.4,3.2],[17.3,3.2],[14.4,5.1],[17.3,5.1]].forEach(([x,y]) => { ctx.fillStyle = '#8493a8'; ctx.fillRect(p(x,y).x-15,p(x,y).y-8,30,16); ctx.fillStyle = '#b9c6d8'; ctx.fillRect(p(x,y).x-13,p(x,y).y-6,10,12); });
  ctx.fillStyle = '#64758b'; for (let i=0;i<3;i+=1) ctx.fillRect(p(26+i*1.5,3.2).x,p(26+i*1.5,3.2).y,24,16);
  ctx.fillStyle = '#9b693e'; [[3.2,18.5],[4.8,20],[7.4,18.8],[8.2,21]].forEach(([x,y])=>ctx.fillRect(p(x,y).x-8,p(x,y).y-8,16,16));
  ctx.fillStyle = '#5d6b80'; for (let i=0;i<4;i+=1) ctx.fillRect(p(15+i*1.4,18.7).x,p(15+i*1.4,18.7).y,25,14);
  ctx.fillStyle = '#b44d5d'; ctx.beginPath(); ctx.arc(p(28,20.4).x,p(28,20.4).y,22,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#e89091'; ctx.beginPath(); ctx.arc(p(28,20.4).x,p(28,20.4).y,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#51637d'; [[15.5,11.5],[18.5,11.5],[26.5,11.5],[29.5,11.5],[35.5,11.4],[38.5,11.4],[35.5,20.2],[38.5,20.2]].forEach(([x,y])=>ctx.fillRect(p(x,y).x-10,p(x,y).y-7,20,14));
  [[4.5,7.2],[15.5,7.2],[28,7.2],[37,7.2],[4.5,16.7],[15.5,16.7],[28,16.7],[37,16.7]].forEach(([x,y])=>{ctx.fillStyle='#050609';ctx.beginPath();ctx.arc(p(x,y).x,p(x,y).y,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9aa8bb';ctx.stroke();});
}
function drawMarker(item, symbol, color) { const point = worldToScreen(item.x, item.y); ctx.fillStyle = color; ctx.strokeStyle = '#06070a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(point.x, point.y, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#101216'; ctx.font = '900 14px Arial'; ctx.textAlign = 'center'; ctx.fillText(symbol, point.x, point.y + 5); ctx.textAlign = 'left'; }
function drawCrewmate(person) { if (person.dead) { const point = worldToScreen(person.x, person.y); ctx.strokeStyle='#ef476f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(point.x-12,point.y-12);ctx.lineTo(point.x+12,point.y+12);ctx.moveTo(point.x+12,point.y-12);ctx.lineTo(point.x-12,point.y+12);ctx.stroke();return; } const point = worldToScreen(person.x, person.y); ctx.fillStyle = person.color; ctx.strokeStyle = '#050609'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(point.x, point.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#b7f4fa'; ctx.beginPath(); ctx.ellipse(point.x + 5, point.y - 4, 8, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle='#fff';ctx.font='900 10px Arial';ctx.textAlign='center';ctx.fillText(person.name,point.x,point.y-18);ctx.textAlign='left'; }
function drawPlayer() { const point = worldToScreen(player.x, player.y); ctx.fillStyle='rgba(0,0,0,.86)';ctx.beginPath();ctx.arc(point.x,point.y,24,0,Math.PI*2);ctx.fill();ctx.fillStyle=player.color;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(point.x,point.y,14,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(point.x+5,point.y-5,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 10px Arial';ctx.textAlign='center';ctx.fillText('YOU',point.x,point.y-21);ctx.textAlign='left'; }
function drawVision() { const point = worldToScreen(player.x, player.y); const mapWidth = shipMap[0].length * mapView.cell; const mapHeight = shipMap.length * mapView.cell; const shade = ctx.createRadialGradient(point.x,point.y,35,point.x,point.y,visionRadius); shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(.58,'rgba(0,0,0,.18)');shade.addColorStop(1,'rgba(0,0,0,.8)');ctx.fillStyle=shade;ctx.fillRect(mapView.x-12,mapView.y-12,mapWidth+24,mapHeight+24);ctx.strokeStyle='rgba(255,255,255,.2)';ctx.setLineDash([6,8]);ctx.beginPath();ctx.arc(point.x,point.y,visionRadius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]); }
function drawActionHint() { const active = playerImposter && nearCrew() ? 'K  ELIMINATE' : nearClue() ? 'E  INVESTIGATE CLUE' : nearTask() ? 'E  USE TASK' : nearCrew() ? 'E  INVESTIGATE' : ''; if (!active || won) return; ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(canvas.width/2-105,canvas.height-62,210,30);ctx.fillStyle='#fff';ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillText(active,canvas.width/2,canvas.height-42);ctx.textAlign='left'; }
function render() { drawMapBase(); tasks.filter(task => !task.done).forEach(task => drawMarker(task,'!','#f8db54')); clues.filter(clue => !clue.found && distance(player, clue) < 7).forEach(clue => drawMarker(clue,'?','#ff9dcc')); crew.forEach(drawCrewmate); drawVision(); drawPlayer(); drawActionHint(); roomLabel.textContent = `${currentRoom()} · MAP VIEW`; if (won) { ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=playerImposter?'#ff5b6e':'#7be6c2';ctx.textAlign='center';ctx.font='900 42px Arial';ctx.fillText(playerImposter?'YOU WIN AS IMPOSTOR':'IMPOSTOR FOUND',canvas.width/2,canvas.height/2-12);ctx.fillStyle='#fff';ctx.font='16px Arial';ctx.fillText('The Quickship round is over.',canvas.width/2,canvas.height/2+24);ctx.textAlign='left';} }
function start() {
  player.name = document.querySelector('#playerName').value.trim() || 'Blue';
  visionRadius = typeof quickplayUse === 'function' && quickplayUse('wideLens') ? 245 : 180;
  const scannerUsed = typeof quickplayUse === 'function' && quickplayUse('clueScanner');
  const permitUsed = typeof quickplayUse === 'function' && quickplayUse('taskPermit');
  if (scannerUsed) { clues[0].found = true; refreshCluePanel(); }
  if (permitUsed) { tasks[0].done = true; updateTasks(); }
  startScreen.hidden=true; playScreen.hidden=false; running=true; lastTime=performance.now();
  const bonusMessage = scannerUsed && permitUsed ? 'Scanner decoded one clue and a task permit cleared one task.' : scannerUsed ? 'Scanner decoded one partial clue. Compare the rest carefully.' : permitUsed ? 'Task permit cleared one task. The rest still needs doing.' : '';
  say(bonusMessage || (playerImposter ? 'You are the impostor. Eliminate three crewmates.' : 'Find six tasks, compare four clues, and identify the impostor.'), 4);
  requestAnimationFrame(loop);
}
function reset() { location.reload(); }
function inviteFriends() { const copied = navigator.clipboard?.writeText(location.href); if (copied) copied.then(() => say('Invite link copied.')).catch(() => say('Copy this page link to invite friends.')); else say('Copy this page link to invite friends.'); }
function loop(now) { const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;physics(dt);if(toastTimer>0)toastTimer-=dt;else if(!won)toast.textContent=playerImposter?'Eliminate three crewmates without being caught.':'Finish four tasks, compare the clues, and watch the crew.';render();requestAnimationFrame(loop); }

const keys = { w:'up',s:'down',a:'left',ArrowUp:'up',ArrowDown:'down',d:'right',ArrowRight:'right',ArrowLeft:'left' };
window.addEventListener('keydown',event=>{const key=keys[event.key]||keys[event.key.toLowerCase()];if(key){event.preventDefault();input[key]=true;}if(event.key.toLowerCase()==='e'||event.code==='Space'){event.preventDefault();useAction();}if(event.key.toLowerCase()==='k'){event.preventDefault();eliminateAction();}if(event.key.toLowerCase()==='r')reportAction();if(event.key==='Tab'||event.key.toLowerCase()==='m'){event.preventDefault();toggleMap();}});
window.addEventListener('keyup',event=>{const key=keys[event.key]||keys[event.key.toLowerCase()];if(key){event.preventDefault();input[key]=false;}});
document.querySelectorAll('[data-move]').forEach(button=>{const key=button.dataset.move;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);input[key]=true;});button.addEventListener('pointerup',()=>{input[key]=false;});button.addEventListener('pointercancel',()=>{input[key]=false;});});
document.querySelector('#startGame').addEventListener('click',start);document.querySelector('#playerName').addEventListener('keydown',event=>{if(event.key==='Enter')start();});document.querySelector('#restartGame').addEventListener('click',reset);document.querySelector('#useAction').addEventListener('click',useAction);document.querySelector('#reportAction').addEventListener('click',reportAction);document.querySelector('#killAction').addEventListener('click',eliminateAction);document.querySelector('#mapAction').addEventListener('click',toggleMap);document.querySelector('#closeMap').addEventListener('click',toggleMap);document.querySelector('#inviteButton').addEventListener('click',inviteFriends);document.querySelector('#inviteInGame').addEventListener('click',inviteFriends);
const taskPanel=document.querySelector('.task-panel');const cluePanel=document.createElement('div');cluePanel.style.cssText='border-top:1px solid #3b465b;margin-top:12px;padding-top:10px;color:#f8db54;font-size:10px;line-height:1.45';cluePanel.innerHTML='<strong style="letter-spacing:.14em">EVIDENCE</strong><div id="clueProgress">0 / 3 clues found</div><div id="clueList" style="color:#aab6c8;margin-top:6px"></div>';taskPanel.append(cluePanel);
assignRoles();refreshCluePanel();updateTasks();start();
