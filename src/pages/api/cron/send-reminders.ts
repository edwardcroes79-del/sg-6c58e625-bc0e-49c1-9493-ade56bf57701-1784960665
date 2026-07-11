import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { sendReminderEmail } from "@/services/emailService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*, vehicles(*, customer:customers(*))")
    .eq("status", "pending")
    .lte("due_date", inOneWeek)
    .is("sent_at", null);

  if (error) return res.status(500).json({ error: error.message });

  const results = [];
  for (const reminder of reminders || []) {
    const vehicle: any = reminder.vehicles;
    const customer = vehicle?.customer;
    if (!customer?.email) continue;

    try {
      await sendReminderEmail({
        to: customer.email,
        customerName: customer.full_name,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        licensePlate: vehicle.license_plate,
        status: "Due soon",
        dueDate: reminder.due_date,
        dueMileage: reminder.due_mileage,
        serviceCardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/service-card/${vehicle.id}`,
      });

      await supabase.from("reminders").update({ sent_at: new Date().toISOString() }).eq("id", reminder.id);
      results.push({ reminder_id: reminder.id, status: "sent" });
    } catch (err: any) {
      results.push({ reminder_id: reminder.id, status: "failed", error: err.message });
    }
  }

  return res.status(200).json({ sent: results.length, results });
}