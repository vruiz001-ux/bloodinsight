"use client";

import { useState } from "react";
import {
  User,
  Settings,
  Shield,
  Info,
  Save,
  Trash2,
  Download,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("demo@bloodinsight.app");
  const [sex, setSex] = useState("female");
  const [dob, setDob] = useState("1990-05-15");
  const [units, setUnits] = useState("metric");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, preferences, and privacy.
        </p>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal information. Sex and date of birth are used for
            accurate reference ranges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Biological Sex</Label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="size-4" />
                  Save Profile
                </span>
              )}
            </Button>
            {saved && (
              <span className="text-sm font-medium text-health-normal">
                Saved successfully
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-4 text-primary" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize how your data is displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="units">Unit System</Label>
              <select
                id="units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="metric">Metric (SI units)</option>
                <option value="imperial">Conventional (US)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Affects how biomarker values and ranges are displayed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="en">English</option>
                <option value="pl">Polski</option>
                <option value="fr">Francais</option>
                <option value="de">Deutsch</option>
                <option value="es">Espanol</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Your health data belongs to you. Export or delete it at any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Download className="mt-0.5 size-5 text-primary" />
                <div>
                  <h4 className="text-sm font-medium">Export Your Data</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Download all your reports, biomarker data, and
                    interpretations as a JSON or CSV file.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Download className="size-3.5" />
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 size-5 text-destructive" />
                <div>
                  <h4 className="text-sm font-medium">Delete All Data</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-3">
                    <Trash2 className="size-3.5" />
                    Delete My Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="size-4 text-primary" />
            About BloodInsight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">0.1.0-beta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Knowledge base</span>
              <span className="font-medium">v2026.03 (50+ biomarkers)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Evidence tier</span>
              <span className="font-medium">Tier 1-3 (peer-reviewed)</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                BloodInsight is an educational tool that helps you understand
                your blood test results. It is not a medical device and does not
                provide medical advice, diagnosis, or treatment. Reference ranges
                vary by laboratory, age, sex, and clinical context. Always
                consult a qualified healthcare provider for medical decisions. If
                you have concerning symptoms or critical results, seek immediate
                medical attention.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
