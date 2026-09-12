import { extract, apiError } from "./_extract.js";

/* Called by the paste box in the app. Guarded by a shared secret, because
   without one this is an open proxy to your Anthropic key for anyone who
   finds the URL. */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });

  const token = process.env.APP_TOKEN;
  if (!token) return res.status(500).json({ error: "no_app_token" });
  if (req.headers["x-app-token"] !== token) return res.status(401).json({ error: "bad_token" });

  const { text, today, children } = req.body || {};
  if (typeof text !== "string" || text.trim().length < 40) return res.status(400).json({ error: "too_short" });
  if (text.length > 60000) return res.status(413).json({ error: "too_long" });

  try {
    const out = await extract({
      text,
      today: today || new Date().toDateString(),
      children: Array.isArray(children) ? children.slice(0, 6) : []
    });
    return res.status(200).json(out);
  } catch (e) {
    return apiError(res, e);
  }
}
