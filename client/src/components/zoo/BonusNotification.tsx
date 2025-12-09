
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BonusNotificationProps {
  bonusType: 'coin' | 'xp' | 'animal';
  amount: number;
  itemName?: string;
  onComplete?: () => void;
}

export function BonusNotification({ bonusType, amount, itemName, onComplete }: BonusNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const config = {
    coin: { emoji: '💰', color: 'from-yellow-400 to-orange-500', text: 'Münz-Bonus!' },
    xp: { emoji: '⭐', color: 'from-blue-400 to-purple-500', text: 'XP-Bonus!' },
    animal: { emoji: '🦁', color: 'from-green-400 to-emerald-500', text: 'Tier-Chance-Bonus!' },
  };

  const { emoji, color, text } = config[bonusType];

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right">
      <Card className={`bg-gradient-to-r ${color} border-2 border-white shadow-2xl`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-bounce">{emoji}</div>
            <div className="text-white">
              <div className="font-bold text-lg">{text}</div>
              <div className="text-sm">+{amount}% {itemName && `durch ${itemName}`}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
