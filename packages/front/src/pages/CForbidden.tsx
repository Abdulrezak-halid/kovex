import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CForbidden() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md rounded-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Access restricted
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your role does not have permission to open this page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
