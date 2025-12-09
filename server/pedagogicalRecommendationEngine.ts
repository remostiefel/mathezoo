/**
 * HEILPÄDAGOGISCHES EMPFEHLUNGSSYSTEM
 * 
 * Verknüpft Fehleranalyse mit konkreten Spiel-Empfehlungen aus 9 Spielen:
 * 
 * 🔢 ZAHLEN VERSTEHEN (4 Spiele):
 * - Zahlenwaage: Größenvergleich, Zahldarstellungen
 * - Zahlen-Treppe: Zahlenreihe, Ordnungsrelationen
 * - Zahlen-Baumeister: Stellenwertverständnis (H-Z-E)
 * - Zoo-Nachbarn: Vorgänger/Nachfolger, Zahlenraum
 * 
 * ➕ CLEVER RECHNEN (3 Spiele):
 * - 10 gewinnt!: Partnerzahlen zur 10, Automatisierung
 * - Zerlegungs-Safari: Zahlzerlegung, Teilmengen
 * - Verdoppel-Expedition: Kernaufgaben, Verdopplungen
 * 
 * 🎯 RECHENMEISTER (2 Spiele):
 * - Zoo-Abenteuer: Addition/Subtraktion ZR20, gemischte Aufgaben
 * - Zoo-Pfadfinder: Strategiewahl, elegante Rechenwege
 * 
 * Für Lehrpersonen: Didaktische Einschätzung + direkt umsetzbare Förderung
 * mit tier-zoo-situativen Begründungen und kindgerechten Erklärungen.
 */

import type { ErrorType } from './errorAnalyzer';
import type { GameId } from '../shared/game-levels';

export interface GameRecommendation {
  gameId: GameId;
  gameName: string;
  recommendedLevel: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  focusArea: string;
  emoji: string;
  zooStory?: string; // Spielerische Tier-Geschichte
  exampleTask?: string; // Konkretes Beispiel
  childExplanation?: string; // Kindgerechte Erklärung
}

export interface PedagogicalRecommendation {
  errorType: ErrorType;
  errorLabel: string;
  didacticExplanation: string;
  developmentalGoal: string;
  gameRecommendations: GameRecommendation[];
  materialSupport: string[];
  teacherScript: string;
}

/**
 * FEHLERTYP → SPIEL-MAPPING
 * Wissenschaftlich fundierte Zuordnung basierend auf mathematikdidaktischer Forschung
 */
const ERROR_TO_GAMES_MAP: Record<ErrorType, {
  primary: Array<{ game: GameId; level: number; reason: string }>;
  secondary: Array<{ game: GameId; level: number; reason: string }>;
  didacticGoal: string;
  materialSupport: string[];
  teacherScript: string;
}> = {
  // ===== ZÄHLFEHLER (±1, ±2) =====
  'counting_error_minus_1': {
    didacticGoal: 'Ablösung vom zählenden Rechnen durch Rechenstrategien',
    primary: [
      {
        game: 'quantity-master',
        level: 1,
        reason: 'Vorläuferfertigkeiten nach Dornheim: Subitizing & Mengenerfassung',
        zooStory: '🦊 Der schlaue Fuchs flüstert: "Bevor du zählst, schau genau hin! Manche Mengen erkennst du auf einen Blick!"',
        exampleTask: 'Blitzblick-Training: Punkte simultan erfassen statt zählen (1-4 Punkte in 500ms)',
        childExplanation: 'Trainiere dein Zahlen-Auge! Wie die Tiere im Zoo, die sofort sehen: "Das sind 3 Bananen!"'
      },
      { 
        game: 'ten-wins', 
        level: 1, 
        reason: 'Automatisierung der Partnerzahlen zur 10',
        zooStory: '🎯 Der schlaue Fuchs flüstert dir einen Geheimtrick zu: "Wenn du zur 10 hüpfst, brauchst du nicht mehr zu zählen!" Er zwinkert: "7 und 3 macht 10 - das weiß ich im Schlaf!"',
        exampleTask: 'Stell dir vor: Bei 8+5 überlegst du: 8 braucht 2 bis zur 10, dann noch 3 dazu = 13',
        childExplanation: 'Anstatt mühsam weiterzuzählen (9, 10, 11, 12, 13), springst du clever zur 10 und hüpfst dann weiter!'
      },
      { 
        game: 'doubling', 
        level: 1, 
        reason: 'Kernaufgaben (Verdopplungen) automatisieren',
        zooStory: '👯 Die Zwillings-Pinguine watscheln aufgeregt herbei und rufen: "Hilf uns! Wenn jeder von uns 5 Fische bekommt, wie viele schwimmen dann in unserem Bauch?"',
        exampleTask: 'Schau mal: 5+5=10, 6+6=12, 7+7=14 - diese Aufgaben sind wie Zwillinge, sie gehören zusammen!',
        childExplanation: 'Wenn du diese Aufgaben auswendig kennst, werden sie zu deinen Helfern: 6+7? Das ist fast wie 6+6, nur 1 mehr!'
      },
      { 
        game: 'decomposition', 
        level: 1, 
        reason: 'Zerlegungsstrategien statt Zählen',
        zooStory: '🧩 Der quirlige Affe hängt kopfüber vom Ast und erklärt stolz: "7 Bananen? Die teile ich auf: 5+2, oder 4+3, oder 6+1 - viele Wege führen zur Lösung!"',
        exampleTask: 'Probiere es: 8+6 verwandelt sich in 8+2+4 (erst zur 10, dann noch 4 dazu)',
        childExplanation: 'Zahlen sind wie Puzzles - du darfst sie in Teile zerlegen, die viel leichter zu rechnen sind!'
      }
    ],
    secondary: [
      { 
        game: 'zoo-adventure', 
        level: 2, 
        reason: 'Strategieanwendung in spielerischem Kontext',
        zooStory: '🦁 Im Zoo-Abenteuer warten viele Tiere darauf, dass du ihnen mit deinen Rechen-Tricks hilfst!',
        childExplanation: 'Hier kannst du alle Tricks ausprobieren, die du gelernt hast!'
      },
      { 
        game: 'pathfinder', 
        level: 1, 
        reason: 'Mehrere Lösungswege erkennen',
        zooStory: '🗺️ Der Elefant kennt viele Wege durch den Zoo - genauso gibt es viele Wege zum richtigen Ergebnis!',
        childExplanation: 'Du darfst selbst entscheiden, welcher Rechenweg dir am besten gefällt!'
      }
    ],
    materialSupport: [
      'Zwanzigerfeld (strukturierte Fünfergruppen)',
      'Rechenkette mit farbigen Fünfer-Blöcken',
      'Blitzrechenkarten für Kernaufgaben'
    ],
    teacherScript: 'Statt "Zähle weiter" → "Welchen Trick kannst du nutzen? Hilft dir die 5 oder die 10?"'
  },

  'counting_error_plus_1': {
    didacticGoal: 'Ablösung vom zählenden Rechnen durch Rechenstrategien',
    primary: [
      { game: 'ten-wins', level: 1, reason: 'Automatisierung der Partnerzahlen zur 10' },
      { game: 'doubling', level: 1, reason: 'Kernaufgaben (Verdopplungen) automatisieren' },
      { game: 'decomposition', level: 2, reason: 'Zerlegungsstrategien entwickeln' }
    ],
    secondary: [
      { game: 'zoo-adventure', level: 2, reason: 'Strategieanwendung üben' },
      { game: 'pathfinder', level: 1, reason: 'Elegante Rechenwege finden' }
    ],
    materialSupport: [
      'Zwanzigerfeld (strukturierte Fünfergruppen)',
      'Rechenkette mit farbigen Fünfer-Blöcken',
      'Blitzrechenkarten für Kernaufgaben'
    ],
    teacherScript: 'Statt "Zähle genauer" → "Wie kannst du clever rechnen? Nutze die Kraft der 5!"'
  },

  'counting_error_minus_2': {
    didacticGoal: 'DRINGEND: Strategien statt Zählen im ZR10 festigen',
    primary: [
      { game: 'zahlenwaage', level: 1, reason: 'Grundlegendes Zahlverständnis aufbauen' },
      { game: 'ten-wins', level: 1, reason: 'Partnerzahlen zur 10 intensiv üben' },
      { game: 'decomposition', level: 1, reason: 'Zahlen zerlegen statt zählen' }
    ],
    secondary: [
      { game: 'number-builder', level: 1, reason: 'Zahlen konkret bauen (Stellenwert)' },
      { game: 'doubling', level: 1, reason: 'Kernaufgaben als Anker' }
    ],
    materialSupport: [
      'Zwanzigerfeld (ESSENTIELL für Strukturierung)',
      'Rechenkette (haptisches Zählen mit Selbstkontrolle)',
      'Dienes-Material (Bündelungsverständnis)',
      'Finger-Bilder für Zahlen bis 10'
    ],
    teacherScript: 'KLEIN ANFANGEN! Erst ZR5, dann ZR10. "Zeig mir die 5 mit deinen Fingern. Wie machst du die 7?"'
  },

  'counting_error_plus_2': {
    didacticGoal: 'DRINGEND: Strategien statt Zählen im ZR10 festigen',
    primary: [
      { game: 'zahlenwaage', level: 1, reason: 'Grundlegendes Zahlverständnis aufbauen' },
      { game: 'ten-wins', level: 1, reason: 'Partnerzahlen zur 10 intensiv üben' },
      { game: 'decomposition', level: 1, reason: 'Zahlen zerlegen statt zählen' }
    ],
    secondary: [
      { game: 'number-builder', level: 1, reason: 'Zahlen konkret bauen (Stellenwert)' },
      { game: 'doubling', level: 1, reason: 'Kernaufgaben als Anker' }
    ],
    materialSupport: [
      'Zwanzigerfeld (ESSENTIELL für Strukturierung)',
      'Rechenkette (haptisches Zählen mit Selbstkontrolle)',
      'Dienes-Material (Bündelungsverständnis)',
      'Finger-Bilder für Zahlen bis 10'
    ],
    teacherScript: 'KLEIN ANFANGEN! Erst ZR5, dann ZR10. "Zeig mir die 5 mit deinen Fingern. Wie machst du die 7?"'
  },

  // ===== OPERATIONS-VERWECHSLUNG =====
  'operation_confusion': {
    didacticGoal: 'Bewusste Unterscheidung von + und - entwickeln',
    primary: [
      { 
        game: 'zoo-adventure', 
        level: 1, 
        reason: 'Plus und Minus visuell unterschieden (grüne/rote Gehege)',
        zooStory: '🦁 Der Löwe brüllt majestätisch: "In meinem Zoo gibt es grüne Gehege, wo Tiere ankommen (+), und rote Gehege, wo sie sich verabschieden (-)! Schau dir die Farbe genau an!"',
        exampleTask: 'Denk daran: Grünes Gehege mit 5+3 bedeutet "3 Tiere kommen fröhlich dazu", rotes Gehege mit 8-2 bedeutet "2 Tiere gehen schlafen"',
        childExplanation: 'Plus ist wie eine Willkommensparty - mehr Tiere kommen! Minus ist wie Schlafenszeit - es werden weniger!'
      },
      { 
        game: 'zahlenwaage', 
        level: 2, 
        reason: 'Addition/Subtraktion als Ausgleich verstehen',
        zooStory: '⚖️ Die elegante Giraffe streckt ihren langen Hals und erklärt sanft: "Siehst du die Waage? Links und rechts müssen im Gleichgewicht sein! Mit + fügst du Gewicht hinzu, mit - nimmst du welches weg."',
        exampleTask: 'Versuch es: 5+3=8 bedeutet "links startest du mit 5, dann kommen 3 dazu, rechts entsteht 8"',
        childExplanation: 'Die Waage zeigt dir das Geheimnis: Plus macht schwerer, Minus macht leichter - wie Magie!'
      }
    ],
    secondary: [
      { 
        game: 'pathfinder', 
        level: 1, 
        reason: 'Operation bewusst benennen vor Rechnen',
        zooStory: '🗺️ Der kluge Elefant sagt: "Bevor du losgehst, schau auf das Zeichen! Ist es ein + oder ein -?"',
        childExplanation: 'Sag dir selbst laut: "Das ist Plus!" oder "Das ist Minus!" - dann machst du keinen Fehler!'
      },
      { 
        game: 'decomposition', 
        level: 2, 
        reason: 'Umkehraufgaben erkennen (8+5 ist umgekehrt 13-5)',
        zooStory: '🧩 Der Affe zeigt dir: "8+5=13 ist wie ein Zaubertrick rückwärts: 13-5=8!"',
        childExplanation: 'Plus und Minus sind wie Freunde - sie gehören zusammen und können sich gegenseitig helfen!'
      }
    ],
    materialSupport: [
      'Farbcodierung: + = GRÜN (hinzufügen), - = ROT (wegnehmen)',
      'Bewegungs-Gesten: + = Arme ausbreiten, - = Arme zusammen',
      'Lautsprecher-Symbol: Operation VOR Rechnen benennen lassen'
    ],
    teacherScript: '"STOPP! Welches Zeichen steht da? Zeig mir mit deinen Armen: Plus oder Minus?"'
  },

  // ===== TIPPFEHLER =====
  'input_error': {
    didacticGoal: 'Selbstkontrolle und sorgfältige Eingabe',
    primary: [
      { game: 'ten-wins', level: 2, reason: 'Schnelles Rechnen MIT Selbstkontrolle' },
      { game: 'pathfinder', level: 2, reason: 'Ergebnis bewusst überprüfen' }
    ],
    secondary: [
      { game: 'zoo-adventure', level: 3, reason: 'Erfolgserlebnis - mathematisches Verständnis ist vorhanden!' }
    ],
    materialSupport: [
      'Checkliste: "Habe ich das Ergebnis nochmal angeschaut?"',
      'Selbst-Check-Karte: "Macht die Antwort Sinn?"'
    ],
    teacherScript: '"Dein Rechenweg ist richtig! Schau nochmal genau auf deine Antwort."'
  },

  // ===== STELLENWERT-FEHLER =====
  'place_value': {
    didacticGoal: 'Stellenwertverständnis (Zehner-Einer-Prinzip) aufbauen',
    primary: [
      { 
        game: 'number-builder', 
        level: 2, 
        reason: 'Zehner und Einer konkret bauen',
        zooStory: '🏗️ Der fleißige Biber nagt an einem Stamm und meint stolz: "Mein Haus braucht große Stämme (Zehner) und kleine Äste (Einer). Bei der Zahl 23 verbaue ich 2 dicke Stämme und 3 dünne Ästchen!"',
        exampleTask: 'Bau es nach: 35 = 3 Zehnerstangen + 5 Einerwürfel. Oder probiere: 47 = 4 Zehnerstangen + 7 Einerwürfel',
        childExplanation: 'Stell dir vor: Zehner sind riesige Pakete mit je 10 Dingen drin, Einer sind einzelne Schätze. Bei 23 hast du 2 Pakete und 3 Einzelstücke!'
      },
      { 
        game: 'number-stairs', 
        level: 2, 
        reason: 'Zahlenraum strukturiert ordnen',
        zooStory: '🪜 Das flinke Känguru hüpft aufgeregt die Zahlentreppe hinauf und jubelt: "Bei 10, 20, 30, 40 mache ich RIESIGE Sprünge - das sind die Zehner-Etappen!"',
        exampleTask: 'Beobachte genau: Von 28 zu 29 ist ein Minischritt (nur 1 Einer), von 29 zu 30 ist ein Mega-Zehner-Sprung!',
        childExplanation: 'Die Treppe verrät dir ein Geheimnis: Immer genau 10 Stufen bilden zusammen einen Zehner!'
      },
      { 
        game: 'zahlenwaage', 
        level: 3, 
        reason: 'Stellenwert als Gewichts-Verhältnis (1 Zehner = 10 Einer)',
        zooStory: '⚖️ Die kraftvolle Giraffe hebt den Kopf und verkündet: "Ein einzelner Zehner wiegt genauso viel wie 10 Einer zusammen! Beobachte, wie die Waage im Gleichgewicht bleibt!"',
        exampleTask: 'Teste es selbst: 1 Zehnerstange wiegt exakt gleich viel wie 10 Einerwürfel auf der anderen Waagschale',
        childExplanation: 'Ein Zehner ist kein einfacher Buchstabe - es sind 10 Einer, die sich zu einem Superpaket verbündet haben!'
      }
    ],
    secondary: [
      { 
        game: 'decomposition', 
        level: 3, 
        reason: 'Zahlen in Zehner+Einer zerlegen',
        zooStory: '🧩 Der Affe packt Bananen: "56 Bananen = 5 Kisten mit je 10 Bananen + 6 einzelne Bananen!"',
        childExplanation: 'Jede Zahl kannst du in Zehner und Einer aufteilen - das hilft beim Rechnen!'
      },
      { 
        game: 'zoo-adventure', 
        level: 4, 
        reason: 'Anwendung im ZR20 mit Übergang',
        zooStory: '🦁 Im Zoo-Abenteuer warten Tiere, denen du mit deinem Zehner-Wissen helfen kannst!',
        childExplanation: 'Hier kannst du dein Zehner-Wissen in echten Aufgaben ausprobieren!'
      }
    ],
    materialSupport: [
      'Dienes-Blöcke (Einer-Würfel, Zehner-Stangen)',
      'Stellenwerttafel (Z | E)',
      'Hunderterfeld (Zehner-Reihen sichtbar machen)',
      'Bündelungs-Spiel: 10 Einer gegen 1 Zehner tauschen'
    ],
    teacherScript: '"Wie viele Zehner hat 37? Wie viele Einer? Lass uns das mit Material bauen!"'
  },

  // ===== UM-10-DANEBEN (differenziert) =====
  'off_by_ten_minus': {
    didacticGoal: 'Zehner bewusst machen - systematisches Zerlegen üben',
    primary: [
      { game: 'number-builder', level: 3, reason: 'Zehner-Einer-Zerlegung visualisieren' },
      { game: 'ten-wins', level: 3, reason: 'Zehnerübergang automatisieren' },
      { game: 'decomposition', level: 3, reason: 'Systematische Zerlegung (23 = 20+3)' }
    ],
    secondary: [
      { game: 'number-stairs', level: 3, reason: 'Zehnersprünge auf Zahlenstrahl' },
      { game: 'zoo-adventure', level: 5, reason: 'Zehnerübergang in Aufgaben' }
    ],
    materialSupport: [
      'Rechenkette mit farbigen Zehnern',
      'Hunderterfeld (Zehnersprünge visualisieren)',
      'Stellenwerttafel (Zehner separat betrachten)',
      '"Zehner-Lupe": Zehner ZUERST rechnen, dann Einer'
    ],
    teacherScript: '"Zerlege 47: Wie viele Zehner? (40) Wie viele Einer? (7). Jetzt rechne erst mit Zehnern!"'
  },

  'off_by_ten_plus': {
    didacticGoal: 'Zehner nicht doppelt zählen - systematisches Vorgehen',
    primary: [
      { game: 'number-builder', level: 3, reason: 'Zehner-Einer-Zerlegung visualisieren' },
      { game: 'ten-wins', level: 3, reason: 'Zehnerübergang mit Kontrolle' },
      { game: 'decomposition', level: 3, reason: 'Schritt-für-Schritt-Zerlegung' }
    ],
    secondary: [
      { game: 'pathfinder', level: 3, reason: 'Elegante Rechenwege (doppelten Zehner vermeiden)' },
      { game: 'zoo-adventure', level: 5, reason: 'Selbstkontrolle bei Zehnerübergang' }
    ],
    materialSupport: [
      'Rechenkette: Zehnersprünge ZÄHLEN ("Wie oft springe ich über einen Zehner?")',
      'Hunderterfeld: "Wo lande ich bei +10?"',
      'Kontrollfragen-Karte: "Ist das Ergebnis zu groß? Habe ich einen Zehner doppelt?"'
    ],
    teacherScript: '"Kontrolliere: Macht 18+7=35 Sinn? Das wäre ja fast doppelt! Rechne nochmal Schritt für Schritt."'
  },

  // ===== KERNAUFGABEN-FEHLER (nach Wittmann & Gaidoschik) =====
  // ===== RECHENGESETZE-FEHLER =====
  'associative_grouping_error': {
    didacticGoal: 'ASSOZIATIVGESETZ verstehen: Geschicktes Gruppieren lernen (Wittmann: Operative Prinzipien)',
    primary: [
      {
        game: 'ten-wins',
        level: 2,
        reason: 'Partnerzahlen zur 10 als Basis für geschicktes Gruppieren',
        zooStory: '🎯 Der schlaue Fuchs zeigt dir einen Trick: "Bei 8+7+2 suche ich zuerst 8+2=10, dann +7=17! Das ist viel leichter als 8+7=15, dann +2!"',
        exampleTask: 'Vergleiche: (8+7)+2 vs. (8+2)+7 - welcher Weg ist geschickter?',
        childExplanation: 'Du darfst die Klammern verschieben! Suche dir die Zahlen, die zusammen 10 ergeben!'
      },
      {
        game: 'decomposition',
        level: 2,
        reason: 'Dreier-Summen mit geschickter Gruppierung üben',
        zooStory: '🧩 Der Affe jongliert mit drei Zahlen: "6+9+4 - ich rechne erst 6+4=10, dann +9=19!"',
        exampleTask: 'Rechne geschickt: 7+5+5 - welche zwei Zahlen rechnest du zuerst?',
        childExplanation: 'Bei drei Zahlen darfst du selbst entscheiden, welche du zuerst zusammenrechnest!'
      },
      {
        game: 'pathfinder',
        level: 2,
        reason: 'Verschiedene Gruppierungen vergleichen - Flexibilität entwickeln',
        zooStory: '🗺️ Der Elefant zeigt dir zwei Wege: "9+3+7 - Weg A: 9+3=12, dann +7=19. Weg B: 9+7=16, dann +3=19. Oder sogar: 3+7=10, dann +9=19!"',
        exampleTask: 'Finde DREI verschiedene Rechenwege für 8+6+4',
        childExplanation: 'Es gibt viele Wege zum Ziel - finde den, der für dich am leichtesten ist!'
      }
    ],
    secondary: [
      {
        game: 'zoo-adventure',
        level: 3,
        reason: 'Anwendung in echten Aufgaben'
      }
    ],
    materialSupport: [
      'Klammer-Karten: Zeige verschiedene Gruppierungen visuell',
      'Dreier-Päckchen mit geschickten Zerlegungen',
      'Farb-Codierung: Welche Zahlen gehören zusammen?',
      'Bewegungsspiel: Drei Kinder stellen Zahlen dar, wer fasst sich zuerst an?'
    ],
    teacherScript: '"Schau dir die drei Zahlen an: Welche zwei passen gut zusammen? Welche ergeben 10?"'
  },

  'commutative_confusion': {
    didacticGoal: 'KOMMUTATIVGESETZ bewusst machen: Tauschaufgaben sind gleichwertig',
    primary: [
      {
        game: 'ten-wins',
        level: 1,
        reason: 'Tauschaufgaben erkennen und nutzen',
        zooStory: '🎯 Der Fuchs zwinkert: "3+7 und 7+3 sind Zwillinge - sie haben dasselbe Ergebnis!"',
        exampleTask: 'Finde die Zwillings-Aufgabe zu 4+6',
        childExplanation: 'Bei Plus ist die Reihenfolge egal - 3+7 = 7+3!'
      },
      {
        game: 'doubling',
        level: 1,
        reason: 'Symmetrie bei Verdopplungen zeigen',
        zooStory: '👯 Die Zwillings-Pinguine erklären: "5+5 ist besonders - beide Zahlen sind gleich!"',
        childExplanation: 'Verdopplungen sind ihre eigenen Zwillinge!'
      }
    ],
    secondary: [
      {
        game: 'pathfinder',
        level: 1,
        reason: 'Tauschaufgaben bewusst wählen (den leichteren Weg)'
      }
    ],
    materialSupport: [
      'Tauschaufgaben-Paare visuell darstellen',
      'Kommutativ-Test: "Gilt das auch bei Minus?" (Nein!)',
      'Zwillings-Karten: Passende Paare finden'
    ],
    teacherScript: '"Drehe die Aufgabe um - wird sie leichter? 3+8 oder 8+3?"'
  },

  'distributive_decomposition_error': {
    didacticGoal: 'DISTRIBUTIVGESETZ-Vorstufe: Zerlegen als Vorbereitung für Multiplikation (später 7×9=7×10-7×1)',
    primary: [
      {
        game: 'decomposition',
        level: 2,
        reason: 'Zerlegen über Zehner als Vorstufe für Distributivgesetz',
        zooStory: '🧩 Der Affe erklärt: "8+7 zerlege ich: 8+2+5. Das ist wie ein Zauber-Trick, der später bei Mal-Aufgaben hilft!"',
        exampleTask: 'Zerlege 9+6 geschickt (Tipp: erst zur 10)',
        childExplanation: 'Zahlen auseinandernehmen hilft beim Rechnen - und später auch bei Mal-Aufgaben!'
      },
      {
        game: 'ten-wins',
        level: 2,
        reason: 'Partnerzahlen zur 10 als Basis für Zerlegung'
      }
    ],
    secondary: [
      {
        game: 'pathfinder',
        level: 3,
        reason: 'Verschiedene Zerlegungswege vergleichen'
      }
    ],
    materialSupport: [
      'Zerlegungs-Diagramme: 8+7 = 8+(2+5)',
      'Später: Multiplikations-Vorstufe zeigen (2×7 = 2×5 + 2×2)',
      'Visuelle Zerlegung mit Plättchen'
    ],
    teacherScript: '"Zerlege die zweite Zahl so, dass du erst zur 10 kommst - das ist dein Trick!"'
  },

  'doubling_error': {
    didacticGoal: 'Kernaufgaben automatisieren und als Herleite-Basis nutzen (Wittmann 2017, Gaidoschik 2014)',
    primary: [
      { 
        game: 'doubling', 
        level: 1, 
        reason: 'KERNAUFGABEN-Training: Verdopplungen als Basis für Herleiten',
        zooStory: '👯 Die Zwillings-Pinguine tanzen im Kreis und jauchzen: "Wir feiern ein Fest! Wenn jeder von uns 6 Fische bekommt, schwimmen zusammen 12 in unseren Bäuchen! Und wenn einer noch einen bekommt: 6+7? Das ist 6+6+1 = 13!"',
        exampleTask: 'KERNAUFGABEN (Wittmann): 1+1, 2+2, 3+3, 4+4, 5+5, 6+6, 7+7, 8+8, 9+9, 10+10 + HERLEITEN: 6+7=6+6+1, 8+9=8+8+1',
        childExplanation: 'Diese Aufgaben sind deine SUPERHELDEN! Wenn du sie kennst, kannst du ALLE anderen Aufgaben herleiten!'
      },
      { 
        game: 'ten-wins', 
        level: 2, 
        reason: 'Partnerzahlen zur 10 als Kernaufgaben (Gaidoschik: Grundaufgaben)',
        zooStory: '🎯 Der Fuchs wedelt begeistert mit dem Schwanz und erklärt: "5+5=10 ist die KÖNIGIN aller Aufgaben! Daraus kann ich ALLES herleiten: 5+6? Das ist 5+5+1 = 11! Und 6+4? Das ist auch 5+5, nur anders aufgeteilt!"',
        exampleTask: 'KERNAUFGABEN ZUR 10: 1+9, 2+8, 3+7, 4+6, 5+5 + HERLEITEN: 6+5 = 5+5+1 = 11, 7+4 = 4+4+3 = 11',
        childExplanation: 'Die 10 ist magisch! Wenn du alle Wege zur 10 kennst, kannst du BLITZSCHNELL alle Aufgaben bis 20 lösen!'
      },
      { 
        game: 'decomposition', 
        level: 2, 
        reason: 'Operative Zerlegung: Kernaufgaben als Anker für Herleiten (Wittmann: Operative Päckchen)',
        zooStory: '🧩 Der pfiffige Affe schwingt aufgeregt von Ast zu Ast: "Schau meine Trick-Kiste! 6+7? HERLEITEN: 6+6=12 (KERNAUFGABE!), dann +1 = 13. Oder: 7+7=14 (KERNAUFGABE!), dann -1 = 13. Zwei Wege, gleiches Ziel!"',
        exampleTask: 'HERLEITEN MIT KERNAUFGABEN: 7+8 → Weg 1: 7+7+1=15, Weg 2: 8+8-1=15. 9+6 → Weg 1: 9+9-3=15, Weg 2: 6+6+3=15',
        childExplanation: 'Du musst nicht ALLE Aufgaben auswendig lernen! Lerne die KERNAUFGABEN, dann kannst du den REST herleiten wie ein Detektiv!'
      },
      {
        game: 'pathfinder',
        level: 1,
        reason: 'Herleite-Wege vergleichen: Welche Kernaufgabe hilft am besten? (Analogiebildung nach Wittmann)',
        zooStory: '🗺️ Der weise Elefant zeigt dir DREI Wege: "7+8 kannst du lösen mit 7+7+1 ODER 8+8-1 ODER 7+3+5 (zur 10). Welcher Weg ist für DICH am leichtesten?"',
        exampleTask: 'VERGLEICHE HERLEITE-WEGE: 8+5 → (A) 8+8-3, (B) 5+5+3, (C) 8+2+3 (Zehner). Wähle DEINEN Lieblings-Weg!',
        childExplanation: 'Es gibt VIELE Wege zum Ziel! Finde heraus, welche Kernaufgabe DIR am besten hilft!'
      }
    ],
    secondary: [
      { 
        game: 'zoo-adventure', 
        level: 3, 
        reason: 'Anwendung: Herleiten in echten Aufgaben',
        zooStory: '🦁 Im Zoo warten Tiere, die deine HERLEITE-Tricks sehen wollen!',
        childExplanation: 'Zeig den Tieren, wie du von Kernaufgaben ableitest!'
      },
      {
        game: 'number-builder',
        level: 2,
        reason: 'Analogiebildung: 3+4 → 13+4 → 23+4 (Stellenwert-Analogie nach Wittmann)',
        zooStory: '🏗️ Der Biber baut Muster: "Wenn 3+4=7, dann ist 13+4=17 und 23+4=27! Die EINER bleiben gleich!"',
        childExplanation: 'Kernaufgaben helfen auch bei GROSSEN Zahlen! 3+4=7 ist wie 33+4=37 - nur die Zehner ändern sich!'
      }
    ],
    materialSupport: [
      'KERNAUFGABEN-Poster: "Die 20 wichtigsten Aufgaben" (Verdopplungen + Partnerzahlen zur 10)',
      'Herleite-Karten: Zeige 2-3 Wege zur gleichen Lösung',
      'Analogie-Päckchen: 4+3, 14+3, 24+3 (Wittmann: Operative Päckchen)',
      'Rhythmische Sprechverse: "Doppelt-Plus-Eins-Trick: 6+7 ist 6+6 plus 1!"',
      'Finger-Symmetrie: Zeige Verdopplungen mit beiden Händen',
      'Herleite-Baum: Welche Kernaufgabe ist der Stamm? (visuell)',
      'Strategiekarten: "Welche Kernaufgabe hilft mir hier?"'
    ],
    teacherScript: '"Welche KERNAUFGABE kennst du, die DIR hier hilft? Zeig mir, wie du von der Kernaufgabe HERLEITEST! Das ist viel klüger als Auswendiglernen!"'
  },

  // ===== ZEHNER-STOPP-FEHLER =====
  'decade_boundary_confusion': {
    didacticGoal: 'Konstante Operation über den Zehner hinweg verstehen',
    primary: [
      { 
        game: 'decomposition', 
        level: 2, 
        reason: 'Schrittweises Subtrahieren mit konstanter Operation üben',
        zooStory: '🧩 Der kluge Affe schwingt aufgeregt von Ast zu Ast und warnt dich eindringlich: "Pass auf! Bei 14-6 ziehen wir IMMER ab - erst 4 weg bis zur 10, dann NOCHMAL 2 weg! Nie plötzlich dazugeben!"',
        exampleTask: 'Versuch es mit dem Affen: 14-6 = 14-4-2 = 10-2 = 8. Beide Male MINUS!',
        childExplanation: 'Stell dir vor: Du gehst 6 Schritte rückwärts. Nach 4 Schritten bist du bei 10 - aber du gehst WEITER rückwärts, nicht plötzlich vorwärts!'
      },
      { 
        game: 'number-stairs', 
        level: 2, 
        reason: 'Zahlenstrahl zeigt Rückwärtsbewegung über Zehner',
        zooStory: '🪜 Das Känguru hüpft die Treppe hinunter und ruft besorgt: "Wenn du bei 14 startest und 6 Stufen RUNTER hüpfst, gehst du auch nach der 10 noch RUNTER - nicht plötzlich hoch!"',
        exampleTask: 'Zeig es auf der Treppe: Start bei 14, spring 4 Stufen runter zur 10, dann WEITER 2 Stufen runter zur 8',
        childExplanation: 'Die Treppe zeigt dir: Minus bedeutet IMMER nach unten, auch wenn du über die 10 springst!'
      },
      { 
        game: 'ten-wins', 
        level: 2, 
        reason: 'Zehnerübergang mit klarer Richtungskonstanz',
        zooStory: '🎯 Der Fuchs tippt dir auf die Schulter und flüstert ernst: "Das Minus-Zeichen ist wie ein Magnet - es zieht dich IMMER rückwärts, auch nach dem Zehner!"',
        exampleTask: 'Bei 15-9 denke: "Erst 5 zurück zur 10 (minus!), dann nochmal 4 zurück (immer noch minus!) zur 6"',
        childExplanation: 'Die Operation wechselt NIEMALS mitten in der Aufgabe - Minus bleibt Minus!'
      }
    ],
    secondary: [
      { 
        game: 'zoo-adventure', 
        level: 3, 
        reason: 'Anwendung mit visueller Kontrolle',
        zooStory: '🦁 Im Zoo-Abenteuer kannst du bei jedem Schritt sehen, ob du vorwärts oder rückwärts gehst!',
        childExplanation: 'Hier übst du mit echten Aufgaben - und siehst immer, in welche Richtung du gehst!'
      },
      { 
        game: 'pathfinder', 
        level: 2, 
        reason: 'Bewusste Wegwahl: durchgehend subtrahieren',
        zooStory: '🗺️ Der Elefant zeigt dir den Weg: "Schau, beide Wege gehen rückwärts - einer über den Zehner, einer nicht. Aber BEIDE sind Rückwärtswege!"',
        childExplanation: 'Hier lernst du: Egal welcher Weg - Minus bleibt Minus!'
      }
    ],
    materialSupport: [
      'Zahlenstrahl mit Richtungspfeilen (beide Schritte zeigen rückwärts)',
      'Rechenkette: Färbe beide Subtraktionsschritte in derselben Farbe (z.B. rot)',
      'Zwanzigerfeld: Zeige beide Schritte mit Wegnehmen von Plättchen',
      'Sprachliche Begleitung: "Von 14 weg: erst 4 weg, dann nochmal 2 weg"',
      'Bewegungsspiel: Kind geht physisch rückwärts über den Zehner'
    ],
    teacherScript: '"Zeige mir mit deinem Körper: Du stehst bei 14 und gehst 6 Schritte rückwärts. Gehst du nach der 10 weiter rückwärts oder plötzlich vorwärts?"'
  },

  // ===== ZAHLENDREHER =====
  'digit_reversal': {
    didacticGoal: 'Zahlen korrekt lesen (Leserichtung links→rechts)',
    primary: [
      { game: 'number-stairs', level: 2, reason: 'Zahlen ordnen (Zahlverständnis)' },
      { game: 'number-builder', level: 2, reason: 'Zahlen konkret bauen (Stellenwert verstehen)' },
      { game: 'neighbors', level: 1, reason: 'Nachbarzahlen finden (Zahlenraum-Orientierung)' }
    ],
    secondary: [
      { game: 'zahlenwaage', level: 2, reason: 'Zahlen vergleichen (17 vs 71)' },
      { game: 'zoo-adventure', level: 2, reason: 'Zahlen VOR Rechnen laut vorlesen' }
    ],
    materialSupport: [
      'Zahlen-Karten mit Pfeil (Leserichtung markieren)',
      'Farb-Codierung: Zehner BLAU, Einer ROT',
      'Lautsprecher: "Lies die Zahl laut vor, bevor du rechnest"',
      'Stellenwerttafel zur Orientierung'
    ],
    teacherScript: '"Lies die Zahl laut vor. Zeige mir: Wo ist der Zehner? (links) Wo ist der Einer? (rechts)"'
  },

  // ===== KLEINERE-VON-GRÖSSERER-FEHLER =====
  'subtraction_reversal_at_ten': {
    didacticGoal: 'Richtung der Subtraktion beim Zehnerübergang verstehen',
    primary: [
      { 
        game: 'number-stairs', 
        level: 2, 
        reason: 'Zahlenstrahl zeigt Richtung: VON 10 WEG subtrahieren',
        zooStory: '🪜 Das Känguru springt die Treppe hinunter und ruft ernst: "Achtung! Bei 14-6 springst du erst zur 10, dann WEITER RUNTER um 2 Stufen! Du landest bei 8, nicht bei 2!"',
        exampleTask: 'Auf der Treppe sehen: Start 14, spring 4 runter zur 10, dann NOCHMAL 2 runter zur 8',
        childExplanation: 'Die 2 ist nicht das Ziel - du musst VON der 10 noch 2 Stufen RUNTER gehen!'
      },
      { 
        game: 'decomposition', 
        level: 2, 
        reason: 'Schrittweises Subtrahieren mit Sprachbegleitung üben',
        zooStory: '🧩 Der Affe zeigt deutlich: "14-6 bedeutet: Erst 4 weg, dann sind wir bei 10. Jetzt nochmal 2 WEG von der 10 - das macht 8!"',
        exampleTask: 'Sprich es laut mit: "Von 14 weg 4 = 10. Von 10 weg 2 = 8"',
        childExplanation: 'Das Wort "VON" ist wichtig - du ziehst VON der 10 noch 2 ab!'
      },
      { 
        game: 'ten-wins', 
        level: 2, 
        reason: 'Partnerzahlen festigen: 10-2=8, 10-4=6 automatisieren',
        zooStory: '🎯 Der Fuchs erklärt: "Lerne auswendig: Von 10 weg 2 macht 8! Von 10 weg 4 macht 6! Das brauchst du beim Zehnerübergang!"',
        exampleTask: 'Übe alle: 10-1=9, 10-2=8, 10-3=7, 10-4=6, ... bis du sie im Schlaf kannst',
        childExplanation: 'Wenn du diese Aufgaben kennst, machst du beim Zehnerübergang keine Fehler mehr!'
      }
    ],
    secondary: [
      { 
        game: 'zoo-adventure', 
        level: 3, 
        reason: 'Anwendung mit visueller Kontrolle',
        zooStory: '🦁 Im Zoo-Abenteuer siehst du bei jedem Schritt, wohin du gehst!',
        childExplanation: 'Hier übst du mit echten Aufgaben - und die Tiere zeigen dir den Weg!'
      },
      { 
        game: 'pathfinder', 
        level: 2, 
        reason: 'Bewusste Wegwahl: beide Schritte gehen rückwärts',
        zooStory: '🗺️ Der Elefant mahnt: "Denk dran: BEIDE Schritte bei der Subtraktion gehen rückwärts!"',
        childExplanation: 'Du gehst immer nur rückwärts, nie vorwärts bei Minus-Aufgaben!'
      }
    ],
    materialSupport: [
      'Zahlenstrahl mit Richtungspfeilen (beide Schritte zeigen rückwärts)',
      'Sprachliche Begleitung: "VON 10 WEG 2" statt nur "2"',
      'Zwanzigerfeld: Zeige 10 Plättchen, dann 2 wegnehmen → 8 bleiben',
      'Finger-Trick: Zeige 10 Finger, klappe 2 weg → 8 bleiben',
      'Bewegungsspiel: Kind steht bei 10, geht 2 Schritte rückwärts zur 8'
    ],
    teacherScript: '"Bei 14-6 gehst du zur 10, dann VON der 10 noch 2 WEG. Zeig mir mit deinem Körper: Wo landest du?"'
  },

  // ===== WEITERE FEHLER =====
  'other': {
    didacticGoal: 'Individuelle Diagnose durch Beobachtung',
    primary: [
      { game: 'zahlenwaage', level: 1, reason: 'Grundverständnis diagnostizieren' },
      { game: 'zoo-adventure', level: 1, reason: 'Strategienutzung beobachten' }
    ],
    secondary: [
      { game: 'pathfinder', level: 1, reason: 'Lösungswege vom Kind erklären lassen' },
      { game: 'decomposition', level: 1, reason: 'Flexibilität testen' }
    ],
    materialSupport: [
      'Diagnostisches Gespräch führen',
      'Lösungswege vom Kind erklären lassen',
      'Verschiedene Darstellungen anbieten'
    ],
    teacherScript: '"Erkläre mir, wie du gerechnet hast. Zeig mir deinen Weg!"'
  }
};

/**
 * HAUPTFUNKTION: Generiere heilpädagogische Empfehlung
 */
export function generatePedagogicalRecommendation(
  errorType: ErrorType,
  errorSeverity: 'minor' | 'moderate' | 'severe',
  studentLevel: number = 1,
  tasks: Array<{ timeTaken?: number, operation?: string, number1?: number, number2?: number, correctAnswer?: number, isCorrect?: boolean }> = [] // tasks parameter added for Scherer recommendations
): PedagogicalRecommendation {

  const mapping = ERROR_TO_GAMES_MAP[errorType];
  const errorLabel = getErrorLabel(errorType);

  // Didaktische Erklärung (kontextualisiert nach Schweregrad)
  const didacticExplanation = generateDidacticExplanation(errorType, errorSeverity);

  // Spiel-Empfehlungen (Level angepasst an Schüler-Level)
  const gameRecommendations: GameRecommendation[] = [];

  // Primary Games (hohe Priorität)
  mapping.primary.forEach(rec => {
    const adjustedLevel = Math.max(1, Math.min(8, studentLevel));
    gameRecommendations.push({
      gameId: rec.game,
      gameName: getGameName(rec.game),
      recommendedLevel: adjustedLevel,
      priority: 'high',
      reason: rec.reason,
      focusArea: mapping.didacticGoal,
      emoji: getGameEmoji(rec.game),
      zooStory: (rec as any).zooStory,
      exampleTask: (rec as any).exampleTask,
      childExplanation: (rec as any).childExplanation
    });
  });

  // Secondary Games (mittlere Priorität)
  mapping.secondary.forEach(rec => {
    const adjustedLevel = Math.max(1, Math.min(8, studentLevel + 1));
    gameRecommendations.push({
      gameId: rec.game,
      gameName: getGameName(rec.game),
      recommendedLevel: adjustedLevel,
      priority: 'medium',
      reason: rec.reason,
      focusArea: 'Vertiefung und Transfer',
      emoji: getGameEmoji(rec.game),
      zooStory: (rec as any).zooStory,
      exampleTask: (rec as any).exampleTask,
      childExplanation: (rec as any).childExplanation
    });
  });

  // SCHERER: Bei fehlendem quasi-simultanen Erfassen
  if (errorType.includes('counting') || tasks.filter(t => t.timeTaken && t.timeTaken > 5000).length > tasks.length * 0.6) {
    gameRecommendations.push({
      gameId: 'structured-perception', // Assuming 'structured-perception' is a valid GameId
      gameName: 'Strukturierte Wahrnehmung', // Assuming a name for the new game
      recommendedLevel: Math.max(1, studentLevel),
      priority: 'high',
      reason: 'Scherer: Kind zählt noch - braucht strukturierte Wahrnehmung',
      focusArea: 'Aufbau von quasi-simultanem Mengenerfassen, Basis für nicht-zählendes Rechnen',
      emoji: '🦅', // Assuming an emoji for the new game
      zooStory: '🦅 Der scharfsichtige Adler lehrt: "Schau genau hin! Erkenne die Muster, zähle nicht einzeln!"'
    });
  }

  // SCHERER: Bei Problemen mit Zehnerübergang = fehlendes Teil-Ganzes-Verständnis
  const tenCrossingErrors = tasks.filter(t => 
    !t.isCorrect && 
    t.operation === '+' && 
    t.number1 < 10 && 
    t.number2 < 10 && 
    t.correctAnswer && // Ensure correctAnswer exists before comparison
    t.correctAnswer > 10
  );

  if (tenCrossingErrors.length > 3) {
    gameRecommendations.push({
      gameId: 'part-whole-house', // Assuming 'part-whole-house' is a valid GameId
      gameName: 'Teil-Ganzes-Haus', // Assuming a name for the new game
      recommendedLevel: Math.max(1, studentLevel + 1),
      priority: 'high', // Changed from 'immediate' as it's not a defined priority type
      reason: 'Scherer: Zehnerübergang schwierig - fehlendes Teil-Ganzes-Verständnis',
      focusArea: 'Flexible Zahlzerlegung, Verständnis von 8+7 als 8+2+5',
      emoji: '🏠', // Assuming an emoji for the new game
      zooStory: '🏠 Der weise Biber baut Zahlenhäuser: "Jede Zahl hat viele Gesichter - entdecke sie alle!"'
    });
  }

  return {
    errorType,
    errorLabel,
    didacticExplanation,
    developmentalGoal: mapping.didacticGoal,
    gameRecommendations,
    materialSupport: mapping.materialSupport,
    teacherScript: mapping.teacherScript
  };
}

// ===== HILFSFUNKTIONEN =====

function getErrorLabel(errorType: ErrorType): string {
  const labels: Record<ErrorType, string> = {
    'counting_error_minus_1': 'Zählfehler: 1 zu wenig',
    'counting_error_plus_1': 'Zählfehler: 1 zu viel',
    'counting_error_minus_2': 'Zählfehler: 2 zu wenig',
    'counting_error_plus_2': 'Zählfehler: 2 zu viel',
    'operation_confusion': 'Plus/Minus verwechselt',
    'input_error': 'Tippfehler',
    'place_value': 'Stellenwert-Problem',
    'off_by_ten_minus': 'Um-10-daneben (zu wenig)',
    'off_by_ten_plus': 'Um-10-daneben (zu viel)',
    'doubling_error': 'Kernaufgaben-Fehler',
    'digit_reversal': 'Zahlendreher',
    'decade_boundary_confusion': 'Zehner-Stopp-Fehler',
    'other': 'Weiteres Muster'
  };
  return labels[errorType];
}

function generateDidacticExplanation(errorType: ErrorType, severity: 'minor' | 'moderate' | 'severe'): string {
  const baseExplanations: Record<ErrorType, string> = {
    'counting_error_minus_1': 'Das Kind nutzt noch zählendes Rechnen und stoppt zu früh. Dies zeigt, dass Rechenstrategien noch nicht automatisiert sind.',
    'counting_error_plus_1': 'Das Kind zählt zu weit und zeigt damit Abhängigkeit vom zählenden Rechnen. Strategien müssen gefördert werden.',
    'counting_error_minus_2': 'ALARMZEICHEN: Größere Zählfehler deuten auf fundamentale Unsicherheit im Zahlenraum hin.',
    'counting_error_plus_2': 'ALARMZEICHEN: Größere Zählfehler deuten auf fundamentale Unsicherheit im Zahlenraum hin.',
    'operation_confusion': 'Plus und Minus werden verwechselt - möglicherweise unaufmerksames Lesen oder fehlendes Zeichenverständnis.',
    'input_error': 'Kein mathematisches Problem! Eingabefehler bei korrektem Rechenverständnis.',
    'place_value': 'Fundamentales Stellenwertverständnis fehlt. Zehner und Einer werden nicht als getrennte Einheiten verstanden.',
    'off_by_ten_minus': 'Das Kind vergisst systematisch einen Zehner oder subtrahiert ihn fälschlicherweise.',
    'off_by_ten_plus': 'Das Kind zählt einen Zehner doppelt oder addiert ihn versehentlich.',
    'doubling_error': 'Kernaufgaben (Verdopplungen) sind nicht automatisiert. Diese sind aber Basis für viele Rechenstrategien!',
    'digit_reversal': 'Zahlen werden spiegelverkehrt gelesen/geschrieben. Ggf. visuelle Wahrnehmung prüfen.',
    'decade_boundary_confusion': 'SCHWERWIEGENDER KONZEPTFEHLER: Das Kind wechselt die Operation während der Rechnung. Es subtrahiert korrekt bis zum Zehner, addiert dann aber den Rest statt weiter zu subtrahieren. Dies zeigt fundamentale Verwirrung über die Konstanz von Rechenoperationen.',
    'other': 'Individuelles Fehlermuster - diagnostisches Gespräch erforderlich.'
  };

  let explanation = baseExplanations[errorType];

  // Schweregrad-Kontext hinzufügen
  if (severity === 'severe') {
    explanation += ' ⚠️ DRINGENDE FÖRDERUNG NÖTIG!';
  } else if (severity === 'moderate') {
    explanation += ' Gezielte Förderung empfohlen.';
  }

  return explanation;
}

function getGameName(gameId: GameId): string {
  const names: Record<GameId, string> = {
    'zahlenwaage': 'Zahlenwaage',
    'ten-wins': '10 gewinnt!',
    'number-stairs': 'Zahlen-Treppe',
    'number-builder': 'Zahlen-Baumeister',
    'decomposition': 'Zerlegungs-Safari',
    'doubling': 'Verdoppel-Expedition',
    'zoo-adventure': 'Zoo-Abenteuer',
    'pathfinder': 'Zoo-Pfadfinder',
    'neighbors': 'Zoo-Nachbarn',
    'structured-perception': 'Strukturierte Wahrnehmung', // Added for new game
    'part-whole-house': 'Teil-Ganzes-Haus' // Added for new game
  };
  return names[gameId];
}

function getGameEmoji(gameId: GameId): string {
  const emojis: Record<GameId, string> = {
    'zahlenwaage': '⚖️',
    'ten-wins': '🎯',
    'number-stairs': '🪜',
    'number-builder': '🏗️',
    'decomposition': '🧩',
    'doubling': '👯',
    'zoo-adventure': '🦁',
    'pathfinder': '🗺️',
    'neighbors': '🔢',
    'structured-perception': '🦅', // Added for new game
    'part-whole-house': '🏠' // Added for new game
  };
  return emojis[gameId];
}

/**
 * EXPORT für Storage/Routes
 */
export const pedagogicalRecommendationEngine = {
  generatePedagogicalRecommendation
};