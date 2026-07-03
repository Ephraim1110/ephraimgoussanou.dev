# Smart Factory 4.0 — Portfolio immersif 3D

Un portfolio interactif qui simule une **Smart Factory Industrie 4.0** en WebGL.
L'utilisateur arrive devant une usine au crépuscule, les portes s'ouvrent, la
caméra pénètre dans le bâtiment et découvre 8 zones de compétences cliquables.

Construit **uniquement en HTML / CSS / JavaScript (ES6) + Three.js**, sans
framework et sans étape de build → déployable tel quel sur **GitHub Pages**.

## Lancer en local

Les modules ES et le chargement de textures exigent un serveur HTTP (le
protocole `file://` ne suffit pas). Depuis la racine du dépôt :

```bash
python -m http.server 8000
# puis ouvrir http://localhost:8000/factory/
```

## Structure

```
factory/
├── index.html          Point d'entrée (import map Three.js, écran de chargement, HUD, panneaux)
├── css/style.css       Thème industriel (HUD, minimap, panneaux latéraux)
└── js/
    ├── main.js         Orchestrateur : assemble les modules + boucle de rendu
    ├── scene.js        Scène, brouillard, WebGLRenderer (tone mapping ACES, sRGB, ombres)
    ├── camera.js       Caméra perspective + OrbitControls (limités à la halle)
    ├── lighting.js     Éclairage PBR + environnement HDRI (RoomEnvironment → IBL)
    ├── loader.js       GLTFLoader + DRACOLoader (chargement de modèles GLB compressés)
    ├── postprocessing.js  EffectComposer + UnrealBloom (SSAO prêt à activer)
    ├── animations.js   Cinématique GSAP (ouverture des portes, vols de caméra)
    ├── factory.js      Construction PROCÉDURALE de l'usine + animation des 8 zones
    ├── zones.js        Données + contenu bilingue (FR/EN) des 8 zones  ← à éditer
    └── interaction.js  Raycaster (survol/clic), panneaux HTML, minimap
```

## Les 8 zones

| Zone | Contenu 3D |
|------|-----------|
| 🤖 Robotique | Bras robotisé articulé animé + convoyeur |
| ⚙️ Automatisme | Armoires électriques, voyants clignotants, IHM |
| ☁️ MQTT / UNS | Serveur + flux de particules (messages) vers les équipements |
| 📊 Data & Power BI | Grand écran de supervision (dashboard animé) |
| 🧠 IA | Réseau de neurones animé |
| 📁 Projets | Bornes interactives (LP4.0, TCD, E-LEC, Agricible) |
| 👤 À propos | Hologramme avec anneaux d'énergie |
| 📞 Contact | Tablette industrielle |

## Personnaliser

- **Textes / projets / contact** : tout est dans [`js/zones.js`](js/zones.js)
  (bilingue `{ fr, en }`). C'est le seul fichier à éditer pour mettre à jour le contenu.
- **Positions / couleurs des zones** : champs `position`, `camera` et `color` dans `zones.js`.
- **Remplacer une forme procédurale par un vrai modèle GLB** :
  1. Déposez le `.glb` dans `factory/assets/models/`.
  2. Dans `factory.js`, chargez-le via `loadModel('assets/models/robot.glb')`
     (voir [`js/loader.js`](js/loader.js)) et ajoutez-le au groupe de la zone.
  3. Conservez le hotspot cliquable existant.
- **HDRI réel** : par défaut on utilise `RoomEnvironment` (généré à la volée, zéro
  fichier). Pour un vrai `.hdr`, utilisez `RGBELoader` dans `lighting.js`.

## Performances

- Détection automatique des appareils peu puissants (`isLowPerfDevice`) : sur
  mobile, l'antialiasing, les ombres et le pixel ratio sont réduits.
- Bloom activé par défaut ; **SSAO** désactivé (activable — voir le commentaire
  en bas de `postprocessing.js`).

## Dépendances (CDN, aucune installation)

- [Three.js 0.160](https://unpkg.com/three@0.160.0/) via import map
- [GSAP 3.12](https://unpkg.com/gsap@3.12.5/) (UMD global)
- Décodeur Draco : `https://www.gstatic.com/draco/versioned/decoders/1.5.6/`

## Déploiement GitHub Pages

Tout est statique : poussez le dépôt et activez GitHub Pages. L'expérience est
accessible à l'URL `…/factory/`. La page conserve un lien **« Vue classique »**
vers le portfolio HTML d'origine (`../index.html`).
