import { storage } from "./storage";
import { STARTER_CAMPAIGNS } from "../shared/campaign-data";

export async function seedCampaigns() {
  console.log("🎬 Seeding campaigns...");
  
  for (const campaign of STARTER_CAMPAIGNS) {
    const existing = await storage.getAllCampaigns().then(c => 
      c.find(ch => ch.campaignName === campaign.campaignName)
    );
    
    if (!existing) {
      await storage.createCampaign(campaign);
      console.log(`✅ Created campaign: ${campaign.campaignName}`);
    } else {
      console.log(`⏭️  Campaign already exists: ${campaign.campaignName}`);
    }
  }
  
  console.log("✅ Campaign seeding complete");
}
