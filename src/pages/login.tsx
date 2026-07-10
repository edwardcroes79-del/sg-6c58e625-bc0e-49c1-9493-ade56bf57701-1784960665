import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Car,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
} from "lucide-react";

type Mode = "sign_in" | "sign_up" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?mode=reset`,
        });
        if (error) throw error;
        toast({
          title: "Check your inbox",
          description: "We sent you a password reset link.",
        });
        setMode("sign_in");
      } else if (mode === "sign_up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { role: "admin" },
          },
        });
        if (error) throw error;
        if (data.user?.identities?.length === 0) {
          setError("An account with this email already exists. Please sign in.");
        } else {
          toast({
            title: "Account created",
            description: "Confirm your email, then sign in to continue.",
          });
          setMode("sign_in");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          toast({ title: "Welcome back" });
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const heading =
    mode === "forgot"
      ? "Reset password"
      : mode === "sign_up"
      ? "Create workshop account"
      : "Sign in to your workshop";

  const subtitle =
    mode === "forgot"
      ? "Enter your email and we will send you a reset link."
      : mode === "sign_up"
      ? "Start issuing digital service cards in minutes."
      : "Access your dashboard, vehicles, and service reminders.";

  return (
    <>
      <SEO
        title="Sign In | Digital Vehicle Service Card"
        description="Secure workshop sign in for the Digital Vehicle Service Card platform."
      />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-50" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Car className="h-5 w-5" />
              </div>
              <span className="font-heading text-xl font-semibold">
                ServiceCard
              </span>
            </Link>
          </div>

          <Card className="glass-card overflow-hidden border-white/50 shadow-2xl">
            <CardHeader className="space-y-1 pb-2 text-center">
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                {heading}
              </h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="workshop@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-lg border-border/60 bg-white/60 pl-10 backdrop-blur-sm focus-visible:ring-accent dark:bg-slate-900/40"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11 rounded-lg border-border/60 bg-white/60 pr-10 backdrop-blur-sm focus-visible:ring-accent dark:bg-slate-900/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01]"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {mode === "forgot"
                    ? "Send reset link"
                    : mode === "sign_up"
                    ? "Create account"
                    : "Sign in"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-3 text-center text-sm">
                {mode === "sign_in" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </button>
                    <p className="text-muted-foreground">
                      No account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("sign_up")}
                        className="font-semibold text-accent hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("sign_in")}
                      className="font-semibold text-accent hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure Supabase authentication & encrypted data</span>
          </div>
        </div>
      </main>
    </>
  );
}