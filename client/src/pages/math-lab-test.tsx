import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdaptiveMathLab } from "@/components/math/AdaptiveMathLab";

export default function MathLabTest() {
  const [number1, setNumber1] = useState(73);
  const [number2, setNumber2] = useState(18);
  const [operation, setOperation] = useState<'+' | '-'>('+');
  const [numberRange, setNumberRange] = useState<20 | 100>(100);
  const [showLab, setShowLab] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLab(false);
    setTimeout(() => setShowLab(true), 10);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 MathLab Test-Tool (ZR20/ZR100)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="number1">Zahl 1</Label>
                <Input
                  id="number1"
                  type="number"
                  min="1"
                  max="100"
                  value={number1}
                  onChange={(e) => setNumber1(parseInt(e.target.value) || 0)}
                  data-testid="input-number1"
                />
              </div>

              <div>
                <Label htmlFor="operation">Operation</Label>
                <Select value={operation} onValueChange={(val) => setOperation(val as '+' | '-')}>
                  <SelectTrigger id="operation" data-testid="select-operation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">+ (Addition)</SelectItem>
                    <SelectItem value="-">- (Subtraktion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="number2">Zahl 2</Label>
                <Input
                  id="number2"
                  type="number"
                  min="1"
                  max="100"
                  value={number2}
                  onChange={(e) => setNumber2(parseInt(e.target.value) || 0)}
                  data-testid="input-number2"
                />
              </div>

              <div>
                <Label htmlFor="numberRange">Zahlenraum</Label>
                <Select value={numberRange.toString()} onValueChange={(val) => setNumberRange(parseInt(val) as 20 | 100)}>
                  <SelectTrigger id="numberRange" data-testid="select-numberrange">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">ZR20 (1-20)</SelectItem>
                    <SelectItem value="100">ZR100 (1-100)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" data-testid="button-update">
              Darstellung aktualisieren
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-mono">
              Aufgabe: <span className="font-bold text-lg">{number1} {operation} {number2} = {operation === '+' ? number1 + number2 : number1 - number2}</span>
              <span className="ml-4 text-muted-foreground">({numberRange === 20 ? 'ZR20' : 'ZR100'})</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {showLab && (
        <Card>
          <CardHeader>
            <CardTitle>Visuelle Darstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <AdaptiveMathLab
              taskNumber1={number1}
              taskNumber2={number2}
              taskOperation={operation}
              numberRange={numberRange}
              representationConfig={{
                twentyFrame: true,
                numberLine: true,
                counters: true,
                fingers: true,
                symbolic: true,
              }}
              placeholderInSymbolic="result"
              onSolutionComplete={() => {}}
              trainingMode="adaptive"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
