// 🎯 Tier-Namen Generator - Kreative Namen für Tiere!
// Generiert automatisch Namen basierend auf Tiertyp + kleine Variation

export type ZooAnimal =
  | 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'rhino' | 'hippo' | 'cheetah' | 'hyena' | 'ostrich'
  | 'meerkat' | 'buffalo' | 'antelope' | 'wildebeest' | 'gazelle'
  | 'monkey' | 'gorilla' | 'orangutan' | 'tiger' | 'leopard' | 'toucan' | 'parrot' | 'sloth'
  | 'jaguar' | 'tapir' | 'macaw' | 'tree_frog' | 'chameleon' | 'gibbon'
  | 'penguin' | 'polar_bear' | 'seal' | 'walrus' | 'arctic_fox'
  | 'reindeer' | 'narwhal' | 'beluga' | 'snow_owl' | 'arctic_hare'
  | 'panda' | 'red_panda' | 'koala' | 'peacock'
  | 'snow_leopard' | 'clouded_leopard' | 'golden_monkey'
  | 'rabbit' | 'fox' | 'deer' | 'hedgehog' | 'owl'
  | 'squirrel' | 'badger' | 'wild_boar' | 'lynx' | 'beaver'
  | 'camel' | 'snake' | 'scorpion' | 'fennec_fox'
  | 'roadrunner' | 'desert_tortoise' | 'iguana' | 'vulture'
  | 'dolphin' | 'shark' | 'octopus' | 'seahorse' | 'turtle' | 'jellyfish'
  | 'orca' | 'manta_ray' | 'clownfish' | 'sea_otter' | 'manatee' | 'starfish'
  | 'blue_whale' | 'hammerhead_shark' | 'pufferfish'
  | 'bat' | 'raccoon' | 'firefly'
  | 'sugar_glider' | 'kiwi' | 'tarsier' | 'aye_aye'
  | 'kangaroo' | 'wombat' | 'platypus'
  | 'tasmanian_devil' | 'echidna' | 'wallaby' | 'kookaburra'
  | 'eagle' | 'flamingo' | 'swan'
  | 'pelican' | 'stork' | 'crane' | 'hummingbird' | 'kingfisher' | 'hornbill'
  | 'crocodile' | 'alligator' | 'komodo_dragon' | 'gecko' | 'poison_dart_frog'
  | 'butterfly' | 'ladybug' | 'dragonfly' | 'praying_mantis';

const ANIMAL_NAME_TEMPLATES: Record<ZooAnimal, string[]> = {
  // Afrika - Große Tiere
  lion: ['König Leo', 'Simba', 'Mufasa', 'Raj', 'Kratos'],
  elephant: ['Dumbo', 'Babar', 'Gajraj', 'Jumbo', 'Elefino'],
  giraffe: ['Gerry', 'Hals-Meister', 'Langhalz', 'Patch', 'Spotty'],
  zebra: ['Marty', 'Streifenbande', 'Zorro', 'Blitz', 'Zeke'],
  rhino: ['Rhino', 'Panzernase', 'Stampfer', 'Krachboom', 'Rocky'],
  hippo: ['Henry', 'Nilpferd-Nick', 'Wassertank', 'Bruno', 'Plonk'],
  cheetah: ['Cheetara', 'Windpfeil', 'Sprint', 'Blitzkralle', 'Falke'],
  hyena: ['Hyäne-Hank', 'Lachendes Lachen', 'Hehe', 'Krächz', 'Joker'],
  ostrich: ['Orville', 'Schnellläufer', 'Flappy', 'Sprintus', 'Longo'],
  meerkat: ['Timon', 'Hakuna', 'Matata', 'Watcher', 'Kleine Brüder'],
  buffalo: ['Buffalo Bill', 'Hornos', 'Wildebeest-Boss', 'Stampede', 'Koloss'],
  antelope: ['Antilope Annie', 'Springbock', 'Gazelle-Gina', 'Swift', 'Flinker'],
  wildebeest: ['Wildi', 'Gnu-Guru', 'Herdenboss', 'Gnu-Naldo', 'Stürmer'],
  gazelle: ['Gazelle Gräfin', 'Anmut', 'Tänzerin', 'Leicht-Luft', 'Feder'],

  // Dschungel - Affen & Raubkatzen
  monkey: ['Affe-Alf', 'Affenmeister', 'Cheeky', 'Banana-Bandit', 'Klettermax'],
  gorilla: ['King Kong', 'Goliath', 'Gorilla-Gary', 'Silberrücken', 'Stark'],
  orangutan: ['Orang-O', 'Waldweiser', 'Äste-Akrobat', 'Rotfell', 'Waldkönig'],
  tiger: ['Tigris', 'Stripey', 'Orange-König', 'Flinkentatze', 'Tigger'],
  leopard: ['Leopard-Leo', 'Fleckenmeister', 'Nacht-Jäger', 'Schleich-Schleicher', 'Spot'],
  toucan: ['Toucans Timmy', 'Schnabel-Sam', 'Regenbogen-Ronnie', 'Loud', 'Beaker'],
  parrot: ['Papagei-Paul', 'Krächz-König', 'Bunte Beatrice', 'Quack-Quinn', 'Reddy'],
  sloth: ['Slowpoke-Sally', 'Faultier-Fred', 'Lazy-Larry', 'Relax', 'Entspanni'],
  jaguar: ['Jaguar-Jango', 'Nacht-Ninja', 'Flecken-Flinker', 'Dschungel-Dino', 'Spotted'],
  tapir: ['Tapir-Toni', 'Rüssel-Rolf', 'Dschungel-Diplomat', 'Schnuffi', 'Tappi'],
  macaw: ['Macaw-Mike', 'Farbkünstler', 'Großschnabel-Gustl', 'Schrei-Schatz', 'Blaumeister'],
  tree_frog: ['Frosch-Fritz', 'Hüpfer-Harry', 'Gift-Gina', 'Grünes Genie', 'Spring'],
  chameleon: ['Chamäleon-Charly', 'Farb-Zauberer', 'Versteck-Meister', 'Langsam-Leon', 'Farbmix'],
  gibbon: ['Gibbon-Gabe', 'Schwinger-Sunny', 'Äste-Akrobat', 'Lautes Lachen', 'Echo'],

  // Arktis/Antarktis
  penguin: ['Pingu', 'Waddle-Wade', 'Kälte-Käpt\'n', 'Eis-Einsteiger', 'Flipper'],
  polar_bear: ['Eisbär-Edgar', 'Eis-König', 'Schnee-Sultan', 'Frostbyte', 'Arktus'],
  seal: ['Siegel-Sam', 'Schnurrbart-Säufer', 'Flossenfreund', 'Walross-Willy', 'Süß'],
  walrus: ['Walross-Walter', 'Stoßzahn-Stan', 'Meer-Monolith', 'Walrus-Wald', 'Gemütlich'],
  arctic_fox: ['Fuchs-Franzi', 'Weiße Wunder', 'Schnee-Scout', 'Ohren-Otto', 'Flauschig'],
  reindeer: ['Rentier-Ronnie', 'Rentier-Rudi', 'Rennen-Rolf', 'Hirsch-Hasso', 'Rentier-Rainer'],
  narwhal: ['Narwal-Nando', 'Einhornwal', 'Stoßzahn-Stefan', 'Meerjungfrauen-Mythos', 'Spiralen-Sam'],
  beluga: ['Beluga-Bea', 'Weiße Wunder', 'Lächel-Lena', 'Meerjungfrau-Maja', 'Weiß-Wal'],
  snow_owl: ['Eule-Emil', 'Schnee-Sherlock', 'Weise-Waldtraut', 'Nacht-Nino', 'Flügel-Fritzl'],
  arctic_hare: ['Hase-Harald', 'Flausch-Flinker', 'Schnee-Springer', 'Ohr-Otto', 'Hüpfer-Hans'],

  // Bambuswald (Asien)
  panda: ['Panda-Paul', 'Bambus-Bär', 'Schwarz-Weiß-Waldemar', 'Süßer Schwabbelpo', 'Entspannter'],
  red_panda: ['Roter Racker', 'Panda-Patch', 'Flausch-Florian', 'Schwanz-Schwinger', 'Süßkling'],
  koala: ['Koala-Kevin', 'Eukalyptus-Eddi', 'Träumer-Thomas', 'Flausch-Frank', 'Baum-Bauer'],
  peacock: ['Pfau-Pepe', 'Prachtrad-Peter', 'Farben-Fürst', 'Stolz-Stefan', 'Schau-Mich'],
  snow_leopard: ['Schneeleopard-Sylvester', 'Flecken-Flinker', 'Berg-Geist', 'Stille-Silvia', 'Schnee-Sultan'],
  clouded_leopard: ['Clouded-Claus', 'Nebelfleck-Nina', 'Geheimnis-Gustav', 'Wald-Waldemar', 'Getarnt'],
  golden_monkey: ['Golden-Gustl', 'Gold-Geist', 'Affen-Aladin', 'Glänzender Goldjunge', 'Funkler'],

  // Wiese/Bauernhof (Europa)
  rabbit: ['Hoppy-Hans', 'Löffel-Lara', 'Kaninchen-Karl', 'Süßzahn-Sally', 'Hüpfer'],
  fox: ['Fuchs-Felix', 'Flinker Freund', 'Rotfell-Rudi', 'Schlauer Schliche', 'Listig'],
  deer: ['Hirsch-Heinrich', 'Bambi', 'Rehbock-Rolf', 'Zarte Zahara', 'Gentle'],
  hedgehog: ['Igel-Igor', 'Stachel-Stefan', 'Knuffig-Klaus', 'Rollen-Reinhard', 'Piekser'],
  owl: ['Eule-Emil', 'Weise Waldtraut', 'Nacht-Niko', 'Horcher-Hans', 'Weiter Blick'],
  squirrel: ['Eichhörnchen-Eddi', 'Nuss-Natalie', 'Busch-Bodo', 'Springerle-Susi', 'Fluffiger'],
  badger: ['Dachs-Darian', 'Graber-Gerta', 'Schwarzweißer', 'Burrow-Boss', 'Böckig'],
  wild_boar: ['Keiler-Kaspar', 'Wildschwein-Willi', 'Borsten-Bruno', 'Schlammliebhaber', 'Stürmisch'],
  lynx: ['Luchs-Leopold', 'Flecken-Fred', 'Ohr-Olli', 'Tödlicher Tänzer', 'Wildnis-Wanderer'],
  beaver: ['Biber-Berni', 'Staudammer-Sam', 'Baumfäller-Beat', 'Fleißiger Fred', 'Baumeister'],

  // Wüste
  camel: ['Kamel-Kaspar', 'Wüsten-Wilhelm', 'Höcker-Hannes', 'Durst-Doktor', 'Sandy'],
  snake: ['Schlangen-Sam', 'Zisch-Zoe', 'Giftzahn-Gary', 'Schleich-Sylvester', 'Ringel'],
  scorpion: ['Skorpion-Sybille', 'Gift-Gerto', 'Schwanz-Satan', 'Stecher-Stefan', 'Giftig'],
  fennec_fox: ['Fennek-Franzi', 'Ohren-Otto', 'Wüsten-Wanda', 'Sand-Sprinter', 'Süßling'],
  roadrunner: ['Roadrunner-Rolf', 'Schnellläufer-Sam', 'Beep-Beep-Bernie', 'Staubwolken-Stefan', 'Flitzer'],
  desert_tortoise: ['Schildkröte-Sebastian', 'Panzer-Petra', 'Langsam-Leopold', 'Wüsten-Wilhelm', 'Gemütlich'],
  iguana: ['Iguana-Igor', 'Grün-Grünwald', 'Schuppig-Susi', 'Sonnen-Sophie', 'Exotisch'],
  vulture: ['Geier-Gerda', 'Raubvogel-Ralf', 'Flieger-Friedrich', 'Hoher Hänger', 'Scharf Auge'],

  // Ozean/Aquarium
  dolphin: ['Delphin-Daisy', 'Sprung-Stefan', 'Lächel-Leopold', 'Wasser-Wilhelm', 'Spieler-Petra'],
  shark: ['Hai-Henry', 'Weiße Wonder', 'Zahn-Zoe', 'Raubfisch-Rolf', 'Finsterer Friedrich'],
  octopus: ['Oktopus-Oskar', 'Acht-Arme-Albert', 'Farb-Wechsler', 'Schlaue-Scheherazade', 'Tintenfass'],
  seahorse: ['Seepferdchen-Sam', 'Hänger-Hans', 'Schwimmender Stefan', 'Zierlich-Zara', 'Edel'],
  turtle: ['Schildkröte-Sheldon', 'Panzer-Petra', 'Langlebig-Leopold', 'Wasser-Wilhelm', 'Gemütlich'],
  jellyfish: ['Qualle-Quintin', 'Tentakel-Toni', 'Glühwürm-Glenda', 'Zart-Zoe', 'Schwebend'],
  orca: ['Orka-Oscar', 'Killerwal-Kevin', 'Schwarz-Weiß-Waldemar', 'Ozean-König', 'Herrscherin Hanna'],
  manta_ray: ['Mantarochen-Mani', 'Flügelflügel-Fiona', 'Elegant-Edith', 'Wasser-Winzer', 'Sanft'],
  clownfish: ['Nemo', 'Clownfisch-Claus', 'Orange-Otto', 'Witzig-Wanda', 'Lustig'],
  sea_otter: ['Seeotter-Olaf', 'Flausch-Friedrich', 'Spiel-Spieler', 'Niedlich-Nora', 'Frecher'],
  manatee: ['Manatee-Manfred', 'Seekuh-Silvia', 'Sanft-Stefan', 'Gemächlich-Greta', 'Träumer'],
  starfish: ['Seestern-Stella', 'Zackig-Zoe', 'Fünf-Finn', 'Stern-Stefan', 'Spitz'],
  blue_whale: ['Blauwal-Benno', 'Wal-Wilhelm', 'Riese-Rolf', 'Herzschlag-Hermann', 'Titanic'],
  hammerhead_shark: ['Hammerhai-Hank', 'Hammer-Kopf-Henry', 'Wundersam-Wanda', 'Hammer-Meister', 'Seltsam'],
  pufferfish: ['Kugelfisch-Klaus', 'Stachel-Stefan', 'Aufgeblasen-Albert', 'Giftig-Gerta', 'Lustig'],

  // Nachthaus
  bat: ['Fledermaus-Fred', 'Nacht-Navigator', 'Flatterer-Florian', 'Ohren-Otto', 'Dunkeldrinker'],
  raccoon: ['Waschbär-Walter', 'Dieb-Dieter', 'Maske-Marta', 'Frecher Fred', 'Pfötchen-Petra'],
  firefly: ['Glühwürmchen-Gus', 'Lichtlein-Leopold', 'Blitzender Bert', 'Leuchtkäfer-Lena', 'Helligkeit'],
  sugar_glider: ['Segelflatterer-Sam', 'Zucker-Zoe', 'Gleitflügler-Gaby', 'Süßzahn-Sally', 'Springling'],
  kiwi: ['Kiwi-Kevin', 'Feder-Friedrich', 'Neuseelands-Nil', 'Scheuer-Schüchtern', 'Nachtfalke'],
  tarsier: ['Tarsier-Toni', 'Große Augen-Gerald', 'Springling-Sam', 'Nacht-Ninja', 'Spiegel'],
  aye_aye: ['Aye-Aye-Albert', 'Finger-Friedrich', 'Großohr-Gustav', 'Wütendes Wiedersehen', 'Seltsam'],

  // Australien
  kangaroo: ['Känguru-Karl', 'Hoppy-Hans', 'Sprung-Stefan', 'Beutelbaby-Beatrice', 'Springen'],
  wombat: ['Wombat-Wilhelm', 'Klötzchen-Klaus', 'Grübler-Greta', 'Stämmiger-Stefan', 'Gemütlich'],
  platypus: ['Schnabeltier-Sam', 'Perry', 'Seltsam-Sebastian', 'Gift-Gaston', 'Enigma'],
  tasmanian_devil: ['Tasmanischer Teufel-Toni', 'Teufel-Tanz-Tom', 'Wirbel-Wanda', 'Laut-Leopold', 'Chaotisch'],
  echidna: ['Ameisenigel-Eddi', 'Stachel-Stefan', 'Stachelhose-Susi', 'Roll-Rolf', 'Panzerer'],
  wallaby: ['Wallaby-Walter', 'Mini-Känguru-Mika', 'Sprung-Schmetterlinge', 'Hüpfer-Hans', 'Kleine'],
  kookaburra: ['Kookaburra-Kevin', 'Lachen-Leopold', 'Busch-Bursche', 'Wilder Woofer', 'Lustig'],

  // Vögel
  eagle: ['Adler-Anton', 'Majestät-Manfred', 'Scharf-Sicht-Sam', 'Herrschender-Henry', 'König-Kralle'],
  flamingo: ['Flamingo-Fiona', 'Rosa-Raucher', 'Elegante-Edith', 'Tänzer-Tatiana', 'Schöner'],
  swan: ['Schwan-Sabine', 'Elegant-Edith', 'Schmetterlings-Schwinge', 'Anmut-Anna', 'Lieblich'],
  pelican: ['Pelikan-Peter', 'Taschenbeutel-Bob', 'Großschnabel-Gustav', 'Fisch-Fresser-Fred', 'Großmaul'],
  stork: ['Storch-Stefan', 'Stelzbeiniger-Sam', 'Baby-Bringer', 'Langer-Laden-Leopold', 'Wanderer'],
  crane: ['Kranich-Klaus', 'Elegante-Edith', 'Langbeiniger-Leopold', 'Tänzer-Tatiana', 'Graziös'],
  hummingbird: ['Kolibri-Kevin', 'Summer-Sam', 'Schnell-Schatz', 'Nektar-Nando', 'Flattern'],
  kingfisher: ['Eisvogel-Eddi', 'Farbkavalier', 'Fischer-Friedrich', 'Blau-Bart-Benno', 'Schimmerer'],
  hornbill: ['Hornvogel-Henry', 'Großschnabel-Gustav', 'Schreier-Sam', 'Nistmeister-Naldo', 'Kurios'],

  // Reptilien & Amphibien
  crocodile: ['Krokodil-Klaus', 'Krokodil-Tränen-Tom', 'Zahn-Zahnarzt', 'Grüner-Großer-Gator', 'Gefährlich'],
  alligator: ['Alligator-Albert', 'Sumpf-Sultan', 'Großmaul-Gus', 'Zahnarzt-Zoe', 'Lächel'],
  komodo_dragon: ['Komodo-Klaus', 'Drachenkönig', 'Gift-Gerto', 'Riesig-Roderich', 'Uralt'],
  gecko: ['Gecko-Gus', 'Kletterkünstler-Klaus', 'Haft-Hände-Henry', 'Fliegende-Fähigkeit', 'Schnelle'],
  poison_dart_frog: ['Gift-Frosch-Gus', 'Farb-Flasche-Francesca', 'Giftig-Greta', 'Bunt-Beatrice', 'Lebensgefährlich'],

  // Insekten
  butterfly: ['Schmetterling-Sabine', 'Flatterer-Friedrich', 'Farbenfrohe-Fiona', 'Tänzer-Tatiana', 'Zart'],
  ladybug: ['Marienkäfer-Maria', 'Pünktchen-Petra', 'Glücksbringer-Gustav', 'Rot-Rolf', 'Süß'],
  dragonfly: ['Libelle-Leopold', 'Flugmeister-Friedrich', 'Schnellste-Schwinge', 'Tänzer-Tom', 'Blitz'],
  praying_mantis: ['Betende Mantis-Maria', 'Jäger-Jack', 'Modellnehmer-Momo', 'Fang-Friedrich', 'Stille'],
};

// 🌟 TIER-TALENTE & SPEZIALITÄTEN
export interface AnimalTalent {
  name: string;
  icon: string;
  description: string;
  effect?: string;
}

// 💜 PERSÖNLICHKEITS-ADJEKTIVE - Wesensart & Charakter
export interface AnimalPersonality {
  adjectives: string[];
  essence: string;
}

const ANIMAL_PERSONALITIES: Record<ZooAnimal, AnimalPersonality> = {
  // Afrika - Große Tiere
  lion: { adjectives: ['Mutig', 'Stolz', 'Dominant'], essence: 'Der König der Savanne' },
  elephant: { adjectives: ['Weise', 'Sanft', 'Geduldvoll'], essence: 'Intelligenter Gigant' },
  giraffe: { adjectives: ['Zart', 'Neugierig', 'Elegant'], essence: 'Höchster Beobachter' },
  zebra: { adjectives: ['Schnell', 'Sozial', 'Wachsam'], essence: 'Striped Wanderer' },
  rhino: { adjectives: ['Kraftvoll', 'Entschlossen', 'Schüchtern'], essence: 'Gepanzerter Krieger' },
  hippo: { adjectives: ['Territorial', 'Schwer', 'Temperamentvoll'], essence: 'Wasserkönig' },
  cheetah: { adjectives: ['Schnell', 'Scharf', 'Elegant'], essence: 'Wind-Sprinter' },
  hyena: { adjectives: ['Lustig', 'Listig', 'Gesellig'], essence: 'Chaotischer Lacher' },
  ostrich: { adjectives: ['Schnell', 'Wachsam', 'Neugierig'], essence: 'Flugunfähiger Sprinter' },
  meerkat: { adjectives: ['Sozial', 'Mutig', 'Wachsam'], essence: 'Kleine Gemeinschaft' },
  buffalo: { adjectives: ['Kraftvoll', 'Brutal', 'Ausdauernd'], essence: 'Stampede-Masse' },
  antelope: { adjectives: ['Flink', 'Anmutig', 'Nervös'], essence: 'Grazile Flucht' },
  wildebeest: { adjectives: ['Ungestüm', 'Ausdauernd', 'Herdenmind'], essence: 'Große Migration' },
  gazelle: { adjectives: ['Elegant', 'Fein', 'Flüchtig'], essence: 'Tänzer der Savanne' },

  // Dschungel - Affen & Raubkatzen
  monkey: { adjectives: ['Spielerisch', 'Schlau', 'Sozial'], essence: 'Neugieriger Schelm' },
  gorilla: { adjectives: ['Kraftvoll', 'Sanft', 'Würdevoll'], essence: 'Sanfter Riese' },
  orangutan: { adjectives: ['Weise', 'Nachdenklich', 'Einsam'], essence: 'Waldphilosoph' },
  tiger: { adjectives: ['Elegant', 'Tödlich', 'Majestätisch'], essence: 'Gestreifter Assassine' },
  leopard: { adjectives: ['Mystisch', 'Unabhängig', 'Schattenhaft'], essence: 'Nacht-Phantom' },
  toucan: { adjectives: ['Bunt', 'Laut', 'Verspiellt'], essence: 'Regenbogenkönig' },
  parrot: { adjectives: ['Gesprächig', 'Intelligent', 'Mimisch'], essence: 'Sprechender Freund' },
  sloth: { adjectives: ['Verträumt', 'Langsam', 'Entspannt'], essence: 'Zen-Kletterer' },
  jaguar: { adjectives: ['Kraftvoll', 'Wasserjäger', 'Ängstlich'], essence: 'Dschungel-Phantom' },
  tapir: { adjectives: ['Friedlich', 'Geheimnisvoll', 'Nachtaktiv'], essence: 'Waldrüssel' },
  macaw: { adjectives: ['Farbenfroh', 'Lebhaft', 'Laut'], essence: 'Farbenpracht' },
  tree_frog: { adjectives: ['Giftig', 'Klein', 'Warnend'], essence: 'Winziger Krieger' },
  chameleon: { adjectives: ['Mystisch', 'Langsam', 'Täuscher'], essence: 'Meister der Camouflage' },
  gibbon: { adjectives: ['Akrobatisch', 'Musikalisch', 'Territorial'], essence: 'Luftturner' },

  // Arktis/Antarktis
  penguin: { adjectives: ['Elegant', 'Sozial', 'Entschlossen'], essence: 'Eis-Tänzer' },
  polar_bear: { adjectives: ['Kraftvoll', 'Einsam', 'Rücksichtslos'], essence: 'Eiskönig' },
  seal: { adjectives: ['Verspiellt', 'Süß', 'Gesellig'], essence: 'Niedlicher Schwimmer' },
  walrus: { adjectives: ['Massiv', 'Langsam', 'Sozial'], essence: 'Stoßzahn-König' },
  arctic_fox: { adjectives: ['Flink', 'Weiß', 'Listig'], essence: 'Schnee-Schattenspiel' },
  reindeer: { adjectives: ['Ausdauernd', 'Gesellig', 'Majestätisch'], essence: 'Schnee-Wanderer' },
  narwhal: { adjectives: ['Mystisch', 'Einhorn-Magie', 'Geheimnisvoll'], essence: 'Arktisches Einhorn' },
  beluga: { adjectives: ['Verspielt', 'Lächelnd', 'Intelligent'], essence: 'Weißer Delphin' },
  snow_owl: { adjectives: ['Weise', 'Lautlos', 'Nachtlich'], essence: 'Schnee-Wächter' },
  arctic_hare: { adjectives: ['Schnell', 'Weiß', 'Nervös'], essence: 'Sprung-Champion' },

  // Bambuswald (Asien)
  panda: { adjectives: ['Süß', 'Gemütlich', 'Friedlich'], essence: 'Bambusliebhaber' },
  red_panda: { adjectives: ['Niedlich', 'Flink', 'Spielerisch'], essence: 'Kleine Flauschkugel' },
  koala: { adjectives: ['Träge', 'Kuschelig', 'Süß'], essence: 'Eukalyptus-Träumer' },
  peacock: { adjectives: ['Prächtig', 'Stolz', 'Eitel'], essence: 'Federkönig' },
  snow_leopard: { adjectives: ['Scheu', 'Elegant', 'Phantom'], essence: 'Berg-Geist' },
  clouded_leopard: { adjectives: ['Mystisch', 'Baumbewohner', 'Selten'], essence: 'Nebelfleck-Jäger' },
  golden_monkey: { adjectives: ['Golden', 'Sozial', 'Majestätisch'], essence: 'Glänzender Affe' },

  // Wiese/Bauernhof (Europa)
  rabbit: { adjectives: ['Schnell', 'Ängstlich', 'Niedlich'], essence: 'Hüpf-Künstler' },
  fox: { adjectives: ['Listig', 'Elegant', 'Nachtaktiv'], essence: 'Intelligenter Jäger' },
  deer: { adjectives: ['Sanft', 'Elegant', 'Wachsam'], essence: 'Bambi der Wiese' },
  hedgehog: { adjectives: ['Süß', 'Stachelig', 'Beschützer'], essence: 'Kleine Festung' },
  owl: { adjectives: ['Weise', 'Einsam', 'Geheimnisvoll'], essence: 'Nacht-Einsiedler' },
  squirrel: { adjectives: ['Flink', 'Verspiellt', 'Sammler'], essence: 'Baum-Sprinter' },
  badger: { adjectives: ['Mutig', 'Ausdauernd', 'Territorial'], essence: 'Untergrund-Kämpfer' },
  wild_boar: { adjectives: ['Stark', 'Aufrührer', 'Schmutzig'], essence: 'Schlammkrieger' },
  lynx: { adjectives: ['Elegant', 'Scharf', 'Mystisch'], essence: 'Wald-Phantom' },
  beaver: { adjectives: ['Fleißig', 'Intelligent', 'Handwerker'], essence: 'Ingenieurs-Nager' },

  // Wüste
  camel: { adjectives: ['Ausdauernd', 'Robust', 'Geduldig'], essence: 'Wüsten-Schiff' },
  snake: { adjectives: ['Giftig', 'Geheimnisvoll', 'Kalt'], essence: 'Zischender Jäger' },
  scorpion: { adjectives: ['Giftig', 'Gefährlich', 'Nachtlich'], essence: 'Giftiger Krieger' },
  fennec_fox: { adjectives: ['Niedlich', 'Wachsam', 'Flink'], essence: 'Wüsten-Feenchen' },
  roadrunner: { adjectives: ['Schnell', 'Dumm', 'Lustig'], essence: 'Beep-Beep-Vogel' },
  desert_tortoise: { adjectives: ['Langlebig', 'Langsam', 'Robust'], essence: 'Wüsten-Greis' },
  iguana: { adjectives: ['Faul', 'Sonnig', 'Grün'], essence: 'Sonnenanbeter' },
  vulture: { adjectives: ['Grausig', 'Scharf', 'Ausdauernd'], essence: 'Aasfresser König' },

  // Ozean/Aquarium
  dolphin: { adjectives: ['Intelligent', 'Spielerisch', 'Sozial'], essence: 'Ozean-Genie' },
  shark: { adjectives: ['Tödlich', 'Kalt', 'Primitiv'], essence: 'Ur-Jäger' },
  octopus: { adjectives: ['Intelligent', 'Geheimnisvoll', 'Farbenreich'], essence: 'Ozean-Zauberer' },
  seahorse: { adjectives: ['Zart', 'Langsam', 'Romantisch'], essence: 'Meeres-Pferd' },
  turtle: { adjectives: ['Langlebig', 'Friedlich', 'Weise'], essence: 'Ozean-Ältester' },
  jellyfish: { adjectives: ['Zart', 'Giftig', 'Leuchtend'], essence: 'Medusen-Schönheit' },
  orca: { adjectives: ['Intelligent', 'Dominant', 'Sozial'], essence: 'Killerwale König' },
  manta_ray: { adjectives: ['Elegant', 'Friedlich', 'Groß'], essence: 'Unter-Lied' },
  clownfish: { adjectives: ['Niedlich', 'Orange', 'Mutig'], essence: 'Anemonen-Freund' },
  sea_otter: { adjectives: ['Niedlich', 'Spielerisch', 'Intelligente'], essence: 'Handwerk-Meister' },
  manatee: { adjectives: ['Sanft', 'Friedlich', 'Langsam'], essence: 'Seekuh-Schatz' },
  starfish: { adjectives: ['Zart', 'Regnerativ', 'Symbiotisch'], essence: 'Seestern-Stern' },
  blue_whale: { adjectives: ['Riesig', 'Gelassen', 'Sanft'], essence: 'Größter Erde' },
  hammerhead_shark: { adjectives: ['Bizarr', 'Ominös', 'Effizient'], essence: 'Hammer-Kopf' },
  pufferfish: { adjectives: ['Giftig', 'Lustig', 'Verteidigungsfähig'], essence: 'Aufblas-Kugel' },

  // Nachthaus
  bat: { adjectives: ['Nachtaktiv', 'Geschickt', 'Orientiert'], essence: 'Ultraschall-Jäger' },
  raccoon: { adjectives: ['Listig', 'Verspiellt', 'Neugierig'], essence: 'Masken-Dieb' },
  firefly: { adjectives: ['Magisch', 'Leuchtend', 'Kurzzeitig'], essence: 'Lichtwürmer' },
  sugar_glider: { adjectives: ['Niedlich', 'Flatternd', 'Akrobatisch'], essence: 'Zucker-Segler' },
  kiwi: { adjectives: ['Seltsam', 'Flügellos', 'Nachtaktiv'], essence: 'Neuseelands Wunder' },
  tarsier: { adjectives: ['Süß', 'Große-Augen', 'Nachtaktiv'], essence: 'Augen-Phantom' },
  aye_aye: { adjectives: ['Unheimlich', 'Intelligent', 'Seltsam'], essence: 'Finger-Daemon' },

  // Australien
  kangaroo: { adjectives: ['Springend', 'Muskulär', 'Australisch'], essence: 'Sprung-König' },
  wombat: { adjectives: ['Knuffig', 'Stämmig', 'Gräber'], essence: 'Würfel-Meister' },
  platypus: { adjectives: ['Bizarr', 'Einzigartig', 'Geheimnisvoll'], essence: 'Schnabeltier-Wunder' },
  tasmanian_devil: { adjectives: ['Chaotisch', 'Laut', 'Gefräßig'], essence: 'Wirbelwind-Monster' },
  echidna: { adjectives: ['Gepanzert', 'Langsam', 'Einsam'], essence: 'Stachel-Einsiedler' },
  wallaby: { adjectives: ['Klein', 'Schnell', 'Neugierig'], essence: 'Mini-Känguru' },
  kookaburra: { adjectives: ['Lustig', 'Laut', 'Ungeheuer'], essence: 'Lachender Vogel' },

  // Vögel
  eagle: { adjectives: ['Majestätisch', 'Stark', 'Scharf'], essence: 'König der Lüfte' },
  flamingo: { adjectives: ['Rosa', 'Elegant', 'Sozial'], essence: 'Wasser-Ballett' },
  swan: { adjectives: ['Elegant', 'Treu', 'Anmutig'], essence: 'Schwan-Schönheit' },
  pelican: { adjectives: ['Groß', 'Langsam', 'Taschenträger'], essence: 'Fischjäger' },
  stork: { adjectives: ['Weiß', 'Territorial', 'Legendarisch'], essence: 'Baby-Bringer' },
  crane: { adjectives: ['Elegant', 'Langlebig', 'Tänzer'], essence: 'Anmut-Vogel' },
  hummingbird: { adjectives: ['Schnell', 'Farbenreich', 'Klein'], essence: 'Nektar-Blitz' },
  kingfisher: { adjectives: ['Blau', 'Schnell', 'Präzise'], essence: 'Fisch-Jäger' },
  hornbill: { adjectives: ['Groß-Schnabel', 'Territorial', 'Treue'], essence: 'Hornbill-König' },

  // Reptilien & Amphibien
  crocodile: { adjectives: ['Primitiv', 'Tödlich', 'Kalt'], essence: 'Ur-Raubtier' },
  alligator: { adjectives: ['Sumpfig', 'Rücksichtslos', 'Gepanzert'], essence: 'Sumpfkönig' },
  komodo_dragon: { adjectives: ['Giftig', 'Groß', 'Uralt'], essence: 'Insel-Monster' },
  gecko: { adjectives: ['Kletternd', 'Nachtaktiv', 'Farbenreich'], essence: 'Haft-Künstler' },
  poison_dart_frog: { adjectives: ['Klein', 'Tödlich', 'Bunt'], essence: 'Giftige Schönheit' },

  // Insekten
  butterfly: { adjectives: ['Zart', 'Farbenreich', 'Flüchtig'], essence: 'Metamorphose-Wunder' },
  ladybug: { adjectives: ['Rot', 'Glücklich', 'Hilfreich'], essence: 'Glücksbringer' },
  dragonfly: { adjectives: ['Schnell', 'Elegant', 'Geschickt'], essence: 'Luft-Akrobat' },
  praying_mantis: { adjectives: ['Tödlich', 'Fokussiert', 'Geduldig'], essence: 'Geduldiger Jäger' },
};

const ANIMAL_TALENTS: Record<ZooAnimal, AnimalTalent[]> = {
  // Afrika - Große Tiere
  lion: [
    { name: 'Königliches Brüllen', icon: '🎤', description: 'Laut und stolz!', effect: '+10% Coins' },
    { name: 'Mähnen-Pracht', icon: '👑', description: 'Beeindruckende Frisur', effect: '+5% Friendship' },
    { name: 'Jagd-Instinkt', icon: '⚡', description: 'Schnell und tödlich', effect: '+15% Game Speed' }
  ],
  elephant: [
    { name: 'Elefanten-Gedächtnis', icon: '🧠', description: 'Nichts vergessen', effect: '+20% XP' },
    { name: 'Rüssel-Kraft', icon: '💪', description: 'Super stark', effect: '+10% Power' },
    { name: 'Wasser-Spritzen', icon: '💦', description: 'Erfrischend!', effect: '+5% Happiness' }
  ],
  giraffe: [
    { name: 'Hals-Radar', icon: '📡', description: 'Sieht alles von oben', effect: '+25% Discovery' },
    { name: 'Fleck-Muster', icon: '🎨', description: 'Tarnung-Meister', effect: '+10% Stealth' },
    { name: 'Blätter-Liebhaber', icon: '🍃', description: 'Feinschmecker', effect: '+8% Satiety' }
  ],
  zebra: [
    { name: 'Blitz-Streifen', icon: '⚡', description: 'Optische Täuschung', effect: '+30% Speed' },
    { name: 'Herdenschutz', icon: '🛡️', description: 'Gemeinsam stark', effect: '+15% Defense' },
    { name: 'Stampede-Power', icon: '🏃', description: 'Massive Kraft', effect: '+12% Attack' }
  ],
  rhino: [
    { name: 'Horn-Stoßkraft', icon: '🪔', description: 'Panzernase Attack', effect: '+25% Attack' },
    { name: 'Panzer-Haut', icon: '🛡️', description: 'Super tough', effect: '+20% Defense' },
    { name: 'Mud-Spa', icon: '💆', description: 'Entspannungs-Zeit', effect: '+10% Chill' }
  ],
  hippo: [
    { name: 'Wasser-Meister', icon: '💧', description: 'Aquatischer Champion', effect: '+20% Water Skills' },
    { name: 'Großmaul-Schrecken', icon: '😮', description: 'Intimidierendes Gähnen', effect: '+15% Intimidate' },
    { name: 'Wassertank', icon: '🏊', description: 'Unermüdlicher Schwimmer', effect: '+25% Endurance' }
  ],
  cheetah: [
    { name: 'Blitzbeschleunigung', icon: '🏃', description: '110+ km/h!', effect: '+50% Speed' },
    { name: 'Jagd-Fokus', icon: '🎯', description: 'Perfekte Zielgenauigkeit', effect: '+40% Accuracy' },
    { name: 'Fleck-Tarn', icon: '🎭', description: 'Verstecken Meister', effect: '+20% Stealth' }
  ],
  hyena: [
    { name: 'Lachen-Sound', icon: '😂', description: 'Lustig & beängstigend', effect: '+15% Morale' },
    { name: 'Bisserkraft', icon: '🦷', description: 'Stärkste Bisse', effect: '+35% Bite Power' },
    { name: 'Rudel-Taktik', icon: '👥', description: 'Team-Strategie', effect: '+20% Team Synergy' }
  ],
  ostrich: [
    { name: 'Rennmeister', icon: '🏃', description: '70 km/h Läufer', effect: '+45% Speed' },
    { name: 'Kopf-Kick', icon: '🦵', description: 'Tritt mit Wucht', effect: '+30% Kick Power' },
    { name: 'Strauß-Größe', icon: '📏', description: 'Riesig & Imposant', effect: '+15% Intimidate' }
  ],
  meerkat: [
    { name: 'Stehende Wache', icon: '🚨', description: 'Immer aufmerksam', effect: '+25% Alertness' },
    { name: 'Tunnel-Meister', icon: '🕳️', description: 'Untergrund-König', effect: '+20% Digging' },
    { name: 'Sozial-Meister', icon: '👨‍👩‍👧‍👦', description: 'Liebe Familie', effect: '+30% Friendship' }
  ],
  buffalo: [
    { name: 'Hörner-Angriff', icon: '🪔', description: 'Scharfe Waffen', effect: '+35% Horn Power' },
    { name: 'Stampede-Kraft', icon: '💥', description: 'Kollektive Power', effect: '+40% Group Attack' },
    { name: 'Ausdauer-Lauf', icon: '💨', description: 'Lange Strecken', effect: '+25% Stamina' }
  ],
  antelope: [
    { name: 'Sprint-Fähigkeit', icon: '⚡', description: 'Explosiv schnell', effect: '+40% Sprint' },
    { name: 'Sprung-Höhe', icon: '⬆️', description: 'Hoch hinaus!', effect: '+30% Jump' },
    { name: 'Flucht-Instinkt', icon: '🏃', description: 'Schnelle Reaktion', effect: '+35% Reflexes' }
  ],
  wildebeest: [
    { name: 'Große Wanderung', icon: '🗺️', description: 'Fernweh', effect: '+20% Exploration' },
    { name: 'Herdenstärke', icon: '👥', description: 'Einheit ist Kraft', effect: '+25% Group Power' },
    { name: 'Überlebenskünstler', icon: '🌍', description: 'Hartnäckig & wild', effect: '+30% Resilience' }
  ],
  gazelle: [
    { name: 'Grazile Bewegung', icon: '💃', description: 'Elegante Tänzerin', effect: '+35% Grace' },
    { name: 'Sprung-Artisten', icon: '🤸', description: 'Akrobatik-Künstler', effect: '+40% Agility' },
    { name: 'Wind-Racer', icon: '💨', description: 'Mit dem Wind laufen', effect: '+38% Speed' }
  ],

  // Dschungel - Affen & Raubkatzen  
  monkey: [
    { name: 'Baum-Kletterer', icon: '🌳', description: 'Meister der Äste', effect: '+25% Climbing' },
    { name: 'Früchte-Sammler', icon: '🍌', description: 'Essens-Finder', effect: '+20% Foraging' },
    { name: 'Schlaue Tricks', icon: '🎭', description: 'Intelligenter Schelm', effect: '+25% Cunning' }
  ],
  gorilla: [
    { name: 'Berserker-Kraft', icon: '💪', description: 'Unglaubliche Stärke', effect: '+50% Strength' },
    { name: 'Brust-Trommeln', icon: '🥁', description: 'Lauter Lärm', effect: '+30% Intimidate' },
    { name: 'Friedens-König', icon: '☮️', description: 'Ruhig & würdevoll', effect: '+20% Wisdom' }
  ],
  orangutan: [
    { name: 'Waldweiser', icon: '🧙', description: 'Natur-Mystiker', effect: '+25% Nature Knowledge' },
    { name: 'Äste-Akrobat', icon: '🤸', description: 'Fliegende Bewegungen', effect: '+35% Agility' },
    { name: 'Pflanzenkunde', icon: '🌿', description: 'Heiler-Künstler', effect: '+20% Healing' }
  ],
  tiger: [
    { name: 'Streifen-Tarnung', icon: '🎨', description: 'Perfekte Maskierung', effect: '+30% Stealth' },
    { name: 'Nacht-Augen', icon: '🌙', description: 'Infrarot-Sicht', effect: '+40% Night Vision' },
    { name: 'Sprung-Angriff', icon: '🐯', description: 'Blitz-Attacke', effect: '+45% Pounce' }
  ],
  leopard: [
    { name: 'Flecken-Tarn', icon: '🟤', description: 'Unsichtbar in Schatten', effect: '+40% Invisibility' },
    { name: 'Kletter-König', icon: '⬆️', description: 'Bäume sind sein Reich', effect: '+35% Climbing' },
    { name: 'Nacht-Jäger', icon: '🌙', description: 'Perfekter Nachtjäger', effect: '+45% Night Hunt' }
  ],
  toucan: [
    { name: 'Großer Schnabel', icon: '🦜', description: 'Spektakuläre Erscheinung', effect: '+20% Charisma' },
    { name: 'Flug-Meister', icon: '🛫', description: 'Geschickter Flieger', effect: '+30% Flight' },
    { name: 'Farben-Pracht', icon: '🌈', description: 'Lebender Regenbogen', effect: '+25% Beauty' }
  ],
  parrot: [
    { name: 'Sprechen-Talent', icon: '🗣️', description: 'Wiederholt alles', effect: '+25% Communication' },
    { name: 'Laut-Stimme', icon: '🔊', description: 'SEHR laut!', effect: '+35% Volume' },
    { name: 'Sozial-Schmetterling', icon: '🦋', description: 'Liebenswerter Freund', effect: '+30% Friendship' }
  ],
  sloth: [
    { name: 'Zen-Meister', icon: '☮️', description: 'Maximale Entspannung', effect: '+40% Calmness' },
    { name: 'Baum-Hafting', icon: '🌳', description: 'Klammert sich fest', effect: '+25% Grip Strength' },
    { name: 'Algen-Haut', icon: '🟢', description: 'Natürliche Tarnung', effect: '+30% Camouflage' }
  ],
  jaguar: [
    { name: 'Schwimm-Profi', icon: '🏊', description: 'Aquatischer Jäger', effect: '+35% Swimming' },
    { name: 'Kraft-Biss', icon: '🦷', description: 'Stärkste Bisse im Dschungel', effect: '+50% Bite' },
    { name: 'Panter-Eleganz', icon: '💃', description: 'Anmutiger Raubtier', effect: '+25% Grace' }
  ],
  tapir: [
    { name: 'Rüssel-Sensor', icon: '👃', description: 'Beste Nase', effect: '+40% Smell' },
    { name: 'Wasser-Taucher', icon: '🏊', description: 'Kann lange tauchen', effect: '+30% Diving' },
    { name: 'Friedliches Wesen', icon: '☮️', description: 'Harmoniebringer', effect: '+20% Peace' }
  ],
  macaw: [
    { name: 'Flugmeister', icon: '🦅', description: 'Spektakuläre Flüge', effect: '+40% Flight' },
    { name: 'Krächz-Sound', icon: '📣', description: 'Ohrenbetäubend laut', effect: '+40% Screech' },
    { name: 'Farben-König', icon: '🌈', description: 'Lebt für Farben', effect: '+30% Color Display' }
  ],
  tree_frog: [
    { name: 'Flüsse-Hopper', icon: '🦗', description: 'Perfekt für Blätter', effect: '+35% Jumping' },
    { name: 'Gift-Verteidigung', icon: '☠️', description: 'Toxic aber schön', effect: '+25% Poison' },
    { name: 'Baum-Meister', icon: '🌳', description: 'Lebt auf Blättern', effect: '+30% Leaf Grip' }
  ],
  chameleon: [
    { name: 'Farb-Meister', icon: '🎨', description: 'Kameleon-Verwandlung', effect: '+50% Color Change' },
    { name: 'Zungen-Schuss', icon: '👅', description: 'Super lange Zunge', effect: '+30% Tongue Shot' },
    { name: 'Unsichtbar-Meister', icon: '👻', description: 'Perfekte Tarnung', effect: '+45% Invisibility' }
  ],
  gibbon: [
    { name: 'Seilturnen-Meister', icon: '🤸', description: 'Schwebt durch die Bäume', effect: '+40% Swinging' },
    { name: 'Laut-Rufe', icon: '📣', description: 'Kommuniziert über Distanz', effect: '+30% Calling' },
    { name: 'Äste-Akrobat', icon: '🎪', description: 'Atemberaubende Tricks', effect: '+35% Acrobatics' }
  ],

  // Arktis/Antarktis
  penguin: [
    { name: 'Eis-Gleitschuh', icon: '⛸️', description: 'Perfekt im Eis', effect: '+40% Ice Sliding' },
    { name: 'Schwimm-Champion', icon: '🏊', description: 'Eleganter Schwimmer', effect: '+45% Swimming' },
    { name: 'Kälteschutz', icon: '❄️', description: 'Extrem robust', effect: '+35% Cold Resistance' }
  ],
  polar_bear: [
    { name: 'Eisbär-Kraft', icon: '💪', description: 'Stärkster Landraubtier', effect: '+50% Strength' },
    { name: 'Fett-Schutz', icon: '🛡️', description: 'Isoliert gegen Kälte', effect: '+40% Insulation' },
    { name: 'Schwimm-Ausdauer', icon: '🏊', description: 'Schwimmt für Stunden', effect: '+45% Swim Endurance' }
  ],
  seal: [
    { name: 'Flossen-Power', icon: '🛟', description: 'Geschickte Flossen', effect: '+40% Fin Power' },
    { name: 'Wasser-Ballett', icon: '💃', description: 'Anmutige Schwimmer', effect: '+35% Grace' },
    { name: 'Tiefen-Taucher', icon: '🫧', description: 'Extrem tiefe Tauchgänge', effect: '+45% Diving' }
  ],
  walrus: [
    { name: 'Stoßzahn-Kraft', icon: '🪔', description: 'Massive Stoßzähne', effect: '+40% Tusk Power' },
    { name: 'Eis-Anker', icon: '⚓', description: 'Hält sich an Eis fest', effect: '+35% Ice Grip' },
    { name: 'Dichte-Schicht', icon: '🛡️', description: 'Extreme Kälteresistenz', effect: '+45% Cold Armor' }
  ],
  arctic_fox: [
    { name: 'Schnee-Tarnung', icon: '⚪', description: 'Unsichtbar weiß', effect: '+40% Snow Camouflage' },
    { name: 'Spitz-Ohren', icon: '👂', description: 'Hört alles unter Schnee', effect: '+35% Hearing' },
    { name: 'Spurt-Läufer', icon: '⚡', description: 'Schnelle Sprints', effect: '+30% Sprint' }
  ],
  reindeer: [
    { name: 'Rentier-Kraft', icon: '💪', description: 'Zieht schwere Lasten', effect: '+40% Pull Power' },
    { name: 'Eis-Hufe', icon: '🐾', description: 'Perfekt für Schnee', effect: '+35% Snow Walking' },
    { name: 'Hirsch-Prächtig', icon: '👑', description: 'Majestätische Hörner', effect: '+25% Majestic' }
  ],
  narwhal: [
    { name: 'Einhornstab', icon: '🔮', description: 'Magischer Stoßzahn', effect: '+40% Horn Power' },
    { name: 'Tief-Taucher', icon: '🫧', description: 'Höchste Tauchtiefe', effect: '+45% Deep Dive' },
    { name: 'Arktischer Lied', icon: '🎶', description: 'Mystischer Gesang', effect: '+30% Singing' }
  ],
  beluga: [
    { name: 'Weiße Wunder', icon: '⚪', description: 'Schneeweißer Körper', effect: '+25% Beauty' },
    { name: 'Lächel-Gesicht', icon: '😊', description: 'Das Meereslächeln', effect: '+30% Charm' },
    { name: 'Echolot-Meister', icon: '📡', description: 'Perfektes Sonar', effect: '+40% Echolocation' }
  ],
  snow_owl: [
    { name: 'Nacht-Augen', icon: '🌙', description: 'Kann in völliger Dunkelheit sehen', effect: '+50% Night Vision' },
    { name: 'Stille-Flug', icon: '🦅', description: 'Lautloser Flug', effect: '+40% Silent Flight' },
    { name: 'Weisen-Blick', icon: '🧙', description: 'Tiefe Intelligenz', effect: '+30% Wisdom' }
  ],
  arctic_hare: [
    { name: 'Sprung-Power', icon: '🦘', description: 'Massive Sprünge', effect: '+45% Jump Height' },
    { name: 'Schnee-Läufer', icon: '🏃', description: 'Extrem schnell im Schnee', effect: '+40% Snow Speed' },
    { name: 'Winter-Fell', icon: '❄️', description: 'Perfekter Kälteschutz', effect: '+35% Cold Resistance' }
  ],

  // Bambuswald (Asien)
  panda: [
    { name: 'Bambus-Feinschmecker', icon: '🎋', description: 'Bambus ist Leben', effect: '+25% Eating' },
    { name: 'Rollen-Meister', icon: '🔄', description: 'Niedliche Rollen', effect: '+20% Cuteness' },
    { name: 'Zen-Geist', icon: '☮️', description: 'Friedliche Ausstrahlung', effect: '+30% Peace' }
  ],
  red_panda: [
    { name: 'Baum-Akrobat', icon: '🤸', description: 'Schwebt durch Äste', effect: '+35% Acrobatics' },
    { name: 'Schwanz-Balance', icon: '⚖️', description: 'Perfekter Balanceakt', effect: '+30% Balance' },
    { name: 'Niedlichkeits-Aura', icon: '✨', description: 'Extrem süß!', effect: '+40% Cuteness' }
  ],
  koala: [
    { name: 'Eukalyptus-Liebhaber', icon: '🌿', description: 'Nur Eukalyptus!', effect: '+20% Plant Diet' },
    { name: 'Schlaf-König', icon: '😴', description: '20h Schlaf täglich', effect: '+30% Rest' },
    { name: 'Baum-Griff', icon: '🫶', description: 'Trägt sich selbst', effect: '+25% Grip' }
  ],
  peacock: [
    { name: 'Federpracht-Display', icon: '🎭', description: 'Spektakulärer Schwanz', effect: '+50% Beauty Display' },
    { name: 'Schrei-Sound', icon: '🔊', description: 'Markanter Ruf', effect: '+25% Call' },
    { name: 'Stolz-Ausstrahlung', icon: '👑', description: 'Reiner Stolz', effect: '+35% Pride' }
  ],
  snow_leopard: [
    { name: 'Berg-Schatten', icon: '⛰️', description: 'Phantom der Berge', effect: '+45% Stealth' },
    { name: 'Sprung-Meister', icon: '🦘', description: '15m hohe Sprünge', effect: '+50% Jump' },
    { name: 'Gletscherfüße', icon: '❄️', description: 'Perfekt auf Eis', effect: '+35% Ice Walking' }
  ],
  clouded_leopard: [
    { name: 'Fangzahn-Meister', icon: '🦷', description: 'Längste Fangzähne', effect: '+40% Bite' },
    { name: 'Baum-Spezialist', icon: '🌳', description: 'Leben in Bäumen', effect: '+40% Tree Climbing' },
    { name: 'Nacht-Jäger', icon: '🌙', description: 'Perfekter Nachtjäger', effect: '+40% Night Hunt' }
  ],
  golden_monkey: [
    { name: 'Gold-Fell', icon: '✨', description: 'Schimmerndes Fell', effect: '+25% Beauty' },
    { name: 'Sozial-Meister', icon: '👨‍👩‍👧‍👦', description: 'Liebevolle Gruppen', effect: '+35% Sociability' },
    { name: 'Berg-Kletterer', icon: '⛰️', description: 'Bergmeister', effect: '+30% Mountain Climbing' }
  ],

  // Wiese/Bauernhof (Europa)
  rabbit: [
    { name: 'Hüpf-Power', icon: '🦘', description: 'Unglaubliche Sprünge', effect: '+40% Hopping' },
    { name: 'Ohren-Radar', icon: '👂', description: 'Beste Ohren', effect: '+35% Hearing' },
    { name: 'Flucht-Künstler', icon: '💨', description: 'Super schnelle Flucht', effect: '+40% Escape' }
  ],
  fox: [
    { name: 'Fuchs-Geschick', icon: '🎯', description: 'Listiger Jäger', effect: '+35% Cunning' },
    { name: 'Schwanz-Balance', icon: '🦊', description: 'Magischer Schwanz', effect: '+25% Balance' },
    { name: 'Nacht-Abenteuer', icon: '🌙', description: 'Nächtlicher Wanderer', effect: '+30% Night Activity' }
  ],
  deer: [
    { name: 'Sprung-Meister', icon: '🦌', description: 'Elegante Sprünge', effect: '+40% Jumping' },
    { name: 'Hirsch-Prächtig', icon: '👑', description: 'Majestätische Hörner', effect: '+30% Majestic' },
    { name: 'Flucht-Speed', icon: '💨', description: '45 km/h Läufer', effect: '+38% Speed' }
  ],
  hedgehog: [
    { name: 'Stachel-Schild', icon: '🛡️', description: 'Perfekte Verteidigung', effect: '+40% Defense' },
    { name: 'Kugel-Rolle', icon: '🔄', description: 'Rollen zu Ball', effect: '+30% Toughness' },
    { name: 'Schnüffel-Nase', icon: '👃', description: 'Gute Nase', effect: '+25% Smell' }
  ],
  owl: [
    { name: 'Nacht-Augen', icon: '🌙', description: 'Sieht alles nachts', effect: '+50% Night Vision' },
    { name: 'Kopf-Dreh', icon: '🔄', description: '270° Kopfdrehung', effect: '+30% Flexibility' },
    { name: 'Stille-Flug', icon: '🦅', description: 'Lautlos fliegend', effect: '+35% Silent Flight' }
  ],
  squirrel: [
    { name: 'Nuss-Sammler', icon: '🌰', description: 'Schatz-Finder', effect: '+30% Foraging' },
    { name: 'Baum-Sprinter', icon: '🌳', description: 'Extrem flink', effect: '+40% Agility' },
    { name: 'Buschiger Schwanz', icon: '🐿️', description: 'Balance Meister', effect: '+30% Balance' }
  ],
  badger: [
    { name: 'Grab-Meister', icon: '🕳️', description: 'Tunnelkönig', effect: '+35% Digging' },
    { name: 'Kämpf-Mut', icon: '💪', description: 'Furchtlos kämpfend', effect: '+40% Courage' },
    { name: 'Nacht-Jäger', icon: '🌙', description: 'Nächtliches Jagdwesen', effect: '+30% Night Hunt' }
  ],
  wild_boar: [
    { name: 'Stoß-Kraft', icon: '💥', description: 'Massive Stoßkraft', effect: '+45% Charging Attack' },
    { name: 'Borsten-Rüstung', icon: '🛡️', description: 'Raue Haut', effect: '+30% Armor' },
    { name: 'Schlamm-Liebhaber', icon: '🩸', description: 'Gerne schmutzig', effect: '+20% Mud Love' }
  ],
  lynx: [
    { name: 'Tufted-Ohren', icon: '👂', description: 'Markante Ohr-Quasten', effect: '+30% Hearing' },
    { name: 'Sprung-Meister', icon: '🐾', description: 'Extreme Sprünge', effect: '+40% Pounce' },
    { name: 'Kältemeister', icon: '❄️', description: 'Liebt kalte Gegenden', effect: '+35% Cold Resistance' }
  ],
  beaver: [
    { name: 'Staudamm-Bauer', icon: '🏗️', description: 'Ingenieursmeister', effect: '+40% Building' },
    { name: 'Holz-Nagezahn', icon: '🦷', description: 'Kann Bäume fällen', effect: '+30% Cutting' },
    { name: 'Wasser-Meister', icon: '💧', description: 'Aquatischer Experte', effect: '+35% Water Skills' }
  ],

  // Wüste
  camel: [
    { name: 'Wüsten-Navigator', icon: '🗺️', description: 'Kennt Dunes', effect: '+40% Navigation' },
    { name: 'Durst-Speicher', icon: '💧', description: 'Kann wochenlang ohne Wasser', effect: '+50% Endurance' },
    { name: 'Sand-Wanderer', icon: '🐪', description: 'Perfekt für Wüste', effect: '+35% Desert Walking' }
  ],
  snake: [
    { name: 'Schlänger-Bewegung', icon: '🐍', description: 'Flüssige Bewegung', effect: '+35% Slither' },
    { name: 'Gift-Fang', icon: '☠️', description: 'Tödliches Gift', effect: '+40% Poison' },
    { name: 'Wärme-Sensor', icon: '🌡️', description: 'Infrarot-Sensoren', effect: '+30% Heat Detection' }
  ],
  scorpion: [
    { name: 'Stachel-Gift', icon: '☠️', description: 'Tödliches Gift', effect: '+45% Venom' },
    { name: 'Panzer-Rüstung', icon: '🛡️', description: 'Harte Kruste', effect: '+35% Armor' },
    { name: 'Nachtsicht', icon: '🌙', description: 'Nachtseher', effect: '+30% Night Vision' }
  ],
  fennec_fox: [
    { name: 'Ohren-Kühl', icon: '❄️', description: 'Regelt Körperwärme', effect: '+30% Temperature Control' },
    { name: 'Sand-Läufer', icon: '🏃', description: 'Schnell im Sand', effect: '+40% Sand Speed' },
    { name: 'Spitzohren-Hören', icon: '👂', description: 'Super Gehör', effect: '+35% Hearing' }
  ],
  roadrunner: [
    { name: 'Super-Speed', icon: '🏃', description: 'Rapid-Bewegung', effect: '+50% Speed' },
    { name: 'Zick-Zack-Lauf', icon: '⚡', description: 'Unvorhersehbare Bewegung', effect: '+35% Evasion' },
    { name: 'Wüsten-Meister', icon: '🌵', description: 'Experte der Wüste', effect: '+30% Desert Knowledge' }
  ],
  desert_tortoise: [
    { name: 'Panzer-Schrank', icon: '🛡️', description: 'Extreme Rüstung', effect: '+50% Defense' },
    { name: 'Langlebigkeit', icon: '⏳', description: '100+ Jahre Leben', effect: '+40% Longevity' },
    { name: 'Wüsten-Wanderer', icon: '🌵', description: 'Überlebt überall', effect: '+35% Survival' }
  ],
  iguana: [
    { name: 'Sonnen-Anbeter', icon: '☀️', description: 'Braucht Wärme', effect: '+25% Sun Power' },
    { name: 'Klettern-Kralle', icon: '🪓', description: 'Perfekt zum Klettern', effect: '+35% Climbing' },
    { name: 'Schwanz-Peitsche', icon: '🪃', description: 'Schwanzwaffe', effect: '+25% Tail Attack' }
  ],
  vulture: [
    { name: 'Flug-Meister', icon: '🦅', description: 'Stundenlanger Flug', effect: '+40% Flying' },
    { name: 'Scharfsicht', icon: '👁️', description: 'Beste Augen aller Vögel', effect: '+45% Vision' },
    { name: 'Aufbruch-Fähigkeit', icon: '🍖', description: 'Verdaut alles', effect: '+30% Digestion' }
  ],

  // Ozean/Aquarium
  dolphin: [
    { name: 'Intelligenz-Genie', icon: '🧠', description: 'Super intelligent', effect: '+40% Intelligence' },
    { name: 'Echolot-Sonar', icon: '📡', description: 'Perfektes Sonar', effect: '+35% Echolocation' },
    { name: 'Sprung-Akrobat', icon: '🤸', description: 'Spektakuläre Sprünge', effect: '+40% Jumping' }
  ],
  shark: [
    { name: 'Kiefermeister', icon: '🦈', description: 'Stärkste Bisse', effect: '+50% Bite' },
    { name: 'Blutspürer', icon: '🩸', description: 'Riecht alles im Wasser', effect: '+40% Smell' },
    { name: 'Raubtier-Instinkt', icon: '⚡', description: 'Perfekter Jäger', effect: '+45% Hunting' }
  ],
  octopus: [
    { name: 'Intelligenz-Wunder', icon: '🧠', description: 'Extrem intelligent', effect: '+45% Intelligence' },
    { name: 'Farb-Wechsel', icon: '🎨', description: 'Magische Farbänderung', effect: '+40% Color Changing' },
    { name: 'Tintenwolke', icon: '🌫️', description: 'Flucht-Nebelwolke', effect: '+35% Escape' }
  ],
  seahorse: [
    { name: 'Anmut-Bewegung', icon: '💃', description: 'Elegante Fortbewegung', effect: '+30% Grace' },
    { name: 'Seepferdchen-Magie', icon: '✨', description: 'Mystisches Wesen', effect: '+25% Mystique' },
    { name: 'Schwangerschaften-Väter', icon: '👨‍👶', description: 'Einzigartig: Männer tragen Eier!', effect: '+20% Uniqueness' }
  ],
  turtle: [
    { name: 'Panzer-Meister', icon: '🛡️', description: 'Extreme Rüstung', effect: '+45% Defense' },
    { name: 'Langlebigkeit-Geist', icon: '⏳', description: '150+ Jahre Leben', effect: '+40% Longevity' },
    { name: 'Wasser-Taucher', icon: '🫧', description: 'Perfekte Schwimmer', effect: '+35% Swimming' }
  ],
  jellyfish: [
    { name: 'Nessel-Gift', icon: '☠️', description: 'Brennende Tentakel', effect: '+35% Sting' },
    { name: 'Transparent-Körper', icon: '👻', description: 'Fast unsichtbar', effect: '+40% Invisibility' },
    { name: 'Glühende Schönheit', icon: '✨', description: 'Leuchtet im Dunkeln', effect: '+30% Bioluminescence' }
  ],
  orca: [
    { name: 'Super-Predator', icon: '🦈', description: 'Mächtigster Meeresräuber', effect: '+50% Hunting' },
    { name: 'Intelligenz-König', icon: '🧠', description: 'Klügstes Meerestier', effect: '+45% Intelligence' },
    { name: 'Sozial-Meister', icon: '👨‍👩‍👧‍👦', description: 'Starke Familie Bindung', effect: '+35% Sociability' }
  ],
  manta_ray: [
    { name: 'Eleganter Gleiter', icon: '🪁', description: 'Tanzt durchs Wasser', effect: '+40% Grace' },
    { name: 'Flügelspannweite', icon: '🪃', description: 'Massive Flügel', effect: '+35% Size' },
    { name: 'Seiher-Schwimmer', icon: '🫧', description: 'Filter-Fütterung', effect: '+20% Filtering' }
  ],
  clownfish: [
    { name: 'Anemonen-Freund', icon: '🐠', description: 'Lebt in Anemonen', effect: '+25% Symbiosis' },
    { name: 'Orange-Charme', icon: '🟠', description: 'Liebenswert süß', effect: '+30% Charm' },
    { name: 'Kleine Flinker', icon: '⚡', description: 'Schnell und behende', effect: '+30% Agility' }
  ],
  sea_otter: [
    { name: 'Werkzeug-Meister', icon: '🔨', description: 'Benutzt Werkzeuge', effect: '+35% Tool Use' },
    { name: 'Niedlichkeits-König', icon: '✨', description: 'Extrem süß!', effect: '+45% Cuteness' },
    { name: 'Taucher-Meister', icon: '🫧', description: 'Tauchkünstler', effect: '+40% Diving' }
  ],
  manatee: [
    { name: 'Sanfter Riese', icon: '🫶', description: 'Liebevoll & friedlich', effect: '+35% Gentleness' },
    { name: 'Seegras-Liebhaber', icon: '🌿', description: 'Vegetarisch', effect: '+25% Herbivore' },
    { name: 'Langsamkeit-Meister', icon: '🐢', description: 'Absichtlich langsam', effect: '+20% Serenity' }
  ],
  starfish: [
    { name: 'Arm-Wunder', icon: '⭐', description: 'Kann Arme regenerieren', effect: '+30% Regeneration' },
    { name: 'Stein-Körper', icon: '🪨', description: 'Hart wie Stein', effect: '+25% Hardness' },
    { name: 'Mehrfach-Augen', icon: '👁️', description: 'Auge an jedem Arm', effect: '+25% Vision' }
  ],
  blue_whale: [
    { name: 'Größte Tier Erde', icon: '🐋', description: 'Massiver Gigant', effect: '+50% Size' },
    { name: 'Lied-Sänger', icon: '🎶', description: 'Melodisches Brüllen', effect: '+35% Singing' },
    { name: 'Filter-König', icon: '🫧', description: 'Filter-Fresser', effect: '+30% Filtering' }
  ],
  hammerhead_shark: [
    { name: 'Sensoren-Meister', icon: '📡', description: 'Beste Elektrischen Sensoren', effect: '+45% Sensing' },
    { name: 'Hammer-Kopf', icon: '🔨', description: 'Merkwürdige aber effektiv', effect: '+35% Unique Design' },
    { name: 'Macht-Predator', icon: '🦈', description: 'Effizienter Jäger', effect: '+40% Hunting' }
  ],
  pufferfish: [
    { name: 'Gift-Körper', icon: '☠️', description: 'Extrem giftig', effect: '+50% Toxin' },
    { name: 'Aufblas-Abwehr', icon: '💨', description: 'Bläst sich auf', effect: '+40% Defense Expand' },
    { name: 'Kleiner aber tödlich', icon: '⚡', description: 'Killer klein', effect: '+30% Venom Strike' }
  ],

  // Nachthaus
  bat: [
    { name: 'Ultraschall-Sonar', icon: '📡', description: 'Perfektes Echolot', effect: '+45% Echolocation' },
    { name: 'Nacht-Flieger', icon: '🌙', description: 'Fliegt bei Nacht', effect: '+40% Night Flight' },
    { name: 'Fenstermeister', icon: '🪟', description: 'Wendet geschickt', effect: '+35% Maneuverability' }
  ],
  raccoon: [
    { name: 'Dieb-König', icon: '🦝', description: 'Laut & chaotisch', effect: '+35% Thievery' },
    { name: 'Handgeschicklichkeit', icon: '🙌', description: 'Extrem geschickte Pfoten', effect: '+40% Dexterity' },
    { name: 'Schlaue Tricks', icon: '🎭', description: 'Listige Tricks', effect: '+30% Cunning' }
  ],
  firefly: [
    { name: 'Bio-Leuchten', icon: '✨', description: 'Glüht im Dunkeln', effect: '+40% Bioluminescence' },
    { name: 'Nacht-Tänzer', icon: '💃', description: 'Tanzt Lichtwellen', effect: '+30% Dancing' },
    { name: 'Leuchtende Schönheit', icon: '🌟', description: 'Magische Ausstrahlung', effect: '+35% Beauty' }
  ],
  sugar_glider: [
    { name: 'Gleitflug-Kunstwerk', icon: '🪂', description: 'Elegante Flügel', effect: '+40% Gliding' },
    { name: 'Niedlichkeits-Aura', icon: '✨', description: 'Mega süß!', effect: '+45% Cuteness' },
    { name: 'Baum-Turner', icon: '🌳', description: 'Akrobat der Bäume', effect: '+35% Acrobatics' }
  ],
  kiwi: [
    { name: 'Nacht-Schnüffler', icon: '🌙', description: 'Jäger bei Nacht', effect: '+40% Night Hunt' },
    { name: 'Langbein-Läufer', icon: '🦵', description: 'Schnelle Beine', effect: '+30% Running' },
    { name: 'Flügellos aber wild', icon: '🔥', description: 'Keine Flügel Nötig!', effect: '+25% Toughness' }
  ],
  tarsier: [
    { name: 'Augen-Wunder', icon: '👁️', description: 'Riesige Augen', effect: '+50% Vision' },
    { name: 'Nacht-Seher', icon: '🌙', description: 'Extrem Nachtsicht', effect: '+45% Night Vision' },
    { name: 'Sprung-Meister', icon: '🦘', description: '40x Körperlänge Sprung', effect: '+40% Jumping' }
  ],
  aye_aye: [
    { name: 'Finger-Wunder', icon: '👆', description: 'Lange Mittelfinger', effect: '+35% Finger Dexterity' },
    { name: 'Insekten-Jäger', icon: '🐛', description: 'Findet Larven in Bäumen', effect: '+40% Larva Hunting' },
    { name: 'Nacht-Krieger', icon: '🌙', description: 'Nur nachts aktiv', effect: '+35% Night Activity' }
  ],

  // Australien
  kangaroo: [
    { name: 'Sprung-König', icon: '🦘', description: '3m hohe Sprünge', effect: '+50% Jumping' },
    { name: 'Beutel-Mama', icon: '👜', description: 'Trägt Babys', effect: '+30% Carrying' },
    { name: 'Hüpf-Ausdauer', icon: '💨', description: 'Kann stundenlang hüpfen', effect: '+40% Endurance' }
  ],
  wombat: [
    { name: 'Grab-Meister', icon: '🕳️', description: 'Bohrt in den Boden', effect: '+40% Digging' },
    { name: 'Würfel-Kot', icon: '📦', description: 'Einzigartige Markierung', effect: '+25% Marking' },
    { name: 'Panzer-Körper', icon: '🛡️', description: 'Kleine aber HART', effect: '+35% Toughness' }
  ],
  platypus: [
    { name: 'Schnabel-Wunder', icon: '🦆', description: 'Schnabel-Sensorik', effect: '+40% Sensing' },
    { name: 'Gift-Sporn', icon: '☠️', description: 'Männlich: Giftig', effect: '+30% Poison Spur' },
    { name: 'Eilegend-Säuger', icon: '🥚', description: 'Extrem seltsam!', effect: '+25% Uniqueness' }
  ],
  tasmanian_devil: [
    { name: 'Lautheits-König', icon: '📣', description: 'Ohrenbetäubendes Gebrüll', effect: '+40% Screech' },
    { name: 'Fleisch-Fresser-Kraft', icon: '🍖', description: 'Stärkste Bisse', effect: '+45% Bite Force' },
    { name: 'Chaos-König', icon: '💥', description: 'Wilde Energie', effect: '+35% Chaotic Energy' }
  ],
  echidna: [
    { name: 'Stachel-Panzer', icon: '🦔', description: 'Vollständig gepanzert', effect: '+45% Defense' },
    { name: 'Ameisen-Esser', icon: '🐜', description: 'Spitzzunge-Jäger', effect: '+30% Ant Hunting' },
    { name: 'Eilegend-Monotrem', icon: '🥚', description: 'Sehr selten!', effect: '+25% Rarity' }
  ],
  wallaby: [
    { name: 'Kleine Känguru-Kraft', icon: '🦘', description: 'Mini aber machtvoll', effect: '+35% Jumping' },
    { name: 'Schnelle Flucht', icon: '💨', description: 'Blitzschnell weg', effect: '+35% Escape' },
    { name: 'Busch-Navigiert', icon: '🌿', description: 'Kennt buschland', effect: '+30% Bush Navigation' }
  ],
  kookaburra: [
    { name: 'Lachen-Vogel', icon: '😂', description: 'Lautes Lachen-Gebrüll', effect: '+40% Laughing' },
    { name: 'Flug-Meister', icon: '🦅', description: 'Geschickter Flüger', effect: '+30% Flying' },
    { name: 'Jäger-Vogel', icon: '🐍', description: 'Jagt Schlangen', effect: '+35% Hunting' }
  ],

  // Vögel
  eagle: [
    { name: 'König der Lüfte', icon: '🦅', description: 'Herrscht am Himmel', effect: '+50% Flying' },
    { name: 'Scharfsicht-Augen', icon: '👁️', description: 'Sieht 8x weiter', effect: '+50% Vision' },
    { name: 'Krallen-Kraft', icon: '🪶', description: 'Stärkste Klauen', effect: '+45% Talon Grip' }
  ],
  flamingo: [
    { name: 'Rosa-Schönheit', icon: '🩩', description: 'Leuchtend rosa', effect: '+40% Beauty' },
    { name: 'Beinen-Filter', icon: '🦵', description: 'Filtert Wasser', effect: '+30% Filtering' },
    { name: 'Sozial-Vogel', icon: '👥', description: 'Liebt Gruppen', effect: '+35% Sociability' }
  ],
  swan: [
    { name: 'Eleganz-König', icon: '🢣', description: 'Höchste Anmut', effect: '+45% Grace' },
    { name: 'Treue-Vögel', icon: '❤️', description: 'Lebenslang verbunden', effect: '+35% Loyalty' },
    { name: 'Schwan-Flug', icon: '🦢', description: 'Majestätischer Flug', effect: '+40% Flying' }
  ],
  pelican: [
    { name: 'Taschenmesser', icon: '🥄', description: 'Massive Tasche', effect: '+40% Pouch' },
    { name: 'Fisch-Fänger', icon: '🐟', description: 'Effizienter Fischer', effect: '+40% Fishing' },
    { name: 'Große Flügelspanne', icon: '🪶', description: 'Massive Flügel', effect: '+35% Wing Span' }
  ],
  stork: [
    { name: 'Baby-Bringer', icon: '👶', description: 'Legendäre Legende', effect: '+25% Delivery' },
    { name: 'Stelzbein-König', icon: '🦵', description: 'Super lange Beine', effect: '+30% Height' },
    { name: 'Übergangs-Vogel', icon: '🌍', description: 'Kennt alle Länder', effect: '+25% Migration' }
  ],
  crane: [
    { name: 'Tanz-Meister', icon: '💃', description: 'Elegante Tänzerin', effect: '+45% Dancing' },
    { name: 'Langlebig', icon: '⏳', description: 'Lebt bis 60 Jahre', effect: '+35% Longevity' },
    { name: 'Anmut-Bewegung', icon: '✨', description: 'Schönster Vogel', effect: '+40% Grace' }
  ],
  hummingbird: [
    { name: 'Flügel-Blitz', icon: '⚡', description: '80 Schläge pro Sekunde', effect: '+50% Wing Speed' },
    { name: 'Schwebeflug', icon: '🪂', description: 'Kann stille stehen', effect: '+40% Hovering' },
    { name: 'Nektarjäger', icon: '🌺', description: 'Süßstoff-Liebhaber', effect: '+30% Nectar Hunting' }
  ],
  kingfisher: [
    { name: 'Fisch-Jagd', icon: '🐟', description: 'Perfekter Fischer', effect: '+45% Fishing' },
    { name: 'Tauch-Meister', icon: '🫧', description: 'Präzisions-Taucher', effect: '+40% Diving' },
    { name: 'Blaue Schönheit', icon: '💎', description: 'Funkelnde Federn', effect: '+35% Beauty' }
  ],
  hornbill: [
    { name: 'Schnabel-Monströs', icon: '🦅', description: 'Riesige Schnabel', effect: '+30% Beak Size' },
    { name: 'Kaskettenhelm', icon: '🪖', description: 'Helmartiger Schnabel', effect: '+30% Head Defense' },
    { name: 'Partner-Vogel', icon: '❤️', description: 'Bleibt seinem Partner', effect: '+35% Loyalty' }
  ],

  // Reptilien & Amphibien
  crocodile: [
    { name: 'Unterwasser-König', icon: '🐊', description: 'Perfekter Predator', effect: '+45% Hunting' },
    { name: 'Steinbeißer', icon: '🦷', description: 'Stärkste Bisse aller Reptilien', effect: '+50% Bite' },
    { name: 'Taucher-Meister', icon: '🫧', description: 'Unterseeischer Jäger', effect: '+40% Diving' }
  ],
  alligator: [
    { name: 'Sumpf-König', icon: '🏞️', description: 'Beherrscht Sümpfe', effect: '+40% Swamp Mastery' },
    { name: 'Kiefer-Kraft', icon: '🦷', description: 'Knackt Knochen', effect: '+45% Bite Force' },
    { name: 'Ausdauer-Taucher', icon: '🫧', description: 'Stundenlang unter Wasser', effect: '+40% Breath Hold' }
  ],
  komodo_dragon: [
    { name: 'Insel-König', icon: '👑', description: 'Beherrscht seine Insel', effect: '+45% Dominance' },
    { name: 'Gift-Speichel', icon: '☠️', description: 'Giftiger Speichel', effect: '+40% Venom' },
    { name: 'Größter Echse', icon: '📏', description: '3m lange Monster', effect: '+40% Size' }
  ],
  gecko: [
    { name: 'Wandkletterer', icon: '🧗', description: 'Klettert überall', effect: '+45% Climbing' },
    { name: 'Nachtsicht-Meister', icon: '🌙', description: 'Perfekter Nachtsicht', effect: '+40% Night Vision' },
    { name: 'Schwanz-Abwurf', icon: '🪜', description: 'Wirft Schwanz ab zur Flucht', effect: '+30% Escape' }
  ],
  poison_dart_frog: [
    { name: 'Leuchtend giftig', icon: '☠️', description: 'Das giftigste Tier', effect: '+50% Toxin' },
    { name: 'Farben-Warnung', icon: '🌈', description: 'Warnt mit Farben', effect: '+30% Warning Display' },
    { name: 'Kleine Killer', icon: '☠️', description: 'Tiny aber tödlich', effect: '+35% Venom Strike' }
  ],

  // Insekten
  butterfly: [
    { name: 'Metamorphose-Wunder', icon: '🦋', description: 'Magische Verwandlung', effect: '+40% Transformation' },
    { name: 'Flügel-Kunstwerk', icon: '🎨', description: 'Lebende Kunstwerk', effect: '+40% Beauty' },
    { name: 'Pollen-Tänzer', icon: '🌺', description: 'Tanzt zwischen Blüten', effect: '+30% Dancing' }
  ],
  ladybug: [
    { name: 'Punkt-Glücksbringer', icon: '🍀', description: 'Bringt Glück', effect: '+35% Luck' },
    { name: 'Blattläuse-Jäger', icon: '🐛', description: 'Isst Schädlinge', effect: '+30% Pest Control' },
    { name: 'Rote Schönheit', icon: '❤️', description: 'Leuchtend rot', effect: '+25% Beauty' }
  ],
  dragonfly: [
    { name: 'Luft-Akrobat', icon: '🛩️', description: 'Kann in alle Richtungen', effect: '+50% Flight Maneuver' },
    { name: 'Jäger-Augen', icon: '👁️', description: 'Sieht 300° rundum', effect: '+45% Vision' },
    { name: 'Luftschänder', icon: '💨', description: 'Schnellste Insekten', effect: '+45% Speed' }
  ],
  praying_mantis: [
    { name: 'Jäger-Meister', icon: '🎯', description: 'Perfekter Präzisions-Jäger', effect: '+50% Hunting' },
    { name: 'Schnell-Reflexe', icon: '⚡', description: 'Schnellste Reflexe', effect: '+45% Reflexes' },
    { name: 'Gebet-Haltung', icon: '🙏', description: 'Mystische Pose', effect: '+25% Mystique' }
  ],
};

/**
 * Generiert einen kreativen Namen für ein Tier
 * Nutzt einen Seed (basierend auf userID + animalCardID) um konsistente Namen zu erstellen
 */
export function generateAnimalName(animalType: ZooAnimal, seed: string): string {
  const templates = ANIMAL_NAME_TEMPLATES[animalType];
  if (!templates || templates.length === 0) {
    return `${animalType} #${seed.substring(0, 4)}`;
  }

  // Nutze den Seed um einen konsistenten Index zu wählen
  let hashValue = 0;
  for (let i = 0; i < seed.length; i++) {
    hashValue = ((hashValue << 5) - hashValue) + seed.charCodeAt(i);
    hashValue = hashValue & hashValue; // Convert to 32-bit integer
  }

  const index = Math.abs(hashValue) % templates.length;
  return templates[index];
}

/**
 * Gibt die Talente eines Tieres zurück
 */
export function getAnimalTalents(animalType: ZooAnimal): AnimalTalent[] {
  return ANIMAL_TALENTS[animalType] || [];
}

/**
 * Gibt die Persönlichkeit eines Tieres zurück
 */
export function getAnimalPersonality(animalType: ZooAnimal): AnimalPersonality {
  return ANIMAL_PERSONALITIES[animalType] || { adjectives: ['Geheimnisvoll'], essence: 'Unbekanntes Wesen' };
}

// 🤝 TEAM-SYNERGIEN - Wie Eigenschaften sich ergänzen
export interface TeammingSynergy {
  description: string;
  bonus: string;
  compatibility: number; // 0-100
}

// Adjektive die gut zusammenpassen
const SYNERGY_MATRIX: Record<string, Record<string, TeammingSynergy>> = {
  'Mutig': {
    'Weise': { description: 'Mut trifft Bedacht', bonus: '+15% Strategie', compatibility: 90 },
    'Sanft': { description: 'Starker Schutz für Schwache', bonus: '+20% Teamschutz', compatibility: 85 },
    'Intelligent': { description: 'Mutiges Denken', bonus: '+18% Innovativ', compatibility: 88 },
    'Schnell': { description: 'Blitzangriffe', bonus: '+25% Angriffsspeed', compatibility: 92 },
  },
  'Weise': {
    'Geduldig': { description: 'Überlegte Entscheidungen', bonus: '+20% Planungskraft', compatibility: 95 },
    'Sanft': { description: 'Kluge Güte', bonus: '+18% Heilung', compatibility: 88 },
    'Intelligent': { description: 'Geistiger Austausch', bonus: '+22% Wissen', compatibility: 93 },
  },
  'Sanft': {
    'Sozial': { description: 'Großartige Teamfähigkeit', bonus: '+25% Teamkraft', compatibility: 96 },
    'Liebevoll': { description: 'Emotionale Bindung', bonus: '+20% Friendship', compatibility: 94 },
    'Geduldig': { description: 'Beruhigende Kraft', bonus: '+18% Entspannung', compatibility: 90 },
  },
  'Schnell': {
    'Scharf': { description: 'Blitzschnelle Jäger', bonus: '+30% Jagdspeed', compatibility: 95 },
    'Intelligent': { description: 'Strategische Eile', bonus: '+20% Koordination', compatibility: 88 },
    'Flink': { description: 'Unaufhaltbar schnell', bonus: '+35% Sprint', compatibility: 98 },
  },
  'Intelligent': {
    'Nachdenklich': { description: 'Tiefes Verständnis', bonus: '+22% Strategie', compatibility: 92 },
    'Kreativ': { description: 'Innovative Lösungen', bonus: '+25% Kreativität', compatibility: 90 },
    'Scharf': { description: 'Mentale Schärfe', bonus: '+20% Fokus', compatibility: 89 },
  },
  'Stark': {
    'Mutig': { description: 'Unaufhaltsame Kraft', bonus: '+28% Angriffspower', compatibility: 95 },
    'Ausdauernd': { description: 'Ewige Stärke', bonus: '+30% Durchhaltevermögen', compatibility: 96 },
    'Kraftvoll': { description: 'Doppelte Kraft', bonus: '+40% Basiskraft', compatibility: 98 },
  },
  'Sozial': {
    'Liebevoll': { description: 'Starke Bindung', bonus: '+25% Teamgeist', compatibility: 96 },
    'Sanft': { description: 'Harmonische Gruppe', bonus: '+22% Eintracht', compatibility: 93 },
    'Gesellig': { description: 'Lebhafte Gruppe', bonus: '+20% Energieschub', compatibility: 90 },
  },
  'Elegant': {
    'Anmutig': { description: 'Tänzer der Schlacht', bonus: '+22% Ausweich', compatibility: 94 },
    'Schön': { description: 'Betörendes Charisma', bonus: '+18% Charme', compatibility: 89 },
    'Fein': { description: 'Raffinierte Bewegung', bonus: '+20% Balance', compatibility: 92 },
  },
  'Lustig': {
    'Spielerisch': { description: 'Freudiger Team', bonus: '+15% Moral', compatibility: 88 },
    'Sozial': { description: 'Lebendiger Gruppengeist', bonus: '+20% Gruppenchemi', compatibility: 90 },
  },
  'Mystisch': {
    'Geheimnisvoll': { description: 'Unergründliche Macht', bonus: '+20% Mystik-Bonus', compatibility: 91 },
    'Magisch': { description: 'Übernatürliche Kraft', bonus: '+25% Magie', compatibility: 93 },
  },
};

/**
 * Berechnet die Synergien eines Teams basierend auf Tier-Persönlichkeiten
 */
export function calculateTeamSynergies(animalTypes: ZooAnimal[]): {
  totalCompatibility: number;
  synergies: string[];
  power: string;
  teamEssence: string;
} {
  if (animalTypes.length < 2) {
    return {
      totalCompatibility: 0,
      synergies: [],
      power: 'Solo',
      teamEssence: 'Ein einzelner Held'
    };
  }

  const personalities = animalTypes.map(type => getAnimalPersonality(type));
  const allAdjectives = personalities.flatMap(p => p.adjectives);
  
  let totalCompatibility = 0;
  const synergies: string[] = [];
  
  // Finde Synergien zwischen Adjektiven
  for (let i = 0; i < allAdjectives.length; i++) {
    for (let j = i + 1; j < allAdjectives.length; j++) {
      const adj1 = allAdjectives[i];
      const adj2 = allAdjectives[j];
      
      if (SYNERGY_MATRIX[adj1]?.[adj2]) {
        const syn = SYNERGY_MATRIX[adj1][adj2];
        synergies.push(`${syn.description} ${syn.bonus}`);
        totalCompatibility += syn.compatibility;
      } else if (SYNERGY_MATRIX[adj2]?.[adj1]) {
        const syn = SYNERGY_MATRIX[adj2][adj1];
        synergies.push(`${syn.description} ${syn.bonus}`);
        totalCompatibility += syn.compatibility;
      }
    }
  }
  
  // Durchschnitt berechnen
  const avgCompatibility = synergies.length > 0 
    ? Math.round(totalCompatibility / synergies.length)
    : 50;
  
  // Power-Level bestimmen
  let power = 'Schwach';
  if (avgCompatibility >= 90) power = '🔥 LEGENDÄR - Perfekte Harmonie!';
  else if (avgCompatibility >= 80) power = '💪 STARK - Hervorragende Synergie!';
  else if (avgCompatibility >= 70) power = '⚡ GUT - Solide Zusammenarbeit';
  else if (avgCompatibility >= 60) power = '💫 NORMAL - Annehmbare Kombi';
  else power = '✨ EXPERIMENTELL - Interessant!';

  // Team-Essenz
  const essences = personalities.map(p => p.essence);
  const teamEssence = `Team aus ${essences.join(' + ')}`;

  return {
    totalCompatibility: avgCompatibility,
    synergies: Array.from(new Set(synergies)),
    power,
    teamEssence
  };
}
