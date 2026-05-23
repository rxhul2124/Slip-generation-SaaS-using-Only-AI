import { CheckCircle2, PackagePlus, Printer, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { label: "Create company", done: true, icon: Users },
  { label: "Upload logo", done: false, icon: Upload },
  { label: "Add products", done: true, icon: PackagePlus },
  { label: "Add companies", done: true, icon: Users },
  { label: "Select default slip size", done: true, icon: CheckCircle2 },
  { label: "Configure printer", done: false, icon: Printer }
];

export function OnboardingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Setup"
        description="Finish the basics before the first print run."
        actions={<Badge variant="warning">4 of 6 complete</Badge>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.label}>
            <CardHeader>
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <Badge variant={step.done ? "success" : "warning"}>{step.done ? "Done" : "Pending"}</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle>{step.label}</CardTitle>
              <CardDescription className="mt-2">This checklist keeps printing simple and ready.</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-5">
        <Button asChild>
          <Link to="/settings">Continue Setup</Link>
        </Button>
      </div>
    </>
  );
}
