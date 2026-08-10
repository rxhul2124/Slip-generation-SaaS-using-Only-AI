import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/stores/notificationStore";

export function ForgotPasswordPage() {
  const notify = useNotificationStore((state) => state.push);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    notify({ tone: "success", title: "Reset link prepared", body: "Check your inbox for password reset instructions." });
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Reset password</CardTitle>
          <CardDescription>Enter your email and Slipora will send a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="email@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button className="w-full" loading={loading} onClick={handleSend}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
