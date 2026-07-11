import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createVehicle } from "@/services/vehicleService";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Car, Upload, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getCustomers } from "@/services/customerService";

const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
const transmissions = ["Manual", "Automatic", "CVT", "DCT"];
const intervals = [
  { months: 3, km: 5000, label: "Every 3 months / 5,000 km" },
  { months: 6, km: 10000, label: "Every 6 months / 10,000 km" },
  { months: 12, km: 15000, label: "Every 12 months / 15,000 km" },
];

function NewVehiclePage({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [customers, setCustomers] = useState<Array<any>>([]);
  const [form, setForm] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: "",
    vin: "",
    engine_type: "",
    transmission: "",
    fuel_type: "",
    color: "",
    current_mileage: "",
    registration_expiry: "",
    insurance_expiry: "",
    service_interval_months: "12",
    service_interval_km: "15000",
    next_service_date: "",
    next_service_km: "",
    customer_id: "",
  });

  useEffect(() => {
    getCustomers(user.id).then(setCustomers).catch(console.error);
  }, [user.id]);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(Array.from(e.target.files));
  };

  const handleIntervalChange = (label: string) => {
    const interval = intervals.find((i) => i.label === label);
    if (interval) {
      setForm((prev) => ({
        ...prev,
        service_interval_months: String(interval.months),
        service_interval_km: String(interval.km),
      }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createVehicle(
        {
          user_id: user.id,
          license_plate: form.license_plate.toUpperCase(),
          make: form.make,
          model: form.model,
          year: form.year ? parseInt(form.year, 10) : null,
          vin: form.vin || null,
          engine_type: form.engine_type || null,
          transmission: form.transmission || null,
          fuel_type: form.fuel_type || null,
          color: form.color || null,
          current_mileage: parseInt(form.current_mileage, 10) || 0,
          registration_expiry: form.registration_expiry || null,
          insurance_expiry: form.insurance_expiry || null,
          service_interval_months: parseInt(form.service_interval_months, 10),
          service_interval_km: parseInt(form.service_interval_km, 10),
          next_service_date: form.next_service_date || null,
          next_service_km: form.next_service_km ? parseInt(form.next_service_km, 10) : null,
          customer_id: form.customer_id || null,
        },
        photos
      );
      toast({ title: "Vehicle registered", description: `${form.year} ${form.make} ${form.model} has been added.` });
      router.push("/vehicles");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Registration failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const step1Valid = form.license_plate && form.make && form.model && form.year && form.current_mileage;

  return (
    <DashboardShell
      title="New vehicle"
      user={user}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push("/vehicles")} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Register a new vehicle</CardTitle>
            <CardDescription>Step {step} of 2 — vehicle details and service schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="license_plate">License plate *</Label>
                    <Input
                      id="license_plate"
                      value={form.license_plate}
                      onChange={(e) => update("license_plate", e.target.value)}
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      value={form.year}
                      onChange={(e) => update("year", e.target.value)}
                      placeholder="2020"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      value={form.make}
                      onChange={(e) => update("make", e.target.value)}
                      placeholder="Toyota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={form.model}
                      onChange={(e) => update("model", e.target.value)}
                      placeholder="Corolla"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input
                      id="vin"
                      value={form.vin}
                      onChange={(e) => update("vin", e.target.value)}
                      placeholder="1HGCM82633A123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="Silver" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine_type">Engine type</Label>
                    <Input id="engine_type" value={form.engine_type} onChange={(e) => update("engine_type", e.target.value)} placeholder="2.0L 4-cylinder" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select value={form.transmission} onValueChange={(v) => update("transmission", v)}>
                      <SelectTrigger id="transmission">
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Fuel type</Label>
                    <Select value={form.fuel_type} onValueChange={(v) => update("fuel_type", v)}>
                      <SelectTrigger id="fuel_type">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_mileage">Current mileage (km) *</Label>
                    <Input
                      id="current_mileage"
                      value={form.current_mileage}
                      onChange={(e) => update("current_mileage", e.target.value)}
                      placeholder="45000"
                      type="number"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="registration_expiry">Registration expiry</Label>
                    <Input id="registration_expiry" type="date" value={form.registration_expiry} onChange={(e) => update("registration_expiry", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_expiry">Insurance expiry</Label>
                    <Input id="insurance_expiry" type="date" value={form.insurance_expiry} onChange={(e) => update("insurance_expiry", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer">Owner (customer)</Label>
                  <Select value={form.customer_id} onValueChange={(v) => update("customer_id", v)}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name} {c.email ? `(${c.email})` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button disabled={!step1Valid} onClick={() => setStep(2)} className="gap-2 bg-primary text-primary-foreground">
                    Next step
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="interval">Service interval preset</Label>
                  <Select onValueChange={handleIntervalChange}>
                    <SelectTrigger id="interval">
                      <SelectValue placeholder="Choose interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {intervals.map((i) => (
                        <SelectItem key={i.label} value={i.label}>{i.label}</SelectItem>
                      ))}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="service_interval_months">Interval (months)</Label>
                    <Input
                      id="service_interval_months"
                      value={form.service_interval_months}
                      onChange={(e) => update("service_interval_months", e.target.value)}
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_interval_km">Interval (km)</Label>
                    <Input
                      id="service_interval_km"
                      value={form.service_interval_km}
                      onChange={(e) => update("service_interval_km", e.target.value)}
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_service_date">Next service date</Label>
                    <Input id="next_service_date" type="date" value={form.next_service_date} onChange={(e) => update("next_service_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_service_km">Next service mileage (km)</Label>
                    <Input
                      id="next_service_km"
                      value={form.next_service_km}
                      onChange={(e) => update("next_service_km", e.target.value)}
                      placeholder="60000"
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photos">Vehicle photos</Label>
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                    <Input id="photos" type="file" multiple accept="image/*" onChange={handlePhotoChange} className="border-0 bg-transparent" />
                    {photos.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">{photos.length} photo(s) selected</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-primary text-primary-foreground">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
                    Register vehicle
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default withAuth(NewVehiclePage);