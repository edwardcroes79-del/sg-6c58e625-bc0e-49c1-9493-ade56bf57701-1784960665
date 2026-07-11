import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVehicle, computeVehicleStatus, statusLabel, statusBadgeVariant } from "@/services/vehicleService";
import { getServicesForVehicle } from "@/services/serviceRecordService";
import { Loader2, Car, Calendar, Gauge, Wrench, Phone, Mail, MapPin, Share2, Printer, ArrowLeft, QrCode } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Head from "next/head";

export default function ServiceCardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    loadData();
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined" || !id) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled) return;
      const url = `${window.location.origin}/service-card/${id}`;
      QRCode.toDataURL(url, { width: 256, margin: 2 }, (err, dataUrl) => {
        if (!err) setQrUrl(dataUrl);
      });
    });
    return () => { cancelled = true; };
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [v, s] = await Promise.all([
        getVehicle(id as string),
        getServicesForVehicle(id as string),
      ]);
      setVehicle(v);
      setServices(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (loading || !vehicle) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const status = computeVehicleStatus(vehicle);

  return (
    <>
      <Head>
        <title>Digital Service Card · {vehicle.license_plate}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Digital Service Card", url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }} className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          <Card className="glass-card overflow-hidden border-2">
            <div className="relative h-72 bg-muted">
              {vehicle.banner_image_url || vehicle.images?.[0]?.url ? (
                <img
                  src={vehicle.banner_image_url || vehicle.images[0].url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Car className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <Badge variant={statusBadgeVariant(status)} className="mb-2 text-sm">{statusLabel(status)}</Badge>
                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <p className="font-mono text-lg text-muted-foreground">{vehicle.license_plate}</p>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="mb-3 font-heading text-lg font-semibold">Vehicle information</h2>
                  <dl className="space-y-2 text-sm">
                    <Detail label="VIN" value={vehicle.vin} />
                    <Detail label="Engine" value={vehicle.engine_type} />
                    <Detail label="Transmission" value={vehicle.transmission} />
                    <Detail label="Fuel type" value={vehicle.fuel_type} />
                    <Detail label="Color" value={vehicle.color} />
                    <Detail label="Current mileage" value={`${vehicle.current_mileage.toLocaleString()} km`} />
                    <Detail label="Registration expires" value={formatDate(vehicle.registration_expiry)} />
                    <Detail label="Insurance expires" value={formatDate(vehicle.insurance_expiry)} />
                  </dl>
                </div>

                <div>
                  <h2 className="mb-3 font-heading text-lg font-semibold">Owner</h2>
                  {vehicle.customer ? (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{vehicle.customer.full_name}</p>
                      <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {vehicle.customer.email || "—"}</p>
                      <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {vehicle.customer.phone || "—"}</p>
                      <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {vehicle.customer.address || "—"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No owner information.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold"><QrCode className="h-4 w-4 text-accent" /> Scan to view live card</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    {qrUrl ? (
                      <img src={qrUrl} alt="Service card QR code" className="h-48 w-48 rounded-xl border" />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-xl border bg-muted">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <p className="mt-3 text-center text-xs text-muted-foreground">Point your camera here to open the latest service card.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold"><Calendar className="h-4 w-4 text-accent" /> Next service due</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatDate(vehicle.next_service_date)}</p>
                    <p className="text-sm text-muted-foreground">or {vehicle.next_service_km ? `${vehicle.next_service_km.toLocaleString()} km` : "not set"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold"><Gauge className="h-4 w-4 text-accent" /> Service interval</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">Every {vehicle.service_interval_months || "—"} months</p>
                    <p className="text-sm text-muted-foreground">or {vehicle.service_interval_km ? `${vehicle.service_interval_km.toLocaleString()} km` : "not set"}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h2 className="mb-3 font-heading text-lg font-semibold flex items-center gap-2"><Wrench className="h-5 w-5 text-accent" /> Service history</h2>
                {services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No service records yet.</p>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">{formatDate(service.service_date)} · {service.service_type}</p>
                            <Badge variant="outline">{service.status}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{service.work_completed || "No notes"}</p>
                          <p className="text-sm text-muted-foreground">Mileage: {service.mileage.toLocaleString()} km · Mechanic: {service.mechanic_name || "—"}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between border-b border-border py-1 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value ?? "—"}</dd>
    </div>
  );
}