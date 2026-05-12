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
    // HF TOKEN
    // ─────────────────────────────────────────────

    const token = process.env.HF_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "HF_TOKEN manquant"
      });
    }

    // ─────────────────────────────────────────────
    // PROMPT IA
    // ─────────────────────────────────────────────

    const prompt = `
Tu es RepurseAI, une intelligence artificielle premium spécialisée dans le marketing viral et la création de contenus sociaux puissants.

Transforme cette idée :

"${text}"

en contenus différents et engageants pour plusieurs plateformes.

RÈGLES :
- contenu humain
- storytelling
- émotions
- hooks puissants
- contenu détaillé
- moderne et viral
- ⁠long texte 
- naturel
- éviter les répétitions

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
    // HUGGING FACE + TOGETHER
    // ─────────────────────────────────────────────

    const response = await fetch(
      "https://router.huggingface.co/together/v1/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          prompt: prompt,
          max_tokens: 800,
          temperature: 0.9
        })
      }
    );

    // ─────────────────────────────────────────────
    // SAFE JSON
    // ─────────────────────────────────────────────

    const data = await response.json();

    const raw = data?.choices?.[0]?.text;

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
