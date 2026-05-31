import { Key, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ApiKeysSection() {
  const notify = useNotificationStore((state) => state.push);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="bg-card/70 backdrop-blur">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              API Keys
              <Badge variant="muted">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>
              Create and manage API keys for programmatic access to the Slipora
              platform.
            </CardDescription>
          </div>
          <Key className="h-5 w-5 text-primary" />
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {/* Coming Soon notice */}
          <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold">
              API Access Is Coming Soon
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Generate API keys to integrate Slipora with your ERP, warehouse
              management system, or custom workflows. This feature is currently
              under development.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  title: "REST API",
                  description: "Full CRUD access to slips, templates & more",
                },
                {
                  title: "Webhooks",
                  description: "Real-time event notifications to your server",
                },
                {
                  title: "SDKs",
                  description: "Official libraries for Node.js, Python & Go",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-border/50 bg-muted/30 p-3 text-left"
                >
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="mt-5"
              onClick={() =>
                notify({
                  tone: "info",
                  title: "Coming soon",
                  body: "API key management will be available in a future update. We'll notify you when it's ready.",
                })
              }
            >
              <Key className="h-4 w-4" />
              Notify Me When Available
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
