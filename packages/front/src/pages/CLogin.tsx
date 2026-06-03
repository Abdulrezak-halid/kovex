import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { AlertCircle, LogIn } from "lucide-react";
import { useCAuth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CLogin() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login } = useCAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      setLocation("/");
    } catch {
      setError(t("invalidLogin"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_420px]">
          <section className="hidden lg:block">
            <p className="text-sm font-medium uppercase tracking-normal text-primary">
              Kovex ERP
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight">
              {t("loginHeadline")}
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              {t("loginSubheading")}
            </p>
          </section>

          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{t("login")}</CardTitle>
              <CardDescription>{t("loginDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || !email || !password}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {submitting ? t("signingIn") : t("login")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
