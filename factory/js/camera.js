/**
 * camera.js — Caméra perspective + OrbitControls.
 * La caméra démarre à l'extérieur de l'usine (crépuscule) ; l'animation
 * cinématique (animations.js) la fait pénétrer dans le bâtiment.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** Position de départ de la caméra, à l'extérieur devant les portes. */
export const START_POS = new THREE.Vector3(0, 6, 46);
/** Cible de départ (les portes). */
export const START_TARGET = new THREE.Vector3(0, 3, 18);
/** Position "vue d'ensemble" une fois à l'intérieur (z < 18 = dans la halle). */
export const OVERVIEW_POS = new THREE.Vector3(0, 8.5, 13);
export const OVERVIEW_TARGET = new THREE.Vector3(0, 2.5, -12);

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    400
  );
  camera.position.copy(START_POS);
  camera.lookAt(START_TARGET);
  return camera;
}

/**
 * OrbitControls avec limites pour rester dans la halle.
 * Désactivés pendant l'intro, activés à la fin de la cinématique.
 */
export function createControls(camera, dom) {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.copy(OVERVIEW_TARGET);
  controls.minDistance = 4;
  controls.maxDistance = 60;
  controls.maxPolarAngle = Math.PI * 0.495; // ne pas passer sous le sol
  controls.minPolarAngle = Math.PI * 0.12;
  controls.enablePan = true;
  controls.panSpeed = 0.6;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.8;
  controls.enabled = false; // activé après l'intro
  // Bornes horizontales de déplacement (évite de sortir de la halle)
  controls.addEventListener('change', () => {
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -22, 22);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -34, 20);
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0, 10);
  });
  return controls;
}
