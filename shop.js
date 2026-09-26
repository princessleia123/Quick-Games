const balanceEls = [document.querySelector('#shopPoints'), document.querySelector('#heroPoints')];
const message = document.querySelector('#shopMessage');
const items = { neonSkin: 'Neon skin', timeChip: 'Time chip', clueScanner: 'Clue scanner', scoreChip: 'Score chip', wideLens: 'Wide lens', taskPermit: 'Task permit' };
function renderShop() { const purchases = quickplayGetPurchases(); const points = quickplayGetPoints(); balanceEls.forEach(element => { if (element) element.textContent = points; }); document.querySelectorAll('[data-item]').forEach(button => { const owned = Number(purchases[button.dataset.item] || 0); button.textContent = owned ? `Owned ×${owned}` : 'Buy'; button.classList.toggle('owned', owned > 0); button.disabled = false; }); }
document.querySelectorAll('[data-item]').forEach(button => { button.addEventListener('click', () => { const item = button.dataset.item; const cost = Number(button.dataset.cost); if (quickplayBuy(item, cost)) { message.textContent = `${items[item]} added to your locker.`; renderShop(); } else { message.textContent = 'Not enough points yet — finish another round.'; } }); });
renderShop();
