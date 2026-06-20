// api/contact.js — Fonction serverless Vercel (Node.js)
// Reçoit le formulaire de contact et te l'envoie par email via Resend.
// Aucune dépendance npm : on utilise fetch (inclus dans Node 18+ sur Vercel).
//
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   RESEND_API_KEY  = ta clé API Resend (resend.com)
//   CONTACT_TO      = l'email où recevoir les demandes (ex: toi@gmail.com)
//   RESEND_FROM     = (optionnel) ex: "La Vitrine LED <onboarding@resend.dev>"

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(k, v) {
  return '<div style="padding:9px 0;border-top:1px solid #EEF1F4">' +
    '<div style="font-size:12px;color:#7A8794;text-transform:uppercase;letter-spacing:.04em">' + escapeHtml(k) + "</div>" +
    '<div style="font-size:15px;color:#16222F;margin-top:2px">' + v + "</div></div>";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
  }

  try {
    var body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; }
    }
    body = body || {};

    var commerce = (body.commerce || "").toString().trim();
    var nom = (body.nom || "").toString().trim();
    var tel = (body.tel || "").toString().trim();
    var email = (body.email || "").toString().trim();
    var projet = (body.projet || "").toString().trim();
    var website = (body.website || "").toString().trim(); // honeypot anti-spam

    // Un bot a rempli le champ caché : on fait semblant d'accepter, sans rien envoyer.
    if (website) return res.status(200).json({ ok: true });

    if (!commerce || !nom || !tel || !email) {
      return res.status(400).json({ ok: false, error: "Champs requis manquants" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Email invalide" });
    }

    var KEY = process.env.RESEND_API_KEY;
    var TO = process.env.CONTACT_TO;
    var FROM = process.env.RESEND_FROM || "La Vitrine LED <onboarding@resend.dev>";

    if (!KEY || !TO) {
      return res.status(500).json({ ok: false, error: "Configuration email manquante (RESEND_API_KEY / CONTACT_TO)" });
    }

    var html =
      '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">' +
        '<div style="background:#16222F;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">' +
          '<h2 style="margin:0;font-size:18px">Nouvelle demande de contact</h2>' +
          '<p style="margin:4px 0 0;color:#B9C6D2;font-size:13px">La Vitrine LED · formulaire du site</p>' +
        '</div>' +
        '<div style="border:1px solid #E5E8EC;border-top:none;border-radius:0 0 12px 12px;padding:18px 22px">' +
          row("Type de commerce", escapeHtml(commerce)) +
          row("Nom & prénom", escapeHtml(nom)) +
          row("Téléphone", '<a href="tel:' + escapeHtml(tel) + '">' + escapeHtml(tel) + "</a>") +
          row("Email", '<a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + "</a>") +
          row("Projet", escapeHtml(projet || "—")) +
        "</div>" +
      "</div>";

    var text =
      "Nouvelle demande de contact - La Vitrine LED\n\n" +
      "Type de commerce : " + commerce + "\n" +
      "Nom : " + nom + "\n" +
      "Telephone : " + tel + "\n" +
      "Email : " + email + "\n\n" +
      "Projet : " + (projet || "-") + "\n";

    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: "Contact - " + commerce + " - " + nom,
        html: html,
        text: text
      })
    });

    if (!r.ok) {
      var detail = await r.text();
      return res.status(502).json({ ok: false, error: "Envoi email échoué", detail: detail });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e && e.message) || "Erreur serveur" });
  }
};
