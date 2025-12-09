
import { generateShopItemImage } from './imageGenerator';

async function generateCoin() {
  console.log('🪙 Generiere neue randlose Goldmünze...');
  
  try {
    const filename = await generateShopItemImage({
      itemType: 'decoration',
      itemName: 'Gold_coin_no_border',
      description: 'A single gold coin with a shiny metallic surface, circular shape, no white border or background, transparent PNG background, realistic 3D rendered style, viewed from a slight angle to show depth, warm golden color with highlights and shadows'
    });
    
    console.log('✅ Münze erfolgreich generiert:', filename);
    console.log('📝 Aktualisiere jetzt die animal-images.ts Datei mit dem neuen Dateinamen');
  } catch (error) {
    console.error('❌ Fehler bei der Generierung:', error);
  }
}

generateCoin();
