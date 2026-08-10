import { useState } from "react";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { resources } from "@/lib/api";
import { useNotificationStore } from "@/stores/notificationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 6) return "weak";

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 5) return "strong";
  if (score >= 3) return "medium";
  return "weak";
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak: { label: "Weak", color: "bg-destructive", width: "w-1/3" },
  medium: { label: "Medium", color: "bg-amber-500", width: "w-2/3" },
  strong: { label: "Strong", color: "bg-emerald-500", width: "w-full" },
};

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function SecuritySection() {
  const notify = useNotificationStore((state) => state.push);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const strength = newPassword ? getPasswordStrength(newPassword) : null;
  const bar = strength ? strengthConfig[strength] : null;

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    !saving;

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleChangePassword() {
    if (!canSubmit) return;

    setSaving(true);

    try {
      await resources.auth.updatePassword({ currentPassword, newPassword });
      notify({ tone: "success", title: "Password changed", body: "Your password has been updated successfully." });
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update password.";
      notify({ tone: "error", title: "Password error", body: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </div>
            <Lock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              {/* Current password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="current-password">
                  Current Password
                </label>
                <PasswordInput
                  id="current-password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter current password"
                />
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="new-password">
                  New Password
                </label>
                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Minimum 8 characters"
                />

                {/* Strength indicator */}
                {bar && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className={cn("h-full rounded-full transition-colors", bar.color, bar.width)}
                      />
                    </div>
                    <p className={cn(
                      "text-xs font-medium",
                      strength === "weak" && "text-destructive",
                      strength === "medium" && "text-amber-600 dark:text-amber-400",
                      strength === "strong" && "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {bar.label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter new password"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs font-medium text-destructive">Passwords do not match.</p>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-3 border-t border-border/50 pt-4">
              <Button onClick={handleChangePassword} loading={saving} disabled={!canSubmit}>
                {!saving && <Lock className="h-4 w-4" />}
                {saving ? "Updating…" : "Update Password"}
              </Button>
              <Button variant="ghost" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two-Factor Authentication Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                Two-Factor Authentication
                <Badge variant="muted">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>Add an extra layer of security with 2FA.</CardDescription>
            </div>
            <Shield className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold">Authenticator App</p>
                <p className="text-xs text-muted-foreground">Use an authenticator app to generate one-time codes.</p>
              </div>
              <Switch
                checked={false}
                onCheckedChange={() =>
                  notify({ tone: "info", title: "Coming soon", body: "Two-factor authentication will be available in a future update." })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
