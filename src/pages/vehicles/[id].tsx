import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVehicle, updateVehicle, deleteVehicle, computeVehicleStatus, statusLabel, statusBadgeVariant } from "@/services/vehicleService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Gauge, FileText, QrCode, Share2, Trash2, Loader2, Wrench } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function VehicleDetailPage({ user }: { user: User }) {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await getVehicle(id as string);
      setVehicle(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error loading vehicle", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this vehicle and all its records? This cannot be undone.")) return;
    try {
      await deleteVehicle(id as string, user.id);
      toast({ title: "Vehicle deleted" });
      router.push("/vehicles");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    }
  };

  if (loading || !vehicle) {
    return (
      <DashboardShell title="Vehicle details" user={user}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardShell>
    );
  }

  const computedStatus = computeVehicleStatus(vehicle);

  return (
    <DashboardShell
      title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      user={user}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/service-card/${vehicle.id}`)} className="gap-2">
            <QrCode className="h-4 w-4" /> Service card
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="gap-2 text-danger">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      }
    >
      <Button variant="ghost" size="sm" onClick={() => router.push("/vehicles")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to vehicles
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="h-64 bg-muted">
              {vehicle.banner_image_url || vehicle.images?.[0]?.url ? (
                <img
                  src={vehicle.banner_image_url || vehicle.images[0].url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Wrench className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant={statusBadgeVariant(computedStatus)}>{statusLabel(computedStatus)}</Badge>
                <span className="font-mono text-sm text-muted-foreground">{vehicle.license_plate}</span>
              </div>
              <h2 className="font-heading text-2xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem label="VIN" value={vehicle.vin} />
                <DetailItem label="Engine" value={vehicle.engine_type} />
                <DetailItem label="Transmission" value={vehicle.transmission} />
                <DetailItem label="Fuel type" value={vehicle.fuel_type} />
                <DetailItem label="Color" value={vehicle.color} />
                <DetailItem label="Current mileage" value={`${vehicle.current_mileage.toLocaleString()} km`} />
                <DetailItem label="Registration expires" value={vehicle.registration_expiry} />
                <DetailItem label="Insurance expires" value={vehicle.insurance_expiry} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history" className="gap-2"><Wrench className="h-4 w-4" /> Service history</TabsTrigger>
              <TabsTrigger value="documents" className="gap-2"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
              <TabsTrigger value="photos" className="gap-2"><Share2 className="h-4 w-4" /> Photos</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <Wrench className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className="font-medium">No service history yet</p>
                  <p className="text-sm text-muted-foreground">Service records will appear here once logged.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card className="glass-card">
                <CardContent className="p-6">
                  {vehicle.documents?.length ? (
                    <ul className="space-y-2">
                      {vehicle.documents.map((doc: any) => (
                        <li key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground uppercase">{doc.document_type}</p>
                          </div>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">View</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center">
                      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                      <p className="font-medium">No documents</p>
                      <p className="text-sm text-muted-foreground">Upload registration, insurance, or invoices.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="photos">
              <Card className="glass-card">
                <CardContent className="p-6">
                  {vehicle.images?.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {vehicle.images.map((img: any) => (
                        <img key={img.id} src={img.url} alt={img.caption || ""} className="h-40 w-full rounded-xl object-cover" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Share2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                      <p className="font-medium">No photos</p>
                      <p className="text-sm text-muted-foreground">Add vehicle photos to build the digital card.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Owner</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {vehicle.customer ? (
                <div className="space-y-2">
                  <p className="font-semibold">{vehicle.customer.full_name}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.customer.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No customer linked.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Upcoming service</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due date</p>
                  <p className="font-medium">{vehicle.next_service_date || "Not scheduled"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due mileage</p>
                  <p className="font-medium">{vehicle.next_service_km ? `${vehicle.next_service_km.toLocaleString()} km` : "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Service interval</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Every {vehicle.service_interval_months} months or {vehicle.service_interval_km?.toLocaleString()} km</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

export default withAuth(VehicleDetailPage);