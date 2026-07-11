import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { withAuth } from "@/lib/withAuth";
import { listReminders, markReminderDone, dismissReminder, ReminderRow } from "@/services/serviceRecordService";
import { Bell, Calendar, Car, CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pending", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  dismissed: { label: "Dismissed", variant: "outline" },
};

const reminderLabel: Record<string, string> = {
  scheduled_service: "Scheduled service",
  mileage_based: "Mileage-based service",
  time_based: "Time-based service",
};

function RemindersPage({ user }: { user: User }) {
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listReminders(user.id);
        setReminders(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const handleDone = async (id: string) => {
    setActing(id);
    try {
      await markReminderDone(id, user.id);
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setActing(id);
    try {
      await dismissReminder(id, user.id);
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: "dismissed" } : r)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  return (
    <DashboardShell title="Reminders" user={user}>
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Maintenance reminders</CardTitle>
          <CardDescription>Upcoming and overdue service work.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <Bell className="mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className="font-medium">No reminders yet</p>
              <p className="text-sm text-muted-foreground">Reminders are created when you schedule the next service.</p>
              <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => router.push("/services")}>
                View services <Car className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {reminder.vehicles?.make} {reminder.vehicles?.model}{" "}
                        <span className="text-muted-foreground">({reminder.vehicles?.license_plate})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reminderLabel[reminder.reminder_type] || reminder.reminder_type}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant={statusMap[reminder.status]?.variant || "outline"}>
                          {statusMap[reminder.status]?.label || reminder.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due {new Date(reminder.due_date).toLocaleDateString()}
                          {reminder.due_mileage ? ` • ${reminder.due_mileage.toLocaleString()} km` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  {reminder.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleDone(reminder.id)}>
                        {acting === reminder.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Done
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-2 text-destructive" onClick={() => handleDismiss(reminder.id)}>
                        <XCircle className="h-4 w-4" /> Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

export default withAuth(RemindersPage);