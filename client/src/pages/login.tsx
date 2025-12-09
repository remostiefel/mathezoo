import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login fehlgeschlagen");
      }

      const data = await response.json();

      toast({
        title: "Willkommen im MatheZoo!",
        description: `Hallo ${data.firstName || data.username}! Deine Tiere freuen sich auf dich!`,
      });

      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      const targetRoute = data.role === 'student' ? '/student' : '/teacher';
      window.location.href = targetRoute;
    } catch (error: any) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || "Benutzername oder Passwort stimmen nicht",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            MatheZoo
          </h1>
          <p className="text-muted-foreground">
            Melde dich an um dein Lern-Abenteuer zu starten
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Anmelden</CardTitle>
            <CardDescription>
              Gib deine Anmeldedaten ein
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label 
                  htmlFor="username" 
                  className="text-sm font-semibold text-foreground"
                >
                  Benutzername
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Dein Benutzername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  data-testid="input-username"
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-foreground"
                >
                  Passwort
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Dein Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  data-testid="input-password"
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-primary-foreground font-semibold"
                disabled={isLoading}
                data-testid="button-login"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Wird geladen...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Anmelden
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p>Noch keine Anmeldedaten? Wende dich an deinen Lehrer oder deine Lehrerin.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>MatheZoo - Mathematik lernen mit Spaß</p>
        </div>
      </div>
    </div>
  );
}
