import React from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  QrCode,
  CalendarClock,
  ShieldCheck,
  Wrench,
  Bell,
  FileText,
  ArrowRight,
  CheckCircle2,
  Users,
  Settings,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Digital Service Card",
    description: "Every vehicle gets a beautiful, shareable digital card with a unique QR code.",
  },
  {
    icon: CalendarClock,
    title: "Smart Maintenance Schedule",
    description: "Track service intervals by time and mileage so nothing falls through the cracks.",
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description: "Branded email reminders fire 14 days, 7 days, on the due date, and weekly after.",
  },
  {
    icon: Wrench,
    title: "Complete Service History",
    description: "Log work, parts, oil, costs, invoices, and photos in one chronological timeline.",
  },
  {
    icon: FileText,
    title: "Branded PDF Reports",
    description: "Generate workshop-branded service reports and export them in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & White-Label",
    description: "Role-based access, encrypted data, and fully customizable workshop branding.",
  },
];

const stats = [
  { label: "Workshops", value: "120+" },
  { label: "Vehicles Tracked", value: "45k+" },
  { label: "Service Records", value: "1.2M+" },
  { label: "Countries", value: "18" },
];

export default function Home() {
  return (
    <>
      <SEO
        title="Digital Vehicle Service Card | White-Label Maintenance Platform"
        description="Replace paper service books with a secure, shareable digital service card for workshops, dealerships, and fleet operators."
        url="https://servicecard.app"
      />
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-60" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />

        {/* Nav */}
        <nav className="relative z-10 border-b border-border/40 bg-background/60 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Car className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight">
                ServiceCard
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
              >
                Sign in
              </Link>
              <Button asChild size="sm" className="rounded-full px-5">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative z-10 pt-20 pb-28 md:pt-32 md:pb-40">
          <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl space-y-8">
              <Badge
                variant="secondary"
                className="h-8 rounded-full bg-accent/10 px-4 text-accent-foreground hover:bg-accent/10"
              >
                White-label vehicle maintenance platform
              </Badge>
              <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
                The last paper service book{" "}
                <span className="text-accent">you will ever need.</span>
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                Give every vehicle a secure, shareable digital service card.
                Workshops track history, schedule maintenance, and send branded
                reminders — owners simply scan a QR code.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-8 text-base shadow-lg shadow-accent/20"
                >
                  <Link href="/login">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full px-8 text-base"
                >
                  <Link href="#features">See Features</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> 14-day trial
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Cancel anytime
                </span>
              </div>
            </div>

            {/* Hero card */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
              <div className="absolute inset-0 -rotate-3 rounded-[2rem] bg-gradient-to-br from-accent/30 to-primary/20 blur-sm" />
              <Card className="glass-card relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-950 relative">
                    <div className="absolute inset-0 opacity-40 dot-grid" />
                    <div className="absolute bottom-4 left-6 text-white">
                      <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                        Digital Service Card
                      </p>
                      <p className="font-heading text-2xl font-bold">
                        ABC-1234
                      </p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <QrCode className="h-12 w-12 text-white/90" />
                    </div>
                  </div>
                  <div className="space-y-5 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Vehicle
                        </p>
                        <p className="font-heading font-semibold">
                          2021 BMW 330i
                        </p>
                      </div>
                      <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                        Up to date
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last service</p>
                        <p className="font-medium">Jun 12, 2026</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next due</p>
                        <p className="font-medium">Sep 12, 2026</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mileage</p>
                        <p className="font-medium font-mono">42,350 km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next mileage</p>
                        <p className="font-medium font-mono">47,350 km</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Sarah Mitchell</p>
                          <p className="text-xs text-muted-foreground">
                            Owner
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 border-y border-border/50 bg-muted/30">
          <div className="container py-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative z-10 py-24 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                Everything a modern workshop needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built for independent garages, dealerships, and fleet operators
                who want to look professional and stay organized.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group glass-card transition-all hover:-translate-y-1 hover:shadow-2xl"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 pb-24 md:pb-32">
          <div className="container">
            <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-primary-foreground md:px-16 md:py-24">
              <div className="absolute inset-0 dot-grid opacity-10" />
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                  Ready to digitize your workshop?
                </h2>
                <p className="mt-4 text-lg opacity-90">
                  Join workshops already replacing paper service books with
                  secure, branded digital cards.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90"
                  >
                    <Link href="/login">
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-primary-foreground/30 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/login">Workshop Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/50 bg-muted/30 py-12">
          <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-4 w-4" />
              </div>
              <span className="font-heading font-semibold">ServiceCard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Digital Vehicle Service Card. Built
              for workshops worldwide.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground">
                Support
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}