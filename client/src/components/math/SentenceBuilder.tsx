import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

type BuildingBlock = {
  id: string;
  type: 'strategy-verb' | 'number-object' | 'connector' | 'meta-reflection';
  text: string;
  category: string;
};

const BUILDING_BLOCKS: BuildingBlock[] = [
  // Strategy Verbs
  { id: 'v1', type: 'strategy-verb', text: 'zerlegen', category: 'verb' },
  { id: 'v2', type: 'strategy-verb', text: 'ergänzen', category: 'verb' },
  { id: 'v3', type: 'strategy-verb', text: 'verdoppeln', category: 'verb' },
  { id: 'v4', type: 'strategy-verb', text: 'tauschen', category: 'verb' },
  { id: 'v5', type: 'strategy-verb', text: 'rechne', category: 'verb' },
  { id: 'v6', type: 'strategy-verb', text: 'nutze', category: 'verb' },
  { id: 'v7', type: 'strategy-verb', text: 'bündle', category: 'verb' },
  { id: 'v8', type: 'strategy-verb', text: 'vereinfache', category: 'verb' },
  { id: 'v9', type: 'strategy-verb', text: 'addiere', category: 'verb' },
  { id: 'v10', type: 'strategy-verb', text: 'subtrahiere', category: 'verb' },
  
  // Number Objects
  { id: 'n1', type: 'number-object', text: 'die 5', category: 'number' },
  { id: 'n2', type: 'number-object', text: 'den Zehner', category: 'number' },
  { id: 'n3', type: 'number-object', text: 'beide Zahlen', category: 'number' },
  { id: 'n4', type: 'number-object', text: 'die erste Zahl', category: 'number' },
  { id: 'n5', type: 'number-object', text: 'die zweite Zahl', category: 'number' },
  { id: 'n6', type: 'number-object', text: 'die Einer', category: 'number' },
  { id: 'n7', type: 'number-object', text: 'die 10', category: 'number' },
  { id: 'n8', type: 'number-object', text: 'zur nächsten 5', category: 'number' },
  { id: 'n9', type: 'number-object', text: 'zur nächsten 10', category: 'number' },
  { id: 'n10', type: 'number-object', text: 'die Aufgabe', category: 'number' },
  
  // Connectors
  { id: 'c1', type: 'connector', text: 'weil', category: 'connector' },
  { id: 'c2', type: 'connector', text: 'deshalb', category: 'connector' },
  { id: 'c3', type: 'connector', text: 'um zu', category: 'connector' },
  { id: 'c4', type: 'connector', text: 'damit', category: 'connector' },
  { id: 'c5', type: 'connector', text: 'sodass', category: 'connector' },
  { id: 'c6', type: 'connector', text: 'und dann', category: 'connector' },
  { id: 'c7', type: 'connector', text: 'wenn', category: 'connector' },
  { id: 'c8', type: 'connector', text: 'so kann ich', category: 'connector' },
  
  // Meta Reflection
  { id: 'm1', type: 'meta-reflection', text: 'zuerst', category: 'meta' },
  { id: 'm2', type: 'meta-reflection', text: 'dann', category: 'meta' },
  { id: 'm3', type: 'meta-reflection', text: 'das hilft mir', category: 'meta' },
  { id: 'm4', type: 'meta-reflection', text: 'ich sehe', category: 'meta' },
  { id: 'm5', type: 'meta-reflection', text: 'danach', category: 'meta' },
  { id: 'm6', type: 'meta-reflection', text: 'am Schluss', category: 'meta' },
  { id: 'm7', type: 'meta-reflection', text: 'ich erkenne', category: 'meta' },
  { id: 'm8', type: 'meta-reflection', text: 'das bedeutet', category: 'meta' },
  { id: 'm9', type: 'meta-reflection', text: 'so wird es einfacher', category: 'meta' },
  { id: 'm10', type: 'meta-reflection', text: 'ich merke mir', category: 'meta' },
];

interface SentenceBuilderProps {
  onSentenceComplete?: (sentence: string, usedBlocks: BuildingBlock[]) => void;
  className?: string;
}

export function SentenceBuilder({ onSentenceComplete, className }: SentenceBuilderProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<BuildingBlock[]>([]);
  const [sentenceHistory, setSentenceHistory] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBlockClick = (block: BuildingBlock) => {
    const newBlocks = [...selectedBlocks, block];
    setSelectedBlocks(newBlocks);
  };

  const handleRemoveBlock = (index: number) => {
    setSelectedBlocks(selectedBlocks.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedBlocks([]);
  };

  const handleComplete = () => {
    if (selectedBlocks.length === 0) return;
    
    const sentence = `Ich ${selectedBlocks.map(b => b.text).join(' ')}.`;
    setSentenceHistory([sentence, ...sentenceHistory]);
    
    if (onSentenceComplete) {
      onSentenceComplete(sentence, selectedBlocks);
    }
    
    setSelectedBlocks([]);
  };

  const getBlockColor = (type: BuildingBlock['type']) => {
    switch (type) {
      case 'strategy-verb':
        return 'bg-primary/10 border-primary text-primary hover:bg-primary/20';
      case 'number-object':
        return 'bg-ones-zone/10 border-ones-zone text-ones-zone hover:bg-ones-zone/20';
      case 'connector':
        return 'bg-muted border-border text-foreground hover:bg-muted/80';
      case 'meta-reflection':
        return 'bg-discovery/10 border-discovery text-discovery hover:bg-discovery/20';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <div className={cn("space-y-4", className)} data-testid="sentence-builder">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Lösungsweg erklären (optional)
              </CardTitle>
              <CardDescription>
                Beschreibe deinen Rechenweg mit Satzbausteinen
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-sentence-builder"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ausblenden
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Einblenden
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Construction Area */}
            <div className="min-h-[80px] p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-medium text-muted-foreground">Ich</span>
                
                {selectedBlocks.map((block, index) => (
                  <button
                    key={`${block.id}-${index}`}
                    onClick={() => handleRemoveBlock(index)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border-2 font-medium text-sm",
                      "transition-all hover:scale-105 active:scale-95",
                      getBlockColor(block.type)
                    )}
                    data-testid={`selected-block-${index}`}
                  >
                    {block.text}
                  </button>
                ))}

                {selectedBlocks.length === 0 && (
                  <span className="text-muted-foreground text-sm italic">
                    Wähle Bausteine aus...
                  </span>
                )}
                
                {selectedBlocks.length > 0 && (
                  <span className="text-muted-foreground">.</span>
                )}
              </div>
            </div>

            {/* Building Blocks */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Strategie-Verben</p>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_BLOCKS.filter(b => b.type === 'strategy-verb').map((block) => (
                    <Button
                      key={block.id}
                      onClick={() => handleBlockClick(block)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "transition-all hover-elevate active-elevate-2",
                        getBlockColor(block.type)
                      )}
                      data-testid={`block-${block.id}`}
                    >
                      {block.text}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Zahlen-Objekte</p>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_BLOCKS.filter(b => b.type === 'number-object').map((block) => (
                    <Button
                      key={block.id}
                      onClick={() => handleBlockClick(block)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "transition-all hover-elevate active-elevate-2",
                        getBlockColor(block.type)
                      )}
                      data-testid={`block-${block.id}`}
                    >
                      {block.text}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Begründungen</p>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_BLOCKS.filter(b => b.type === 'connector').map((block) => (
                    <Button
                      key={block.id}
                      onClick={() => handleBlockClick(block)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "transition-all hover-elevate active-elevate-2",
                        getBlockColor(block.type)
                      )}
                      data-testid={`block-${block.id}`}
                    >
                      {block.text}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Meta-Reflexion</p>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_BLOCKS.filter(b => b.type === 'meta-reflection').map((block) => (
                    <Button
                      key={block.id}
                      onClick={() => handleBlockClick(block)}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "transition-all hover-elevate active-elevate-2",
                        getBlockColor(block.type)
                      )}
                      data-testid={`block-${block.id}`}
                    >
                      {block.text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleComplete}
                disabled={selectedBlocks.length === 0}
                className="flex-1"
                data-testid="button-complete-sentence"
              >
                Satz speichern
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
                disabled={selectedBlocks.length === 0}
                data-testid="button-reset-sentence"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Sentence History */}
            {sentenceHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Deine Erklärungen:</p>
                <div className="space-y-2">
                  {sentenceHistory.map((sentence, index) => (
                    <div
                      key={index}
                      className="p-3 bg-achievement/10 border border-achievement/20 rounded-lg text-sm"
                      data-testid={`sentence-${index}`}
                    >
                      {sentence}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
