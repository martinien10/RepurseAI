export default async function handler(req, res) {

  // ─────────────────────────────────────────────
  // CORS
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

    const isPro = req.body?.isPro || false;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({
        error: "Texte trop court"
      });
    }

    // ─────────────────────────────────────────────
    // API KEY
    // ─────────────────────────────────────────────

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GROQ_API_KEY manquant"
      });
    }

    // ─────────────────────────────────────────────
    // PROMPT
    // ─────────────────────────────────────────────

    const prompt = `
Tu es RepurseAI, une intelligence artificielle premium spécialisée dans le marketing viral et les contenus sociaux.

Transforme cette idée :

"${text}"

en contenus modernes, humains, engageants et détaillés.

RÈGLES :
- Chaque plateforme doit avoir un style différent
- Utiliser storytelling et émotions
- Ajouter hooks puissants
- Contenus longs et premium
- Naturel et humain
- Éviter les répétitions
- Ajouter hashtags quand utile

FORMAT JSON OBLIGATOIRE :

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
    // GROQ API
    // ─────────────────────────────────────────────

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.9,
          max_tokens: 1800
        })
      }
    );

    const data = await response.json();

    // ─────────────────────────────────────────────
    // RAW RESPONSE
    // ─────────────────────────────────────────────

    const raw =
      data?.choices?.[0]?.message?.content;

    if (!raw) {

      return res.status(500).json({
        error: JSON.stringify(data)
      });
    }

    // ─────────────────────────────────────────────
    // CLEAN JSON
    // ─────────────────────────────────────────────

    let cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {

      parsed = JSON.parse(cleaned);

    } catch {

      parsed = {
        linkedin: cleaned,
        instagram: cleaned,
        twitter: cleaned,
        facebook: cleaned,
        youtube: cleaned,
        tiktok: cleaned,
        pinterest: cleaned,
        threads: cleaned,
        newsletter: cleaned,
        whatsapp: cleaned
      };
    }

    // ─────────────────────────────────────────────
    // FREE LIMIT
    // ─────────────────────────────────────────────

    if (!isPro) {

      parsed = {
        linkedin: parsed.linkedin,
        instagram: parsed.instagram
      };
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
