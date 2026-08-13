import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { withAuth, WithAuthProps } from "@/lib/withAuth";
import { getVehicles, computeVehicleStatus, statusLabel, Vehicle, VehicleStatus } from "@/services/vehicleService";
import { listReminders, ReminderWithVehicle } from "@/services/serviceRecordService";
import { formatDate } from "@/lib/utils";
import { Car, AlertTriangle, Calendar, Bell, ChevronRight, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

type VehicleWithCustomer = Vehicle & { customer: { full_name: string | null } | null };

function DashboardPage({ user }: WithAuthProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleWithCustomer[]>([]);
  const [reminders, setReminders] = useState<ReminderWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    Promise.all([
      getVehicles(user.id).catch(() => []),
      listReminders(user.id).catch(() => []),
    ]).then(([v, r]) => {
      if (!mounted) return;
      setVehicles(v as unknown as VehicleWithCustomer[]);
      setReminders(r as ReminderWithVehicle[]);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const now = new Date();
  const stats = vehicles.reduce(
    (acc, v) => {
      const s = computeVehicleStatus(v, now);
      acc[s] = acc[s] + 1;
      return acc;
    },
    { up_to_date: 0, due_soon: 0, overdue: 0 } as Record<VehicleStatus, number>
  );

  const upcomingReminders = reminders
    .filter((r) => r.status === "pending")
    .sort((a, b) => new Date(a.due_date || "").getTime() - new Date(b.due_date || "").getTime())
    .slice(0, 5);

  return (
    <>
      <SEO title="Dashboard" />
      <DashboardShell
        title="Dashboard"
        user={user}
        actions={
          <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => router.push("/vehicles/new")}>
            <Car className="h-4 w-4" /> Add vehicle
          </Button>
        }
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Registered vehicles</p>
                  <p className="mt-1 font-heading text-3xl font-bold">{vehicles.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Up to date</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-emerald-600">{stats.up_to_date}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Due soon</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-amber-600">{stats.due_soon}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-destructive">{stats.overdue}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Registered vehicles</h2>
                <Link href="/vehicles" className="text-sm font-medium text-accent hover:underline">View all</Link>
              </div>
              {vehicles.length === 0 ? (
                <Card className="flex flex-col items-center justify-center border-dashed py-12">
                  <CardTitle className="text-base">No vehicles yet</CardTitle>
                  <CardDescription>Add your first vehicle to start tracking service history.</CardDescription>
                  <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => router.push("/vehicles/new")}>
                    Add vehicle <ChevronRight className="h-4 w-4" />
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vehicles.slice(0, 6).map((v) => {
                    const status = computeVehicleStatus(v, now);
                    return (
                      <Link key={v.id} href={`/vehicles/${v.id}`} className="block">
                        <Card className="h-full transition-shadow hover:shadow-md">
                          <CardContent className="flex h-full items-start justify-between gap-3 pt-6">
                            <div className="min-w-0">
                              <p className="truncate font-heading font-semibold">{v.make || "—"} {v.model || ""}</p>
                              <p className="text-sm text-muted-foreground">{v.license_plate || "No plate"}{v.year ? ` · ${v.year}` : ""}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{v.customer?.full_name || "No owner"}</p>
                            </div>
                            <Badge
                              variant={status === "overdue" ? "destructive" : status === "due_soon" ? "secondary" : "default"}
                              className="shrink-0"
                            >
                              {statusLabel(status)}
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Bell className="h-4 w-4 text-accent" /> Upcoming service
                  </CardTitle>
                  <CardDescription>Pending reminders by due date.</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingReminders.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">All caught up.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {upcomingReminders.map((r) => (
                        <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{r.vehicles ? `${r.vehicles.make || ""} ${r.vehicles.model || ""}` : "Vehicle"}</p>
                            <p className="text-xs text-muted-foreground">{r.vehicles?.license_plate || r.reminder_type}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 gap-1 text-xs">
                            <Calendar className="h-3 w-3" /> {r.due_date ? formatDate(r.due_date) : "No date"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Needs attention
                  </CardTitle>
                  <CardDescription>Vehicles due soon or overdue.</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.due_soon + stats.overdue === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No vehicles need attention.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {vehicles
                        .filter((v) => computeVehicleStatus(v, now) !== "up_to_date")
                        .slice(0, 5)
                        .map((v) => (
                          <li key={v.id} className="flex items-center justify-between py-3 text-sm">
                            <Link href={`/vehicles/${v.id}`} className="min-w-0 hover:underline">
                              <p className="truncate font-medium">{v.make || "—"} {v.model || ""}</p>
                              <p className="text-xs text-muted-foreground">{v.license_plate || "No plate"}</p>
                            </Link>
                            <Badge variant={computeVehicleStatus(v, now) === "overdue" ? "destructive" : "secondary"} className="shrink-0">
                              {statusLabel(computeVehicleStatus(v, now))}
                            </Badge>
                          </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DashboardShell>
    </>
  );
}

export default withAuth(DashboardPage);