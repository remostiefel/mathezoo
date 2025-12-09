import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, Plus, Edit2, Trash2, Star, Sparkles } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface Talent {
  id: string;
  name: string;
  description: string;
  effectType: string;
  effectValue: number;
}

interface AnimalCard {
  id: string;
  animalType: string;
  name: string;
  emoji: string;
  talents: Talent[];
}

interface UserTeam {
  id: string;
  userId: string;
  teamName: string;
  animalIds: string[];
  description: string;
  synergy?: string;
  isActive: boolean;
  wins: number;
  usedInGames: number;
  createdAt: string;
}

export default function TeamManagerPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  // Fetch teams
  const { data: teamsData, isLoading } = useQuery<{ success: boolean; teams: UserTeam[] }>({
    queryKey: ["/api/teams", user?.id],
    queryFn: async () => {
      const response = await fetch('/api/teams', { credentials: 'include' });
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch all animals to map IDs to emojis
  const { data: allAnimalsData } = useQuery<{ success: boolean; cards: AnimalCard[] }>({
    queryKey: ["/api/animals/all"],
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch("/api/teams/" + teamId, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete team");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Team gelöscht! 🗑️", description: "Dieses Team hat sich aufgelöst!" });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch("/api/teams/" + teamId + "/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to activate team");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Team aktiviert! 🎉", description: "Dein neues Lieblings-Team!" });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });

  const teams = teamsData?.teams || [];
  const activeTeam = teams.find(t => t.isActive);
  const animalMap = new Map(
    allAnimalsData?.cards.map(card => [card.id, card]) || []
  );

  // Helper: Get animal emojis for a team
  const getTeamEmojis = (animalIds: string[]) => {
    return animalIds
      .map(id => animalMap.get(id)?.emoji || "")
      .join("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              👥 Mein Team-Manager
            </h1>
            <p className="text-muted-foreground text-lg">
              Erstelle lustige Team-Kombinationen mit deinen Tier-Freunden! Die Namen sind selbst erfunden 😄
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setLocation("/student")} data-testid="button-home">
              <Home className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setLocation("/animal-cards")} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Team - Mega Card */}
        {activeTeam && (
          <Card className="bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 border-2 border-amber-300 dark:border-amber-700 shadow-xl hover-elevate">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Team Name with Icon */}
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <p className="text-xs font-bold tracking-widest text-amber-700 dark:text-amber-300 uppercase">⭐ AKTIVES TEAM ⭐</p>
                    </div>
                    
                    {/* Team Title */}
                    <h2 className="text-4xl font-bold text-amber-900 dark:text-amber-50 mb-2">
                      {activeTeam.teamName}
                    </h2>
                    
                    {/* Team Description */}
                    <p className="text-lg text-amber-800 dark:text-amber-100 mb-3 italic">
                      "{activeTeam.description}"
                    </p>

                    {/* Synergy Info */}
                    {activeTeam.synergy && (
                      <div className="bg-white/30 dark:bg-black/20 p-4 rounded-lg border border-amber-300 dark:border-amber-700 mb-4">
                        <p className="text-base text-amber-900 dark:text-amber-50 font-semibold leading-relaxed">
                          {activeTeam.synergy}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <p className="font-bold text-amber-900 dark:text-amber-50">{activeTeam.wins}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-200">Siege</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎮</span>
                        <div>
                          <p className="font-bold text-amber-900 dark:text-amber-50">{activeTeam.usedInGames}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-200">Spiele</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Emojis - Big Display */}
                  <div className="text-right space-y-2">
                    <div className="text-6xl font-bold leading-none">
                      {getTeamEmojis(activeTeam.animalIds)}
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-200">Dein Team</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Team Button */}
        <Button 
          onClick={() => setLocation("/team-builder")}
          className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          size="lg"
          data-testid="button-create-team"
        >
          <Plus className="w-6 h-6" />
          🎨 Neues cooles Team erstellen
        </Button>

        {/* Teams List */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-3xl font-bold">Meine Teams ({teams.length})</h2>
          </div>
          
          {isLoading ? (
            <Card><CardContent className="p-12 text-center animate-pulse">🔄 Lade deine Teams...</CardContent></Card>
          ) : teams.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/30 p-16">
              <div className="text-center space-y-4">
                <div className="text-7xl animate-bounce">🤔</div>
                <h3 className="text-2xl font-bold">Noch keine Teams!</h3>
                <p className="text-muted-foreground text-lg">Erstelle dein erstes Team - die Auto-Namen sind lustig! 😄</p>
                <Button onClick={() => setLocation("/team-builder")} className="mt-4">
                  Jetzt Team erstellen →
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Card 
                  key={team.id} 
                  className={`overflow-hidden hover-elevate transition-all duration-300 ${
                    team.isActive 
                      ? 'ring-2 ring-green-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                  data-testid={`card-team-${team.id}`}
                >
                  <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-3xl">
                            {getTeamEmojis(team.animalIds)}
                          </div>
                          {team.isActive && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              ⭐ AKTIV
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{team.teamName}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2 text-sm">
                          "{team.description}"
                        </CardDescription>
                        {team.synergy && (
                          <p className="mt-3 text-xs text-foreground font-semibold bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-2 rounded line-clamp-2">
                            {team.synergy.split('🔗')[1]?.trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-3 rounded-md">
                        <p className="text-2xl font-bold">🏆</p>
                        <p className="text-xs text-muted-foreground">Siege</p>
                        <p className="text-lg font-bold">{team.wins}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded-md">
                        <p className="text-2xl font-bold">🎮</p>
                        <p className="text-xs text-muted-foreground">Spiele</p>
                        <p className="text-lg font-bold">{team.usedInGames}</p>
                      </div>
                    </div>

                    {/* Animals in Team */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Team-Mitglieder:</p>
                      <div className="flex gap-2">
                        {team.animalIds.map((animalId) => {
                          const animal = animalMap.get(animalId);
                          if (!animal) return null;
                          return (
                            <div 
                              key={animalId}
                              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg text-xl hover-elevate"
                              title={animal?.name || ""}
                              data-testid={`animal-emoji-${animalId}`}
                            >
                              {animal?.emoji || ""}
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      {!team.isActive && (
                        <Button 
                          onClick={() => activateMutation.mutate(team.id)}
                          size="sm" 
                          variant="default"
                          disabled={activateMutation.isPending}
                          className="flex-1"
                          data-testid={`button-activate-team-${team.id}`}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Aktivieren
                        </Button>
                      )}
                      <Button 
                        onClick={() => setLocation(`/team-builder?edit=${team.id}`)}
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        data-testid={`button-edit-team-${team.id}`}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button 
                        onClick={() => setDeleteTeamId(team.id)}
                        size="sm" 
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-team-${team.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Back to Animals Link */}
        <div className="flex gap-2 justify-center mt-12 pt-8 border-t">
          <Button 
            onClick={() => setLocation("/animal-cards")}
            variant="outline"
            size="lg"
            data-testid="button-back-to-animals"
          >
            ← Zurück zu Meine Tier-Freunde
          </Button>
        </div>

        {/* Delete Team Confirmation Dialog */}
        <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
          <AlertDialogContent data-testid="dialog-delete-team-confirm">
            <AlertDialogTitle>Team wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieses Team wird permanent gelöscht und kann nicht wiederhergestellt werden. 🗑️
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end pt-4">
              <AlertDialogCancel onClick={() => setDeleteTeamId(null)} data-testid="button-delete-cancel">
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (deleteTeamId) {
                    deleteMutation.mutate(deleteTeamId);
                    setDeleteTeamId(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-delete-confirm"
              >
                Löschen
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
