const vendingMachine = document.querySelector('#machine');

if (vendingMachine) {
  vendingMachine.classList.add('vending-mode');

  const glass = vendingMachine.querySelector('.glass');
  glass.innerHTML = `
    <div class="vend-header">SELECT A PRIZE</div>
    <div class="vend-shelves">
      <button class="vend-item teddy" data-prize="TEDDY" type="button">TEDDY</button>
      <button class="vend-item koala" data-prize="KOALA" type="button">KOALA</button>
      <button class="vend-item elephant" data-prize="ELEPHANT" type="button">ELEPHANT</button>
      <button class="vend-item bunny" data-prize="BUNNY" type="button">BUNNY</button>
      <button class="vend-item cub" data-prize="BEAR CUB" type="button">BEAR CUB</button>
      <button class="vend-item pig" data-prize="PIG" type="button">PIG</button>
    </div>
    <div class="vend-tray">COLLECTION TRAY</div>`;

  const controls = vendingMachine.querySelector('.machine-controls');
  controls.innerHTML = `
    <div class="vend-credit"><span>YOUR POINTS</span><strong id="vendPoints">0</strong></div>
    <div class="vend-selected" id="vendSelected">SELECT A PRIZE</div>
    <button class="vend-dispenser" id="vendButton" type="button" disabled>
      <span class="dispenser-light"></span>
      TOUCH TO DISPENSE
    </button>`;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="vend-congrats" id="vendCongrats" role="status" aria-live="polite" aria-hidden="true">
      <div class="congrats-panel">
        <span class="congrats-stars">★　★　★</span>
        <strong>CONGRATS!</strong>
        <span>YOU HAVE EARNED</span>
        <div class="earned-plush teddy" id="earnedPlush" aria-label="Won plush prize"></div>
        <b id="earnedPrize">A PRIZE</b>
        <small>COLLECT IT BELOW</small>
      </div>
    </div>`);

  let selected = '';
  let celebrationTimer;

  const coinCount = () => Number(document.querySelector('#coinCount')?.textContent || 0);
  const update = () => {
    const points = document.querySelector('#vendPoints');
    const button = document.querySelector('#vendButton');
    if (points) points.textContent = coinCount();
    if (button) button.disabled = !selected || coinCount() < 1;
  };

  const showCongrats = (prize) => {
    const screen = document.querySelector('#vendCongrats');
    const earnedPrize = document.querySelector('#earnedPrize');
    const earnedPlush = document.querySelector('#earnedPlush');
    if (!screen || !earnedPrize || !earnedPlush) return;

    earnedPrize.textContent = prize;
    const plushClass = {
      TEDDY: 'teddy',
      KOALA: 'koala',
      ELEPHANT: 'elephant',
      BUNNY: 'bunny',
      'BEAR CUB': 'cub',
      PIG: 'pig',
    }[prize] || 'teddy';
    earnedPlush.className = `earned-plush ${plushClass}`;
    screen.classList.add('show');
    screen.setAttribute('aria-hidden', 'false');
    clearTimeout(celebrationTimer);
    celebrationTimer = setTimeout(() => {
      screen.classList.remove('show');
      screen.setAttribute('aria-hidden', 'true');
    }, 5000);
  };

  vendingMachine.querySelectorAll('.vend-item').forEach((item) => {
    item.addEventListener('click', () => {
      vendingMachine.querySelectorAll('.vend-item').forEach((option) => option.classList.remove('chosen'));
      item.classList.add('chosen');
      selected = item.dataset.prize;
      document.querySelector('#vendSelected').textContent = selected;
      update();
    });
  });

  document.querySelector('#vendButton').addEventListener('click', () => {
    if (!selected || coinCount() < 1) return;

    const saved = JSON.parse(localStorage.getItem('coinquest-state') || '{}');
    saved.coins = Math.max(0, Number(saved.coins || 0) - 1);
    saved.vendingPrizes = Array.isArray(saved.vendingPrizes) ? saved.vendingPrizes : [];
    saved.vendingPrizes.push(selected);
    localStorage.setItem('coinquest-state', JSON.stringify(saved));

    const visiblePoints = document.querySelector('#coinCount');
    if (visiblePoints) visiblePoints.textContent = saved.coins;

    const prize = selected;
    vendingMachine.classList.add('dispensing');
    document.querySelector('#vendButton').disabled = true;
    document.querySelector('#vendSelected').textContent = `${prize} DISPENSING`;
    showCongrats(prize);

    setTimeout(() => {
      vendingMachine.classList.remove('dispensing');
      document.querySelector('.vend-tray').textContent = `${prize} COLLECTED`;
      selected = '';
      vendingMachine.querySelectorAll('.vend-item').forEach((option) => option.classList.remove('chosen'));
      document.querySelector('#vendSelected').textContent = 'SELECT A PRIZE';
      update();
    }, 1700);
  });

  const coinElement = document.querySelector('#coinCount');
  if (coinElement) {
    new MutationObserver(update).observe(coinElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  update();
}
