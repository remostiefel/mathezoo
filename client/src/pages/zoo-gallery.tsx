import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Gift, Users } from "lucide-react";
import { AppNavigation } from "@/components/ui/app-navigation";
import { useToast } from "@/hooks/use-toast";
import { BABY_ANIMAL_IMAGES, ADULT_ANIMAL_IMAGES } from "@/lib/animal-images";
import modernZoo from '@assets/generated_images/modern_playful_children\'s_zoo_design.png';
import africanZoo from '@assets/generated_images/african_safari_zoo_landscape.png';
import jungleZoo from '@assets/generated_images/tropical_jungle_zoo_adventure.png';
import arcticZoo from '@assets/generated_images/arctic_zoo_with_polar_animals.png';
import oceanZoo from '@assets/generated_images/ocean_aquarium_zoo_display.png';
import interactiveZoo from '@assets/generated_images/interactive_children\'s_zoo_park.png';

const ZOOKEEPER_NAMES = ["Leo", "Emma", "Max", "Sophie", "Finn", "Clara", "Noah", "Mia"];

// Übersetzung: English → Deutsch
const ANIMAL_NAMES: Record<string, string> = {
  cheetah: "Gepard",
  lion: "Löwe",
  tiger: "Tiger",
  elephant: "Elefant",
  giraffe: "Giraffe",
  zebra: "Zebra",
  monkey: "Affe",
  panda: "Panda",
  penguin: "Pinguin",
  koala: "Koala",
  rhinoceros: "Nashorn",
  hippopotamus: "Flusspferd",
  crocodile: "Krokodil",
  parrot: "Papagei",
  flamingo: "Flamingo",
  peacock: "Pfau",
  owl: "Eule",
  eagle: "Adler",
  swan: "Schwan",
  dolphin: "Delfin",
  shark: "Hai",
  turtle: "Schildkröte",
  snake: "Schlange",
  bear: "Bär",
  fox: "Fuchs",
  wolf: "Wolf",
  deer: "Hirsch",
  moose: "Elch",
  kangaroo: "Känguru",
  ostrich: "Strauß",
  camel: "Kamel",
  llama: "Lama",
  sloth: "Faultier",
  armadillo: "Gürteltier",
  anteater: "Ameisenbär",
  hedgehog: "Igel",
  rabbit: "Kaninchen",
  squirrel: "Eichhörnchen",
};

const PLUSHIE_PRIZES = [
  { id: 1, name: "🦁 Löwen-Plüsch", value: 50, color: "bg-yellow-200" },
  { id: 2, name: "🐸 Frosch-Plüsch", value: 30, color: "bg-green-200" },
  { id: 3, name: "🐧 Pinguin-Plüsch", value: 40, color: "bg-blue-200" },
  { id: 4, name: "🦜 Papagei-Plüsch", value: 25, color: "bg-red-200" },
  { id: 5, name: "🐼 Panda-Plüsch", value: 60, color: "bg-gray-200" },
  { id: 6, name: "🐵 Affen-Plüsch", value: 35, color: "bg-amber-200" },
  { id: 7, name: "🦒 Giraffen-Plüsch", value: 45, color: "bg-orange-200" },
  { id: 8, name: "🐘 Elefanten-Plüsch", value: 55, color: "bg-purple-200" },
];

export default function ZooGallery() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<typeof PLUSHIE_PRIZES[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  const [todayZookeeper] = useState(() => ZOOKEEPER_NAMES[Math.floor(Math.random() * ZOOKEEPER_NAMES.length)]);
  const [collectedPlushies, setCollectedPlushies] = useState<typeof PLUSHIE_PRIZES>([]);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * PLUSHIE_PRIZES.length);
    const prize = PLUSHIE_PRIZES[randomIndex];
    const spinAmount = 3600 + (randomIndex * 45);
    
    setRotation(spinAmount);
    
    setTimeout(() => {
      setSelectedPrize(prize);
      setCollectedPlushies(prev => [...prev, prize]);
      setIsSpinning(false);
      toast({
        title: `🎉 Gewonnen!`,
        description: `Du hast ${prize.name} gewonnen!`,
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      <style>{`
        @keyframes spin-wheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(3600deg); }
        }
        .wheel-spinning {
          animation: spin-wheel 3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
      <AppNavigation className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 border-b-2 border-white/30 shadow-lg" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🎨 Zoo-Galerie & Glücksrad
          </h1>
          <p className="text-gray-700">Schau dir die schönsten Bilder an und gewinne tolle Plüschtiere!</p>
        </div>

        <Tabs defaultValue="animals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80">
            <TabsTrigger value="animals" data-testid="tab-animals">🦁 Tiere</TabsTrigger>
            <TabsTrigger value="babies" data-testid="tab-babies">👶 Babys</TabsTrigger>
            <TabsTrigger value="zoos" data-testid="tab-zoos">🏗️ Zoos</TabsTrigger>
            <TabsTrigger value="wheel" data-testid="tab-wheel">🎡 Glücksrad</TabsTrigger>
          </TabsList>

          {/* Animals Gallery */}
          <TabsContent value="animals">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(ADULT_ANIMAL_IMAGES).map(([key, imagePath]) => (
                <Card key={key} className="hover-elevate overflow-hidden border-2 border-purple-300">
                  <img src={imagePath} alt={key} className="w-full h-48 object-cover" />
                  <CardContent className="p-3">
                    <p className="text-sm font-bold text-center text-purple-900">{ANIMAL_NAMES[key] || key}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Babies Gallery */}
          <TabsContent value="babies">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(BABY_ANIMAL_IMAGES).map(([key, imagePath]) => (
                <Card key={key} className="hover-elevate overflow-hidden border-2 border-pink-300">
                  <img src={imagePath} alt={`Baby ${key}`} className="w-full h-48 object-cover" />
                  <CardContent className="p-3">
                    <Badge className="w-full text-center justify-center bg-pink-500 text-white">
                      👶 {ANIMAL_NAMES[key] || key}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Zoos Gallery */}
          <TabsContent value="zoos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-elevate overflow-hidden border-2 border-blue-300">
                <img src={modernZoo} alt="Moderner Zoo" className="w-full h-64 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">🌈 Moderner Traum-Zoo</h3>
                  <p className="text-sm text-gray-600">Ein farbenfroher Zoo mit modernem Design für Kinder!</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate overflow-hidden border-2 border-blue-300">
                <img src={africanZoo} alt="Safari Zoo" className="w-full h-64 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">🌍 Afrikanische Safari</h3>
                  <p className="text-sm text-gray-600">Erlebe die Weiten der afrikanischen Savanne!</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate overflow-hidden border-2 border-blue-300">
                <img src={jungleZoo} alt="Jungle Zoo" className="w-full h-64 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">🌿 Tropischer Dschungel</h3>
                  <p className="text-sm text-gray-600">Abenteuer im grünen Regenwald!</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate overflow-hidden border-2 border-blue-300">
                <img src={arcticZoo} alt="Arctic Zoo" className="w-full h-64 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">❄️ Arktische Polarzone</h3>
                  <p className="text-sm text-gray-600">Kalte Tiere in ihrer natürlichen Heimat!</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate overflow-hidden border-2 border-blue-300">
                <img src={oceanZoo} alt="Ocean Zoo" className="w-full h-64 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">🌊 Ozean-Aquarium</h3>
                  <p className="text-sm text-gray-600">Bunte Unterwasserwelt zum Staunen!</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate overflow-hidden border-2 border-blue-300">
                <img src={interactiveZoo} alt="Interactive Zoo" className="w-full h-64 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">🎪 Interaktiver Freizeitpark</h3>
                  <p className="text-sm text-gray-600">Zoo mit Spielplatz und Attraktionen!</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Glücksrad & Zookeeper */}
          <TabsContent value="wheel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Glücksrad */}
              <Card className="border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    🎡 Glücksrad
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                  {/* Wheel */}
                  <div className="relative w-64 h-64 mx-auto">
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-yellow-500"></div>
                    </div>

                    {/* Wheel Circle */}
                    <div
                      ref={wheelRef}
                      className={`w-full h-full rounded-full border-8 border-yellow-400 shadow-2xl ${isSpinning ? 'wheel-spinning' : ''}`}
                      style={{
                        background: `conic-gradient(from 0deg, rgb(254, 215, 170), rgb(187, 247, 208), rgb(191, 219, 254), rgb(254, 228, 181), rgb(207, 250, 254), rgb(253, 186, 116), rgb(230, 126, 34), rgb(221, 214, 254))`,
                      }}
                    >
                      {PLUSHIE_PRIZES.map((prize, index) => {
                        const angle = (index * 360) / PLUSHIE_PRIZES.length;
                        return (
                          <div
                            key={prize.id}
                            className="absolute w-full h-full flex items-center justify-center"
                            style={{
                              transform: `rotate(${angle}deg)`,
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: '8px',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                color: '#000',
                                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                                transform: `rotate(${-angle}deg)`,
                              }}
                            >
                              {prize.name.split(' ')[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-6 hover:scale-110 transition-transform"
                    data-testid="button-spin-wheel"
                  >
                    {isSpinning ? "⏳ Dreht..." : "🎯 DREHEN!"}
                  </Button>

                  {selectedPrize && (
                    <Card className={`w-full ${selectedPrize.color}`}>
                      <CardContent className="p-4 text-center">
                        <p className="text-lg font-bold">{selectedPrize.name}</p>
                        <Badge className="mt-2">+{selectedPrize.value} Münzen</Badge>
                      </CardContent>
                    </Card>
                  )}

                  {collectedPlushies.length > 0 && (
                    <Card className="w-full border-2 border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50">
                      <CardContent className="p-4">
                        <p className="font-bold mb-3 text-lg">🎁 Deine Sammlung ({collectedPlushies.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {collectedPlushies.map((plushie, idx) => (
                            <Badge key={idx} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs py-1">
                              {plushie.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-white rounded-lg border border-pink-200">
                          <p className="text-sm text-gray-700">
                            💰 <strong>Gesamtwert:</strong> {collectedPlushies.reduce((sum, p) => sum + p.value, 0)} Münzen
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Zookeeper des Tages */}
              <Card className="border-2 border-green-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    👨‍💼 Zoowärter des Tages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-8 text-center border-2 border-green-300">
                    <div className="text-6xl mb-4">👨‍⚕️</div>
                    <h3 className="text-3xl font-bold text-green-900 mb-2">{todayZookeeper}</h3>
                    <p className="text-sm text-green-700">Der beste Zoowärter heute!</p>
                    <Badge className="mt-4 bg-green-600 text-white">🏆 Mitarbeiter des Tages</Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-lg">📋 Aufgaben heute:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">✅</span>
                        <p className="text-sm">Alle Tiere füttern und versorgen</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">✅</span>
                        <p className="text-sm">Gehege sauber machen und prüfen</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">✅</span>
                        <p className="text-sm">Tiere medizinisch überprüfen</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">✅</span>
                        <p className="text-sm">Besucher informieren und leiten</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => toast({ title: `Danke ${todayZookeeper}!`, description: "Der Zoowärter ist sehr glücklich!" })}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    data-testid="button-thank-zookeeper"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Danke sagen! 🎁
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
