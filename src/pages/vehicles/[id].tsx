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
import { ArrowLeft, Calendar, Gauge, FileText, QrCode, Share2, Trash2, Loader2, Wrench, Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateInput } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { getCustomers } from "@/services/customerService";

function VehicleDetailPage({ user }: { user: User }) {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [customers, setCustomers] = useState<Array<any>>([]);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    loadVehicle();
  }, [id]);

  useEffect(() => {
    getCustomers(user.id).then(setCustomers).catch(console.error);
  }, [user.id]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await getVehicle(id as string);
      setVehicle(data);
      setForm(data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error loading vehicle", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!vehicle) return;
    setSaving(true);
    try {
      const updates = {
        make: form.make,
        model: form.model,
        year: Number(form.year) || null,
        vin: form.vin,
        license_plate: form.license_plate,
        engine_type: form.engine_type,
        transmission: form.transmission,
        fuel_type: form.fuel_type,
        color: form.color,
        current_mileage: Number(form.current_mileage) || 0,
        registration_expiry: form.registration_expiry || null,
        insurance_expiry: form.insurance_expiry || null,
        next_service_date: form.next_service_date || null,
        next_service_km: form.next_service_km ? Number(form.next_service_km) : null,
        service_interval_months: form.service_interval_months ? Number(form.service_interval_months) : null,
        service_interval_km: form.service_interval_km ? Number(form.service_interval_km) : null,
        customer_id: form.customer_id || null,
      };
      await updateVehicle(vehicle.id, updates, user.id);
      toast({ title: "Vehicle updated" });
      setEditing(false);
      loadVehicle();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    } finally {
      setSaving(false);
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
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setForm(vehicle); }} className="gap-2"><X className="h-4 w-4" /> Cancel</Button>
              <Button size="sm" onClick={handleUpdate} disabled={saving} className="gap-2 bg-accent text-accent-foreground"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2"><Pencil className="h-4 w-4" /> Edit</Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/vehicles/${id}/service`)} className="gap-2">
                <Wrench className="h-4 w-4" /> Log service
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/service-card/${vehicle.id}`)} className="gap-2">
                <QrCode className="h-4 w-4" /> Service card
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </>
          )}
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
              {editing ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Make" value={form.make} onChange={(v) => setForm({ ...form, make: v })} />
                  <Field label="Model" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
                  <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} type="number" />
                  <Field label="License plate" value={form.license_plate} onChange={(v) => setForm({ ...form, license_plate: v })} />
                  <Field label="VIN" value={form.vin} onChange={(v) => setForm({ ...form, vin: v })} />
                  <Field label="Engine" value={form.engine_type} onChange={(v) => setForm({ ...form, engine_type: v })} />
                  <SelectField label="Transmission" value={form.transmission} options={["Manual", "Automatic", "CVT", "Other"]} onChange={(v) => setForm({ ...form, transmission: v })} />
                  <SelectField label="Fuel type" value={form.fuel_type} options={["Petrol", "Diesel", "Electric", "Hybrid", "Other"]} onChange={(v) => setForm({ ...form, fuel_type: v })} />
                  <Field label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
                  <Field label="Current mileage (km)" value={form.current_mileage} onChange={(v) => setForm({ ...form, current_mileage: v })} type="number" />
                  <Field label="Registration expiry" value={formatDateInput(form.registration_expiry)} onChange={(v) => setForm({ ...form, registration_expiry: v })} type="date" />
                  <Field label="Insurance expiry" value={formatDateInput(form.insurance_expiry)} onChange={(v) => setForm({ ...form, insurance_expiry: v })} type="date" />
                  <Field label="Next service date" value={formatDateInput(form.next_service_date)} onChange={(v) => setForm({ ...form, next_service_date: v })} type="date" />
                  <Field label="Next service km" value={form.next_service_km} onChange={(v) => setForm({ ...form, next_service_km: v })} type="number" />
                  <Field label="Service interval (months)" value={form.service_interval_months} onChange={(v) => setForm({ ...form, service_interval_months: v })} type="number" />
                  <Field label="Service interval (km)" value={form.service_interval_km} onChange={(v) => setForm({ ...form, service_interval_km: v })} type="number" />
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Owner (customer)</Label>
                    <Select value={form.customer_id || ""} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.full_name} {c.email ? `(${c.email})` : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
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
              )}
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

function Field({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (val: string) => void; type?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: any; options: string[]; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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