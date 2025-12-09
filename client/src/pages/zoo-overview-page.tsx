import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, LogOut, Heart } from "lucide-react";
import { ZooOverview } from "@/components/zoo/ZooOverview";
import { ZooProfile } from "@/lib/zoo-game-system";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppNavigation } from "@/components/ui/app-navigation";
import { WelcomeBackModal } from "@/components/WelcomeBackModal";
import type { OfflineRewardsSummary } from "@/lib/zoo-economy-engine";
import { useState, useEffect } from "react";
import { BABY_ANIMAL_IMAGES } from "@/lib/animal-images";

export default function ZooOverviewPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [offlineRewards, setOfflineRewards] = useState<OfflineRewardsSummary | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load real zoo profile data from API - MIT FORCE REFRESH
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

  // Mutation to claim offline rewards
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/zoo/claim-offline-rewards', {
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: (data: OfflineRewardsSummary) => {
      // Zeige Welcome Back Modal nur wenn genug Zeit vergangen ist (mindestens 5 Minuten)
      if (data.offlineHours > 0 || data.offlineMinutes >= 5) {
        setOfflineRewards(data);
        setShowWelcomeBack(true);
      }
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
    }
  });

  // Claim offline rewards beim ersten Laden
  useEffect(() => {
    if (user?.id && !claimRewardsMutation.data && !claimRewardsMutation.isPending) {
      claimRewardsMutation.mutate();
    }
  }, [user?.id]);

  const handleCloseWelcomeBack = () => {
    setShowWelcomeBack(false);
    // Force refresh zoo profile data
    setRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
  };

  if (isLoading || !zooProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={BABY_ANIMAL_IMAGES.lion} alt="Baby Löwe" className="w-32 h-32 mx-auto mb-4" />
          <p className="text-lg">Lade deinen Zoo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Welcome Back Modal */}
      <WelcomeBackModal 
        open={showWelcomeBack}
        rewards={offlineRewards}
        onClose={handleCloseWelcomeBack}
      />

      {/* Header */}
      <AppNavigation />

      <div className="max-w-7xl mx-auto mt-6">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/student')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Training
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation('/games')}>
              Spiele
            </Button>
            <Button variant="outline" onClick={() => setLocation('/student')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" onClick={async () => {
              await fetch('/api/auth/logout', { method: 'Post', credentials: 'include' });
              window.location.href = '/login';
            }}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        <ZooOverview profile={zooProfile} userId={user?.id} />
      </div>

      {/* Disclaimer Section */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          Willkommen bei MatheZoo! Dies ist eine Lernplattform.
          <br />
          Disclaimer: Die Inhalte dienen ausschließlich Bildungszwecken.
          <br />
          Impressum: Remo Stiefel, lerncare@gmail.com (2025)
        </p>
        <div className="mt-4">
          <a href="/site-overview" className="text-blue-500 hover:underline">
            Site-Übersicht
          </a>
          {' | '}
          <a href="/impressum" className="text-blue-500 hover:underline">
            Impressum
          </a>
        </div>
      </footer>
    </div>
  );
}