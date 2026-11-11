/*
 * Price Drop: campaign settings.
 * A client can rebrand and retune the game here without touching the game code.
 */
window.PD = window.PD || {};

PD.CONFIG = {
  name: 'Price Drop',
  bestKey: 'pricedrop.best',
  codePrefix: 'DROP',      // voucher codes look like DROP-7K3QXM
  playsPerDay: 5,          // 0 = unlimited

  // Difficulty
  rounds: 3,
  speeds: [38, 55, 75],    // dollars per second, one per round
  startPrice: 99.99,
  targetMin: 10,
  targetMax: 80,

  // Score needed for each reward, highest first (max score is 300)
  tiers: [
    { min: 270, off: '20% off' },
    { min: 200, off: '15% off' },
    { min: 120, off: '10% off' },
    { min: 0, off: '5% off' }
  ],

  // Brand colours, applied to the CSS variables in css/style.css
  theme: {
    'paper': '#efe6d0',
    'paper-deep': '#ddd0ae',
    'ink': '#15120e',
    'red': '#ff3b1d',
    'hi': '#ffe500',
    'green': '#0d7a4f'
  }
};

(function applyTheme() {
  const root = document.documentElement.style;
  Object.keys(PD.CONFIG.theme).forEach((k) => root.setProperty('--' + k, PD.CONFIG.theme[k]));
})();
