import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, Target, Zap, Award, Sparkles } from "lucide-react";

interface AchievementNotificationProps {
  studentId: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

export function AchievementNotification({ studentId }: AchievementNotificationProps) {
  const { toast } = useToast();

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements', studentId],
    refetchInterval: 3000, // Check for new achievements every 3 seconds
  });

  useEffect(() => {
    if (!achievements || achievements.length === 0) return;

    const latestAchievement = achievements[0];
    const earnedRecently = new Date().getTime() - new Date(latestAchievement.earnedAt).getTime() < 5000;

    if (earnedRecently) {
      const icon = getAchievementIcon(latestAchievement.icon);
      
      toast({
        title: "🎉 Neue Errungenschaft!",
        description: (
          <div className="flex items-start gap-3 mt-2">
            <div className="h-10 w-10 rounded-full bg-achievement/20 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <div>
              <p className="font-semibold">{latestAchievement.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {latestAchievement.description}
              </p>
            </div>
          </div>
        ),
        className: "bg-achievement/10 border-achievement",
        duration: 5000,
      });
    }
  }, [achievements, toast]);

  const getAchievementIcon = (iconName: string) => {
    const iconClass = "h-5 w-5 text-achievement";
    
    switch (iconName) {
      case "trophy":
        return <Trophy className={iconClass} />;
      case "star":
        return <Star className={iconClass} />;
      case "target":
        return <Target className={iconClass} />;
      case "zap":
        return <Zap className={iconClass} />;
      case "sparkles":
        return <Sparkles className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return null; // This component only handles notifications
}
