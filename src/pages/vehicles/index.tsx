import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVehicles, VehicleStatus, statusLabel, statusBadgeVariant } from "@/services/vehicleService";
import { Search, Plus, Car, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function VehiclesPage({ user }: { user: User }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Array<any>>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [user.id, search, statusFilter]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles(
        user.id,
        search || undefined,
        statusFilter === "all" ? undefined : statusFilter
      );
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = {
    all: vehicles.length,
    up_to_date: vehicles.filter((v) => v.computed_status === "up_to_date").length,
    due_soon: vehicles.filter((v) => v.computed_status === "due_soon").length,
    overdue: vehicles.filter((v) => v.computed_status === "overdue").length,
  };

  return (
    <DashboardShell title="Vehicles" user={user}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Vehicle registry</h2>
          <p className="text-muted-foreground">Manage vehicles, service status, and records.</p>
        </div>
        <Button onClick={() => router.push("/vehicles/new")} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add vehicle
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "all", label: "All", count: statusCounts.all, icon: Car },
          { key: "up_to_date", label: "Up to date", count: statusCounts.up_to_date, icon: Calendar, tone: "text-success" },
          { key: "due_soon", label: "Due soon", count: statusCounts.due_soon, icon: Calendar, tone: "text-warning" },
          { key: "overdue", label: "Overdue", count: statusCounts.overdue, icon: AlertTriangle, tone: "text-danger" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key as VehicleStatus | "all")}
            className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
              statusFilter === item.key ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"
            }`}
          >
            <div>
              <p className={`text-2xl font-bold ${item.tone || "text-foreground"}`}>{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
            <item.icon className={`h-5 w-5 ${item.tone || "text-muted-foreground"}`} />
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by plate, VIN, make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Car className="mb-3 h-12 w-12 text-muted-foreground/60" />
            <p className="font-medium">No vehicles yet</p>
            <p className="text-sm text-muted-foreground">Add your first vehicle to get started.</p>
            <Button onClick={() => router.push("/vehicles/new")} className="mt-4 gap-2 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="glass-card cursor-pointer overflow-hidden transition-shadow hover:shadow-2xl"
              onClick={() => router.push(`/vehicles/${vehicle.id}`)}
            >
              <div className="h-40 bg-muted">
                {vehicle.banner_image_url ? (
                  <img
                    src={vehicle.banner_image_url}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Car className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">{vehicle.license_plate}</p>
                  </div>
                  <Badge variant={statusBadgeVariant(vehicle.computed_status)}>
                    {statusLabel(vehicle.computed_status)}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>VIN: {vehicle.vin || "—"}</p>
                  <p>Mileage: {vehicle.current_mileage.toLocaleString()} km</p>
                  <p>Owner: {vehicle.customer?.full_name || "Unassigned"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

export default withAuth(VehiclesPage);