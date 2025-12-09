// Lustige Team-Namen Generator für Kids - basierend auf Tier-Symbiosen!
// Mit Harmonien, Synergien und witzigen Team-Beschreibungen

export function generateTeamName(animalTypes: string[]): { name: string; description: string; synergy: string } {
  const sorted = [...animalTypes].sort().join('-');
  
  const teamGenerators: { [key: string]: { name: string; description: string; synergy: string } } = {
    // 2er Teams
    'giraffe-zebra': { 
      name: '🦒🦓 Hals & Streifen Freunde', 
      description: 'Die Giganten mit Superhals treffen die Schnellen mit Super-Mustern! Super Combo!',
      synergy: '🔗 SYNERGIEN: Giraffe sieht Gefahren von oben → Zebra flieht blitzschnell. Perfekt! Gemeinsam sind sie UNAUFHALTSAM auf der Savanne!'
    },
    'giraffe-lion': { 
      name: '🦁🦒 König & Hals-Team', 
      description: 'Der König reitet auf den Schultern des höchsten! Maximale Übersicht!',
      synergy: '🔗 SYNERGIEN: König bringt Kraft & Mut, Giraffe bringt Höhe & Übersicht. Zusammen: Unangreifbar! Das Team, vor dem ALLE Tiere Respekt haben!'
    },
    'zebra-lion': { 
      name: '🦓🦁 Streifen-König Bande', 
      description: 'Schnelle Streifen mit königlicher Kraft - die perfekte Jagdmeute!',
      synergy: '🔗 SYNERGIEN: Zebra überrascht mit Tempo, König mit Kraft. Die perfekte Jagd-Kombination! Keine Chance für die Gegner.'
    },
    'giraffe-elephant': { 
      name: '🦒🐘 Hals-Rüssel Power', 
      description: 'Der Hals erreicht alles oben, der Rüssel greift alles - unschlagbar!',
      synergy: '🔗 SYNERGIEN: Zwei Giganten mit unterschiedlichen Superkräften! Giraffe = Sichtweite (sieht alles), Elefant = Kraft (schafft alles). Unbesiegbar!'
    },
    'elephant-tiger': { 
      name: '🐯🐘 Tiger im Wald der Zwerge', 
      description: 'Der Tiger springt auf der Elefanten-Schulter - niemand sieht ihn kommen!',
      synergy: '🔗 SYNERGIEN: Elefant = Schild & Kraft, Tiger = Speed & Attache. Der Tiger reitet auf dem Riesen! Überraschungsangriffe FTW!'
    },
    'lion-tiger': { 
      name: '🐯🦁 Die zwei Großkatzen', 
      description: 'König & Tiger - wenn die zusammen brüllen, beben die Bäume!',
      synergy: '🔗 SYNERGIEN: Zwei Raubkatzen-Legenden! König ist Stratege, Tiger ist Taktiker. Zusammen: Die gefürchtetste Meute der Savanne!'
    },
    'panda-monkey': { 
      name: '🐼🐵 Panda-Affe Chaos-Duo', 
      description: 'Der lustige Panda mit dem kletternden Affen - ständig am Lachen!',
      synergy: '🔗 SYNERGIEN: Panda = Stark & Geduldig, Affe = Schnell & Lustig. Das wittigste Team! Sie werden deine Gegner mit Lachen besiegen!'
    },
    'koala-penguin': { 
      name: '🐨🐧 Schlaff-Kalt Team', 
      description: 'Der gemütliche Koala + der Pinguin aus dem Eis = lustigste Freunde ever!',
      synergy: '🔗 SYNERGIEN: Koala = Cool-bleiben, Pinguin = Eiskalt. Diese zwei Chill-Tiere bringen maximale RUHE ins Team. ENTSPANNUNG statt Chaos!'
    },
    'lion-elephant': { 
      name: '🦁🐘 König auf der Elefanten-Kanzel', 
      description: 'Der König sitzt oben, der Elefant trägt alles - Teamwork perfekt!',
      synergy: '🔗 SYNERGIEN: König lenkt die Strategie, Elefant liefert die Power! Perfektes Teamwork: Gehirn + Muskeln = Unaufhaltsam!'
    },
    
    // 3er Teams
    'elephant-giraffe-zebra': { 
      name: '🐘🦒🦓 Die Savanna Superhelden', 
      description: 'Stark wie ein Elefant, hoch wie die Giraffe, schnell wie ein Zebra - die Supercrew!',
      synergy: '🔗 TRIPLE-POWER: Elefant = Kraft, Giraffe = Sichtweite, Zebra = Tempo. ALLE drei Superfähigkeiten in EINEM Team! Unschlagbar! 💪👀⚡'
    },
    'lion-tiger-elephant': { 
      name: '🦁🐯🐘 Die Mega-Bestien', 
      description: 'Wenn die drei zusammen kommen, zittert die ganze Welt!',
      synergy: '🔗 TRIPLE-POWER: König = Mut, Tiger = Technik, Elefant = Macht. Das sind nicht nur die stärksten - das ist die LEGENDÄRE Tri-Force! 🌟'
    },
    'giraffe-lion-panda': { 
      name: '🦒🦁🐼 Der lustige Mix', 
      description: 'Der König, der Hals-Riese und der niedliche Panda - das Lacher-Team!',
      synergy: '🔗 TRIPLE-POWER: König führt, Giraffe sieht, Panda lacht! Balance zwischen Kraft, Übersicht und Humor. Das beste Team für jede Situation! 🎭'
    },
    'monkey-panda-koala': { 
      name: '🐵🐼🐨 Die Baum-Bande', 
      description: 'Klettern, quetschen, relaxen - alles von den Baum-Experten!',
      synergy: '🔗 TRIPLE-POWER: Affe = Beweglichkeit, Panda = Kraft, Koala = Weisheit. Die Baum-Meister! Sie kennen JEDEN Trick des Waldes! 🌳'
    },
    'zebra-leopard-lion': { 
      name: '🦓🐯🦁 Die Katzen-Familie mit Streifen', 
      description: 'Zwei Großkatzen + ein schnelles Streifen-Tier = Jagdperfekt!',
      synergy: '🔗 TRIPLE-POWER: Leopard = Geschick, Lion = Mut, Zebra = Flucht. Die perfekte Jagd-Kombo! Angriff + Verteidigung = WIN!'
    },
    'tiger-elephant-giraffe': { 
      name: '🐯🐘🦒 Das Tiger-Turbo-Trio', 
      description: 'Der Tiger springt, der Elefant pustet, die Giraffe sieht alles - unaufhaltsam!',
      synergy: '🔗 TRIPLE-POWER: Tiger = Attake, Elefant = Verteidigung, Giraffe = Intel. PERFEKTER Kreislauf! Angriff → Schutz → Information = KOMPLETT!'
    },
  };
  
  // Wenn genaue Kombination nicht vorhanden, generiere dynamisch
  const result = teamGenerators[sorted];
  if (result) return result;
  
  // Fallback für andere Kombinationen
  const animalEmojis: { [key: string]: string } = {
    giraffe: '🦒', zebra: '🦓', lion: '🦁', tiger: '🐯', elephant: '🐘',
    panda: '🐼', koala: '🐨', penguin: '🐧', monkey: '🐵'
  };
  
  const emojis = animalTypes.map(a => animalEmojis[a] || '🦁').join('');
  const adjectives = ['Super', 'Mega', 'Ultra', 'Turbo', 'Hyper', 'Ninja', 'Rocket'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  const names = animalTypes.map(a => {
    const nameMap: { [key: string]: string } = {
      giraffe: 'Giraffe', zebra: 'Zebra', lion: 'Löwe', tiger: 'Tiger', elephant: 'Elefant',
      panda: 'Panda', koala: 'Koala', penguin: 'Pinguin', monkey: 'Affe'
    };
    return nameMap[a] || a;
  }).join(' & ');
  
  return {
    name: `${emojis} ${adj} ${names}`,
    description: `Ein fabelhaftes Team aus ${names}! Sie ergänzen sich perfekt für unglaubliche Abenteuer!`,
    synergy: `🔗 SYNERGIEN: Jedes Tier bringt seine Superkraft mit! Zusammen sind sie stärker als einzeln. Das ist Teamwork! 🤝`
  };
}
