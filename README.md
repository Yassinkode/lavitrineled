# La Vitrine LED — site

Site vitrine + formulaire de contact. Chaque demande t'est **envoyée par email automatiquement**,
et le visiteur lit « on vous recontacte sous 24 h ». Pas de devis automatique : c'est toi qui rappelles.

- `index.html` — la page (statique)
- `api/contact.js` — la fonction qui reçoit le formulaire et envoie l'email (Vercel)
- Si la fonction n'est pas joignable, le formulaire ouvre un email pré-rempli en secours (aucun contact perdu).

---

## Mise en ligne depuis un iPad (≈ 15 min)

### 1) Créer un compte Resend (pour recevoir les emails)
1. Va sur **resend.com** → crée un compte (avec l'email où tu veux recevoir les demandes).
2. **API Keys** → *Create API Key* → copie la clé (commence par `re_...`). Garde-la de côté.
3. Pour démarrer, tu peux envoyer depuis `onboarding@resend.dev` vers **ton propre email** sans rien configurer.
   Plus tard, pour envoyer depuis `contact@lavitrineled.fr`, ajoute ton domaine dans Resend (*Domains*).

### 2) Mettre le code sur GitHub
1. Va sur **github.com** → connecte-toi → bouton **+** (en haut à droite) → *New repository*.
2. Nom : `lavitrineled` → *Create repository*.
3. Sur la page du repo : **Add file → Upload files** → dépose `index.html`, `package.json`, `.gitignore`, `README.md`.
4. Pour la fonction : **Add file → Create new file**, tape `api/contact.js` comme nom
   (le `/` crée le dossier `api`), colle le contenu, *Commit*.

### 3) Déployer sur Vercel
1. Va sur **vercel.com** → *Sign up* → **Continue with GitHub**.
2. **Add New… → Project** → choisis le repo `lavitrineled` → *Import*.
3. Avant *Deploy*, ouvre **Environment Variables** et ajoute :
   - `RESEND_API_KEY` = ta clé Resend (`re_...`)
   - `CONTACT_TO` = ton email de réception (ex : `tonadresse@gmail.com`)
   - *(optionnel)* `RESEND_FROM` = `La Vitrine LED <onboarding@resend.dev>`
4. **Deploy**. Au bout de ~1 min tu as une URL `https://lavitrineled.vercel.app`.

### 4) Tester
Ouvre l'URL, remplis le formulaire, envoie → tu reçois l'email de la demande.

### 5) (Optionnel) Ton nom de domaine
Dans Vercel : *Project → Settings → Domains* → ajoute `lavitrineled.fr` et suis les instructions DNS.

---

## À personnaliser dans le code
- `index.html` : la ligne `EMAIL_TO` (email de secours) et le lien Instagram du footer.
- Les types de commerce : dans `index.html`, blocs `<button class="chip" ...>`.

## Alternative sans fonction (encore plus simple)
Tu peux remplacer l'appel `fetch("/api/contact")` par un service comme **Web3Forms** ou **Formspree**
(un seul endpoint, zéro code serveur). Dis-le-moi si tu préfères cette option.
