
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Star, HelpCircle, TrendingUp } from "lucide-react";
import { Tip, TIP_UI_CONFIG } from "@/lib/tips-system";
import { cn } from "@/lib/utils";

interface TipModalProps {
  tip: Tip | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkHelpful?: () => void;
}

export function TipModal({ tip, isOpen, onClose, onMarkHelpful }: TipModalProps) {
  if (!tip) return null;

  const uiConfig = TIP_UI_CONFIG[tip.category];

  const getCategoryIcon = () => {
    switch (tip.category) {
      case 'math_trick':
        return <Lightbulb className="w-6 h-6" />;
      case 'animal_fact':
        return <Star className="w-6 h-6" />;
      case 'fun_question':
        return <HelpCircle className="w-6 h-6" />;
      default:
        return <TrendingUp className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl",
        `bg-gradient-to-br ${uiConfig.bgGradient}`
      )}>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-4xl animate-bounce",
              uiConfig.iconBg
            )}>
              {tip.emoji}
            </div>
            <div className="flex-1">
              <DialogTitle className={cn("text-2xl font-bold", uiConfig.textColor)}>
                {tip.title}
              </DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {getCategoryLabel(tip.category)}
                </Badge>
                {tip.difficulty && (
                  <Badge variant="secondary" className="text-xs">
                    {getDifficultyEmoji(tip.difficulty)} {tip.difficulty}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Main Content */}
          <div className={cn(
            "p-4 rounded-lg border-2 bg-white/80",
            uiConfig.borderColor
          )}>
            <p className="text-base leading-relaxed text-gray-800">
              {tip.content}
            </p>
          </div>

          {/* Mathematical Concept */}
          {tip.mathematicalConcept && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Mathematisches Konzept:</h3>
              </div>
              <p className="text-sm text-blue-700">{tip.mathematicalConcept}</p>
            </div>
          )}

          {/* Animal Related */}
          {tip.animalRelated && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🦁</span>
                <h3 className="font-semibold text-green-800">Verwandtes Tier:</h3>
              </div>
              <p className="text-sm text-green-700 capitalize">{tip.animalRelated}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Schließen
            </Button>
            {onMarkHelpful && (
              <Button
                onClick={() => {
                  onMarkHelpful();
                  onClose();
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                👍 War hilfreich!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getCategoryLabel(category: Tip['category']): string {
  const labels = {
    math_trick: '💡 Mathe-Trick',
    animal_fact: '🦁 Tier-Wissen',
    record: '🏆 Rekord',
    fun_question: '🤔 Spannende Frage',
    strategy: '🎯 Lern-Strategie',
    motivation: '💪 Motivation'
  };
  return labels[category];
}

function getDifficultyEmoji(difficulty: 'easy' | 'medium' | 'hard'): string {
  return {
    easy: '⭐',
    medium: '⭐⭐',
    hard: '⭐⭐⭐'
  }[difficulty];
}
