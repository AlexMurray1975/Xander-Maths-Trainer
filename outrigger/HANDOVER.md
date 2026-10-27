# Handover

This is the complete Outrigger Impact website: every source file, the build
script, the deployable output, the verification suite, and the register of where
each claim on the site came from.

It was built for Outrigger by Conviction Capital. It is yours to run.

---

## The short version

You do not need a developer to change the wording on this site. You do need
someone to read §5 before they publish anything, because two of the pages sit
close to a regulatory line and the site is built to keep them on the right side
of it.

---

## 1 · What you have

```
build.py            assembles the site. Python standard library only.
bundle.py           packs the built site into one shareable preview.html
extract_copy.py     pulls all the site's text out for review in Word
tools/verify.py     checks contrast, overflow, console errors, and §5
_src/pages/         one file per page. This is where the words live.
_src/partials/      the header, footer and <head>, shared by every page
public/             the deployable site. This is what a host serves.
CLAIMS.md           every figure on the site, and where it came from. Read it.
README.md           how the build works, in detail
```

**No dependencies.** No npm, no framework, no build pipeline that rots. If
Python 3 runs, the site builds. That was a deliberate choice: a marketing site
that needs a toolchain to change a sentence stops getting changed.

## 2 · Making a change

```bash
python3 build.py          # _src/ -> public/
python3 tools/verify.py   # check it before anyone sees it
```

Edit the words in `_src/pages/`, not in `public/`. Anything you change in
`public/` is overwritten the next time the site builds.

`tools/verify.py` needs a browser to measure against. Once, on each machine:

```bash
pip install playwright pillow numpy
playwright install chromium
```

The full publishing loop, including how the change reaches the live site, is in
§4.

## 3 · Putting it on the web

There are two routes. Take the first unless you have a reason not to.

### Route A — GitHub and Vercel (recommended)

This gives you a full history of every change, a free host, and automatic
publishing: you change a word, and the live site updates itself a minute later.
It is how the site has been run so far.

**Step 1. Put the files in a repository.**

1. Go to github.com and create an account if nobody at Outrigger has one.
2. Click **New repository**. Name it `outrigger-website`.
3. Set it to **Private**. This matters: `CLAIMS.md` records open issues about
   published claims, and it is not written for public reading.
4. Tick "Add a README file" so the repository is not empty, then **Create**.
5. On the repository page, click **Add file → Upload files**, drag in
   *everything from this folder*, and click **Commit changes** at the bottom.

**Step 2. Connect it to a host.**

1. Go to vercel.com and sign up **with your GitHub account** — that way it can
   see your repositories without any further setup.
2. Click **Add New → Project**, find `outrigger-website`, click **Import**.
3. Before deploying, open **Root Directory** and set it to `public`.
   Leave Build Command and Output Directory empty.
4. Expand **Build and Output Settings** and make sure **"Include files outside
   root directory"** is **off**.
5. Click **Deploy**.

A minute later you have a working site at something like
`outrigger-website.vercel.app`. Check it, then move on to the domain.

**Why `public` and not the whole folder.** The host only ever sees `public/`,
so it physically cannot serve your sources, your build script, or `CLAIMS.md` —
even if somebody misconfigures something later. That boundary is the security
model, not a tidiness preference. Keep it.

### Step 3. Point outriggerimpact.com at it

In Vercel: **Settings → Domains → Add**, type `outriggerimpact.com`, and Vercel
will show you the exact DNS records to create. Read them off that screen rather
than from anyone's notes, including these: the values change.

Then add those records wherever the domain is registered (GoDaddy, Namecheap,
123-reg and so on), in the DNS or "manage DNS" section.

> **Do not switch the nameservers.** Add only the records Vercel asks for —
> normally an `A` record for the bare domain and a `CNAME` for `www`. Changing
> nameservers moves DNS wholesale and takes the **MX records with it, which
> stops your email**. Adding individual records leaves email untouched and is
> completely safe.

Allow up to an hour for the change to take effect, though it is usually minutes.
Keep any existing hosting running until the new site has been live for a week:
cancelling it is the one irreversible step and there is no hurry.

### Route B — no GitHub at all

If you would rather not use GitHub, Netlify will host the site from a folder you
drag onto a web page.

1. Go to app.netlify.com and sign up.
2. Find **"Deploy manually"** or drag-and-drop area.
3. Drag the **`public` folder** (not the whole project) onto it.
4. Add your domain under **Domain settings**, following the same DNS warning
   above.

To publish a change you run `python3 build.py` and drag `public` on again.

The cost of this route: no history, no record of who changed what or when, and
no way to undo a bad edit except from your own copy. For a regulated firm's
website that is a real downside, which is why Route A is recommended.

## 4 · Running it from then on

The loop for any change is the same four steps:

```bash
# 1. edit the words in _src/pages/
python3 build.py          # 2. rebuild
python3 tools/verify.py   # 3. check it
# 4. publish
```

**Publishing** depends on the route you took:

- *Route A:* commit the change. On github.com that is **Add file → Upload
  files** again, or editing the file directly with the pencil icon and clicking
  **Commit changes**. Vercel notices and redeploys within a minute. If you are
  working on your own computer, `git add -A && git commit -m "..." && git push`.
- *Route B:* drag `public` onto Netlify again.

**Never skip step 3.** `tools/verify.py` is what stands between a small edit and
a public breach of §5 below. It takes about thirty seconds.

**Never edit anything in `public/`.** It is generated. Your change will be
silently destroyed the next time anyone runs `build.py`. The words live in
`_src/pages/`.

### Accounts, and who holds them

Create the GitHub and Vercel accounts under an **Outrigger** address, not a
personal one, and not Conviction Capital's. Both are free at this size. If
either account is tied to someone who later leaves, you lose the ability to
publish your own website, which is a bad afternoon.

## 5 · The part that matters: the regulatory perimeter

Outrigger Impact is the trading name of Oceanwide Limited, an Appointed
Representative of Robert Quinn Advisory LLP. Information about Outrigger Impact
Fund I — its strategy, capital structure, terms, fees and target returns — is a
**financial promotion** under FSMA 2000 s.21. It cannot be published on a public
website.

The site is built so that it describes the *firm* and never the *offer*. Fund
material goes to Professional Clients and Eligible Counterparties on request,
after the manager's eligibility checks.

**`tools/verify.py` enforces this.** It fails the build if a banned phrase
appears on a public page — tranche, management fee, target return, gross IRR and
others. Two pages carry documented exemptions, listed in the script with their
reasons. If you find yourself wanting to add a third, that is the moment to call
Robert Quinn rather than edit the list.

**Material changes to claims, named investors, figures, photography or the
public/private boundary should go back through the principal for approval.**

## 6 · Open items, before anything goes live

These are in `CLAIMS.md` in full. The ones that need a decision rather than a
keystroke:

1. **The ocean-share figure.** The site, and the published press release of
   28 July 2026, say Big Ocean States steward around 30% of the world's ocean.
   Working from the site's own VLIZ dataset, the figure is roughly 7% of the
   ocean, or about 17% of global EEZ area. It is overstated by roughly
   fourfold. It is a published claim by an FCA Appointed Representative and it
   engages the anti-greenwashing rule (ESG 4.3.1), so it is the manager's and
   Robert Quinn's to settle, not a website edit. **This is the most important
   item on the list.**
2. **Imagery.** The photography was generated, not photographed. Several
   captions name real organisations and real places. Either caption them as
   illustrations or obtain real photographs. The five team portraits need a
   separate answer: if they are generated, they are synthetic likenesses of five
   named people, and each of them should agree to it.
3. **The enquiry form has no endpoint.** It currently opens the visitor's own
   mail client, which the page says plainly. It needs a real endpoint before
   launch.
4. **Grantee consent.** Confirm each named grantee is content to be named, and
   that the expected-outcome figures are still right.
5. **Robert Quinn has not seen the Strategy page.**

## 7 · Running it with Claude Code

This is the intended way to maintain the site. Anyone at Outrigger can ask for
changes in plain English — "change the headline on the impact page", "add a news
item about the GEF grant", "the team page needs a sixth person" — and Claude
will make them, run the checks and explain what it did.

### Which version, and what each one needs

Claude Code comes in several forms, and they do not all take the same input.

| | What you point it at | Works from this zip alone? |
|---|---|---|
| **Desktop app** (Mac/Windows) | a folder on your computer | **Yes** — unzip and open the folder |
| **Terminal** (`claude` command) | the folder you are sitting in | **Yes** — unzip, `cd` into it, run `claude` |
| **VS Code / JetBrains** | the folder open in your editor | **Yes** — unzip and open it |
| **Web** (claude.ai/code) | a GitHub repository | **No** — needs the repository from §3 first |

So: if you want to start this afternoon with nothing else set up, **unzip this
folder and open it in the Claude Code desktop app**. That works immediately, and
Claude can edit, build and verify the site straight away.

### But do the GitHub step anyway

Working from a loose folder gets you editing, and nothing else. You would have:

- no history, so no way to see what changed or undo a bad edit;
- no automatic publishing, so every change needs a manual upload;
- one copy, on one laptop, with no backup.

The repository in §3 takes about ten minutes and fixes all three. It also
unlocks the web version, so somebody can fix a typo from a phone without having
the files on the machine in front of them.

**Recommended order:** do §3 first, then point whichever Claude Code you prefer
at the result. The desktop app and the terminal work on the cloned folder
exactly as they would on the unzipped one.

### Three things to tell whoever picks it up

- **Point them at `CLAIMS.md` and §5 above.** Claude writes good copy and has no
  way of knowing which sentences are load-bearing for FCA purposes unless it is
  told. It will otherwise cheerfully add the fund's terms to the site, because
  they make the page more persuasive.
- **Always run `python3 tools/verify.py` before publishing.** Just ask Claude to
  run it. It catches what the eye does not: this suite found an invalid colour
  value, an accent failing contrast at small sizes, and a class of headings
  rendering white-on-white, none of which looked wrong in a screenshot.
- **Edit `_src/`, never `public/`.** Claude will read this from `README.md`, but
  it is the one mistake that silently destroys work.

## 8 · Keeping the register current

`CLAIMS.md` is the thing that makes this site defensible. It records every
figure, its source, and the decisions behind what is deliberately *not*
published.

When a claim on the site changes, change `CLAIMS.md` in the same commit. A claim
that changes on the site and not in the register is a claim nobody can check
later, and the register stops being worth having the moment it is out of date.

---

*Conviction Capital, October 2026.*
