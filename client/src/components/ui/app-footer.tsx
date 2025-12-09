
import { cn } from "@/lib/utils";

export function AppFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 backdrop-blur-sm mt-auto", className)}>
      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* About MatheZoo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦁</span>
              <h3 className="font-bold text-lg bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">MatheZoo</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Adaptives Mathe-Training mit 9 spannenden Spielen, Zoo-Management und 100+ progressiven Levels. Spielend Rechnen lernen!
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-800">✨ Features</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>🎮 9 verschiedene Mathe-Spiele</li>
              <li>🦁 Zoo-Gamification mit 50+ Tieren</li>
              <li>📈 100 adaptive Trainings-Level</li>
              <li>💰 Realistische Zoo-Wirtschaft</li>
            </ul>
          </div>

          {/* Contact & Links */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-800">📞 Kontakt</h3>
            <p className="text-xs text-muted-foreground">
              Erstellt mit ❤️ von{" "}
              <a href="mailto:lerncare@gmail.com" className="hover:text-primary underline font-semibold">
                Remo Stiefel
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              <a href="/" className="hover:text-primary underline">Startseite</a>
              {" • "}
              <a href="/info" className="hover:text-primary underline">System-Info</a>
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 MatheZoo. Alle Rechte vorbehalten. | Swiss Math Education 🇨🇭
            </p>
            <div className="text-xs text-muted-foreground space-x-3 flex flex-wrap">
              <span>🏦 Zoo-Wirtschaft</span>
              <span>🎯 100 Levels</span>
              <span>🌍 6 Partner-Zoos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
