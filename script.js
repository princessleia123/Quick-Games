const menu = [
  { id: 'granola', name: 'Granola crunch cup', description: 'Yogurt, granola + berries', price: 2.5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85' },
  { id: 'pretzel', name: 'Soft pretzel', description: 'Warm, salted + served with cheese dip', price: 2, image: 'https://bigoven-res.cloudinary.com/image/upload/f_auto,q_auto/t_recipe-1280/soft-pretzels-41bd39.jpg' },
  { id: 'fruit', name: 'Fresh fruit cup', description: 'A colorful mix of the good stuff', price: 2.5, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=700&q=85' },
  { id: 'chips', name: 'Chips + salsa', description: 'Crunchy tortilla chips with red salsa', price: 1.5, image: 'https://images.unsplash.com/photo-1734027899096-291063588ab3?auto=format&fit=crop&w=700&q=85' },
  { id: 'trailmix', name: 'Trail mix pouch', description: 'Nuts, raisins + a little sweetness', price: 2, image: 'https://images.unsplash.com/photo-1593834767296-3e910c808120?auto=format&fit=crop&w=700&q=85' },
  { id: 'cookie', name: 'Big chocolate chip cookie', description: 'Baked this morning', price: 1.5, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=85' }
];
const cart = {};
const $ = (id) => document.getElementById(id);
const money = (value) => `$${value.toFixed(2)}`;

function renderMenu() {
  $('menuGrid').innerHTML = menu.map(item => `<article class="menu-card"><div class="food-art"><img src="${item.image}" alt="${item.name}" loading="lazy" /></div><div class="menu-card-body"><h3>${item.name}</h3><p>${item.description}</p><div class="menu-bottom"><span class="price">${money(item.price)}</span><button class="add-button" type="button" data-add="${item.id}">Add to cart</button></div></div></article>`).join('');
}
function renderCart() {
  const entries = Object.values(cart);
  const count = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('cartCount').textContent = count;
  $('cartEmpty').hidden = entries.length > 0;
  $('cartFooter').hidden = entries.length === 0;
  $('cartTotal').textContent = money(total);
  $('cartItems').innerHTML = entries.map(item => `<div class="cart-item"><div><h3>${item.name}</h3><p>${money(item.price)} each</p><div class="cart-item-actions"><button class="qty-button" type="button" data-change="${item.id}" data-amount="-1" aria-label="Remove one ${item.name}">−</button><span>${item.quantity}</span><button class="qty-button" type="button" data-change="${item.id}" data-amount="1" aria-label="Add one ${item.name}">+</button><button class="remove-button" type="button" data-remove="${item.id}">Remove</button></div></div><span class="cart-item-total">${money(item.price * item.quantity)}</span></div>`).join('');
}
function openCart() { $('cartOverlay').hidden = false; $('cartPanel').classList.add('open'); $('cartPanel').setAttribute('aria-hidden', 'false'); }
function closeCart() { $('cartPanel').classList.remove('open'); $('cartPanel').setAttribute('aria-hidden', 'true'); setTimeout(() => { $('cartOverlay').hidden = true; }, 250); }
function addItem(id, amount = 1) { const item = menu.find(entry => entry.id === id); if (!item) return; cart[id] = cart[id] || { ...item, quantity: 0 }; cart[id].quantity += amount; if (cart[id].quantity <= 0) delete cart[id]; renderCart(); }

document.addEventListener('click', (event) => {
  const add = event.target.closest('[data-add]'); if (add) { addItem(add.dataset.add); openCart(); }
  const change = event.target.closest('[data-change]'); if (change) addItem(change.dataset.change, Number(change.dataset.amount));
  const remove = event.target.closest('[data-remove]'); if (remove) { delete cart[remove.dataset.remove]; renderCart(); }
});
$('cartButton').addEventListener('click', openCart); $('closeCart').addEventListener('click', closeCart); $('cartOverlay').addEventListener('click', closeCart);
$('checkoutButton').addEventListener('click', () => { if (!Object.keys(cart).length) return; localStorage.setItem('snackShackCart', JSON.stringify(cart)); window.location.href = 'order.html'; });
function closeSuccess() { $('orderSuccess').hidden = true; Object.keys(cart).forEach(key => delete cart[key]); renderCart(); }
$('closeSuccess').addEventListener('click', closeSuccess); $('doneButton').addEventListener('click', closeSuccess);
renderMenu(); renderCart();
