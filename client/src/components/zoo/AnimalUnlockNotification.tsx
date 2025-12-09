
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { ANIMAL_NAMES, ANIMAL_EMOJIS, type ZooAnimal } from "@/lib/zoo-game-system";

interface AnimalUnlockNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unlockedAnimals: ZooAnimal[];
  onContinue: () => void;
}

export function AnimalUnlockNotification({
  open,
  onOpenChange,
  unlockedAnimals,
  onContinue,
}: AnimalUnlockNotificationProps) {
  useEffect(() => {
    if (open && unlockedAnimals.length > 0) {
      // Confetti effect
      const colors = ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32', '#FF1493'];
      const confettiCount = 150;
      const confettiElements: HTMLDivElement[] = [];

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '12px';
        confetti.style.height = '12px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        document.body.appendChild(confetti);
        confettiElements.push(confetti);

        const duration = 3000 + Math.random() * 2000;
        const endLeft = parseFloat(confetti.style.left) + (Math.random() - 0.5) * 100;

        confetti.animate([
          { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${endLeft}px, ${window.innerHeight + 20}px) rotate(${720 + Math.random() * 360}deg)`, opacity: 0 }
        ], {
          duration: duration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
      }

      const cleanup = setTimeout(() => {
        confettiElements.forEach(el => el.remove());
      }, 6000);

      return () => {
        clearTimeout(cleanup);
        confettiElements.forEach(el => el.remove());
      };
    }
  }, [open, unlockedAnimals]);

  if (unlockedAnimals.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-animal-unlock">
        <DialogHeader className="space-y-4 pb-4">
          <div className="mx-auto relative">
            <div className="relative flex items-center justify-center w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full border-4 border-amber-400 animate-pulse">
              <span className="text-5xl">🎉</span>
            </div>
          </div>

          <DialogTitle className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-foreground bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              {unlockedAnimals.length === 1 ? 'Neues Tier!' : 'Neue Tiere!'}
            </h2>
            <p className="text-lg font-semibold text-foreground">
              {unlockedAnimals.length === 1 
                ? 'Ein neues Tier ist in deinen Zoo eingezogen!' 
                : `${unlockedAnimals.length} neue Tiere sind in deinen Zoo eingezogen!`}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Animal Display */}
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto p-2">
            {unlockedAnimals.map((animal, index) => (
              <Card 
                key={animal}
                className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-2 border-amber-300 shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="text-7xl" style={{ animationDelay: `${index * 0.2}s` }}>
                        {ANIMAL_EMOJIS[animal]}
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">
                        {ANIMAL_NAMES[animal]}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Als Baby in den Zoo gekommen - füttere es und lass es wachsen!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Motivational Message */}
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400">
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-gray-800">
                🌟 Super gemacht! Spiele weiter und sammle noch mehr Tiere! 🦁🐘🦒
              </p>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="w-full h-14 text-xl gap-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600"
            size="lg"
            data-testid="button-animal-unlock-continue"
          >
            Weiter spielen!
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
