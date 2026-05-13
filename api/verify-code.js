// api/verify-code.js

// ─────────────────────────────
// CODES PRO
// ─────────────────────────────

const VALID_CODES = [

  "REPURSE-A1B2C",
  "REPURSE-D3E4F",
  "REPURSE-G5H6I",
  "REPURSE-J7K8L",
  "REPURSE-M9N0O",

  "REPURSE-P1Q2R",
  "REPURSE-S3T4U",
  "REPURSE-V5W6X",
  "REPURSE-Y7Z8A",
  "REPURSE-B9C0D",

  "REPURSE-E1F2G",
  "REPURSE-H3I4J",
  "REPURSE-K5L6M",
  "REPURSE-N7O8P",
  "REPURSE-Q9R0S",

  "REPURSE-T1U2V",
  "REPURSE-W3X4Y",
  "REPURSE-Z5A6B",
  "REPURSE-C7D8E",
  "REPURSE-F9G0H",

  "REPURSE-I1J2K",
  "REPURSE-L3M4N",
  "REPURSE-O5P6Q",
  "REPURSE-R7S8T",
  "REPURSE-U9V0W",

  "REPURSE-X1Y2Z",
  "REPURSE-A3B4C",
  "REPURSE-D5E6F",
  "REPURSE-G7H8I",
  "REPURSE-J9K0L",

  "REPURSE-M1N2O",
  "REPURSE-P3Q4R",
  "REPURSE-S5T6U",
  "REPURSE-V7W8X",
  "REPURSE-Y9Z0A",

  "REPURSE-B1C2D",
  "REPURSE-E3F4G",
  "REPURSE-H5I6J",
  "REPURSE-K7L8M",
  "REPURSE-N9O0P",

  "REPURSE-Q1R2S",
  "REPURSE-T3U4V",
  "REPURSE-W5X6Y",
  "REPURSE-Z7A8B",
  "REPURSE-C9D0E",

  "REPURSE-F1G2H",
  "REPURSE-I3J4K",
  "REPURSE-L5M6N",
  "REPURSE-O7P8Q",
  "REPURSE-R9S0T"
];

// ─────────────────────────────
// APPAREILS AUTORISÉS
// ─────────────────────────────

const CODE_DEVICES = {};

// ─────────────────────────────
// API
// ─────────────────────────────

module.exports = (req, res) => {

  // CORS

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

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

    // ─────────────────────────────
    // INPUTS
    // ─────────────────────────────

    const code =
      req.body?.code
        ?.toUpperCase()
        ?.trim();

    const deviceId =
      req.body?.deviceId
        ?.trim();

    if (!code) {

      return res.status(400).json({
        valid: false,
        message:
          "⚠️ Entre ton code Pro."
      });
    }

    if (!deviceId) {

      return res.status(400).json({
        valid: false,
        message:
          "⚠️ Appareil non détecté."
      });
    }

    // ─────────────────────────────
    // VALIDATION CODE
    // ─────────────────────────────

    const valid =
      VALID_CODES.includes(code);

    if (!valid) {

      return res.status(401).json({
        valid: false,
        message:
          "🔒 Ce code Pro est invalide."
      });
    }

    // ─────────────────────────────
    // INITIALISE
    // ─────────────────────────────

    if (!CODE_DEVICES[code]) {

      CODE_DEVICES[code] = [];
    }

    // ─────────────────────────────
    // DEVICE DÉJÀ AUTORISÉ
    // ─────────────────────────────

    if (
      CODE_DEVICES[code].includes(deviceId)
    ) {

      return res.status(200).json({
        valid: true,
        message:
          "🚀 Accès Pro restauré."
      });
    }

    // ─────────────────────────────
    // LIMITE 2 APPAREILS
    // ─────────────────────────────

    if (
      CODE_DEVICES[code].length >= 2
    ) {

      return res.status(401).json({
        valid: false,
        message:
          "🔒 Ce code Pro a atteint la limite maximale de 2 appareils autorisés."
      });
    }

    // ─────────────────────────────
    // AJOUT APPAREIL
    // ─────────────────────────────

    CODE_DEVICES[code].push(deviceId);

    // ─────────────────────────────
    // SUCCESS
    // ─────────────────────────────

    return res.status(200).json({
      valid: true,
      message:
        "🚀 Accès Pro activé avec succès !"
    });

  } catch (err) {

    return res.status(500).json({
      valid: false,
      message:
        "Erreur serveur."
    });
  }
};
