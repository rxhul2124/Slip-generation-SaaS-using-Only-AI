import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { initials, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function AvatarUploader() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const notify = useNotificationStore((state) => state.push);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const userInitials = user?.name ? initials(user.name) : "?";

  function handleClick() {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      notify({ tone: "error", title: "Invalid file", body: "Please select an image file." });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify({ tone: "error", title: "File too large", body: "Avatar must be under 5 MB." });
      return;
    }

    setUploading(true);

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);

    // Mock upload with setTimeout
    setTimeout(() => {
      updateUser({ avatarUrl: previewUrl });
      notify({ tone: "success", title: "Avatar updated", body: "Your profile photo has been updated." });
      setUploading(false);
    }, 1500);

    // Reset the input so re-selecting the same file triggers onChange
    event.target.value = "";
  }

  return (
    <Card className="bg-card/70 backdrop-blur">
      <CardContent className="flex flex-col items-center gap-3 p-6 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile Photo</p>

        {/* Avatar circle with hover overlay */}
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={uploading}
          className="group relative h-28 w-28 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait"
        >
          {/* Avatar or initials */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-28 w-28 rounded-full object-cover ring-2 ring-border/50 ring-offset-2 ring-offset-background transition group-hover:brightness-75"
            />
          ) : (
            <div
              className={cn(
                "flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent text-3xl font-bold text-primary-foreground ring-2 ring-border/50 ring-offset-2 ring-offset-background transition",
                hovered && "brightness-75"
              )}
            >
              {userInitials}
            </div>
          )}

          {/* Hover overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full transition-opacity",
              hovered || uploading ? "opacity-100" : "opacity-0"
            )}
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-white drop-shadow-md" />
            ) : (
              <Camera className="h-7 w-7 text-white drop-shadow-md" />
            )}
          </div>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-center text-xs text-muted-foreground">
          Click to upload · JPG, PNG · Max 5 MB
        </p>
      </CardContent>
    </Card>
  );
}
