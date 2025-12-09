import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  Sliders, 
  EyeOff, 
  Grid3x3, 
  Ruler, 
  Circle, 
  Hand, 
  Calculator,
  Info
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";

export type TrainingMode = 'adaptive' | 'custom' | 'blind';

export interface RepresentationConfig {
  twentyFrame: boolean;
  numberLine: boolean;
  counters: boolean;
  fingers: boolean;
  symbolic: boolean;
}

interface TrainingModeSelectorProps {
  onModeSelect: (mode: TrainingMode, config?: RepresentationConfig) => void;
}

const REPRESENTATION_OPTIONS = [
  {
    id: 'twentyFrame' as const,
    name: '20er-Feld',
    icon: Grid3x3,
    description: 'Strukturierte Darstellung im 20er-Feld',
  },
  {
    id: 'numberLine' as const,
    name: 'Zahlenstrahl',
    icon: Ruler,
    description: 'Visualisierung auf dem Zahlenstrahl',
  },
  {
    id: 'counters' as const,
    name: 'Wendeplättchen',
    icon: Circle,
    description: 'Zählen mit Wendeplättchen',
  },
  {
    id: 'fingers' as const,
    name: 'Finger',
    icon: Hand,
    description: 'Fingerdarstellung',
  },
  {
    id: 'symbolic' as const,
    name: 'Symbolisch',
    icon: Calculator,
    description: 'Mathematische Schreibweise',
  },
];

export default function TrainingModeSelector({ onModeSelect }: TrainingModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<TrainingMode | null>(null);
  const [customConfig, setCustomConfig] = useState<RepresentationConfig>({
    twentyFrame: true,
    numberLine: true,
    counters: true,
    fingers: true,
    symbolic: true,
  });
  const [blindConfig, setBlindConfig] = useState<RepresentationConfig>({
    twentyFrame: true,
    numberLine: true,
    counters: true,
    fingers: true,
    symbolic: false, // Always false in blind mode
  });
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [showBlindOptions, setShowBlindOptions] = useState(false);

  const handleModeSelect = (mode: TrainingMode) => {
    setSelectedMode(mode);
    if (mode === 'adaptive') {
      setShowCustomOptions(false);
      setShowBlindOptions(false);
    } else if (mode === 'custom') {
      setShowCustomOptions(true);
      setShowBlindOptions(false);
    } else if (mode === 'blind') {
      setShowBlindOptions(true);
      setShowCustomOptions(false);
    }
  };

  const handleCustomConfigChange = (key: keyof RepresentationConfig) => {
    setCustomConfig(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBlindConfigChange = (key: keyof RepresentationConfig) => {
    if (key === 'symbolic') return; // Can't change symbolic in blind mode
    setBlindConfig(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStartTraining = () => {
    if (!selectedMode) return;

    let selectedConfig: RepresentationConfig | undefined;

    if (selectedMode === 'adaptive') {
      onModeSelect('adaptive');
    } else if (selectedMode === 'custom') {
      selectedConfig = customConfig;
      onModeSelect('custom', selectedConfig);
    } else if (selectedMode === 'blind') {
      selectedConfig = blindConfig;
      onModeSelect('blind', selectedConfig);
    }
    
    toast({
      title: selectedMode === 'adaptive' ? "Normaler Modus aktiviert" :
             selectedMode === 'custom' ? "Benutzerdefinierter Modus aktiviert" :
             "Blinder Modus aktiviert",
      description: "Viel Erfolg beim Üben!",
    });
  };

  const selectedCount = selectedMode === 'custom' 
    ? Object.values(customConfig).filter(Boolean).length
    : selectedMode === 'blind'
    ? Object.values(blindConfig).filter(Boolean).length
    : 0;

  const canStart = selectedMode === 'adaptive' || 
    (selectedMode === 'custom' && selectedCount >= 1) ||
    (selectedMode === 'blind' && selectedCount >= 1);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Trainingsmodus wählen</h3>
        <p className="text-sm text-muted-foreground">
          Wähle, wie du trainieren möchtest. Deine Kompetenzen werden in allen Modi gleich getrackt!
        </p>
      </div>

      <div className="grid gap-3">
        {/* Adaptive Mode */}
        <Card 
          className={`cursor-pointer transition-all ${
            selectedMode === 'adaptive' 
              ? 'ring-2 ring-primary shadow-lg' 
              : 'hover-elevate'
          }`}
          onClick={() => handleModeSelect('adaptive')}
          data-testid="card-mode-adaptive"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Normaler Modus</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    KI wählt die besten Darstellungen für dich
                  </CardDescription>
                </div>
              </div>
              {selectedMode === 'adaptive' && (
                <Badge variant="default" className="text-xs">Gewählt</Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Custom Mode */}
        <Collapsible open={showCustomOptions} onOpenChange={setShowCustomOptions}>
          <Card 
            className={`cursor-pointer transition-all ${
              selectedMode === 'custom' 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover-elevate'
            }`}
            data-testid="card-mode-custom"
          >
            <CollapsibleTrigger asChild>
              <CardHeader 
                className="pb-3"
                onClick={() => handleModeSelect('custom')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-learning-teal/10 flex items-center justify-center">
                      <Sliders className="h-5 w-5 text-learning-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Benutzerdefinierter Modus</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Wähle eigene Darstellungen aus
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMode === 'custom' && (
                      <Badge variant="default" className="text-xs">
                        {selectedCount} gewählt
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3 pt-2 border-t">
                  {REPRESENTATION_OPTIONS.map((rep) => (
                    <div 
                      key={rep.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover-elevate"
                      data-testid={`checkbox-rep-${rep.id}`}
                    >
                      <Checkbox
                        id={`custom-${rep.id}`}
                        checked={customConfig[rep.id]}
                        onCheckedChange={() => handleCustomConfigChange(rep.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <rep.icon className="h-4 w-4 text-muted-foreground" />
                        <Label 
                          htmlFor={`custom-${rep.id}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {rep.name}
                        </Label>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md mt-3">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Mindestens 1 Darstellung muss gewählt sein
                    </p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Blind Mode */}
        <Collapsible open={showBlindOptions} onOpenChange={setShowBlindOptions}>
          <Card 
            className={`cursor-pointer transition-all ${
              selectedMode === 'blind' 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover-elevate'
            }`}
            data-testid="card-mode-blind"
          >
            <CollapsibleTrigger asChild>
              <CardHeader 
                className="pb-3"
                onClick={() => handleModeSelect('blind')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-discovery/10 flex items-center justify-center">
                      <EyeOff className="h-5 w-5 text-discovery" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Blinder Modus</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Ohne Rechenzeichen - du tippst die Aufgabe ein
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMode === 'blind' && (
                      <Badge variant="default" className="text-xs">
                        {selectedCount} gewählt
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3 pt-2 border-t">
                  {REPRESENTATION_OPTIONS.filter(rep => rep.id !== 'symbolic').map((rep) => (
                    <div 
                      key={rep.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover-elevate"
                      data-testid={`checkbox-blind-rep-${rep.id}`}
                    >
                      <Checkbox
                        id={`blind-${rep.id}`}
                        checked={blindConfig[rep.id]}
                        onCheckedChange={() => handleBlindConfigChange(rep.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <rep.icon className="h-4 w-4 text-muted-foreground" />
                        <Label 
                          htmlFor={`blind-${rep.id}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {rep.name}
                        </Label>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 p-2 bg-discovery/10 rounded-md mt-3">
                    <Info className="h-4 w-4 text-discovery mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Die symbolische Darstellung ist im Blind-Modus ausgeblendet. Du musst die gesamte Rechnung selbst eintippen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {selectedMode && (
        <Button
          onClick={handleStartTraining}
          disabled={!canStart}
          className="w-full h-12 text-base"
          data-testid="button-confirm-mode"
        >
          {selectedMode === 'adaptive' && 'Normaler Training starten'}
          {selectedMode === 'custom' && `Training mit ${selectedCount} Darstellung${selectedCount !== 1 ? 'en' : ''} starten`}
          {selectedMode === 'blind' && `Blind-Training mit ${selectedCount} Darstellung${selectedCount !== 1 ? 'en' : ''} starten`}
        </Button>
      )}
    </div>
  );
}