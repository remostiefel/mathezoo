import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  showBack?: boolean;
  title?: string;
}

export function AppHeader({ showBack = true, title }: AppHeaderProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 p-2 rounded-lg">
            <span className="text-2xl">🦁</span>
          </div>
          <h1 className="text-xl font-bold font-sans">MatheZoo</h1>
          {title && <span className="text-sm text-muted-foreground ml-4">{title}</span>}
        </div>

        {/* Right: Navigation Buttons */}
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/student')}
            data-testid="button-header-home"
          >
            <Home className="w-4 h-4 mr-2" />
            HOME
          </Button>
          {isAuthenticated && user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-header-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
