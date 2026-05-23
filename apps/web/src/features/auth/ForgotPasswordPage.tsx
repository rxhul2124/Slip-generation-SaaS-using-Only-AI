import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/stores/notificationStore";

export function ForgotPasswordPage() {
  const notify = useNotificationStore((state) => state.push);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your email and PackSlip will send a reset link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="email@company.com" />
          <Button className="w-full" onClick={() => notify({ tone: "success", title: "Reset link prepared", body: "SMTP sends this email in production mode." })}>
            Send Reset Link
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
