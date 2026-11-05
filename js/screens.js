/* Price Drop: start screen, results screen and voucher reward */
(function () {
  'use strict';

  window.PD = window.PD || {};
  const $ = (id) => document.getElementById(id);

  const BEST_KEY = PD.CONFIG.bestKey;
  const CODE_PREFIX = PD.CONFIG.codePrefix;
  const TIERS = PD.CONFIG.tiers;

  const ui = {
    start: $('start'), end: $('end'), play: $('play'), again: $('again'),
    final: $('final-score'), best: $('best'), newBest: $('new-best'),
    reward: $('reward'), code: $('code'), stats: $('stats'), startBest: $('start-best')
  };
  let locked = false;

  function readBest() {
    try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function writeBest(v) {
    try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* storage unavailable */ }
  }

  const tierFor = (score) => TIERS.find((t) => score >= t.min);

  function voucherCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I
    let s = '';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return CODE_PREFIX + '-' + s;
  }

  function play() {
    if (locked) return;
    if (!PD.campaign.usePlay()) { PD.campaign.render(); return; }
    PD.audio.unlock();
    ui.start.hidden = true;
    ui.end.hidden = true;
    PD.game.start();
  }

  function showEnd({ score, stats }) {
    const prev = readBest();
    const isNew = score > prev && score > 0;
    if (isNew) writeBest(score);

    ui.final.textContent = score;
    ui.best.textContent = Math.max(prev, score);
    ui.newBest.hidden = !isNew;
    ui.reward.textContent = tierFor(score).off;
    ui.code.textContent = voucherCode();
    ui.stats.textContent = stats;
    PD.audio.fanfare();
    PD.campaign.setLastScore(score, tierFor(score).off);
    PD.campaign.render();

    // Short pause so a last-moment tap can't skip past the results
    locked = true;
    setTimeout(() => {
      locked = false;
      ui.end.hidden = false;
      ui.again.focus({ preventScroll: true });
    }, 550);
  }

  const overlaysHidden = () => ui.start.hidden && ui.end.hidden;

  ui.play.addEventListener('click', play);
  ui.again.addEventListener('click', play);

  const best = readBest();
  if (best > 0) {
    ui.startBest.textContent = 'Your best: ' + best;
    ui.startBest.hidden = false;
  }

  PD.screens = { showEnd, overlaysHidden };
})();
