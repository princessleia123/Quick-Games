const savedCart = JSON.parse(localStorage.getItem('snackShackCart') || '{}');
const items = Object.values(savedCart);
const money = (value) => `$${value.toFixed(2)}`;
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
document.getElementById('summaryItems').textContent = items.length ? items.map(item => `${item.quantity}× ${item.name}`).join(', ') : 'No snacks selected';
document.getElementById('summaryTotal').textContent = money(total);
document.getElementById('orderForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  document.getElementById('successMessage').textContent = `Thanks, ${form.get('studentName')}! Your order will be ready at lunch. We’ll look for you from room ${form.get('roomNumber')}.`;
  document.getElementById('successTotal').textContent = money(total);
  document.getElementById('orderSuccess').hidden = false;
  localStorage.removeItem('snackShackCart');
});
