/**
 * factory.js — Construction PROCÉDURALE de la Smart Factory.
 *
 * Tout est généré avec des primitives Three.js (aucun modèle externe requis)
 * pour un rendu immédiat sur GitHub Pages. Chaque zone expose un "hotspot"
 * cliquable (mesh avec userData.zoneId) capté par le raycaster (interaction.js).
 *
 * Pour remplacer une zone par un vrai modèle GLB, chargez-le via loader.js et
 * ajoutez-le au groupe de la zone, puis conservez le hotspot pour le clic.
 *
 * L'objet renvoyé expose update(elapsed, dt) qui anime robots, particules,
 * écrans (CanvasTexture), réseaux de neurones, hologramme, voyants, etc.
 */
import * as THREE from 'three';
import { ZONES } from './zones.js';

// Dimensions de la halle
const HALL = { w: 44, d: 68, h: 10, z0: 18 /* mur avant / portes */ };

export function buildFactory(scene) {
  const root = new THREE.Group();
  root.name = 'factory';
  scene.add(root);

  const updaters = [];          // fonctions d'animation par frame
  const hotspots = [];          // meshes cliquables
  const labelSprites = [];      // étiquettes flottantes des zones
  const zoneGroups = {};        // groupes par id de zone

  buildShell(root);
  const doors = buildDoors(root, updaters);
  buildFloorGrid(root);
  buildExterior(root, updaters);

  // Construit chaque zone à partir des données + de son builder dédié
  const builders = {
    robotics: buildRobotics,
    automation: buildAutomation,
    mqtt: buildMQTT,
    data: buildData,
    ai: buildAI,
    projects: buildProjects,
    about: buildAbout,
    contact: buildContact,
  };

  for (const zone of ZONES) {
    const g = new THREE.Group();
    g.position.set(zone.position[0], 0, zone.position[2]);
    root.add(g);
    zoneGroups[zone.id] = g;

    const color = new THREE.Color(zone.color);
    (builders[zone.id] || (() => {}))(g, color, updaters);

    // Socle lumineux commun à toutes les zones
    addZonePad(g, color, updaters);
    // Hotspot invisible englobant (cible du raycaster)
    const hs = addHotspot(g, zone.id);
    hotspots.push(hs);
    // Étiquette flottante
    const label = makeLabelSprite(zone.label.fr, color);
    label.position.set(0, 5.2, 0);
    label.userData.zoneId = zone.id;
    g.add(label);
    labelSprites.push(label);
  }

  /** Boucle d'animation globale de l'usine. */
  function update(elapsed, dt) {
    for (const fn of updaters) fn(elapsed, dt);
    // Léger flottement des étiquettes
    for (const s of labelSprites) {
      s.position.y = 5.2 + Math.sin(elapsed * 1.5 + s.position.x) * 0.12;
    }
  }

  return { root, doors, hotspots, labelSprites, zoneGroups, update, HALL };
}

/* =====================================================================
   STRUCTURE DE LA HALLE
   ===================================================================== */

function buildShell(root) {
  const { w, d, h, z0 } = HALL;

  // Sol béton PBR
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x141a24, roughness: 0.82, metalness: 0.15,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w + 30, d + 30), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = z0 - d / 2;
  floor.receiveShadow = true;
  root.add(floor);

  // Matériau des murs/plafond
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0e1622, roughness: 0.9, metalness: 0.2, side: THREE.DoubleSide,
  });

  // Mur du fond
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  back.position.set(0, h / 2, z0 - d);
  back.receiveShadow = true;
  root.add(back);

  // Murs latéraux
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat);
    side.rotation.y = sx * Math.PI / 2;
    side.position.set(sx * w / 2, h / 2, z0 - d / 2);
    side.receiveShadow = true;
    root.add(side);
    // Bandeau LED horizontal sur chaque mur
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(d, 0.12, 0.12),
      emissiveMat(0x2f6bd8, 1.2)
    );
    strip.position.set(sx * (w / 2 - 0.1), 6.4, z0 - d / 2);
    root.add(strip);
  }

  // Plafond
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), wallMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, h, z0 - d / 2);
  root.add(ceil);

  // Poutres + luminaires de plafond
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x1a2432, roughness: 0.6, metalness: 0.6 });
  for (let i = 0; i < 7; i++) {
    const z = z0 - 4 - i * 9;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, 0.5), beamMat);
    beam.position.set(0, h - 0.3, z);
    root.add(beam);
    for (const x of [-12, 0, 12]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 1.1), emissiveMat(0xbfe0ff, 2.2));
      panel.position.set(x, h - 0.5, z);
      root.add(panel);
    }
  }

  // Mur avant (avec l'ouverture des portes) : deux panneaux latéraux
  const frontMat = new THREE.MeshStandardMaterial({ color: 0x0c131e, roughness: 0.85, metalness: 0.25 });
  for (const sx of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(w / 2 - 5, h, 0.6), frontMat);
    panel.position.set(sx * (w / 4 + 2.5), h / 2, z0);
    panel.castShadow = true;
    root.add(panel);
  }
  // Linteau au-dessus des portes
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 0.8), frontMat);
  lintel.position.set(0, h - 1, z0);
  root.add(lintel);
  // Enseigne lumineuse
  const sign = makeLabelSprite('SMART FACTORY 4.0', new THREE.Color(0x39d7ff), 2.4);
  sign.position.set(0, h - 1, z0 + 0.6);
  root.add(sign);
}

/** Deux portes coulissantes motorisées (animées à l'intro). */
function buildDoors(root, updaters) {
  const group = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x1b2a3d, roughness: 0.35, metalness: 0.85,
    emissive: 0x0a1a2e, emissiveIntensity: 0.4,
  });
  const leaves = [];
  for (const sx of [-1, 1]) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 0.5), doorMat);
    leaf.position.set(sx * 3, 4, HALL.z0);
    leaf.castShadow = true;
    // bandes lumineuses verticales
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.15, 7, 0.55), emissiveMat(0x39d7ff, 1.6));
    line.position.set(sx * 5, 0, 0);
    leaf.add(line);
    leaf.userData.closedX = sx * 3;
    leaf.userData.openX = sx * 9.2;
    group.add(leaf);
    leaves.push(leaf);
  }
  root.add(group);
  return { group, leaves };
}

/** Grille lumineuse au sol pour l'ambiance techno. */
function buildFloorGrid(root) {
  const grid = new THREE.GridHelper(HALL.d + 20, 40, 0x2b6cd6, 0x16324f);
  grid.position.set(0, 0.02, HALL.z0 - HALL.d / 2);
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  root.add(grid);
}

/** Sol extérieur + halo de crépuscule devant l'usine. */
function buildExterior(root, updaters) {
  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 40),
    new THREE.MeshStandardMaterial({ color: 0x0b0f16, roughness: 1 })
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(0, 0.005, HALL.z0 + 20);
  apron.receiveShadow = true;
  root.add(apron);

  // Lampadaires
  for (const x of [-16, 16]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 9), new THREE.MeshStandardMaterial({ color: 0x223, metalness: 0.7, roughness: 0.4 }));
    pole.position.set(x, 4.5, HALL.z0 + 16);
    root.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), emissiveMat(0xffce8a, 2.4));
    head.position.set(x, 9, HALL.z0 + 16);
    root.add(head);
    const lamp = new THREE.PointLight(0xffce8a, 22, 30, 2);
    lamp.position.copy(head.position);
    root.add(lamp);
  }
}

/* =====================================================================
   HELPERS COMMUNS
   ===================================================================== */

function emissiveMat(color, intensity = 1) {
  return new THREE.MeshStandardMaterial({
    color: 0x000000, emissive: color, emissiveIntensity: intensity,
    roughness: 0.4, metalness: 0.1,
  });
}
function metalMat(color, rough = 0.4, metal = 0.85) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

/** Socle circulaire lumineux sous chaque zone + point-light d'accent. */
function addZonePad(g, color, updaters) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.4, 3.0, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  g.add(ring);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.03;
  g.add(disc);

  const light = new THREE.PointLight(color, 6, 14, 2);
  light.position.set(0, 3.2, 0);
  g.add(light);

  updaters.push((t) => {
    const p = 0.5 + Math.sin(t * 2 + g.position.x) * 0.18;
    ring.material.opacity = p;
    light.intensity = 5 + Math.sin(t * 2 + g.position.x) * 2;
  });
}

/** Cylindre invisible = cible de clic généreuse pour la zone. */
function addHotspot(g, zoneId) {
  const hs = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 6, 16, 1, true),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hs.position.y = 3;
  hs.userData.zoneId = zoneId;
  g.add(hs);
  return hs;
}

/** Étiquette texte flottante via CanvasTexture -> Sprite. */
function makeLabelSprite(text, color, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  const hex = '#' + color.getHexString();
  ctx.font = '600 54px "Space Grotesk", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = hex; ctx.shadowBlur = 24;
  ctx.fillStyle = hex;
  ctx.fillText(text, 256, 64);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(4.4 * scale, 1.1 * scale, 1);
  sprite.userData.isLabel = true;
  return sprite;
}

/** Petit écran animé (CanvasTexture) : dashboard, borne, tablette. */
function makeScreen(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = Math.round(512 * h / w);
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.userData.redraw = (t) => { draw(ctx, canvas.width, canvas.height, t); tex.needsUpdate = true; };
  return mesh;
}

/* =====================================================================
   ZONE 01 — ROBOTIQUE : bras articulé + convoyeur
   ===================================================================== */
function buildRobotics(g, color, updaters) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.6, 24), metalMat(0x2a3646));
  base.position.y = 0.3; base.castShadow = true; g.add(base);

  const j0 = new THREE.Group(); j0.position.y = 0.6; g.add(j0);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.7, 20), metalMat(0xff7a3d, 0.5, 0.6));
  shoulder.rotation.z = Math.PI / 2; shoulder.castShadow = true; j0.add(shoulder);

  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 0.5), metalMat(0x39424f));
  upper.position.y = 1.5; upper.castShadow = true; j0.add(upper);

  const j1 = new THREE.Group(); j1.position.y = 3; j0.add(j1);
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 20), metalMat(0xff7a3d, 0.5, 0.6));
  elbow.rotation.z = Math.PI / 2; j1.add(elbow);
  const fore = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.4), metalMat(0x39424f));
  fore.position.y = 1.2; fore.castShadow = true; j1.add(fore);

  const j2 = new THREE.Group(); j2.position.y = 2.4; j1.add(j2);
  const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), metalMat(0x1a2230));
  gripper.add(fingerAt(-0.22), fingerAt(0.22));
  j2.add(gripper);
  const tip = new THREE.PointLight(color, 3, 5, 2); tip.position.y = 0.4; j2.add(tip);

  function fingerAt(x) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.3), metalMat(0xff7a3d, 0.4, 0.7));
    f.position.set(x, 0.4, 0); return f;
  }

  // Convoyeur + caisses défilantes
  const belt = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 6), metalMat(0x11161f, 0.9, 0.3));
  belt.position.set(2.4, 0.4, 0); g.add(belt);
  const boxes = [];
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), metalMat(0x2b3a4d, 0.7, 0.3));
    b.position.set(2.4, 0.85, -3 + i * 1.6); b.castShadow = true; g.add(b); boxes.push(b);
  }

  updaters.push((t) => {
    j0.rotation.y = Math.sin(t * 0.7) * 0.9;
    j1.rotation.x = Math.sin(t * 0.9) * 0.5 - 0.3;
    j2.rotation.x = Math.sin(t * 1.1) * 0.4;
    for (const b of boxes) { b.position.z += 0.02; if (b.position.z > 3) b.position.z = -3; }
  });
}

/* =====================================================================
   ZONE 02 — AUTOMATISME : armoires électriques + voyants + IHM
   ===================================================================== */
function buildAutomation(g, color, updaters) {
  const cabMat = metalMat(0x28313d, 0.5, 0.7);
  const leds = [];
  for (let c = 0; c < 3; c++) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 1), cabMat);
    cab.position.set(-1.8 + c * 1.8, 1.6, -0.4); cab.castShadow = true; g.add(cab);
    // porte
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3, 0.06), metalMat(0x323d4b, 0.35, 0.8));
    door.position.set(-1.8 + c * 1.8, 1.6, 0.13); g.add(door);
    // rangée de voyants
    for (let i = 0; i < 5; i++) {
      const col = [0x57e6a9, 0xffb648, 0xff5b5b][i % 3];
      const led = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), emissiveMat(col, 2));
      led.position.set(-2.3 + c * 1.8, 2.6 - i * 0.28, 0.17);
      led.userData.base = 2; led.userData.phase = Math.random() * 6;
      g.add(led); leds.push(led);
    }
  }
  // IHM (petit écran) sur pied
  const hmi = makeScreen(1.3, 0.9, drawHMI);
  hmi.position.set(2.1, 1.7, 0.2); hmi.rotation.y = -0.4; g.add(hmi);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.7), metalMat(0x222b36));
  stand.position.set(2.1, 0.85, 0.2); g.add(stand);
  updaters.push((t) => {
    for (const l of leds) l.material.emissiveIntensity = 1 + Math.abs(Math.sin(t * 3 + l.userData.phase)) * 2.4;
    if (Math.floor(t * 3) % 2 === 0) hmi.userData.redraw(t);
  });
}
function drawHMI(ctx, w, h, t) {
  ctx.fillStyle = '#08131f'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(57,215,255,.25)'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.fillStyle = '#39d7ff'; ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.fillText('LIGNE // AUTO', 20, 34);
  // barres process
  for (let i = 0; i < 4; i++) {
    const v = 0.3 + Math.abs(Math.sin(t * 1.5 + i)) * 0.65;
    ctx.fillStyle = '#12324a'; ctx.fillRect(20, 56 + i * 40, w - 60, 22);
    ctx.fillStyle = ['#57e6a9', '#39d7ff', '#ffb648', '#a98bff'][i];
    ctx.fillRect(20, 56 + i * 40, (w - 60) * v, 22);
  }
  ctx.fillStyle = '#57e6a9'; ctx.font = '600 16px "IBM Plex Mono", monospace';
  ctx.fillText('● RUN', w - 90, 34);
}

/* =====================================================================
   ZONE 03 — MQTT / UNIFIED NAMESPACE : serveur + flux de particules
   ===================================================================== */
function buildMQTT(g, color, updaters) {
  // Baie serveur centrale
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.4, 1.4), metalMat(0x1c2632, 0.5, 0.7));
  rack.position.y = 1.7; rack.castShadow = true; g.add(rack);
  const rackLeds = [];
  for (let i = 0; i < 10; i++) {
    const u = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.05), emissiveMat(0x57e6a9, 1.4));
    u.position.set(0, 0.3 + i * 0.3, 0.72); g.add(u); rackLeds.push(u);
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), emissiveMat(color, 1.8));
  core.position.y = 4.1; g.add(core);
  const halo = new THREE.PointLight(color, 6, 10, 2); halo.position.y = 4.1; g.add(halo);

  // Noeuds satellites (les autres équipements) autour du serveur
  const nodes = [];
  const N = 6;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const nx = Math.cos(a) * 6, nz = Math.sin(a) * 6;
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), emissiveMat(0x39d7ff, 1.4));
    node.position.set(nx, 1.6, nz); g.add(node); nodes.push(node);
  }

  // Flux de particules serveur <-> noeuds (les "messages")
  const perLine = 10;
  const count = N * perLine;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: 0.16, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  g.add(pts);
  const src = new THREE.Vector3(0, 4.1, 0);

  updaters.push((t, dt) => {
    core.rotation.y += dt * 0.6; core.rotation.x += dt * 0.3;
    for (const rl of rackLeds) rl.material.emissiveIntensity = 1 + Math.abs(Math.sin(t * 4 + rl.position.y)) * 1.3;
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const nd = nodes[i].position;
      nodes[i].rotation.y += dt;
      for (let k = 0; k < perLine; k++) {
        // paramètre le long du trajet, va-et-vient
        let f = ((t * 0.5 + i * 0.3 + k / perLine)) % 1;
        const p = idx * 3;
        pos[p] = src.x + (nd.x - src.x) * f;
        pos[p + 1] = src.y + (nd.y - src.y) * f + Math.sin(f * Math.PI) * 0.6;
        pos[p + 2] = src.z + (nd.z - src.z) * f;
        idx++;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });
}

/* =====================================================================
   ZONE 04 — DATA & POWER BI : grand écran de supervision
   ===================================================================== */
function buildData(g, color, updaters) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.2, 0.2), metalMat(0x0c141d, 0.5, 0.6));
  frame.position.set(0, 3, -0.6); g.add(frame);
  const screen = makeScreen(5, 2.8, drawDashboard);
  screen.position.set(0, 3, -0.49); g.add(screen);
  const glow = new THREE.PointLight(color, 5, 12, 2); glow.position.set(0, 3, 1.5); g.add(glow);
  // pieds
  for (const x of [-2, 2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4), metalMat(0x222b36));
    leg.position.set(x, 0.7, -0.6); g.add(leg);
  }
  updaters.push((t) => { if (Math.floor(t * 4) % 2 === 0) screen.userData.redraw(t); });
}
function drawDashboard(ctx, w, h, t) {
  ctx.fillStyle = '#060d16'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffb648'; ctx.font = '600 26px "Space Grotesk", sans-serif';
  ctx.fillText('SUPERVISION · KPI TEMPS RÉEL', 24, 40);
  // courbe
  ctx.strokeStyle = '#57e6a9'; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = 0; x <= w - 48; x += 8) {
    const y = 150 + Math.sin((x / 40) + t * 2) * 40 + Math.sin(x / 13 + t) * 14;
    x === 0 ? ctx.moveTo(24 + x, y) : ctx.lineTo(24 + x, y);
  }
  ctx.stroke();
  // barres
  for (let i = 0; i < 6; i++) {
    const v = 40 + Math.abs(Math.sin(t * 1.3 + i * 0.7)) * 120;
    ctx.fillStyle = ['#39d7ff', '#57e6a9', '#ffb648', '#a98bff', '#ff7a3d', '#39d7ff'][i];
    ctx.fillRect(24 + i * 44, h - 30 - v, 30, v);
  }
  // gros chiffre
  ctx.fillStyle = '#39d7ff'; ctx.font = '700 64px "Space Grotesk", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText((92 + Math.sin(t) * 4).toFixed(1) + '%', w - 24, 130);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#5f748f'; ctx.font = '500 16px "IBM Plex Mono", monospace';
  ctx.fillText('OEE', w - 90, 156);
}

/* =====================================================================
   ZONE 05 — IA : réseau de neurones animé
   ===================================================================== */
function buildAI(g, color, updaters) {
  const layers = [4, 6, 6, 3];
  const spacing = 1.5, ySpan = 3.2;
  const neurons = [];
  const layerPos = [];
  layers.forEach((n, li) => {
    const arr = [];
    for (let i = 0; i < n; i++) {
      const y = 1.4 + (i - (n - 1) / 2) * (ySpan / Math.max(n - 1, 1));
      const x = (li - (layers.length - 1) / 2) * spacing;
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), emissiveMat(color, 1.4));
      s.position.set(x, y, 0); g.add(s); arr.push(s);
      neurons.push(s);
    }
    layerPos.push(arr);
  });
  // connexions
  const linePts = [];
  for (let li = 0; li < layerPos.length - 1; li++)
    for (const a of layerPos[li]) for (const b of layerPos[li + 1]) { linePts.push(a.position.clone(), b.position.clone()); }
  const lgeo = new THREE.BufferGeometry().setFromPoints(linePts);
  const lines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({
    color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending,
  }));
  g.add(lines);
  const glow = new THREE.PointLight(color, 4, 10, 2); glow.position.set(0, 2.5, 1.5); g.add(glow);
  updaters.push((t) => {
    neurons.forEach((s, i) => { s.material.emissiveIntensity = 0.8 + Math.abs(Math.sin(t * 3 + i * 0.6)) * 2.2; });
    lines.material.opacity = 0.12 + Math.abs(Math.sin(t * 1.5)) * 0.16;
    g.rotation.y = Math.sin(t * 0.2) * 0.15;
  });
}

/* =====================================================================
   ZONE 06 — PROJETS : bornes interactives (écrans inclinés)
   ===================================================================== */
function buildProjects(g, color, updaters) {
  const titles = ['LP4.0', 'TCD', 'E-LEC', 'AGRICIBLE'];
  const kiosks = [];
  titles.forEach((name, i) => {
    const k = new THREE.Group();
    const a = (i - 1.5) * 0.5;
    k.position.set(Math.sin(a) * 3.2, 0, Math.cos(a) * -1 + 1);
    k.rotation.y = -a;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 0.3), metalMat(0x1a2430, 0.5, 0.6));
    body.position.y = 1.5; body.castShadow = true; k.add(body);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1), metalMat(0x222b36));
    post.position.y = 0.5; k.add(post);
    const sc = makeScreen(1.15, 0.85, (ctx, w, h, t) => drawKiosk(ctx, w, h, t, name, color));
    sc.position.set(0, 1.55, 0.16); k.add(sc);
    g.add(k); kiosks.push(sc);
  });
  updaters.push((t) => { if (Math.floor(t * 2) % 2 === 0) kiosks.forEach((k) => k.userData.redraw(t)); });
}
function drawKiosk(ctx, w, h, t, name, color) {
  ctx.fillStyle = '#0a141f'; ctx.fillRect(0, 0, w, h);
  const hex = '#' + color.getHexString();
  ctx.fillStyle = hex; ctx.fillRect(0, 0, w, 8);
  ctx.fillStyle = '#e8f1fb'; ctx.font = '700 30px "Space Grotesk", sans-serif';
  ctx.fillText(name, 18, 52);
  ctx.fillStyle = '#5f748f'; ctx.font = '500 15px "IBM Plex Mono", monospace';
  ctx.fillText('PROJET · GITHUB', 18, 78);
  // mini graphe animé
  ctx.strokeStyle = hex; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x <= w - 36; x += 6) {
    const y = 150 + Math.sin(x / 18 + t * 2 + name.length) * 20;
    x === 0 ? ctx.moveTo(18 + x, y) : ctx.lineTo(18 + x, y);
  }
  ctx.stroke();
}

/* =====================================================================
   ZONE 07 — À PROPOS : hologramme (silhouette + scanlines)
   ===================================================================== */
function buildAbout(g, color, updaters) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.3, 32), metalMat(0x1a2634, 0.4, 0.7));
  base.position.y = 0.15; g.add(base);
  const emitter = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 32), emissiveMat(color, 1.5));
  emitter.position.y = 0.32; g.add(emitter);

  // "Silhouette" holographique : buste stylisé translucide
  const holoMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, wireframe: true });
  const holo = new THREE.Group(); holo.position.y = 0.36;
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 1.8, 20, 4, true), holoMat);
  torso.position.y = 1.5; holo.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 16), holoMat);
  head.position.y = 2.9; holo.add(head);
  g.add(holo);

  // Anneaux d'énergie qui montent
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 8, 40), emissiveMat(color, 2));
    r.rotation.x = Math.PI / 2; r.position.y = 0.5 + i * 0.9; g.add(r); rings.push(r);
  }
  const beam = new THREE.PointLight(color, 6, 10, 2); beam.position.y = 2; g.add(beam);

  updaters.push((t, dt) => {
    holo.rotation.y += dt * 0.5;
    holoMat.opacity = 0.22 + Math.abs(Math.sin(t * 2)) * 0.2;
    rings.forEach((r, i) => {
      r.position.y = 0.5 + ((t * 0.6 + i * 0.9) % 3.6);
      const k = 1 - ((r.position.y - 0.5) / 3.6);
      r.material.emissiveIntensity = 0.5 + k * 2.5;
      r.scale.setScalar(0.6 + (1 - k) * 0.8);
    });
  });
}

/* =====================================================================
   ZONE 08 — CONTACT : tablette industrielle inclinée
   ===================================================================== */
function buildContact(g, color, updaters) {
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.3, 24), metalMat(0x1a2634, 0.4, 0.7));
  stand.position.y = 0.15; g.add(stand);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8), metalMat(0x222b36));
  arm.position.set(0, 1.1, 0); arm.rotation.x = 0.2; g.add(arm);

  const tablet = new THREE.Group();
  tablet.position.set(0, 2, 0.3); tablet.rotation.x = -0.5;
  const shell = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.5, 0.12), metalMat(0x0d141d, 0.4, 0.7));
  tablet.add(shell);
  const sc = makeScreen(1.9, 1.3, (ctx, w, h, t) => drawTablet(ctx, w, h, t, color));
  sc.position.z = 0.07; tablet.add(sc);
  g.add(tablet);
  const glow = new THREE.PointLight(color, 4, 8, 2); glow.position.set(0, 2, 1.2); g.add(glow);
  updaters.push((t) => { if (Math.floor(t * 3) % 2 === 0) sc.userData.redraw(t); });
}
function drawTablet(ctx, w, h, t, color) {
  ctx.fillStyle = '#08131d'; ctx.fillRect(0, 0, w, h);
  const hex = '#' + color.getHexString();
  ctx.fillStyle = hex; ctx.font = '700 30px "Space Grotesk", sans-serif';
  ctx.fillText('CONTACT', 24, 48);
  ctx.fillStyle = '#cfe0f2'; ctx.font = '500 19px "IBM Plex Mono", monospace';
  const lines = ['✉  ephraimgoussanou0@gmail.com', '☎  06 28 43 36 29', 'in linkedin.com/in/sena-ephraim', '⌥  github.com/Ephraim1110'];
  lines.forEach((l, i) => ctx.fillText(l, 24, 96 + i * 40));
  // curseur clignotant
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = hex; ctx.fillRect(24, h - 26, 14, 4); }
}
