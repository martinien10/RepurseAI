// api/verify-code.js

const VALID_CODES = [
  "REPURSE2026",
  "PRO-ACCESS",
  "VIP-MARTINIEN"
];

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      valid: false,
      message: "Method not allowed"
    });
  }

  try {
    const code = req.body?.code;

    if (!code) {
      return res.status(400).json({
        valid: false,
        message: "Code manquant"
      });
    }

    const valid = VALID_CODES.includes(
      code.toUpperCase().trim()
    );

    if (!valid) {
      return res.status(401).json({
        valid: false,
        message: "Code incorrect"
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Accès Pro activé"
    });

  } catch (err) {
    return res.status(500).json({
      valid: false,
      message: "Erreur serveur"
    });
  }
};
