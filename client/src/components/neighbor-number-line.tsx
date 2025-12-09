import { useMemo } from 'react';
import { motion } from 'framer-motion';

type NeighborType = 'ones' | 'tens' | 'hundreds' | 'thousands';

interface NeighborNumberLineProps {
  currentNumber: number;
  predecessor: number;
  successor: number;
  neighborType: NeighborType;
  predecessorConfirmed?: boolean;
  successorConfirmed?: boolean;
}

interface ScaleConfig {
  range: number;
  majorTickInterval: number;
  minorTickInterval: number;
  labelInterval: number;
}

const SCALE_CONFIGS: Record<NeighborType, ScaleConfig> = {
  ones: {
    range: 3,
    majorTickInterval: 1,
    minorTickInterval: 1,
    labelInterval: 1
  },
  tens: {
    range: 42,
    majorTickInterval: 10,
    minorTickInterval: 5,
    labelInterval: 10
  },
  hundreds: {
    range: 420,
    majorTickInterval: 100,
    minorTickInterval: 50,
    labelInterval: 100
  },
  thousands: {
    range: 4200,
    majorTickInterval: 1000,
    minorTickInterval: 500,
    labelInterval: 1000
  }
};

export function NeighborNumberLine({
  currentNumber,
  predecessor,
  successor,
  neighborType,
  predecessorConfirmed = false,
  successorConfirmed = false
}: NeighborNumberLineProps) {
  const scaleData = useMemo(() => {
    const config = SCALE_CONFIGS[neighborType];
    
    // Berechne den Anzeigebereich - stelle sicher, dass 0 sichtbar ist wenn nötig
    let minValue = Math.max(0, currentNumber - config.range);
    let maxValue = currentNumber + config.range;
    
    // Wenn Vorgänger 0 ist, zeige von 0 an
    if (predecessor === 0) {
      minValue = 0;
      maxValue = currentNumber + config.range;
    }
    
    // Generiere Tick-Positionen
    const ticks: Array<{ value: number; isMajor: boolean; showLabel: boolean }> = [];
    
    // Starte bei einem glatten Wert
    const startTick = Math.floor(minValue / config.minorTickInterval) * config.minorTickInterval;
    
    for (let value = startTick; value <= maxValue; value += config.minorTickInterval) {
      if (value < minValue) continue;
      
      const isMajor = value % config.majorTickInterval === 0;
      const showLabel = value % config.labelInterval === 0;
      
      ticks.push({ value, isMajor, showLabel });
    }
    
    return {
      minValue,
      maxValue,
      ticks,
      range: maxValue - minValue
    };
  }, [currentNumber, predecessor, neighborType]);
  
  // Konvertiere Zahl zu X-Position (0-100%)
  const valueToX = (value: number): number => {
    return ((value - scaleData.minValue) / scaleData.range) * 100;
  };
  
  const currentX = valueToX(currentNumber);
  const predecessorX = valueToX(predecessor);
  const successorX = valueToX(successor);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full mt-6"
    >
      <svg
        viewBox="0 0 100 16"
        className="w-full h-20"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Hintergrund-Gradient für Vorgänger-Bereich */}
        <defs>
          <linearGradient id="predecessorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(210, 90%, 45%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(210, 90%, 45%)" stopOpacity="0.02" />
          </linearGradient>
          
          <linearGradient id="successorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(28, 90%, 52%)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="hsl(28, 90%, 52%)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        
        {/* Hintergrund-Bereiche */}
        {predecessorConfirmed && (
          <rect
            x="0"
            y="6"
            width={currentX}
            height="4"
            fill="url(#predecessorGradient)"
            rx="2"
          />
        )}
        
        {successorConfirmed && (
          <rect
            x={currentX}
            y="6"
            width={100 - currentX}
            height="4"
            fill="url(#successorGradient)"
            rx="2"
          />
        )}
        
        {/* Hauptlinie */}
        <line
          x1="0"
          y1="8"
          x2="100"
          y2="8"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-foreground/30"
        />
        
        {/* Tick-Marks */}
        {scaleData.ticks.map((tick, index) => {
          const x = valueToX(tick.value);
          const tickHeight = tick.isMajor ? 2 : 1;
          const y1 = 8 - tickHeight;
          const y2 = 8 + tickHeight;
          
          return (
            <g key={index}>
              <line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke="currentColor"
                strokeWidth={tick.isMajor ? '0.2' : '0.15'}
                className="text-foreground/40"
              />
              
              {tick.showLabel && (
                <text
                  x={x}
                  y="14"
                  textAnchor="middle"
                  fontSize="2.4"
                  className="fill-foreground/60 font-bold"
                >
                  {tick.value}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Vorgänger-Marker */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: predecessorConfirmed ? 1 : 0.6, opacity: predecessorConfirmed ? 1 : 0.3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <circle
            cx={predecessorX}
            cy="8"
            r="1.2"
            fill={predecessorConfirmed ? "hsl(210, 90%, 45%)" : "hsl(210, 90%, 45%, 0.3)"}
            stroke="white"
            strokeWidth="0.3"
          />
          {predecessorConfirmed ? (
            <text
              x={predecessorX}
              y="3.5"
              textAnchor="middle"
              fontSize="2.8"
              className="fill-[hsl(210,90%,45%)] font-bold"
            >
              {predecessor}
            </text>
          ) : (
            <text
              x={predecessorX}
              y="3.5"
              textAnchor="middle"
              fontSize="3.2"
              className="fill-[hsl(210,90%,45%)] font-bold"
            >
              ?
            </text>
          )}
        </motion.g>
        
        {/* Aktuelle Zahl-Marker */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <circle
            cx={currentX}
            cy="8"
            r="1.5"
            fill="hsl(260, 70%, 45%)"
            stroke="white"
            strokeWidth="0.3"
          />
          <circle
            cx={currentX}
            cy="8"
            r="2.2"
            fill="none"
            stroke="hsl(260, 70%, 45%)"
            strokeWidth="0.2"
            opacity="0.3"
          />
          <text
            x={currentX}
            y="3.5"
            textAnchor="middle"
            fontSize="2.4"
            className="fill-[hsl(260,70%,45%)] font-bold"
          >
            {currentNumber}
          </text>
        </motion.g>
        
        {/* Nachfolger-Marker */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: successorConfirmed ? 1 : 0.6, opacity: successorConfirmed ? 1 : 0.3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <circle
            cx={successorX}
            cy="8"
            r="1.2"
            fill={successorConfirmed ? "hsl(28, 90%, 52%)" : "hsl(28, 90%, 52%, 0.3)"}
            stroke="white"
            strokeWidth="0.3"
          />
          {successorConfirmed ? (
            <text
              x={successorX}
              y="3.5"
              textAnchor="middle"
              fontSize="2"
              className="fill-[hsl(28,90%,52%)] font-bold"
            >
              {successor}
            </text>
          ) : (
            <text
              x={successorX}
              y="3.5"
              textAnchor="middle"
              fontSize="2.5"
              className="fill-[hsl(28,90%,52%)] font-bold"
            >
              ?
            </text>
          )}
        </motion.g>
      </svg>
      
      {/* Legende */}
      <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(210, 90%, 45%)' }} />
          <span>Vorgänger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(260, 70%, 45%)' }} />
          <span>Aktuelle Zahl</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(28, 90%, 52%)' }} />
          <span>Nachfolger</span>
        </div>
      </div>
    </motion.div>
  );
}
