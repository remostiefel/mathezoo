import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Weight, Ruler, Utensils, Home as HomeIcon, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ZooProfile, ANIMAL_EMOJIS, ANIMAL_NAMES, ANIMAL_FACTS } from "@/lib/zoo-game-system";
import { getAnimalImage, UI_ICONS } from "@/lib/animal-images";
import { cn } from "@/lib/utils";

// Vollständige Tier-Informationen für alle 87 Tiere - gruppiert nach Kategorie
const ANIMAL_INFO = [
  // Affen (Primates)
  { type: 'monkey', group: 'Affen', name: 'Affe' },
  { type: 'gorilla', group: 'Affen', name: 'Gorilla' },
  { type: 'orangutan', group: 'Affen', name: 'Orang-Utan' },
  { type: 'gibbon', group: 'Affen', name: 'Gibbon' },
  { type: 'golden_monkey', group: 'Affen', name: 'Goldener Affe' },
  
  // Raubkatzen (Big Cats)
  { type: 'lion', group: 'Raubkatzen', name: 'Löwe' },
  { type: 'tiger', group: 'Raubkatzen', name: 'Tiger' },
  { type: 'leopard', group: 'Raubkatzen', name: 'Leopard' },
  { type: 'cheetah', group: 'Raubkatzen', name: 'Gepard' },
  { type: 'jaguar', group: 'Raubkatzen', name: 'Jaguar' },
  { type: 'panda', group: 'Raubkatzen', name: 'Panda' },
  { type: 'lynx', group: 'Raubkatzen', name: 'Luchs' },
  { type: 'snow_leopard', group: 'Raubkatzen', name: 'Schneeleopard' },
  { type: 'clouded_leopard', group: 'Raubkatzen', name: 'Nebelfleck-Leopard' },
  { type: 'fox', group: 'Raubkatzen', name: 'Fuchs' },
  { type: 'arctic_fox', group: 'Raubkatzen', name: 'Polarfuchs' },
  { type: 'fennec_fox', group: 'Raubkatzen', name: 'Fennek' },
  
  // Vögel (Birds)
  { type: 'eagle', group: 'Vögel', name: 'Adler' },
  { type: 'penguin', group: 'Vögel', name: 'Pinguin' },
  { type: 'flamingo', group: 'Vögel', name: 'Flamingo' },
  { type: 'toucan', group: 'Vögel', name: 'Tukan' },
  { type: 'parrot', group: 'Vögel', name: 'Papagei' },
  { type: 'swan', group: 'Vögel', name: 'Schwan' },
  { type: 'owl', group: 'Vögel', name: 'Eule' },
  { type: 'ostrich', group: 'Vögel', name: 'Strauß' },
  { type: 'peacock', group: 'Vögel', name: 'Pfau' },
  { type: 'pelican', group: 'Vögel', name: 'Pelikan' },
  { type: 'stork', group: 'Vögel', name: 'Storch' },
  { type: 'crane', group: 'Vögel', name: 'Kranich' },
  { type: 'hummingbird', group: 'Vögel', name: 'Kolibri' },
  { type: 'kingfisher', group: 'Vögel', name: 'Eisvogel' },
  { type: 'hornbill', group: 'Vögel', name: 'Nashornvogel' },
  { type: 'macaw', group: 'Vögel', name: 'Ara' },
  { type: 'roadrunner', group: 'Vögel', name: 'Wegekuckuck' },
  { type: 'snow_owl', group: 'Vögel', name: 'Schneeeule' },
  { type: 'kookaburra', group: 'Vögel', name: 'Kookaburra' },
  
  // Reptilien & Amphibien (Reptiles & Amphibians)
  { type: 'snake', group: 'Reptilien', name: 'Schlange' },
  { type: 'crocodile', group: 'Reptilien', name: 'Krokodil' },
  { type: 'alligator', group: 'Reptilien', name: 'Alligator' },
  { type: 'turtle', group: 'Reptilien', name: 'Schildkröte' },
  { type: 'komodo_dragon', group: 'Reptilien', name: 'Komodowaran' },
  { type: 'gecko', group: 'Reptilien', name: 'Gecko' },
  { type: 'poison_dart_frog', group: 'Reptilien', name: 'Pfeilgiftfrosch' },
  { type: 'tree_frog', group: 'Reptilien', name: 'Baumfrosch' },
  { type: 'chameleon', group: 'Reptilien', name: 'Chamäleon' },
  { type: 'iguana', group: 'Reptilien', name: 'Leguan' },
  { type: 'desert_tortoise', group: 'Reptilien', name: 'Wüstenschildkröte' },
  
  // Grosstiere (Large Animals)
  { type: 'elephant', group: 'Grosstiere', name: 'Elefant' },
  { type: 'giraffe', group: 'Grosstiere', name: 'Giraffe' },
  { type: 'zebra', group: 'Grosstiere', name: 'Zebra' },
  { type: 'rhino', group: 'Grosstiere', name: 'Nashorn' },
  { type: 'hippo', group: 'Grosstiere', name: 'Flusspferd' },
  { type: 'buffalo', group: 'Grosstiere', name: 'Büffel' },
  { type: 'wildebeest', group: 'Grosstiere', name: 'Gnu' },
  { type: 'antelope', group: 'Grosstiere', name: 'Antilope' },
  { type: 'gazelle', group: 'Grosstiere', name: 'Gazelle' },
  { type: 'camel', group: 'Grosstiere', name: 'Kamel' },
  { type: 'polar_bear', group: 'Grosstiere', name: 'Eisbär' },
  { type: 'rabbit', group: 'Grosstiere', name: 'Hase' },
  { type: 'deer', group: 'Grosstiere', name: 'Hirsch' },
  { type: 'moose', group: 'Grosstiere', name: 'Elch' },
  { type: 'reindeer', group: 'Grosstiere', name: 'Rentier' },
  { type: 'kangaroo', group: 'Grosstiere', name: 'Känguru' },
  { type: 'wombat', group: 'Grosstiere', name: 'Wombat' },
  { type: 'koala', group: 'Grosstiere', name: 'Koala' },
  { type: 'platypus', group: 'Grosstiere', name: 'Schnabeltier' },
  { type: 'hedgehog', group: 'Grosstiere', name: 'Igel' },
  { type: 'badger', group: 'Grosstiere', name: 'Dachs' },
  { type: 'beaver', group: 'Grosstiere', name: 'Biber' },
  { type: 'wild_boar', group: 'Grosstiere', name: 'Wildschwein' },
  { type: 'squirrel', group: 'Grosstiere', name: 'Eichhörnchen' },
  { type: 'meerkat', group: 'Grosstiere', name: 'Erdmännchen' },
  { type: 'hyena', group: 'Grosstiere', name: 'Hyäne' },
  { type: 'sloth', group: 'Grosstiere', name: 'Faultier' },
  { type: 'tapir', group: 'Grosstiere', name: 'Tapir' },
  { type: 'tasmanian_devil', group: 'Grosstiere', name: 'Tasmanischer Teufel' },
  { type: 'echidna', group: 'Grosstiere', name: 'Ameisenigel' },
  { type: 'wallaby', group: 'Grosstiere', name: 'Wallaby' },
  { type: 'arctic_hare', group: 'Grosstiere', name: 'Polarschneehuhn' },
  
  // Wassertiere (Sea Animals)
  { type: 'dolphin', group: 'Wassertiere', name: 'Delfin' },
  { type: 'shark', group: 'Wassertiere', name: 'Hai' },
  { type: 'octopus', group: 'Wassertiere', name: 'Oktopus' },
  { type: 'seahorse', group: 'Wassertiere', name: 'Seepferdchen' },
  { type: 'jellyfish', group: 'Wassertiere', name: 'Qualle' },
  { type: 'seal', group: 'Wassertiere', name: 'Seehund' },
  { type: 'walrus', group: 'Wassertiere', name: 'Walross' },
  { type: 'orca', group: 'Wassertiere', name: 'Orca' },
  { type: 'manta_ray', group: 'Wassertiere', name: 'Mantarochen' },
  { type: 'clownfish', group: 'Wassertiere', name: 'Clownfisch' },
  { type: 'sea_otter', group: 'Wassertiere', name: 'Seeotter' },
  { type: 'manatee', group: 'Wassertiere', name: 'Seekuh' },
  { type: 'starfish', group: 'Wassertiere', name: 'Seestern' },
  { type: 'blue_whale', group: 'Wassertiere', name: 'Blauwal' },
  { type: 'hammerhead_shark', group: 'Wassertiere', name: 'Hammerhai' },
  { type: 'pufferfish', group: 'Wassertiere', name: 'Kugelfisch' },
  { type: 'narwhal', group: 'Wassertiere', name: 'Narwal' },
  { type: 'beluga', group: 'Wassertiere', name: 'Beluga' },
  
  // Nachthaus & Kleinere Tiere
  { type: 'bat', group: 'Affen', name: 'Fledermaus' },
  { type: 'raccoon', group: 'Affen', name: 'Waschbär' },
  { type: 'firefly', group: 'Affen', name: 'Glühwürmchen' },
  { type: 'sugar_glider', group: 'Affen', name: 'Zucker-Segelflugbeutler' },
  { type: 'kiwi', group: 'Vögel', name: 'Kiwi' },
  { type: 'tarsier', group: 'Affen', name: 'Koboldmaki' },
  { type: 'aye_aye', group: 'Affen', name: 'Fingertier' },
  { type: 'red_panda', group: 'Raubkatzen', name: 'Roter Panda' },
  
  // Insekten
  { type: 'butterfly', group: 'Reptilien', name: 'Schmetterling' },
  { type: 'ladybug', group: 'Reptilien', name: 'Marienkäfer' },
  { type: 'dragonfly', group: 'Reptilien', name: 'Libelle' },
  { type: 'praying_mantis', group: 'Reptilien', name: 'Gottesanbeterin' },
  { type: 'scorpion', group: 'Reptilien', name: 'Skorpion' },
  { type: 'vulture', group: 'Vögel', name: 'Geier' },
];


export default function AnimalEncyclopedia() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Extract userId from URL query params using useLocation
  const targetUserId = location.includes('?userId=') 
    ? new URLSearchParams(location.split('?')[1]).get('userId')
    : null;
  
  // Use provided userId or fall back to current user
  const userId = targetUserId || user?.id;

  const { data: zooProfile } = useQuery<ZooProfile>({
    queryKey: ['/api/zoo/profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/zoo/profile/${userId}`);
      return await response.json();
    },
    enabled: !!userId,
  });

  // Hole die echten Tier-Instanzen mit Age-Informationen
  const { data: zooAnimalsData } = useQuery({
    queryKey: ['/api/zoo/animals', userId],
    queryFn: async () => {
      if (!userId) return { animals: [] };
      const response = await apiRequest('GET', `/api/zoo/animals/${userId}`);
      return await response.json();
    },
    enabled: !!userId,
  });

  const animalGroups = [
    { id: 'all', name: 'Alle Tiere', emoji: '🌍' },
    { id: 'Affen', name: 'Affen', emoji: '🐵' },
    { id: 'Raubkatzen', name: 'Raubkatzen', emoji: '🦁' },
    { id: 'Vögel', name: 'Vögel', emoji: '🦅' },
    { id: 'Reptilien', name: 'Reptilien', emoji: '🐍' },
    { id: 'Grosstiere', name: 'Grosstiere', emoji: '🐘' },
    { id: 'Wassertiere', name: 'Wassertiere', emoji: '🐬' },
  ];

  const allAnimals = Object.keys(ANIMAL_EMOJIS);

  const filteredAnimals = allAnimals.filter(animal => {
    const matchesSearch = ANIMAL_NAMES[animal as keyof typeof ANIMAL_NAMES]
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (selectedGroup === 'all') return matchesSearch;

    const animalInfo = ANIMAL_INFO.find(info => info.type === animal);
    return matchesSearch && animalInfo?.group === selectedGroup;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/zoo-overview')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Zoo
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tier-Lexikon
          </h1>
          <p className="text-lg text-muted-foreground">
            Entdecke spannende Fakten über alle Zoo-Tiere!
          </p>
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-4xl font-bold text-green-600">
                  {zooAnimalsData?.animals?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Gesammelt</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">
                  {Object.keys(ANIMAL_EMOJIS).length}
                </div>
                <div className="text-sm text-muted-foreground">Verfügbare Arten</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">
                  {Math.round((zooAnimalsData?.animals?.length || 0) / Object.keys(ANIMAL_EMOJIS).length * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Fortschritt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Suche nach Tieren..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>

            <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
              <TabsList className="grid grid-cols-7 w-full">
                {animalGroups.map(group => (
                  <TabsTrigger key={group.id} value={group.id} className="text-xs">
                    <div className="flex flex-col items-center">
                      <span>{group.emoji}</span>
                      <span className="text-[10px] mt-1">{group.name}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Animal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map((animal, idx) => {
            // Prüfe ob mindestens ein Tier dieser Art gesammelt wurde (Baby oder Adult)
            const animalsOfThisType = zooAnimalsData?.animals?.filter((a: any) => a.animalType === animal) || [];
            const collected = animalsOfThisType.length > 0;
            const name = ANIMAL_NAMES[animal as keyof typeof ANIMAL_NAMES];
            const facts = ANIMAL_FACTS[animal as keyof typeof ANIMAL_FACTS];

            // Generate consistent color based on animal type for variety
            const colorIndex = animal.charCodeAt(0) % 6;
            const colorClasses = [
              "border-2 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100",
              "border-2 border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100",
              "border-2 border-green-400 bg-gradient-to-br from-green-100 to-emerald-100",
              "border-2 border-orange-400 bg-gradient-to-br from-orange-100 to-amber-100",
              "border-2 border-rose-400 bg-gradient-to-br from-rose-100 to-pink-100",
              "border-2 border-teal-400 bg-gradient-to-br from-teal-100 to-cyan-100",
            ];

            return (
              <Card
                key={`animal-${animal}-${idx}`}
                className={cn(
                  "transition-all hover:shadow-xl",
                  collected 
                    ? colorClasses[colorIndex]
                    : "opacity-40 grayscale"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAnimalImage(animal as any, 'adult')}
                        alt={name}
                        className={cn(
                          "w-20 h-20 object-contain rounded-lg",
                          !collected && "opacity-50 grayscale"
                        )}
                      />
                      <div>
                        <CardTitle className="text-xl">{name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {ANIMAL_INFO.find(info => info.type === animal)?.group || 'Unbekannt'}
                        </Badge>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {collected && animalsOfThisType.length > 0 && animalsOfThisType[0]?.personality?.adjectives?.slice(0, 2).map((adj, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {adj}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {collected && (
                      <Badge className="bg-green-500">
                        ✓ Gesammelt
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {facts && (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <Weight className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Gewicht</div>
                            <div className="font-bold">{facts.weight}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <Ruler className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Größe</div>
                            <div className="font-bold">{facts.size}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <Utensils className="w-4 h-4 text-orange-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Nahrung</div>
                            <div className="font-bold text-xs">{facts.diet}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Besonders</div>
                            <div className="font-bold text-xs">{facts.specialTrait}</div>
                          </div>
                        </div>
                      </div>

                      {collected && animalsOfThisType.length > 0 && animalsOfThisType[0]?.personality?.essence && (
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-purple-700 mb-1">Wesensart</div>
                              <p className="text-xs text-gray-700">{animalsOfThisType[0].personality.essence}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-blue-700 mb-1">Wusstest du?</div>
                            <p className="text-xs text-gray-700">{facts.funFact}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!collected && (
                    <Badge variant="outline" className="w-full justify-center text-xs">
                      🔒 Noch nicht gesammelt - spiele mehr, um dieses Tier zu retten!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAnimals.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">Keine Tiere gefunden</h3>
            <p className="text-muted-foreground">
              Versuche einen anderen Suchbegriff oder Filter!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}