import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export async function createCustomer(customer: CustomerInsert) {
  const { data, error } = await supabase.from("customers").insert(customer).select().single();
  if (error) throw error;
  return data as Customer;
}

export async function getCustomers(userId: string, search?: string) {
  let query = supabase
    .from("customers")
    .select("*, vehicles(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as (Customer & { vehicles: any[] })[];
}

export async function getCustomer(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*, vehicles(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Customer & { vehicles: any[] };
}

export async function updateCustomer(id: string, updates: CustomerUpdate) {
  const { data, error } = await supabase
    .from("customers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string, userId: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}