/* Price Drop: sound effects generated with the Web Audio API, so there are no files to load */
(function () {
  'use strict';

  window.PD = window.PD || {};
  let ac = null;
  let on = true;

  // Browsers only allow audio after a user gesture, so this runs on the first tap
  function unlock() {
    if (!ac) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) ac = new Ctx();
    }
    if (ac && ac.state === 'suspended') ac.resume();
  }

  function tone(freq, dur, type, vol, slide, at) {
    if (!on || !ac) return;
    const t = ac.currentTime + (at || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    gain.gain.setValueAtTime(vol || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function buzz(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* not supported */ }
  }

  const go = () => tone(440, 0.08, 'triangle', 0.1);

  function result(diff) {
    if (diff <= 0.25) {
      tone(880, 0.1, 'square', 0.08);
      tone(1318.5, 0.2, 'square', 0.08, 0, 0.08);
      buzz(30);
    } else if (diff <= 1.5) tone(784, 0.15);
    else if (diff <= 5) tone(587.33, 0.15);
    else tone(200, 0.25, 'sawtooth', 0.1, 0.5);
  }

  function fanfare() {
    tone(659.25, 0.14);
    tone(880, 0.14, 'triangle', 0.15, 0, 0.13);
    tone(1046.5, 0.3, 'triangle', 0.15, 0, 0.26);
  }

  const btn = document.getElementById('sound');
  btn.addEventListener('click', () => {
    unlock();
    on = !on;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
  });

  PD.audio = { unlock, go, result, fanfare };
})();
