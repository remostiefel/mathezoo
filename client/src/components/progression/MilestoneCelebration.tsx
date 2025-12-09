import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sparkles, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { ANIMAL_NAMES, ANIMAL_EMOJIS, type ZooAnimal } from "@/lib/zoo-game-system";

interface MilestoneCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: {
    title: string;
    icon: string;
    stageTrigger: number;
    motivationMessage?: string;
  };
  stats: {
    successRate: number;
    averageTime: number;
    tasksCompleted: number;
  };
  newAnimals?: ZooAnimal[];
  onContinue: () => void;
}

export function MilestoneCelebration({
  open,
  onOpenChange,
  milestone,
  stats,
  newAnimals = [],
  onContinue,
}: MilestoneCelebrationProps) {
  console.log('MilestoneCelebration rendered:', { open, milestone, stats });

  useEffect(() => {
    if (open) {
      // Create confetti effect
      const colors = ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32', '#FF1493'];
      const confettiCount = 100;
      const confettiElements: HTMLDivElement[] = [];

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '50%';
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

      // Clean up confetti after animation
      const cleanup = setTimeout(() => {
        confettiElements.forEach(el => el.remove());
      }, 5000);

      return () => {
        clearTimeout(cleanup);
        confettiElements.forEach(el => el.remove());
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="dialog-milestone-celebration"
      >
        <DialogHeader className="space-y-4 pb-4">
          <div className="mx-auto relative">
            {/* Animated animal parade */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-2 animate-pulse text-4xl opacity-30">
                <span>🦁</span>
                <span>🐘</span>
                <span>🦒</span>
              </div>
            </div>

            {/* Trophy icon with zoo theme */}
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full border-4 border-amber-400">
              <span className="text-4xl">🎪</span>
            </div>
          </div>

          <DialogTitle className="text-center space-y-2">
            <div className="text-5xl animate-bounce" data-testid="text-milestone-icon">
              {milestone.icon}
            </div>
            <h2 className="text-4xl font-bold text-foreground bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
            {milestone.title}
          </h2>
            <p className="text-sm font-semibold text-foreground">
              Ein neues Tier wartet auf dich im Zoo! 🎉
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Congratulations message */}
          <Card className="bg-achievement/5 border-achievement/20">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-foreground font-semibold" data-testid="text-milestone-message">
                Level {milestone.stageTrigger} geschafft!
              </p>
              {milestone.motivationMessage && (
                <div className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 rounded-lg shadow-md">
                  <p className="text-xl font-extrabold text-amber-900 drop-shadow-sm" data-testid="text-motivation-message">
                    {milestone.motivationMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Animals Unlocked */}
          {newAnimals.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
              <CardContent className="pt-6 pb-4">
                <h3 className="text-center text-lg font-bold text-green-700 mb-4">
                  🎉 {newAnimals.length === 1 ? 'Neues Tier!' : 'Neue Tiere!'}
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {newAnimals.map((animal) => (
                    <div key={animal} className="text-center">
                      <div className="text-5xl animate-bounce mb-2">
                        {ANIMAL_EMOJIS[animal]}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {ANIMAL_NAMES[animal]}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Animals Collected Display */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl">🦁</span>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-700" data-testid="text-animals-collected">
                    {stats.tasksCompleted}
                  </div>
                  <p className="text-sm text-amber-600 font-semibold">Tiere</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continue button */}
          <Button
            onClick={onContinue}
            className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
            data-testid="button-milestone-continue"
          >
            Weiter
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}