
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Coins, TrendingUp, ShoppingBag, Zap, Users, Baby, Sparkles } from "lucide-react";
import { BABY_ANIMAL_IMAGES, UI_ICONS } from "@/lib/animal-images";

export default function ZooEconomyGuide() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setLocation('/zoo-overview')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <img src={BABY_ANIMAL_IMAGES.lion} alt="Baby Löwe" className="w-32 h-32 mx-auto" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            💰 So funktioniert dein Zoo!
          </h1>
          <p className="text-lg text-muted-foreground">
            Alles über ZooMünzen, Tiere und wie dein Zoo reich wird
          </p>
        </div>

        {/* 1. ZooMünzen verdienen */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <img src={UI_ICONS.coin} alt="Coins" className="w-10 h-10" />
              1. ZooMünzen verdienen 💰
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Training */}
              <div className="bg-white/80 rounded-lg p-4 border-2 border-blue-300">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                  📚 Training (Hauptmodus)
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ <strong>2 Münzen</strong> pro richtiger Aufgabe</li>
                  <li>🎁 <strong>50 Münzen Bonus</strong> bei Level-Up!</li>
                  <li>⭐ <strong>Viel XP</strong> für deine Tiere (10 XP)</li>
                  <li>🦁 <strong>15% Chance</strong> auf neues Tier</li>
                  <li>💡 <strong>Tipp:</strong> Hier lernst du am besten!</li>
                </ul>
              </div>

              {/* Spiele */}
              <div className="bg-white/80 rounded-lg p-4 border-2 border-purple-300">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                  🎮 Zoo-Spiele (Bonus-Spaß)
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>💰 <strong>6-10 Münzen</strong> pro Aufgabe (mehr!)</li>
                  <li>🎁 <strong>25-40 Münzen</strong> Spiel-Bonus</li>
                  <li>🦒 <strong>18-30% Chance</strong> auf Tier</li>
                  <li>⚡ <strong>Schwerer = Mehr Münzen!</strong></li>
                  <li>💡 <strong>Tipp:</strong> Für schnelle Münzen!</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-400">
              <h4 className="font-bold mb-2">🎯 Beispiel-Rechnung:</h4>
              <p className="text-sm">
                <strong>Training:</strong> 10 Aufgaben = 20 Münzen + 50 Bonus (Level-Up) = <strong className="text-green-700">70 Münzen</strong><br/>
                <strong>Zahlenwaage-Spiel:</strong> 10 Aufgaben = 80 Münzen + 30 Bonus = <strong className="text-purple-700">110 Münzen</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Tiere & Passive Einnahmen */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Baby className="w-10 h-10" />
              2. Tiere = Passive Einnahmen 🦁
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">So funktioniert's:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🐣</div>
                  <div>
                    <p className="font-semibold">Baby-Tier (0-1000 XP)</p>
                    <p className="text-sm text-muted-foreground">Wenige Besucher, niedrige Kosten. Wächst mit <strong>10 XP pro Tag</strong></p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🦁</div>
                  <div>
                    <p className="font-semibold">Erwachsenes Tier (1000 XP)</p>
                    <p className="text-sm text-muted-foreground">Viele Besucher! <strong>2-4x mehr Einnahmen</strong> als Baby!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 border-2 border-blue-400">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Besucher bringen Münzen!
              </h4>
              <p className="text-sm mb-2">
                Jedes Tier zieht Besucher an. Besucher zahlen <strong>2 Münzen Eintritt</strong>!
              </p>
              <p className="text-sm">
                <strong>Beispiel:</strong> Ein erwachsener Löwe = 12 Besucher/Tag
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border-2 border-orange-400">
              <h4 className="font-bold mb-2">⏰ Offline-Belohnungen!</h4>
              <p className="text-sm">
                Deine Tiere arbeiten auch, wenn du nicht da bist! Bis zu <strong>24 Stunden</strong> sammelt dein Zoo Münzen.
              </p>
              <p className="text-sm mt-2">
                <strong>Wichtig:</strong> Erwachsene Tiere = Mehr Offline-Münzen! 🎁
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Der Shop */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <ShoppingBag className="w-10 h-10" />
              3. Der Shop - Investiere klug! 🏪
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {/* Günstig */}
              <div className="bg-white/80 rounded-lg p-3 border-2 border-green-300">
                <h4 className="font-bold text-green-700 mb-2">💚 Günstig (15-80 Münzen)</h4>
                <ul className="text-sm space-y-1">
                  <li>🌳 Dekoration</li>
                  <li>🍌 Futter (25-40)</li>
                  <li>⚽ Spielzeug (40-60)</li>
                  <li><strong>→ Schnelle Erfolge!</strong></li>
                </ul>
              </div>

              {/* Mittel */}
              <div className="bg-white/80 rounded-lg p-3 border-2 border-yellow-300">
                <h4 className="font-bold text-yellow-700 mb-2">💛 Mittel (400-1000 Münzen)</h4>
                <ul className="text-sm space-y-1">
                  <li>🏠 Gehege (400-1000)</li>
                  <li>⭐ Premium-Items</li>
                  <li><strong>→ Langfristige Ziele!</strong></li>
                </ul>
              </div>

              {/* Teuer */}
              <div className="bg-white/80 rounded-lg p-3 border-2 border-red-300">
                <h4 className="font-bold text-red-700 mb-2">❤️ Premium (500-1200)</h4>
                <ul className="text-sm space-y-1">
                  <li>🌈 Spezial-Items</li>
                  <li>🏝️ Spezial-Häuser (800-900)</li>
                  <li><strong>→ Mega-Boni!</strong></li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 border-2 border-pink-400">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Geheime Boni entdecken! ✨
              </h4>
              <p className="text-sm">
                Manche Items geben <strong>versteckte Boni</strong>:<br/>
                💰 +10-100% Münzen | ⭐ +10-40% XP | 🦁 +15-50% Tier-Chance | 👥 +5-50 Besucher
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Strategie-Tipps */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <TrendingUp className="w-10 h-10" />
              4. Profi-Tipps für Zoo-Meister 🏆
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-bold text-blue-700 mb-3">🎯 Früh-Spiel (Level 1-5)</h4>
                <ul className="text-sm space-y-2">
                  <li>✅ Spiele <strong>Training</strong> für XP & Lernen</li>
                  <li>✅ Kaufe <strong>Dekoration & Futter</strong> (schnell)</li>
                  <li>✅ Sammle viele Baby-Tiere</li>
                  <li>✅ <strong>Spare</strong> für erstes Gehege (400-600)</li>
                </ul>
              </div>

              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-bold text-purple-700 mb-3">🚀 Spät-Spiel (Level 6+)</h4>
                <ul className="text-sm space-y-2">
                  <li>✅ Spiele <strong>Zoo-Spiele</strong> für Münzen</li>
                  <li>✅ Kaufe <strong>Gehege & Spezial-Häuser</strong></li>
                  <li>✅ Warte auf <strong>Tier-Evolutionen</strong> (Offline!)</li>
                  <li>✅ Investiere in <strong>Münz-Boni</strong> (+50-100%)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border-2 border-yellow-400 mt-4">
              <h4 className="font-bold mb-2">💡 Geheimer Trick:</h4>
              <p className="text-sm">
                <strong>Kombiniere Items!</strong> Kaufe Futter + Spielzeug + Gehege für die gleiche Tiergruppe = <strong>MEGA-BONUS!</strong><br/>
                Beispiel: Banane + Kletterseil + Affen-Insel = Affen bringen <strong>2-3x mehr Münzen</strong>! 🐵💰
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 5. Zusammenfassung */}
        <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-4 border-rainbow">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🎊 Zusammenfassung: Der Weg zum Zoo-Champion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">1️⃣</div>
                <p><strong>Lerne & Spiele:</strong> Training für XP, Spiele für Münzen</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">2️⃣</div>
                <p><strong>Sammle Tiere:</strong> Mehr Tiere = Mehr Besucher = Mehr Münzen</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">3️⃣</div>
                <p><strong>Baby → Erwachsen:</strong> 4 Tage warten = 3x mehr Einnahmen!</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">4️⃣</div>
                <p><strong>Kaufe klug:</strong> Günstig starten, dann in Gehege investieren</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">5️⃣</div>
                <p><strong>Nutze Boni:</strong> Items kombinieren für Mega-Effekte!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
