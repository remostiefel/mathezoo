
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, TrendingUp, Target, Moon, Sparkles } from "lucide-react";

interface Phase3AnalyticsProps {
  userId: string;
}

export function Phase3Analytics({ userId }: Phase3AnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/neural/advanced-analytics/${userId}`],
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Phase 3 Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading advanced analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Phase 3 Advanced Neural Analytics
          </CardTitle>
          <CardDescription>
            Brain-Inspired Progression System 3.0 - Complete Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meta">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meta">
                <Zap className="h-4 w-4 mr-2" />
                Meta-Learning
              </TabsTrigger>
              <TabsTrigger value="representations">
                <Target className="h-4 w-4 mr-2" />
                Representations
              </TabsTrigger>
              <TabsTrigger value="transfer">
                <TrendingUp className="h-4 w-4 mr-2" />
                Transfer
              </TabsTrigger>
              <TabsTrigger value="consolidation">
                <Moon className="h-4 w-4 mr-2" />
                Consolidation
              </TabsTrigger>
            </TabsList>

            {/* Meta-Learning Tab */}
            <TabsContent value="meta" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meta-Learning Profile</CardTitle>
                  <CardDescription>System learns how you learn best</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Optimal Learning Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(analytics.metaProfile?.optimalLearningRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={analytics.metaProfile?.optimalLearningRate * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Error Recovery Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(analytics.metaProfile?.errorRecoveryRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={analytics.metaProfile?.errorRecoveryRate * 100} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Strategy Adaptability</span>
                      <span className="text-sm text-muted-foreground">
                        {(analytics.metaProfile?.strategyAdaptability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={analytics.metaProfile?.strategyAdaptability * 100} />
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Optimal Spacing</p>
                    <Badge variant="secondary">
                      {analytics.metaProfile?.optimalSpacing} minutes
                    </Badge>
                  </div>

                  {analytics.metaProfile?.breakthroughIndicators && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Breakthrough Indicators</p>
                      <div className="flex flex-wrap gap-2">
                        {analytics.metaProfile.breakthroughIndicators.map((indicator: string) => (
                          <Badge key={indicator} variant="outline">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {indicator.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Representations Tab */}
            <TabsContent value="representations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Representation Analysis</CardTitle>
                  <CardDescription>Performance across different visualizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.representationAnalysis?.map((rep: any) => (
                      <div key={rep.representation} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {rep.representation.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Badge variant={rep.successRate > 0.7 ? "default" : "secondary"}>
                            {(rep.successRate * 100).toFixed(0)}% success
                          </Badge>
                        </div>
                        <Progress value={rep.successRate * 100} />
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Used: {rep.usageCount}x</span>
                          <span>Time reduction: {(rep.avgTimeReduction * 100).toFixed(0)}%</span>
                          <span>Preference: {(rep.preferenceScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transfer Tab */}
            <TabsContent value="transfer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transfer Learning</CardTitle>
                  <CardDescription>Knowledge transfer across domains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${analytics.transferReadiness ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="font-medium">
                        {analytics.transferReadiness ? 'Ready for Transfer' : 'Building Mastery'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analytics.transferReadiness 
                        ? 'System can now transfer learned skills to new number ranges'
                        : 'Continue practicing to build stronger foundations'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consolidation Tab */}
            <TabsContent value="consolidation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memory Consolidation</CardTitle>
                  <CardDescription>Sleep-dependent learning enhancement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{analytics.consolidationStatus}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Memory consolidation occurs during rest periods (optimal: 8-12 hours)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recommendations */}
          {analytics.recommendations && analytics.recommendations.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
