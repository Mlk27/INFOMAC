import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

const pool = process.env.DATABASE_URL ? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

async function queryDB(sql, params = []) {
  if (!pool) return { rows: [] };
  return pool.query(sql, params);
}

// ─── VRAIS PRIX INFOMAC.FR ────────────────────────────────────────────────────

const IPHONE_PRICES = {
  "iphone se 1": { ecran_original:149,ecran_compatible:50,batterie:69,arriere:89,camera_ar:39,camera_ft:29,connecteur:79,carte_mere:51,recup_donnees:250,migration:49 },
  "iphone se 2":{ ecran_original:169,ecran_compatible:80,batterie:69,arriere:79,camera_ar:49,camera_ft:29,connecteur:79,carte_mere:77,recup_donnees:250,migration:49 },
  "iphone se 3":{ ecran_original:169,ecran_compatible:79,batterie:69,arriere:79,camera_ar:49,camera_ft:29,connecteur:79,carte_mere:77,recup_donnees:250,migration:49 },
  "iphone 7":   { ecran_original:169,ecran_compatible:73,batterie:69,arriere:89,camera_ar:39,camera_ft:29,connecteur:79,carte_mere:60,recup_donnees:250,migration:49 },
  "iphone 7 plus":{ ecran_original:199,ecran_compatible:74,batterie:69,arriere:60,camera_ar:49,camera_ft:29,connecteur:79,carte_mere:60,recup_donnees:250,migration:49 },
  "iphone 8":   { ecran_original:199,ecran_compatible:80,batterie:69,arriere:79,camera_ar:49,camera_ft:29,connecteur:79,carte_mere:68,recup_donnees:250,migration:49 },
  "iphone 8 plus":{ ecran_original:199,ecran_compatible:79,batterie:69,arriere:70,camera_ar:59,camera_ft:39,connecteur:79,carte_mere:68,recup_donnees:250,migration:49 },
  "iphone x":   { ecran_original:329,ecran_compatible:80,batterie:89,arriere:80,camera_ar:69,camera_ft:39,connecteur:89,carte_mere:85,recup_donnees:250,migration:49 },
  "iphone xs":  { ecran_original:329,ecran_compatible:87,batterie:89,arriere:90,camera_ar:79,camera_ft:49,connecteur:89,carte_mere:85,recup_donnees:250,migration:49 },
  "iphone xr":  { ecran_original:269,ecran_compatible:89,batterie:89,arriere:100,camera_ar:79,camera_ft:49,connecteur:79,carte_mere:85,recup_donnees:250,migration:49 },
  "iphone xs max":{ ecran_original:329,ecran_compatible:93,batterie:89,arriere:100,camera_ar:89,camera_ft:59,connecteur:89,carte_mere:85,recup_donnees:250,migration:49 },
  "iphone 11":  { ecran_original:269,ecran_compatible:80,batterie:89,arriere:90,camera_ar:79,camera_ft:49,connecteur:79,carte_mere:102,recup_donnees:250,migration:49 },
  "iphone 11 pro":{ ecran_original:329,ecran_compatible:85,batterie:89,arriere:105,camera_ar:89,camera_ft:59,connecteur:89,carte_mere:111,recup_donnees:250,migration:49 },
  "iphone 11 pro max":{ ecran_original:329,ecran_compatible:91,batterie:89,arriere:120,camera_ar:99,camera_ft:69,connecteur:89,carte_mere:119,recup_donnees:250,migration:49 },
  "iphone 12 mini":{ ecran_original:289,ecran_compatible:107,batterie:99,arriere:95,camera_ar:79,camera_ft:49,connecteur:79,carte_mere:119,recup_donnees:250,migration:49 },
  "iphone 12":  { ecran_original:289,ecran_compatible:91,batterie:99,arriere:105,camera_ar:89,camera_ft:59,connecteur:79,carte_mere:128,recup_donnees:250,migration:49 },
  "iphone 12 pro":{ ecran_original:359,ecran_compatible:89,batterie:99,arriere:120,camera_ar:99,camera_ft:69,connecteur:89,carte_mere:136,recup_donnees:250,migration:49 },
  "iphone 12 pro max":{ ecran_original:359,ecran_compatible:103,batterie:99,arriere:140,camera_ar:109,camera_ft:79,connecteur:89,carte_mere:153,recup_donnees:250,migration:49 },
  "iphone 13 mini":{ ecran_original:289,ecran_compatible:109,batterie:99,arriere:119,camera_ar:89,camera_ft:59,connecteur:79,carte_mere:153,recup_donnees:250,migration:49 },
  "iphone 13":  { ecran_original:289,ecran_compatible:92,batterie:99,arriere:115,camera_ar:99,camera_ft:69,connecteur:79,carte_mere:162,recup_donnees:250,migration:49 },
  "iphone 13 pro":{ ecran_original:389,ecran_compatible:110,batterie:99,arriere:130,camera_ar:109,camera_ft:79,connecteur:89,carte_mere:187,recup_donnees:250,migration:49 },
  "iphone 13 pro max":{ ecran_original:389,ecran_compatible:125,batterie:99,arriere:150,camera_ar:119,camera_ft:89,connecteur:89,carte_mere:204,recup_donnees:250,migration:49 },
  "iphone 14":  { ecran_original:289,ecran_compatible:103,batterie:99,arriere:130,camera_ar:109,camera_ft:79,connecteur:79,carte_mere:187,recup_donnees:250,migration:49 },
  "iphone 14 plus":{ ecran_original:319,ecran_compatible:123,batterie:109,arriere:160,camera_ar:119,camera_ft:89,connecteur:79,carte_mere:187,recup_donnees:250,migration:49 },
  "iphone 14 pro":{ ecran_original:389,ecran_compatible:141,batterie:109,arriere:160,camera_ar:119,camera_ft:89,connecteur:89,carte_mere:238,recup_donnees:250,migration:49 },
  "iphone 14 pro max":{ ecran_original:389,ecran_compatible:141,batterie:109,arriere:170,camera_ar:129,camera_ft:99,connecteur:89,carte_mere:255,recup_donnees:250,migration:49 },
  "iphone 15":  { ecran_original:319,ecran_compatible:110,batterie:109,arriere:140,camera_ar:109,camera_ft:79,connecteur:79,carte_mere:255,recup_donnees:250,migration:49 },
  "iphone 15 plus":{ ecran_original:319,ecran_compatible:123,batterie:109,arriere:160,camera_ar:119,camera_ft:89,connecteur:79,carte_mere:255,recup_donnees:250,migration:49 },
  "iphone 15 pro":{ ecran_original:389,ecran_compatible:141,batterie:129,arriere:180,camera_ar:129,camera_ft:99,connecteur:89,carte_mere:289,recup_donnees:250,migration:49 },
  "iphone 15 pro max":{ ecran_original:389,ecran_compatible:141,batterie:129,arriere:200,camera_ar:139,camera_ft:109,connecteur:89,carte_mere:315,recup_donnees:250,migration:49 },
  "iphone 16":  { ecran_original:349,ecran_compatible:185,batterie:109,arriere:160,camera_ar:119,camera_ft:89,connecteur:79,carte_mere:340,recup_donnees:250,migration:49 },
  "iphone 16 plus":{ ecran_original:349,ecran_compatible:200,batterie:109,arriere:180,camera_ar:129,camera_ft:99,connecteur:79,carte_mere:360,recup_donnees:250,migration:49 },
  "iphone 16 pro":{ ecran_original:419,ecran_compatible:220,batterie:129,arriere:190,camera_ar:139,camera_ft:109,connecteur:89,carte_mere:391,recup_donnees:250,migration:49 },
  "iphone 16 pro max":{ ecran_original:419,ecran_compatible:258,batterie:129,arriere:210,camera_ar:149,camera_ft:119,connecteur:89,carte_mere:442,recup_donnees:250,migration:49 }
};

const MACBOOK_PRICES = {
  "macbook air m2 15 2023":{ ecran:650,batterie:280,clavier:220,carte_mere:600,alimentation:190,ventilateur:140,migration:89 },
  "macbook air m2 13 2022":{ ecran:550,batterie:280,clavier:190,carte_mere:550,alimentation:180,ventilateur:130,migration:89 },
  "macbook air m1 13 2020":{ ecran:450,batterie:180,clavier:180,carte_mere:450,alimentation:120,ventilateur:80,migration:89 },
  "macbook air retina 13 2020":{ ecran:400,batterie:180,clavier:170,carte_mere:400,alimentation:110,ventilateur:70,migration:89 },
  "macbook air retina 13 2019":{ ecran:380,batterie:180,clavier:160,carte_mere:380,alimentation:100,ventilateur:60,migration:89 },
  "macbook air retina 13 2018":{ ecran:350,batterie:180,clavier:150,carte_mere:350,alimentation:90,ventilateur:50,migration:89 },
  "macbook air 13 2017":{ ecran:300,batterie:149,clavier:140,carte_mere:300,alimentation:80,ventilateur:40,migration:89 },
  "macbook air 13 2015":{ ecran:280,batterie:149,clavier:130,carte_mere:280,alimentation:70,ventilateur:30,migration:89 },
  "macbook pro 16 m3 2023":{ ecran:850,batterie:320,clavier:380,carte_mere:950,alimentation:220,ventilateur:170,migration:89 },
  "macbook pro 14 m3 2023":{ ecran:800,batterie:300,clavier:350,carte_mere:900,alimentation:200,ventilateur:150,migration:89 },
  "macbook pro 16 m2 2023":{ ecran:750,batterie:280,clavier:320,carte_mere:850,alimentation:180,ventilateur:130,migration:89 },
  "macbook pro 14 m2 2023":{ ecran:700,batterie:250,clavier:300,carte_mere:800,alimentation:150,ventilateur:100,migration:89 },
  "macbook pro 13 m2 2022":{ ecran:650,batterie:230,clavier:280,carte_mere:700,alimentation:130,ventilateur:90,migration:89 },
  "macbook pro 16 m1 2021":{ ecran:700,batterie:250,clavier:300,carte_mere:800,alimentation:150,ventilateur:100,migration:89 },
  "macbook pro 14 m1 2021":{ ecran:650,batterie:220,clavier:270,carte_mere:750,alimentation:140,ventilateur:90,migration:89 },
  "macbook pro 13 m1 2020":{ ecran:600,batterie:200,clavier:250,carte_mere:700,alimentation:130,ventilateur:80,migration:89 },
  "macbook pro 16 2019":{ ecran:700,batterie:250,clavier:300,carte_mere:800,alimentation:150,ventilateur:100,migration:89 },
  "macbook pro 15 2019":{ ecran:650,batterie:220,clavier:270,carte_mere:750,alimentation:140,ventilateur:90,migration:89 },
  "macbook pro 13 2019":{ ecran:600,batterie:200,clavier:250,carte_mere:700,alimentation:130,ventilateur:80,migration:89 },
  "macbook pro 15 2018":{ ecran:650,batterie:220,clavier:270,carte_mere:750,alimentation:140,ventilateur:90,migration:89 },
  "macbook pro 13 2018":{ ecran:600,batterie:200,clavier:250,carte_mere:700,alimentation:130,ventilateur:80,migration:89 },
  "macbook pro 15 2017":{ ecran:600,batterie:200,clavier:250,carte_mere:700,alimentation:130,ventilateur:80,migration:89 },
  "macbook pro 13 2017":{ ecran:550,batterie:180,clavier:230,carte_mere:650,alimentation:120,ventilateur:70,migration:89 },
  "macbook pro 15 2016":{ ecran:550,batterie:180,clavier:230,carte_mere:650,alimentation:120,ventilateur:70,migration:89 },
  "macbook pro 13 2016":{ ecran:500,batterie:170,clavier:220,carte_mere:600,alimentation:110,ventilateur:60,migration:89 },
  "macbook pro 15 2015":{ ecran:500,batterie:170,clavier:220,carte_mere:600,alimentation:110,ventilateur:60,migration:89 },
  "macbook pro 13 2015":{ ecran:450,batterie:160,clavier:210,carte_mere:550,alimentation:100,ventilateur:50,migration:89 },
  "macbook pro 13 2014":{ ecran:400,batterie:150,clavier:200,carte_mere:500,alimentation:90,ventilateur:40,migration:89 },
  "macbook pro 13 2013":{ ecran:350,batterie:140,clavier:190,carte_mere:450,alimentation:80,ventilateur:30,migration:89 },
  "macbook pro 13 2012":{ ecran:300,batterie:130,clavier:180,carte_mere:400,alimentation:70,ventilateur:20,migration:89 }
};

const IMAC_PRICES = {
  "imac 24 m3 2024":{ ecran:700,migration:89,carte_mere:450,alimentation:150,ventilateur:100,camera:80,mise_a_jour:129 },
  "imac 24 m1 2021":{ ecran:650,migration:89,carte_mere:400,alimentation:140,ventilateur:90,camera:75,mise_a_jour:129 },
  "imac 27 5k 2020":{ ecran:750,migration:89,carte_mere:500,alimentation:160,ventilateur:110,camera:85,mise_a_jour:129 },
  "imac 21 4k 2019":{ ecran:680,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:470,alimentation:150,ventilateur:100,camera:80,mise_a_jour:129 },
  "imac 27 5k 2019":{ ecran:700,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:480,alimentation:160,ventilateur:110,camera:85,mise_a_jour:129 },
  "imac 27 5k 2017":{ ecran:670,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:460,alimentation:150,ventilateur:100,camera:80,mise_a_jour:129 },
  "imac 21 4k 2017":{ ecran:600,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:450,alimentation:140,ventilateur:90,camera:75,mise_a_jour:129 },
  "imac 27 2015":{ ecran:650,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:440,alimentation:130,ventilateur:80,camera:70,mise_a_jour:129 },
  "imac 21 2015":{ ecran:620,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:430,alimentation:120,ventilateur:70,camera:65,mise_a_jour:129 },
  "imac 27 2014":{ ecran:650,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:440,alimentation:130,ventilateur:80,camera:70,mise_a_jour:129 },
  "imac 21 2014":{ ecran:620,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:430,alimentation:120,ventilateur:70,camera:65,mise_a_jour:129 },
  "imac 27 2013":{ ecran:650,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:440,alimentation:130,ventilateur:80,camera:70,mise_a_jour:129 },
  "imac 21 2013":{ ecran:620,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:430,alimentation:120,ventilateur:70,camera:65,mise_a_jour:129 },
  "imac pro 27 2017":{ ecran:800,migration:89,ssd_500go:270,ssd_1to:350,ssd_2to:449,carte_mere:600,alimentation:200,ventilateur:150,camera:100,mise_a_jour:129 }
};

const IPAD_PRICES = {
  "ipad 6":{ ecran:150,verre:80,lcd:100,batterie:99,bouton_home:50,connecteur:110,recup_donnees:200 },
  "ipad 7":{ ecran:160,verre:85,lcd:110,batterie:99,bouton_home:50,connecteur:110,recup_donnees:200 },
  "ipad 8":{ ecran:170,verre:90,lcd:120,batterie:99,bouton_home:50,connecteur:110,recup_donnees:200 },
  "ipad 9":{ ecran:180,verre:95,lcd:130,batterie:99,bouton_home:50,connecteur:110,recup_donnees:200 },
  "ipad air 3":{ ecran:200,batterie:129,bouton_home:60,connecteur:110,recup_donnees:250 },
  "ipad air 4":{ ecran:220,batterie:129,connecteur:110,recup_donnees:250 },
  "ipad air 5":{ ecran:240,batterie:129,connecteur:110,recup_donnees:250 },
  "ipad mini 5":{ ecran:190,batterie:119,bouton_home:55,connecteur:110,recup_donnees:220 },
  "ipad mini 6":{ ecran:210,batterie:119,connecteur:110,recup_donnees:220 },
  "ipad pro 11 1":{ ecran:300,batterie:149,connecteur:189,recup_donnees:300 },
  "ipad pro 11 2":{ ecran:320,batterie:149,connecteur:189,recup_donnees:300 },
  "ipad pro 11 3":{ ecran:350,batterie:149,connecteur:189,recup_donnees:300 },
  "ipad pro 12 3":{ ecran:400,batterie:169,connecteur:189,recup_donnees:350 },
  "ipad pro 12 4":{ ecran:420,batterie:169,connecteur:189,recup_donnees:350 },
  "ipad pro 12 5":{ ecran:450,batterie:169,connecteur:189,recup_donnees:350 }
};

const STORE = {
  phone:"01 75 57 86 60", email:"contact@infomac.fr",
  address:"82 Rue des Entrepreneurs, 75015 Paris",
  hours:"Lun–Ven 10h–13h / 14h–18h30 · Sam 10h–13h / 14h–18h",
  booking:"https://infomac.fr/wp-booking-calendar/",
  devis:"https://infomac.fr/devis-de-reparation/"
};

// ─── Normalisation du texte ───────────────────────────────────────────────────
function normalize(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

// ─── Détection appareil ───────────────────────────────────────────────────────
function detectAppareil(t) {
  t = normalize(t);
  if (/imac/.test(t)) return "imac";
  if (/ipad/.test(t)) return "ipad";
  if (/macbook|mac book/.test(t)) return "macbook";
  if (/iphone/.test(t)) return "iphone";
  if (/mac mini/.test(t)) return "mac mini";
  if (/pc|windows/.test(t)) return "pc";
  return null;
}

// ─── Détection modèle iPhone ─────────────────────────────────────────────────
function detectIphoneModel(t) {
  t = normalize(t);
  const models = Object.keys(IPHONE_PRICES).sort((a,b)=>b.length-a.length);
  for (const m of models) {
    const pattern = m.replace(/ /g,"[\\s-]?");
    if (new RegExp(pattern).test(t)) return m;
  }
  return null;
}

// ─── Détection modèle MacBook ─────────────────────────────────────────────────
function detectMacbookModel(t) {
  t = normalize(t);
  const models = Object.keys(MACBOOK_PRICES).sort((a,b)=>b.length-a.length);
  for (const m of models) {
    const pattern = m.replace(/ /g,"[\\s-]?");
    if (new RegExp(pattern).test(t)) return m;
  }
  return null;
}

// ─── Détection modèle iMac ────────────────────────────────────────────────────
function detectImacModel(t) {
  t = normalize(t);
  const models = Object.keys(IMAC_PRICES).sort((a,b)=>b.length-a.length);
  for (const m of models) {
    const pattern = m.replace(/ /g,"[\\s-]?");
    if (new RegExp(pattern).test(t)) return m;
  }
  return null;
}

// ─── Détection panne ─────────────────────────────────────────────────────────
function detectPanne(t) {
  t = normalize(t);
  if (/(ecran|vitre|affichage|lcd|oled|casse|brise|fissure|noir|blanc|tactile)/.test(t)) return "ecran";
  if (/(batterie|charge|autonomie|s.eteint|decharg)/.test(t)) return "batterie";
  if (/(connecteur|lightning|usb.c|cable|brancher|recharge|charg)/.test(t)) return "connecteur";
  if (/(camera|photo|appareil photo|objectif)/.test(t)) return "camera";
  if (/(carte mere|circuit|composant|soudure|wifi|bluetooth|reseau)/.test(t)) return "carte_mere";
  if (/(arriere|dos|verre arriere|face arriere)/.test(t)) return "arriere";
  if (/(donnee|fichier|recuperation|perdu|sauvegarde)/.test(t)) return "recup_donnees";
  if (/(migration|transfert|nouvel|nouveau)/.test(t)) return "migration";
  if (/(clavier|touche)/.test(t)) return "clavier";
  if (/(ventilateur|chauffe|surchauffe|fan)/.test(t)) return "ventilateur";
  if (/(alimentation|power|alim|secteur)/.test(t)) return "alimentation";
  if (/(ssd|disque|stockage|500|1to|2to)/.test(t)) return "ssd";
  return null;
}

// ─── Formatage réponse iPhone ─────────────────────────────────────────────────
function formatIphoneReply(model, panne, prices) {
  const m = IPHONE_PRICES[model];
  if (!m) return null;

  const modelLabel = model.replace(/\b\w/g, l=>l.toUpperCase());

  if (panne === "ecran") {
    return `📱 Réparation écran ${modelLabel}\n\n• Original Apple : ${m.ecran_original}€\n• Compatible premium : ${m.ecran_compatible}€\n\n⏱ Délai : 1h en boutique\n✅ Garantie 3 mois\n📞 ${STORE.phone}`;
  }
  if (panne === "batterie") {
    return `🔋 Remplacement batterie ${modelLabel}\n\n• Prix : ${m.batterie}€\n\n⏱ Délai : 30 min\n✅ Garantie 6 mois\n📞 ${STORE.phone}`;
  }
  if (panne === "connecteur") {
    return `🔌 Connecteur de charge ${modelLabel}\n\n• Prix : ${m.connecteur}€\n\n⏱ Délai : 1h\n✅ Garantie 3 mois\n📞 ${STORE.phone}`;
  }
  if (panne === "arriere") {
    return `🔧 Panneau arrière ${modelLabel}\n\n• Original Apple : ${m.arriere}€\n\n⏱ Délai : 1-2h\n✅ Garantie 3 mois\n📞 ${STORE.phone}`;
  }
  if (panne === "camera") {
    return `📷 Caméra ${modelLabel}\n\n• Caméra arrière : ${m.camera_ar}€\n• Caméra avant (FaceTime) : ${m.camera_ft}€\n\n⏱ Délai : 1-2h\n✅ Garantie 3 mois\n📞 ${STORE.phone}`;
  }
  if (panne === "carte_mere") {
    return `🔧 Réparation carte mère ${modelLabel}\n\n• Prix : ${m.carte_mere}€\n(WiFi, Bluetooth, réseau, composants)\n\n⏱ Délai : 24-72h selon diagnostic\n📞 ${STORE.phone}`;
  }
  if (panne === "recup_donnees") {
    return `💾 Récupération de données ${modelLabel}\n\n• Prix : ${m.recup_donnees}€\n\nDiagnostic gratuit avant intervention.\n⚠️ N'utilisez plus l'appareil.\n📞 ${STORE.phone}`;
  }
  if (panne === "migration") {
    return `📲 Migration de données ${modelLabel}\n\n• Prix : ${m.migration}€\n\nTransfert sécurisé vers votre nouvel iPhone.\n📞 ${STORE.phone}`;
  }

  // Toutes les pannes
  return `📱 Tarifs réparation ${modelLabel}\n\n• Écran Original : ${m.ecran_original}€\n• Écran Compatible : ${m.ecran_compatible}€\n• Batterie : ${m.batterie}€\n• Connecteur : ${m.connecteur}€\n• Caméra arrière : ${m.camera_ar}€\n• Caméra avant : ${m.camera_ft}€\n• Panneau arrière : ${m.arriere}€\n• Carte mère : ${m.carte_mere}€\n• Récupération données : ${m.recup_donnees}€\n\n✅ Diagnostic gratuit · Garantie 3 mois\n📞 ${STORE.phone}`;
}

// ─── Formatage réponse MacBook ────────────────────────────────────────────────
function formatMacbookReply(model, panne) {
  const m = MACBOOK_PRICES[model];
  if (!m) return null;
  const modelLabel = model.replace(/\b\w/g,l=>l.toUpperCase());

  const panneMap = {
    ecran:`💻 Écran ${modelLabel}\n\n• Prix : ${m.ecran}€\n\n⏱ 24-48h · ✅ Garantie 3 mois`,
    batterie:`🔋 Batterie ${modelLabel}\n\n• Prix : ${m.batterie}€\n\n⏱ 1-2h · ✅ Garantie 6 mois`,
    clavier:`⌨️ Clavier ${modelLabel}\n\n• Prix : ${m.clavier}€\n\n⏱ 24-48h · ✅ Garantie 3 mois`,
    carte_mere:`🔧 Carte mère ${modelLabel}\n\n• Prix : ${m.carte_mere}€\n\n⏱ 24-72h · ✅ Garantie 3 mois`,
    alimentation:`⚡ Alimentation ${modelLabel}\n\n• Prix : ${m.alimentation}€\n\n⏱ 1-2h · ✅ Garantie 3 mois`,
    ventilateur:`🌀 Ventilateur ${modelLabel}\n\n• Prix : ${m.ventilateur}€\n\n⏱ 1-2h · ✅ Garantie 3 mois`,
    migration:`📦 Migration données ${modelLabel}\n\n• Prix : ${m.migration}€\n\n⏱ 2-4h · Transfert sécurisé`
  };

  if (panne && panneMap[panne]) {
    return panneMap[panne] + `\n📞 ${STORE.phone}`;
  }

  return `💻 Tarifs ${modelLabel}\n\n• Écran : ${m.ecran}€\n• Batterie : ${m.batterie}€\n• Clavier : ${m.clavier}€\n• Carte mère : ${m.carte_mere}€\n• Alimentation : ${m.alimentation}€\n• Ventilateur : ${m.ventilateur}€\n• Migration données : ${m.migration}€\n\n✅ Diagnostic gratuit · Garantie 3 mois\n📞 ${STORE.phone}`;
}

// ─── Formatage réponse iMac ───────────────────────────────────────────────────
function formatImacReply(model, panne) {
  const m = IMAC_PRICES[model];
  if (!m) return null;
  const modelLabel = model.replace(/\b\w/g,l=>l.toUpperCase());

  if (panne === "ecran") return `🖥️ Écran ${modelLabel}\n\n• Prix : ${m.ecran}€\n\n⏱ 24-72h · ✅ Garantie 3 mois\n📞 ${STORE.phone}`;
  if (panne === "ssd") return `💾 Upgrade SSD ${modelLabel}\n\n• SSD 500Go : ${m.ssd_500go||"N/A"}€\n• SSD 1To : ${m.ssd_1to||"N/A"}€\n• SSD 2To : ${m.ssd_2to||"N/A"}€\n\n⏱ 2-4h · ✅ Garantie 6 mois\n📞 ${STORE.phone}`;
  if (panne === "carte_mere") return `🔧 Carte mère ${modelLabel}\n\n• Prix : ${m.carte_mere}€\n\n⏱ 24-72h · ✅ Garantie 3 mois\n📞 ${STORE.phone}`;
  if (panne === "migration") return `📦 Migration données ${modelLabel}\n\n• Prix : ${m.migration}€\n\n📞 ${STORE.phone}`;

  let reply = `🖥️ Tarifs ${modelLabel}\n\n• Écran : ${m.ecran}€\n`;
  if (m.ssd_500go) reply += `• SSD 500Go : ${m.ssd_500go}€\n• SSD 1To : ${m.ssd_1to}€\n• SSD 2To : ${m.ssd_2to}€\n`;
  reply += `• Carte mère : ${m.carte_mere}€\n• Alimentation : ${m.alimentation}€\n• Ventilateur : ${m.ventilateur}€\n• Caméra : ${m.camera}€\n• Migration données : ${m.migration}€\n`;
  if (m.mise_a_jour) reply += `• Mise à jour Sequoia : ${m.mise_a_jour}€\n`;
  reply += `\n✅ Diagnostic gratuit · Garantie incluse\n📞 ${STORE.phone}`;
  return reply;
}

// ─── Détection intention principale ──────────────────────────────────────────
function detectIntent(t) {
  t = normalize(t);
  if (/(horaire|adresse|telephone|mail|contact|metro|acces)/.test(t)) return "contact";
  if (/(rendez.?vous|rdv|appointment)/.test(t)) return "appointment";
  if (/(revendre|reprise|rachat|vendre)/.test(t)) return "buyback";
  if (/(prix|tarif|combien|coute|repare|reparer|casse|panne|probleme|ecran|batterie|connecteur|camera|clavier|ssd|ventilateur|donnee|migration|alimentation|carte mere)/.test(t)) return "repair";
  if (/(devis)/.test(t)) return "quote";
  if (/(acheter|vente|stock|neuf|reconditionne)/.test(t)) return "sales";
  if (/(garantie|sav)/.test(t)) return "garantie";
  if (/(humain|technicien|parler|rappel)/.test(t)) return "human";
  return "default";
}

function extractLead(text) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+33|0)[1-9][\s.-]?(\d{2}[\s.-]?){4}/);
  return { email:emailMatch?.[0]||null, telephone:phoneMatch?.[0]||null };
}

// ─── Construction réponse principale ─────────────────────────────────────────
async function buildReply(message) {
  const intent   = detectIntent(message);
  const appareil = detectAppareil(message);
  const panne    = detectPanne(message);
  let reply      = "";
  let leadData   = null;

  if (intent === "repair" || (appareil && panne)) {

    if (appareil === "iphone") {
      const model = detectIphoneModel(message);
      if (model) {
        reply = formatIphoneReply(model, panne);
      } else {
        reply = `📱 Pour quel iPhone souhaitez-vous un tarif ?\n\nNous réparons tous les modèles :\n• iPhone 7 à iPhone 16 Pro Max\n• iPhone SE (toutes générations)\n\nPrécisez le modèle et la panne. Ex : "iPhone 14 Pro écran cassé"`;
      }
    }

    else if (appareil === "macbook") {
      const model = detectMacbookModel(message);
      if (model) {
        reply = formatMacbookReply(model, panne);
      } else {
        reply = `💻 Pour quel MacBook souhaitez-vous un tarif ?\n\nNous réparons :\n• MacBook Air (2010 → M2 2023)\n• MacBook Pro (2012 → M3 2023)\n\nPrécisez le modèle et l'année. Ex : "MacBook Pro 13 2020 batterie"`;
      }
    }

    else if (appareil === "imac") {
      const model = detectImacModel(message);
      if (model) {
        reply = formatImacReply(model, panne);
      } else {
        reply = `🖥️ Pour quel iMac souhaitez-vous un tarif ?\n\nNous réparons :\n• iMac 21.5\" et 27\" (2012 → 2024)\n• iMac Pro 27\" (2017)\n\nPrécisez le modèle. Ex : "iMac 27 2019 écran"`;
      }
    }

    else if (appareil === "ipad") {
      reply = `📱 Réparations iPad chez Infomac\n\n• iPad standard (6e-9e gen) — écran : 150–180€\n• iPad Air (3e-5e gen) — écran : 200–240€\n• iPad Mini (5e-6e gen) — écran : 190–210€\n• iPad Pro 11" — écran : 300–350€\n• iPad Pro 12.9" — écran : 400–450€\n• Batterie : 99–169€ selon modèle\n• Connecteur : 110–189€\n\n✅ Diagnostic gratuit\n📞 ${STORE.phone}`;
    }

    else if (appareil === "pc") {
      reply = `💻 Réparations PC Windows chez Infomac\n\n• Écran : 99–249€\n• Batterie : 69–149€\n• SSD upgrade : 79–199€\n• RAM upgrade : 49–149€\n• Réinstallation Windows : 49–89€\n• Suppression virus : 49–99€\n\n✅ Diagnostic gratuit\n📞 ${STORE.phone}`;
    }

    else {
      // Pas d'appareil détecté — demander précision
      reply = `🔧 Pour quel appareil souhaitez-vous un tarif ?\n\n• 📱 iPhone (7 → 16 Pro Max)\n• 💻 MacBook Air / Pro\n• 🖥️ iMac\n• 📱 iPad\n• 💻 PC Windows\n\nPrécisez l'appareil, le modèle et la panne.\nEx : "iPhone 15 Pro batterie" ou "MacBook Air M2 écran"`;
    }
  }

  else if (intent === "contact") {
    reply = `📍 INFOMAC — Paris 15e\n\n🏠 ${STORE.address}\n🚇 Métro Commerce ou Félix Faure (ligne 8)\n📞 ${STORE.phone}\n✉️ ${STORE.email}\n🕐 ${STORE.hours}\n\n✅ Diagnostic gratuit · Sans rendez-vous`;
  }

  else if (intent === "appointment") {
    reply = `📅 Prendre rendez-vous chez Infomac\n\n🕐 ${STORE.hours}\n📍 ${STORE.address}\n\n👉 Réservez en ligne : ${STORE.booking}\nOu appelez : 📞 ${STORE.phone}`;
  }

  else if (intent === "buyback") {
    reply = `🔄 Rachat & Reprise — Infomac\n\nNous rachetons : iPhones, MacBook, iPad, PC.\n💶 Paiement immédiat après évaluation gratuite.\n\n📞 ${STORE.phone}\n✉️ ${STORE.email}`;
    leadData = extractLead(message);
  }

  else if (intent === "quote") {
    reply = `💰 Devis gratuit Infomac\n\nIndiquez :\n• L'appareil et le modèle exact\n• La panne ou le problème\n• Votre email ou téléphone\n\n👉 Devis en ligne : ${STORE.devis}\n📞 ${STORE.phone}`;
    leadData = extractLead(message);
  }

  else if (intent === "garantie") {
    reply = `✅ Garantie Infomac\n\n• Écrans & pièces : 3 mois\n• Batteries : 6 mois\n• Main d'œuvre incluse\n• SAV en boutique sans frais\n\n📞 ${STORE.phone}`;
  }

  else if (intent === "human") {
    reply = `👨‍💻 Un technicien vous répond !\n\nLaissez votre numéro ou email :\n📞 ${STORE.phone}\n✉️ ${STORE.email}\n🕐 ${STORE.hours}`;
    leadData = extractLead(message);
  }

  else {
    reply = `Bonjour 👋 Je suis l'assistant Infomac Paris 15e !\n\nJe connais tous les tarifs de réparation :\n📱 iPhone (7 → 16 Pro Max)\n💻 MacBook Air / Pro (2012 → M3)\n🖥️ iMac (2012 → M3)\n📱 iPad (tous modèles)\n💻 PC Windows\n\nDites-moi l'appareil, le modèle et la panne.\nEx : "iPhone 14 Pro écran cassé"\nEx : "MacBook Air M2 batterie"\nEx : "iMac 27 2019 tarifs"`;
  }

  return { reply: reply || `📞 ${STORE.phone}`, intent, leadData };
}

// ─── Init DB ──────────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY, date TIMESTAMP DEFAULT NOW(),
      ip TEXT, message TEXT, intent TEXT, reponse TEXT
    );
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY, date TIMESTAMP DEFAULT NOW(),
      email TEXT, telephone TEXT, besoin TEXT, statut TEXT DEFAULT 'nouveau'
    );
  `);
  console.log("✅ DB initialisée");
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (req,res) => res.json({ ok:true, service:"infomac-bot", version:"5.0.0" }));

app.post("/chat", async (req,res) => {
  const message = String(req.body?.message||"").slice(0,500).trim();
  if (!message) return res.status(400).json({ error:"Message vide" });
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  try {
    const { reply, intent, leadData } = await buildReply(message);
    await queryDB("INSERT INTO conversations (ip,message,intent,reponse) VALUES ($1,$2,$3,$4)", [ip,message,intent,reply]);
    if (leadData?.email || leadData?.telephone) {
      await queryDB("INSERT INTO leads (email,telephone,besoin) VALUES ($1,$2,$3)", [leadData.email,leadData.telephone,message]);
    }
    res.json({ reply, intent, actions:["devis","réparation","achat","contact"], contact:STORE });
  } catch(err) {
    console.error(err);
    res.json({ reply:`📞 ${STORE.phone} | ✉️ ${STORE.email}`, intent:"fallback", contact:STORE });
  }
});

app.get("/admin/leads", async (req,res) => {
  if (req.headers["x-admin-token"] !== process.env.ADMIN_TOKEN) return res.status(401).json({ error:"Non autorisé" });
  const { rows } = await queryDB("SELECT * FROM leads ORDER BY date DESC LIMIT 100");
  res.json(rows);
});

app.get("/admin/stats", async (req,res) => {
  if (req.headers["x-admin-token"] !== process.env.ADMIN_TOKEN) return res.status(401).json({ error:"Non autorisé" });
  const [c,l,i] = await Promise.all([
    queryDB("SELECT COUNT(*) FROM conversations"),
    queryDB("SELECT COUNT(*) FROM leads"),
    queryDB("SELECT intent, COUNT(*) as total FROM conversations GROUP BY intent ORDER BY total DESC")
  ]);
  res.json({ conversations:c.rows[0].count, leads:l.rows[0].count, intents:i.rows });
});

app.listen(PORT, async () => {
  console.log(`🚀 Infomac Bot v5.0 — port ${PORT}`);
  if (pool) { try { await initDB(); } catch(e){ console.error("DB:",e.message); } }
});
