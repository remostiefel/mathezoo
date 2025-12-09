
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, TrendingUp, Smile, Brain, Star } from "lucide-react";

interface FeedbackAnalyticsProps {
  userId: string;
}

interface FeedbackData {
  totalResponses: number;
  byCategory: Record<string, {
    count: number;
    responses: Record<string, number>;
  }>;
  byQuestion: Record<string, {
    count: number;
    responses: Record<string, number>;
  }>;
  trends: {
    difficulty: Array<{ answer: string; date: string }>;
    fun: Array<{ answer: string; date: string }>;
    confidence: Array<{ answer: string; date: string }>;
  };
}

// Übersetzungen für bessere Lesbarkeit
const ANSWER_LABELS: Record<string, string> = {
  // Math Strategy
  'memorized': 'Auswendig gewusst',
  'make_ten': 'Zuerst zur 10',
  'counting': 'Abgezählt',
  'guessed': 'Geraten',
  
  // Difficulty
  'too_easy': 'Zu leicht',
  'just_right': 'Genau richtig',
  'too_hard': 'Zu schwer',
  'harder': 'Herausforderung gewünscht',
  'same': 'So ist es gut',
  'easier': 'Einfacher gewünscht',
  
  // Fun
  'very_fun': 'Mega Spaß',
  'fun': 'Spaß',
  'okay': 'Geht so',
  'not_fun': 'Wenig Spaß',
  'more_games': 'Mehr Spiele',
  'more_animals': 'Mehr Tiere',
  'more_badges': 'Mehr Abzeichen',
  'more_practice': 'Mehr Üben',
  
  // Representation
  'twenty_frame': '20er-Feld',
  'number_line': 'Zahlenstrahl',
  'counters': 'Wendeplättchen',
  'symbolic': 'Nur Zahlen',
  'need_visuals': 'Braucht Bilder',
  'sometimes': 'Manchmal hilfreich',
  'no_need': 'Kann ohne',
  
  // Meta
  'very_confident': 'Sehr sicher',
  'confident': 'Ziemlich sicher',
  'unsure': 'Noch unsicher',
  'need_help': 'Braucht Hilfe',
  'yes_progress': 'Fortschritt erkennbar',
  'some_progress': 'Etwas Fortschritt',
  'no_progress': 'Kein Fortschritt'
};

const CATEGORY_LABELS: Record<string, string> = {
  'math': 'Mathematische Strategien',
  'ux': 'Schwierigkeit & Interface',
  'fun': 'Spaß & Motivation',
  'meta': 'Selbsteinschätzung'
};

export function FeedbackAnalytics({ userId }: FeedbackAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery<FeedbackData>({
    queryKey: [`/api/feedback/analytics/${userId}`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.totalResponses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Schüler-Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Feedback-Antworten vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  const getEmoji = (answer: string): string => {
    const emojiMap: Record<string, string> = {
      'very_fun': '🤩', 'fun': '😊', 'okay': '😐', 'not_fun': '😞',
      'very_confident': '💪', 'confident': '👍', 'unsure': '🤔', 'need_help': '🆘',
      'too_easy': '😴', 'just_right': '✅', 'too_hard': '😰',
      'memorized': '🧠', 'make_ten': '➕', 'counting': '👆', 'guessed': '🤔'
    };
    return emojiMap[answer] || '📊';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Schüler-Feedback Analyse
          </CardTitle>
          <CardDescription>
            Einblicke in Lernstrategien, Motivation und Selbsteinschätzung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{analytics.totalResponses}</div>
              <p className="text-xs text-muted-foreground">Antworten gesamt</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Brain className="h-6 w-6 mx-auto mb-2 text-learning-teal" />
              <div className="text-2xl font-bold">
                {analytics.byCategory['math']?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Strategie-Rückmeldungen</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Smile className="h-6 w-6 mx-auto mb-2 text-achievement" />
              <div className="text-2xl font-bold">
                {analytics.byCategory['fun']?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Spaß-Rückmeldungen</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Star className="h-6 w-6 mx-auto mb-2 text-discovery" />
              <div className="text-2xl font-bold">
                {analytics.byCategory['meta']?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Selbsteinschätzungen</p>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="math">Strategien</TabsTrigger>
              <TabsTrigger value="fun">Motivation</TabsTrigger>
              <TabsTrigger value="meta">Selbstbild</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {Object.entries(analytics.byCategory).map(([category, data]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {CATEGORY_LABELS[category] || category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(data.responses)
                        .sort((a, b) => b[1] - a[1])
                        .map(([answer, count]) => {
                          const percentage = (count / data.count) * 100;
                          return (
                            <div key={answer} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{getEmoji(answer)}</span>
                                  {ANSWER_LABELS[answer] || answer}
                                </span>
                                <Badge variant="outline">
                                  {count}x ({percentage.toFixed(0)}%)
                                </Badge>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="math" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lösungsstrategien</CardTitle>
                  <CardDescription>
                    Wie löst das Kind die Aufgaben?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.byQuestion['math_strategy_q1'] && (
                    <div className="space-y-2">
                      {Object.entries(analytics.byQuestion['math_strategy_q1'].responses)
                        .sort((a, b) => b[1] - a[1])
                        .map(([answer, count]) => {
                          const total = analytics.byQuestion['math_strategy_q1'].count;
                          const percentage = (count / total) * 100;
                          return (
                            <div key={answer} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{getEmoji(answer)}</span>
                                  {ANSWER_LABELS[answer]}
                                </span>
                                <Badge variant="secondary">
                                  {count}x ({percentage.toFixed(0)}%)
                                </Badge>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fun" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Motivationsverlauf
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {analytics.trends.fun.map((item, idx) => (
                      <div key={idx} className="text-2xl" title={new Date(item.date).toLocaleDateString()}>
                        {getEmoji(item.answer)}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Letzte 10 Spaß-Bewertungen (neueste zuerst)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meta" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selbstvertrauen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {analytics.trends.confidence.map((item, idx) => (
                      <div key={idx} className="text-2xl" title={new Date(item.date).toLocaleDateString()}>
                        {getEmoji(item.answer)}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Entwicklung des Selbstvertrauens
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
