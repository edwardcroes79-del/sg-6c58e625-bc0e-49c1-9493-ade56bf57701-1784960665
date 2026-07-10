import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { withAuth, WithAuthProps } from "@/lib/withAuth";
import { signOut, getUserProfile, UserProfile } from "@/services/authService";
import {
  Car,
  Users,
  Wrench,
  AlertTriangle,
  Calendar,
  Bell,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Car },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Service history", href: "/services", icon: Wrench },
  { label: "Reminders", href: "/reminders", icon: Bell },
];

export function DashboardShell({
  children,
  title,
  user,
  actions,
}: React.PropsWithChildren<{
  title: string;
  user: WithAuthProps["user"];
  actions?: React.ReactNode;
}>) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUserProfile(user.id).then((p) => {
      if (mounted) setProfile(p);
    });
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <SEO title={title} />
      <div className="flex min-h-screen bg-background">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col p-5">
            <Link href="/dashboard" className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-semibold line-clamp-1">
                {profile?.business_name || "ServiceCard"}
              </span>
            </Link>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    onClick={() => setMobileMenu(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/settings"
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  router.pathname.startsWith("/settings")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setMobileMenu(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>

            <div className="mt-auto border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{profile?.full_name || user.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile?.role}</p>
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
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenu(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-heading text-lg font-semibold">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}