// api/generate.js — Vercel Serverless Function
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBpTnMZjTGGTmJybkUnnAnzf0DsVoScWjY";

const SYSTEM_PROMPT = `Tu es un expert en marketing de contenu et copywriting. Transforme le contenu source en contenu optimisé pour chaque plateforme.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans preamble. Format exact :
{"linkedin":"...","instagram":"...","twitter":"...","facebook":"...","youtube":"...","tiktok":"...","pinterest":"...","threads":"...","newsletter":"...","whatsapp":"..."}
Règles :
- linkedin : post pro 150-200 mots, accroche forte, emojis, CTA
- instagram : caption 100-150 mots, emojis, storytelling, + 20 hashtags
- twitter : thread 6 tweets numérotés (1/6...6/6), max 280 car chacun
- facebook : post 200-250 mots, storytelling, question finale
- youtube : titre accrocheur + description 200-300 mots avec timestamps
- tiktok : script 60s [HOOK 0-3s][CONTENU 3-50s][CTA 50-60s]
- pinterest : titre 60 car + description 150 mots SEO
- threads : 5 posts courts viraux, ton décontracté
- newsletter : objet + preview + intro + corps + CTA + signature
- whatsapp : message viral court, conversationnel, max 3 paragraphes
Si texte français → réponds français. Si anglais → réponds anglais.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body || {};
  if (!text || text.trim().length < 50)
    return res.status(400).json({ error: "Texte trop court (min. 50 caractères)" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT + "\n\nTransforme ce contenu :\n\n" + text }
              ]
            }
          ],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2000 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || "Erreur Gemini API");
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(clean); }
    catch {
      const m = clean.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error("Réponse IA invalide");
    }

    return res.status(200).json({ success: true, content: parsed });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
