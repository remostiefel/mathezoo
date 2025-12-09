
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Info } from "lucide-react";
import { Tip, TIP_UI_CONFIG } from "@/lib/tips-system";
import { cn } from "@/lib/utils";

interface TipToastProps {
  tip: Tip;
  onClose?: () => void;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right';
}

export function TipToast({ tip, onClose, duration = 6000, position = 'top-right' }: TipToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  const uiConfig = TIP_UI_CONFIG[tip.category];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-20 right-6',
    'top-center': 'top-20 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-6 right-6'
  };

  return (
    <div
      className={cn(
        "fixed z-50 max-w-md transition-all duration-500 ease-out",
        positionClasses[position],
        isExiting ? "opacity-0 translate-x-full scale-95" : "opacity-100 translate-x-0 scale-100 animate-slide-in-right"
      )}
    >
      <Card className={cn(
        "shadow-2xl border-3 overflow-hidden transition-smooth card-interactive",
        `bg-gradient-to-br ${uiConfig.bgGradient}`,
        uiConfig.borderColor
      )}>
        <CardContent className="p-5 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/15 active:bg-black/25 transition-all duration-200 hover:scale-110"
            aria-label="Schließen"
          >
            <X className="w-4 h-4 text-gray-700 font-bold" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-3">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-gentle-bounce shadow-md",
              uiConfig.iconBg
            )}>
              {tip.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={cn("font-bold text-base text-high-contrast", uiConfig.textColor)}>
                  {tip.title}
                </h3>
                {tip.category === 'math_trick' && (
                  <Lightbulb className="w-5 h-5 text-yellow-600 animate-pulse" />
                )}
                {tip.category === 'animal_fact' && (
                  <Info className="w-5 h-5 text-green-600" />
                )}
              </div>
              <Badge variant="outline" className="text-xs font-semibold shadow-sm">
                {getCategoryLabel(tip.category)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-800 leading-relaxed pl-[4.5rem] font-medium">
            {tip.content}
          </p>

          {/* Optional Math Concept */}
          {tip.mathematicalConcept && (
            <div className="mt-3 pl-[4.5rem]">
              <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
                📐 {tip.mathematicalConcept}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getCategoryLabel(category: Tip['category']): string {
  const labels = {
    math_trick: '💡 Mathe-Trick',
    animal_fact: '🦁 Tier-Wissen',
    record: '🏆 Rekord',
    fun_question: '🤔 Rätselhaft',
    strategy: '🎯 Strategie',
    motivation: '💪 Motivation'
  };
  return labels[category];
}
