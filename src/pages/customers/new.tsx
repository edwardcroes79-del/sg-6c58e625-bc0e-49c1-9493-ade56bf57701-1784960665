import React, { useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createCustomer } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, User, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function NewCustomerPage({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    emergency_contact: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      toast({ variant: "destructive", title: "Name and email required" });
      return;
    }
    setSubmitting(true);
    try {
      await createCustomer({
        user_id: user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        emergency_contact: form.emergency_contact || null,
      });
      toast({ title: "Customer created", description: `${form.full_name} has been added.` });
      router.push("/customers");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create customer", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="New customer"
      user={user}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push("/customers")} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Add customer</CardTitle>
            <CardDescription>Vehicle owner contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Jane Mwangi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+254 700 000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency contact</Label>
                <Input id="emergency_contact" value={form.emergency_contact} onChange={(e) => update("emergency_contact", e.target.value)} placeholder="Name / phone" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Nairobi, Kenya" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-primary text-primary-foreground">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                Create customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default withAuth(NewCustomerPage);