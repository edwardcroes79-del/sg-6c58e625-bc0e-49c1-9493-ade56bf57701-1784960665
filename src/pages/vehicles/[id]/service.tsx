import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVehicle } from "@/services/vehicleService";
import { createServiceRecord } from "@/services/serviceRecordService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plus, Trash2, Wrench } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function LogServicePage({ user }: { user: User }) {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    service_date: new Date().toISOString().split("T")[0],
    mileage: "",
    service_type: "Routine maintenance",
    cost: "",
    next_service_date: "",
    next_service_mileage: "",
    status: "completed" as const,
    items: [{ name: "", quantity: 1, unit_price: "" }],
  });

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    getVehicle(id)
      .then((v) => {
        setVehicle(v);
        setForm((prev) => ({
          ...prev,
          mileage: v.current_mileage?.toString() || "",
        }));
      })
      .catch((err) => toast({ variant: "destructive", title: "Error loading vehicle", description: err.message }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, { name: "", quantity: 1, unit_price: "" }] }));
  const removeItem = (idx: number) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const updateItem = (idx: number, field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== "string") return;

    const items = form.items
      .filter((i) => i.name.trim())
      .map((i) => ({
        name: i.name,
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0,
      }));

    const cost = Number(form.cost) || items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

    setSaving(true);
    try {
      await createServiceRecord(user.id, {
        vehicle_id: id,
        service_date: form.service_date,
        mileage: Number(form.mileage) || 0,
        service_type: form.service_type,
        cost,
        next_service_date: form.next_service_date || null,
        next_service_mileage: form.next_service_mileage ? Number(form.next_service_mileage) : null,
        status: form.status,
        items,
      });
      toast({ title: "Service logged" });
      router.push(`/vehicles/${id}`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to log service", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <DashboardShell title="Log service" user={user}>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Log service: ${vehicle.make} ${vehicle.model}`}
      user={user}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push(`/vehicles/${id}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Service details</CardTitle>
            <CardDescription>Record work performed on {vehicle.year} {vehicle.make} {vehicle.model}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Service date</Label>
                <Input type="date" required value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mileage</Label>
                <Input type="number" required value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Service type</Label>
                <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine maintenance">Routine maintenance</SelectItem>
                    <SelectItem value="Oil change">Oil change</SelectItem>
                    <SelectItem value="Tire rotation">Tire rotation</SelectItem>
                    <SelectItem value="Brake service">Brake service</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total cost (USD)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Leave blank to auto-calculate from items" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Parts & labor</CardTitle>
            <CardDescription>Optional line items for this service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.items.map((item, idx) => (
              <div key={idx} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr,auto,auto,auto]">
                <Input placeholder="Item name" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
                <Input type="number" min={1} placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="sm:w-20" />
                <Input type="number" step="0.01" placeholder="Price" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", e.target.value)} className="sm:w-28" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addItem}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Next service</CardTitle>
            <CardDescription>Schedule the upcoming maintenance window.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={form.next_service_date} onChange={(e) => setForm({ ...form, next_service_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Due mileage</Label>
              <Input type="number" value={form.next_service_mileage} onChange={(e) => setForm({ ...form, next_service_mileage: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/vehicles/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />} Log service
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}

export default withAuth(LogServicePage);