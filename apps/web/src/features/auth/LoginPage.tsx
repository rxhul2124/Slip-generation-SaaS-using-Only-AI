import { zodResolver } from "@hookform/resolvers/zod";
import { PackageCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean()
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const notify = useNotificationStore((state) => state.push);
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "ops@packslip.example", password: "ChangeMe123!", rememberMe: true }
  });

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
            <PackageCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black">Login to PackSlip</CardTitle>
          <CardDescription>Create slips, manage companies, and print faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await login(values.email, values.password, values.rememberMe);
                notify({ tone: "success", title: "Signed in", body: "You are ready to create slips." });
                navigate("/app");
              } catch (error) {
                notify({ tone: "error", title: "Login failed", body: error instanceof Error ? error.message : "Check your credentials and API status." });
              }
            })}
          >
            <Input placeholder="Email" {...form.register("email")} />
            <Input placeholder="Password" type="password" {...form.register("password")} />
            <div className="flex items-center justify-between">
              <Switch checked={form.watch("rememberMe")} onCheckedChange={(value) => form.setValue("rememberMe", value)} label="Remember me" />
              <Link className="text-sm font-semibold text-primary" to="/forgot-password">
                Forgot password
              </Link>
            </div>
            <Button className="w-full" type="submit">
              Login
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link className="font-semibold text-primary" to="/register">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
