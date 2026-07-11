import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { withAuth } from "@/lib/withAuth";
import { signOut, getUserProfile, UserProfile } from "@/services/authService";
import { User } from "@supabase/supabase-js";
import {
  Car,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import Link from "next/link";

function DashboardPage({ user }: { user: User }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getUserProfile(user.id);
      if (p && !p.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }
      setProfile(p);
    };
    load();
  }, [user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const stats = [
    { label: "Total vehicles", value: "0", icon: Car, tone: "text-primary" },
    { label: "Customers", value: "0", icon: Users, tone: "text-primary" },
    { label: "Services this month", value: "0", icon: Wrench, tone: "text-success" },
    { label: "Due this week", value: "0", icon: Calendar, tone: "text-warning" },
    { label: "Overdue", value: "0", icon: AlertTriangle, tone: "text-danger" },
    { label: "Up to date", value: "0", icon: CheckCircle2, tone: "text-success" },
  ];

  if (!profile) return null;

  return (
    <>
      <SEO title={`Dashboard | ${profile.business_name || "Workshop"}`} />
      <div className="flex min-h-screen bg-background">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-semibold line-clamp-1">
                {profile.business_name || "ServiceCard"}
              </span>
            </div>

            <nav className="flex-1 space-y-1">
              {[
                { label: "Dashboard", href: "/dashboard", icon: Car, active: true },
                { label: "Vehicles", href: "/vehicles", icon: Car },
                { label: "Customers", href: "/customers", icon: Users },
                { label: "Service history", href: "/services", icon: Wrench },
                { label: "Reminders", href: "/reminders", icon: Bell },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/settings"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>

            <div className="mt-auto border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{profile.full_name || user.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="mt-3 w-full justify-start gap-2 text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        {mobileMenu && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenu(false)}
          />
        )}

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenu(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-heading text-lg font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden gap-2 sm:flex">
                <Search className="h-4 w-4" /> Search
              </Button>
              <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => router.push("/vehicles/new")}>
                <Car className="h-4 w-4" /> Add vehicle
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="font-heading text-2xl font-bold">
                Welcome back, {profile.full_name?.split(" ")[0] || "there"}
              </h2>
              <p className="text-muted-foreground">
                Here is what is happening at {profile.business_name || "your workshop"} today.
              </p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="glass-card">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`rounded-xl bg-muted p-3 ${stat.tone}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Upcoming services</CardTitle>
                  <CardDescription>Vehicles due for maintenance soon.</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                    <Calendar className="mb-3 h-10 w-10 text-muted-foreground/60" />
                    <p className="font-medium">No upcoming services</p>
                    <p className="text-sm text-muted-foreground">
                      Add a vehicle and schedule its first service.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => router.push("/vehicles/new")}>
                      Add vehicle <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Recent activity</CardTitle>
                  <CardDescription>Latest changes across your workshop.</CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                    <Bell className="mb-3 h-10 w-10 text-muted-foreground/60" />
                    <p className="font-medium">No activity yet</p>
                    <p className="text-sm text-muted-foreground">
                      Activity will appear once you start adding records.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default withAuth(DashboardPage);