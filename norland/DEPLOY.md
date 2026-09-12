# Putting this online

The app is static, so it will run anywhere. The two API endpoints are what make
the email reading work off the artifact, and they need somewhere that can run a
function, which rules out GitHub Pages.

## Vercel

1. Push this repository to GitHub.
2. On vercel.com, **Add New, Project**, import the repository, and deploy. There
   is nothing to configure: no build step, no framework, no output directory.
3. Add four environment variables under **Settings, Environment Variables**, then
   redeploy. They are listed in `.env.example`:
   - `ANTHROPIC_API_KEY`, from console.anthropic.com.
   - `ANTHROPIC_MODEL`, the model the extractor should use.
   - `APP_TOKEN`, any long random string you invent. The app asks for it once
     and keeps it on the device.
   - `SCHOOL_DOMAIN`, the domain school mail must come from.

The app is then live, and the paste box under Alerts, "Read the school's
emails", will work: it asks for the access word once, then posts to
`/api/extract`.

Everything is served with `X-Robots-Tag: noindex`, so it will not turn up in a
search for the school.

## Receiving the school's email

`/api/inbound` is the mailbox end. Take an inbound-mail provider, Postmark and
Mailgun both do this cheaply, give it a forwarding address, and point it at:

    https://<your-deployment>/api/inbound?token=<APP_TOKEN>

Then add that forwarding address to the school's distribution list alongside
your own. Two gates run before anything is read: the token in the path, and the
message having come from `SCHOOL_DOMAIN` with its DKIM signature intact.

**What is not finished.** The endpoint verifies the mail and reads it, but has
nowhere to keep what it finds, so at present it returns the result rather than
holding it for the app to collect. That needs a small key-value store and about
twenty lines. Until it is done, the paste box is the way to see the extraction
working end to end.

## GitHub Pages

If all you want is the app itself, without the email reading, Pages will serve
it from the repository root with no configuration beyond enabling it. The paste
box will then say that reading is unavailable, which is true rather than broken.

## Cost

Vercel's Hobby plan is free and sufficient, provided nobody is charged for the
app. Extraction costs a fraction of a penny per email. The only standing cost
is a domain, if you want one.
