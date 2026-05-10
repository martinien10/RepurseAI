# RepurseAI — Guide de déploiement Vercel

## Structure du projet
```
repurseai/
├── index.html          ← Site complet (frontend)
├── vercel.json         ← Config Vercel
├── api/
│   ├── generate.js     ← Backend génération Gemini
│   └── verify-code.js  ← Backend vérification codes
└── README.md
```

## 🚀 Déploiement en 5 minutes

### Étape 1 — Mettre le code sur GitHub
1. Va sur github.com → New repository → Nom : `repurseai`
2. Upload tous les fichiers (index.html, vercel.json, api/)
3. Commit

### Étape 2 — Connecter à Vercel
1. Va sur vercel.com → Add New Project
2. Importe ton repo GitHub `repurseai`
3. Clique Deploy (sans rien changer)

### Étape 3 — Ton site est en ligne ! 🎉
Vercel te donne une URL comme : `repurseai.vercel.app`

---

## 🔑 Ajouter de nouveaux codes clients

Quand un client paie sur Lemon Squeezy, tu lui envoies un code manuellement par Gmail.
Ensuite ouvre `api/verify-code.js` et ajoute le code dans la liste :

```js
const VALID_CODES = [
  "REPURSE2026",
  "PRO-ACCESS",
  "VIP-MARTINIEN",
  "RP-NOUVEAU-CLIENT",  // ← Ajoute ici
];
```

Puis commit → Vercel redéploie automatiquement.

---

## ⚠️ Important
- La clé API Gemini est dans `api/generate.js`
- Si tu veux la sécuriser davantage : Vercel Dashboard → Settings → Environment Variables → Ajoute `GEMINI_API_KEY`
- Puis dans generate.js : `const GEMINI_API_KEY = process.env.GEMINI_API_KEY;`
