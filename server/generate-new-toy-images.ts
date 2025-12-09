
import { generateAndSaveImage } from './imageGenerator';

const toyPrompts = [
  {
    prompt: "Bundle of bamboo sticks arranged as a toy for pandas, playful zoo enrichment item, bright green bamboo, clean white background, children's educational illustration style, cheerful and inviting",
    filename: "Bamboo_sticks_toy_45a7b3c2.png"
  },
  {
    prompt: "Round mirror on a stand as animal enrichment toy, reflective surface, sturdy wooden base, clean white background, children's educational illustration style, safe zoo toy design",
    filename: "Mirror_toy_for_animals_89d4e1f6.png"
  },
  {
    prompt: "Cat scratching post with rope wrapping, sturdy tree-like design for big cats, beige and brown colors, clean white background, children's educational illustration style, robust zoo enrichment",
    filename: "Scratching_post_toy_c2f5a9b7.png"
  },
  {
    prompt: "Floating platform raft for seals and penguins, blue and white colors, sun lounging spot, clean white background, children's educational illustration style, aquatic zoo enrichment",
    filename: "Floating_platform_toy_3e8d2c5a.png"
  },
  {
    prompt: "Hollow log tunnel as animal hiding spot, natural brown bark texture, cozy entrance, clean white background, children's educational illustration style, natural zoo enrichment",
    filename: "Hollow_log_toy_7b9f4d3e.png"
  },
  {
    prompt: "Exercise wheel for small animals, colorful running wheel with metal frame, clean white background, children's educational illustration style, fun hamster-style enrichment",
    filename: "Hamster_wheel_toy_5c3a8f2d.png"
  },
  {
    prompt: "Large chew toy bone for bears and foxes, durable white and brown bone shape, clean white background, children's educational illustration style, safe zoo enrichment toy",
    filename: "Chew_bone_toy_9e2d7c4a.png"
  },
  {
    prompt: "Hanging puzzle feeder box with holes, wooden enrichment toy dangling from rope, brown and natural wood colors, clean white background, children's educational illustration style, interactive feeding toy",
    filename: "Hanging_feeder_puzzle_6f8a3e1b.png"
  },
  {
    prompt: "Frozen fruit ice treats on sticks, colorful popsicles with berries, refreshing summer enrichment, clean white background, children's educational illustration style, healthy animal treats",
    filename: "Ice_treats_toy_4d9c2a7f.png"
  },
  {
    prompt: "Bubble machine toy with floating soap bubbles, magical rainbow bubbles, playful zoo enrichment device, clean white background, children's educational illustration style, whimsical and fun",
    filename: "Bubble_machine_toy_8a5e3d2c.png"
  },
  {
    prompt: "Treasure chest toy with hidden treats, golden chest with lock, puzzle enrichment for clever animals, clean white background, children's educational illustration style, exciting discovery game",
    filename: "Treasure_chest_toy_2b7f9e4a.png"
  },
  {
    prompt: "Sound enrichment toy with bells and chimes, musical animal toy with colorful bells, auditory stimulation device, clean white background, children's educational illustration style, sensory enrichment",
    filename: "Sound_enrichment_toy_5e3c8a2d.png"
  }
];

async function generateNewToyImages() {
  console.log('🎨 Generating 12 new toy images...');
  
  for (let i = 0; i < toyPrompts.length; i++) {
    const { prompt, filename } = toyPrompts[i];
    console.log(`\n[${i + 1}/12] Generating: ${filename}`);
    
    try {
      await generateAndSaveImage(prompt, filename);
      console.log(`✅ Success: ${filename}`);
      
      // Warte 2 Sekunden zwischen den Requests
      if (i < toyPrompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${filename}:`, error);
    }
  }
  
  console.log('\n🎉 Finished generating toy images!');
}

generateNewToyImages().catch(console.error);
