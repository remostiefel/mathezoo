import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Trophy, Star, Coins, ShoppingBag, Gamepad2, Users, Home, Apple, Gift, Filter, Sparkles, Baby, TrendingUp, TrendingDown, Clock, Heart, Ticket, Check, Loader2 } from "lucide-react";
import { ZooProfile, ANIMAL_EMOJIS, ANIMAL_NAMES, ANIMAL_INFO, ZOO_SHOP_ITEMS, calculateLevel, experienceToNextLevel, ZOO_BADGES, calculateActiveBonuses, type Continent, type AnimalGroup, type ZooAnimal } from "@/lib/zoo-game-system";
import { getAnimalImage, UI_ICONS, HABITAT_IMAGES, BABY_ANIMAL_IMAGES } from "@/lib/animal-images";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { EconomyStatus } from "@/lib/zoo-economy-engine";
import { calculateElasticDemand } from "@/lib/zoo-economy-engine";
import babyLionImage from "@assets/generated_images/baby_lion_on_yellow_gradient_background.png";

// Assuming ANIMALS_DATABASE is imported and available, similar to ANIMAL_INFO
// import { ANIMALS_DATABASE } from "@/lib/animals-database"; // Example import

// Use ANIMAL_INFO from zoo-game-system which contains all animals
const ANIMALS_DATABASE = ANIMAL_INFO;

interface ZooOverviewProps {
  profile: ZooProfile;
  userId?: string; // Target user ID (for teacher viewing student)
  onRefresh?: () => void;
}

interface ZooAnimalWithXP {
  id: string; // Unique ID for each animal instance
  animalType: ZooAnimal;
  age: 'baby' | 'adult';
  gender?: 'male' | 'female'; // Added gender for breeding
  xp: number;
  unlockedAt: string;
}

// Interface for animal statistics (babies, females, males)
interface AnimalStats {
  animalType: ZooAnimal;
  babies: number;
  females: number;
  males: number;
  canBreed: boolean;
}

export function ZooOverview({ profile, userId: targetUserId, onRefresh }: ZooOverviewProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [continentFilter, setContinentFilter] = useState<Continent | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState<AnimalGroup | 'all'>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<ZooAnimal | null>(null);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [selectedBreedingType, setSelectedBreedingType] = useState<ZooAnimal | null>(null);
  const [selectedFemale, setSelectedFemale] = useState<number | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number>(Math.min(100, Math.max(1, profile.ticketPrice || 1)));
  const [selectedMale, setSelectedMale] = useState<number | null>(null);
  const [hasPartnerZoo, setHasPartnerZoo] = useState(false); // Partner zoo feature

  const currentLevel = calculateLevel(profile.experience);
  const xpToNext = experienceToNextLevel(profile.experience);
  const xpProgress = ((profile.experience % 100) / 100) * 100;

  // Cache active bonuses to avoid multiple calculations
  const activeBonuses = calculateActiveBonuses(profile.ownedShopItems);

  // Fetch userId from session as fallback only
  const { data: sessionData } = useQuery({
    queryKey: ['/api/auth/session'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/session');
      return await response.json();
    },
    staleTime: Infinity, // Session rarely changes
    enabled: !targetUserId, // Only fetch if no targetUserId provided
  });

  // Use provided userId or fall back to session user
  const userId = targetUserId || sessionData?.user?.id;

  // Load zoo animals with XP tracking from API
  const { data: zooAnimalsData, refetch: refetchZooAnimals } = useQuery<{ animals: ZooAnimalWithXP[] }>({
    queryKey: ['/api/zoo/animals', userId], // CRITICAL: Include userId in cache key
    queryFn: async () => {
      if (!userId) return { animals: [] };
      const response = await apiRequest('GET', `/api/zoo/animals/${userId}`);
      return await response.json();
    },
    enabled: !!userId, // Only run if we have a userId
  });

  const zooAnimals = zooAnimalsData?.animals || [];

  // Create a set of owned animal types from zooAnimals (the REAL source of truth!)
  // zooAnimals contains the actual instances with gender/baby info
  // FALLBACK: Use profile.totalAnimals if zooAnimals is empty
  const ownedAnimalTypes = new Set(
    (zooAnimals.length > 0 ? zooAnimals : profile.totalAnimals).map(a => {
      if (typeof a === 'string') return a;
      return (a as any).animalType;
    })
  );

  // Create a map for quick lookup of animal instances
  const animalInstanceMap = new Map(zooAnimals.map(a => [a.id, a]));

  // Load live economy status
  const { data: economyStatus } = useQuery<EconomyStatus>({
    queryKey: ['/api/zoo/economy-status', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/zoo/economy-status/${userId}`);
      return await response.json();
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds for live stats
  });

  // Load animal statistics (babies, females, males)
  const { data: animalStatsData } = useQuery({
    queryKey: ['/api/zoo/animals/stats', userId],
    queryFn: async () => {
      if (!userId) return { stats: [] }; // Return empty array if no userId
      const response = await apiRequest('GET', `/api/zoo/animals/stats/${userId}`);
      return await response.json();
    },
    enabled: !!userId, // Only run if we have a userId
  });

  const animalStats = animalStatsData?.stats || [];

  // Mutation for active breeding
  const breedingMutation = useMutation({
    mutationFn: async ({ animalType, femaleId, maleId }: { animalType: ZooAnimal; femaleId: string; maleId: string }) => {
      const response = await apiRequest('POST', '/api/zoo/breed', { animalType, femaleId, maleId });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/animals', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/animals/stats', userId] });
      refetchZooAnimals(); // Ensure the list is updated
      console.log("Breeding successful:", data);
      setShowBreedingModal(false);
      setSelectedFemale(null);
      setSelectedMale(null);
      setSelectedBreedingType(null);
    },
    onError: (error) => {
      console.error("Breeding failed:", error);
      // Optionally show error message to user
    },
  });

  // Mutation for selling animals
  const sellAnimalMutation = useMutation({
    mutationFn: async ({ animalId, animalType }: { animalId: string; animalType: ZooAnimal }) => {
      const response = await apiRequest('POST', '/api/zoo/sell-animal', { animalId, animalType });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/animals', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/economy-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/animals/stats', userId] });
      refetchZooAnimals(); // Ensure the list is updated
      console.log("Animal sold successfully:", data);
      // Optionally show success message or update UI
    },
    onError: (error) => {
      console.error("Selling animal failed:", error);
      // Optionally show error message to user
    },
  });

  // 🎟️ Mutation for updating ticket price
  const updateTicketPriceMutation = useMutation({
    mutationFn: async (newPrice: number) => {
      const response = await apiRequest('POST', '/api/zoo/update-ticket-price', { 
        userId,
        ticketPrice: newPrice 
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/economy-status', userId] });
    },
  });

  const games = [
    {
      id: 'zahlenwaage' as const,
      name: 'Zahlenwaage',
      emoji: '⚖️',
      path: '/game',
      color: 'from-blue-400 to-cyan-500',
      description: 'Vergleiche Zahlen und rette Tiere!',
      difficulty: '⭐⭐'
    },
    {
      id: 'ten-wins' as const,
      name: '10 gewinnt!',
      emoji: '🎯',
      path: '/ten-wins-game',
      color: 'from-green-400 to-emerald-500',
      description: 'Ergänze zur 10 gegen die Zeit!',
      difficulty: '⭐'
    },
    {
      id: 'decomposition' as const,
      name: 'Zerlegungs-Safari',
      emoji: '🔢',
      path: '/decomposition-safari',
      color: 'from-teal-400 to-cyan-500',
      description: 'Finde alle Zahlenzerlegungen!',
      difficulty: '⭐⭐'
    },
    {
      id: 'doubling' as const,
      name: 'Verdopplungs-Expedition',
      emoji: '👯',
      path: '/doubling-expedition',
      color: 'from-purple-400 to-pink-500',
      description: 'Meistere Verdopplungen!',
      difficulty: '⭐⭐⭐'
    },
    {
      id: 'pathfinder' as const,
      name: 'Wege durch den Zoo',
      emoji: '🗺️',
      path: '/zoo-pathfinder',
      color: 'from-indigo-400 to-purple-500',
      description: 'Finde den elegantesten Rechenweg!',
      difficulty: '⭐⭐⭐⭐'
    },
    {
      id: 'number-stairs' as const,
      name: 'Zahlen-Treppe',
      emoji: '🪜',
      path: '/number-stairs',
      color: 'from-indigo-400 to-purple-500',
      description: 'Ordne Zahlen von klein nach groß!',
      difficulty: '⭐⭐'
    },
    {
      id: 'number-builder' as const,
      name: 'Zahlen-Baumeister',
      emoji: '🏗️',
      path: '/number-builder',
      color: 'from-lime-400 to-green-500',
      description: 'Baue Zahlen mit Stellenwerten!',
      difficulty: '⭐⭐⭐'
    },
    {
      id: 'neighbor-game' as const,
      name: 'Zoo-Nachbarn',
      emoji: '🐘',
      path: '/neighbor-game',
      color: 'from-green-400 to-teal-500',
      description: 'Finde Vorgänger und Nachfolger!',
      difficulty: '⭐'
    },
    {
      id: 'structured-perception' as const,
      name: 'Blitzblick-Meister',
      emoji: '👁️',
      path: '/structured-perception',
      color: 'from-blue-500 to-purple-500',
      description: 'Trainiere strukturiertes Sehen!',
      difficulty: '⭐⭐⭐⭐'
    },
    {
      id: 'part-whole-house' as const,
      name: 'Zahlenhaus-Baumeister',
      emoji: '🏠',
      path: '/part-whole-house',
      color: 'from-yellow-500 to-orange-500',
      description: 'Entdecke Zahlenzerlegungen!',
      difficulty: '⭐⭐⭐'
    },
  ];

  // Gruppiere Shop-Items nach Typ
  const shopItemsByType = {
    decoration: ZOO_SHOP_ITEMS.filter(item => item.type === 'decoration'),
    food: ZOO_SHOP_ITEMS.filter(item => item.type === 'food'),
    toy: ZOO_SHOP_ITEMS.filter(item => item.type === 'toy'),
    habitat: ZOO_SHOP_ITEMS.filter(item => item.type === 'habitat'),
    utility: ZOO_SHOP_ITEMS.filter(item => item.type === 'utility'),
    special: ZOO_SHOP_ITEMS.filter(item => item.type === 'special'),
    expert: ZOO_SHOP_ITEMS.filter(item => item.type === 'expert'),
    special_house: ZOO_SHOP_ITEMS.filter(item => item.type === 'special_house'),
  };

  // Gehege-Zuordnung (ALLE 20 HABITATE!)
  const habitats = [
    { id: 'savanna', name: 'Savanne', emoji: '🏜️', animals: ['lion', 'giraffe', 'zebra', 'elephant', 'rhino', 'hippo', 'cheetah', 'hyena', 'ostrich', 'leopard'], color: 'from-yellow-400 to-orange-500' },
    { id: 'jungle', name: 'Dschungel', emoji: '🌴', animals: ['monkey', 'tiger', 'gorilla', 'orangutan', 'toucan', 'parrot', 'sloth'], color: 'from-green-500 to-emerald-600' },
    { id: 'arctic', name: 'Arktis', emoji: '❄️', animals: ['penguin', 'polar_bear', 'seal', 'walrus', 'arctic_fox'], color: 'from-cyan-400 to-blue-500' },
    { id: 'bamboo', name: 'Bambuswald', emoji: '🎋', animals: ['panda', 'red_panda', 'koala', 'peacock'], color: 'from-green-400 to-teal-500' },
    { id: 'meadow', name: 'Wiese', emoji: '🌸', animals: ['rabbit', 'fox', 'deer', 'hedgehog', 'owl'], color: 'from-pink-300 to-purple-400' },
    { id: 'desert', name: 'Wüste', emoji: '🏜️', animals: ['camel', 'snake', 'scorpion', 'fennec_fox'], color: 'from-orange-400 to-red-500' },
    { id: 'ocean', name: 'Ozean-Aquarium', emoji: '🌊', animals: ['dolphin', 'shark', 'octopus', 'seahorse', 'turtle', 'jellyfish'], color: 'from-blue-400 to-cyan-600' },
    { id: 'night_house', name: 'Nachthaus', emoji: '🌙', animals: ['bat', 'raccoon', 'firefly'], color: 'from-indigo-400 to-purple-600' },
    { id: 'outback', name: 'Australien-Outback', emoji: '🦘', animals: ['kangaroo', 'wombat', 'platypus'], color: 'from-amber-400 to-orange-600' },
    { id: 'aviary', name: 'Vogelhaus', emoji: '🦅', animals: ['eagle', 'flamingo', 'swan'], color: 'from-sky-400 to-blue-600' },
    { id: 'butterfly_garden', name: 'Schmetterlings-Garten', emoji: '🦋', animals: ['butterfly'], color: 'from-purple-300 to-pink-400' },
    { id: 'monkey_temple', name: 'Affen-Tempel', emoji: '🏯', animals: ['monkey', 'gorilla', 'orangutan'], color: 'from-red-400 to-orange-500' },
    { id: 'crocodile_lagoon', name: 'Krokodil-Lagune', emoji: '🐊', animals: ['crocodile', 'alligator'], color: 'from-green-600 to-teal-700' },
    { id: 'penguin_beach', name: 'Pinguin-Strand', emoji: '🏖️', animals: ['penguin'], color: 'from-blue-300 to-cyan-400' },
    { id: 'bat_cave', name: 'Fledermaus-Höhle', emoji: '🦇', animals: ['bat'], color: 'from-gray-700 to-gray-900' },
    { id: 'safari_park', name: 'Safari-Park', emoji: '🚙', animals: ['lion', 'elephant', 'giraffe', 'zebra', 'rhino'], color: 'from-yellow-500 to-orange-600' },
    { id: 'tropical_dome', name: 'Tropen-Kuppel', emoji: '🌡️', animals: ['parrot', 'toucan', 'sloth'], color: 'from-green-400 to-emerald-600' },
    { id: 'mountain_range', name: 'Berglandschaft', emoji: '⛰️', animals: ['snow_leopard', 'lynx'], color: 'from-gray-400 to-slate-600' },
    { id: 'coral_reef', name: 'Korallenriff', emoji: '🪸', animals: ['clownfish', 'seahorse', 'turtle'], color: 'from-coral-400 to-pink-500' },
    { id: 'petting_farm', name: 'Streichelzoo', emoji: '🐑', animals: ['rabbit', 'hedgehog'], color: 'from-lime-300 to-green-400' },
  ];

  // Filtered animal lists for breeding modal
  const availableFemales = zooAnimals.filter(animal => animal.animalType === selectedBreedingType && animal.age === 'adult' && animal.gender === 'female');
  const availableMales = zooAnimals.filter(animal => animal.animalType === selectedBreedingType && animal.age === 'adult' && animal.gender === 'male');

  return (
    <div className="space-y-6">
      {/* Header: Level & Münzen */}
      <Card className="bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 border-4 border-yellow-500 shadow-xl animate-fade-in-up card-interactive">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={babyLionImage} alt="Baby Löwe" className="w-24 h-24 object-contain animate-gentle-bounce rounded-lg shadow-md" />
              <div>
                <h2 className="text-4xl font-bold text-gray-900 text-high-contrast">Dein Zoo - Level {currentLevel}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={xpProgress} className="w-52 h-4 shadow-sm" />
                  <span className="text-base font-semibold text-gray-700">{xpToNext} XP bis Level {currentLevel + 1}</span>
                </div>
                <p className="text-base font-medium text-gray-600 mt-2">{profile.experience} Gesamt-Erfahrung</p>
                <p className="text-base font-medium text-purple-700 mt-1">🦁 {ownedAnimalTypes.size} Tiere im Zoo</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center bg-white/50 rounded-2xl p-4 shadow-lg">
                <div className="text-5xl font-bold text-yellow-700 flex items-center gap-3 animate-scale-in">
                  <img src={UI_ICONS.coin} alt="Coins" className="w-12 h-12 object-contain animate-gentle-bounce" />
                  {profile.totalCoins}
                </div>
                <p className="text-base font-semibold text-gray-700 mt-1">Zoo-Münzen</p>
                {activeBonuses.coinBonus > 0 && (
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold shadow-md flex items-center gap-1 w-fit mx-auto animate-pulse">
                    <img src={UI_ICONS.coin} alt="Bonus" className="w-4 h-4 object-contain" />
                    +{activeBonuses.coinBonus}% Bonus aktiv!
                  </Badge>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    console.log('Navigating to zoo-economy-guide');
                    setLocation('/zoo-economy-guide');
                  }}
                  className="bg-white border-3 border-blue-600 hover:border-blue-700 text-blue-700 font-bold shadow-md btn-enhanced hover:scale-105 transition-transform"
                >
                  💡 Wie funktioniert's?
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLocation('/zoo-shop')}
                  className="bg-white border-3 border-green-600 hover:border-green-700 text-green-700 font-bold shadow-md btn-enhanced hover:scale-105 transition-transform"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Zum Shop
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎟️ Ticketpreis-Management */}
      {economyStatus && economyStatus.totalAnimals > 0 && (
        <Card className="border-2 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-orange-400" data-testid="card-ticket-pricing">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-purple-600" />
              🎟️ Eintrittspreis-Management
            </CardTitle>
            <CardDescription>
              Passe den Eintrittspreis an und beobachte, wie sich die Besucherzahlen verändern!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Aktueller Preis */}
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-700 mb-2 animate-scale-in flex items-center justify-center gap-2">
                  {Math.round(ticketPrice)} <Coins className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">ZooMünzen pro Besucher</p>
              </div>

              {/* Slider */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Günstig (1 Fr.)</span>
                  <span>Teuer (100 Fr.)</span>
                </div>
                <Slider
                  value={[ticketPrice]}
                  onValueChange={(values) => setTicketPrice(values[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                  data-testid="slider-ticket-price"
                />
                
                {/* Button zum Speichern */}
                <div className="flex gap-3 justify-center pt-2">
                  <Button
                    onClick={() => updateTicketPriceMutation.mutate(ticketPrice)}
                    disabled={updateTicketPriceMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-2 shadow-lg hover-elevate active-elevate-2"
                    data-testid="button-set-ticket-price"
                  >
                    {updateTicketPriceMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {updateTicketPriceMutation.isPending ? 'Speichert...' : `🎟️ Eintrittspreis festlegen: ${Math.round(ticketPrice)} Fr.`}
                  </Button>
                </div>
              </div>

              {/* Live-Vorschau */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Besucher-Prognose */}
                <div className="text-center p-4 bg-white/70 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-700">Besucher/h</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {(() => {
                      const baseVisitors = economyStatus.totalVisitorsPerHour || 100;
                      const adjustedVisitors = calculateElasticDemand(baseVisitors, ticketPrice);
                      return adjustedVisitors.toLocaleString('de-DE');
                    })()}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {ticketPrice < 1.0 ? (
                      <Badge className="bg-green-100 text-green-700">
                        📈 {Math.round(((1.0 / ticketPrice) ** 0.4 - 1) * 100)}% mehr Besucher!
                      </Badge>
                    ) : ticketPrice > 1.0 ? (
                      <Badge className="bg-orange-100 text-orange-700">
                        📉 {Math.round((1 - (1 / (ticketPrice) ** 0.4)) * 100)}% weniger Besucher
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">
                        Standard
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Einnahmen-Prognose */}
                <div className="text-center p-4 bg-white/70 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-700">Einnahmen/h</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {(() => {
                      const baseVisitors = economyStatus.totalVisitorsPerHour || 100;
                      const adjustedVisitors = calculateElasticDemand(baseVisitors, ticketPrice);
                      const income = adjustedVisitors * ticketPrice;
                      return Math.floor(income).toLocaleString('de-DE');
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Münzen pro Tag
                  </p>
                </div>

                {/* Gewinn-Prognose */}
                <div className="text-center p-4 bg-white/70 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-700">Netto-Gewinn/h</h3>
                  </div>
                  <div className={cn(
                    "text-3xl font-bold",
                    (() => {
                      const baseVisitors = economyStatus.totalVisitorsPerHour || 100;
                      const adjustedVisitors = calculateElasticDemand(baseVisitors, ticketPrice);
                      const income = adjustedVisitors * ticketPrice;
                      const profit = income - (economyStatus.maintenanceCostPerHour || 0);
                      return profit >= 0 ? "text-purple-600" : "text-red-600";
                    })()
                  )}>
                    {(() => {
                      const baseVisitors = economyStatus.totalVisitorsPerHour || 100;
                      const adjustedVisitors = calculateElasticDemand(baseVisitors, ticketPrice);
                      const income = adjustedVisitors * ticketPrice;
                      const profit = income - (economyStatus.maintenanceCostPerHour || 0);
                      return profit >= 0 ? `+${Math.floor(profit).toLocaleString('de-DE')}` : Math.floor(profit).toLocaleString('de-DE');
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nach Kosten
                  </p>
                </div>
              </div>

              {/* Strategie-Tipps */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-300">
                <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  💡 Strategie-Tipp
                </h3>
                <p className="text-sm text-purple-700">
                  {ticketPrice < 0.8 ? (
                    "🎯 Sehr günstig! Viele Besucher, aber weniger Gewinn pro Person. Ideal für neue Zoos!"
                  ) : ticketPrice >= 0.8 && ticketPrice <= 1.5 ? (
                    "✅ Ausgewogener Preis! Gute Balance zwischen Besuchern und Einnahmen."
                  ) : ticketPrice > 1.5 && ticketPrice <= 3.0 ? (
                    "💎 Premium-Zoo! Weniger Besucher, aber höhere Einnahmen. Brauchst attraktive Tiere!"
                  ) : (
                    "👑 Exklusiv! Nur die besten Zoos können solche Preise rechtfertigen. Achte auf deine Tiere!"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live-Wirtschaftsstatus */}
      {economyStatus && economyStatus.totalAnimals > 0 && (
        <Card className={cn(
          "border-2",
          (economyStatus.netIncomePerHour * 24) < 0
            ? "bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-red-400"
            : "bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-emerald-400"
        )} data-testid="card-economy-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(economyStatus.netIncomePerHour * 24) < 0 ? (
                <>
                  <TrendingDown className="w-6 h-6 text-red-600" />
                  ⚠️ Zoo im Minus! - Wirtschaftsstatus
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  Live-Wirtschaftsstatus 💰
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 🆕 Warn-Meldung bei Minus */}
            {(economyStatus.netIncomePerHour * 24) < 0 && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
                <h3 className="font-bold text-red-700 mb-2">🚨 Dein Zoo verliert Geld!</h3>
                <p className="text-sm text-red-600 mb-2">
                  Du machst <strong>-{Math.floor(Math.abs(economyStatus.netIncomePerHour * 24)).toLocaleString('de-DE')} Münzen/Tag</strong> Verlust!
                </p>
                <p className="text-xs text-red-600">
                  💡 Tipp: Erhöhe deine Ticketpreise oder reduziere die Anzahl der Tiere.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Einnahmen */}
              <div className="text-center p-4 bg-white/70 rounded-lg border border-emerald-200" data-testid="stat-income">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-700">Einnahmen</h3>
                </div>
                <div className="text-3xl font-bold text-green-600" data-testid="text-income-value">
                  +{Math.floor(economyStatus.passiveIncomePerHour * 24).toLocaleString('de-DE')}
                </div>
                <p className="text-sm text-muted-foreground">Münzen/Tag</p>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-visitors-value">
                  {economyStatus?.totalVisitorsPerHour?.toLocaleString('de-DE') ?? 0} Besucher/h
                </p>
              </div>

              {/* Kosten */}
              <div className="text-center p-4 bg-white/70 rounded-lg border border-orange-200" data-testid="stat-costs">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-700">Kosten</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600" data-testid="text-costs-value">
                  -{Math.floor(economyStatus.maintenanceCostPerHour * 24).toLocaleString('de-DE')}
                </div>
                <p className="text-sm text-muted-foreground">Münzen/Tag</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tier-Unterhalt
                </p>
              </div>

              {/* Netto-Gewinn */}
              <div className="text-center p-4 bg-white/70 rounded-lg border border-blue-200" data-testid="stat-net">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-700">Netto-Gewinn</h3>
                </div>
                <div className={cn(
                  "text-3xl font-bold",
                  (economyStatus.netIncomePerHour * 24) >= 0 ? "text-blue-600" : "text-red-600"
                )} data-testid="text-net-value">
                  {(economyStatus.netIncomePerHour * 24) >= 0 ? '+' : ''}{Math.floor(economyStatus.netIncomePerHour * 24).toLocaleString('de-DE')}
                </div>
                <p className="text-sm text-muted-foreground">Münzen/Tag</p>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-animal-counts">
                  {economyStatus.babyAnimals} Babys, {economyStatus.adultAnimals} Erwachsene
                </p>
              </div>
            </div>

            {/* Nächste Evolution */}
            {economyStatus.nextEvolution && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-300" data-testid="section-next-evolution">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Baby className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-purple-700" data-testid="text-evolution-name">
                        Nächste Evolution: {economyStatus.nextEvolution.name}
                      </h3>
                      <Progress
                        value={(economyStatus.nextEvolution.currentXp / 1000) * 100}
                        className="w-64 h-2 mt-1"
                        data-testid="progress-evolution"
                      />
                      <p className="text-xs text-muted-foreground mt-1" data-testid="text-evolution-xp">
                        {economyStatus.nextEvolution.currentXp.toLocaleString('de-DE')}/1,000 XP ({economyStatus.nextEvolution.remainingXp.toLocaleString('de-DE')} verbleibend)
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold" data-testid="text-evolution-hours">
                        {Math.floor(economyStatus.nextEvolution.hoursUntilEvolution)}h
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">bis Adult</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs für verschiedene Ansichten */}
      <Tabs defaultValue="animals" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="animals" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Tiere
          </TabsTrigger>
          <TabsTrigger value="habitats" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Gehege
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Inventar
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Auszeichnungen
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Spiele
          </TabsTrigger>
        </TabsList>

        {/* Tier-Sammlung */}
        <TabsContent value="animals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Deine Tier-Sammlung
                </CardTitle>
                <Filter className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Filter-Leiste */}
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">🌍 Kontinente:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={continentFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setContinentFilter('all')}
                      data-testid="filter-continent-all"
                    >
                      Alle
                    </Button>
                    {(['afrika', 'amerika', 'asien', 'australien', 'europa'] as Continent[]).map(continent => (
                      <Button
                        key={continent}
                        variant={continentFilter === continent ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setContinentFilter(continent)}
                        data-testid={`filter-continent-${continent}`}
                      >
                        {continent.charAt(0).toUpperCase() + continent.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">🦁 Tier-Gruppen:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={groupFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGroupFilter('all')}
                      data-testid="filter-group-all"
                    >
                      Alle
                    </Button>
                    {(['Affen', 'Raubkatzen', 'Vögel', 'Reptilien', 'Grosstiere', 'Wassertiere'] as AnimalGroup[]).map(group => (
                      <Button
                        key={group}
                        variant={groupFilter === group ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGroupFilter(group)}
                        data-testid={`filter-group-${group}`}
                      >
                        {group}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* ZEIGE ALLE TIERE aus der Datenbank (grau wenn nicht besessen) */}
                {(() => {
                  // WICHTIG: ANIMAL_INFO ist ein Array, nicht ein Object!
                  const allAnimalTypes = ANIMAL_INFO.map(a => a.type) as ZooAnimal[];

                  const visibleAnimals = continentFilter === 'all' && groupFilter === 'all'
                    ? allAnimalTypes
                    : allAnimalTypes.filter(animalType => {
                        const animalInfo = ANIMAL_INFO.find(a => a.type === animalType);
                        if (!animalInfo) return false;

                        const matchesContinent = continentFilter === 'all' || animalInfo.continent === continentFilter;
                        const matchesGroup = groupFilter === 'all' || animalInfo.group === groupFilter;

                        return matchesContinent && matchesGroup;
                      });

                  return visibleAnimals.map((animalType, index) => {
                  // WICHTIG: Finde Animal-Info aus dem Array
                  const animalInfo = ANIMAL_INFO.find(a => a.type === animalType);
                  if (!animalInfo) return null;

                  // Prüfe ob Tier im Besitz ist - verwende zooAnimals als Quelle!
                  const isOwned = ownedAnimalTypes.has(animalType);

                  // Finde Stats für dieses spezifische Tier
                  const stats = animalStats.find((s: any) => s.animalType === animalType);

                  return (
                    <Card
                      key={`${animalType}-${index}`} // Unique key combining type and index
                      className={cn(
                        "relative overflow-hidden border-2 hover:shadow-lg transition-shadow",
                        // Nicht besessen = grau
                        !isOwned && "border-gray-300 bg-gray-100 opacity-50 grayscale",
                        // Besessen aber keine Paarung möglich = blau
                        isOwned && !stats?.canBreed && "border-blue-400 bg-blue-50",
                        // Paarung möglich (mind. 1♀ UND 1♂) = grün
                        isOwned && stats?.canBreed && "border-green-400 bg-green-50"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-6xl mb-2">{animalInfo.emoji}</div>
                          <h3 className="font-bold text-lg">{animalInfo.name}</h3>

                          {/* Anzahl-Anzeige - VERWENDE BACKEND STATS! */}
                          <div className="mt-3 space-y-1 text-sm">
                            {(() => {
                              // WICHTIG: Verwende die bereits korrekt berechneten Stats vom Backend!
                              const babies = stats?.babies ?? 0;
                              const adultFemales = stats?.females ?? 0;
                              const adultMales = stats?.males ?? 0;
                              
                              return (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-600">🐣 Babys:</span>
                                    <Badge variant="secondary">{babies}</Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-pink-600">♀ Weibchen:</span>
                                    <Badge variant="secondary">{adultFemales}</Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-800">♂ Männchen:</span>
                                    <Badge variant="secondary">{adultMales}</Badge>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Breeding & Selling Buttons (only if partner zoo features are active) */}
                          {hasPartnerZoo && stats && (
                            <div className="mt-4 flex flex-col gap-2">
                              {/* Active Breeding Button */}
                              {stats.canBreed && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBreedingType(animalType as ZooAnimal);
                                    setSelectedFemale(null); // Reset selection
                                    setSelectedMale(null);
                                    setShowBreedingModal(true);
                                  }}
                                  className="bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md"
                                >
                                  <Heart className="w-4 h-4 mr-1" /> Gezielt Paaren
                                </Button>
                              )}

                              {/* Sell Animal Button (for surplus adults) */}
                              {(stats.females > 1 || stats.males > 1) && ( // Allow selling if more than one adult of either gender exists
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Find an adult animal to sell (prioritize surplus)
                                    const animalToSell = availableFemales.length > 1 ? availableFemales[availableFemales.length - 1]
                                                         : availableMales.length > 1 ? availableMales[availableMales.length - 1]
                                                         : null;

                                    if (animalToSell) {
                                      sellAnimalMutation.mutate({ animalId: animalToSell.id, animalType: animalType as ZooAnimal });
                                    }
                                  }}
                                  disabled={sellAnimalMutation.isPending}
                                  className="border-orange-400 text-orange-700 hover:bg-orange-50"
                                >
                                  <Coins className="w-4 h-4 mr-1" /> Überschuss verkaufen
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Standard Info */}
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <Badge variant="outline" className="text-xs">
                              {animalInfo.continent}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {animalInfo.group}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gehege-Übersicht */}
        <TabsContent value="habitats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habitats.map((habitat) => {
              // Prüfe ob Habitat gekauft wurde
              const isOwned = profile.ownedShopItems.includes(habitat.id);
              // Zähle Tiere, die in diesem Gehege sein könnten (aus zooAnimals, nicht totalAnimals)
              const animalsInHabitat = habitat.animals.filter(a => zooAnimals.some(animal => animal.animalType === a));

              return (
                <Card key={habitat.id} className={cn(
                  "border-2 transition-all",
                  // Gekauft = Grün
                  isOwned && "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400",
                  // Nicht gekauft = Grau
                  !isOwned && "bg-gray-100 border-gray-300 opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {HABITAT_IMAGES[habitat.id] ? (
                        <img
                          src={HABITAT_IMAGES[habitat.id]}
                          alt={habitat.name}
                          className={cn(
                            "w-16 h-16 object-contain rounded-lg p-2",
                            isOwned ? "bg-white/20" : "bg-gray-300"
                          )}
                        />
                      ) : (
                        <span className="text-5xl">{habitat.emoji}</span>
                      )}
                      <h4 className={cn(
                        "text-lg font-bold",
                        isOwned ? "text-emerald-900" : "text-gray-600"
                      )}>{habitat.name}</h4>
                      {!isOwned && <Badge className="bg-gray-500 text-white ml-auto">Nicht gekauft</Badge>}
                      {isOwned && <Badge className="bg-green-600 text-white ml-auto">✓ Gekauft</Badge>}
                    </div>
                    {isOwned ? (
                      <div className="space-y-2">
                        <p className="text-sm text-emerald-900/80">
                          {animalsInHabitat.length} von {habitat.animals.length} Tieren eingezogen
                        </p>
                        {animalsInHabitat.length > 0 && (
                          <p className="text-sm font-semibold text-emerald-900">
                            {animalsInHabitat.map(animalType => {
                              const animalInfo = ANIMAL_INFO.find(a => a.type === animalType);
                              return animalInfo?.name || animalType;
                            }).join(', ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Noch nicht gebaut - im Shop erhältlich!
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Inventar */}
        <TabsContent value="items" className="space-y-4">
          {Object.entries(shopItemsByType).map(([type, items]) => {
            if (items.length === 0) return null;
            
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {type === 'decoration' && <span className="text-2xl">🌳</span>}
                    {type === 'food' && <span className="text-2xl">🍎</span>}
                    {type === 'toy' && <span className="text-2xl">⚽</span>}
                    {type === 'habitat' && <span className="text-2xl">🏠</span>}
                    {type === 'utility' && <span className="text-2xl">🛠️</span>}
                    {type === 'special' && <span className="text-2xl">✨</span>}
                    {type === 'expert' && <span className="text-2xl">👩‍🔬</span>}
                    {type === 'special_house' && <span className="text-2xl">🏝️</span>}
                    {type === 'decoration' && 'Dekorationen'}
                    {type === 'food' && 'Futter'}
                    {type === 'toy' && 'Spielzeuge'}
                    {type === 'habitat' && 'Gehege'}
                    {type === 'utility' && 'Ausrüstung'}
                    {type === 'special' && 'Spezial-Items'}
                    {type === 'expert' && 'Tier-Experten'}
                    {type === 'special_house' && 'Spezial-Häuser'}
                  </CardTitle>
                  <CardDescription>
                    {items.filter(item => profile.ownedShopItems.includes(item.id)).length} von {items.length} gekauft
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {items.map(item => {
                      const owned = profile.ownedShopItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-3 rounded-lg border-2 text-center transition-all",
                            owned
                              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-400"
                              : "bg-gray-100 border-gray-300 opacity-60"
                          )}
                        >
                          <div className="text-4xl mb-1">{item.emoji}</div>
                          <p className="text-xs font-semibold line-clamp-2">{item.name}</p>
                          {owned ? (
                            <>
                              <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-700">
                                ✓ Gekauft
                              </Badge>
                              {item.effect && (
                                <p className="text-[10px] text-purple-600 font-bold mt-1">
                                  {item.effect.type === 'coin_bonus' && `+${item.effect.value}% 💰`}
                                  {item.effect.type === 'xp_bonus' && `+${item.effect.value}% XP`}
                                  {item.effect.type === 'animal_chance' && `+${item.effect.value}% 🦁`}
                                  {item.effect.type === 'happiness' && `+${item.effect.value}% 😊`}
                                  {item.effect.type === 'visitor_boost' && `+${item.effect.value} 👥`}
                                  {item.effect.type === 'group_bonus' && `+${item.effect.value}% Gruppe`}
                                </p>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.price} 💰
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Badges/Auszeichnungen */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Deine Auszeichnungen ({profile.badges.length}/{Object.keys(ZOO_BADGES).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(ZOO_BADGES).map(([badgeId, badge]) => {
                  const earned = profile.badges.includes(badgeId);
                  return (
                    <div
                      key={badgeId}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        earned
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 hover:scale-105"
                          : "bg-gray-100 border-gray-300 opacity-50"
                      )}
                    >
                      <div className="text-4xl mb-2">{badge.emoji}</div>
                      <p className="text-sm font-bold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                      {earned && (
                        <Badge variant="outline" className="mt-2 text-xs bg-green-100 text-green-700">
                          ⭐ Erreicht!
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spiele-Übersicht */}
        <TabsContent value="games" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">🎮 Alle Spiele direkt starten</h3>
            <p className="text-sm text-muted-foreground">Klicke auf ein Spiel, um direkt loszulegen!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Kategorie 1: Zahlen verstehen */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200" onClick={() => setLocation('/game')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    Zahlenwaage
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">Zahlen</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Finde die größte Zahl! Mit Würfeln, Tieren und Zahlen.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200" onClick={() => setLocation('/number-stairs')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🪜</span>
                    Zahlen-Treppe
                  </CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-800">Zahlen</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Ordne Zahlen von klein nach groß - wie Treppenstufen!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-lime-200" onClick={() => setLocation('/number-builder')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-lime-50 to-green-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🏗️</span>
                    Zahlen-Baumeister
                  </CardTitle>
                  <Badge className="bg-lime-100 text-lime-800">Zahlen</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Baue Zahlen mit Hundertern, Zehnern und Einern!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200" onClick={() => setLocation('/neighbor-game')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-teal-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🐘</span>
                    Zoo-Nachbarn
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">Zahlen</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Finde Vorgänger und Nachfolger - Tiere leben nebeneinander!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200" onClick={() => setLocation('/structured-perception')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">👁️</span>
                    Blitzblick-Meister
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">Zahlen</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Erkenne Mengen ohne zu zählen - strukturiertes Sehen!</p>
              </CardContent>
            </Card>

            {/* Kategorie 2: Clever rechnen */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-200" onClick={() => setLocation('/ten-wins-game')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-green-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    10 gewinnt!
                  </CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-800">Strategien</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Ergänze zur 10 und rette Zoo-Tiere!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-teal-200" onClick={() => setLocation('/decomposition-safari')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🧩</span>
                    Zerlegungs-Safari
                  </CardTitle>
                  <Badge className="bg-teal-100 text-teal-800">Strategien</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Teile Zahlen clever auf - finde alle Möglichkeiten!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-fuchsia-200" onClick={() => setLocation('/doubling-expedition')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-fuchsia-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">👯</span>
                    Verdoppel-Expedition
                  </CardTitle>
                  <Badge className="bg-fuchsia-100 text-fuchsia-800">Strategien</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Entdecke Doppel-Tricks und Fast-Verdopplungen!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200" onClick={() => setLocation('/part-whole-house')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    Zahlenhaus-Baumeister
                  </CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-800">Strategien</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Entdecke alle Zerlegungen einer Zahl - Teil-Ganzes!</p>
              </CardContent>
            </Card>

            {/* Kategorie 3: Rechenmeister */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-amber-200" onClick={() => setLocation('/zoo-adventure')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🦁</span>
                    Zoo-Abenteuer
                  </CardTitle>
                  <Badge className="bg-amber-100 text-amber-800">Meisterschaft</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Besuche Gehege und meistere Rechenaufgaben!</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-rose-200" onClick={() => setLocation('/zoo-pathfinder')}>
              <CardHeader className="pb-3 bg-gradient-to-r from-rose-50 to-red-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">🗺️</span>
                    Zoo-Pfadfinder
                  </CardTitle>
                  <Badge className="bg-rose-100 text-rose-800">Meisterschaft</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-xs text-muted-foreground">Finde den elegantesten Rechenweg durch den Zoo!</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Breeding-System Erklärung */}
        <Card className="mb-6 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-600" />
              🐣 Zucht-System: So bekommst du mehr Tiere!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white/80 rounded p-4">
              <h3 className="font-bold mb-2">📖 So funktioniert's:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">🐣</span>
                  <span><strong>Babys wachsen:</strong> Trainiere/spiele, um XP zu sammeln. Bei 1000 XP wird aus dem Baby ein Weibchen ♀ oder Männchen ♂ (Zufall 50/50)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600">♀</span>
                  <span><strong>Weibchen:</strong> Kosten 1.5 Münzen/Tag. Können mit Männchen Babys bekommen!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-800">♂</span>
                  <span><strong>Männchen:</strong> Kosten 2.0 Münzen/Tag (fressen mehr!). Können mit Weibchen Babys bekommen!</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600" />
                  <span><strong>Züchten:</strong> Wenn du mind. 1♀ + 1♂ einer Art hast, bekommst du alle 24 Stunden automatisch 1 Baby pro Paar!</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-100 rounded p-3 border-2 border-yellow-400">
              <h3 className="font-bold mb-2">💡 Strategie-Tipps:</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Ziehe zuerst Babys groß, um Paare zu bilden</li>
                <li>✅ Mehr Paare = mehr Babys alle 24h!</li>
                <li>✅ Shop-Items können Zucht beschleunigen</li>
                <li>⚠️ Männchen kosten mehr - plane dein Budget!</li>
              </ul>
            </div>

            {hasPartnerZoo && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded p-3 border-2 border-orange-400">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  🆕 Partner-Zoo Vorteile freigeschaltet!
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>✨ <strong>Aktive Zucht:</strong> Wähle gezielt Paare zum Züchten</li>
                  <li>💰 <strong>Verkaufen:</strong> Überschüssige Tiere gegen Münzen handeln</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Breeding Modal */}
        {showBreedingModal && selectedBreedingType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBreedingModal(false)}>
            <Card className="w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                  Aktive Zucht: {ANIMAL_INFO.find(a => a.type === selectedBreedingType)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Wähle ein Weibchen ♀ und ein Männchen ♂ zum Paaren:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Females */}
                    <div>
                      <h3 className="font-semibold mb-2 text-pink-600">♀ Weibchen</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableFemales.map((animal, idx) => (
                            <Button
                              key={animal.id} // Use unique animal ID for key
                              variant={selectedFemale === idx ? 'default' : 'outline'}
                              className="w-full"
                              onClick={() => setSelectedFemale(idx)}
                            >
                              ♀ Weibchen #{idx + 1} ({animal.id.substring(0, 4)})
                            </Button>
                          ))
                        }
                      </div>
                    </div>

                    {/* Males */}
                    <div>
                      <h3 className="font-semibold mb-2 text-blue-800">♂ Männchen</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableMales.map((animal, idx) => (
                            <Button
                              key={animal.id} // Use unique animal ID for key
                              variant={selectedMale === idx ? 'default' : 'outline'}
                              className="w-full"
                              onClick={() => setSelectedMale(idx)}
                            >
                              ♂ Männchen #{idx + 1} ({animal.id.substring(0, 4)})
                            </Button>
                          ))
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => {
                      setShowBreedingModal(false);
                      setSelectedFemale(null);
                      setSelectedMale(null);
                      setSelectedBreedingType(null);
                    }}>
                      Abbrechen
                    </Button>
                    <Button
                      disabled={selectedFemale === null || selectedMale === null || breedingMutation.isPending}
                      onClick={() => {
                        if (selectedFemale !== null && selectedMale !== null) {
                          const selectedFemaleAnimal = availableFemales[selectedFemale];
                          const selectedMaleAnimal = availableMales[selectedMale];

                          if (selectedFemaleAnimal && selectedMaleAnimal) {
                            breedingMutation.mutate({
                              animalType: selectedBreedingType,
                              femaleId: selectedFemaleAnimal.id,
                              maleId: selectedMaleAnimal.id
                            });
                          }
                        }
                      }}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    >
                      {breedingMutation.isPending ? 'Paart...' : '💕 Paaren!'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </Tabs>
    </div>
  );
}