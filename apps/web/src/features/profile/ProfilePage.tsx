import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { SegmentedControl } from "@/components/ui/tabs";
import { ProfileHeader } from "./components/ProfileHeader";
import { AvatarUploader } from "./components/AvatarUploader";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { SecuritySection } from "./components/SecuritySection";
import { PreferencesSection } from "./components/PreferencesSection";
import { ApiKeysSection } from "./components/ApiKeysSection";
import { NotificationsSection } from "./components/NotificationsSection";

type ProfileTab = "personal" | "security" | "preferences" | "api-keys" | "notifications";

const tabOptions: { value: ProfileTab; label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "security", label: "Security" },
  { value: "preferences", label: "Preferences" },
  { value: "api-keys", label: "API Keys" },
  { value: "notifications", label: "Notifications" }
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your personal information, security, preferences, and notifications."
      />

      <div className="mb-6">
        <SegmentedControl value={activeTab} onChange={setActiveTab} options={tabOptions} />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
              <div className="space-y-6">
                <AvatarUploader />
                <ProfileHeader />
              </div>
              <PersonalInfoForm />
            </div>
          </div>
        )}

        {activeTab === "security" && <SecuritySection />}
        {activeTab === "preferences" && <PreferencesSection />}
        {activeTab === "api-keys" && <ApiKeysSection />}
        {activeTab === "notifications" && <NotificationsSection />}
      </motion.div>
    </>
  );
}
