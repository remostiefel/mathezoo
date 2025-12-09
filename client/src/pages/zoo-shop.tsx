import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Coins, ShoppingCart, Check, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ZOO_SHOP_ITEMS, ZooShopItem, ZooProfile } from "@/lib/zoo-game-system";
import { getShopItemImage, HABITAT_IMAGES, UI_ICONS, BABY_ANIMAL_IMAGES } from "@/lib/animal-images";
import { cn } from "@/lib/utils";
import { AppNavigation } from "@/components/ui/app-navigation";

export default function ZooShop() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'decoration' | 'food' | 'toy' | 'habitat' | 'expert' | 'special_house'>('decoration');

  // Fetch zoo profile - mit erzwungenem Re-Render
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: zooProfile, isLoading } = useQuery<ZooProfile>({
    queryKey: ['/api/zoo/profile', user?.id, refreshKey],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/zoo/profile/${user?.id}`);
      return await response.json();
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('POST', '/api/zoo/purchase', {
        itemId,
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: async () => {
      // Invalidate all zoo profile queries with the correct key pattern
      await queryClient.invalidateQueries({
        queryKey: ['/api/zoo/profile', user?.id, refreshKey],
        exact: true
      });

      // Also invalidate without refreshKey to catch all variations
      await queryClient.invalidateQueries({
        queryKey: ['/api/zoo/profile', user?.id],
        exact: false
      });

      // Force refetch by incrementing refresh key
      setRefreshKey(prev => prev + 1);

      toast({
        title: "Gekauft! 🎉",
        description: "Das Item wurde deinem Zoo hinzugefügt!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Kauf fehlgeschlagen",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (item: ZooShopItem) => {
    if (!zooProfile) return;

    if (zooProfile.ownedShopItems.includes(item.id)) {
      toast({
        title: "Bereits gekauft",
        description: "Du besitzt dieses Item bereits!",
        variant: "destructive",
      });
      return;
    }

    if (zooProfile.totalCoins < item.price) {
      toast({
        title: "Nicht genug Münzen",
        description: `Du brauchst ${item.price - zooProfile.totalCoins} Münzen mehr!`,
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate(item.id);
  };

  if (isLoading || !zooProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏪</div>
          <p className="text-lg">Lade Shop...</p>
        </div>
      </div>
    );
  }

  const itemsByCategory = {
    decoration: ZOO_SHOP_ITEMS.filter(item => item.type === 'decoration'),
    food: ZOO_SHOP_ITEMS.filter(item => item.type === 'food'),
    toy: ZOO_SHOP_ITEMS.filter(item => item.type === 'toy'),
    habitat: ZOO_SHOP_ITEMS.filter(item => item.type === 'habitat'),
    expert: ZOO_SHOP_ITEMS.filter(item => item.type === 'expert'),
    special_house: ZOO_SHOP_ITEMS.filter(item => item.type === 'special_house'),
  };

  const categoryInfo = {
    decoration: { emoji: '🌳', name: 'Dekorationen', color: 'from-green-400 to-emerald-500' },
    food: { emoji: '🍎', name: 'Futter', color: 'from-red-400 to-orange-500' },
    toy: { emoji: '⚽', name: 'Spielzeuge', color: 'from-blue-400 to-purple-500' },
    habitat: { emoji: '🏠', name: 'Gehege', color: 'from-yellow-400 to-amber-500' },
    expert: { emoji: '👩‍🔬', name: 'Tier-Experten', color: 'from-purple-400 to-pink-500' },
    special_house: { emoji: '🏝️', name: 'Spezial-Häuser', color: 'from-cyan-400 to-blue-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <AppNavigation />

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
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

            <Card key={`coins-${refreshKey}-${zooProfile?.totalCoins}`} className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400">
              <CardContent className="p-4 flex items-center gap-3">
                <img 
                  src={UI_ICONS.coin} 
                  alt="Coins" 
                  className="w-12 h-12 object-contain" 
                  style={{
                    filter: 'brightness(1.2) contrast(1.1) saturate(1.4) hue-rotate(-10deg) drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))',
                  }}
                />
                <div>
                  <div className="text-2xl font-bold text-yellow-700">{zooProfile.totalCoins}</div>
                  <div className="text-xs text-yellow-600">Zoo-Münzen</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Title */}
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zoo-Shop
            </h1>
            <p className="text-lg text-muted-foreground">
              Kaufe coole Items für deinen Zoo!
            </p>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-5xl mx-auto h-auto md:h-24 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-3 rounded-2xl border-2 border-purple-300 shadow-lg gap-2">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 md:gap-2 rounded-xl transition-all duration-300 font-semibold py-2 md:py-0",
                    "data-[state=active]:bg-gradient-to-br data-[state=active]:shadow-xl data-[state=active]:scale-105",
                    "data-[state=inactive]:hover:scale-102 data-[state=inactive]:hover:bg-white/50",
                    key === 'decoration' && "data-[state=active]:from-green-400 data-[state=active]:to-emerald-500 data-[state=active]:text-white",
                    key === 'food' && "data-[state=active]:from-red-400 data-[state=active]:to-orange-500 data-[state=active]:text-white",
                    key === 'toy' && "data-[state=active]:from-blue-400 data-[state=active]:to-purple-500 data-[state=active]:text-white",
                    key === 'habitat' && "data-[state=active]:from-yellow-400 data-[state=active]:to-amber-500 data-[state=active]:text-white",
                    key === 'expert' && "data-[state=active]:from-purple-400 data-[state=active]:to-pink-500 data-[state=active]:text-white",
                    key === 'special_house' && "data-[state=active]:from-cyan-400 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  )}
                  data-testid={`tab-category-${key}`}
                >
                  <span className="text-2xl md:text-3xl">{info.emoji}</span>
                  <span className="text-xs md:text-sm font-bold text-center">{info.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(itemsByCategory).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => {
                    const owned = zooProfile.ownedShopItems.includes(item.id);
                    const canAfford = zooProfile.totalCoins >= item.price;
                    const categoryConfig = categoryInfo[category as keyof typeof categoryInfo];

                    return (
                      <Card
                        key={item.id}
                        className={cn(
                          "relative overflow-hidden transition-all duration-300",
                          owned
                            ? "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400"
                            : canAfford
                              ? "hover:shadow-xl hover:scale-105 cursor-pointer"
                              : "opacity-60 grayscale"
                        )}
                      >
                        {owned && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                            <Check className="w-4 h-4" />
                          </div>
                        )}

                        <CardHeader className={cn(
                          "bg-gradient-to-r",
                          categoryConfig.color,
                          "text-white relative overflow-hidden"
                        )}>
                          {/* Background Image für Habitate */}
                          {item.type === 'habitat' && HABITAT_IMAGES[item.id] && (
                            <div className="absolute inset-0 opacity-20">
                              <img
                                src={HABITAT_IMAGES[item.id]}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between relative z-10">
                            {getShopItemImage(item.id) ? (
                              <img
                                src={getShopItemImage(item.id)!}
                                alt={item.name}
                                className="w-20 h-20 object-contain rounded-lg bg-white/20 p-2 shadow-lg"
                              />
                            ) : (
                              <div className="text-5xl bg-white/20 p-2 rounded-lg">{item.emoji}</div>
                            )}
                            <Badge variant="secondary" className="bg-white/90 text-gray-800">
                              <img 
                                src={UI_ICONS.coin} 
                                alt="Coins" 
                                className="w-4 h-4 mr-1 inline" 
                                style={{
                                  filter: 'brightness(1.2) contrast(1.1) saturate(1.4) hue-rotate(-10deg) drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))',
                                }}
                              />
                              {item.price}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                            <p className="text-base text-muted-foreground mb-3">{item.description}</p>

                            {/* Effekt-Anzeige */}
                            {item.effect && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                                <p className="text-sm font-bold text-purple-700 flex items-center gap-2">
                                  <span className="text-lg">✨</span>
                                  {item.effect.description}
                                </p>
                              </div>
                            )}

                            {/* Level-Anforderung */}
                            {item.unlockLevel && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Ab Level {item.unlockLevel}
                              </Badge>
                            )}

                            {/* Habitat-Anforderung */}
                            {item.requiresHabitat && (
                              <Badge variant="outline" className="mt-2 text-xs bg-yellow-100">
                                Braucht: {item.requiresHabitat}
                              </Badge>
                            )}
                          </div>

                          {owned ? (
                            <Button disabled className="w-full bg-green-500">
                              <Check className="w-4 h-4 mr-2" />
                              Im Besitz
                            </Button>
                          ) : canAfford ? (
                            <Button
                              onClick={() => handlePurchase(item)}
                              disabled={purchaseMutation.isPending}
                              className={cn(
                                "w-full bg-gradient-to-r",
                                categoryConfig.color
                              )}
                            >
                              <span className="font-bold text-lg">{item.price}</span>
                              <img 
                                src={UI_ICONS.coin} 
                                alt="Münzen" 
                                className="w-7 h-7 ml-1 inline" 
                                style={{
                                  filter: 'brightness(1.2) contrast(1.1) saturate(1.4) hue-rotate(-10deg) drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
                                }}
                              />
                            </Button>
                          ) : (
                            <Button disabled className="w-full">
                              <Lock className="w-4 h-4 mr-2" />
                              Zu teuer
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Aktive Boni Card */}
          {zooProfile.ownedShopItems.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎁</div>
                  <div className="space-y-3 w-full">
                    <h3 className="font-bold text-lg">Deine aktiven Boni:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(() => {
                        const boni: Record<string, number> = {
                          coin_bonus: 0,
                          xp_bonus: 0,
                          animal_chance: 0,
                          happiness: 0,
                          visitor_boost: 0,
                          group_bonus: 0
                        };

                        zooProfile.ownedShopItems.forEach(itemId => {
                          const item = ZOO_SHOP_ITEMS.find(i => i.id === itemId);
                          if (item?.effect && (item.effect.type as string) in boni) {
                            boni[item.effect.type] += item.effect.value;
                          }
                        });

                        return (
                          <>
                            {boni.coin_bonus > 0 && (
                              <Badge className="bg-yellow-500 text-white text-sm py-2">
                                💰 +{boni.coin_bonus}% Münzen
                              </Badge>
                            )}
                            {boni.xp_bonus > 0 && (
                              <Badge className="bg-blue-500 text-white text-sm py-2">
                                ⭐ +{boni.xp_bonus}% XP
                              </Badge>
                            )}
                            {boni.animal_chance > 0 && (
                              <Badge className="bg-green-500 text-white text-sm py-2">
                                🦁 +{boni.animal_chance}% Tier-Chance
                              </Badge>
                            )}
                            {boni.happiness > 0 && (
                              <Badge className="bg-pink-500 text-white text-sm py-2">
                                😊 +{boni.happiness}% Glück
                              </Badge>
                            )}
                            {boni.visitor_boost > 0 && (
                              <Badge className="bg-purple-500 text-white text-sm py-2">
                                👥 +{boni.visitor_boost} Besucher/Tag
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">So bekommst du Münzen:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>🎮 Spiele die Zoo-Spiele und sammle Münzen für richtige Antworten</li>
                    <li>📈 Erreiche neue Levels im Training (+50 Münzen pro Level!)</li>
                    <li>💰 Sammle alle Tiere für Bonus-Münzen (10 pro neuem Tier!)</li>
                    <li>🏆 Verdiene Badges für Extra-Belohnungen</li>
                    <li>✨ Kaufe Items mit Münz-Bonus für noch mehr Einnahmen!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}