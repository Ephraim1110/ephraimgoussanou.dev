/**
 * main.js — Point d'entrée : assemble tous les modules et lance la boucle.
 *
 * Pipeline :
 *   scene/renderer → caméra/controls → lumières (HDRI) → post-traitement
 *   → construction procédurale de l'usine → interaction (raycaster)
 *   → écran de chargement → intro cinématique GSAP → render loop.
 */
import * as THREE from 'three';
import { createScene, createRenderer, isLowPerfDevice } from './scene.js';
import { createCamera, createControls } from './camera.js';
import { setupLighting } from './lighting.js';
import { createComposer } from './postprocessing.js';
import { buildFactory } from './factory.js';
import { setupInteraction } from './interaction.js';
import { playIntro } from './animations.js';

const lowPerf = isLowPerfDevice();

// --- Socle 3D ---
const canvas = document.getElementById('scene');
const scene = createScene();
const renderer = createRenderer(canvas, lowPerf);
const camera = createCamera();
const controls = createControls(camera, canvas);
setupLighting(scene, renderer, lowPerf);
const post = createComposer(renderer, scene, camera, lowPerf);

// --- Usine procédurale + interactions ---
const factory = buildFactory(scene);
const interaction = setupInteraction({ renderer, camera, controls, factory });

// =====================================================================
//  Écran de chargement (progression simulée le temps de tout initialiser)
// =====================================================================
const loaderEl = document.getElementById('loader');
const fillEl = document.getElementById('loaderFill');
const statusEl = document.getElementById('loaderStatus');
const enterBtn = document.getElementById('enterBtn');

const steps = [
  'Chargement de la scène…',
  'Mise sous tension des machines…',
  'Connexion au broker MQTT…',
  'Synchronisation du jumeau numérique…',
  'Usine prête.',
];
let p = 0, si = 0;
const progTimer = setInterval(() => {
  p = Math.min(1, p + 0.03 + Math.random() * 0.05);
  fillEl.style.width = (p * 100).toFixed(0) + '%';
  const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
  if (idx !== si) { si = idx; statusEl.textContent = steps[idx]; }
  if (p >= 1) { clearInterval(progTimer); enterBtn.disabled = false; }
}, 120);

// =====================================================================
//  Entrée dans l'usine → cinématique
// =====================================================================
let introDone = false;
enterBtn.addEventListener('click', async () => {
  if (enterBtn.disabled) return;
  loaderEl.classList.add('hidden');
  document.getElementById('hud').classList.add('visible');
  document.getElementById('hud').setAttribute('aria-hidden', 'false');
  await playIntro(camera, controls, factory.doors, () => { introDone = true; });
  // masque l'indice au bout de quelques secondes
  setTimeout(() => document.getElementById('hudHint')?.classList.add('dim'), 6000);
});

// =====================================================================
//  Boucle de rendu
// =====================================================================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  factory.update(t, dt);
  if (introDone) { controls.update(); interaction.updateHover(); }
  post.composer.render();
}
animate();

// =====================================================================
//  Redimensionnement responsive
// =====================================================================
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  post.setSize(w, h);
});

// =====================================================================
//  Langue FR / EN (HUD)
// =====================================================================
function setLang(l) {
  document.documentElement.lang = l;
  document.querySelectorAll('[data-en]').forEach((el) => {
    if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
    el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.fr;
  });
  document.querySelectorAll('[data-en-title]').forEach((el) => {
    if (el.dataset.frTitle === undefined) el.dataset.frTitle = el.title;
    el.title = l === 'en' ? el.dataset.enTitle : el.dataset.frTitle;
  });
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('active', b.dataset.lang === l));
  interaction.setLang(l);
  try { localStorage.setItem('factoryLang', l); } catch (e) {}
}
document.querySelectorAll('.lang button').forEach((b) =>
  b.addEventListener('click', () => setLang(b.dataset.lang)));
let savedLang = 'fr';
try { savedLang = localStorage.getItem('factoryLang') || (navigator.language || 'fr').slice(0, 2); } catch (e) {}
setLang(savedLang === 'en' ? 'en' : 'fr');

// =====================================================================
//  Son d'ambiance optionnel (généré via WebAudio, aucun fichier requis)
// =====================================================================
let audioCtx = null, ambientNodes = null;
const soundBtn = document.getElementById('soundBtn');
soundBtn.addEventListener('click', () => {
  const on = soundBtn.classList.toggle('on');
  soundBtn.setAttribute('aria-pressed', on);
  if (on) startAmbient(); else stopAmbient();
});
function startAmbient() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const master = audioCtx.createGain();
  master.gain.value = 0.06;
  master.connect(audioCtx.destination);
  // deux oscillateurs graves = ronronnement d'usine
  const nodes = [];
  [55, 82.5].forEach((f) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = f;
    const g = audioCtx.createGain(); g.gain.value = 0.5;
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
    osc.connect(lp).connect(g).connect(master); osc.start();
    nodes.push(osc);
  });
  // souffle léger (bruit filtré)
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const noise = audioCtx.createBufferSource(); noise.buffer = buf; noise.loop = true;
  const nf = audioCtx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 600; nf.Q.value = 0.7;
  const ng = audioCtx.createGain(); ng.gain.value = 0.15;
  noise.connect(nf).connect(ng).connect(master); noise.start();
  nodes.push(noise);
  ambientNodes = { master, nodes };
}
function stopAmbient() {
  if (!ambientNodes) return;
  ambientNodes.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
  ambientNodes.master.disconnect();
  ambientNodes = null;
}

// Expose pour debug console
window.__factory = { scene, camera, factory, interaction };
