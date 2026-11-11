/* Price Drop: core game loop */
(function () {
  'use strict';

  window.PD = window.PD || {};
  const $ = (id) => document.getElementById(id);

  const CONFIG = PD.CONFIG;

  const el = {
    stage: $('stage'), price: $('price'), target: $('target'), band: $('band'),
    pointer: $('pointer'), tag: $('tag'), result: $('result'), stop: $('stop'),
    score: $('score'), round: $('round'), off: $('off'),
    dots: Array.from($('dots').children)
  };
  const fmt = (v) => '$' + v.toFixed(2);

  let price = CONFIG.startPrice;
  let target = 0;
  let round = 0;
  let total = 0;
  let results = [];
  let running = false;
  let rafId = 0;
  let lastT = 0;
  let nextTimer = 0;
  let paused = false;

  function render() {
    el.price.textContent = fmt(Math.max(0, price));
    el.pointer.style.top = (1 - price / 100) * 100 + '%';
  }

  function pickTarget() {
    const v = CONFIG.targetMin + Math.random() * (CONFIG.targetMax - CONFIG.targetMin);
    return Math.round(v * 100) / 100;
  }

  // 100 points for a perfect stop, minus 8 for every dollar off
  function scoreFor(diff) {
    return Math.max(0, Math.round(100 - diff * 8));
  }

  function verdictFor(diff) {
    if (diff <= 0.25) return 'Perfect!';
    if (diff <= 1.5) return 'So close!';
    if (diff <= 5) return 'Nice.';
    return 'Missed it.';
  }

  function start() {
    clearTimeout(nextTimer);
    round = 0;
    total = 0;
    results = [];
    el.score.textContent = '0';
    el.off.textContent = '–';
    nextRound();
  }

  function nextRound() {
    round++;
    target = pickTarget();
    price = CONFIG.startPrice;
    running = true;

    el.target.textContent = fmt(target);
    el.band.style.top = (1 - target / 100) * 100 + '%';
    el.result.textContent = round > 1 ? 'Faster this time.' : '';
    el.stop.disabled = false;
    el.tag.classList.remove('hit');
    el.round.textContent = round + '/' + CONFIG.rounds;
    el.dots.forEach((d, i) => {
      d.className = i < round - 1 ? 'done' : i === round - 1 ? 'now' : '';
    });
    PD.audio.go();

    render();
    lastT = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function tick(t) {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    if (!running) return;
    if (paused) return;
    price -= CONFIG.speeds[round - 1] * dt;
    if (price <= 0) { // time's up: the round is time-bound, so reaching $0 ends it
      price = 0;
      render();
      stop(true);
      return;
    }
    render();
  }

  function stop(timedOut) {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    el.stop.disabled = true;

    price = Math.round(price * 100) / 100;
    render();
    const diff = Math.round(Math.abs(price - target) * 100) / 100;
    const pts = timedOut === true ? 0 : scoreFor(diff);
    total += pts;
    results.push(diff);

    el.score.textContent = total;
    el.off.textContent = fmt(diff);
    el.result.textContent = timedOut === true
      ? "Too slow! It hit $0.00. +0"
      : verdictFor(diff) + ' Stopped at ' + fmt(price) + ', ' + fmt(diff) + ' off. +' + pts;
    void el.tag.offsetWidth; // restart the pop animation
    el.tag.classList.add('hit');
    el.dots[round - 1].className = 'done';
    PD.audio.result(diff);

    if (round < CONFIG.rounds) nextTimer = setTimeout(nextRound, 1500);
    else nextTimer = setTimeout(finish, 1200);
  }

  function finish() {
    const closest = Math.min.apply(null, results);
    PD.screens.showEnd({
      score: total,
      stats: 'Closest stop: ' + fmt(closest) + ' off the target'
    });
  }

  function handleTap() {
    stop();
  }

  function canTap() {
    return PD.screens.overlaysHidden();
  }

  // Tap anywhere in the play area, or press Space / Enter
  el.stage.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    if (e.target.closest('.sound-btn')) return;
    handleTap();
  });
  window.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && canTap()) {
      e.preventDefault();
      handleTap();
    }
  });

  // Pause the falling price when the tab or app goes into the background
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) lastT = performance.now();
  });

  PD.game = { start };
  render();
})();
