export default async function handler(req, res) {

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

    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Texte manquant"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
Tu es RepurseAI.

Transforme le texte utilisateur en contenus marketing ultra puissants.

Tu dois générer :

- linkedin
- instagram
- twitter
- facebook
- youtube
- tiktok
- pinterest
- threads
- newsletter
- whatsapp

IMPORTANT :
- contenu humain
- émotionnel
- viral
- très long
- structuré
- avec emojis
- avec hooks
- avec storytelling
- avec CTA
- différent à chaque fois
- qualité premium

Réponds UNIQUEMENT en JSON valide.

Texte utilisateur :
${text}
`;

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
          ]
        })
      }
    );

    const data = await response.json();

    const raw =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return res.status(500).json({
        error: "Réponse Gemini vide"
      });
    }

    let cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch {

      return res.status(500).json({
        error: "JSON Gemini invalide",
        raw: cleaned
      });
    }

    return res.status(200).json({
      content: parsed
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}
