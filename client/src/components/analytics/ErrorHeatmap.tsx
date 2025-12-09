import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle } from "lucide-react";

interface ErrorHeatmapProps {
  classId?: number;
  studentId?: number;
  className?: string;
}

interface ErrorData {
  errorType: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

// 8 FEHLERKATEGORIEN
const ERROR_TYPE_LABELS: Record<string, string> = {
  'counting_error_minus_1': 'Zählfehler: -1',
  'counting_error_plus_1': 'Zählfehler: +1',
  'counting_error_minus_2': 'Zählfehler: -2',
  'counting_error_plus_2': 'Zählfehler: +2',
  'operation_confusion': 'Zeichen verwechselt',
  'input_error': 'Vertippt',
  'place_value': 'Zehner-Problem',
  'off_by_ten_minus': 'Um-10: zu wenig',
  'off_by_ten_plus': 'Um-10: zu viel',
  'doubling_error': 'Kernaufgaben',
  'digit_reversal': 'Zahlendreher',
  'other': 'Weitere Fehler'
};

export function ErrorHeatmap({ classId, studentId, className }: ErrorHeatmapProps) {
  const { data: errorData, isLoading } = useQuery<ErrorData[]>({
    queryKey: ['/api/analytics/errors', { classId, studentId }],
    select: (data) => {
      // Sort by count descending
      return data.sort((a, b) => b.count - a.count);
    },
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'hsl(var(--destructive))';
      case 'medium':
        return 'hsl(var(--warning))';
      case 'low':
        return 'hsl(var(--primary))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const errorType = payload[0].payload.errorType;
      const label = ERROR_TYPE_LABELS[errorType] || errorType;
      
      return (
        <div className="bg-card border rounded-md p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Häufigkeit: {payload[0].value}
          </p>
          <p className="text-xs text-muted-foreground">
            Schweregrad: {payload[0].payload.severity}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Fehler-Heatmap</CardTitle>
            <CardDescription className="text-xs mt-1">
              Häufigste Fehlertypen nach Schweregrad
            </CardDescription>
          </div>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {!errorData || errorData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Keine Fehlerdaten verfügbar
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={errorData} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="errorType"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {errorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {errorData && errorData.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-destructive"></div>
              <span className="text-muted-foreground">Kritisch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-warning"></div>
              <span className="text-muted-foreground">Mittel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary"></div>
              <span className="text-muted-foreground">Niedrig</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
