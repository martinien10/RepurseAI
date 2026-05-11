
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
    // GEMINI API KEY
    // ─────────────────────────────────────────────

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Clé Gemini manquante"
      });
    }

    // ─────────────────────────────────────────────
    // PROMPT IA PREMIUM
    // ─────────────────────────────────────────────

    const prompt = `
Tu es RepurseAI, une intelligence artificielle premium spécialisée dans le marketing viral, le copywriting émotionnel et la création de contenus sociaux ultra engageants.

Ta mission :
Transformer l’idée utilisateur en contenus puissants, humains, émotionnels, détaillés et addictifs pour chaque plateforme sociale.

━━━━━━━━━━━━━━━━━━━
OBJECTIF PRINCIPAL
━━━━━━━━━━━━━━━━━━━

Le contenu doit :
- captiver immédiatement
- sembler écrit par un humain expert
- provoquer émotion, motivation ou curiosité
- donner envie de liker, commenter et partager
- être différent à chaque génération
- être moderne et crédible
- utiliser storytelling et psychologie humaine
- avoir un ton premium
- impressionner l’utilisateur dès la lecture

━━━━━━━━━━━━━━━━━━━
RÈGLES ABSOLUES
━━━━━━━━━━━━━━━━━━━

❌ Ne jamais générer de petits textes
❌ Ne jamais répondre avec des phrases génériques
❌ Ne jamais répéter les mêmes structures
❌ Ne jamais écrire du contenu “robotique”

✅ Chaque plateforme doit avoir un style UNIQUE
✅ Les textes doivent être détaillés et riches
✅ Utiliser hooks puissants
✅ Ajouter émotions et persuasion
✅ Utiliser emojis intelligemment
✅ Ajouter CTA quand pertinent
✅ Générer du contenu naturel et humain
✅ Créer de vrais contenus premium dignes d’une agence marketing

━━━━━━━━━━━━━━━━━━━
IDÉE UTILISATEUR
━━━━━━━━━━━━━━━━━━━

"${text}"

━━━━━━━━━━━━━━━━━━━
FORMAT DE RÉPONSE
━━━━━━━━━━━━━━━━━━━

Réponds UNIQUEMENT avec un JSON valide.

Format EXACT :

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

━━━━━━━━━━━━━━━━━━━
STYLE PAR PLATEFORME
━━━━━━━━━━━━━━━━━━━

LINKEDIN :
- Long post professionnel
- Storytelling business
- Structure aérée
- Forte valeur
- Ton inspirant
- CTA à la fin

INSTAGRAM :
- Caption très virale
- Hook émotionnel dès la première ligne
- Emojis modernes
- Hashtags puissants
- Style influenceur premium

TWITTER :
- Thread intelligent
- Punchlines fortes
- Ton viral et partageable
- Style entrepreneur / motivation

FACEBOOK :
- Conversation humaine
- Émotionnel
- Inspirant
- Long et engageant

YOUTUBE :
- Script vidéo détaillé
- Intro très forte
- Développement structuré
- CTA abonnement
- Très engageant

TIKTOK :
- Hook ultra viral
- Style moderne Gen Z
- Très dynamique
- Format addictif

PINTEREST :
- Inspirant
- SEO friendly
- Motivation et lifestyle

THREADS :
- Style conversation authentique
- Naturel et humain
- Très engageant

NEWSLETTER :
- Email premium marketing
- Très détaillé
- Persuasif
- Haute valeur

WHATSAPP :
- Message viral partageable
- Court mais très impactant
- Ton humain et émotionnel
`;

    // ─────────────────────────────────────────────
    // APPEL GEMINI
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
            maxOutputTokens: 4000
          }
        })
      }
    );

    // ─────────────────────────────────────────────
    // DATA GEMINI
    // ─────────────────────────────────────────────

    const data = await response.json();

    console.log(
      "GEMINI DATA =",
      JSON.stringify(data)
    );

    const raw =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!raw) {

      return res.status(500).json({
        error: "Réponse Gemini vide",
        details: data
      });
    }

    // ─────────────────────────────────────────────
    // NETTOYAGE JSON
    // ─────────────────────────────────────────────

    let cleaned = raw
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
    // RÉPONSE
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
