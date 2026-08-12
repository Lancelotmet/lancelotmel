import { Resend } from "resend";

const CONTACT_RECIPIENT = "centro@lancelotmet.com";

type FormNotification = {
  source: string;
  subject: string;
  replyTo: string;
  fields: Array<[label: string, value: string | null | undefined]>;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
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

function textToHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export async function sendLancelotFormNotification({ source, subject, replyTo, fields }: FormNotification) {
  const normalizedFields = fields.filter(([, value]) => Boolean(value?.trim()));
  const text = [
    "LANCELOT | Nuevo contacto",
    `Origen: ${source}`,
    "",
    ...normalizedFields.map(([label, value]) => `${label}: ${value?.trim()}`),
    "",
    "Responde a este correo para escribir directamente a la persona interesada."
  ].join("\n");
  const rows = normalizedFields.map(([label, value]) => `
    <tr>
      <td style="border-bottom:1px solid #e7dfd2;color:#80622f;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.08em;padding:14px 18px;text-transform:uppercase;vertical-align:top;width:35%;">${escapeHtml(label)}</td>
      <td style="border-bottom:1px solid #e7dfd2;color:#222b31;font-family:Arial,sans-serif;font-size:15px;line-height:1.55;padding:14px 18px;vertical-align:top;">${textToHtml(value?.trim() ?? "")}</td>
    </tr>`).join("");
  const html = `<!doctype html>
  <html lang="es"><body style="background:#f4f0e8;margin:0;padding:28px 14px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;max-width:680px;width:100%;">
      <tr><td style="background:#09192a;border:1px solid #c69e5e;padding:30px 36px;">
        <p style="color:#e5bd68;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;margin:0 0 12px;text-transform:uppercase;">LANCELOT · DESDE EL SER PARA EL SABER</p>
        <h1 style="color:#fff9eb;font-family:Georgia,serif;font-size:30px;font-weight:normal;line-height:1.15;margin:0;">Nuevo contacto</h1>
        <p style="color:#d6dce0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;margin:14px 0 0;">${escapeHtml(source)}</p>
      </td></tr>
      <tr><td style="background:#fffdf8;border:1px solid #ded5c5;border-top:0;padding:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e7dfd2;border-collapse:collapse;width:100%;">${rows}</table>
        <p style="color:#59636a;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;margin:24px 4px 0;">Usa <strong>Responder</strong> para escribir directamente a la persona que llenó el formulario.</p>
      </td></tr>
      <tr><td style="color:#77736b;font-family:Arial,sans-serif;font-size:11px;padding:18px;text-align:center;">Notificación generada desde lancelotmet.com</td></tr>
    </table>
  </body></html>`;
  const email = {
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: CONTACT_RECIPIENT,
    replyTo,
    subject,
    text,
    html
  };
  const idempotencyKey = `lancelot-form/${crypto.randomUUID()}`;
  const send = () => getResend().emails.send(email, { idempotencyKey });

  try {
    const result = await send();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  } catch (error) {
    // A brief connection interruption must not drop a form submission or create a duplicate email.
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const result = await send();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    } catch (retryError) {
      console.error("Resend request failed after retry", { cause: error, retryCause: retryError });
      throw new Error("No se pudo conectar con el servicio de correo.");
    }
  }
}

export function sendLancelotTestEmail() {
  return sendLancelotFormNotification({
    source: "Prueba de Resend",
    subject: "Hello World",
    replyTo: CONTACT_RECIPIENT,
    fields: [["Mensaje", "Congrats on sending your first email!"]]
  });
}
