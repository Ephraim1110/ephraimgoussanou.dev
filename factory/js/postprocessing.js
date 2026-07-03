/**
 * postprocessing.js — Pipeline de post-traitement léger.
 * RenderPass -> UnrealBloomPass (halo lumineux sur les émissifs) -> OutputPass.
 * Le SSAO est volontairement désactivé par défaut pour préserver les
 * performances (surtout mobile). Il peut être ajouté facilement (voir en bas).
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * @returns {{composer:EffectComposer, bloom:UnrealBloomPass, setSize:(w,h)=>void}}
 */
export function createComposer(renderer, scene, camera, lowPerf = false) {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, lowPerf ? 1.5 : 2));
  composer.setSize(window.innerWidth, window.innerHeight);

  composer.addPass(new RenderPass(scene, camera));

  // Bloom : donne l'aspect "haut de gamme" aux LED, écrans et néons.
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    lowPerf ? 0.5 : 0.75, // strength
    0.7,                  // radius
    0.85                  // threshold (n'affecte que les zones lumineuses)
  );
  composer.addPass(bloom);

  composer.addPass(new OutputPass());

  function setSize(w, h) {
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }

  return { composer, bloom, setSize };
}

/*
 * Pour activer le SSAO (occlusion ambiante) si les performances le permettent :
 *
 *   import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
 *   const ssao = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
 *   ssao.kernelRadius = 8; ssao.minDistance = 0.002; ssao.maxDistance = 0.1;
 *   composer.insertPass(ssao, 1); // juste après le RenderPass
 */
