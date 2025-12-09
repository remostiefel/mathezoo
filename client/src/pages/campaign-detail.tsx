import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Home, Zap, Coins, Trophy, Lock } from "lucide-react";
import { AppNavigation } from "@/components/ui/app-navigation";

// Mock Campaign Data - Alle 10 Kampagnen mit vollständigen Stories
const CAMPAIGNS: Record<string, any> = {
  "1": {
    id: "1",
    campaignName: "Zahlenwaage-Abenteuer",
    description: "Lerne, Zahlen zu vergleichen und gewinne ein Löwe-Pärchen!",
    storyText: "🦁 Die wilden Löwen brauchen Hilfe bei der Balance! Sie sind in einem geheimen Labyrinth gefangen, in dem jede Tür nur mit einer perfekten Gewichtsbalance geöffnet werden kann. Kannst du die richtigen Gewichte finden und die Löwen-Familie befreien?",
    emoji: "⚖️",
    levels: [
      { levelNumber: 1, title: "Level 1: Erste Schritte", storyText: "Der kleine Löwe braucht Hilfe. Vergleiche kleine Zahlen und öffne die erste Tür!", requirements: { tasksToComplete: 10, minSuccessRate: 70 } },
      { levelNumber: 2, title: "Level 2: Mittlerer Schwierigkeitsgrad", storyText: "Zwei Löwen sind befreit! Meistere größere Zahlen, um die nächsten zu retten.", requirements: { tasksToComplete: 20, minSuccessRate: 75 } },
      { levelNumber: 3, title: "Level 3: Fortgeschrittene", storyText: "Die ganze Familie ruft um Hilfe! Tückische Vergleiche warten auf dich.", requirements: { tasksToComplete: 30, minSuccessRate: 80 } },
      { levelNumber: 4, title: "Level 4: Expert", storyText: "Nur noch eine Tür! Die Herausforderungen werden mega-schwierig!", requirements: { tasksToComplete: 40, minSuccessRate: 85 } },
      { levelNumber: 5, title: "Level 5: Meister", storyText: "Die ultimative Herausforderung! Rette alle Löwen und werde zum Waagen-Meister!", requirements: { tasksToComplete: 50, minSuccessRate: 90 } },
    ],
    rewardAnimalType: "lion",
    rewardCoins: 500,
    rewardXP: 250,
    unlockLevel: 1,
    displayOrder: 1
  },
  "2": {
    id: "2",
    campaignName: "Zerlegungs-Safari",
    description: "Finde alle Zahlenzerlegungen und rette Affen!",
    storyText: "🐵 Die neugierigen Affen haben ihre Bananen in Gruppen sortiert und sind jetzt verwirrt! Sie können nicht mehr zurück ins Baumhaus, weil sie vergessen haben, wie sie ihre Vorräte zerlegt haben. Hilf ihnen, alle Zerlegungen zu finden und sie richtig zu rekonstruieren!",
    emoji: "🔢",
    levels: [
      { levelNumber: 1, title: "Level 1: Erste Zerlegungen", storyText: "Die jungen Affen sitzen in der ersten Baumhöhle. Kleine Zahlen zerlegen!", requirements: { tasksToComplete: 8, minSuccessRate: 75 } },
      { levelNumber: 2, title: "Level 2: Mittlere Zahlen", storyText: "Weiter oben im Baum! Zahlen bis 15 zerlegen!", requirements: { tasksToComplete: 16, minSuccessRate: 75 } },
      { levelNumber: 3, title: "Level 3: Große Zahlen", storyText: "Oben in der Krone! Zahlen bis 20 zerlegen!", requirements: { tasksToComplete: 24, minSuccessRate: 80 } },
      { levelNumber: 4, title: "Level 4: Profi", storyText: "Alles durcheinander! Mix aus allen Zahlen!", requirements: { tasksToComplete: 32, minSuccessRate: 85 } },
      { levelNumber: 5, title: "Level 5: Affen-Meister", storyText: "Ultimative Zerlegungen! Du bist fast der beste Zerlegungs-Affe!", requirements: { tasksToComplete: 40, minSuccessRate: 90 } },
    ],
    rewardAnimalType: "monkey",
    rewardCoins: 400,
    rewardXP: 200,
    unlockLevel: 2,
    displayOrder: 2
  },
  "3": {
    id: "3",
    campaignName: "10 Gewinnt! Challenge",
    description: "Ergänze zur 10 und befreie Elefanten!",
    storyText: "🐘 Die klugen Elefanten sind im Zahlen-Labyrinth gefangen! Der einzige Weg heraus ist, alle Zahlen zur 10 zu ergänzen. Die Elefanten können nicht ohne deine Hilfe entkommen!",
    emoji: "🎯",
    levels: [
      { levelNumber: 1, title: "Level 1: Der erste Elefant", storyText: "Ein Elefant sitzt an der ersten Gabelung. Ergänze zur 10!", requirements: { tasksToComplete: 12, minSuccessRate: 65 } },
      { levelNumber: 2, title: "Level 2: Zwei Elefanten", storyText: "Zwei Elefanten warten auf dich. Schneller denken!", requirements: { tasksToComplete: 24, minSuccessRate: 70 } },
      { levelNumber: 3, title: "Level 3: Die Herde", storyText: "Immer mehr Elefanten sehen dich. Bleib konzentriert!", requirements: { tasksToComplete: 36, minSuccessRate: 75 } },
      { levelNumber: 4, title: "Level 4: Challenge", storyText: "Die Elefanten rufen! Knifflige 10er-Aufgaben!", requirements: { tasksToComplete: 48, minSuccessRate: 80 } },
      { levelNumber: 5, title: "Level 5: Elefanten-Befreiung", storyText: "Der letzte Weg! Rette alle Elefanten!", requirements: { tasksToComplete: 60, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "elephant",
    rewardCoins: 600,
    rewardXP: 300,
    unlockLevel: 3,
    displayOrder: 3
  },
  "4": {
    id: "4",
    campaignName: "Verdopplungs-Expedition",
    description: "Meistere Verdopplungen und befreie Tiger!",
    storyText: "👯 Die majestätischen Tiger-Brüder sitzen sich gegenüber und können sich gegenseitig nicht sehen, weil eine Verdopplungs-Mauer zwischen ihnen steht. Wenn du alle Verdopplungen richtig machst, fällt die Mauer!",
    emoji: "👯",
    levels: [
      { levelNumber: 1, title: "Level 1: Erste Verdopplung", storyText: "Der erste Tiger wartet. Verdopple kleine Zahlen!", requirements: { tasksToComplete: 9, minSuccessRate: 70 } },
      { levelNumber: 2, title: "Level 2: Tiger-Kraft", storyText: "Der zweite Tiger sieht dich! Verdopple schneller!", requirements: { tasksToComplete: 18, minSuccessRate: 70 } },
      { levelNumber: 3, title: "Level 3: Wettbewerb", storyText: "Tiger wollen zeigen, wer stärker ist! Verdopple richtig!", requirements: { tasksToComplete: 27, minSuccessRate: 75 } },
      { levelNumber: 4, title: "Level 4: Mauer-Knacken", storyText: "Die Mauer beginnt zu wackeln! Noch ein bisschen mehr!", requirements: { tasksToComplete: 36, minSuccessRate: 80 } },
      { levelNumber: 5, title: "Level 5: Befreiung", storyText: "Letzte Verdopplung! Bring die Tiger zusammen!", requirements: { tasksToComplete: 45, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "tiger",
    rewardCoins: 550,
    rewardXP: 275,
    unlockLevel: 2,
    displayOrder: 4
  },
  "5": {
    id: "5",
    campaignName: "Giraffen-Höhen-Abenteuer",
    description: "Erreiche die Baumkronen und rette Giraffen!",
    storyText: "🦒 Die eleganten Giraffen sitzen viel zu hoch in den Baumkronen! Sie können nicht herunterkommen, weil die Leiter aus Zahlen aufgebaut ist und jede Sprosse eine richtige Rechenaufgabe braucht!",
    emoji: "🦒",
    levels: [
      { levelNumber: 1, title: "Level 1: Erste Sprosse", storyText: "Eine Giraffe schaut dich an. Erste leichte Aufgaben!", requirements: { tasksToComplete: 11, minSuccessRate: 72 } },
      { levelNumber: 2, title: "Level 2: Höher hinauf", storyText: "Drei Giraffen sind jetzt sichtbar! Schwieriger wird es!", requirements: { tasksToComplete: 22, minSuccessRate: 72 } },
      { levelNumber: 3, title: "Level 3: Doppelte Höhe", storyText: "Die Leitern werden länger! Konzentriert arbeiten!", requirements: { tasksToComplete: 33, minSuccessRate: 76 } },
      { levelNumber: 4, title: "Level 4: Wolkenhöhe", storyText: "So hoch waren wir noch nie! Knifflige Aufgaben!", requirements: { tasksToComplete: 44, minSuccessRate: 80 } },
      { levelNumber: 5, title: "Level 5: Baumkronen-Meister", storyText: "Rette alle Giraffen aus der Höhe!", requirements: { tasksToComplete: 55, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "giraffe",
    rewardCoins: 450,
    rewardXP: 220,
    unlockLevel: 1,
    displayOrder: 5
  },
  "6": {
    id: "6",
    campaignName: "Zebra-Streifen-Rätsel",
    description: "Finde die Muster und befreie Zebras!",
    storyText: "🦓 Die Zebras lieben Muster! Aber jemand hat alle ihre Streifen gelöscht und jetzt sind sie traurig! Löse alle Muster-Rätsel und Zerlegungen, um ihre schönen Streifen wieder zu färben!",
    emoji: "🦓",
    levels: [
      { levelNumber: 1, title: "Level 1: Erste Streifen", storyText: "Kleines Zebra-Baby! Erste einfache Muster!", requirements: { tasksToComplete: 10, minSuccessRate: 73 } },
      { levelNumber: 2, title: "Level 2: Muster-Meister", storyText: "Mehrere Zebras warten! Komplexere Muster!", requirements: { tasksToComplete: 20, minSuccessRate: 73 } },
      { levelNumber: 3, title: "Level 3: Herde erkennt dich", storyText: "Die ganze Herde schaut zu! Schwierigere Aufgaben!", requirements: { tasksToComplete: 30, minSuccessRate: 76 } },
      { levelNumber: 4, title: "Level 4: Champion", storyText: "Du wirst zum Muster-Champion! Knifflig wird es jetzt!", requirements: { tasksToComplete: 40, minSuccessRate: 80 } },
      { levelNumber: 5, title: "Level 5: Regenbogen-Zebras", storyText: "Alle Streifen sind jetzt bunt! Finale Herausforderung!", requirements: { tasksToComplete: 50, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "zebra",
    rewardCoins: 480,
    rewardXP: 240,
    unlockLevel: 3,
    displayOrder: 6
  },
  "7": {
    id: "7",
    campaignName: "Pinguin-Eis-Expedition",
    description: "Schmelze das Eis und rette Pinguine!",
    storyText: "🐧 Es ist so kalt in der Arktis! Die Pinguine frieren! Der einzige Weg sie zu wärmen ist, schnelle 10er-Aufgaben zu lösen - jede richtige Antwort fügt ein bisschen Wärme hinzu!",
    emoji: "🐧",
    levels: [
      { levelNumber: 1, title: "Level 1: Erstes Tauwetter", storyText: "Ein Pinguin zittert. Schnell 10er-Aufgaben!", requirements: { tasksToComplete: 14, minSuccessRate: 68 } },
      { levelNumber: 2, title: "Level 2: Das Eis knackt", storyText: "Mehr Pinguine werden sichtbar. Schneller!", requirements: { tasksToComplete: 28, minSuccessRate: 68 } },
      { levelNumber: 3, title: "Level 3: Wärme breitet sich aus", storyText: "Die Kolonie wird warm! Immer schneller!", requirements: { tasksToComplete: 42, minSuccessRate: 71 } },
      { levelNumber: 4, title: "Level 4: Schmelz-Explosion", storyText: "Das ganze Eis schmilzt! Super schnelle Aufgaben!", requirements: { tasksToComplete: 56, minSuccessRate: 75 } },
      { levelNumber: 5, title: "Level 5: Sommer-Party", storyText: "Alle Pinguine sind glücklich und warm!", requirements: { tasksToComplete: 70, minSuccessRate: 80 } },
    ],
    rewardAnimalType: "penguin",
    rewardCoins: 520,
    rewardXP: 260,
    unlockLevel: 2,
    displayOrder: 7
  },
  "8": {
    id: "8",
    campaignName: "Panda-Bambus-Quest",
    description: "Zerlege Bambus-Zahlen und rette Pandas!",
    storyText: "🐼 Hungrige Pandas brauchen Bambus! Sie haben einen riesigen Bambus-Vorrat, aber niemand kann ihn richtig in Portionen zerlegen. Löse alle Zerlegungen und Pandas können endlich fressen!",
    emoji: "🐼",
    levels: [
      { levelNumber: 1, title: "Level 1: Kleine Portionen", storyText: "Ein Panda wartet. Kleine Bambus-Zerlegungen!", requirements: { tasksToComplete: 9, minSuccessRate: 74 } },
      { levelNumber: 2, title: "Level 2: Mehr Pandas", storyText: "Zwei Pandas sind hungrig! Mehr Zerlegungen!", requirements: { tasksToComplete: 18, minSuccessRate: 74 } },
      { levelNumber: 3, title: "Level 3: Die ganze Familie", storyText: "Die ganze Panda-Familie kommt zum Essen!", requirements: { tasksToComplete: 27, minSuccessRate: 77 } },
      { levelNumber: 4, title: "Level 4: Fest-Vorbereitung", storyText: "Ein großes Panda-Fest kommt! Knifflige Zerlegungen!", requirements: { tasksToComplete: 36, minSuccessRate: 80 } },
      { levelNumber: 5, title: "Level 5: Bambus-Überfluss", storyText: "Alle sind voll und glücklich! Du bist der Bambus-Meister!", requirements: { tasksToComplete: 45, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "panda",
    rewardCoins: 530,
    rewardXP: 265,
    unlockLevel: 4,
    displayOrder: 8
  },
  "9": {
    id: "9",
    campaignName: "Adler-Flug-Challenge",
    description: "Fliege hoch und rette Adler!",
    storyText: "🦅 Majestätische Adler sind in goldenen Käfigen gefangen! Der einzige Weg sie zu befreien ist, alle Rechenarten zu meistern. Jede gelöste Aufgabe öffnet einen Käfig!",
    emoji: "🦅",
    levels: [
      { levelNumber: 1, title: "Level 1: Erster Adler", storyText: "Ein großer Adler schaut dich an. Erste Aufgaben!", requirements: { tasksToComplete: 13, minSuccessRate: 71 } },
      { levelNumber: 2, title: "Level 2: Zwei Adler", storyText: "Ein zweiter Adler winkt mit den Flügeln!", requirements: { tasksToComplete: 26, minSuccessRate: 71 } },
      { levelNumber: 3, title: "Level 3: Horst-Familie", storyText: "Die ganze Adler-Familie braucht deine Hilfe!", requirements: { tasksToComplete: 39, minSuccessRate: 74 } },
      { levelNumber: 4, title: "Level 4: In die Höhe", storyText: "Sie beginnen zu fliegen! Noch ein bisschen!", requirements: { tasksToComplete: 52, minSuccessRate: 78 } },
      { levelNumber: 5, title: "Level 5: Freiheit", storyText: "Alle Adler fliegen frei über den Himmel!", requirements: { tasksToComplete: 65, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "eagle",
    rewardCoins: 540,
    rewardXP: 270,
    unlockLevel: 3,
    displayOrder: 9
  },
  "10": {
    id: "10",
    campaignName: "Delfin-Ozean-Abenteuer",
    description: "Schwimme mit Delfinen und befreie sie!",
    storyText: "🐬 Intelligente Delfine spielen im Meer, aber sie sind von einem unsichtbaren Zahlen-Netz gefangen! Verdopple und ergänze Zahlen, um die Maschen aufzureißen und ihre Freiheit zu gewinnen!",
    emoji: "🐬",
    levels: [
      { levelNumber: 1, title: "Level 1: Erste Maschen", storyText: "Ein Delfin winkt dir zu! Erste Aufgaben!", requirements: { tasksToComplete: 11, minSuccessRate: 69 } },
      { levelNumber: 2, title: "Level 2: Mehr Delfine", storyText: "Eine Delfin-Gruppe spielt! Schwieriger wird es!", requirements: { tasksToComplete: 22, minSuccessRate: 69 } },
      { levelNumber: 3, title: "Level 3: Das Netz wird locker", storyText: "Das Netz reißt! Noch mehr Aufgaben!", requirements: { tasksToComplete: 33, minSuccessRate: 72 } },
      { levelNumber: 4, title: "Level 4: Großes Finale", storyText: "Fast frei! Knifflige Aufgaben für die Freiheit!", requirements: { tasksToComplete: 44, minSuccessRate: 76 } },
      { levelNumber: 5, title: "Level 5: Frei im Meer", storyText: "Alle Delfine springen frei durch die Wellen!", requirements: { tasksToComplete: 55, minSuccessRate: 85 } },
    ],
    rewardAnimalType: "dolphin",
    rewardCoins: 560,
    rewardXP: 280,
    unlockLevel: 4,
    displayOrder: 10
  }
};

export default function CampaignDetail() {
  const [, setLocation] = useLocation();
  const match = useRoute("/campaigns/:id");
  const isActive = match && typeof match === 'object' && 'id' in match ? match as any : null;
  const { user } = useAuth();
  
  const campaignId = isActive?.id ? isActive.id : "1";
  const campaign = CAMPAIGNS[campaignId];

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <AppNavigation />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Kampagne nicht gefunden</h1>
          <Button onClick={() => setLocation("/campaigns")}>Zurück zu Kampagnen</Button>
        </div>
      </div>
    );
  }

  // Mock progress (würde vom Server kommen)
  const currentLevel = 1;
  const isCompleted = false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <AppNavigation />
      
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => setLocation("/campaigns")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
          <Button variant="outline" onClick={() => setLocation("/student")} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            HOME
          </Button>
        </div>

        {/* Story Card */}
        <Card className="bg-gradient-to-br from-orange-100 to-amber-100 border-4 border-orange-400 mb-8 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="text-8xl">{campaign.emoji}</div>
              <div className="flex-1">
                <h1 className="text-5xl font-black text-orange-900 mb-2">{campaign.campaignName}</h1>
                <p className="text-xl text-orange-800 mb-4 font-semibold leading-relaxed">{campaign.storyText}</p>
                <div className="flex gap-3 flex-wrap">
                  <Badge className="bg-yellow-500 text-yellow-900 text-lg px-4 py-1">
                    <Coins className="w-4 h-4 mr-2" />
                    {campaign.rewardCoins} Münzen
                  </Badge>
                  <Badge className="bg-blue-500 text-white text-lg px-4 py-1">
                    <Zap className="w-4 h-4 mr-2" />
                    {campaign.rewardXP} XP
                  </Badge>
                  <Badge className="bg-purple-500 text-white text-lg px-4 py-1">
                    <Trophy className="w-4 h-4 mr-2" />
                    {campaign.rewardAnimalType && campaign.rewardAnimalType.charAt(0).toUpperCase() + campaign.rewardAnimalType.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="mb-8 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Dein Fortschritt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Level {currentLevel} von {campaign.levels.length}</span>
              <span className="text-2xl font-bold text-blue-600">{Math.round((currentLevel / campaign.levels.length) * 100)}%</span>
            </div>
            <Progress value={(currentLevel / campaign.levels.length) * 100} className="h-4" />
          </CardContent>
        </Card>

        {/* Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {campaign.levels.map((level: any, idx: number) => {
            const isLocked = idx + 1 > currentLevel + 1;
            const isActive = idx + 1 === currentLevel;
            const isCompleted = idx + 1 < currentLevel;

            return (
              <Card 
                key={level.levelNumber}
                className={`border-4 transition-all ${
                  isLocked ? 'border-gray-300 bg-gray-50' :
                  isActive ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg' :
                  isCompleted ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' :
                  'border-gray-300'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold">{level.title}</h3>
                        {isCompleted && <Badge className="bg-green-500">✓ Abgeschlossen</Badge>}
                        {isActive && <Badge className="bg-orange-500 text-white">Aktuell</Badge>}
                        {isLocked && <Badge className="bg-gray-400"><Lock className="w-3 h-3" /> Gesperrt</Badge>}
                      </div>
                      <p className="text-gray-700 mb-3">{level.storyText}</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📝 {level.requirements.tasksToComplete} Aufgaben</p>
                        <p>🎯 {level.requirements.minSuccessRate}% Erfolgsquote nötig</p>
                      </div>
                    </div>
                    {!isLocked && (
                      <Button 
                        onClick={() => setLocation('/student?mode=campaign&campaignId=' + campaignId + '&level=' + level.levelNumber)}
                        className={isActive ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold' : 'bg-green-500 text-white font-bold'}
                        size="lg"
                      >
                        {isCompleted ? 'Wiederholen' : 'Spielen'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Action */}
        {!isCompleted && (
          <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-500 mb-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-4xl font-black text-green-900 mb-4">🚀 Bereit zu starten?</h2>
              <p className="text-xl text-green-800 mb-6 font-semibold">Starte die Kampagne jetzt und rette die Tiere!</p>
              <Button 
                onClick={() => setLocation('/student?mode=campaign&campaignId=' + campaignId + '&level=1')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl px-12 py-4"
              >
                Kampagne Starten!
              </Button>
            </CardContent>
          </Card>
        )}

        {isCompleted && (
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-500">
            <CardContent className="p-8 text-center">
              <h2 className="text-4xl font-black text-purple-900 mb-4">🏆 Kampagne Abgeschlossen!</h2>
              <p className="text-xl text-purple-800 mb-6 font-semibold">Fantastisch! Du hast die Kampagne beendet und deine Belohnungen erhalten!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
