/**
 * scene.js — Création de la scène et du renderer WebGL.
 * Responsable de : Scene, brouillard atmosphérique, WebGLRenderer configuré
 * pour un rendu PBR réaliste (tone mapping ACES, sRGB, ombres douces).
 */
import * as THREE from 'three';

/** Crée la scène avec un ciel de crépuscule et du brouillard de profondeur. */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1220);
  // Brouillard exponentiel : donne la profondeur et masque les bords de la halle.
  scene.fog = new THREE.FogExp2(0x0a1526, 0.018);
  return scene;
}

/**
 * Crée le renderer WebGL.
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lowPerf  true sur mobile/faible GPU -> réglages allégés.
 */
export function createRenderer(canvas, lowPerf = false) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPerf,
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPerf ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !lowPerf;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

/** Détection grossière d'un appareil peu puissant (mobile). */
export function isLowPerfDevice() {
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
  const smallMem = (navigator.deviceMemory || 8) <= 4;
  return mobile || (fewCores && smallMem);
}
