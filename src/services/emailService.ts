import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

interface ReminderEmailPayload {
  to: string;
  customerName: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  licensePlate: string | null;
  status: string;
  dueDate: string | null;
  dueMileage: number | null;
  serviceCardUrl: string;
  workshopName?: string;
  workshopPhone?: string;
  workshopEmail?: string;
}

export function buildReminderHtml(payload: ReminderEmailPayload): string {
  const vehicle = [payload.vehicleMake, payload.vehicleModel].filter(Boolean).join(" ") || "Your vehicle";
  const plate = payload.licensePlate ? ` (${payload.licensePlate})` : "";
  const due = payload.dueDate ? new Date(payload.dueDate).toLocaleDateString() : "soon";
  const mileage = payload.dueMileage ? ` or ${payload.dueMileage.toLocaleString()} km` : "";
  const workshop = [payload.workshopName, payload.workshopPhone, payload.workshopEmail].filter(Boolean).join(" • ");

  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #0f172a;">
      <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Service reminder</h1>
      <p style="color: #64748b; margin-bottom: 24px;">Hi ${payload.customerName || "there"}, your ${vehicle}${plate} is due for service on <strong>${due}</strong>${mileage}.</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> ${payload.status}</p>
        <p style="margin: 8px 0 0; font-size: 14px;"><strong>Next service:</strong> ${due}${mileage}</p>
      </div>
      <a href="${payload.serviceCardUrl}" style="display: inline-block; background: #f59e0b; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View digital service card</a>
      ${workshop ? `<p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">${workshop}</p>` : ""}
    </div>
  `;
}

export async function sendReminderEmail(payload: ReminderEmailPayload) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured. Email would have been sent to:", payload.to);
    return { id: "stub", message: "RESEND_API_KEY not configured. Email logged to console." };
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: payload.to,
    subject: `Service reminder for ${[payload.vehicleMake, payload.vehicleModel].filter(Boolean).join(" ") || "your vehicle"}`,
    html: buildReminderHtml(payload),
  });

  if (error) throw error;
  return data;
}

export async function sendTestReminder(to: string) {
  return sendReminderEmail({
    to,
    customerName: "Test user",
    vehicleMake: "Demo",
    vehicleModel: "Vehicle",
    licensePlate: "TEST-123",
    status: "Due soon",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueMileage: 40000,
    serviceCardUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  });
}