/**
 * zones.js — Données des 8 zones de compétences de la Smart Factory.
 *
 * Chaque zone décrit :
 *  - id, icon, couleur d'accent (utilisée pour la lumière + l'UI)
 *  - position 3D dans la halle (centre de la zone au sol)
 *  - camera : d'où la caméra observe la zone quand on clique dessus
 *  - contenu bilingue (fr/en) rendu dans le panneau HTML latéral
 *
 * ⇒ Pour éditer votre portfolio, modifiez uniquement ce fichier.
 * Le contenu reprend les vraies informations d'Ephraim Goussanou.
 */

// Coordonnées GitHub / contact réutilisées dans plusieurs panneaux
const GH = 'https://github.com/Ephraim1110';

export const ZONES = [
  /* ----------------------------------------------------------- ROBOTIQUE */
  {
    id: 'robotics',
    icon: '🤖',
    color: 0xff7a3d,
    position: [-13, 0, 8],
    camera: { pos: [-4.5, 4, 10.5], target: [-13, 2.2, 8] },
    label: { fr: 'Robotique', en: 'Robotics' },
    content: {
      eyebrow: { fr: 'Zone 01 · Cellule robotisée', en: 'Zone 01 · Robotic cell' },
      title: { fr: 'Robotique industrielle', en: 'Industrial robotics' },
      lead: {
        fr: "Bras robotisés et robot mobile autonome (AMR) modélisés et rendus interopérables. Sur la ligne pilote LP4.0, j'ai modélisé un AMR en Web of Things pour l'intégrer au jumeau numérique.",
        en: "Robotic arms and an autonomous mobile robot (AMR) modelled and made interoperable. On the LP4.0 pilot line, I modelled an AMR in Web of Things to plug it into the digital twin.",
      },
      blocks: [
        { h: { fr: 'Savoir-faire', en: 'Know-how' }, tags: ['AMR', 'Web of Things', 'ROS-like', 'Cinématique', 'Jumeau numérique'] },
        { h: { fr: 'Application', en: 'Applied to' }, p: {
          fr: "Démantèlement robotisé de batteries : cellule flexible et open source où chaque robot expose ses données en temps réel.",
          en: 'Robotic battery dismantling: a flexible, open-source cell where each robot exposes its data in real time.' } },
      ],
    },
  },

  /* ---------------------------------------------------------- AUTOMATISME */
  {
    id: 'automation',
    icon: '⚙️',
    color: 0x39d7ff,
    position: [13, 0, 8],
    camera: { pos: [4.5, 4, 10.5], target: [13, 2.2, 8] },
    label: { fr: 'Automatisme', en: 'Automation' },
    content: {
      eyebrow: { fr: 'Zone 02 · Armoire électrique & HMI', en: 'Zone 02 · Cabinet & HMI' },
      title: { fr: 'Automatisme', en: 'Automation' },
      lead: {
        fr: "Automates, armoires électriques, IHM et capteurs industriels. Un agent Node.js décode les capteurs IO-Link et alimente le système en temps réel.",
        en: 'PLCs, electrical cabinets, HMIs and industrial sensors. A Node.js agent decodes IO-Link sensors and feeds the system in real time.',
      },
      blocks: [
        { h: { fr: 'Technologies', en: 'Technologies' }, tags: ['IO-Link', 'Node-RED', 'HMI', 'Capteurs', 'Automates'] },
        { h: { fr: 'Rôle', en: 'Role' }, p: {
          fr: "Passerelle entre le terrain (capteurs, actionneurs) et le monde logiciel : acquisition, décodage et remontée normalisée des données machine.",
          en: 'Bridge between the field (sensors, actuators) and software: acquisition, decoding and standardised machine-data reporting.' } },
      ],
    },
  },

  /* ------------------------------------------------ MQTT / UNIFIED NAMESPACE */
  {
    id: 'mqtt',
    icon: '☁️',
    color: 0x57e6a9,
    position: [0, 0, -1],
    camera: { pos: [0, 4.5, 8.5], target: [0, 2.6, -1] },
    label: { fr: 'MQTT / UNS', en: 'MQTT / UNS' },
    content: {
      eyebrow: { fr: 'Zone 03 · Unified Namespace', en: 'Zone 03 · Unified Namespace' },
      title: { fr: 'MQTT & Unified Namespace', en: 'MQTT & Unified Namespace' },
      lead: {
        fr: "Le cœur nerveux de l'usine : un broker MQTT et un Unified Namespace (ISA-95) où toutes les machines publient et s'abonnent aux données. Chaque flux de particules représente un message circulant entre équipements.",
        en: 'The factory nervous system: an MQTT broker and a Unified Namespace (ISA-95) where every machine publishes and subscribes to data. Each particle stream is a message flowing between assets.',
      },
      blocks: [
        { h: { fr: 'Architecture', en: 'Architecture' }, tags: ['MQTT', 'Unified Namespace', 'ISA-95', 'NGSI-LD / FIWARE', 'Docker'] },
        { h: { fr: 'Réalisation', en: 'Delivered' }, p: {
          fr: "PoC d'un Unified Namespace conteneurisé sur la ligne LP4.0 : un Context Broker NGSI-LD reçoit les messages MQTT décodés et maintient un jumeau numérique cohérent.",
          en: 'PoC of a containerised Unified Namespace on the LP4.0 line: an NGSI-LD Context Broker ingests decoded MQTT messages and keeps a coherent digital twin.' } },
      ],
    },
  },

  /* --------------------------------------------------------- DATA / POWER BI */
  {
    id: 'data',
    icon: '📊',
    color: 0xffb648,
    position: [-14, 0, -8],
    camera: { pos: [-6, 4, -3], target: [-14, 3, -8] },
    label: { fr: 'Data & BI', en: 'Data & BI' },
    content: {
      eyebrow: { fr: 'Zone 04 · Supervision', en: 'Zone 04 · Supervision' },
      title: { fr: 'Data & Power BI', en: 'Data & Power BI' },
      lead: {
        fr: "Le grand écran de supervision affiche des KPI temps réel. De la base PostgreSQL aux tableaux de bord Grafana et Power BI, je transforme la donnée brute en décision.",
        en: 'The supervision screen shows real-time KPIs. From the PostgreSQL database to Grafana and Power BI dashboards, I turn raw data into decisions.',
      },
      blocks: [
        { h: { fr: 'Stack data', en: 'Data stack' }, tags: ['PostgreSQL / SQL', 'Grafana', 'Power BI', 'KPI', 'ETL'] },
        { h: { fr: 'Exemple', en: 'Example' }, p: {
          fr: "Conception d'une base PostgreSQL (relations, procédures, déclencheurs), import automatique de données métier et restitution en tableaux de bord.",
          en: 'PostgreSQL database design (relations, procedures, triggers), automatic business-data import and dashboard reporting.' } },
        { link: { href: GH + '/kpi-dashboard-calculator', label: { fr: 'KPI Dashboard Calculator →', en: 'KPI Dashboard Calculator →' } } },
      ],
    },
  },

  /* -------------------------------------------------------------------- IA */
  {
    id: 'ai',
    icon: '🧠',
    color: 0xa98bff,
    position: [14, 0, -8],
    camera: { pos: [6, 4, -3], target: [14, 3, -8] },
    label: { fr: 'IA', en: 'AI' },
    content: {
      eyebrow: { fr: 'Zone 05 · Intelligence artificielle', en: 'Zone 05 · Artificial intelligence' },
      title: { fr: 'Intelligence Artificielle', en: 'Artificial Intelligence' },
      lead: {
        fr: "Un espace futuriste où des réseaux de neurones s'animent. J'explore l'IA appliquée à l'industrie et aux outils : agents, serveurs MCP, automatisation de contenus.",
        en: 'A futuristic space where neural networks come alive. I explore AI applied to industry and tooling: agents, MCP servers, content automation.',
      },
      blocks: [
        { h: { fr: 'Explorations', en: 'Explorations' }, tags: ['LLM / Agents', 'MCP', 'Automatisation', 'Vision données'] },
        { h: { fr: 'Projets', en: 'Projects' }, p: {
          fr: "mcp-sqlite (serveur MCP pour interroger une base via un assistant) et MusicToShorts (génération automatique de formats courts).",
          en: 'mcp-sqlite (MCP server to query a database via an assistant) and MusicToShorts (automatic short-form content generation).' } },
        { link: { href: GH + '/mcp-sqlite', label: { fr: 'mcp-sqlite →', en: 'mcp-sqlite →' } } },
      ],
    },
  },

  /* --------------------------------------------------------------- PROJETS */
  {
    id: 'projects',
    icon: '📁',
    color: 0x39d7ff,
    position: [-13, 0, -20],
    camera: { pos: [-5, 4, -15], target: [-13, 2.4, -20] },
    label: { fr: 'Projets', en: 'Projects' },
    content: {
      eyebrow: { fr: 'Zone 06 · Bornes projets', en: 'Zone 06 · Project kiosks' },
      title: { fr: 'Projets sélectionnés', en: 'Selected projects' },
      lead: {
        fr: 'Quelques réalisations marquantes, du jumeau numérique de territoire à la ligne pilote industrielle.',
        en: 'A few notable builds, from territory digital twins to an industrial pilot line.',
      },
      list: [
        { title: 'LP4.0 — Ligne pilote 4.0', meta: '2024–2026 · Proxinnov · Lauréat France 2030', desc: {
          fr: "Ligne robotisée open source ; interopérabilité Web of Things + MQTT + NGSI-LD, jumeau numérique temps réel.",
          en: 'Open-source robotic line; Web of Things + MQTT + NGSI-LD interoperability, real-time digital twin.' } },
        { title: 'TCD — Territoire Connecté & Durable', meta: '2024–2025 · Somme Numérique', desc: {
          fr: 'Plateforme Vue.js / Node.js de gestion des infrastructures connectées, API NGSI-LD, tableaux de bord temps réel.',
          en: 'Vue.js / Node.js platform for connected-infrastructure management, NGSI-LD API, real-time dashboards.' } },
        { title: 'E-LEC — Jumeaux numériques', meta: '2025 · UN Citiverse Challenge · Top 5', desc: {
          fr: "Jumeaux numériques pour simuler et optimiser des infrastructures urbaines à partir de données temps réel.",
          en: 'Digital twins to simulate and optimise urban infrastructure from real-time data.' } },
        { title: 'Agricible — Gestion agricole', meta: '2024–2026 · Gaya Consultant', desc: {
          fr: 'Base PostgreSQL, import PAC, reprojection Lambert 93 et filtrage métier des cultures.',
          en: 'PostgreSQL database, CAP import, Lambert 93 reprojection and business crop filtering.' } },
      ],
      blocks: [{ link: { href: GH, label: { fr: 'Tous les dépôts GitHub →', en: 'All GitHub repositories →' } } }],
    },
  },

  /* -------------------------------------------------------------- À PROPOS */
  {
    id: 'about',
    icon: '👤',
    color: 0x39d7ff,
    position: [0, 0, -25],
    camera: { pos: [0, 4, -17], target: [0, 3.2, -25] },
    label: { fr: 'À propos', en: 'About' },
    content: {
      eyebrow: { fr: 'Zone 07 · Hologramme', en: 'Zone 07 · Hologram' },
      title: { fr: 'À propos', en: 'About' },
      lead: {
        fr: 'Ephraim Goussanou — Ingénieur Logiciels & Systèmes Industriels.',
        en: 'Ephraim Goussanou — Software & Industrial Systems Engineer.',
      },
      blocks: [
        { p: {
          fr: "Ingénieur diplômé en Génie Industriel, je développe des solutions logicielles pour améliorer la performance des systèmes industriels : développement d'applications, intégration de systèmes connectés, exploitation de données et architectures basées sur MQTT, NGSI-LD et le Web of Things.",
          en: 'A graduate engineer in Industrial Engineering, I build software to improve industrial-system performance: application development, connected-system integration, data exploitation and architectures based on MQTT, NGSI-LD and the Web of Things.' } },
        { h: { fr: 'Formation', en: 'Education' }, p: {
          fr: "Master Génie Industriel (Bac+5), UPJV Amiens · Licence Pro Développement Web & Mobile · BTS SIO option SLAM.",
          en: "Master's in Industrial Engineering, UPJV Amiens · Professional Bachelor in Web & Mobile Development · BTS SIO (SLAM)." } },
        { h: { fr: 'Parcours', en: 'Path' }, p: {
          fr: 'Alternant Ingénieur R&D chez Faubourg Numérique (Digital Innovation Hub) depuis 2024.',
          en: 'R&D Engineer apprentice at Faubourg Numérique (Digital Innovation Hub) since 2024.' } },
      ],
    },
  },

  /* --------------------------------------------------------------- CONTACT */
  {
    id: 'contact',
    icon: '📞',
    color: 0x57e6a9,
    position: [13, 0, -20],
    camera: { pos: [5, 4, -15], target: [13, 2.4, -20] },
    label: { fr: 'Contact', en: 'Contact' },
    content: {
      eyebrow: { fr: 'Zone 08 · Tablette industrielle', en: 'Zone 08 · Industrial tablet' },
      title: { fr: 'Contact', en: 'Contact' },
      lead: {
        fr: 'Un projet, une collaboration, une question ? Contactez-moi.',
        en: 'A project, a collaboration, a question? Get in touch.',
      },
      contacts: [
        { val: 'ephraimgoussanou0@gmail.com', tag: 'Email', href: 'mailto:ephraimgoussanou0@gmail.com' },
        { val: '06 28 43 36 29', tag: { fr: 'Téléphone', en: 'Phone' }, href: 'tel:+33628433629' },
        { val: 'linkedin.com/in/sena-ephraim', tag: 'LinkedIn', href: 'https://www.linkedin.com/in/sena-ephraim' },
        { val: 'github.com/Ephraim1110', tag: 'GitHub', href: GH },
      ],
    },
  },
];

/** Accès rapide par id. */
export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));
