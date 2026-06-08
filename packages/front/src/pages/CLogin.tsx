import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useLocation } from "wouter";
import { AlertCircle, LogIn } from "lucide-react";
import { useCAuth } from "@/lib/auth";
import { isValidEmail, normalizeEmail } from "@/lib/form-validation";
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
import { CLanguageDropdown } from "@/components/layout/CLanguageDropdown";
import { CThemeToggle } from "@/components/layout/CThemeToggle";

const lightLogo = "/assets/images/logos/project-logo-primary-light.png";
const darkLogo = "/assets/images/logos/project-logo-horizontal.png";

export default function CLogin() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [, setLocation] = useLocation();
  const { login } = useCAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const kovexLogo = mounted && resolvedTheme === "dark" ? darkLogo : lightLogo;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const normalizedEmail = normalizeEmail(email);
    const emailMissing = !normalizedEmail;
    const emailInvalid = !emailMissing && !isValidEmail(normalizedEmail);
    const passwordMissing = !password;
    if (emailMissing || emailInvalid || passwordMissing) return;

    setError("");
    setSubmitting(true);

    try {
      await login(normalizedEmail, password);
      setLocation("/");
    } catch {
      setError(t("invalidLogin"));
    } finally {
      setSubmitting(false);
    }
  }

  const normalizedEmail = normalizeEmail(email);
  const emailMissing = submitted && !normalizedEmail;
  const emailInvalid =
    submitted && !!normalizedEmail && !isValidEmail(normalizedEmail);
  const passwordMissing = submitted && !password;

  return (
    <main className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <img
          src={kovexLogo}
          alt="Kovex ERP"
          className="h-9 w-auto rounded-sm"
        />
        <div className="flex items-center gap-1.5">
          <CLanguageDropdown />
          <CThemeToggle />
        </div>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl items-center justify-center px-4 py-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_420px]">
          <section className="hidden lg:block">
            <img
              src={kovexLogo}
              alt="Kovex ERP"
              className="h-24 w-auto rounded-md"
            />
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight">
              {t("loginHeadline")}
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              {t("loginSubheading")}
            </p>
          </section>

          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <img
                src={kovexLogo}
                alt="Kovex ERP"
                className="mb-2 h-16 w-auto rounded-md lg:hidden"
              />
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
                    onBlur={(event) =>
                      setEmail(normalizeEmail(event.target.value))
                    }
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  {emailMissing && (
                    <p className="text-xs text-destructive">
                      {t("requiredField")}
                    </p>
                  )}
                  {emailInvalid && (
                    <p className="text-xs text-destructive">
                      {t("invalidEmail")}
                    </p>
                  )}
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
                  {passwordMissing && (
                    <p className="text-xs text-destructive">
                      {t("requiredField")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || !email || !password || emailInvalid}
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
