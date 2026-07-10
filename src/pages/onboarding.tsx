import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { withAuth } from "@/lib/withAuth";
import { getUserProfile, completeOnboarding, updateUserMetadata } from "@/services/authService";
import { User } from "@supabase/supabase-js";
import { Car, UserRound, Building2, Palette, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

type Step = "profile" | "business" | "branding" | "review";

function OnboardingPage({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("profile");
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState(user.email || "");
  const [primaryColor, setPrimaryColor] = useState("#0F172A");
  const [accentColor, setAccentColor] = useState("#F59E0B");

  useEffect(() => {
    const check = async () => {
      const profile = await getUserProfile(user.id);
      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
      } else {
        setFullName(profile?.full_name || user.user_metadata?.full_name || "");
        setPhone(profile?.phone || "");
        setBusinessName(profile?.business_name || "");
        setBusinessAddress(profile?.business_address || "");
        setBusinessPhone(profile?.business_phone || "");
        setBusinessEmail(profile?.business_email || user.email || "");
        setPrimaryColor(profile?.primary_color || "#0F172A");
        setAccentColor(profile?.accent_color || "#F59E0B");
      }
    };
    check();
  }, [user, router]);

  const totalSteps = 4;
  const stepIndex =
    step === "profile" ? 1 : step === "business" ? 2 : step === "branding" ? 3 : 4;
  const progress = (stepIndex / totalSteps) * 100;

  const next = () => {
    if (step === "profile") setStep("business");
    else if (step === "business") setStep("branding");
    else if (step === "branding") setStep("review");
  };

  const back = () => {
    if (step === "business") setStep("profile");
    else if (step === "branding") setStep("business");
    else if (step === "review") setStep("branding");
  };

  const finish = async () => {
    setSaving(true);
    try {
      await updateUserMetadata(fullName);
      await completeOnboarding(user.id, {
        full_name: fullName,
        phone,
        business_name: businessName,
        business_address: businessAddress,
        business_phone: businessPhone,
        business_email: businessEmail,
        primary_color: primaryColor,
        accent_color: accentColor,
      });
      toast({ title: "Onboarding complete", description: "Welcome to your workshop dashboard." });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save profile.";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setSaving(false);
    }
  };

  const stepTitle =
    step === "profile"
      ? "Your profile"
      : step === "business"
      ? "Workshop details"
      : step === "branding"
      ? "Brand customization"
      : "Review & finish";

  const stepDescription =
    step === "profile"
      ? "Tell us who you are."
      : step === "business"
      ? "Add your workshop information."
      : step === "branding"
      ? "Choose your brand colors."
      : "Confirm everything looks good.";

  return (
    <>
      <SEO title="Onboarding | Digital Vehicle Service Card" />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
              <Car className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-heading text-2xl font-bold">Set up your workshop</h1>
            <p className="text-sm text-muted-foreground">Step {stepIndex} of {totalSteps}</p>
          </div>

          <Progress value={progress} className="mb-8 h-2" />

          <Card className="glass-card border-white/50 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  {step === "profile" && <UserRound className="h-5 w-5" />}
                  {step === "business" && <Building2 className="h-5 w-5" />}
                  {step === "branding" && <Palette className="h-5 w-5" />}
                  {step === "review" && <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="font-heading text-xl">{stepTitle}</CardTitle>
                  <CardDescription>{stepDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {step === "profile" && (
                <>
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone number</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
                  </div>
                </>
              )}

              {step === "business" && (
                <>
                  <div className="space-y-2">
                    <Label>Workshop name</Label>
                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Downtown Auto Care" />
                  </div>
                  <div className="space-y-2">
                    <Label>Workshop address</Label>
                    <Input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="123 Main St, City" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Workshop phone</Label>
                      <Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+1 555 987 6543" />
                    </div>
                    <div className="space-y-2">
                      <Label>Workshop email</Label>
                      <Input value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="hello@workshop.com" />
                    </div>
                  </div>
                </>
              )}

              {step === "branding" && (
                <>
                  <div className="space-y-2">
                    <Label>Primary color</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-14 rounded-lg border border-border bg-transparent" />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono uppercase" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent color</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10 w-14 rounded-lg border border-border bg-transparent" />
                      <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="font-mono uppercase" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Preview</p>
                    <div className="flex items-center gap-3 rounded-lg p-3 shadow-sm" style={{ backgroundColor: primaryColor }}>
                      <div className="h-10 w-10 rounded-full" style={{ backgroundColor: accentColor }} />
                      <div>
                        <p className="font-heading font-semibold" style={{ color: "#fff" }}>{businessName || "Your Workshop"}</p>
                        <p className="text-xs opacity-80" style={{ color: "#fff" }}>Digital Service Card</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === "review" && (
                <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Owner</p>
                      <p className="font-medium">{fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                      <p className="font-medium">{phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Workshop</p>
                      <p className="font-medium">{businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                      <p className="font-medium">{businessEmail}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step !== "profile" && (
                  <Button type="button" variant="outline" onClick={back} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
                {step !== "review" ? (
                  <Button type="button" onClick={next} className="flex-1 bg-primary text-primary-foreground">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={finish} disabled={saving} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    {saving ? "Saving..." : "Finish setup"} <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default withAuth(OnboardingPage);