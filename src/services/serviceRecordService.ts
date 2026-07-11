import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type ServiceItemInsert = Database["public"]["Tables"]["service_items"]["Insert"];
export type ReminderInsert = Database["public"]["Tables"]["reminders"]["Insert"];
export type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];

export interface ServiceWithItems extends ServiceRow {
  service_items: ServiceItemInsert[];
  vehicles: { id: string; make: string | null; model: string | null; license_plate: string | null } | null;
  customers: { id: string; full_name: string | null } | null;
}

export interface ServiceFormData {
  vehicle_id: string;
  service_date: string;
  mileage: number;
  service_type: string;
  description: string;
  technician: string;
  cost: number;
  next_service_date?: string | null;
  next_service_mileage?: number | null;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    item_type: "part" | "labor" | "other";
  }>;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export async function createServiceRecord(userId: string, data: ServiceFormData): Promise<string> {
  const { data: service, error } = await supabase
    .from("services")
    .insert({
      user_id: userId,
      vehicle_id: data.vehicle_id,
      service_date: data.service_date,
      mileage: data.mileage,
      service_type: data.service_type,
      description: data.description,
      technician: data.technician,
      cost: data.cost,
      next_service_date: data.next_service_date,
      next_service_mileage: data.next_service_mileage,
      status: data.status,
    })
    .select("id")
    .single();

  if (error) throw error;

  if (data.items.length > 0) {
    const items: ServiceItemInsert[] = data.items.map((item) => ({
      service_id: service.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      item_type: item.item_type,
      total_price: item.quantity * item.unit_price,
    }));
    const { error: itemsError } = await supabase.from("service_items").insert(items);
    if (itemsError) throw itemsError;
  }

  if (data.next_service_date) {
    const reminder: ReminderInsert = {
      user_id: userId,
      vehicle_id: data.vehicle_id,
      type: "time",
      due_date: data.next_service_date,
      due_mileage: data.next_service_mileage,
      status: "pending",
      message: `Scheduled ${data.service_type} service due`,
    };
    const { error: reminderError } = await supabase.from("reminders").insert(reminder);
    if (reminderError) throw reminderError;
  }

  return service.id;
}

export async function listServiceRecords(userId: string): Promise<ServiceWithItems[]> {
  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_items (*),
      vehicles (id, make, model, license_plate),
      customers (id, full_name)
    `)
    .eq("user_id", userId)
    .order("service_date", { ascending: false });

  if (error) throw error;
  return (data as unknown as ServiceWithItems[]) ?? [];
}

export async function getServiceRecordById(userId: string, id: string): Promise<ServiceWithItems | null> {
  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_items (*),
      vehicles (id, make, model, license_plate),
      customers (id, full_name)
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as ServiceWithItems) ?? null;
}

export async function updateServiceRecord(id: string, userId: string, updates: Partial<ServiceInsert>): Promise<void> {
  const { error } = await supabase.from("services").update(updates).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function deleteServiceRecord(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function listReminders(userId: string): Promise<ReminderRow[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*, vehicles(make, model, license_plate)")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data as unknown as ReminderRow[]) ?? [];
}

export async function markReminderDone(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from("reminders").update({ status: "completed" }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function dismissReminder(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from("reminders").update({ status: "dismissed" }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}