import { supabase } from "@/integrations/supabase/client";

export type SecurityEventType =
  | "password_changed"
  | "mfa_enrolled"
  | "mfa_unenrolled"
  | "provider_linked"
  | "provider_unlinked"
  | "login_from_new_device";

export async function logSecurityEvent(
  userId: string,
  eventType: SecurityEventType,
  metadata: Record<string, any> = {}
) {
  const { error } = await supabase
    .from("security_events")
    .insert({ user_id: userId, event_type: eventType, metadata });
  if (error) throw error;
}

export async function getSecurityEvents(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("security_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export type NotificationPreferences = {
  user_id: string;
  security_emails: boolean;
  reminder_emails: boolean;
  marketing_emails: boolean;
  updated_at: string;
};

export async function getNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as NotificationPreferences | null;
}

export async function upsertNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, "user_id" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: userId, ...preferences, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as NotificationPreferences;
}

export async function sendSecurityEmail(
  userEmail: string,
  eventType: SecurityEventType,
  details: { userName?: string; device?: string; location?: string; timestamp?: string } = {}
) {
  try {
    const { error } = await supabase.functions.invoke("send-security-email", {
      body: { email: userEmail, eventType, details },
    });
    if (error) {
      // Edge function may not be deployed or keys missing; log but don't block UX
      console.warn("Security email dispatch failed:", error.message);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err: any) {
    console.warn("Security email dispatch failed:", err.message);
    return { sent: false, error: err.message };
  }
}