import { Resend } from "resend";

const CONTACT_RECIPIENT = "centro@lancelotmet.com";

type FormNotification = {
  source: string;
  subject: string;
  replyTo: string;
  fields: Array<[label: string, value: string | null | undefined]>;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(apiKey);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character] ?? character));
}

export async function sendLancelotFormNotification({ source, subject, replyTo, fields }: FormNotification) {
  const normalizedFields = fields.filter(([, value]) => Boolean(value?.trim()));
  const text = [`Origen: ${source}`, "", ...normalizedFields.map(([label, value]) => `${label}: ${value?.trim()}`)].join("\n");
  const html = `
    <h1>${escapeHtml(source)}</h1>
    <table>${normalizedFields.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value?.trim() ?? "")}</td></tr>`).join("")}</table>
  `;
  const result = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: CONTACT_RECIPIENT,
    replyTo,
    subject,
    text,
    html
  });

  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export function sendLancelotTestEmail() {
  return sendLancelotFormNotification({
    source: "Prueba de Resend",
    subject: "Hello World",
    replyTo: CONTACT_RECIPIENT,
    fields: [["Mensaje", "Congrats on sending your first email!"]]
  });
}
