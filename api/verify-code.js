// api/verify-code.js — Vérifie les codes clients après paiement Lemon Squeezy

// ✅ Ajoute ici chaque code envoyé par email à tes clients après paiement
const VALID_CODES = [
  "REPURSE2026",
  "PRO-ACCESS",
  "VIP-MARTINIEN",
  // Ajoute de nouveaux codes ici au fur et à mesure des paiements
];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Code manquant" });

  const valid = VALID_CODES.includes(code.toUpperCase().trim());
  return res.status(200).json({ valid });
}
