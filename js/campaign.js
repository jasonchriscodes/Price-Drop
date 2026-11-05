/* Price Drop: campaign controls (daily play limit and score sharing) */
(function () {
  'use strict';

  window.PD = window.PD || {};
  const CONFIG = PD.CONFIG;
  const plays = document.querySelectorAll('.plays');
  const resets = document.querySelectorAll('.reset-plays');
  const playBtns = document.querySelectorAll('.play-btn');
  const shareBtn = document.getElementById('share');
  let last = { score: 0, reward: '' };

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, String(val));
    } catch (e) { /* storage unavailable */ }
    return null;
  }

  function todayKey() {
    const d = new Date();
    return CONFIG.bestKey + '.plays.' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function playsLeft() {
    if (!CONFIG.playsPerDay) return Infinity;
    return Math.max(0, CONFIG.playsPerDay - (parseInt(store(todayKey()), 10) || 0));
  }

  function usePlay() {
    const left = playsLeft();
    if (left === Infinity) return true;
    if (left <= 0) return false;
    store(todayKey(), CONFIG.playsPerDay - left + 1);
    return true;
  }

  function render() {
    const left = playsLeft();
    let text = '';
    if (left !== Infinity) {
      text = left > 0
        ? left + (left === 1 ? ' play' : ' plays') + ' left today'
        : 'No plays left today. Come back tomorrow.';
    }
    plays.forEach((p) => { p.textContent = text; });
    playBtns.forEach((b) => { b.disabled = left <= 0; });
    resets.forEach((b) => { b.hidden = left > 0; });
  }

  function share() {
    if (!navigator.share) return;
    navigator.share({
      title: CONFIG.name,
      text: 'I scored ' + last.score + ' on ' + CONFIG.name + ' and unlocked ' + last.reward + '. Can you beat it?',
      url: location.href
    }).catch(() => { /* user cancelled */ });
  }

  resets.forEach((b) => b.addEventListener('click', () => { store(todayKey(), 0); render(); }));
  shareBtn.hidden = !navigator.share;
  shareBtn.addEventListener('click', share);

  PD.campaign = {
    usePlay,
    render,
    setLastScore(score, reward) { last = { score, reward }; }
  };
  render();
})();
