import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Grid3x3, Trash2, Save, Download } from "lucide-react";
import { AppNavigation } from "@/components/ui/app-navigation";
import modernZoo from '@assets/generated_images/modern_playful_children\'s_zoo_design.png';
import { useToast } from "@/hooks/use-toast";

const ZOO_ELEMENTS = [
  { id: 'savanna', name: '🦁 Savanne', color: 'bg-yellow-200', cost: 100 },
  { id: 'jungle', name: '🦍 Dschungel', color: 'bg-green-300', cost: 150 },
  { id: 'arctic', name: '🐧 Arktis', color: 'bg-blue-100', cost: 120 },
  { id: 'ocean', name: '🐠 Ozean', color: 'bg-cyan-200', cost: 200 },
  { id: 'food', name: '🍔 Restaurant', color: 'bg-orange-200', cost: 80 },
  { id: 'shop', name: '🎪 Shop', color: 'bg-purple-200', cost: 90 },
  { id: 'playground', name: '🎡 Spielplatz', color: 'bg-pink-200', cost: 110 },
  { id: 'path', name: '🛣️ Pfad', color: 'bg-gray-300', cost: 40 },
];

const GRID_SIZE = 8;

export default function ZooBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [grid, setGrid] = useState<Array<string | null>>(new Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [totalCost, setTotalCost] = useState(0);
  const [zooName, setZooName] = useState("Mein Traum-Zoo");

  const placeElement = (elementId: string, index: number) => {
    if (grid[index] === null) {
      const element = ZOO_ELEMENTS.find(e => e.id === elementId);
      if (element && totalCost + element.cost <= 500) {
        const newGrid = [...grid];
        newGrid[index] = elementId;
        setGrid(newGrid);
        setTotalCost(totalCost + element.cost);
        toast({
          title: "Element platziert!",
          description: `${element.name} hinzugefügt (+${element.cost} Münzen)`,
        });
      } else {
        toast({
          title: "Nicht genug Münzen!",
          description: "Du hast nicht genug Budget für dieses Element.",
          variant: "destructive",
        });
      }
    }
  };

  const removeElement = (index: number) => {
    if (grid[index]) {
      const element = ZOO_ELEMENTS.find(e => e.id === grid[index]);
      const newGrid = [...grid];
      newGrid[index] = null;
      setGrid(newGrid);
      if (element) {
        setTotalCost(Math.max(0, totalCost - element.cost));
      }
    }
  };

  const clearGrid = () => {
    setGrid(new Array(GRID_SIZE * GRID_SIZE).fill(null));
    setTotalCost(0);
  };

  const saveZoo = () => {
    toast({
      title: "Zoo gespeichert!",
      description: "Dein Traum-Zoo wurde in deinen Sammlungen gespeichert!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
        }
        .grid-cell-hover:hover {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      <AppNavigation className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 border-b-2 border-white/30 shadow-lg" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏗️ Zoo-Builder - Baue deinen Traum-Zoo!
          </h1>
          <p className="text-gray-700">Platziere verschiedene Elemente und gestalte deinen eigenen Zoo!</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Build Area */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-green-400 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <input
                    type="text"
                    value={zooName}
                    onChange={(e) => setZooName(e.target.value)}
                    className="bg-transparent border-b-2 border-green-400 font-bold text-2xl outline-none"
                    data-testid="input-zoo-name"
                  />
                  <Badge className="bg-blue-500">{totalCost}/500</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gap: '4px'
                  }}
                >
                  {grid.map((element, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (!element) {
                          const nextElement = ZOO_ELEMENTS[Math.floor(Math.random() * ZOO_ELEMENTS.length)];
                          placeElement(nextElement.id, index);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        removeElement(index);
                      }}
                      className={`
                        aspect-square rounded-lg cursor-pointer transition-all hover:scale-110 hover:shadow-lg grid-cell-hover
                        ${element ? 'text-3xl flex items-center justify-center font-bold shadow-md' : 'border-3 border-dashed border-gray-300 hover:border-green-500 bg-white/70 hover:bg-white'}
                        ${element ? (ZOO_ELEMENTS.find(e => e.id === element)?.color || 'bg-gray-200') : ''}
                      `}
                      title={element ? "Rechtsklick zum Löschen" : "Klick zum Platzieren"}
                      data-testid={`grid-cell-${index}`}
                    >
                      {element && (ZOO_ELEMENTS.find(e => e.id === element)?.name.split(' ')[0] || '?')}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 flex-wrap">
                  <Button onClick={saveZoo} className="bg-green-500 hover:bg-green-600" data-testid="button-save-zoo">
                    <Save className="w-4 h-4 mr-2" />
                    Speichern
                  </Button>
                  <Button onClick={clearGrid} variant="outline" className="border-red-400 text-red-600" data-testid="button-clear-grid">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Leeren
                  </Button>
                  <Button variant="outline" className="border-blue-400" data-testid="button-download-zoo">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Element Palette */}
          <div>
            <Card className="border-2 border-purple-400 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Elemente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ZOO_ELEMENTS.map(element => (
                  <button
                    key={element.id}
                    onClick={() => {
                      const firstEmpty = grid.findIndex(e => e === null);
                      if (firstEmpty !== -1) {
                        placeElement(element.id, firstEmpty);
                      } else {
                        toast({
                          title: "Platz voll!",
                          description: "Das Grid ist voll. Lösche etwas, um Platz zu schaffen.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className={`w-full p-3 rounded-lg text-left font-semibold flex justify-between items-center hover:shadow-lg transition-all hover:scale-105 ${element.color} border-2 border-white`}
                    data-testid={`element-${element.id}`}
                  >
                    <span>{element.name}</span>
                    <Badge variant="outline" className="bg-white font-bold">{element.cost}</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-2 border-blue-400 mt-4">
              <CardHeader>
                <CardTitle className="text-lg">💡 Tipps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-gray-700">
                <p>🖱️ Klick = Element platzieren</p>
                <p>🖱️ Rechtsklick = Element löschen</p>
                <p>💰 Budget: 500 Münzen</p>
                <p>🎨 Kreativ sein!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inspiration */}
        <Card className="border-2 border-green-400 bg-white">
          <CardHeader>
            <CardTitle>✨ Ideen & Inspirationen</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={modernZoo} alt="Zoo Inspiration" className="w-full rounded-lg shadow-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
