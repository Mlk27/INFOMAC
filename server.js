import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Base de données PostgreSQL ───────────────────────────────────────────────
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      date TIMESTAMP DEFAULT NOW(),
      ip TEXT,
      message TEXT,
      intent TEXT,
      reponse TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      date TIMESTAMP DEFAULT NOW(),
      nom TEXT,
      email TEXT,
      telephone TEXT,
      besoin TEXT,
      statut TEXT DEFAULT 'nouveau'
    );

    CREATE TABLE IF NOT EXISTS catalogue (
      id SERIAL PRIMARY KEY,
      categorie TEXT,
      appareil TEXT,
      panne TEXT,
      prix_min INTEGER,
      prix_max INTEGER,
      delai TEXT,
      actif BOOLEAN DEFAULT TRUE
    );
  `);

  // Insérer des tarifs de base si la table est vide
  const { rows } = await pool.query("SELECT COUNT(*) FROM catalogue");
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO catalogue (categorie, appareil, panne, prix_min, prix_max, delai) VALUES
      ('reparation', 'iPhone', 'Écran cassé', 59, 149, '1h'),
      ('reparation', 'iPhone', 'Batterie', 49, 79, '30min'),
      ('reparation', 'iPhone', 'Connecteur charge', 49, 89, '1h'),
      ('reparation', 'MacBook', 'Écran cassé', 199, 399, '24-48h'),
      ('reparation', 'MacBook', 'Clavier', 149, 299, '24-48h'),
      ('reparation', 'MacBook', 'Batterie', 129, 249, '1-2h'),
      ('reparation', 'iPad', 'Écran cassé', 99, 199, '2-4h'),
      ('reparation', 'PC', 'Écran cassé', 99, 249, '24-48h'),
      ('reparation', 'PC', 'Batterie', 69, 149, '1-2h'),
      ('reparation', 'Tout appareil', 'Récupération données', 89, 299, '24-72h')
    `);
  }

  console.log("✅ Base de données initialisée");
}

// ─── Constantes boutique ─────────────────────────────────────────────────────
const STORE = {
  phone:   "01 75 57 86 60",
  email:   "contact@infomac.fr",
  address: "82 Rue des Entrepreneurs, 75015 Paris",
  hours:   "Lun–Ven 10h–13h / 14h–18h30 · Sam 10h–13h / 14h–18h"
};

// ─── Détection d'intention ────────────────────────────────────────────────────
function detectIntent(text = "") {
  const t = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (/(horaire|adresse|telephone|mail|email|contact|ou etes|localise|trouver)/.test(t))
    return "contact";

  if (/(rendez.?vous|rdv|deposer|prise en charge|appointment)/.test(t))
    return "appointment";

  if (/(revendre|reprise|rachat|occasion|vendre mon)/.test(t))
    return "buyback";

  if (/(donnee|fichier|recuperation|disque dur|ssd perdu|sauvegarde)/.test(t))
    return "data";

  if (/(repare|reparer|casse|ecran|batterie|panne|allume|liquide|eau|tombe|choc|vitre|tactile|clavier|charge|lent|virus|freeze|bloque)/.test(t))
    return "repair";

  if (/(prix|tarif|combien|devis|cout|gratuit|estimation)/.test(t))
    return "quote";

  if (/(humain|conseiller|technicien|parler|rappel|callback)/.test(t))
    return "human";

  if (/(acheter|vente|stock|neuf|occasion|macbook|mac|iphone|ipad|pc|accessoire|chargeur|coque|clavier|souris|produit)/.test(t))
    return "sales";

  if (/(bonjour|salut|hello|bonsoir|aide|besoin|probleme|question)/.test(t))
    return "default";

  return "default";
}

// ─── Extraction de lead depuis le message ────────────────────────────────────
function extractLead(text = "") {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+33|0)[1-9][\s.-]?(\d{2}[\s.-]?){4}/);
  const nomMatch   = text.match(/(?:je suis|m'appelle|appelle moi|c'est)\s+([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)?)/i);

  return {
    email:     emailMatch ? emailMatch[0] : null,
    telephone: phoneMatch ? phoneMatch[0].replace(/[\s.-]/g, "") : null,
    nom:       nomMatch   ? nomMatch[1]   : null
  };
}

// ─── Construction de la réponse ───────────────────────────────────────────────
async function buildReply(message = "") {
  const intent = detectIntent(message);
  let reply = "";
  let leadData = null;

  switch (intent) {

    case "contact":
      reply = `📍 INFOMAC — Paris 15e\n${STORE.address}\n📞 ${STORE.phone}\n✉️ ${STORE.email}\n🕐 ${STORE.hours}`;
      break;

    case "repair": {
      // Chercher dans le catalogue
      const t = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let appareil = "Tout appareil";
      if (/iphone/.test(t)) appareil = "iPhone";
      else if (/macbook|mac/.test(t)) appareil = "MacBook";
      else if (/ipad/.test(t)) appareil = "iPad";
      else if (/pc|windows|ordinateur/.test(t)) appareil = "PC";

      const { rows } = await pool.query(
        "SELECT * FROM catalogue WHERE actif = TRUE AND appareil = $1 LIMIT 4",
        [appareil]
      );

      if (rows.length > 0) {
        const tarifs = rows.map(r =>
          `• ${r.panne} : ${r.prix_min}–${r.prix_max}€ (${r.delai})`
        ).join("\n");
        reply = `🔧 Réparation ${appareil} — nos tarifs :\n${tarifs}\n\nDiagnostic gratuit. Donnez-moi le modèle exact et la panne pour un devis précis.`;
      } else {
        reply = `🔧 Je peux vous aider pour une réparation. Donnez-moi le modèle exact de l'appareil et la panne. Diagnostic toujours gratuit chez Infomac.`;
      }
      break;
    }

    case "quote":
      reply = `💰 Pour un devis précis, indiquez :\n• Le modèle de l'appareil\n• La panne ou le problème\n• Votre email ou téléphone\n\nJe vous réponds rapidement. Diagnostic gratuit en boutique.`;
      leadData = extractLead(message);
      break;

    case "sales":
      reply = `🛒 Nous vendons des produits Apple reconditionnés et accessoires.\nContactez-nous pour connaître le stock disponible :\n📞 ${STORE.phone}\n✉️ ${STORE.email}`;
      break;

    case "buyback":
      reply = `🔄 Reprise d'appareil : donnez le modèle, la capacité, l'état général et vos coordonnées. Nous vous faisons une offre rapidement.`;
      leadData = extractLead(message);
      break;

    case "data":
      reply = `💾 Récupération de données : nous intervenons sur disques durs, SSD, Mac, PC et iPhone.\nTarifs : 89–299€ selon complexité.\nApportez l'appareil en boutique pour diagnostic gratuit.`;
      break;

    case "appointment":
      reply = `📅 Pas besoin de rendez-vous ! Vous pouvez passer directement en boutique.\n🕐 ${STORE.hours}\n📍 ${STORE.address}\nOu appelez le ${STORE.phone} pour une prise en charge rapide.`;
      break;

    case "human":
      reply = `👨‍💻 Je comprends. Laissez votre numéro ou email, un technicien vous rappelle dans la journée.\nOu appelez directement : 📞 ${STORE.phone}`;
      leadData = extractLead(message);
      break;

    default:
      reply = `Bonjour 👋 Je suis l'assistant Infomac.\nJe peux vous aider pour :\n• 🔧 Réparation iPhone, MacBook, iPad, PC\n• 💰 Devis gratuit\n• 🛒 Achat / reprise\n• 💾 Récupération de données\n• 📍 Infos boutique\n\nQue puis-je faire pour vous ?`;
  }

  return { reply, intent, leadData };
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "infomac-bot", version: "2.0.0" });
});

app.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").slice(0, 500).trim();
  if (!message) return res.status(400).json({ error: "Message vide" });

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const { reply, intent, leadData } = await buildReply(message);

    // Sauvegarder la conversation
    await pool.query(
      "INSERT INTO conversations (ip, message, intent, reponse) VALUES ($1, $2, $3, $4)",
      [ip, message, intent, reply]
    );

    // Sauvegarder le lead si détecté
    if (leadData && (leadData.email || leadData.telephone)) {
      await pool.query(
        "INSERT INTO leads (email, telephone, nom, besoin) VALUES ($1, $2, $3, $4)",
        [leadData.email, leadData.telephone, leadData.nom, message]
      );
    }

    res.json({
      reply,
      intent,
      actions: ["devis", "réparation", "achat", "contact"],
      contact: STORE
    });

  } catch (err) {
    console.error("Erreur /chat :", err);
    res.json({
      reply: `Bonjour ! Pour nous contacter : 📞 ${STORE.phone} ou ✉️ ${STORE.email}`,
      intent: "fallback",
      actions: ["contact"],
      contact: STORE
    });
  }
});

// Route admin — voir les leads (protégée par token)
app.get("/admin/leads", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { rows } = await pool.query("SELECT * FROM leads ORDER BY date DESC LIMIT 100");
  res.json(rows);
});

// Route admin — statistiques
app.get("/admin/stats", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const [convs, leads, intents] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM conversations"),
    pool.query("SELECT COUNT(*) FROM leads"),
    pool.query("SELECT intent, COUNT(*) as total FROM conversations GROUP BY intent ORDER BY total DESC")
  ]);
  res.json({
    total_conversations: convs.rows[0].count,
    total_leads: leads.rows[0].count,
    intents: intents.rows
  });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Infomac Bot démarré sur port ${PORT}`);
  if (process.env.DATABASE_URL) {
    await initDB();
  } else {
    console.warn("⚠️ DATABASE_URL non définie — base de données désactivée");
  }
});
