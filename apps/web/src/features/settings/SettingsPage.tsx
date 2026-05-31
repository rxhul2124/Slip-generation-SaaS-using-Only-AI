import { Building2, Cloud, CreditCard, FileSignature, ImageIcon, Printer, Save, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

type SettingsSection = "workspace" | "print" | "signature" | "data";

export function SettingsPage() {
  const notify = useNotificationStore((state) => state.push);
  const logoRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<SettingsSection>("workspace");
  const [silentPrint, setSilentPrint] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [signatureImageName, setSignatureImageName] = useState("");
  const company = useAuthStore((state) => state.company);
  const user = useAuthStore((state) => state.user);
  const signatureProfile = user?.signatureProfile;

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage workspace identity, print behavior, signatures, locale, and backups from focused sections."
        actions={
          <Button onClick={() => notify({ tone: "success", title: "Settings saved", body: "Workspace defaults were saved locally." })}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={section}
          onChange={setSection}
          options={[
            { value: "workspace", label: "Workspace" },
            { value: "print", label: "Print" },
            { value: "signature", label: "Signature" },
            { value: "data", label: "Data" }
          ]}
        />
        <Badge variant="warning">{company?.plan ? `${company.plan.toUpperCase()} active` : "No plan"}</Badge>
      </div>

      {section === "workspace" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Branding and company identity used on generated slips.</CardDescription>
              </div>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Input defaultValue={company?.name || ""} placeholder="Company name" />
                <Input placeholder="GST / tax number" />
                <Input placeholder="Industry" />
                <Input placeholder="Support phone" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Address line 1" />
                <Input placeholder="Address line 2" />
                <Input placeholder="City" />
                <Input placeholder="Postal code" />
              </div>
              <input
                ref={logoRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) notify({ tone: "success", title: "Logo selected", body: file.name });
                }}
              />
              <Button variant="outline" onClick={() => logoRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload Logo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Purchased plan and billing status.</CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Current plan</div>
                <div className="mt-1 text-2xl font-black capitalize">{company?.plan || "free"}</div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/billing">Manage Billing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {section === "print" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Printer Defaults</CardTitle>
                <CardDescription>Thermal vendor, paper, calibration, and copies.</CardDescription>
              </div>
              <Printer className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Select defaultValue="generic">
                  <option value="zebra">Zebra</option>
                  <option value="tsc">TSC</option>
                  <option value="brother">Brother</option>
                  <option value="generic">Generic</option>
                </Select>
                <Select defaultValue="4x6">
                  <option value="4x6">4x6 Thermal</option>
                  <option value="2x4">2x4 Label</option>
                  <option value="a4">A4 Sheet</option>
                  <option value="letter">Letter Sheet</option>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input defaultValue="203" placeholder="DPI" />
                <Input defaultValue="0" placeholder="X offset" />
                <Input defaultValue="1" placeholder="Copies" />
              </div>
              <Switch checked={silentPrint} onCheckedChange={setSilentPrint} label="Silent print mode" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Template Defaults</CardTitle>
                <CardDescription>Defaults applied when new slips and templates are created.</CardDescription>
              </div>
              <ImageIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Select defaultValue="4x6">
                <option value="4x6">4x6 Thermal</option>
                <option value="2x4">2x4 Label</option>
                <option value="a4">A4 Sheet</option>
                <option value="letter">Letter Sheet</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input defaultValue="1" placeholder="Snap grid mm" />
                <Input defaultValue="0.2" placeholder="Border mm" />
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/templates/builder">Open Template Builder</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {section === "signature" ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Signature Profile</CardTitle>
              <CardDescription>User identity applied automatically to generated slips.</CardDescription>
            </div>
            <FileSignature className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input defaultValue={signatureProfile?.fullName || user?.name || ""} placeholder="Full name" />
              <Input defaultValue={signatureProfile?.employeeId || ""} placeholder="Employee ID" />
              <Input defaultValue={signatureProfile?.role || ""} placeholder="Role / designation" />
              <Input defaultValue={signatureProfile?.signatureText || ""} placeholder="Signature text" />
            </div>
            <input
              ref={signatureRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setSignatureImageName(file.name);
                notify({ tone: "success", title: "Signature selected", body: file.name });
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => signatureRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload Signature
              </Button>
              {signatureImageName ? <span className="text-sm font-semibold text-muted-foreground">{signatureImageName}</span> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {section === "data" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cloud Backups</CardTitle>
                <CardDescription>Automatic backups and workspace export cadence.</CardDescription>
              </div>
              <Cloud className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Switch checked={autoBackup} onCheckedChange={setAutoBackup} label="Auto backup" />
              <Select defaultValue="daily">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
              <Button asChild variant="outline" className="w-full">
                <Link to="/app/backups">Open Backups</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
