/**
 * animations.js — Animations cinématiques via GSAP (chargé en global : window.gsap).
 *  - playIntro : ouverture des portes + travelling de la caméra vers l'intérieur
 *  - focusOn   : la caméra vole vers une zone quand on clique dessus
 *  - resetView : retour à la vue d'ensemble
 */
import * as THREE from 'three';
import { OVERVIEW_POS, OVERVIEW_TARGET } from './camera.js';

const gsap = window.gsap;

/**
 * Séquence d'ouverture : portes coulissantes + entrée de la caméra.
 * @returns {Promise<void>} résolue à la fin de la cinématique.
 */
export function playIntro(camera, controls, doors, onDone) {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        controls.enabled = true;
        controls.target.copy(OVERVIEW_TARGET);
        onDone && onDone();
        resolve();
      },
    });

    // 1) Les portes coulissent
    doors.leaves.forEach((leaf) => {
      tl.to(leaf.position, { x: leaf.userData.openX, duration: 1.6, ease: 'power3.inOut' }, 0.3);
    });

    // 2) La caméra avance lentement dans la halle
    const camProxy = { t: 0 };
    const startPos = camera.position.clone();
    const startTarget = new THREE.Vector3(0, 3, 18);
    tl.to(camProxy, {
      t: 1, duration: 3.4, ease: 'power2.inOut',
      onUpdate: () => {
        camera.position.lerpVectors(startPos, OVERVIEW_POS, easeInOut(camProxy.t));
        const tgt = new THREE.Vector3().lerpVectors(startTarget, OVERVIEW_TARGET, easeInOut(camProxy.t));
        camera.lookAt(tgt);
      },
    }, 0.8);
  });
}

/**
 * Vol de caméra vers une zone (déclenché au clic sur un hotspot).
 * @param {THREE.Vector3[]} camDef  [posArray, targetArray] depuis zones.js
 */
export function focusOn(camera, controls, camPos, camTarget) {
  controls.enabled = false;
  const target = controls.target.clone();
  gsap.to(camera.position, {
    x: camPos[0], y: camPos[1], z: camPos[2],
    duration: 1.4, ease: 'power3.inOut',
    onComplete: () => { controls.enabled = true; },
  });
  gsap.to(target, {
    x: camTarget[0], y: camTarget[1], z: camTarget[2],
    duration: 1.4, ease: 'power3.inOut',
    onUpdate: () => { controls.target.copy(target); },
  });
}

/** Retour à la vue d'ensemble de la halle. */
export function resetView(camera, controls) {
  focusOn(camera, controls,
    [OVERVIEW_POS.x, OVERVIEW_POS.y, OVERVIEW_POS.z],
    [OVERVIEW_TARGET.x, OVERVIEW_TARGET.y, OVERVIEW_TARGET.z]);
}

/** Petit "pop" de mise en valeur d'un objet (scale bounce). */
export function pulse(object3d) {
  gsap.fromTo(object3d.scale,
    { x: 1, y: 1, z: 1 },
    { x: 1.12, y: 1.12, z: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
}

function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
