import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Users, TrendingUp, TrendingDown, Sparkles, Clock } from 'lucide-react';
import type { OfflineRewardsSummary } from '@/lib/zoo-economy-engine';
import { getAnimalImage, UI_ICONS } from '@/lib/animal-images';
import { ANIMALS_DATABASE } from '@/lib/zoo-game-system';

interface WelcomeBackModalProps {
  open: boolean;
  rewards: OfflineRewardsSummary | null;
  onClose: () => void;
}

export function WelcomeBackModal({ open, rewards, onClose }: WelcomeBackModalProps) {
  if (!rewards) return null;

  // Nur anzeigen wenn mindestens 2h weg UND mindestens 50 Münzen verdient
  const shouldShow = rewards.offlineHours >= 2 && rewards.netIncome >= 50;
  if (!shouldShow) {
    // Automatisch schließen wenn nicht genug Zeit/Münzen
    if (open) {
      setTimeout(() => onClose(), 100);
    }
    return null;
  }

  const hasEvolutions = rewards.evolvedAnimals.length > 0;
  const isProfitable = rewards.netIncome > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="modal-welcome-back"
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            Willkommen zurück!
          </DialogTitle>
          <DialogDescription className="text-center">
            Hier ist eine Zusammenfassung deiner Offline-Einkünfte und Boni
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-2">
          {/* Zeit weg */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Du warst weg für</p>
                <p className="text-2xl font-bold" data-testid="text-offline-duration">
                  {rewards.offlineHours}h {rewards.offlineMinutes}min
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wirtschafts-Zusammenfassung */}
          <div className="grid grid-cols-2 gap-3">
            {/* Besucher */}
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-muted-foreground">Besucher</span>
                </div>
                <p className="text-2xl font-bold" data-testid="text-total-visitors">
                  {rewards.totalVisitors.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Einnahmen */}
            <Card className="bg-green-50 dark:bg-green-950 hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-muted-foreground">Einnahmen</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-1" data-testid="text-gross-income">
                  <img src={UI_ICONS.coin} alt="Coins" className="w-5 h-5" />
                  {rewards.grossIncome.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Kosten */}
            <Card className="bg-orange-50 dark:bg-orange-950 hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-muted-foreground">Kosten</span>
                </div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1" data-testid="text-total-costs">
                  <img src={UI_ICONS.coin} alt="Coins" className="w-5 h-5" />
                  {rewards.totalCosts.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Netto-Gewinn */}
            <Card className={`${isProfitable ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900' : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900'} border-2 ${isProfitable ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'} hover-elevate`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className={`w-5 h-5 ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  <span className="text-sm font-semibold">Gewinn</span>
                </div>
                <p className={`text-3xl font-bold flex items-center gap-1 ${isProfitable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`} data-testid="text-net-income">
                  <img src={UI_ICONS.coin} alt="Coins" className="w-6 h-6" />
                  {isProfitable ? '+' : ''}{rewards.netIncome.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tier-Entwicklungen */}
          {hasEvolutions && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold">
                    {rewards.evolvedAnimals.length} {rewards.evolvedAnimals.length === 1 ? 'Tier ist' : 'Tiere sind'} erwachsen geworden!
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {rewards.evolvedAnimals.map((animal, index) => {
                    const animalType = animal.animalType as any;
                    const adultImage = getAnimalImage(animalType, 'adult');
                    
                    return (
                      <Card key={index} className="hover-elevate" data-testid={`card-evolved-${animal.animalType}`}>
                        <CardContent className="p-3 flex items-center gap-2">
                          <img 
                            src={adultImage} 
                            alt={animal.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold">{animal.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              Baby → Erwachsen
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* XP-Gewinn */}
          {rewards.totalXpGained > 0 && (
            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={UI_ICONS.xp} alt="XP" className="w-6 h-6" />
                  <span className="font-semibold">Baby-Tiere haben XP gesammelt</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1" data-testid="text-total-xp-gained">
                  +{rewards.totalXpGained} XP
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Boni (falls vorhanden) */}
          {(rewards.appliedBonuses.visitorBoost > 0 || 
            rewards.appliedBonuses.costReduction > 0 || 
            rewards.appliedBonuses.incomeMultiplier > 1) && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  ✨ Aktive Boni
                </h4>
                <div className="flex flex-wrap gap-2">
                  {rewards.appliedBonuses.visitorBoost > 0 && (
                    <Badge variant="secondary">
                      +{Math.round(rewards.appliedBonuses.visitorBoost * 100)}% Besucher
                    </Badge>
                  )}
                  {rewards.appliedBonuses.costReduction > 0 && (
                    <Badge variant="secondary">
                      -{Math.round(rewards.appliedBonuses.costReduction * 100)}% Kosten
                    </Badge>
                  )}
                  {rewards.appliedBonuses.incomeMultiplier > 1 && (
                    <Badge variant="secondary">
                      ·{rewards.appliedBonuses.incomeMultiplier} Einnahmen
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schließen Button */}
          <Button 
            onClick={onClose} 
            size="lg" 
            className="w-full"
            data-testid="button-close-welcome-back"
          >
            Weiter zum Zoo! 🎉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
