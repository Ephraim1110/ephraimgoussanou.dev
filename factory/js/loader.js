/**
 * loader.js — Chargement de modèles 3D (GLB/GLTF) avec compression Draco.
 *
 * La scène par défaut est construite de façon PROCÉDURALE (factory.js), donc
 * aucun modèle externe n'est requis pour que l'expérience fonctionne.
 * Ce module fournit l'infrastructure pour brancher facilement vos propres
 * modèles .glb : déposez-les dans /factory/assets/models/ puis appelez
 * `loadModel('assets/models/robot.glb')`.
 */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Décodeur Draco servi par le CDN Google (versionné, mis en cache).
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

let _gltfLoader = null;

/** Instancie (une seule fois) le GLTFLoader équipé du décodeur Draco. */
export function getLoader() {
  if (_gltfLoader) return _gltfLoader;
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_DECODER_PATH);
  draco.setDecoderConfig({ type: 'js' }); // fallback JS si WASM indisponible
  _gltfLoader = new GLTFLoader();
  _gltfLoader.setDRACOLoader(draco);
  return _gltfLoader;
}

/**
 * Charge un modèle GLB/GLTF (avec Draco si le fichier est compressé).
 * @param {string} url  chemin relatif, ex. 'assets/models/robot.glb'
 * @param {(p:number)=>void} [onProgress] 0..1
 * @returns {Promise<import('three').Group>} le scène-graphe du modèle
 */
export function loadModel(url, onProgress) {
  const loader = getLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        gltf.scene.traverse((o) => {
          if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
        });
        resolve(gltf.scene);
      },
      (evt) => {
        if (onProgress && evt.total) onProgress(evt.loaded / evt.total);
      },
      (err) => reject(err)
    );
  });
}
