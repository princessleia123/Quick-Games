const randomButton = document.querySelector('#randomButton');
const games = ['hole.html', 'among.html', 'ovo.html?v=5', 'slope.html'];
if (randomButton) randomButton.addEventListener('click', () => { window.location.href = games[Math.floor(Math.random() * games.length)]; });
const pointsBalance = document.querySelector('#pointsBalance');
if (pointsBalance && typeof quickplayGetPoints === 'function') pointsBalance.textContent = quickplayGetPoints();
const gameCount = document.querySelector('.arcade-section .count');
if (gameCount) gameCount.textContent = '04 AVAILABLE';
const ovoLink = document.querySelector('a[href="ovo.html"]');
if (ovoLink) ovoLink.href = 'ovo.html?v=5';
