import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { withAuth } from "@/lib/withAuth";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, upsertUserProfile, UserProfile, updateUserMetadata } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Lock, ShieldCheck, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SettingsPage({ user }: { user: { id: string; email?: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    primary_color: "#0F172A",
    accent_color: "#F59E0B",
    logo_url: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const load = async () => {
      const [p, { data: identities }] = await Promise.all([
        getUserProfile(user.id),
        supabase.auth.getUserIdentities(),
      ]);
      setProfile(p);
      if (identities) {
        setProviders(identities.identities.map((i) => i.provider));
      }
      if (p) {
        setForm({
          full_name: p.full_name || "",
          email: user.email || "",
          phone: p.phone || "",
          business_name: p.business_name || "",
          business_address: p.business_address || "",
          business_phone: p.business_phone || "",
          business_email: p.business_email || "",
          primary_color: p.primary_color || "#0F172A",
          accent_color: p.accent_color || "#F59E0B",
          logo_url: p.logo_url || "",
        });
      }
    };
    load();
  }, [user.id, user.email]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user.id) return;
    setSaving(true);
    try {
      await Promise.all([
        upsertUserProfile(user.id, {
          full_name: form.full_name,
          phone: form.phone,
          business_name: form.business_name,
          business_address: form.business_address,
          business_phone: form.business_phone,
          business_email: form.business_email,
          primary_color: form.primary_color,
          accent_color: form.accent_color,
          logo_url: form.logo_url,
        }),
        updateUserMetadata(form.full_name),
      ]);
      toast({ title: "Profile saved", description: "Your business details have been updated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to save", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.id) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("logos").getPublicUrl(path);
      const logo_url = publicData.publicUrl;
      setForm((prev) => ({ ...prev, logo_url }));
      await upsertUserProfile(user.id, { logo_url });
      toast({ title: "Logo uploaded", description: "Your logo has been saved." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ variant: "destructive", title: "Password too short", description: "Use at least 6 characters." });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your new password is active." });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Password update failed", description: err.message });
    }
  };

  const handleUnlinkProvider = async (provider: string) => {
    if (providers.length <= 1) {
      toast({ variant: "destructive", title: "Cannot unlink", description: "Keep at least one login method." });
      return;
    }
    try {
      const { error } = await supabase.auth.unlinkIdentity({
        provider,
        user_id: user.id,
      } as any);
      if (error) throw error;
      setProviders((prev) => prev.filter((p) => p !== provider));
      toast({ title: "Provider unlinked", description: `${provider} has been removed.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Unlink failed", description: err.message });
    }
  };

  if (!profile) return null;

  return (
    <>
      <SEO title="Settings | Digital Vehicle Service Card" />
      <main className="min-h-screen bg-background dot-grid">
        <div className="container py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your business profile, branding, and account security.</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 sm:w-fit sm:grid-cols-3">
              <TabsTrigger value="profile" className="gap-2">
                <Building2 className="h-4 w-4" /> Business
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2">
                <User className="h-4 w-4" /> Branding
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Business profile</CardTitle>
                  <CardDescription>Update your workshop details shown on service cards and reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Your name</Label>
                      <Input id="full_name" value={form.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={form.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business name</Label>
                      <Input id="business_name" value={form.business_name} onChange={(e) => handleChange("business_name", e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="business_address">Business address</Label>
                      <Input id="business_address" value={form.business_address} onChange={(e) => handleChange("business_address", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_phone">Business phone</Label>
                      <Input id="business_phone" value={form.business_phone} onChange={(e) => handleChange("business_phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_email">Business email</Label>
                      <Input id="business_email" type="email" value={form.business_email} onChange={(e) => handleChange("business_email", e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveProfile} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Branding</CardTitle>
                  <CardDescription>Customize colors and logo used across your service cards and QR pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Business logo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 rounded-xl border bg-white">
                        <AvatarImage src={form.logo_url} alt="Logo" className="object-contain p-2" />
                        <AvatarFallback className="rounded-xl text-lg">LOGO</AvatarFallback>
                      </Avatar>
                      <div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          Upload logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="primary_color"
                          type="color"
                          value={form.primary_color}
                          onChange={(e) => handleChange("primary_color", e.target.value)}
                          className="h-10 w-16 cursor-pointer rounded-lg border bg-transparent"
                        />
                        <Input value={form.primary_color} onChange={(e) => handleChange("primary_color", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accent_color">Accent color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="accent_color"
                          type="color"
                          value={form.accent_color}
                          onChange={(e) => handleChange("accent_color", e.target.value)}
                          className="h-10 w-16 cursor-pointer rounded-lg border bg-transparent"
                        />
                        <Input value={form.accent_color} onChange={(e) => handleChange("accent_color", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border p-6"
                    style={{ backgroundColor: form.primary_color, color: "#fff" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: form.accent_color }}
                      >
                        <Building2 className="h-6 w-6" style={{ color: "#0F172A" }} />
                      </div>
                      <div>
                        <p className="font-heading text-lg font-semibold">{form.business_name || "Your workshop"}</p>
                        <p className="text-sm opacity-80">Digital Service Card preview</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save branding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="glass-card mb-6">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Change password</CardTitle>
                  <CardDescription>Update your account password. Current password is not required if you signed in via a linked provider.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New password</Label>
                      <Input id="new_password" type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm new password</Label>
                      <Input id="confirm_password" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handlePasswordUpdate} className="gap-2 bg-primary text-primary-foreground">
                      <Lock className="h-4 w-4" /> Update password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Linked login providers</CardTitle>
                  <CardDescription>Manage how you sign in to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {providers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Email/password is your only sign-in method.</p>
                  ) : (
                    providers.map((provider) => (
                      <div key={provider} className="flex items-center justify-between rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-success" />
                          <div>
                            <p className="font-medium capitalize">{provider}</p>
                            <p className="text-xs text-muted-foreground">Connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleUnlinkProvider(provider)}>
                          Unlink
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

export default withAuth(SettingsPage);