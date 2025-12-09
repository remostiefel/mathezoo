
// 🎓 MatheZoo Tipps & Fakten System
// Kombiniert mathematische Didaktik mit Tier-Wissen für maximales Engagement!

export type TipCategory = 'math_trick' | 'animal_fact' | 'record' | 'fun_question' | 'strategy' | 'motivation';
export type TipContext = 'game_start' | 'correct_answer' | 'wrong_answer' | 'level_up' | 'shop' | 'evolution' | 'idle';

export interface Tip {
  id: string;
  category: TipCategory;
  context: TipContext[];
  emoji: string;
  title: string;
  content: string;
  mathematicalConcept?: string;
  animalRelated?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  unlockLevel?: number;
}

// 🦁 Mathe-Tricks (Bruner, Gaidoschik, Krajewski-basiert)
export const MATH_TIPS: Tip[] = [
  {
    id: 'tip_power_of_five',
    category: 'math_trick',
    context: ['game_start', 'correct_answer'],
    emoji: '✋',
    title: 'Die Kraft der 5!',
    content: '8 + 7 ist schwer? Denk an deine Hände! 8 + 5 = 13, dann noch +2 = 15. Die 5 ist dein bester Freund!',
    mathematicalConcept: 'Zerlegung zur 5',
    difficulty: 'easy',
    unlockLevel: 1
  },
  {
    id: 'tip_decade_bridge',
    category: 'math_trick',
    context: ['game_start', 'wrong_answer'],
    emoji: '🌉',
    title: 'Die Zehner-Brücke',
    content: 'Über die 10 springen ist wie eine Brücke! 8 + 5: Erst zur 10 (8+2), dann weiter (+3) = 13!',
    mathematicalConcept: 'Zehnerübergang',
    difficulty: 'medium',
    unlockLevel: 3
  },
  {
    id: 'tip_doubles',
    category: 'math_trick',
    context: ['game_start', 'correct_answer'],
    emoji: '👯',
    title: 'Verdoppeln ist magisch!',
    content: '6 + 6 = 12 kennst du? Dann kennst du auch 6 + 7 = 13 (einfach +1 mehr)! Doppelungen sind Anker!',
    mathematicalConcept: 'Verdopplungsaufgaben als Anker',
    difficulty: 'easy',
    unlockLevel: 2
  },
  {
    id: 'tip_inverse',
    category: 'math_trick',
    context: ['wrong_answer', 'level_up'],
    emoji: '🔄',
    title: 'Umkehraufgaben',
    content: 'Wenn du 8 + 5 = 13 weißt, dann weißt du auch: 13 - 5 = 8! Das ist wie vor- und zurückgehen.',
    mathematicalConcept: 'Inverse Operationen',
    difficulty: 'medium',
    unlockLevel: 4
  },
  {
    id: 'tip_commutative',
    category: 'math_trick',
    context: ['game_start', 'correct_answer'],
    emoji: '🔀',
    title: 'Reihenfolge ist egal!',
    content: '3 + 8 ist genau gleich wie 8 + 3! Wähl immer die leichtere Richtung. Start beim größeren!',
    mathematicalConcept: 'Kommutativgesetz',
    difficulty: 'easy',
    unlockLevel: 1
  },
  {
    id: 'tip_patterns',
    category: 'math_trick',
    context: ['level_up', 'correct_answer'],
    emoji: '🦓',
    title: 'Zebra-Muster entdecken',
    content: 'Schau: 5+1=6, 5+2=7, 5+3=8... Das ist ein Päckchen! Muster helfen dir, schneller zu werden.',
    mathematicalConcept: 'Aufgabenpäckchen (Operative Beziehungen)',
    difficulty: 'medium',
    unlockLevel: 3
  },
  {
    id: 'tip_near_doubles',
    category: 'math_trick',
    context: ['game_start', 'wrong_answer'],
    emoji: '🎯',
    title: 'Fast-Verdopplungen',
    content: '7 + 8 ist fast wie 7 + 7! Rechne 7 + 7 = 14, dann +1 = 15. Nutze, was du kennst!',
    mathematicalConcept: 'Kernaufgaben-Erweiterung',
    difficulty: 'medium',
    unlockLevel: 4
  },
  {
    id: 'tip_visualization',
    category: 'strategy',
    context: ['wrong_answer', 'game_start'],
    emoji: '👀',
    title: 'Visualisiere es!',
    content: 'Wenn Zahlen schwer sind, stell sie dir vor! Zwanzigerfeld, Finger, Rechenkette - such dir dein Lieblings-Bild!',
    mathematicalConcept: 'Darstellungsvernetzung (Bruner)',
    difficulty: 'easy',
    unlockLevel: 1
  }
];

// 🐘 Tier-Fakten (wissenschaftlich fundiert, kind-gerecht)
export const ANIMAL_FACTS: Tip[] = [
  {
    id: 'fact_elephant_memory',
    category: 'animal_fact',
    context: ['correct_answer', 'level_up'],
    emoji: '🐘',
    title: 'Elefanten vergessen nie!',
    content: 'Elefanten haben ein unglaubliches Gedächtnis! Sie erkennen über 200 andere Elefanten - genau wie du Mathe-Muster lernst!',
    animalRelated: 'elephant',
    difficulty: 'easy'
  },
  {
    id: 'fact_penguin_swimming',
    category: 'animal_fact',
    context: ['correct_answer', 'evolution'],
    emoji: '🐧',
    title: 'Pinguine fliegen unter Wasser!',
    content: 'Pinguine können mit 35 km/h "schwimmen-fliegen"! Das ist so schnell wie ein Auto in der Stadt.',
    animalRelated: 'penguin',
    difficulty: 'easy'
  },
  {
    id: 'fact_octopus_hearts',
    category: 'animal_fact',
    context: ['correct_answer', 'shop'],
    emoji: '🐙',
    title: 'Oktopusse haben 3 Herzen!',
    content: 'Ein Oktopus hat 3 Herzen und blaues Blut! 2 Herzen pumpen Blut zu den Kiemen, 1 zum Körper. Verrückt, oder?',
    animalRelated: 'octopus',
    difficulty: 'medium'
  },
  {
    id: 'fact_cheetah_speed',
    category: 'record',
    context: ['correct_answer', 'level_up'],
    emoji: '🐆',
    title: 'Schnellstes Landtier!',
    content: 'Geparden laufen 120 km/h! Das ist schneller als die Autobahn erlaubt. Sie beschleunigen in 3 Sekunden von 0 auf 100!',
    animalRelated: 'cheetah',
    difficulty: 'easy'
  },
  {
    id: 'fact_giraffe_sleep',
    category: 'animal_fact',
    context: ['idle', 'game_start'],
    emoji: '🦒',
    title: 'Giraffen schlafen nur 30 Minuten!',
    content: 'Giraffen brauchen nur 30 Minuten Schlaf pro Tag - in 5-Minuten-Päckchen! Du brauchst mehr für dein Mathe-Gehirn 😴',
    animalRelated: 'giraffe',
    difficulty: 'easy'
  },
  {
    id: 'fact_dolphin_names',
    category: 'animal_fact',
    context: ['correct_answer', 'evolution'],
    emoji: '🐬',
    title: 'Delfine haben Namen!',
    content: 'Jeder Delfin hat einen eigenen Pfeif-Namen! Sie rufen sich gegenseitig beim Namen - wie du deine Freunde.',
    animalRelated: 'dolphin',
    difficulty: 'medium'
  },
  {
    id: 'fact_koala_sleep',
    category: 'record',
    context: ['idle', 'wrong_answer'],
    emoji: '🐨',
    title: 'Schlaf-Champion Koala!',
    content: 'Koalas schlafen 20-22 Stunden am Tag! Sie sind die Schlaf-Weltmeister. Zum Glück lernst du auch im Schlaf weiter!',
    animalRelated: 'koala',
    difficulty: 'easy'
  },
  {
    id: 'fact_owl_rotation',
    category: 'animal_fact',
    context: ['correct_answer', 'game_start'],
    emoji: '🦉',
    title: 'Eulen drehen Köpfe 270°!',
    content: 'Eulen können ihren Kopf fast ganz rum drehen - 270° (3/4 vom Kreis)! Das ist wie 3 · 90° - Mathe ist überall!',
    animalRelated: 'owl',
    difficulty: 'medium'
  },
  {
    id: 'fact_shark_teeth',
    category: 'record',
    context: ['correct_answer', 'level_up'],
    emoji: '🦈',
    title: 'Haie haben 5 Zahnreihen!',
    content: 'Haie haben mehrere Zahnreihen (bis zu 5!) und verlieren im Leben über 20.000 Zähne. Neue wachsen immer nach!',
    animalRelated: 'shark',
    difficulty: 'medium'
  },
  {
    id: 'fact_kangaroo_jump',
    category: 'record',
    context: ['correct_answer', 'evolution'],
    emoji: '🦘',
    title: 'Känguru-Weltrekord!',
    content: 'Kängurus springen bis zu 9 Meter weit und 3 Meter hoch! Das ist wie über 2 Autos zu hüpfen!',
    animalRelated: 'kangaroo',
    difficulty: 'easy'
  },
  {
    id: 'fact_flamingo_color',
    category: 'animal_fact',
    context: ['shop', 'evolution'],
    emoji: '🦩',
    title: 'Rosa durch Essen!',
    content: 'Flamingos sind rosa, weil sie rosafarbene Algen fressen! Du bist, was du isst - bei Flamingos stimmt das wirklich!',
    animalRelated: 'flamingo',
    difficulty: 'easy'
  },
  {
    id: 'fact_bat_echolocation',
    category: 'animal_fact',
    context: ['correct_answer', 'game_start'],
    emoji: '🦇',
    title: 'Fledermäuse "sehen" mit Schall!',
    content: 'Fledermäuse senden Ultraschall-Klicks und hören das Echo - so finden sie Insekten im Dunkeln. Das ist Echolokation!',
    animalRelated: 'bat',
    difficulty: 'medium'
  }
];

// 🎮 Motivations-Tipps
export const MOTIVATION_TIPS: Tip[] = [
  {
    id: 'motiv_mistakes_ok',
    category: 'motivation',
    context: ['wrong_answer'],
    emoji: '💪',
    title: 'Fehler sind super!',
    content: 'Jeder Fehler macht dein Gehirn stärker! Wissenschaftler sagen: Aus Fehlern lernt man am meisten. Also: Weiter so!',
    difficulty: 'easy'
  },
  {
    id: 'motiv_brain_grows',
    category: 'motivation',
    context: ['level_up', 'evolution'],
    emoji: '🧠',
    title: 'Dein Gehirn wächst!',
    content: 'Jedes Mal wenn du Mathe übst, wachsen neue Verbindungen in deinem Gehirn! Es wird buchstäblich schlauer. Cool, oder?',
    difficulty: 'easy'
  },
  {
    id: 'motiv_practice',
    category: 'motivation',
    context: ['game_start', 'idle'],
    emoji: '🎯',
    title: 'Übung macht den Meister!',
    content: 'Auch Löwen müssen jagen lernen! Niemand wird über Nacht zum Champion. Kleine Schritte = großer Erfolg!',
    difficulty: 'easy'
  },
  {
    id: 'motiv_own_pace',
    category: 'motivation',
    context: ['wrong_answer', 'game_start'],
    emoji: '🐢',
    title: 'Dein eigenes Tempo!',
    content: 'Schildkröten sind langsam, aber erreichen ihr Ziel! Jeder lernt anders schnell - wichtig ist, dass DU vorankommst!',
    difficulty: 'easy'
  },
  {
    id: 'motiv_curiosity',
    category: 'motivation',
    context: ['level_up', 'correct_answer'],
    emoji: '🔍',
    title: 'Sei neugierig!',
    content: 'Forscher stellen Fragen! Warum funktioniert das? Gibt es einen Trick? Neugier macht Mathe spannend!',
    difficulty: 'easy'
  }
];

// 🤔 Lustige Fragen (Rätsel & Denkanstöße)
export const FUN_QUESTIONS: Tip[] = [
  {
    id: 'question_math_nature',
    category: 'fun_question',
    context: ['idle', 'level_up'],
    emoji: '🌻',
    title: 'Mathe in der Natur?',
    content: 'Wusstest du? Sonnenblumen haben Spiralen: 21, 34, 55... Das sind Fibonacci-Zahlen! Mathe ist überall in der Natur!',
    difficulty: 'hard'
  },
  {
    id: 'question_zero_invented',
    category: 'fun_question',
    context: ['game_start', 'shop'],
    emoji: '0️⃣',
    title: 'Wer hat die 0 erfunden?',
    content: 'Die Zahl 0 wurde vor über 1500 Jahren in Indien erfunden! Davor gab es keine "Null". Verrückt, oder?',
    difficulty: 'medium'
  },
  {
    id: 'question_honeycomb',
    category: 'fun_question',
    context: ['correct_answer', 'evolution'],
    emoji: '🐝',
    title: 'Warum sind Bienenwaben sechseckig?',
    content: 'Bienen bauen Sechsecke, weil das die stärkste Form mit dem wenigsten Wachs ist! Mathe-Genie Bienen!',
    difficulty: 'medium'
  },
  {
    id: 'question_pi',
    category: 'fun_question',
    context: ['level_up', 'shop'],
    emoji: '🥧',
    title: 'Was ist Pi?',
    content: 'Pi (π ≈ 3,14) ist die magische Zahl des Kreises! Sie geht unendlich weiter: 3,14159265358979... Niemand kennt das Ende!',
    difficulty: 'hard'
  }
];

// 🎨 Alle Tipps zusammenführen
export const ALL_TIPS: Tip[] = [
  ...MATH_TIPS,
  ...ANIMAL_FACTS,
  ...MOTIVATION_TIPS,
  ...FUN_QUESTIONS
];

// 🎲 Tipps-Auswahl Engine
export function getRandomTip(
  context: TipContext,
  userLevel: number = 1,
  category?: TipCategory
): Tip | null {
  let filteredTips = ALL_TIPS.filter(tip => {
    const contextMatch = tip.context.includes(context);
    const levelMatch = !tip.unlockLevel || userLevel >= tip.unlockLevel;
    const categoryMatch = !category || tip.category === category;
    
    return contextMatch && levelMatch && categoryMatch;
  });

  if (filteredTips.length === 0) {
    // Fallback: Alle Tipps für den Context, ignoriere Level/Kategorie
    filteredTips = ALL_TIPS.filter(tip => tip.context.includes(context));
  }

  if (filteredTips.length === 0) return null;

  return filteredTips[Math.floor(Math.random() * filteredTips.length)];
}

// 🎯 Kontext-spezifische Tipp-Generierung
export function getTipForSituation(
  situation: 'correct' | 'wrong' | 'levelup' | 'start' | 'shop' | 'evolution' | 'idle',
  userLevel: number,
  preferredCategory?: TipCategory
): Tip | null {
  const contextMap: Record<typeof situation, TipContext> = {
    correct: 'correct_answer',
    wrong: 'wrong_answer',
    levelup: 'level_up',
    start: 'game_start',
    shop: 'shop',
    evolution: 'evolution',
    idle: 'idle'
  };

  return getRandomTip(contextMap[situation], userLevel, preferredCategory);
}

// 📊 Statistik: Welche Tipps wurden gezeigt?
export interface TipHistory {
  tipId: string;
  shownAt: Date;
  context: TipContext;
  wasHelpful?: boolean;
}

// 🎨 UI-Konfiguration für Tipps
export const TIP_UI_CONFIG = {
  math_trick: {
    bgGradient: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-400',
    iconBg: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  animal_fact: {
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-400',
    iconBg: 'bg-green-100',
    textColor: 'text-green-800'
  },
  record: {
    bgGradient: 'from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-400',
    iconBg: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  fun_question: {
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-400',
    iconBg: 'bg-purple-100',
    textColor: 'text-purple-800'
  },
  strategy: {
    bgGradient: 'from-indigo-50 to-blue-50',
    borderColor: 'border-indigo-400',
    iconBg: 'bg-indigo-100',
    textColor: 'text-indigo-800'
  },
  motivation: {
    bgGradient: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-400',
    iconBg: 'bg-pink-100',
    textColor: 'text-pink-800'
  }
};
