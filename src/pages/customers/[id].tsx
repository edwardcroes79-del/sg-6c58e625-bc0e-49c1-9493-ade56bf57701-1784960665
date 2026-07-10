import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCustomer, deleteCustomer } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, MapPin, User, Car, Loader2, Trash2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function CustomerDetailPage({ user }: { user: SupabaseUser }) {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const data = await getCustomer(id as string);
      setCustomer(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error loading customer", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this customer? Linked vehicles will lose their owner assignment.")) return;
    try {
      await deleteCustomer(id as string, user.id);
      toast({ title: "Customer deleted" });
      router.push("/customers");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    }
  };

  if (loading || !customer) {
    return (
      <DashboardShell title="Customer details" user={user}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={customer.full_name}
      user={user}
      actions={
        <Button variant="outline" size="sm" onClick={handleDelete} className="gap-2 text-danger">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      }
    >
      <Button variant="ghost" size="sm" onClick={() => router.push("/customers")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold">{customer.full_name}</h2>
                  <p className="text-sm text-muted-foreground">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> Email</p>
                  <p className="font-medium">{customer.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> Phone</p>
                  <p className="font-medium">{customer.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Address</p>
                  <p className="font-medium">{customer.address || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><User className="h-4 w-4" /> Emergency contact</p>
                  <p className="font-medium">{customer.emergency_contact || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Vehicles</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {customer.vehicles?.length ? (
                <div className="space-y-3">
                  {customer.vehicles.map((vehicle: any) => (
                    <div
                      key={vehicle.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted"
                      onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="font-mono text-xs text-muted-foreground">{vehicle.license_plate}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{vehicle.current_mileage?.toLocaleString()} km</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No vehicles linked to this customer.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glass-card">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total vehicles</p>
              <p className="font-heading text-3xl font-bold">{customer.vehicles?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

export default withAuth(CustomerDetailPage);