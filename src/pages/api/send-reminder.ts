import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { sendReminderEmail } from "@/services/emailService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { vehicle_id, test_email } = req.body || {};

  if (test_email) {
    try {
      const result = await sendReminderEmail({
        to: test_email,
        customerName: "Test user",
        vehicleMake: "Demo",
        vehicleModel: "Vehicle",
        licensePlate: "TEST-123",
        status: "Due soon",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueMileage: 40000,
        serviceCardUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      });
      return res.status(200).json({ success: true, result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!vehicle_id) return res.status(400).json({ error: "vehicle_id or test_email required" });

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*, customer:customers(*)")
    .eq("id", vehicle_id)
    .single();

  if (vehicleError || !vehicle) return res.status(404).json({ error: "Vehicle not found" });

  const customer = vehicle.customer;
  if (!customer?.email) return res.status(400).json({ error: "Customer has no email" });

  try {
    const result = await sendReminderEmail({
      to: customer.email,
      customerName: customer.full_name,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      licensePlate: vehicle.license_plate,
      status: "Due soon",
      dueDate: vehicle.next_service_date,
      dueMileage: vehicle.next_service_km,
      serviceCardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/service-card/${vehicle.id}`,
    });
    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}