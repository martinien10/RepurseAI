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
    // PROMPT
    // ─────────────────────────────────────────────

    const prompt = `
Tu es RepurseAI, une intelligence artificielle spécialisée dans la création de contenus viraux et marketing.

Transforme cette idée :

"${text}"

en contenus puissants, humains, engageants et modernes.

RÈGLES :
- chaque plateforme doit avoir un style différent
- le contenu doit être naturel
- ajoute storytelling, émotions et hooks
- évite les textes génériques
- rends les contenus intéressants à lire
- les réponses doivent être longues
- ajoute des hashtags quand pertinent

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

STYLE :

LINKEDIN :
Post professionnel détaillé.

INSTAGRAM :
Caption virale avec emojis et hashtags.

TWITTER :
Thread dynamique et motivation.

FACEBOOK :
Post émotionnel et humain.

YOUTUBE :
Script vidéo engageant.

TIKTOK :
Hook ultra viral.

PINTEREST :
Inspiration lifestyle.

THREADS :
Conversation naturelle.

NEWSLETTER :
Email marketing premium.

WHATSAPP :
Message court mais puissant.
`;

    // ─────────────────────────────────────────────
    // HUGGING FACE API
    // ─────────────────────────────────────────────

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/gpt2",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 400,
            temperature: 0.9,
            top_p: 0.95,
            return_full_text: false
          }
        })
      }
    );

    // ─────────────────────────────────────────────
    // SAFE JSON PARSE
    // ─────────────────────────────────────────────

    const textResponse = await response.text();

    let data;

    try {

      data = JSON.parse(textResponse);

    } catch {

      return res.status(500).json({
        error: textResponse
      });
    }

    // ─────────────────────────────────────────────
    // RAW OUTPUT
    // ─────────────────────────────────────────────

    const raw = data?.[0]?.generated_text;

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

      // fallback si JSON cassé

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
