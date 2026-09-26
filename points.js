const QUICKPLAY_POINTS_KEY = 'quickplayPoints';
const QUICKPLAY_PURCHASES_KEY = 'quickplayPurchases';
const quickplayStorage = (() => { try { const storage = window.localStorage; const probe = '__quickplay_probe__'; storage.setItem(probe, '1'); storage.removeItem(probe); return storage; } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} }; } })();
function quickplayGetPoints() { return Number(quickplayStorage.getItem(QUICKPLAY_POINTS_KEY) || 0); }
function quickplaySetPoints(value) { quickplayStorage.setItem(QUICKPLAY_POINTS_KEY, String(Math.max(0, Math.floor(value)))); }
function quickplayGetPurchases() { try { return JSON.parse(quickplayStorage.getItem(QUICKPLAY_PURCHASES_KEY) || '{}'); } catch { return {}; } }
function quickplaySavePurchases(value) { quickplayStorage.setItem(QUICKPLAY_PURCHASES_KEY, JSON.stringify(value)); }
function quickplayAward(basePoints) { const purchases = quickplayGetPurchases(); const multiplier = Number(purchases.scoreChip || 0) > 0 ? 2 : 1; if (multiplier === 2) { purchases.scoreChip -= 1; quickplaySavePurchases(purchases); } const earned = Math.max(0, Math.round(basePoints * multiplier)); quickplaySetPoints(quickplayGetPoints() + earned); return earned; }
function quickplayBuy(itemId, cost) { const purchases = quickplayGetPurchases(); if (quickplayGetPoints() < cost) return false; quickplaySetPoints(quickplayGetPoints() - cost); purchases[itemId] = Number(purchases[itemId] || 0) + 1; quickplaySavePurchases(purchases); return true; }
function quickplayUse(itemId) { const purchases = quickplayGetPurchases(); if (!purchases[itemId]) return false; purchases[itemId] -= 1; quickplaySavePurchases(purchases); return true; }
window.quickplayGetPoints = quickplayGetPoints; window.quickplayGetPurchases = quickplayGetPurchases; window.quickplayAward = quickplayAward; window.quickplayBuy = quickplayBuy; window.quickplayUse = quickplayUse;
function quickGamesApplyBranding() {
  const replace = value => value.replace(/QuickPlay GX/g, 'Quick Games').replace(/QUICKPLAY GX/g, 'QUICK GAMES').replace(/QuickPlay/g, 'Quick Games').replace(/QUICKPLAY/g, 'QUICK GAMES');
  document.title = replace(document.title);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) node.nodeValue = replace(node.nodeValue);
  document.querySelectorAll('[aria-label],[title]').forEach(element => { if (element.hasAttribute('aria-label')) element.setAttribute('aria-label', replace(element.getAttribute('aria-label'))); if (element.hasAttribute('title')) element.setAttribute('title', replace(element.getAttribute('title'))); });
  document.querySelectorAll('.qp-mark,.shop-mark,.roblox-brand').forEach(element => { element.textContent = 'QG'; });
  document.querySelectorAll('.version,.shop-bottom').forEach(element => { element.innerHTML = 'QG<br>2.0'; });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', quickGamesApplyBranding); else quickGamesApplyBranding();
