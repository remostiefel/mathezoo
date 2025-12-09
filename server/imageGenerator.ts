import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Function to get a lazy OpenAI client instance
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.');
  }
  return new OpenAI({ apiKey });
}

// Basis-Stil für alle Tierbilder (konsistent mit bestehenden)
const BASE_ANIMAL_STYLE = `
Cute, child-friendly portrait illustration in a circular frame.
Photorealistic but warm and inviting style suitable for children aged 6-10.
Soft pastel background colors, high detail, professional digital art.
The animal should look friendly and approachable.
No text, no background objects, just the animal portrait.
PNG format with transparent or soft gradient background.
`;

// Geschlechts-spezifische Merkmale
const GENDER_TRAITS = {
  male: {
    lion: 'with majestic mane',
    deer: 'with antlers',
    peacock: 'with colorful tail feathers spread',
    elephant: 'with larger tusks',
    general: 'slightly larger build, strong features'
  },
  female: {
    lion: 'without mane, sleek face',
    deer: 'without antlers, gentle features',
    peacock: 'with subtle brown feathers',
    elephant: 'with smaller tusks, gentle eyes',
    general: 'graceful features, nurturing expression'
  }
};

interface AnimalImageRequest {
  animalType: string;
  animalName: string;
  age: 'baby' | 'male' | 'female';
  existingStyle?: string;
}

interface ShopItemRequest {
  itemType: 'toy' | 'food' | 'decoration' | 'habitat';
  itemName: string;
  description: string;
}

export async function generateAnimalImage(request: AnimalImageRequest): Promise<string> {
  const { animalType, animalName, age } = request;

  let prompt = '';

  if (age === 'baby') {
    prompt = `Baby ${animalName} portrait. ${BASE_ANIMAL_STYLE}
    The baby should look adorable, small, with big innocent eyes.
    Soft, fluffy appearance. Playful and curious expression.`;
  } else if (age === 'male') {
    const trait = GENDER_TRAITS.male[animalType as keyof typeof GENDER_TRAITS.male] || GENDER_TRAITS.male.general;
    prompt = `Adult male ${animalName} portrait ${trait}. ${BASE_ANIMAL_STYLE}
    Proud, strong stance. Masculine features clearly visible.`;
  } else {
    const trait = GENDER_TRAITS.female[animalType as keyof typeof GENDER_TRAITS.female] || GENDER_TRAITS.female.general;
    prompt = `Adult female ${animalName} portrait ${trait}. ${BASE_ANIMAL_STYLE}
    Gentle, nurturing expression. Feminine features clearly visible.`;
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) throw new Error('No image URL returned');

    // Download und speichern
    const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());
    const hash = crypto.createHash('md5').update(Buffer.from(imageBuffer)).digest('hex').substring(0, 8);
    const filename = `${age}_${animalType}_portrait_${hash}.png`;
    const filepath = path.join(process.cwd(), 'client', 'src', 'assets', 'generated_images', filename);

    await fs.writeFile(filepath, Buffer.from(imageBuffer));
    console.log(`✅ Generated: ${filename}`);

    return filename;
  } catch (error) {
    console.error(`❌ Failed to generate ${age} ${animalName}:`, error);
    throw error;
  }
}

export async function generateShopItemImage(request: ShopItemRequest): Promise<string> {
  const { itemType, itemName, description } = request;

  let styleGuide = '';

  if (itemType === 'toy') {
    styleGuide = `Colorful, safe-looking children's toy for zoo animals.
    Bright colors (red, blue, yellow, green). Child-friendly design.
    3D-looking but flat illustration style. Clean, modern appearance.`;
  } else if (itemType === 'food') {
    styleGuide = `Fresh, appetizing animal food item.
    Natural colors, healthy appearance. Realistic but illustrated style.
    Clear, recognizable food type.`;
  } else if (itemType === 'decoration') {
    styleGuide = `Beautiful zoo decoration or landscape element.
    Vibrant colors, nature-inspired. Welcoming, peaceful atmosphere.`;
  } else if (itemType === 'habitat') {
    styleGuide = `Lush zoo habitat illustration.
    Rich environment with appropriate vegetation and terrain.
    Inviting, spacious feeling. Suitable for animals.`;
  }

  const prompt = `${itemName}: ${description}. ${styleGuide}
  Digital art, flat design style, no background or soft gradient background.
  High quality, suitable for children's educational app. PNG format.`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) throw new Error('No image URL returned');

    const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());
    const hash = crypto.createHash('md5').update(Buffer.from(imageBuffer)).digest('hex').substring(0, 8);
    const filename = `${itemName.replace(/\s+/g, '_')}_${hash}.png`;
    const filepath = path.join(process.cwd(), 'client', 'src', 'assets', 'generated_images', filename);

    await fs.writeFile(filepath, Buffer.from(imageBuffer));
    console.log(`✅ Generated shop item: ${filename}`);

    return filename;
  } catch (error) {
    console.error(`❌ Failed to generate ${itemName}:`, error);
    throw error;
  }
}

// Batch-Generator für alle fehlenden Tierbilder
export async function generateAllMissingAnimalImages() {
  const animals = [
    { type: 'lion', name: 'Löwe' },
    { type: 'elephant', name: 'Elefant' },
    { type: 'giraffe', name: 'Giraffe' },
    { type: 'zebra', name: 'Zebra' },
    { type: 'rhino', name: 'Nashorn' },
    { type: 'hippo', name: 'Nilpferd' },
    { type: 'cheetah', name: 'Gepard' },
    { type: 'hyena', name: 'Hyäne' },
    { type: 'ostrich', name: 'Strauß' },
    { type: 'leopard', name: 'Leopard' },
    { type: 'flamingo', name: 'Flamingo' },
    { type: 'tiger', name: 'Tiger' },
    { type: 'panda', name: 'Panda' },
    { type: 'red_panda', name: 'Roter Panda' },
    { type: 'peacock', name: 'Pfau' },
    { type: 'snake', name: 'Schlange' },
    { type: 'monkey', name: 'Affe' },
    { type: 'gorilla', name: 'Gorilla' },
    { type: 'orangutan', name: 'Orang-Utan' },
    { type: 'toucan', name: 'Tukan' },
    { type: 'parrot', name: 'Papagei' },
    { type: 'sloth', name: 'Faultier' },
    { type: 'bat', name: 'Fledermaus' },
    { type: 'raccoon', name: 'Waschbär' },
    { type: 'rabbit', name: 'Hase' },
    { type: 'fox', name: 'Fuchs' },
    { type: 'deer', name: 'Reh' },
    { type: 'hedgehog', name: 'Igel' },
    { type: 'owl', name: 'Eule' },
    { type: 'penguin', name: 'Pinguin' },
    { type: 'polar_bear', name: 'Eisbär' },
    { type: 'seal', name: 'Robbe' },
    { type: 'walrus', name: 'Walross' },
    { type: 'arctic_fox', name: 'Polarfuchs' },
    { type: 'camel', name: 'Kamel' },
    { type: 'scorpion', name: 'Skorpion' },
    { type: 'fennec_fox', name: 'Wüstenfuchs' },
    { type: 'dolphin', name: 'Delfin' },
    { type: 'shark', name: 'Hai' },
    { type: 'octopus', name: 'Oktopus' },
    { type: 'seahorse', name: 'Seepferdchen' },
    { type: 'turtle', name: 'Schildkröte' },
    { type: 'jellyfish', name: 'Qualle' },
    { type: 'firefly', name: 'Glühwürmchen' },
    { type: 'kangaroo', name: 'Känguru' },
    { type: 'wombat', name: 'Wombat' },
    { type: 'platypus', name: 'Schnabeltier' },
    { type: 'eagle', name: 'Adler' },
    { type: 'swan', name: 'Schwan' },
    { type: 'koala', name: 'Koala' }
  ];

  const results = {
    male: [] as string[],
    female: [] as string[]
  };

  console.log(`🎨 Starting generation of ${animals.length * 2} images (male + female)...`);
  console.log(`⏱️ Estimated time: ~${animals.length * 2 * 15} seconds (rate limit: ~4 images/minute)`);

  for (const animal of animals) {
    try {
      // Männchen generieren
      const maleFile = await generateAnimalImage({
        animalType: animal.type,
        animalName: animal.name,
        age: 'male'
      });
      results.male.push(maleFile);

      // Rate limiting: 3 Bilder/Minute = 20 Sekunden Pause
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Weibchen generieren
      const femaleFile = await generateAnimalImage({
        animalType: animal.type,
        animalName: animal.name,
        age: 'female'
      });
      results.female.push(femaleFile);

      await new Promise(resolve => setTimeout(resolve, 20000));

      console.log(`✅ Completed ${animal.name}: ${results.male.length + results.female.length}/${animals.length * 2}`);
    } catch (error) {
      console.error(`❌ Failed for ${animal.name}:`, error);
    }
  }

  return results;
}