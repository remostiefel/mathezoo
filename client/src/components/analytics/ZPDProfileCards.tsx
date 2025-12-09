import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertCircle, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZPDProfileCardsProps {
  classId: number;
  className?: string;
}

interface StudentProfile {
  id: number;
  name: string;
  zpdZone: 'frustration' | 'zpd' | 'independent';
  probability: number;
  recommendedAction: string;
  numberRange: number;
  recentAccuracy: number;
}

export function ZPDProfileCards({ classId, className }: ZPDProfileCardsProps) {
  const { data: profiles, isLoading } = useQuery<StudentProfile[]>({
    queryKey: ['/api/analytics/zpd-profiles', classId],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const getZoneConfig = (zone: string) => {
    switch (zone) {
      case 'frustration':
        return {
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Frustration',
        };
      case 'zpd':
        return {
          color: 'text-learning-teal',
          bgColor: 'bg-learning-teal/10',
          borderColor: 'border-learning-teal/30',
          icon: <Brain className="h-4 w-4" />,
          label: 'ZPD',
        };
      case 'independent':
        return {
          color: 'text-achievement',
          bgColor: 'bg-achievement/10',
          borderColor: 'border-achievement/30',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Selbstständig',
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-muted',
          icon: <Brain className="h-4 w-4" />,
          label: 'Unbekannt',
        };
    }
  };

  const sortedProfiles = profiles?.sort((a, b) => {
    const zoneOrder = { frustration: 0, zpd: 1, independent: 2 };
    return zoneOrder[a.zpdZone] - zoneOrder[b.zpdZone];
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">ZPD-Profile der Klasse</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Individuelle Lernzonen mit Handlungsempfehlungen
          </p>
        </div>
        <Badge variant="secondary">{profiles?.length || 0} Schüler:innen</Badge>
      </div>

      {!sortedProfiles || sortedProfiles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center py-4">
              Keine Profildaten verfügbar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sortedProfiles.map((profile) => {
            const zoneConfig = getZoneConfig(profile.zpdZone);

            return (
              <Card
                key={profile.id}
                className={cn(
                  "transition-all hover-elevate active-elevate-2",
                  zoneConfig.borderColor
                )}
                data-testid={`profile-card-${profile.id}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center",
                            zoneConfig.bgColor,
                            zoneConfig.color
                          )}
                        >
                          {zoneConfig.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{profile.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs">
                              {zoneConfig.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(profile.probability * 100).toFixed(0)}% Wahrscheinlichkeit
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{profile.recentAccuracy}% Genauigkeit</span>
                        </div>
                        <div>
                          Zahlenraum {profile.numberRange}
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className={cn("p-2 rounded-md text-xs", zoneConfig.bgColor)}>
                        <p className="font-medium mb-1">Empfehlung:</p>
                        <p className="text-muted-foreground">{profile.recommendedAction}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                      data-testid={`button-view-details-${profile.id}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
