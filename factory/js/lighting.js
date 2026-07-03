/**
 * lighting.js — Éclairage PBR + environnement HDRI.
 * On utilise RoomEnvironment (généré à la volée par Three.js) via un
 * PMREMGenerator : cela fournit des réflexions/IBL réalistes SANS avoir à
 * héberger un gros fichier .hdr — idéal pour GitHub Pages.
 * Un chargement d'un vrai .hdr reste possible via loadHDRI().
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Installe l'éclairage complet de la scène.
 * @returns {object} références utiles (sun, keyLight, updateable...)
 */
export function setupLighting(scene, renderer, lowPerf = false) {
  // --- Environnement IBL (réflexions PBR) ---
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  // --- Lumière d'ambiance froide (nuit industrielle) ---
  const ambient = new THREE.AmbientLight(0x2a3d5c, 0.6);
  scene.add(ambient);

  // --- Hémisphérique : ciel crépusculaire / sol béton ---
  const hemi = new THREE.HemisphereLight(0x2b4a7a, 0x0a0d12, 0.7);
  scene.add(hemi);

  // --- Soleil couchant : lumière chaude rasante entrant par les portes ---
  const sun = new THREE.DirectionalLight(0xff9d5c, 2.4);
  sun.position.set(6, 20, 60);
  sun.target.position.set(0, 2, -4);
  scene.add(sun.target);
  if (!lowPerf) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 140;
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
  }
  scene.add(sun);

  // --- Lumière d'appoint froide côté fond, pour modeler les volumes ---
  const rim = new THREE.DirectionalLight(0x4ba3ff, 0.8);
  rim.position.set(-18, 14, -40);
  scene.add(rim);

  // --- Néons intérieurs (halogènes de plafond) : PointLights bleutées ---
  const ceilingLights = [];
  const rows = [-24, -12, 0, 12];
  for (const z of rows) {
    for (const x of [-12, 12]) {
      const p = new THREE.PointLight(0x9fd0ff, lowPerf ? 12 : 18, 26, 2);
      p.position.set(x, 8.6, z);
      scene.add(p);
      ceilingLights.push(p);
    }
  }

  pmrem.dispose();
  return { ambient, hemi, sun, rim, ceilingLights, envTex };
}
