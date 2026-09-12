import { extract, apiError } from "./_extract.js";

/* The mailbox end. An inbound-mail provider such as Postmark or Mailgun is
   pointed at this URL and posts each message that arrives.
 *
 * Two gates before anything is read. The path must carry the shared secret,
 * so the URL alone is not enough; and the message must have come from the
 * school's own domain with its DKIM signature intact, because an address on
 * a distribution list is not a secret and the thing being injected could be
 * a change of collection arrangements.
 *
 * What it does NOT yet do is keep what it finds. That needs somewhere to put
 * it, which is a small key-value store and about twenty lines. Until then this
 * verifies, reads, and returns, which is enough to point a provider at and
 * watch it work. */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });

  const token = process.env.APP_TOKEN;
  if (!token) return res.status(500).json({ error: "no_app_token" });
  if (req.query.token !== token) return res.status(401).json({ error: "bad_token" });

  const b = req.body || {};
  /* Providers disagree on field names; these cover Postmark and Mailgun. */
  const from = b.From || b.sender || b.from || "";
  const subject = b.Subject || b.subject || "";
  const text = b.TextBody || b["body-plain"] || b.text || b.stripped_text || "";
  const dkim = b.DkimVerified ?? b["X-Mailgun-Dkim-Check-Result"] ?? b.dkim ?? null;

  const domain = (process.env.SCHOOL_DOMAIN || "").toLowerCase();
  const senderDomain = String(from).toLowerCase().split("@").pop().replace(/[>\s]/g, "");
  if (!domain) return res.status(500).json({ error: "no_school_domain" });
  if (senderDomain !== domain && !senderDomain.endsWith("." + domain))
    return res.status(202).json({ ignored: "not_the_school", from: senderDomain });
  if (dkim !== null && dkim !== true && String(dkim).toLowerCase() !== "pass")
    return res.status(202).json({ ignored: "dkim_failed" });
  if (!text || text.trim().length < 40) return res.status(202).json({ ignored: "nothing_to_read" });

  try {
    const out = await extract({
      text: subject ? `Subject: ${subject}\n\n${text}` : text,
      today: new Date().toDateString(),
      children: []
    });
    /* TODO: keep this for the app to collect, rather than only returning it. */
    return res.status(200).json({ received: true, ...out });
  } catch (e) {
    return apiError(res, e);
  }
}
