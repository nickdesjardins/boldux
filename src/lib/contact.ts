import { z } from "zod";

export const PROJECT_TYPES = ["corporate", "privateLabel", "merch", "art", "other"] as const;
export const QUANTITIES = ["1", "2", "3", "4", "5"] as const;
export const MESSAGE_MAX = 3000;

/** Fields rendered in the form, in visual order (used to focus the first invalid one). */
export const CONTACT_FIELDS = ["name", "email", "company", "phone", "projectType", "quantity", "message", "consent"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

/** Error codes map 1:1 to keys in messages/*.json under contact.form */
export const ERROR_CODES = ["required", "invalidEmail", "tooShort", "tooLong"] as const;
export type ContactErrorCode = (typeof ERROR_CODES)[number];
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

const text = (max: number) => z.string().trim().max(max, "tooLong");

/*
 * No unions here on purpose: a failed union reports a generic "Invalid input" at the
 * field path, which would not map to a translation key.
 */
export const contactSchema = z.object({
  name: text(120).min(2, "required"),
  email: z.string().trim().max(200, "tooLong").email("invalidEmail"),
  company: text(160).optional(),
  phone: text(40).optional(),
  projectType: z.enum(PROJECT_TYPES, { message: "required" }),
  quantity: z.enum(QUANTITIES, { message: "required" }),
  message: z.string().trim().min(20, "tooShort").max(MESSAGE_MAX, "tooLong"),
  consent: z.literal(true, { message: "required" }),
  // Honeypot: humans never see it; the API checks it on the raw body before validation.
  website: z.string().optional(),
  locale: z.enum(["en", "fr"]).default("en"),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export function isContactField(k: unknown): k is ContactField {
  return typeof k === "string" && (CONTACT_FIELDS as readonly string[]).includes(k);
}

export function isErrorCode(c: unknown): c is ContactErrorCode {
  return typeof c === "string" && (ERROR_CODES as readonly string[]).includes(c);
}

/** Every issue the schema can emit (including type errors on tampered payloads) becomes a known code. */
function toCode(issue: z.core.$ZodIssue, field: ContactField): ContactErrorCode {
  if (isErrorCode(issue.message)) return issue.message;
  switch (issue.code) {
    case "too_big":
      return "tooLong";
    case "too_small":
      return field === "message" ? "tooShort" : "required";
    case "invalid_format":
      return field === "email" ? "invalidEmail" : "required";
    default:
      return "required";
  }
}

export function flattenErrors(err: z.ZodError): ContactErrors {
  const out: ContactErrors = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (isContactField(key) && !out[key]) out[key] = toCode(issue, key);
  }
  return out;
}

/** Keeps only known field → known code pairs (used by the client on the server's response). */
export function normalizeErrors(input: unknown): ContactErrors {
  const out: ContactErrors = {};
  if (!input || typeof input !== "object") return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (isContactField(k)) out[k] = isErrorCode(v) ? v : "required";
  }
  return out;
}

/** First field with an error, in visual order. */
export function firstErrorField(errors: ContactErrors): ContactField | undefined {
  return CONTACT_FIELDS.find((f) => errors[f]);
}
