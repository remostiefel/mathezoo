
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { 
  BABY_ANIMAL_IMAGES, 
  ADULT_ANIMAL_IMAGES,
  UI_ICONS,
  HABITAT_IMAGES,
  DECORATION_IMAGES,
  FOOD_IMAGES,
  TOY_IMAGES
} from "@/lib/animal-images";
import { ANIMAL_NAMES } from "@/lib/zoo-game-system";

export default function ImageShowcase() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/system-info')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-6xl mb-4">🖼️</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bild-Galerie
          </h1>
          <p className="text-lg text-muted-foreground">
            Alle generierten Bilder im Überblick
          </p>
        </div>

        {/* UI Icons */}
        <Card>
          <CardHeader>
            <CardTitle>UI-Icons ({Object.keys(UI_ICONS).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(UI_ICONS).map(([key, src]) => (
                <div key={key} className="p-4 bg-white rounded-lg border-2 text-center">
                  <img src={src} alt={key} className="w-16 h-16 mx-auto object-contain mb-2" />
                  <p className="text-xs font-semibold">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Habitats */}
        <Card>
          <CardHeader>
            <CardTitle>Gehege-Illustrationen ({Object.keys(HABITAT_IMAGES).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(HABITAT_IMAGES).map(([key, src]) => (
                <div key={key} className="p-4 bg-white rounded-lg border-2 text-center">
                  <img src={src} alt={key} className="w-full h-32 object-cover rounded-lg mb-2" />
                  <p className="text-xs font-semibold">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Decorations */}
        <Card>
          <CardHeader>
            <CardTitle>Dekorationen ({Object.keys(DECORATION_IMAGES).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(DECORATION_IMAGES).map(([key, src]) => (
                <div key={key} className="p-4 bg-white rounded-lg border-2 text-center">
                  <img src={src} alt={key} className="w-16 h-16 mx-auto object-contain mb-2" />
                  <p className="text-xs font-semibold">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Food */}
        <Card>
          <CardHeader>
            <CardTitle>Futter ({Object.keys(FOOD_IMAGES).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(FOOD_IMAGES).map(([key, src]) => (
                <div key={key} className="p-4 bg-white rounded-lg border-2 text-center">
                  <img src={src} alt={key} className="w-16 h-16 mx-auto object-contain mb-2" />
                  <p className="text-xs font-semibold">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toys */}
        <Card>
          <CardHeader>
            <CardTitle>Spielzeug ({Object.keys(TOY_IMAGES).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(TOY_IMAGES).map(([key, src]) => (
                <div key={key} className="p-4 bg-white rounded-lg border-2 text-center">
                  <img src={src} alt={key} className="w-16 h-16 mx-auto object-contain mb-2" />
                  <p className="text-xs font-semibold">{key}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Baby Animals */}
        <Card>
          <CardHeader>
            <CardTitle>Baby-Tiere ({Object.keys(BABY_ANIMAL_IMAGES).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {Object.entries(BABY_ANIMAL_IMAGES).map(([key, src]) => (
                <div key={key} className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 text-center">
                  <img src={src} alt={key} className="w-16 h-16 mx-auto object-cover rounded-full mb-2" />
                  <p className="text-xs font-semibold">{ANIMAL_NAMES[key as keyof typeof ANIMAL_NAMES]}</p>
                  <Badge variant="outline" className="text-xs mt-1">Baby</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Adult Animals */}
        <Card>
          <CardHeader>
            <CardTitle>Erwachsene Tiere ({Object.keys(ADULT_ANIMAL_IMAGES).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {Object.entries(ADULT_ANIMAL_IMAGES).map(([key, src]) => (
                <div key={key} className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 text-center">
                  <img src={src} alt={key} className="w-16 h-16 mx-auto object-cover rounded-full mb-2" />
                  <p className="text-xs font-semibold">{ANIMAL_NAMES[key as keyof typeof ANIMAL_NAMES]}</p>
                  <Badge variant="outline" className="text-xs mt-1">Erwachsen</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {Object.keys(UI_ICONS).length}
                </div>
                <div className="text-sm text-muted-foreground">UI-Icons</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {Object.keys(HABITAT_IMAGES).length}
                </div>
                <div className="text-sm text-muted-foreground">Gehege</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {Object.keys(DECORATION_IMAGES).length + Object.keys(FOOD_IMAGES).length + Object.keys(TOY_IMAGES).length}
                </div>
                <div className="text-sm text-muted-foreground">Shop-Items</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(BABY_ANIMAL_IMAGES).length + Object.keys(ADULT_ANIMAL_IMAGES).length}
                </div>
                <div className="text-sm text-muted-foreground">Tier-Bilder</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
