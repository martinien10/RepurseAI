export default async function handler(req, res) {

  // ─────────────────────────────────────────────
  // HEADERS
  // ─────────────────────────────────────────────

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    // ─────────────────────────────────────────────
    // INPUT
    // ─────────────────────────────────────────────

    const { text } = req.body || {};

    if (!text || text.trim().length < 5) {
      return res.status(400).json({
        error: "Texte trop court"
      });
    }

    // ─────────────────────────────────────────────
    // GEMINI KEY
    // ─────────────────────────────────────────────

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Clé Gemini manquante"
      });
    }

    // ─────────────────────────────────────────────
    // PROMPT
    // ─────────────────────────────────────────────

    const prompt = `
Tu es RepurseAI, une intelligence artificielle premium spécialisée dans le marketing viral, le copywriting émotionnel et la création de contenus sociaux ultra engageants.

Transforme cette idée :

"${text}"

contenus engageants viraux et modernes.

Chaque plateforme doit avoir un style totalement différent.

━━━━━━━━━━━━━━━━━━━

LINKEDIN :
Post professionnel storytelling.

INSTAGRAM :
Caption virale avec emojis et hashtags.

TWITTER :
Thread viral et punchy.

FACEBOOK :
Post émotionnel et humain.

YOUTUBE :
Script vidéo détaillé.

TIKTOK :
Hook ultra viral.

PINTEREST :
Inspirant et lifestyle.

THREADS :
Conversation naturelle.

NEWSLETTER :
Email marketing premium.

WHATSAPP :
Message court mais très puissant.

━━━━━━━━━━━━━━━━━━━

Réponds UNIQUEMENT avec un JSON valide :

{
  "linkedin":"...",
  "instagram":"...",
  "twitter":"...",
  "facebook":"...",
  "youtube":"...",
  "tiktok":"...",
  "pinterest":"...",
  "threads":"...",
  "newsletter":"...",
  "whatsapp":"..."
}
`;

    // ─────────────────────────────────────────────
    // GEMINI REQUEST
    // ─────────────────────────────────────────────

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1800
          }
        })
      }
    );

    // ─────────────────────────────────────────────
    // GEMINI DATA
    // ─────────────────────────────────────────────

    const data = await response.json();

    console.log(
      "GEMINI RESPONSE =",
      JSON.stringify(data)
    );

    const raw =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("\n") || "";

    if (!raw) {

      return res.status(500).json({
        error: JSON.stringify(data)
      });
    }

    // ─────────────────────────────────────────────
    // CLEAN JSON
    // ─────────────────────────────────────────────

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {

      parsed = JSON.parse(cleaned);

    } catch (e) {

      return res.status(500).json({
        error: "JSON Gemini invalide",
        raw: cleaned
      });
    }

    // ─────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────

    return res.status(200).json({
      content: parsed
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}
