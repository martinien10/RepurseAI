export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // MÉTHODE
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { text } = req.body || {};

    // VALIDATION
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error: "Minimum 50 caractères requis"
      });
    }

    const cleanText = text.trim();

    // ─────────────────────────────────────
    // GÉNÉRATION CONTENUS
    // ─────────────────────────────────────

    const content = {

      linkedin:
`🚀 ${cleanText}

Voici les 3 leçons importantes :

✅ Construire chaque jour
✅ Être constant
✅ Publier régulièrement

Qu'en penses-tu ? 👇`,

      instagram:
`✨ ${cleanText}

🔥 Ce contenu peut changer ta manière de travailler.

💡 Sauvegarde ce post pour plus tard.

#business #motivation #success #entrepreneur`,

      twitter:
`🚀 ${cleanText}

La clé :
→ discipline
→ constance
→ patience.`,

      facebook:
`🔥 ${cleanText}

Tu es d'accord avec ça ? 👀

Dis-moi en commentaire.`,

      youtube:
`🎥 TITRE : ${cleanText}

📌 Dans cette vidéo :
- stratégie
- conseils
- méthode
- erreurs à éviter

Abonne-toi pour plus 🚀`,

      tiktok:
`🎬 Hook :
"${cleanText}"

Finis la vidéo avec :

"Like & abonne-toi 🚀"`,

      pinterest:
`📌 ${cleanText}

Idée business & productivité.`,

      threads:
`${cleanText}

Les gens compliquent trop les choses.`,

      newsletter:
`📧 Sujet : ${cleanText}

Voici les points importants à retenir cette semaine...`,

      whatsapp:
`💬 ${cleanText}

Partage ça à quelqu'un qui doit voir ça 👇`
    };

    // ─────────────────────────────────────
    // RETOUR API
    // ─────────────────────────────────────

    return res.status(200).json({
      success: true,
      content
    });

  } catch (err) {

    return res.status(500).json({
      error: "Erreur serveur"
    });

  }
}
