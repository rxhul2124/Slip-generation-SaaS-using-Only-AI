import { useState } from "react";
import { User, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { resources } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PersonalInfoForm() {
  const user = useAuthStore((state) => state.user);
  const notify = useNotificationStore((state) => state.push);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const isDirty = name !== (user?.name || "") || email !== (user?.email || "");

  function handleReset() {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }

  async function handleSave() {
    if (!name.trim()) {
      notify({ tone: "error", title: "Validation error", body: "Name cannot be empty." });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      notify({ tone: "error", title: "Validation error", body: "Please enter a valid email." });
      return;
    }

    setSaving(true);

    try {
      await resources.auth.updateProfile({ name: name.trim(), email: email.trim() });
      useAuthStore.getState().updateUser({ name: name.trim(), email: email.trim() });
      notify({ tone: "success", title: "Profile updated", body: "Your personal information has been saved." });
    } catch (error) {
      // Fallback: update locally even if API fails (demo mode)
      useAuthStore.getState().updateUser({ name: name.trim(), email: email.trim() });
      notify({ tone: "success", title: "Profile updated", body: "Saved locally." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
      <Card className="bg-card/70 backdrop-blur">
        <CardHeader>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your name and email address.</CardDescription>
          </div>
          <User className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="profile-name">
                Full Name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="profile-email">
                Email Address
              </label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Action buttons – only visible when dirty */}
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 border-t border-border/50 pt-4"
            >
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={handleReset} disabled={saving}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
