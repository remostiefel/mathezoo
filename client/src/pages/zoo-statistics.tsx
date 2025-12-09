import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Users, Heart, Apple, Baby } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ZooProfile, calculateActiveBonuses, ZOO_SHOP_ITEMS } from "@/lib/zoo-game-system";
import { AppNavigation } from "@/components/ui/app-navigation";
import { UI_ICONS, BABY_ANIMAL_IMAGES } from "@/lib/animal-images";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ZooStatistics() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: zooProfile, isLoading, error } = useQuery<ZooProfile>({
    queryKey: ['/api/zoo/profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID required');
      const response = await apiRequest('GET', `/api/zoo/profile/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch zoo profile');
      return await response.json();
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000, // Cache für 30 Sekunden
  });

  // Lade echte Tier-Daten mit age/gender Information
  const { data: zooAnimalsData } = useQuery<{ animals: Array<{
    id: string;
    animalType: string;
    age: 'baby' | 'adult';
    gender?: 'male' | 'female';
    xp: number;
    unlockedAt: string;
  }> }>({
    queryKey: ['/api/zoo/animals', user?.id],
    queryFn: async () => {
      if (!user?.id) return { animals: [] };
      const response = await apiRequest('GET', `/api/zoo/animals/${user.id}`);
      return await response.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={BABY_ANIMAL_IMAGES.lion} alt="Lädt" className="w-32 h-32 mx-auto mb-4" />
          <p className="text-lg">Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={BABY_ANIMAL_IMAGES.fox} alt="Fehler" className="w-32 h-32 mx-auto mb-4" />
          <p className="text-lg text-red-600">Fehler beim Laden der Statistiken</p>
          <p className="text-sm text-gray-600 mt-2">{error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
          <Button onClick={() => setLocation('/zoo-overview')} className="mt-4">
            Zurück zum Zoo
          </Button>
        </div>
      </div>
    );
  }

  if (!zooProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={BABY_ANIMAL_IMAGES.lion} alt="Keine Daten" className="w-32 h-32 mx-auto mb-4" />
          <p className="text-lg">Keine Statistiken verfügbar</p>
          <Button onClick={() => setLocation('/zoo-overview')} className="mt-4">
            Zurück zum Zoo
          </Button>
        </div>
      </div>
    );
  }

  const bonuses = calculateActiveBonuses(zooProfile.ownedShopItems);

  // Berechne tägliche Einnahmen
  const baseVisitors = 100;
  const totalVisitors = baseVisitors + bonuses.visitorBoost;
  const visitorCoins = Math.floor(totalVisitors * 0.5); // Jeder Besucher bringt 0.5 Münzen

  const happiness = Math.min(100, bonuses.happinessBonus);
  const happinessMultiplier = 1 + (happiness / 100);

  const dailyCoins = Math.floor(visitorCoins * happinessMultiplier * (1 + bonuses.coinBonus / 100));

  // --- Berechne echte Unterhaltskosten mit zooAnimals ---
  const zooAnimals = zooAnimalsData?.animals || [];
  const babyCount = zooAnimals.filter(animal => animal.age === 'baby').length;
  const adultCount = zooAnimals.filter(animal => animal.age === 'adult').length;

  // Basis-Kosten pro Stunde (aus zoo-economy-engine.ts) - REDUZIERT für bessere Balance
  const BASE_MAINTENANCE_BABY = 0.1; // 2.4 Münzen/Tag
  const BASE_MAINTENANCE_FEMALE = 0.15; // 3.6 Münzen/Tag
  const BASE_MAINTENANCE_MALE = 0.2; // 4.8 Münzen/Tag
  const COST_MULTIPLIER_PER_ANIMAL = 0.01; // +1% pro Tier

  // Berechne tatsächliche Kosten
  const tierMultiplier = 1 + (zooAnimals.length * COST_MULTIPLIER_PER_ANIMAL);
  
  let babyCostPerHour = 0;
  let adultCostPerHour = 0;

  zooAnimals.forEach(animal => {
    if (animal.age === 'baby') {
      babyCostPerHour += BASE_MAINTENANCE_BABY * tierMultiplier;
    } else if (animal.age === 'adult') {
      // Erwachsene: Männchen kosten mehr als Weibchen
      const genderCost = animal.gender === 'male' ? BASE_MAINTENANCE_MALE : BASE_MAINTENANCE_FEMALE;
      adultCostPerHour += genderCost * tierMultiplier;
    }
  });

  const totalCostPerHour = babyCostPerHour + adultCostPerHour;
  // --- Ende Unterhaltskosten-Berechnung ---

  // Generate 7-day trend data
  const generateTrendData = () => {
    const data = [];
    const today = new Date();
    const currentCoins = zooProfile?.totalCoins || 0;
    const currentAnimals = zooAnimals.length;
    const currentLevel = zooProfile?.level || 1;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
      
      // Simulate past data (trending towards current values)
      const progress = (7 - i) / 7;
      
      data.push({
        day: dayName,
        coins: Math.max(0, Math.round(currentCoins * (0.3 + progress * 0.7))),
        animals: Math.max(1, Math.round(currentAnimals * (0.4 + progress * 0.6))),
        visitors: baseVisitors + Math.round(bonuses.visitorBoost * progress),
        level: Math.max(1, Math.round(currentLevel * (0.7 + progress * 0.3)))
      });
    }
    return data;
  };

  const trendData = generateTrendData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <AppNavigation />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <img src={UI_ICONS.trophy} alt="Statistiken" className="w-32 h-32 mx-auto" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            📊 Zoo-Statistiken
          </h1>
          <p className="text-lg text-muted-foreground">
            Deine Tiere, Einnahmen und Kosten im Überblick
          </p>
        </div>

        {/* CHARTS SECTION */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center my-8">📈 Entwicklungs-Übersicht</h2>
          
          {/* Coins Chart */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src={UI_ICONS.coin} alt="Münzen" className="w-6 h-6 object-contain" />
                Geldentwicklung (letzte 7 Tage)
              </CardTitle>
              <CardDescription>Deine Münzen im Überblick</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #fbbf24', borderRadius: '8px' }}
                    formatter={(value) => `${value} Münzen`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="coins" 
                    stroke="#eab308" 
                    strokeWidth={3}
                    dot={{ fill: '#eab308', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Münzen"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Animals Chart */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                Anzahl Tiere (letzte 7 Tage)
              </CardTitle>
              <CardDescription>Deine Tiersammlung wächst!</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #22c55e', borderRadius: '8px' }}
                    formatter={(value) => `${value} Tiere`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="animals" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Tiere"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Visitors Chart */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                Besucherentwicklung (letzte 7 Tage)
              </CardTitle>
              <CardDescription>Mehr Besucher = mehr Münzen!</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #a855f7', borderRadius: '8px' }}
                    formatter={(value) => `${value} Besucher`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Besucher"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Level Chart */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Level-Entwicklung (letzte 7 Tage)
              </CardTitle>
              <CardDescription>Dein Fortschritt im Mathe-Zoo!</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #0ea5e9', borderRadius: '8px' }}
                    formatter={(value) => `Level ${value}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Unterhaltskosten Card */}
        <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-6 h-6" />
              Tierunterhaltskosten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">{babyCount} Baby-Tier{babyCount !== 1 ? 'e' : ''}</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(babyCostPerHour * 24)} <img src={UI_ICONS.coin} alt="Münzen" className="w-6 h-6 inline" />
                </div>
                <div className="text-xs text-muted-foreground">pro Tag</div>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">{adultCount} Erwachsene</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(adultCostPerHour * 24)} <img src={UI_ICONS.coin} alt="Münzen" className="w-6 h-6 inline" />
                </div>
                <div className="text-xs text-muted-foreground">pro Tag</div>
              </div>
            </div>

            <div className="bg-red-100 p-4 rounded-lg border-2 border-red-400">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">Gesamt-Unterhaltskosten:</span>
                <div className="text-3xl font-bold text-red-600">
                  {Math.round(totalCostPerHour * 24)} <img src={UI_ICONS.coin} alt="Münzen" className="w-8 h-8 inline" />/Tag
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                💡 Tipp: Mit mehr Tieren steigen die Kosten. Achte auf deine Einnahmen!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/zoo-overview')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>

          <div className="flex items-center gap-3">
            <img src={UI_ICONS.trophy} alt="Statistiken" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl font-bold">Zoo-Statistiken</h1>
          </div>
        </div>

        {/* Tägliche Einnahmen */}
        <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src={UI_ICONS.coin} alt="Münzen" className="w-6 h-6 object-contain" />
              Tägliche Einnahmen
            </CardTitle>
            <CardDescription>So viel verdienst du pro Tag passiv!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img src={UI_ICONS.coin} alt="Münzen" className="w-16 h-16 object-contain" />
              <div className="text-5xl font-bold text-green-700">
                {dailyCoins}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Basis-Besucher:</span>
                <div className="flex items-center gap-1 font-bold">
                  <Users className="w-4 h-4" />
                  {baseVisitors}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Bonus-Besucher (Items):</span>
                <div className="flex items-center gap-1 font-bold text-green-600">
                  <Users className="w-4 h-4" />
                  +{bonuses.visitorBoost}
                </div>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-bold">Gesamt-Besucher:</span>
                <div className="flex items-center gap-1 font-bold text-green-700">
                  <Users className="w-4 h-4" />
                  {totalVisitors}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span>Münzen pro Besucher:</span>
                <div className="flex items-center gap-1 font-bold">
                  <img src={UI_ICONS.coin} alt="Münzen" className="w-4 h-4 object-contain" />
                  0.5
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Glücks-Multiplikator:</span>
                <div className="flex items-center gap-1 font-bold text-pink-600">
                  <Heart className="w-4 h-4 fill-current" />
                  ×{happinessMultiplier.toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Münz-Bonus (Items):</span>
                <div className="flex items-center gap-1 font-bold text-yellow-600">
                  <img src={UI_ICONS.coin} alt="Münzen" className="w-4 h-4 object-contain" />
                  +{bonuses.coinBonus}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier-Zufriedenheit */}
        <Card className="bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-600" />
              Tier-Zufriedenheit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress value={happiness} className="flex-1 h-6" />
              <span className="text-3xl font-bold text-pink-600">{happiness}%</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {happiness >= 75 && (
                <Badge className="bg-green-500 text-white py-2 justify-center flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current" />
                  Super glücklich!
                </Badge>
              )}
              {happiness >= 50 && happiness < 75 && (
                <Badge className="bg-yellow-500 text-white py-2 justify-center flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current" />
                  Zufrieden
                </Badge>
              )}
              {happiness < 50 && (
                <Badge className="bg-orange-500 text-white py-2 justify-center flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Geht so
                </Badge>
              )}

              {bonuses.happinessBonus > 0 && (
                <Badge className="bg-pink-500 text-white py-2 justify-center">
                  +{bonuses.happinessBonus}% durch Items!
                </Badge>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <img src={UI_ICONS.trophy} alt="Tipp" className="w-5 h-5 object-contain flex-shrink-0 mt-0.5" />
              <p>Tipp: Kaufe Spielzeuge, Futter und Dekorationen, um die Zufriedenheit zu erhöhen!</p>
            </div>
          </CardContent>
        </Card>

        {/* Aktive Boni Übersicht */}
        <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Deine aktiven Boni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <img src={UI_ICONS.coin} alt="Münzen" className="w-12 h-12 mx-auto mb-2 object-contain" />
                    <div className="text-2xl font-bold text-yellow-600">+{bonuses.coinBonus}%</div>
                    <p className="text-sm text-muted-foreground">Münz-Bonus</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <img src={UI_ICONS.xp} alt="XP" className="w-12 h-12 mx-auto mb-2 object-contain" />
                    <div className="text-2xl font-bold text-blue-600">+{bonuses.xpBonus}%</div>
                    <p className="text-sm text-muted-foreground">XP-Bonus</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <img src={BABY_ANIMAL_IMAGES.lion} alt="Tiere" className="w-12 h-12 mx-auto mb-2 object-contain" />
                    <div className="text-2xl font-bold text-green-600">+{bonuses.animalChanceBonus}%</div>
                    <p className="text-sm text-muted-foreground">Tier-Chance</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">+{bonuses.visitorBoost}</div>
                    <p className="text-sm text-muted-foreground">Besucher/Tag</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Empfehlungen */}
        <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src={UI_ICONS.trophy} alt="Empfehlungen" className="w-6 h-6 object-contain" />
              Empfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bonuses.coinBonus < 50 && (
              <div className="flex items-start gap-2 text-sm">
                <img src={UI_ICONS.coin} alt="Shop" className="w-5 h-5 object-contain flex-shrink-0 mt-0.5" />
                <p>Kaufe mehr Items mit Münz-Bonus, um noch mehr zu verdienen!</p>
              </div>
            )}
            {bonuses.happinessBonus < 50 && (
              <div className="flex items-start gap-2 text-sm">
                <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <p>Kaufe Spielzeuge, um deine Tiere glücklicher zu machen!</p>
              </div>
            )}
            {bonuses.visitorBoost < 100 && (
              <div className="flex items-start gap-2 text-sm">
                <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p>Baue Dekorationen, um mehr Besucher anzulocken!</p>
              </div>
            )}
            {bonuses.animalChanceBonus < 30 && (
              <div className="flex items-start gap-2 text-sm">
                <img src={BABY_ANIMAL_IMAGES.tiger} alt="Tiere" className="w-5 h-5 object-contain flex-shrink-0 mt-0.5" />
                <p>Kaufe spezielle Items, um deine Tier-Sammel-Chance zu erhöhen!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empfehlungen */}
        <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src={UI_ICONS.trophy} alt="Empfehlungen" className="w-6 h-6 object-contain" />
              Tipps für deinen Zoo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalCostPerHour > 0 && dailyCoins > 0 && (
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="font-semibold mb-2">💡 Dein Zoo-Status:</p>
                {dailyCoins > Math.round(totalCostPerHour * 24) ? (
                  <p className="text-green-700">
                    ✅ Super! Dein Zoo verdient mehr ({dailyCoins} Münzen/Tag) als er kostet ({Math.round(totalCostPerHour * 24)} Münzen/Tag)!
                  </p>
                ) : (
                  <p className="text-orange-700">
                    ⚠️ Achtung! Deine Kosten ({Math.round(totalCostPerHour * 24)} Münzen/Tag) sind höher als deine Einnahmen ({dailyCoins} Münzen/Tag).
                    Kaufe mehr Dekorationen oder Gehege, um mehr Besucher anzulocken!
                  </p>
                )}
              </div>
            )}

            {bonuses.coinBonus < 30 && (
              <div className="flex items-start gap-2 text-sm bg-white/50 p-3 rounded-lg">
                <img src={UI_ICONS.coin} alt="Shop" className="w-5 h-5 object-contain flex-shrink-0 mt-0.5" />
                <p>Kaufe Items mit Münz-Bonus im Shop, um mehr zu verdienen!</p>
              </div>
            )}

            {bonuses.happinessBonus < 50 && (
              <div className="flex items-start gap-2 text-sm bg-white/50 p-3 rounded-lg">
                <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <p>Deine Tiere brauchen Spielzeuge! Glückliche Tiere = mehr Besucher!</p>
              </div>
            )}

            {bonuses.visitorBoost < 100 && (
              <div className="flex items-start gap-2 text-sm bg-white/50 p-3 rounded-lg">
                <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p>Baue mehr Dekorationen, um noch mehr Besucher anzulocken!</p>
              </div>
            )}

            {adultCount < 3 && babyCount > 0 && (
              <div className="flex items-start gap-2 text-sm bg-white/50 p-3 rounded-lg">
                <Baby className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p>Du hast {babyCount} Baby-Tier{babyCount !== 1 ? 'e' : ''}! Spiele Mathespiele, damit sie wachsen können!</p>
              </div>
            )}

            {zooAnimals.length < 10 && (
              <div className="flex items-start gap-2 text-sm bg-white/50 p-3 rounded-lg">
                <img src={BABY_ANIMAL_IMAGES.tiger} alt="Tiere" className="w-5 h-5 object-contain flex-shrink-0 mt-0.5" />
                <p>Sammle mehr Tiere! Jedes neue Tier bringt mehr Besucher und Münzen.</p>
              </div>
            )}

            {zooProfile.ownedShopItems.length === 0 && (
              <div className="flex items-start gap-2 text-sm bg-white/50 p-3 rounded-lg">
                <img src={UI_ICONS.coin} alt="Shop" className="w-5 h-5 object-contain flex-shrink-0 mt-0.5" />
                <p>Besuche den Shop und kaufe dein erstes Item! Das bringt dir extra Boni.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Original Title wieder unten */}
        <div className="text-center space-y-2">
          <img src={BABY_ANIMAL_IMAGES.lion} alt="Baby Löwe" className="w-32 h-32 mx-auto" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            💰 So funktioniert dein Zoo!
          </h1>
          <p className="text-lg text-muted-foreground">
            Alles über ZooMünzen, Tiere und wie dein Zoo reich wird
          </p>
        </div>
      </div>
    </div>
  );
}