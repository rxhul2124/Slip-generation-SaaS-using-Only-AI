import { useState, useEffect } from "react";
import { Globe, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { resources } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const TIMEZONE_OPTIONS = [
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Asia/Seoul (KST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT)" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka (BST)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (MSK)" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul (TRT)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "America/Sao_Paulo", label: "America/São Paulo (BRT)" },
  { value: "America/New_York", label: "America/New York (EST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "America/Denver", label: "America/Denver (MST)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
  { value: "America/Anchorage", label: "America/Anchorage (AKST)" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu (HST)" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "dd MMM yyyy", label: "dd MMM yyyy — 28 May 2026" },
  { value: "MM/dd/yyyy", label: "MM/dd/yyyy — 05/28/2026" },
  { value: "yyyy-MM-dd", label: "yyyy-MM-dd — 2026-05-28" },
  { value: "dd/MM/yyyy", label: "dd/MM/yyyy — 28/05/2026" },
];

export function PreferencesSection() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const notify = useNotificationStore((state) => state.push);

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [timezone, setTimezone] = useState(
    user?.timezone || detectedTimezone || "America/New_York"
  );
  const [locale, setLocale] = useState(user?.locale || "en");
  const [dateFormat, setDateFormat] = useState("dd MMM yyyy");
  const [saving, setSaving] = useState(false);

  // Snapshot of saved values for dirty tracking
  const [saved, setSaved] = useState({ timezone, locale, dateFormat });

  const isDirty =
    timezone !== saved.timezone ||
    locale !== saved.locale ||
    dateFormat !== saved.dateFormat;

  // Auto-detect timezone on first load if user has no timezone set
  useEffect(() => {
    if (!user?.timezone && detectedTimezone) {
      setTimezone(detectedTimezone);
    }
  }, [user?.timezone, detectedTimezone]);

  async function handleSave() {
    setSaving(true);
    try {
      await resources.auth.updateProfile({ locale, timezone });
      updateUser({ locale, timezone });
      setSaved({ timezone, locale, dateFormat });
      notify({
        tone: "success",
        title: "Preferences saved",
        body: "Your locale and timezone were updated.",
      });
    } catch {
      notify({
        tone: "error",
        title: "Save failed",
        body: "Could not update preferences. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTimezone(saved.timezone);
    setLocale(saved.locale);
    setDateFormat(saved.dateFormat);
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
            <CardTitle>Regional Preferences</CardTitle>
            <CardDescription>
              Set your timezone, language, and date display format.
            </CardDescription>
          </div>
          <Globe className="h-5 w-5 text-primary" />
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Timezone</label>
            <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
            {timezone === detectedTimezone && (
              <p className="text-xs text-muted-foreground">
                Auto-detected from your browser
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Language</label>
            <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date Format</label>
            <Select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              {DATE_FORMAT_OPTIONS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Actions */}
          {isDirty && (
            <motion.div
              className="flex items-center gap-3 border-t pt-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button onClick={handleSave} loading={saving}>
                {!saving && <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save Preferences"}
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
