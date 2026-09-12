import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

/* The shape the app expects back. One item per distinct thing the email asks
   of a parent or tells them is happening. */
const Item = z.object({
  kind: z.enum(["event", "notice", "consent", "payment", "kit", "change", "none"]),
  title: z.string(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  where: z.string(),
  audience: z.string(),
  child: z.string().nullable(),
  action: z.enum(["consent", "payment", "reply", "book", "none"]),
  due: z.string().nullable(),
  wear: z.string(),
  bring: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
  why: z.string()
});

const Extraction = z.object({
  from: z.string(),
  summary: z.string(),
  items: z.array(Item)
});

function prompt(text, today, children) {
  const who = children.map(c => `${c.name} is in Year ${c.year}`).join(" and ");
  return `You are reading an email sent by a London prep school to parents, and turning it into records for a parent's app.

Today is ${today}. ${who}. Resolve any relative date such as "next Thursday" against the date the email was sent, and if the sent date is not given, against today. Dates are YYYY-MM-DD and times are HH:MM in 24 hour. If a date cannot be resolved with confidence, return it as null and set confidence to low rather than guessing.

Rules. One item per distinct thing the email asks of a parent or tells them is happening; an email that is purely courteous returns an empty items array. Use "change" where the email alters something previously announced, and say what it changed in "why". Set "child" only where the audience names a year group one of the children is in, otherwise null. Prefer fewer, more accurate items over more, and use low confidence freely: a parent will check anything you flag, but cannot check what you did not.

The email follows between the markers.
---EMAIL---
${text}
---END---`;
}

/* Shared by the paste box and by the inbound mailbox, so that an email read on
   arrival and an email pasted by hand are read exactly the same way. */
export async function extract({ text, today, children }) {
  const model = process.env.ANTHROPIC_MODEL;
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  if (!model) throw new Error("ANTHROPIC_MODEL is not set");

  const client = new Anthropic();
  const response = await client.messages.parse({
    model,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt(text, today, children) }],
    output_config: { format: zodOutputFormat(Extraction) }
  });
  if (!response.parsed_output) throw new Error("the model did not return the expected shape");
  return response.parsed_output;
}

export function apiError(res, e) {
  if (e instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "rate_limited" });
  if (e instanceof Anthropic.AuthenticationError) return res.status(500).json({ error: "bad_api_key" });
  if (e instanceof Anthropic.APIError) return res.status(502).json({ error: "upstream", status: e.status });
  return res.status(500).json({ error: "failed", message: e.message });
}
