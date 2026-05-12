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
    // API KEY
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
Tu es RepurseAI, une IA premium spécialisée dans le copywriting viral.

Transforme cette idée :

"${text}"

en contenus très longs, très puissants, émotionnels, humains et engageants.

Retourne EXACTEMENT ce format :

LINKEDIN:
...

INSTAGRAM:
...

TWITTER:
...

FACEBOOK:
...

YOUTUBE:
...

TIKTOK:
...

PINTEREST:
...

THREADS:
...

NEWSLETTER:
...

WHATSAPP:
...
`;

    // ─────────────────────────────────────────────
    // GEMINI REQUEST
    // ─────────────────────────────────────────────

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey,
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

    console.log("GEMINI =", JSON.stringify(data));

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
    // EXTRACTION
    // ─────────────────────────────────────────────

    function extract(name) {

      const regex = new RegExp(
        name + ":([\\s\\S]*?)(?=LINKEDIN:|INSTAGRAM:|TWITTER:|FACEBOOK:|YOUTUBE:|TIKTOK:|PINTEREST:|THREADS:|NEWSLETTER:|WHATSAPP:|$)",
        "i"
      );

      const match = raw.match(regex);

      return match ? match[1].trim() : "";
    }

    // ─────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────

    return res.status(200).json({
      content: {
        linkedin: extract("LINKEDIN"),
        instagram: extract("INSTAGRAM"),
        twitter: extract("TWITTER"),
        facebook: extract("FACEBOOK"),
        youtube: extract("YOUTUBE"),
        tiktok: extract("TIKTOK"),
        pinterest: extract("PINTEREST"),
        threads: extract("THREADS"),
        newsletter: extract("NEWSLETTER"),
        whatsapp: extract("WHATSAPP")
      }
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}
