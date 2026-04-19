import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY, date TIMESTAMP DEFAULT NOW(),
      ip TEXT, message TEXT, intent TEXT, reponse TEXT
    );
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY, date TIMESTAMP DEFAULT NOW(),
      nom TEXT, email TEXT, telephone TEXT, besoin TEXT, statut TEXT DEFAULT 'nouveau'
    );
    CREATE TABLE IF NOT EXISTS reparations (
      id SERIAL PRIMARY KEY, appareil TEXT, modele TEXT, panne TEXT,
      prix_min INTEGER, prix_max INTEGER, delai TEXT, garantie TEXT DEFAULT '3 mois', actif BOOLEAN DEFAULT TRUE
    );
    CREATE TABLE IF NOT EXISTS produits (
      id SERIAL PRIMARY KEY, categorie TEXT, nom TEXT, description TEXT,
      prix_min INTEGER, prix_max INTEGER, etat TEXT DEFAULT 'neuf', actif BOOLEAN DEFAULT TRUE
    );
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY, nom TEXT, description TEXT,
      prix_min INTEGER, prix_max INTEGER, details TEXT, actif BOOLEAN DEFAULT TRUE
    );
  `);

  const { rows: r } = await pool.query("SELECT COUNT(*) FROM reparations");
  if (parseInt(r[0].count) === 0) {
    await pool.query(`INSERT INTO reparations (appareil,modele,panne,prix_min,prix_max,delai,garantie) VALUES
      ('iPhone','iPhone 16 Pro Max','Écran OLED',179,229,'1h','3 mois'),
      ('iPhone','iPhone 16 / 16 Plus','Écran OLED',149,189,'1h','3 mois'),
      ('iPhone','iPhone 15 Pro Max','Écran OLED',159,199,'1h','3 mois'),
      ('iPhone','iPhone 15 / 15 Plus','Écran OLED',139,179,'1h','3 mois'),
      ('iPhone','iPhone 14 Pro Max','Écran OLED',149,189,'1h','3 mois'),
      ('iPhone','iPhone 14 / 14 Plus','Écran OLED',129,169,'1h','3 mois'),
      ('iPhone','iPhone 13 Pro Max','Écran OLED',139,179,'1h','3 mois'),
      ('iPhone','iPhone 13 / 13 mini','Écran OLED',109,149,'1h','3 mois'),
      ('iPhone','iPhone 12 / 12 mini','Écran OLED',99,139,'1h','3 mois'),
      ('iPhone','iPhone 11 / XR','Écran LCD',69,109,'1h','3 mois'),
      ('iPhone','iPhone 16 Pro / Max','Batterie',79,99,'30 min','6 mois'),
      ('iPhone','iPhone 15 Pro / Max','Batterie',69,89,'30 min','6 mois'),
      ('iPhone','iPhone 14 / Pro / Max','Batterie',59,79,'30 min','6 mois'),
      ('iPhone','iPhone 13 / Pro / Max','Batterie',49,69,'30 min','6 mois'),
      ('iPhone','iPhone 12 / 11 / XS / XR','Batterie',39,59,'30 min','6 mois'),
      ('iPhone','Tous modèles','Connecteur de charge',49,89,'1h','3 mois'),
      ('iPhone','Tous modèles','Caméra arrière',69,149,'1-2h','3 mois'),
      ('iPhone','Tous modèles','Caméra avant / Face ID',59,99,'1-2h','3 mois'),
      ('iPhone','Tous modèles','Haut-parleur / micro',49,89,'1h','3 mois'),
      ('iPhone','Tous modèles','Dégât des eaux',49,149,'2-4h','1 mois'),
      ('MacBook','MacBook Pro 13/14/15/16"','Écran cassé',249,449,'24-48h','3 mois'),
      ('MacBook','MacBook Air 13/15"','Écran cassé',199,349,'24-48h','3 mois'),
      ('MacBook','MacBook Pro / Air','Batterie',129,249,'1-2h','6 mois'),
      ('MacBook','MacBook Pro / Air','Clavier',149,299,'24-48h','3 mois'),
      ('MacBook','MacBook Pro / Air','Connecteur USB-C / MagSafe',89,149,'1-2h','3 mois'),
      ('MacBook','MacBook Pro / Air','SSD upgrade',99,299,'1-2h','6 mois'),
      ('MacBook','MacBook Pro / Air','RAM upgrade',99,249,'1-2h','6 mois'),
      ('MacBook','MacBook Pro / Air','Dégât des eaux',89,299,'24-72h','1 mois'),
      ('iMac','iMac 21/24/27"','Écran cassé',299,599,'24-72h','3 mois'),
      ('iMac','iMac 21/24/27"','SSD upgrade',129,349,'2-4h','6 mois'),
      ('iMac','iMac 21/24/27"','RAM upgrade',99,249,'1-2h','6 mois'),
      ('iPad','iPad Pro 11/12.9"','Écran cassé',149,299,'2-4h','3 mois'),
      ('iPad','iPad Air / mini','Écran cassé',99,199,'2-4h','3 mois'),
      ('iPad','iPad standard','Écran cassé',79,149,'2-4h','3 mois'),
      ('iPad','Tous modèles','Batterie',69,129,'1-2h','6 mois'),
      ('PC','PC portable','Écran cassé',99,249,'24-48h','3 mois'),
      ('PC','PC portable','Batterie',69,149,'1-2h','6 mois'),
      ('PC','PC portable / fixe','SSD upgrade',79,199,'1-2h','6 mois'),
      ('PC','PC portable / fixe','RAM upgrade',49,149,'1h','6 mois'),
      ('PC','PC portable / fixe','Réinstallation Windows',49,89,'2-4h','1 mois'),
      ('PC','PC portable / fixe','Suppression virus',49,99,'1-3h','1 mois'),
      ('PC','PC portable / fixe','Dégât des eaux',69,199,'24-48h','1 mois'),
      ('Tout appareil','iPhone / iPad','Récupération de données',89,199,'24-72h','Sans'),
      ('Tout appareil','MacBook / PC','Récupération données SSD',129,299,'24-72h','Sans'),
      ('Tout appareil','Disque dur externe','Récupération données HDD',99,399,'24-72h','Sans')
    `);
  }

  const { rows: p } = await pool.query("SELECT COUNT(*) FROM produits");
  if (parseInt(p[0].count) === 0) {
    await pool.query(`INSERT INTO produits (categorie,nom,description,prix_min,prix_max,etat) VALUES
      ('iPhone neuf','iPhone 16','128Go / 256Go / 512Go',969,1229,'neuf'),
      ('iPhone neuf','iPhone 16 Plus','128Go / 256Go / 512Go',1099,1359,'neuf'),
      ('iPhone neuf','iPhone 16 Pro','128Go à 1To',1229,1599,'neuf'),
      ('iPhone neuf','iPhone 16 Pro Max','256Go à 1To',1479,1849,'neuf'),
      ('Mac neuf','MacBook Air M3 13"','8Go/16Go RAM — 256Go à 1To SSD',1299,1799,'neuf'),
      ('Mac neuf','MacBook Pro M3 14"','18Go/36Go RAM — 512Go à 1To SSD',1999,2999,'neuf'),
      ('iPad neuf','iPad 10e génération','64Go / 256Go',399,649,'neuf'),
      ('iPad neuf','iPad Air M2','128Go / 256Go — 11" ou 13"',799,1199,'neuf'),
      ('iPad neuf','iPad Pro M4','256Go à 1To — 11" ou 13"',1219,2199,'neuf'),
      ('iPhone reconditionné','iPhone 13 reconditionné','128Go / 256Go — Grade A ou B',449,599,'reconditionné'),
      ('iPhone reconditionné','iPhone 14 reconditionné','128Go / 256Go — Grade A',549,699,'reconditionné'),
      ('iPhone reconditionné','iPhone 15 reconditionné','128Go / 256Go — Grade A',699,849,'reconditionné'),
      ('Mac reconditionné','MacBook Air M1 reconditionné','8Go RAM — 256Go SSD',799,999,'reconditionné'),
      ('Accessoires','Coque iPhone','Protection slim, robuste ou MagSafe',15,59,'neuf'),
      ('Accessoires','Verre trempé iPhone','Protection écran 9H',9,29,'neuf'),
      ('Accessoires','Câble USB-C / Lightning','Certifié MFi — 1m ou 2m',19,39,'neuf'),
      ('Accessoires','Chargeur MagSafe 15W','Original Apple',45,45,'neuf'),
      ('Accessoires','AirPods Pro 2e génération','Réduction de bruit — USB-C',249,249,'neuf'),
      ('Accessoires','SSD externe Samsung T7','500Go / 1To / 2To',79,189,'neuf')
    `);
  }

  const { rows: s } = await pool.query("SELECT COUNT(*) FROM services");
  if (parseInt(s[0].count) === 0) {
    await pool.query(`INSERT INTO services (nom,description,prix_min,prix_max,details) VALUES
      ('Diagnostic','Diagnostic complet de votre appareil',0,0,'Gratuit — sans engagement. Résultat en 30 minutes.'),
      ('Devis gratuit','Devis détaillé sans engagement',0,0,'Gratuit en boutique ou par email sous 24h.'),
      ('Rachat / Reprise','Rachat de votre ancien appareil',50,800,'iPhone, MacBook, iPad, PC. Paiement immédiat en boutique.'),
      ('Intervention à domicile','Réparation chez vous — Paris 15e',49,99,'Lun–Sam. Frais de déplacement inclus dans le tarif.'),
      ('Maintenance entreprise','Contrat pour TPE/PME',99,499,'Intervention sur site, support téléphonique, gestion parc.'),
      ('Formation Mac / iPhone','Prise en main personnalisée',49,99,'Séance d''1h en boutique. Sur rendez-vous.'),
      ('Sauvegarde et transfert','Transfert vers un nouvel appareil',29,79,'Contacts, photos, applications, réglages.')
    `);
  }

  console.log("✅ Base Infomac initialisée");
}

const STORE = {
  phone: "01 75 57 86 60", email: "contact@infomac.fr",
  address: "82 Rue des Entrepreneurs, 75015 Paris",
  hours: "Lun–Ven 10h–13h / 14h–18h30 · Sam 10h–13h / 14h–18h",
  metro: "Métro Commerce ou Félix Faure (ligne 8)"
};

function detectIntent(text = "") {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/(horaire|adresse|telephone|mail|contact|ou etes|metro|acces)/.test(t)) return "contact";
  if (/(rendez.?vous|rdv|deposer|quand|disponible)/.test(t)) return "appointment";
  if (/(revendre|reprise|rachat|vendre mon|combien vaut)/.test(t)) return "buyback";
  if (/(donnee|fichier|recuperation|disque dur|perdu mes photos|transfert)/.test(t)) return "data";
  if (/(domicile|deplacement|venir chez|intervention)/.test(t)) return "domicile";
  if (/(repare|reparer|casse|ecran|batterie|panne|allume|liquide|eau|tombe|choc|vitre|clavier|charge|lent|virus|freeze|bloque|camera|son|micro|bouton)/.test(t)) return "repair";
  if (/(prix|tarif|combien|devis|cout|gratuit|estimation)/.test(t)) return "quote";
  if (/(acheter|vente|stock|neuf|reconditionne|macbook|mac|imac|iphone|ipad|pc|accessoire|coque|cable|airpod|ssd)/.test(t)) return "sales";
  if (/(garantie|sav|retour)/.test(t)) return "garantie";
  if (/(formation|apprendre|cours|debutant)/.test(t)) return "formation";
  if (/(entreprise|societe|professionnel|contrat|maintenance)/.test(t)) return "entreprise";
  if (/(humain|conseiller|technicien|parler|rappel)/.test(t)) return "human";
  return "default";
}

function detectAppareil(text = "") {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/iphone/.test(t)) return "iPhone";
  if (/macbook|mac book/.test(t)) return "MacBook";
  if (/imac/.test(t)) return "iMac";
  if (/ipad/.test(t)) return "iPad";
  if (/pc|windows|ordinateur|laptop/.test(t)) return "PC";
  return null;
}

function extractLead(text = "") {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+33|0)[1-9][\s.-]?(\d{2}[\s.-]?){4}/);
  const nomMatch   = text.match(/(?:je suis|m'appelle|c'est)\s+([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)?)/i);
  return {
    email: emailMatch?.[0] || null,
    telephone: phoneMatch?.[0]?.replace(/[\s.-]/g, "") || null,
    nom: nomMatch?.[1] || null
  };
}

async function buildReply(message = "") {
  const intent   = detectIntent(message);
  const appareil = detectAppareil(message);
  let reply = "";
  let leadData = null;

  switch (intent) {
    case "contact":
      reply = `📍 INFOMAC — Paris 15e\n\n🏠 ${STORE.address}\n🚇 ${STORE.metro}\n📞 ${STORE.phone}\n✉️ ${STORE.email}\n🕐 ${STORE.hours}\n\n✅ Diagnostic gratuit · Sans rendez-vous`;
      break;

    case "repair": {
      const where = appareil ? "AND appareil = $1" : "";
      const params = appareil ? [appareil] : [];
      const { rows } = await pool.query(
        `SELECT * FROM reparations WHERE actif=TRUE ${where} ORDER BY prix_min LIMIT 6`, params
      );
      if (rows.length > 0) {
        const tarifs = rows.map(r => `• ${r.modele} — ${r.panne} : ${r.prix_min}–${r.prix_max}€ (${r.delai} · ${r.garantie} garantie)`).join("\n");
        reply = `🔧 Réparation ${appareil || ''} chez Infomac\n\n${tarifs}\n\n✅ Diagnostic gratuit · Pièces qualité · Devis sans engagement\n📞 ${STORE.phone}`;
      } else {
        reply = `🔧 Nous réparons iPhone, MacBook, iMac, iPad et PC.\nDiagnostic gratuit en boutique.\n📞 ${STORE.phone}`;
      }
      break;
    }

    case "quote":
      leadData = extractLead(message);
      reply = `💰 Devis gratuit Infomac\n\nPour un devis précis, indiquez :\n• Le modèle exact\n• La panne ou le problème\n• Votre email ou téléphone\n\n📞 ${STORE.phone}\n✉️ ${STORE.email}\n\nRéponse sous 1h en horaires d'ouverture.`;
      break;

    case "sales": {
      const where = appareil ? "AND (categorie ILIKE $1 OR nom ILIKE $1)" : "";
      const params = appareil ? [`%${appareil}%`] : [];
      const { rows } = await pool.query(
        `SELECT * FROM produits WHERE actif=TRUE ${where} ORDER BY prix_min LIMIT 6`, params
      );
      const liste = rows.length > 0
        ? rows.map(r => `• ${r.nom} — à partir de ${r.prix_min}€ (${r.etat})`).join("\n")
        : "• iPhones neufs et reconditionnés\n• MacBook Air et Pro\n• iPad tous modèles\n• Accessoires Apple";
      reply = `🛒 Produits disponibles chez Infomac\n\n${liste}\n\n📦 Appelez pour confirmer le stock :\n📞 ${STORE.phone}`;
      break;
    }

    case "buyback":
      leadData = extractLead(message);
      reply = `🔄 Rachat & Reprise — Infomac\n\nNous rachetons : iPhones, MacBook, iPad, PC.\n💶 Paiement immédiat en boutique après évaluation gratuite.\n\nApportez votre appareil ou appelez :\n📞 ${STORE.phone}`;
      break;

    case "data": {
      const { rows } = await pool.query("SELECT * FROM reparations WHERE panne ILIKE '%donn%' ORDER BY prix_min");
      const tarifs = rows.map(r => `• ${r.modele} : ${r.prix_min}–${r.prix_max}€ (${r.delai})`).join("\n");
      reply = `💾 Récupération de données — Infomac\n\n${tarifs}\n\n🔍 Diagnostic gratuit avant toute intervention.\n⚠️ N'utilisez plus l'appareil pour maximiser les chances.\n📞 ${STORE.phone}`;
      break;
    }

    case "domicile":
      leadData = extractLead(message);
      reply = `🏠 Intervention à domicile — Infomac\n\nDisponible Paris 15e et alentours.\nTarif déplacement inclus : 49–99€\nLundi au samedi sur rendez-vous.\n\n📞 ${STORE.phone}\n✉️ ${STORE.email}`;
      break;

    case "appointment":
      reply = `📅 Pas besoin de rendez-vous chez Infomac !\n\n🕐 ${STORE.hours}\n📍 ${STORE.address}\n🚇 ${STORE.metro}\n\nPour une intervention à domicile :\n📞 ${STORE.phone}`;
      break;

    case "garantie":
      reply = `✅ Garantie Infomac\n\n• Écran & pièces : 3 mois\n• Batteries : 6 mois\n• Pièces & main d'oeuvre incluses\n• SAV en boutique sans frais\n\n📞 ${STORE.phone}`;
      break;

    case "formation":
      reply = `🎓 Formation Mac & iPhone — Infomac\n\nSéance d'1h en boutique : 49–99€\nSur rendez-vous uniquement.\n\n📞 ${STORE.phone}\n✉️ ${STORE.email}`;
      break;

    case "entreprise":
      leadData = extractLead(message);
      reply = `🏢 Solutions Entreprises — Infomac\n\nContrat maintenance TPE/PME à partir de 99€/mois :\n• Maintenance préventive et curative\n• Gestion du parc informatique\n• Support prioritaire\n• Interventions sur site\n\n📞 ${STORE.phone}\n✉️ ${STORE.email}`;
      break;

    case "human":
      leadData = extractLead(message);
      reply = `👨‍💻 Bien sûr ! Laissez votre numéro ou email et un technicien vous rappelle dans la journée.\n\n📞 ${STORE.phone}\n✉️ ${STORE.email}\n🕐 ${STORE.hours}`;
      break;

    default:
      reply = `Bonjour 👋 Je suis l'assistant Infomac Paris 15e !\n\n🔧 Réparation iPhone, MacBook, iPad, PC\n💰 Devis & diagnostic gratuit\n🛒 Achat neuf & reconditionné\n🔄 Rachat de votre appareil\n💾 Récupération de données\n🏠 Intervention à domicile\n📍 Horaires & adresse\n\nQue puis-je faire pour vous ?`;
  }

  return { reply, intent, leadData };
}

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "infomac-bot", version: "3.0.0" }));

app.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").slice(0, 500).trim();
  if (!message) return res.status(400).json({ error: "Message vide" });
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  try {
    const { reply, intent, leadData } = await buildReply(message);
    if (process.env.DATABASE_URL) {
      await pool.query("INSERT INTO conversations (ip,message,intent,reponse) VALUES ($1,$2,$3,$4)", [ip, message, intent, reply]);
      if (leadData?.email || leadData?.telephone) {
        await pool.query("INSERT INTO leads (email,telephone,nom,besoin) VALUES ($1,$2,$3,$4)", [leadData.email, leadData.telephone, leadData.nom, message]);
      }
    }
    res.json({ reply, intent, actions: ["devis", "réparation", "achat", "contact"], contact: STORE });
  } catch (err) {
    console.error(err);
    res.json({ reply: `📞 ${STORE.phone} | ✉️ ${STORE.email}`, intent: "fallback", contact: STORE });
  }
});

app.get("/admin/leads", async (req, res) => {
  if (req.headers["x-admin-token"] !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: "Non autorisé" });
  const { rows } = await pool.query("SELECT * FROM leads ORDER BY date DESC LIMIT 100");
  res.json(rows);
});

app.get("/admin/stats", async (req, res) => {
  if (req.headers["x-admin-token"] !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: "Non autorisé" });
  const [c, l, i] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM conversations"),
    pool.query("SELECT COUNT(*) FROM leads"),
    pool.query("SELECT intent, COUNT(*) as total FROM conversations GROUP BY intent ORDER BY total DESC")
  ]);
  res.json({ conversations: c.rows[0].count, leads: l.rows[0].count, intents: i.rows });
});

app.listen(PORT, async () => {
  console.log(`🚀 Infomac Bot v3.0 — port ${PORT}`);
  if (process.env.DATABASE_URL) {
    try { await initDB(); } catch (e) { console.error("DB error:", e.message); }
  }
});
