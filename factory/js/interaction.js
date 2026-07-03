/**
 * interaction.js — Raycaster + gestion des clics/survols + panneau HTML.
 *
 * - Survol : surligne le hotspot visé, change le curseur, agrandit l'étiquette.
 * - Clic   : la caméra vole vers la zone (animations.focusOn) et le panneau
 *            latéral s'ouvre avec le contenu de la zone (sans recharger la page).
 * - Minimap : les entrées de la minimap déclenchent les mêmes actions.
 */
import * as THREE from 'three';
import { ZONE_BY_ID, ZONES } from './zones.js';
import { focusOn, resetView, pulse } from './animations.js';

export function setupInteraction({ renderer, camera, controls, factory }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  let lang = document.documentElement.lang === 'en' ? 'en' : 'fr';

  const dom = renderer.domElement;
  const panel = document.getElementById('panel');
  const panelBody = document.getElementById('panelBody');
  const panelClose = document.getElementById('panelClose');
  const resetBtn = document.getElementById('resetBtn');
  const hint = document.getElementById('hudHint');
  const minimap = document.getElementById('minimap');

  // ---- Construction de la minimap ----
  ZONES.forEach((z) => {
    const item = document.createElement('button');
    item.className = 'minimap__item';
    item.style.setProperty('--dot', '#' + new THREE.Color(z.color).getHexString());
    item.innerHTML = `<span class="minimap__label">${z.label[lang]}</span><span class="minimap__dot"></span>`;
    item.dataset.zoneId = z.id;
    item.addEventListener('click', () => openZone(z.id));
    minimap.appendChild(item);
  });

  // ---- Pointer move : survol ----
  let moved = false;
  function onPointerMove(e) {
    const r = dom.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    moved = true;
  }

  // ---- Clic (avec garde anti-drag) ----
  let downX = 0, downY = 0;
  function onPointerDown(e) { downX = e.clientX; downY = e.clientY; }
  function onPointerUp(e) {
    const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (dist > 6) return; // c'était un drag OrbitControls, pas un clic
    const hit = pick(e);
    if (hit) openZone(hit);
  }

  function pick(e) {
    const r = dom.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(factory.hotspots, false);
    return hits.length ? hits[0].object.userData.zoneId : null;
  }

  dom.addEventListener('pointermove', onPointerMove);
  dom.addEventListener('pointerdown', onPointerDown);
  dom.addEventListener('pointerup', onPointerUp);

  // ---- Ouvre une zone : caméra + panneau ----
  function openZone(id) {
    const zone = ZONE_BY_ID[id];
    if (!zone) return;
    focusOn(camera, controls, zone.camera.pos, zone.camera.target);
    pulse(factory.zoneGroups[id]);
    renderPanel(zone);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    resetBtn.hidden = false;
    hint.classList.add('dim');
    // marque l'entrée active dans la minimap
    minimap.querySelectorAll('.minimap__item').forEach((it) =>
      it.classList.toggle('active', it.dataset.zoneId === id));
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    minimap.querySelectorAll('.minimap__item').forEach((it) => it.classList.remove('active'));
  }

  panelClose.addEventListener('click', closePanel);
  resetBtn.addEventListener('click', () => {
    closePanel();
    resetView(camera, controls);
    resetBtn.hidden = true;
    hint.classList.remove('dim');
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  // ---- Rendu du contenu HTML du panneau ----
  function renderPanel(zone) {
    const c = zone.content;
    const hex = '#' + new THREE.Color(zone.color).getHexString();
    const t = (o) => (o && typeof o === 'object' ? (o[lang] ?? o.fr) : o);
    let html = `<div style="--accent:${hex};--accent-soft:${hex}22;--accent-line:${hex}55">`;
    html += `<div class="p-head"><span class="p-icon">${zone.icon}</span>
             <span class="p-eyebrow">${t(c.eyebrow)}</span></div>`;
    html += `<h2 class="p-title">${t(c.title)}</h2>`;
    if (c.lead) html += `<p class="p-lead">${t(c.lead)}</p>`;

    // Liste de projets
    if (c.list) {
      html += `<div class="p-block"><h4>${lang === 'en' ? 'Projects' : 'Projets'}</h4><ul class="p-list">`;
      for (const it of c.list) {
        html += `<li><span class="li-title">${it.title}</span>
                 <span class="li-meta">${it.meta}</span>
                 <span class="li-desc">${t(it.desc)}</span></li>`;
      }
      html += `</ul></div>`;
    }

    // Contacts
    if (c.contacts) {
      html += `<div class="p-block">`;
      for (const ct of c.contacts) {
        html += `<a class="contact-row" href="${ct.href}" target="_blank" rel="noopener">
                 <span class="cr-val">${ct.val}</span><span class="cr-tag">${t(ct.tag)}</span></a>`;
      }
      html += `</div>`;
    }

    // Blocs génériques (titre + paragraphe / tags / lien)
    if (c.blocks) {
      for (const b of c.blocks) {
        html += `<div class="p-block">`;
        if (b.h) html += `<h4>${t(b.h)}</h4>`;
        if (b.p) html += `<p>${t(b.p)}</p>`;
        if (b.tags) html += `<div class="tags">${b.tags.map((x) => `<span>${x}</span>`).join('')}</div>`;
        if (b.link) html += `<a class="p-link" href="${b.link.href}" target="_blank" rel="noopener">${t(b.link.label)}</a>`;
        html += `</div>`;
      }
    }
    html += `</div>`;
    panelBody.innerHTML = html;
    panelBody.scrollTop = 0;
  }

  // ---- Survol par frame (appelé depuis la boucle de rendu) ----
  function updateHover() {
    if (!moved) return;
    moved = false;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(factory.hotspots, false);
    const hit = hits.length ? hits[0].object : null;
    if (hit !== hovered) {
      hovered = hit;
      dom.style.cursor = hit ? 'pointer' : 'grab';
      // agrandit l'étiquette survolée
      const id = hit ? hit.userData.zoneId : null;
      for (const s of factory.labelSprites) {
        const target = s.userData.zoneId === id ? 1.25 : 1;
        s.scale.set(4.4 * target, 1.1 * target, 1);
      }
    }
  }

  // ---- Changement de langue : régénère minimap + panneau ouvert ----
  function setLang(l) {
    lang = l;
    minimap.querySelectorAll('.minimap__item').forEach((it) => {
      const z = ZONE_BY_ID[it.dataset.zoneId];
      it.querySelector('.minimap__label').textContent = z.label[l];
    });
    const openId = minimap.querySelector('.minimap__item.active')?.dataset.zoneId;
    if (openId && panel.classList.contains('open')) renderPanel(ZONE_BY_ID[openId]);
  }

  return { updateHover, openZone, closePanel, setLang };
}
