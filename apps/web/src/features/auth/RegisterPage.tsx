import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  companyName: z.string().min(2)
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const notify = useNotificationStore((state) => state.push);
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", companyName: "" }
  });

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <PackagePlus className="h-9 w-9 text-primary" />
          <CardTitle className="text-2xl font-black">Create Slipora account</CardTitle>
          <CardDescription>Add your company and start printing simple slips.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await register(values);
                notify({ tone: "success", title: "Account created", body: "Choose a subscription to finish setup." });
                navigate("/billing?setup=1&next=/app");
              } catch (error) {
                notify({ tone: "error", title: "Registration failed", body: error instanceof Error ? error.message : "Try again after checking API status." });
              }
            })}
          >
            <Input placeholder="Your name" {...form.register("name")} />
            <Input placeholder="Work email" {...form.register("email")} />
            <Input placeholder="Company name" {...form.register("companyName")} />
            <Input placeholder="Password" type="password" {...form.register("password")} />
            <Button className="w-full" type="submit" loading={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
