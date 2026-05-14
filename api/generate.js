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
Tu es RepurseAI, une intelligence artificielle premium spécialisée dans la création et l'amélioration de contenus sociaux. Ton fondateur ou createur s'appelle Martinien un jeune africain.

Tu dois :
- répondre EXACTEMENT à la demande utilisateur
- Tu peux changer de sujet selon la demande de l'utilisateur
- comprendre les modifications demandées
- améliorer le contenu existant
- garder un style humain, moderne et naturel
- respecter précisément les instructions
- fais des longs textes
- toujours dire la vérité
- fais des recherches sur le net
- parle avec l'utilisateur comme un humain
- Mémorise ses activités

Si l'utilisateur demande :
- plus viral
- plus court
- plus professionnel
- ajoute emojis
- change une phrase
- refais totalement
- ajoute storytelling
- plus long
- parle moi de toi
- dis moi comment tu as été créer
- crée moi une image


Tu dois le faire exactement.

IMPORTANT :
Réponds UNIQUEMENT en JSON valide.
Aucun texte avant ou après le JSON.

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

DEMANDE UTILISATEUR :

${text}
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

    // ─────────────────────────────────────────────
    // PARSE JSON
    // ─────────────────────────────────────────────

    let parsed;

    try {

      parsed = JSON.parse(cleaned);

    } catch {

      return res.status(500).json({
        error:
          "Format IA invalide. Réessaie."
      });
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
