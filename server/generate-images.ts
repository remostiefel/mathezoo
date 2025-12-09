
import { generateAllMissingAnimalImages } from './imageGenerator';

async function main() {
  console.log('🎨 Starting batch generation of all missing animal images...');
  console.log('⚠️ This will take approximately 40-50 minutes due to OpenAI rate limits');
  console.log('💡 The script will automatically pause between requests to respect rate limits\n');

  try {
    const results = await generateAllMissingAnimalImages();
    
    console.log('\n✅ BATCH GENERATION COMPLETE!');
    console.log('📊 Results:');
    console.log(`   - Male images generated: ${results.male.length}`);
    console.log(`   - Female images generated: ${results.female.length}`);
    console.log(`   - Total: ${results.male.length + results.female.length} images`);
    
  } catch (error) {
    console.error('❌ Batch generation failed:', error);
    process.exit(1);
  }
}

main();
