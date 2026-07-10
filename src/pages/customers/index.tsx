import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardShell } from "@/components/DashboardShell";
import { withAuth } from "@/lib/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomers } from "@/services/customerService";
import { Search, Plus, User, Mail, Phone, Loader2, Car } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function CustomersPage({ user }: { user: SupabaseUser }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Array<any>>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, [user.id, search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(user.id, search || undefined);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Customers" user={user}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Customer directory</h2>
          <p className="text-muted-foreground">Manage vehicle owners and their contact details.</p>
        </div>
        <Button onClick={() => router.push("/customers/new")} className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add customer
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
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
      ) : customers.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <User className="mb-3 h-12 w-12 text-muted-foreground/60" />
            <p className="font-medium">No customers yet</p>
            <p className="text-sm text-muted-foreground">Add a customer to link them to vehicles.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="glass-card cursor-pointer transition-shadow hover:shadow-2xl"
              onClick={() => router.push(`/customers/${customer.id}`)}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold">{customer.full_name}</p>
                    <p className="text-xs text-muted-foreground">{customer.vehicles?.length || 0} vehicles</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {customer.email || "—"}</p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {customer.phone || "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

export default withAuth(CustomersPage);