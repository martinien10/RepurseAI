export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const { text } = req.body || {};

    if (!text) {
      return res.status(400).json({
        error: "Texte manquant"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Clé OpenAI manquante"
      });
    }

    const prompt = `
Tu es RepurseAI.

Transforme cette idée :

${text}

en contenus puissants viraux long et engageants.

Réponds uniquement en JSON valide :

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

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Tu es une IA premium de copywriting viral."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 1,
          max_tokens: 1800
        })
      }
    );

    const data = await response.json();

    const raw =
      data?.choices?.[0]?.message?.content || "";

    if (!raw) {

      return res.status(500).json({
        error: JSON.stringify(data)
      });
    }

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
