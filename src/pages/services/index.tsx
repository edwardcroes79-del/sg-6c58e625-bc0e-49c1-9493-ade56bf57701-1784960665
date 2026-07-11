import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { withAuth } from "@/lib/withAuth";
import { listServiceRecords, ServiceWithItems, deleteServiceRecord } from "@/services/serviceRecordService";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Wrench, Calendar, Car, Trash2, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  completed: { label: "Completed", variant: "default" },
  in_progress: { label: "In progress", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

function ServicesPage({ user }: { user: User }) {
  const router = useRouter();
  const [records, setRecords] = useState<ServiceWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listServiceRecords(user.id);
        setRecords(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const filtered = records.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.service_type.toLowerCase().includes(term) ||
      r.technician?.toLowerCase().includes(term) ||
      r.vehicles?.license_plate?.toLowerCase().includes(term) ||
      r.vehicles?.make?.toLowerCase().includes(term) ||
      r.vehicles?.model?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service record?")) return;
    setDeleting(id);
    try {
      await deleteServiceRecord(id, user.id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardShell
      title="Service history"
      user={user}
      actions={
        <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => router.push("/vehicles")}>
          <Plus className="h-4 w-4" /> Log service
        </Button>
      }
    >
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">All service records</CardTitle>
          <CardDescription>View and manage maintenance work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle, service type, technician..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <Wrench className="mb-3 h-10 w-10 text-muted-foreground/60" />
              <p className="font-medium">No service records yet</p>
              <p className="text-sm text-muted-foreground">Select a vehicle to log its first service.</p>
              <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => router.push("/vehicles")}>
                Go to vehicles <Car className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {record.vehicles?.make} {record.vehicles?.model}{" "}
                        <span className="text-muted-foreground">({record.vehicles?.license_plate})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.service_type} • {record.mileage?.toLocaleString()} km • {record.technician || "No technician"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant={statusMap[record.status]?.variant || "outline"}>
                          {statusMap[record.status]?.label || record.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.service_date).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium">{formatCurrency(record.cost || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vehicles/${record.vehicle_id}`}>Vehicle</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(record.id)}>
                      {deleting === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

export default withAuth(ServicesPage);