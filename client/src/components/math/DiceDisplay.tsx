/**
 * DiceDisplay Component
 * 
 * Displays numbers using traditional dice patterns (1-6 dots per die)
 * Numbers > 6 are split into multiple dice (e.g., 9 = 6 + 3)
 * Supports color-coding for operations (e.g., subtraction shows which dots are removed)
 */

import { cn } from "@/lib/utils";

interface DiceDisplayProps {
  number: number;
  color?: 'red' | 'blue' | 'green' | 'orange' | 'gray' | 'pastel-1' | 'pastel-2' | 'pastel-3' | 'pastel-4' | 'pastel-5' | 'pastel-6' | 'pastel-7' | 'pastel-8' | 'pastel-9' | 'pastel-10';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Function to get pastel color based on die value (1-10)
 */
function getPastelColorClass(value: number): string {
  const pastelColors: { [key: number]: string } = {
    1: 'bg-red-200 dark:bg-red-300 border-red-400',
    2: 'bg-blue-200 dark:bg-blue-300 border-blue-400',
    3: 'bg-green-200 dark:bg-green-300 border-green-400',
    4: 'bg-yellow-200 dark:bg-yellow-300 border-yellow-400',
    5: 'bg-orange-200 dark:bg-orange-300 border-orange-400',
    6: 'bg-pink-200 dark:bg-pink-300 border-pink-400',
    7: 'bg-purple-200 dark:bg-purple-300 border-purple-400',
    8: 'bg-cyan-200 dark:bg-cyan-300 border-cyan-400',
    9: 'bg-amber-200 dark:bg-amber-300 border-amber-400',
    10: 'bg-indigo-200 dark:bg-indigo-300 border-indigo-400'
  };
  return pastelColors[Math.min(value, 10)] || pastelColors[1];
}

/**
 * Single die with traditional dot patterns (1-6)
 */
function SingleDie({ 
  value, 
  color = 'gray',
  size = 'md',
  highlightDots = [],
  highlightColor = 'red',
  className
}: {
  value: number;
  color?: 'red' | 'blue' | 'green' | 'orange' | 'gray' | 'pastel-1' | 'pastel-2' | 'pastel-3' | 'pastel-4' | 'pastel-5' | 'pastel-6' | 'pastel-7' | 'pastel-8' | 'pastel-9' | 'pastel-10';
  size?: 'sm' | 'md' | 'lg';
  highlightDots?: number[];
  highlightColor?: 'red' | 'blue' | 'green' | 'orange';
  className?: string;
}) {
  // Size configurations
  const sizeConfig = {
    sm: { dice: 'w-12 h-12', dot: 'w-2 h-2', text: 'text-lg' },
    md: { dice: 'w-24 h-24', dot: 'w-4 h-4', text: 'text-4xl' },
    lg: { dice: 'w-32 h-32', dot: 'w-5 h-5', text: 'text-5xl' }
  };
  
  const { dice: diceSize, dot: dotSize, text: textSize } = sizeConfig[size];
  
  // Check if using pastel color
  const isPastel = color.startsWith('pastel-');
  let bgBorderClasses = '';
  
  if (isPastel) {
    const dieValue = parseInt(color.replace('pastel-', ''));
    bgBorderClasses = getPastelColorClass(dieValue);
  }
  
  // Color configurations
  const colorClasses = {
    red: {
      bg: 'bg-red-100 dark:bg-red-950',
      border: 'border-red-500',
      dot: 'bg-red-600'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950',
      border: 'border-blue-500',
      dot: 'bg-blue-600'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-950',
      border: 'border-green-500',
      dot: 'bg-green-600'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950',
      border: 'border-orange-500',
      dot: 'bg-orange-600'
    },
    gray: {
      bg: 'bg-muted',
      border: 'border-border',
      dot: 'bg-foreground'
    }
  };
  
  const colors = isPastel ? { dot: 'bg-black' } : colorClasses[color];
  const highlightColors = colorClasses[highlightColor];
  
  // Show 10 and 1 as numbers instead of dots (too complex for dots)
  if (value === 10 || value === 1 && false) { // 1 uses dots, only 10 as number
    return (
      <div 
        className={cn(
          diceSize,
          "rounded-lg border-2 flex items-center justify-center font-bold",
          isPastel ? bgBorderClasses : colors.bg,
          isPastel ? '' : colors.border,
          textSize,
          className
        )}
        data-testid={`dice-${value}`}
      >
        <span className="font-mono">{value}</span>
      </div>
    );
  }
  
  // Traditional dice dot positions (1-9)
  const positions = getDotPositions(value);
  
  return (
    <div 
      className={cn(
        diceSize,
        "rounded-lg border-2 relative flex items-center justify-center p-2",
        isPastel ? bgBorderClasses : colors.bg,
        isPastel ? '' : colors.border,
        className
      )}
      data-testid={`dice-${value}`}
    >
      <div className="relative w-full h-full">
        {positions.map((pos, idx) => {
          const isHighlighted = highlightDots.includes(idx);
          const dotColor = isHighlighted ? highlightColors.dot : colors.dot;
          
          return (
            <div
              key={idx}
              className={cn(
                "rounded-full absolute",
                dotSize,
                dotColor,
                "border-2 border-black"
              )}
              style={{ 
                top: pos.top, 
                left: pos.left,
                transform: pos.transform 
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Helper function for dice dot positions (1-10)
// 1-6: Traditional patterns, 7-9: Extended patterns for 1·1 training, 10: Shown as number
function getDotPositions(num: number): Array<{ top: string; left: string; transform?: string }> {
  const positions: { [key: number]: Array<{ top: string; left: string; transform?: string }> } = {
    1: [
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    ],
    
    2: [
      { top: '25%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '75%', left: '75%', transform: 'translate(-50%, -50%)' }
    ],
    
    3: [
      { top: '25%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '75%', left: '75%', transform: 'translate(-50%, -50%)' }
    ],
    
    4: [
      { top: '25%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '25%', left: '75%', transform: 'translate(-50%, -50%)' },
      { top: '75%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '75%', left: '75%', transform: 'translate(-50%, -50%)' }
    ],
    
    5: [
      { top: '25%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '25%', left: '75%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '75%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '75%', left: '75%', transform: 'translate(-50%, -50%)' }
    ],
    
    6: [
      { top: '20%', left: '30%', transform: 'translate(-50%, -50%)' },
      { top: '20%', left: '70%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '30%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '70%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '30%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '70%', transform: 'translate(-50%, -50%)' }
    ],
    
    // 7: Two rows of 3 + center point (3+3+1)
    7: [
      { top: '20%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '20%', left: '75%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '75%', transform: 'translate(-50%, -50%)' }
    ],
    
    // 8: 3·3 grid without center point (wider spacing)
    8: [
      { top: '15%', left: '20%', transform: 'translate(-50%, -50%)' },
      { top: '15%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '15%', left: '80%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '20%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '80%', transform: 'translate(-50%, -50%)' },
      { top: '85%', left: '20%', transform: 'translate(-50%, -50%)' },
      { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '85%', left: '80%', transform: 'translate(-50%, -50%)' }
    ],
    
    // 9: Full 3·3 grid
    9: [
      { top: '20%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '20%', left: '75%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '50%', left: '75%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '25%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '50%', transform: 'translate(-50%, -50%)' },
      { top: '80%', left: '75%', transform: 'translate(-50%, -50%)' }
    ],
    
    // 10: Will be shown as number, not dots
    10: []
  };
  
  return positions[num] || [];
}

/**
 * Smart dice combination algorithm
 * Finds the best combination of dice (1-10) to represent a number
 * For 1·1 training: 7, 8, 9 are shown as individual dice with dot patterns
 * 10 is shown as a number (too complex for dots)
 * Prioritizes: identical dice > fewer dice > larger dice values
 */
function getOptimalDiceCombination(number: number): number[] {
  if (number === 0) return [0];
  if (number <= 10) return [number]; // Support 1-10 individually
  
  // Define possible dice combinations for numbers > 10
  const specialCombinations: { [key: number]: number[] } = {
    // Multiples that can be represented with identical dice
    12: [6, 6],          // 2·6
    14: [7, 7],          // 2·7
    15: [5, 5, 5],       // 3·5
    16: [8, 8],          // 2·8
    18: [9, 9],          // 2·9
    20: [10, 10],        // 2·10
    24: [8, 8, 8],       // 3·8
    27: [9, 9, 9],       // 3·9
    30: [10, 10, 10],    // 3·10
  };
  
  // Check for special combinations first
  if (specialCombinations[number]) {
    return specialCombinations[number];
  }
  
  // Try to find combinations with identical dice
  for (let dieValue = 6; dieValue >= 2; dieValue--) {
    if (number % dieValue === 0) {
      const count = number / dieValue;
      if (count <= 6) { // Don't use more than 6 dice
        return Array(count).fill(dieValue);
      }
    }
  }
  
  // Try combinations with mostly identical dice
  for (let dieValue = 6; dieValue >= 4; dieValue--) {
    const quotient = Math.floor(number / dieValue);
    const remainder = number % dieValue;
    if (quotient > 0 && quotient <= 5 && remainder > 0 && remainder <= 6) {
      return [...Array(quotient).fill(dieValue), remainder];
    }
  }
  
  // Fall back to greedy algorithm (largest dice first)
  const dice: number[] = [];
  let remaining = number;
  
  while (remaining > 0) {
    if (remaining >= 6) {
      dice.push(6);
      remaining -= 6;
    } else {
      dice.push(remaining);
      remaining = 0;
    }
  }
  
  return dice;
}

/**
 * Display a number using one or more dice (max 6 dots per die)
 */
export function DiceDisplay({ 
  number, 
  color = 'gray', 
  size = 'md',
  className 
}: DiceDisplayProps) {
  
  // For numbers > 20, show as number in circle
  if (number > 20) {
    const sizeConfig = {
      sm: 'w-12 h-12 text-lg',
      md: 'w-16 h-16 text-xl',
      lg: 'w-20 h-20 text-2xl'
    };
    
    const colorClasses = {
      red: 'bg-red-100 dark:bg-red-950 border-red-500 text-red-600',
      blue: 'bg-blue-100 dark:bg-blue-950 border-blue-500 text-blue-600',
      green: 'bg-green-100 dark:bg-green-950 border-green-500 text-green-600',
      orange: 'bg-orange-100 dark:bg-orange-950 border-orange-500 text-orange-600',
      gray: 'bg-muted border-border text-foreground'
    };
    
    return (
      <div 
        className={cn(
          sizeConfig[size],
          "rounded-full flex items-center justify-center font-bold border-2",
          colorClasses[color],
          className
        )}
        data-testid={`dice-display-${number}`}
      >
        <span className="font-mono">{number}</span>
      </div>
    );
  }
  
  // Use smart combination algorithm
  const dice = getOptimalDiceCombination(number);
  
  // Spezielles 3x3 Grid für die Zahl 9
  if (number === 9) {
    return (
      <div className={cn("grid grid-cols-3 gap-2 justify-center", className)} data-testid={`dice-display-${number}`}>
        {dice.map((value, idx) => (
          <SingleDie 
            key={idx} 
            value={value} 
            color={color} 
            size={size}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 flex-wrap justify-center", className)} data-testid={`dice-display-${number}`}>
      {dice.map((value, idx) => (
        <SingleDie 
          key={idx} 
          value={value} 
          color={color} 
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * DiceSubtraction Component
 * 
 * Shows subtraction visually with dice
 * For 9-2: Shows 9 as (6 full die + 3 on second die), with 2 dots highlighted in red
 * The remaining dots are shown in blue
 */
interface DiceSubtractionProps {
  minuend: number;      // The number we subtract from (e.g., 9)
  subtrahend: number;   // The number we subtract (e.g., 2)
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DiceSubtraction({
  minuend,
  subtrahend,
  size = 'md',
  className
}: DiceSubtractionProps) {
  
  // Split minuend into dice (max 6 per die)
  const dice: number[] = [];
  let remaining = minuend;
  
  while (remaining > 0) {
    if (remaining >= 6) {
      dice.push(6);
      remaining -= 6;
    } else {
      dice.push(remaining);
      remaining = 0;
    }
  }
  
  // Determine which dots to highlight (for subtraction)
  // We highlight from the right side (last die first)
  let toHighlight = subtrahend;
  const diceHighlights: number[][] = dice.map(() => []);
  
  // Start from the last die and work backwards
  for (let i = dice.length - 1; i >= 0 && toHighlight > 0; i--) {
    const dieValue = dice[i];
    const highlightCount = Math.min(toHighlight, dieValue);
    
    // Highlight dots from left to right on each die
    for (let j = 0; j < highlightCount; j++) {
      diceHighlights[i].push(j);
    }
    
    toHighlight -= highlightCount;
  }
  
  return (
    <div className={cn("flex items-center gap-4 flex-wrap justify-center", className)} data-testid={`dice-subtraction-${minuend}-${subtrahend}`}>
      {dice.map((value, idx) => {
        const hasHighlights = diceHighlights[idx].length > 0;
        const allHighlighted = diceHighlights[idx].length === value;
        
        return (
          <SingleDie 
            key={idx} 
            value={value} 
            color={allHighlighted ? 'gray' : 'green'}
            highlightDots={diceHighlights[idx]}
            highlightColor="blue"
            size={size}
          />
        );
      })}
    </div>
  );
}

/**
 * DiceGroup Component
 * 
 * Displays a number with optional split into colored groups
 * Used for showing operations: e.g., 7 = 5 (red) + 2 (blue)
 */
interface DiceGroupProps {
  total: number;
  firstPart: number;
  secondPart?: number;
  operation?: '+' | '-';
  firstColor?: 'red' | 'blue' | 'green' | 'orange';
  secondColor?: 'red' | 'blue' | 'green' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DiceGroup({
  total,
  firstPart,
  secondPart,
  operation = '+',
  firstColor = 'red',
  secondColor = 'blue',
  size = 'md',
  className
}: DiceGroupProps) {
  
  // If subtraction, use DiceSubtraction component
  if (operation === '-' && secondPart) {
    return <DiceSubtraction minuend={firstPart} subtrahend={secondPart} size={size} className={className} />;
  }
  
  // If no second part, just show the number
  if (!secondPart || secondPart === 0) {
    return <DiceDisplay number={firstPart} color={firstColor} size={size} className={className} />;
  }
  
  // Show grouped representation for addition
  return (
    <div className={cn("flex items-center gap-4 flex-wrap justify-center", className)} data-testid={`dice-group-${total}`}>
      <DiceDisplay number={firstPart} color={firstColor} size={size} />
      <DiceDisplay number={secondPart} color={secondColor} size={size} />
    </div>
  );
}

/**
 * DiceComparison Component
 * 
 * Shows comparison with result
 * Used for showing full equation: 5 + 2 = 7
 */
interface DiceComparisonProps {
  number1: number;
  number2: number;
  result: number;
  operation: '+' | '-';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DiceComparison({
  number1,
  number2,
  result,
  operation,
  size = 'md',
  className
}: DiceComparisonProps) {
  return (
    <div className={cn("flex items-center gap-4 flex-wrap justify-center", className)} data-testid={`dice-comparison-${result}`}>
      <DiceDisplay number={number1} color="red" size={size} />
      <span className="text-2xl font-bold text-muted-foreground mx-1">{operation}</span>
      <DiceDisplay number={number2} color="blue" size={size} />
      <span className="text-2xl font-bold text-muted-foreground mx-1">=</span>
      <DiceDisplay number={result} color="green" size={size} />
    </div>
  );
}
