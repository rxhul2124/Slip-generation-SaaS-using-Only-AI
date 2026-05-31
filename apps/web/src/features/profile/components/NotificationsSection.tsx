import { useState } from "react";
import { Bell, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationStore } from "@/stores/notificationStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface NotificationToggle {
  id: string;
  title: string;
  description: string;
  category: "workflow" | "account";
}

const NOTIFICATION_TOGGLES: NotificationToggle[] = [
  {
    id: "slip_generated",
    title: "Slip Generated",
    description: "Get notified when a new packing slip is generated.",
    category: "workflow",
  },
  {
    id: "print_completed",
    title: "Print Completed",
    description: "Receive confirmation when a print job finishes.",
    category: "workflow",
  },
  {
    id: "weekly_reports",
    title: "Weekly Reports",
    description: "A weekly summary of slip activity and workspace metrics.",
    category: "workflow",
  },
  {
    id: "billing_alerts",
    title: "Billing Alerts",
    description: "Important billing events like payment failures or plan changes.",
    category: "account",
  },
  {
    id: "team_invites",
    title: "Team Invites",
    description: "Notifications when you're invited to a workspace or team.",
    category: "account",
  },
  {
    id: "security_alerts",
    title: "Security Alerts",
    description: "Login from new devices, password changes, and suspicious activity.",
    category: "account",
  },
];

type ToggleState = Record<string, boolean>;

const DEFAULT_STATE: ToggleState = {
  slip_generated: true,
  print_completed: true,
  weekly_reports: false,
  billing_alerts: true,
  team_invites: true,
  security_alerts: true,
};

export function NotificationsSection() {
  const notify = useNotificationStore((state) => state.push);

  const [toggles, setToggles] = useState<ToggleState>(DEFAULT_STATE);
  const [saved, setSaved] = useState<ToggleState>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);

  const isDirty = Object.keys(toggles).some((key) => toggles[key] !== saved[key]);

  const workflowToggles = NOTIFICATION_TOGGLES.filter(
    (t) => t.category === "workflow"
  );
  const accountToggles = NOTIFICATION_TOGGLES.filter(
    (t) => t.category === "account"
  );

  function handleToggle(id: string, checked: boolean) {
    setToggles((prev) => ({ ...prev, [id]: checked }));
  }

  async function handleSave() {
    setSaving(true);
    // Mock save — simulate a short delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaved({ ...toggles });
    setSaving(false);
    notify({
      tone: "success",
      title: "Notifications updated",
      body: "Your email notification preferences were saved.",
    });
  }

  function handleCancel() {
    setToggles({ ...saved });
  }

  function renderGroup(title: string, items: NotificationToggle[]) {
    return (
      <div className="space-y-1">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <div className="divide-y rounded-lg border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                checked={toggles[item.id] ?? false}
                onCheckedChange={(checked) => handleToggle(item.id, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Choose which email notifications you'd like to receive.
            </CardDescription>
          </div>
          <Bell className="h-5 w-5 text-primary" />
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {renderGroup("Workflow", workflowToggles)}
          {renderGroup("Account", accountToggles)}

          {/* Actions */}
          {isDirty && (
            <motion.div
              className="flex items-center gap-3 border-t pt-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Notifications"}
              </Button>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
