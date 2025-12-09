import { InsertCampaign } from "./schema";

export const STARTER_CAMPAIGNS: InsertCampaign[] = [
  {
    campaignName: "Rettung des Dschungels",
    description: "Hilf den Tieren des Dschungels! Eine epische Abenteuer-Reise mit 5 Leveln",
    storyText: "Der Dschungel ist in Gefahr! Die Tiere brauchen deine Hilfe, um die Waldgöttin zu wecken und das Gleichgewicht wiederherzustellen. Bist du bereit für ein großes Abenteuer?",
    emoji: "🌴",
    levels: [
      {
        levelNumber: 1,
        title: "Der Anfang",
        storyText: "Dein erstes Abenteuer beginnt. Meistere 3 einfache Aufgaben, um die Tiere kennenzulernen.",
        requirements: {
          gameType: "any",
          tasksToComplete: 3,
          minSuccessRate: 0.6
        }
      },
      {
        levelNumber: 2,
        title: "Zahlen-Treppe aufsteigen",
        storyText: "Klettere die Zahlen-Treppe hoch und erreiche den Gipfel des Dschungels!",
        requirements: {
          gameType: "number-stairs",
          tasksToComplete: 4,
          minSuccessRate: 0.7
        }
      },
      {
        levelNumber: 3,
        title: "Zoo-Nachbarn finden",
        storyText: "Finde die versteckten Tier-Nachbarn und lerne ihre Freundschaften kennen.",
        requirements: {
          gameType: "neighbor-game",
          tasksToComplete: 5,
          minSuccessRate: 0.65
        }
      },
      {
        levelNumber: 4,
        title: "Der Boss-Kampf",
        storyText: "Meistere die Zahlen-Treppe auf Level 8 - der schwierigste Test wartet!",
        requirements: {
          gameType: "number-stairs",
          gameLevel: 8,
          tasksToComplete: 1,
          minSuccessRate: 0.75
        }
      },
      {
        levelNumber: 5,
        title: "Finale: Waldheld",
        storyText: "Der Höhepunkt deiner Reise! Meistere 10 gemischte Aufgaben und rette den Dschungel!",
        requirements: {
          gameType: "any",
          tasksToComplete: 10,
          minSuccessRate: 0.7
        }
      }
    ],
    rewardAnimalType: "giraffe",
    rewardCoins: 500,
    rewardXP: 1000,
    unlockLevel: 1,
    displayOrder: 1
  },
  {
    campaignName: "Das Savannenabenteuer",
    description: "Erkunde die Savanne und sammle neue Freunde",
    storyText: "Die Savanne ruft! Eine neue Reise wartet mit anderen Tieren und neuen Herausforderungen.",
    emoji: "🦁",
    levels: [
      {
        levelNumber: 1,
        title: "Willkommen in der Savanne",
        storyText: "Erkunde die offenen Weiten und meistere deine ersten Aufgaben.",
        requirements: {
          gameType: "any",
          tasksToComplete: 5,
          minSuccessRate: 0.65
        }
      },
      {
        levelNumber: 2,
        title: "Zahlen-Baumeister",
        storyText: "Baue die Zahlen-Häuser und zeige dein Können!",
        requirements: {
          gameType: "number-builder",
          tasksToComplete: 6,
          minSuccessRate: 0.7
        }
      },
      {
        levelNumber: 3,
        title: "Zerlegungs-Safari",
        storyText: "Gehe auf Jagd nach den richtigen Zerlegungen!",
        requirements: {
          gameType: "decomposition-safari",
          tasksToComplete: 5,
          minSuccessRate: 0.65
        }
      },
      {
        levelNumber: 4,
        title: "Verdoppel-Expedition",
        storyText: "Verdopple dein Verständnis - meistere die schwierigeren Aufgaben!",
        requirements: {
          gameType: "doubling-expedition",
          tasksToComplete: 6,
          minSuccessRate: 0.7
        }
      },
      {
        levelNumber: 5,
        title: "Der König der Savanne",
        storyText: "Beweise deine Meisterschaft in 12 gemischten Aufgaben!",
        requirements: {
          gameType: "any",
          tasksToComplete: 12,
          minSuccessRate: 0.72
        }
      }
    ],
    rewardAnimalType: "zebra",
    rewardCoins: 600,
    rewardXP: 1200,
    unlockLevel: 3,
    displayOrder: 2
  },
  {
    campaignName: "Das Geheimnis der 1×1 Tempel",
    description: "Trainiere Multiplikation und wecke den magischen Tiger!",
    storyText: "Ein rätselhafter Tempel ist entdeckt worden! In seinen Kammern warten Multiplikations-Rätsel. Nur wer alle löst, kann den magischen Tiger befreien und sein Geheimnis lüften!",
    emoji: "🗿",
    levels: [
      {
        levelNumber: 1,
        title: "Die erste Kammer",
        storyText: "Betrete die erste Kammer des Tempels. Löse 8 Einmal-Eins Aufgaben um die erste Tür zu öffnen.",
        requirements: {
          gameType: "one-times-one",
          tasksToComplete: 8,
          minSuccessRate: 0.65
        }
      },
      {
        levelNumber: 2,
        title: "Rätsel der Zahlenpaare",
        storyText: "Die zweite Kammer zeigt dir Zahlenpaare. Meistere 10 Multiplikations-Aufgaben!",
        requirements: {
          gameType: "one-times-one",
          tasksToComplete: 10,
          minSuccessRate: 0.7
        }
      },
      {
        levelNumber: 3,
        title: "Der goldene Saal",
        storyText: "Du erreichst einen glänzenden Saal voller Goldmünzen. Beweise dein Wissen mit 12 schwierigeren Aufgaben!",
        requirements: {
          gameType: "one-times-one",
          tasksToComplete: 12,
          minSuccessRate: 0.68
        }
      },
      {
        levelNumber: 4,
        title: "Der Wächter erwacht",
        storyText: "Ein mystischer Wächter stellt dir 6 besonders schwere Fragen - nur der Beste kann hier siegen!",
        requirements: {
          gameType: "one-times-one",
          tasksToComplete: 6,
          minSuccessRate: 0.8
        }
      },
      {
        levelNumber: 5,
        title: "Die Befreiung des Tigers",
        storyText: "Die letzte Prüfung! Meistere 15 Aufgaben und befreie den magischen Tiger!",
        requirements: {
          gameType: "one-times-one",
          tasksToComplete: 15,
          minSuccessRate: 0.72
        }
      }
    ],
    rewardAnimalType: "tiger",
    rewardCoins: 700,
    rewardXP: 1500,
    unlockLevel: 5,
    displayOrder: 3
  },
  {
    campaignName: "Der große Zahlen-Wettbewerb",
    description: "Beweise dein Können in allen Spielen - werde Champion!",
    storyText: "Das jährliche Zahlen-Wettbewerb beginnt! Schüler aus ganz MatheZoo treten gegeneinander an. Schaffst du es, alle Prüfungen zu bestehen und zum großen Champion gekrönt zu werden?",
    emoji: "🏆",
    levels: [
      {
        levelNumber: 1,
        title: "Qualifikation: Zahlen-Vergleich",
        storyText: "In der ersten Runde musst du zeigen, dass du Zahlen verstehst. Meistere die Zahlenwaage 3x!",
        requirements: {
          gameType: "zahlenwaage",
          tasksToComplete: 3,
          minSuccessRate: 0.7
        }
      },
      {
        levelNumber: 2,
        title: "Halbfinale: Clever Rechnen",
        storyText: "Zeige deine Kopfrechentricks! Beende 10 Aufgaben aus verschiedenen Spielen mit mindestens 75% Erfolg.",
        requirements: {
          gameType: "any",
          tasksToComplete: 10,
          minSuccessRate: 0.75
        }
      },
      {
        levelNumber: 3,
        title: "Die große Herausforderung",
        storyText: "Meistere schwierige Aufgaben aus deinen Lieblingsspielen. 8 Aufgaben, 80% Erfolg - schaffst du es?",
        requirements: {
          gameType: "any",
          tasksToComplete: 8,
          minSuccessRate: 0.8
        }
      },
      {
        levelNumber: 4,
        title: "Das Championship Match",
        storyText: "Jetzt wird es ernst! Der Gegner ist stark. Löse 5 Aufgaben makellos!",
        requirements: {
          gameType: "any",
          tasksToComplete: 5,
          minSuccessRate: 0.9
        }
      },
      {
        levelNumber: 5,
        title: "Der Gewinner wird gekrönt",
        storyText: "Die finale Prüfung! 20 gemischte Aufgaben stehen zwischen dir und dem Titel 'Zahlen-Champion'!",
        requirements: {
          gameType: "any",
          tasksToComplete: 20,
          minSuccessRate: 0.75
        }
      }
    ],
    rewardAnimalType: "elephant",
    rewardCoins: 800,
    rewardXP: 1600,
    unlockLevel: 7,
    displayOrder: 4
  },
  {
    campaignName: "Die Rettung des Zahlenlandes",
    description: "Episches Finale - Rette die Zahlen vor dem Chaos!",
    storyText: "Das Zahlenland ist in Gefahr! Ein mystisches Chaos hat alle Zahlen durcheinandergebracht. Nur ein wahrer Zahlenheld kann das Durcheinander sortieren und die Welt retten. Bist du dieser Held?",
    emoji: "🌟",
    levels: [
      {
        levelNumber: 1,
        title: "Die erste Welle",
        storyText: "Das Chaos greift an! Erkenne die versteckten Zahlen-Muster. Blitzblick-Training aktiviert!",
        requirements: {
          gameType: "structured-perception",
          tasksToComplete: 8,
          minSuccessRate: 0.72
        }
      },
      {
        levelNumber: 2,
        title: "Die zweite Welle - Zerlegungs-Schlacht",
        storyText: "Die Zahlen zerfallen! Du musst sie mit dem richtigen Verständnis wieder zusammensetzen. 10 Aufgaben, höchste Konzentration!",
        requirements: {
          gameType: "decomposition-safari",
          tasksToComplete: 10,
          minSuccessRate: 0.75
        }
      },
      {
        levelNumber: 3,
        title: "Der Schutzwall",
        storyText: "Errichte einen Zahlen-Schutzwall! Kombiniere alle deine Fähigkeiten. 15 Mixed-Aufgaben mit 75% Erfolg!",
        requirements: {
          gameType: "any",
          tasksToComplete: 15,
          minSuccessRate: 0.75
        }
      },
      {
        levelNumber: 4,
        title: "Kampf gegen die Dunkelheit - BOSS",
        storyText: "Der letzte und stärkste Gegner wartet! Der Zahlen-Dämon stellt dir 7 ultimative Herausforderungen!",
        requirements: {
          gameType: "any",
          tasksToComplete: 7,
          minSuccessRate: 0.85
        }
      },
      {
        levelNumber: 5,
        title: "Die Erlösung - Das Finale",
        storyText: "Es geht um alles! Löse 25 Aufgaben mit deinem ganzen Herzen und rette das Zahlenland! Das Schicksal der Mathematik liegt in deinen Händen!",
        requirements: {
          gameType: "any",
          tasksToComplete: 25,
          minSuccessRate: 0.78
        }
      }
    ],
    rewardAnimalType: "phoenix",
    rewardCoins: 1000,
    rewardXP: 2000,
    unlockLevel: 10,
    displayOrder: 5
  }
];
