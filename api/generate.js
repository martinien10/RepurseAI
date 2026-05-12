export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const { text } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Clé Gemini manquante"
      });
    }

    const prompt = `
Tu es RepurseAI.

Crée des contenus longs, puissants, humains et viraux.

Sujet :
${text}

Réponds uniquement en JSON valide :

{
  "linkedin":"...",
  "instagram":"..."
}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
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
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      content: parsed
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}
