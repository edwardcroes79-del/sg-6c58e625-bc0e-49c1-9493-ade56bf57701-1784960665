import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
export type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];
export type VehicleImage = Database["public"]["Tables"]["vehicle_images"]["Row"];
export type VehicleDocument = Database["public"]["Tables"]["vehicle_documents"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];

export type VehicleStatus = "up_to_date" | "due_soon" | "overdue";

const STATUS_THRESHOLD_DAYS = 14;

export function computeVehicleStatus(
  vehicle: Pick<Vehicle, "next_service_date" | "next_service_km" | "current_mileage">,
  now = new Date()
): VehicleStatus {
  if (!vehicle.next_service_date && !vehicle.next_service_km) return "up_to_date";

  let byDate: VehicleStatus = "up_to_date";
  if (vehicle.next_service_date) {
    const due = new Date(vehicle.next_service_date);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) byDate = "overdue";
    else if (diffDays <= STATUS_THRESHOLD_DAYS) byDate = "due_soon";
  }

  let byKm: VehicleStatus = "up_to_date";
  if (vehicle.next_service_km && vehicle.current_mileage != null) {
    const remaining = vehicle.next_service_km - vehicle.current_mileage;
    if (remaining < 0) byKm = "overdue";
    else if (remaining <= 1000) byKm = "due_soon";
  }

  if (byDate === "overdue" || byKm === "overdue") return "overdue";
  if (byDate === "due_soon" || byKm === "due_soon") return "due_soon";
  return "up_to_date";
}

export function statusBadgeVariant(status: VehicleStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "up_to_date":
      return "default";
    case "due_soon":
      return "secondary";
    case "overdue":
      return "destructive";
    default:
      return "outline";
  }
}

export function statusLabel(status: VehicleStatus): string {
  switch (status) {
    case "up_to_date":
      return "Up to date";
    case "due_soon":
      return "Due soon";
    case "overdue":
      return "Overdue";
  }
}

export async function uploadVehiclePhoto(file: File, userId: string, vehicleId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${vehicleId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("vehicle_photos")
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("vehicle_photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadVehicleDocument(file: File, userId: string, vehicleId: string) {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${userId}/${vehicleId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("vehicle_documents")
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("vehicle_documents").getPublicUrl(path);
  return data.publicUrl;
}

export async function createVehicle(vehicle: VehicleInsert, images: File[] = []) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(vehicle)
    .select()
    .single();
  if (error) throw error;

  const userId = vehicle.user_id;
  if (images.length && userId) {
    const imageRecords = await Promise.all(
      images.map(async (file, index) => {
        const url = await uploadVehiclePhoto(file, userId, data.id);
        return { vehicle_id: data.id, url, is_banner: index === 0, caption: file.name };
      })
    );
    const { error: imgError } = await supabase.from("vehicle_images").insert(imageRecords);
    if (imgError) throw imgError;
  }

  if (data.next_service_date) {
    await upsertReminderFromVehicle(vehicle.user_id, data.id, data as Vehicle);
  }

  return data as Vehicle;
}

export async function getVehicles(userId: string, search?: string, status?: VehicleStatus) {
  let query = supabase
    .from("vehicles")
    .select("*, customer:customers(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `license_plate.ilike.%${search}%,vin.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const vehicles = (data || []).map((v) => ({
    ...v,
    computed_status: computeVehicleStatus(v),
  })) as Array<Vehicle & { computed_status: VehicleStatus }>;

  if (status) {
    return vehicles.filter((v) => v.computed_status === status);
  }
  return vehicles;
}

export async function getVehicle(id: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, customer:customers(*), images:vehicle_images(*), documents:vehicle_documents(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Vehicle & { customer: Customer | null; images: VehicleImage[]; documents: VehicleDocument[] };
}

export async function updateVehicle(id: string, updates: VehicleUpdate, userId: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;

  if (data.next_service_date) {
    await upsertReminderFromVehicle(userId, data.id, data as Vehicle);
  }

  return data as Vehicle;
}

export async function deleteVehicle(id: string, userId: string) {
  const { error } = await supabase.from("vehicles").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function addVehicleImages(vehicleId: string, userId: string, files: File[], isBanner = false) {
  const records = await Promise.all(
    files.map(async (file, index) => {
      const url = await uploadVehiclePhoto(file, userId, vehicleId);
      return { vehicle_id: vehicleId, url, is_banner: isBanner && index === 0, caption: file.name };
    })
  );
  const { error } = await supabase.from("vehicle_images").insert(records);
  if (error) throw error;
}

export async function addVehicleDocuments(
  vehicleId: string,
  userId: string,
  files: File[],
  documentType: string
) {
  const records = await Promise.all(
    files.map(async (file) => {
      const url = await uploadVehicleDocument(file, userId, vehicleId);
      return { vehicle_id: vehicleId, url, document_type: documentType, file_name: file.name };
    })
  );
  const { error } = await supabase.from("vehicle_documents").insert(records);
  if (error) throw error;
}

export async function upsertReminderFromVehicle(userId: string, vehicleId: string, vehicle: Partial<Vehicle>) {
  if (!vehicle.next_service_date) return;
  const { error } = await supabase.from("reminders").upsert(
    {
      user_id: userId,
      vehicle_id: vehicleId,
      reminder_type: "scheduled_service",
      due_date: vehicle.next_service_date,
      due_mileage: vehicle.next_service_km ?? null,
      status: "pending",
    },
    { onConflict: "vehicle_id,reminder_type" }
  );
  if (error) throw error;
}