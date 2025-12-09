
import { Router } from 'express';
import { generateAnimalImage, generateShopItemImage, generateAllMissingAnimalImages } from '../imageGenerator';

const router = Router();

// Einzelnes Tierbild generieren
router.post('/generate/animal', async (req, res) => {
  try {
    const { animalType, animalName, age } = req.body;
    
    if (!animalType || !animalName || !age) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const filename = await generateAnimalImage({ animalType, animalName, age });
    res.json({ success: true, filename });
  } catch (error) {
    console.error('Image generation failed:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Shop-Item Bild generieren
router.post('/generate/shop-item', async (req, res) => {
  try {
    const { itemType, itemName, description } = req.body;
    
    const filename = await generateShopItemImage({ itemType, itemName, description });
    res.json({ success: true, filename });
  } catch (error) {
    console.error('Shop item generation failed:', error);
    res.status(500).json({ error: 'Failed to generate shop item' });
  }
});

// Alle fehlenden Tierbilder generieren (BATCH)
router.post('/generate/batch-animals', async (req, res) => {
  try {
    const results = await generateAllMissingAnimalImages();
    res.json({ success: true, results });
  } catch (error) {
    console.error('Batch generation failed:', error);
    res.status(500).json({ error: 'Failed to batch generate images' });
  }
});

export default router;
