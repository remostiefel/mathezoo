import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StrategyTimelineProps {
  studentId: number;
  className?: string;
}

interface StrategyDataPoint {
  session: number;
  counting: number;
  decomposition: number;
  placeValue: number;
  mental: number;
  date: string;
}

export function StrategyTimeline({ studentId, className }: StrategyTimelineProps) {
  const { data: strategyData, isLoading } = useQuery<StrategyDataPoint[]>({
    queryKey: ['/api/analytics/strategies', studentId],
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

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-md p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">Session {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const latestStrategies = strategyData?.[strategyData.length - 1];
  const dominantStrategy = latestStrategies
    ? Object.entries(latestStrategies)
        .filter(([key]) => !['session', 'date'].includes(key))
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]
    : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Strategie-Entwicklung</CardTitle>
            <CardDescription className="text-xs mt-1">
              Verwendung von Lösungsstrategien über Zeit
            </CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!strategyData || strategyData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Keine Strategiedaten verfügbar
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={strategyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="session"
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                  domain={[0, 100]}
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: '10px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="counting"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Zählen"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="decomposition"
                  stroke="hsl(var(--learning-teal))"
                  strokeWidth={2}
                  name="Zerlegung"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="placeValue"
                  stroke="hsl(var(--discovery))"
                  strokeWidth={2}
                  name="Stellenwert"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="mental"
                  stroke="hsl(var(--achievement))"
                  strokeWidth={2}
                  name="Kopfrechnen"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Current Dominant Strategy */}
            {dominantStrategy && (
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Aktuelle Hauptstrategie</p>
                  <p className="text-sm font-medium mt-1 capitalize">
                    {dominantStrategy[0].replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <Badge variant="secondary">
                  {dominantStrategy[1]}%
                </Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
