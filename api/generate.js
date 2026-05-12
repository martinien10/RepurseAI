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

    if (!apiKey) {
      return res.status(500).json({
        error: "Clé Gemini manquante"
      });
    }

    const prompt = `
Tu es une IA premium de copywriting.

Crée des contenus longs, puissants, humains et viraux.

Sujet :
${text}

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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
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

    console.log(data);

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

   if (!raw) {

  return res.status(500).json({
    error: JSON.stringify(data)
  });
}

    // Extraction simple
    const getSection = (name) => {

      const regex = new RegExp(
        name + ":([\\s\\S]*?)(?=LINKEDIN:|INSTAGRAM:|TWITTER:|FACEBOOK:|YOUTUBE:|TIKTOK:|PINTEREST:|THREADS:|NEWSLETTER:|WHATSAPP:|$)",
        "i"
      );

      const match = raw.match(regex);

      return match ? match[1].trim() : "";
    };

    return res.status(200).json({
      content: {
        linkedin: getSection("LINKEDIN"),
        instagram: getSection("INSTAGRAM"),
        twitter: getSection("TWITTER"),
        facebook: getSection("FACEBOOK"),
        youtube: getSection("YOUTUBE"),
        tiktok: getSection("TIKTOK"),
        pinterest: getSection("PINTEREST"),
        threads: getSection("THREADS"),
        newsletter: getSection("NEWSLETTER"),
        whatsapp: getSection("WHATSAPP")
      }
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}
