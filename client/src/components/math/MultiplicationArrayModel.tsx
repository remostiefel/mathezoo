
import { cn } from "@/lib/utils";

interface MultiplicationArrayModelProps {
  factor1: number;
  factor2: number;
  showProduct?: boolean;
  interactive?: boolean;
  onCountComplete?: () => void;
}

/**
 * ARRAY-MODELL für Multiplikation
 * 
 * Didaktik (Krauthausen 2018):
 * - Multiplikation als Rechteck (Zeilen · Spalten)
 * - Kommutativgesetz visuell: 3·4 vs 4·3 (Drehung!)
 * - Distributivgesetz: Rechteck aufteilen
 */
export function MultiplicationArrayModel({
  factor1,
  factor2,
  showProduct = false,
  interactive = false,
  onCountComplete
}: MultiplicationArrayModelProps) {
  
  const product = factor1 * factor2;
  
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Array-Darstellung */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: factor1 }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array.from({ length: factor2 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 flex items-center justify-center",
                  "bg-blue-100 border-blue-400",
                  "transition-all duration-300",
                  interactive && "cursor-pointer hover:bg-blue-200 hover:scale-110"
                )}
              >
                <span className="text-xl">🔵</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Beschriftung */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-700">
          {factor1} Reihen · {factor2} Spalten
        </p>
        
        {showProduct && (
          <div className="text-3xl font-bold text-blue-600">
            = {product}
          </div>
        )}
        
        {/* Didaktischer Hinweis */}
        <p className="text-sm text-gray-500 max-w-md">
          💡 Drehe das Rechteck: {factor1}·{factor2} = {factor2}·{factor1} (Kommutativgesetz!)
        </p>
      </div>
    </div>
  );
}
