import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, learningProgression, userAnimalCards, animalCards } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { ZooProfile, ZooShopItem } from '../../client/src/lib/zoo-game-system';
import { ZOO_SHOP_ITEMS, MISSION_TEMPLATES, PARTNER_ZOOS, BIG_GOALS } from '../../client/src/lib/zoo-game-system';
import { storage } from '../storage';
import type { Express } from 'express';
import { isAuthenticated } from '../authService';

const router = Router();

// Get zoo profile
router.get('/profile/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const sessionUserId = (req.session as any)?.userId;

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(sessionUserId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s zoo profile' });
    }

    // Fetch user progression data - graceful fallback
    let progression;
    try {
      progression = await db.query.learningProgression.findFirst({
        where: eq(learningProgression.userId, userId),
      });
    } catch (err) {
      console.warn('Progression query failed, using defaults:', err);
      progression = null;
    }

    // Count animals from actual user_animal_cards table
    const userAnimalsCount = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
    });

    // Build zoo profile with safe defaults
    // Use total_xp as coins for Zoo economy (we gave 1200 XP = 1200 coins)
    const totalCoins = progression?.gameCoins > 0 ? progression.gameCoins : (progression?.totalXp ?? 0);
    
    const zooProfile: ZooProfile = {
      totalCoins: totalCoins,
      totalAnimals: userAnimalsCount.map((ua: any) => ({ animalType: ua.animalType })) || [],
      ownedShopItems: (progression?.gameShopItems || []) as string[],
      badges: (progression?.gameBadges || []) as string[],
      level: progression?.currentLevel || 1,
      experience: progression?.totalCorrect || 0,
      ticketPrice: progression?.ticketPrice ?? 1.0, // 🎟️ Zoo entrance price
      gameStats: {
        zahlenwaage: {
          played: progression?.gameZahlenwaagePlayed || 0,
          totalScore: progression?.gameZahlenwaageScore || 0,
          highScore: progression?.gameZahlenwaageHighScore || 0,
          lastPlayed: progression?.gameZahlenwaageLastPlayed || null,
        },
        'ten-wins': {
          played: progression?.gameTenWinsPlayed || 0,
          totalScore: progression?.gameTenWinsScore || 0,
          highScore: progression?.gameTenWinsHighScore || 0,
          lastPlayed: null,
        },
        decomposition: {
          played: progression?.gameDecompositionPlayed || 0,
          totalScore: progression?.gameDecompositionScore || 0,
          highScore: progression?.gameDecompositionHighScore || 0,
          lastPlayed: null,
        },
        doubling: {
          played: progression?.gameDoublingPlayed || 0,
          totalScore: progression?.gameDoublingScore || 0,
          highScore: progression?.gameDoublingHighScore || 0,
          lastPlayed: null,
        },
        pathfinder: {
          played: progression?.gamePathfinderPlayed || 0,
          totalScore: progression?.gamePathfinderScore || 0,
          highScore: progression?.gamePathfinderHighScore || 0,
          lastPlayed: null,
        },
        'number-stairs': {
          played: 0,
          totalScore: 0,
          highScore: 0,
          lastPlayed: null,
        },
        'number-builder': {
          played: 0,
          totalScore: 0,
          highScore: 0,
          lastPlayed: null,
        },
      } as any,
    };

    res.json(zooProfile);
  } catch (error) {
    console.error('Error fetching zoo profile:', error);
    res.status(500).json({ error: 'Failed to fetch zoo profile' });
  }
});

// Purchase shop item
router.post('/purchase', isAuthenticated, async (req, res) => {
  try {
    // SECURITY: Always use session userId, never trust client input
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { itemId } = req.body;

    // Validate item exists
    const item = ZOO_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(400).json({ error: 'Invalid item' });
    }

    // Fetch user progression
    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User progression not found' });
    }

    // Check if already owned
    const ownedItems = (progression?.gameShopItems || []) as string[];
    if (ownedItems.includes(itemId)) {
      return res.status(400).json({ error: 'Item already owned' });
    }

    // Check if enough coins
    const currentCoins = progression?.gameCoins ?? 0;
    console.log(`💰 Purchase attempt: User has ${currentCoins} coins, item costs ${item.price}`);

    if (currentCoins < item.price) {
      console.log(`❌ Not enough coins: ${currentCoins} < ${item.price}`);
      return res.status(400).json({ 
        error: 'Not enough coins',
        currentCoins,
        requiredCoins: item.price
      });
    }

    // Update progression: deduct coins, add item
    await db.update(learningProgression)
      .set({
        gameCoins: currentCoins - item.price,
        gameShopItems: [...ownedItems, itemId],
      })
      .where(eq(learningProgression.userId, userId));

    res.json({ success: true, remainingCoins: currentCoins - item.price });
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
});

// Add coins to user (used by games to reward players with item bonuses applied)
router.post('/add-coins/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const sessionUserId = (req.session as any)?.userId;
    const { coins } = req.body;

    // SECURITY: Users can only add coins to their own account
    if (userId !== sessionUserId) {
      return res.status(403).json({ error: 'Forbidden: You can only add coins to your own account' });
    }

    if (!coins || coins <= 0) {
      return res.status(400).json({ error: 'Invalid coins amount' });
    }

    // Fetch user progression
    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User progression not found' });
    }

    const currentCoins = progression?.gameCoins ?? 0;
    const newCoins = currentCoins + coins;

    // Update progression: add coins
    await db.update(learningProgression)
      .set({
        gameCoins: newCoins,
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`💰 Added ${coins} coins to user ${userId}, new balance: ${newCoins}`);
    res.json({ success: true, newBalance: newCoins });
  } catch (error) {
    console.error('Error adding coins:', error);
    res.status(500).json({ error: 'Failed to add coins' });
  }
});

// 🎟️ Update zoo ticket price (dynamic pricing)
router.post('/update-ticket-price', isAuthenticated, async (req, res) => {
  try {
    const sessionUserId = (req.session as any)?.userId;
    const { userId, ticketPrice } = req.body;

    if (!userId || ticketPrice === undefined) {
      return res.status(400).json({ error: 'User ID and ticket price required' });
    }

    // SECURITY: Users can only update their own ticket price
    if (userId !== sessionUserId) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own ticket price' });
    }

    // Validate ticket price range (1 - 100 ZooMünzen)
    if (ticketPrice < 1 || ticketPrice > 100) {
      return res.status(400).json({ error: 'Ticket price must be between 1 and 100 ZooMünzen' });
    }

    // Fetch user progression
    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User progression not found' });
    }

    // Update ticket price
    await db.update(learningProgression)
      .set({
        ticketPrice: ticketPrice,
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`🎟️ Updated ticket price for user ${userId} to ${ticketPrice} ZooMünzen`);
    res.json({ success: true, ticketPrice });
  } catch (error) {
    console.error('Error updating ticket price:', error);
    res.status(500).json({ error: 'Failed to update ticket price' });
  }
});

// Teacher/Admin: Gift coins to student
router.post('/teacher/gift-coins', isAuthenticated, async (req, res) => {
  try {
    // Get user from session
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      console.log('❌ No session userId found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { studentId, coins, reason } = req.body;

    if (!studentId || !coins || coins <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // SECURITY: Check if user has permission to gift coins to this student
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(sessionUserId, studentId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to gift coins to this student' });
    }

    // Get user info for logging
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionUserId),
    });

    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Only teachers and admins can gift coins' });
    }

    console.log(`👤 Gift coins request from user: ${user.username} (${user.role})`);

    // Fetch student progression
    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, studentId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const currentCoins = progression?.gameCoins ?? 0;
    const newCoins = currentCoins + coins;

    // Update student progression
    await db.update(learningProgression)
      .set({
        gameCoins: newCoins,
      })
      .where(eq(learningProgression.userId, studentId));

    console.log(`🎁 ${user.role} ${user.username} gifted ${coins} coins to student ${studentId}. Reason: ${reason || 'No reason'}`);
    res.json({ 
      success: true, 
      newBalance: newCoins,
      giftedCoins: coins 
    });
  } catch (error) {
    console.error('Error gifting coins:', error);
    res.status(500).json({ error: 'Failed to gift coins' });
  }
});

// ===== MISSIONS ROUTES (Arche Nova Tier-Rettung!) =====

router.get('/missions/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessionUserId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(sessionUserId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s missions' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userMissions = await storage.getMissionsByUserId(userId);
    const userLevel = progression?.currentLevel || 1;
    const collectedAnimals = (progression?.gameAnimalsCollected || []) as string[];

    // Import ANIMALS_DATABASE einmal vor der map
    const { ANIMALS_DATABASE } = await import('../../client/src/lib/zoo-game-system.js');

    const missionsWithProgress = MISSION_TEMPLATES
      .filter(template => template.unlockLevel <= userLevel)
      .map(template => {
        const existingMission = userMissions.find(m => 
          m.missionType === template.type && 
          (m.targetContinent === template.targetContinent || m.targetGroup === template.targetGroup)
        );

        let currentProgress = 0;
        if (template.type === 'continent' && template.targetContinent) {
          currentProgress = collectedAnimals.filter(animal => {
            const animalData = Object.values(ANIMALS_DATABASE)
              .find((a: any) => a.type === animal);
            return animalData && (animalData as any).continent === template.targetContinent;
          }).length;
        } else if (template.type === 'group' && template.targetGroup) {
          currentProgress = collectedAnimals.filter(animal => {
            const animalData = Object.values(ANIMALS_DATABASE)
              .find((a: any) => a.type === animal);
            return animalData && (animalData as any).group === template.targetGroup;
          }).length;
        } else if (template.type === 'special') {
          currentProgress = collectedAnimals.length;
        }

        return {
          ...template,
          id: existingMission?.id || template.id,
          currentProgress: Math.min(currentProgress, template.targetCount),
          isCompleted: existingMission?.isCompleted || currentProgress >= template.targetCount,
          completedAt: existingMission?.completedAt || null,
        };
      });

    res.json(missionsWithProgress);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

router.post('/missions/:missionId/complete', isAuthenticated, async (req, res) => {
  try {
    const { missionId } = req.params;
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const template = MISSION_TEMPLATES.find(t => t.id === missionId);
    if (!template) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    let mission = (await storage.getMissionsByUserId(userId)).find(m => m.id === missionId);

    if (!mission) {
      mission = await storage.createMission({
        userId,
        missionType: template.type,
        targetContinent: template.targetContinent || null,
        targetGroup: template.targetGroup || null,
        targetAnimalCount: template.targetCount,
        title: template.title,
        description: template.description,
        emoji: template.emoji,
        currentProgress: template.targetCount,
        isCompleted: false,
        coinReward: template.coinReward,
        xpReward: template.xpReward,
        badgeReward: template.badgeReward || null,
        difficultyLevel: template.difficulty,
        unlockLevel: template.unlockLevel,
      });
    }

    if (mission.isCompleted) {
      return res.status(400).json({ error: 'Mission already completed' });
    }

    await storage.completeMission(mission.id);

    const currentCoins = progression?.gameCoins ?? 0;
    const currentBadges = (progression?.gameBadges || []) as string[];
    const newBadges = template.badgeReward && !currentBadges.includes(template.badgeReward)
      ? [...currentBadges, template.badgeReward]
      : currentBadges;

    await db.update(learningProgression)
      .set({
        gameCoins: currentCoins + template.coinReward,
        gameBadges: newBadges,
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`🎯 Mission completed: ${template.title} by user ${userId}`);
    res.json({
      success: true,
      rewards: {
        coins: template.coinReward,
        xp: template.xpReward,
        badge: template.badgeReward,
      },
    });
  } catch (error) {
    console.error('Error completing mission:', error);
    res.status(500).json({ error: 'Failed to complete mission' });
  }
});

// ===== PARTNER ZOOS ROUTES (Arche Nova University!) =====

router.get('/partner-zoos/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessionUserId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(sessionUserId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s partner zoos' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPartnerZoos = await storage.getPartnerZoosByUserId(userId);
    const collectedAnimals = (progression?.gameAnimalsCollected || []) as string[];

    const partnerZoosWithStatus = PARTNER_ZOOS.map(template => {
      const existing = userPartnerZoos.find(p => p.partnerName === template.name);
      const isUnlocked = existing?.isUnlocked || collectedAnimals.length >= template.requiredAnimals;

      return {
        ...template,
        id: existing?.id || template.id,
        isUnlocked,
        unlockedAt: existing?.unlockedAt || null,
        currentAnimals: collectedAnimals.length,
      };
    });

    res.json(partnerZoosWithStatus);
  } catch (error) {
    console.error('Error fetching partner zoos:', error);
    res.status(500).json({ error: 'Failed to fetch partner zoos' });
  }
});

router.post('/partner-zoos/:partnerZooId/unlock', isAuthenticated, async (req, res) => {
  try {
    const { partnerZooId } = req.params;
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const template = PARTNER_ZOOS.find(p => p.id === partnerZooId);
    if (!template) {
      return res.status(404).json({ error: 'Partner zoo not found' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    const collectedAnimals = (progression?.gameAnimalsCollected || []) as string[];
    if (collectedAnimals.length < template.requiredAnimals) {
      return res.status(400).json({ 
        error: 'Not enough animals',
        required: template.requiredAnimals,
        current: collectedAnimals.length,
      });
    }

    let partnerZoo = (await storage.getPartnerZoosByUserId(userId)).find(p => p.partnerName === template.name);

    if (!partnerZoo) {
      partnerZoo = await storage.createPartnerZoo({
        userId,
        partnerName: template.name,
        continent: template.continent,
        emoji: template.emoji,
        isUnlocked: false,
        requiredAnimals: template.requiredAnimals,
        bonusType: template.bonusType,
        bonusValue: template.bonusValue,
      });
    }

    if (partnerZoo.isUnlocked) {
      return res.status(400).json({ error: 'Partner zoo already unlocked' });
    }

    await storage.unlockPartnerZoo(partnerZoo.id);

    console.log(`🏛️ Partner zoo unlocked: ${template.name} by user ${userId}`);
    res.json({
      success: true,
      bonus: {
        type: template.bonusType,
        value: template.bonusValue,
      },
    });
  } catch (error) {
    console.error('Error unlocking partner zoo:', error);
    res.status(500).json({ error: 'Failed to unlock partner zoo' });
  }
});

// ===== BIG GOALS ROUTES (Arche Nova Endgame!) =====

router.get('/big-goals/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessionUserId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(sessionUserId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s big goals' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBigGoals = await storage.getBigGoalsByUserId(userId);
    const collectedAnimals = (progression?.gameAnimalsCollected || []) as string[];
    const totalCoins = progression?.gameCoins ?? 0;

    // Import ANIMALS_DATABASE einmal vor der map
    const { ANIMALS_DATABASE } = await import('../../client/src/lib/zoo-game-system.js');

    // Fetch partner zoos outside of map to avoid async issues
    const partnerZoos = await storage.getPartnerZoosByUserId(userId);

    const bigGoalsWithProgress = BIG_GOALS.map(template => {
      const existing = userBigGoals.find(g => g.goalType === template.id);

      // Measure-Type spezifische Logik
      let currentProgress = 0;

      switch (template.measureType) {
        case 'continents': {
          const uniqueContinents = new Set(collectedAnimals.map(animalType => {
            const info = ANIMALS_DATABASE[animalType as any];
            return info?.continent;
          })).size;

          const uniqueGroups = new Set(collectedAnimals.map(animalType => {
            const info = ANIMALS_DATABASE[animalType as any];
            return info?.group;
          })).size;

          // 🌊 PHASE 2: Count water animals and reptiles
          const waterAnimals = collectedAnimals.filter(animalType => {
            const animalDef = ANIMALS_DATABASE[animalType as any];
            return animalDef?.group === 'Wassertiere';
          }).length;

          const reptiles = collectedAnimals.filter(animalType => {
            const animalDef = ANIMALS_DATABASE[animalType as any];
            return animalDef?.group === 'Reptilien';
          }).length;
          
          currentProgress = uniqueContinents;
          break;
        }

        case 'groups': {
          const uniqueContinents = new Set(collectedAnimals.map(animalType => {
            const info = ANIMALS_DATABASE[animalType as any];
            return info?.continent;
          })).size;

          const uniqueGroups = new Set(collectedAnimals.map(animalType => {
            const info = ANIMALS_DATABASE[animalType as any];
            return info?.group;
          })).size;

          // 🌊 PHASE 2: Count water animals and reptiles
          const waterAnimals = collectedAnimals.filter(animalType => {
            const animalDef = ANIMALS_DATABASE[animalType as any];
            return animalDef?.group === 'Wassertiere';
          }).length;

          const reptiles = collectedAnimals.filter(animalType => {
            const animalDef = ANIMALS_DATABASE[animalType as any];
            return animalDef?.group === 'Reptilien';
          }).length;
          
          currentProgress = uniqueGroups;
          break;
        }

        case 'coins':
          currentProgress = totalCoins;
          break;

        case 'xp':
          currentProgress = progression?.gameExperience ?? 0;
          break;

        case 'animals':
          // Spezial-Logik für "Ozean-Dominator" und "Reptilien-Meister"
          if (template.id === 'ocean_dominator') {
            // Zähle nur Wassertiere
            const waterAnimals = collectedAnimals.filter(animalType => {
              const info = ANIMALS_DATABASE[animalType as any];
              return info && info.group === 'Wassertiere';
            }).length;
            currentProgress = waterAnimals;
          } else if (template.id === 'reptile_master') {
            // Zähle nur Reptilien
            const reptiles = collectedAnimals.filter(animalType => {
              const info = ANIMALS_DATABASE[animalType as any];
              return info && info.group === 'Reptilien';
            }).length;
            currentProgress = reptiles;
          } else {
            // Normale Tier-Zählung
            currentProgress = collectedAnimals.length;
          }
          break;

        case 'partners':
          currentProgress = partnerZoos.length;
          break;

        default:
          currentProgress = 0;
      }

      return {
        ...template,
        id: existing?.id || template.id,
        currentProgress: Math.min(currentProgress, template.targetProgress),
        isCompleted: existing?.isCompleted || currentProgress >= template.targetProgress,
        completedAt: existing?.completedAt || null,
      };
    });

    res.json(bigGoalsWithProgress);
  } catch (error) {
    console.error('Error fetching big goals:', error);
    res.status(500).json({ error: 'Failed to fetch big goals' });
  }
});

router.post('/big-goals/:goalId/complete', isAuthenticated, async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const template = BIG_GOALS.find(g => g.id === goalId);
    if (!template) {
      return res.status(404).json({ error: 'Big goal not found' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    let bigGoal = (await storage.getBigGoalsByUserId(userId)).find(g => g.goalType === template.id);

    if (!bigGoal) {
      bigGoal = await storage.createBigGoal({
        userId,
        goalType: template.id,
        title: template.title,
        description: template.description,
        emoji: template.emoji,
        currentProgress: template.targetProgress,
        targetProgress: template.targetProgress,
        isCompleted: false,
      });
    }

    if (bigGoal.isCompleted) {
      return res.status(400).json({ error: 'Big goal already completed' });
    }

    await storage.completeBigGoal(bigGoal.id);

    const currentCoins = progression?.gameCoins ?? 0;
    const currentBadges = (progression?.gameBadges || []) as string[];
    const newBadges = !currentBadges.includes(template.hugereward.badge)
      ? [...currentBadges, template.hugereward.badge]
      : currentBadges;

    await db.update(learningProgression)
      .set({
        gameCoins: currentCoins + template.hugereward.coins,
        gameBadges: newBadges,
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`🏆 Big goal completed: ${template.title} by user ${userId}`);
    res.json({
      success: true,
      rewards: {
        coins: template.hugereward.coins,
        xp: template.hugereward.xp,
        badge: template.hugereward.badge,
      },
    });
  } catch (error) {
    console.error('Error completing big goal:', error);
    res.status(500).json({ error: 'Failed to complete big goal' });
  }
});


// ===== BADGE CHECKING ENDPOINT =====

// Check and unlock eligible badges for a user
router.post('/badges/check', isAuthenticated, async (req, res) => {
  try {
    const requesterId = (req.session as any)?.userId;
    const { userId: targetUserId } = req.body;

    if (!requesterId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Determine which user to check
    const userId = targetUserId || requesterId;

    // Authorization check
    if (requesterId !== userId) {
      const requester = await db.query.users.findFirst({
        where: eq(users.id, requesterId),
      });

      if (!requester || (requester.role !== 'admin' && requester.role !== 'teacher')) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Import badge checking function
    const { checkCollectionBadges } = await import('../../client/src/lib/zoo-game-system.js');

    const currentCollected = (progression?.gameAnimalsCollected || []) as string[];
    const currentBadges = (progression?.gameBadges || []) as string[];

    // Check for new badges
    const badgeCheck = checkCollectionBadges(currentCollected.length, currentBadges);

    if (badgeCheck.newBadges.length > 0) {
      // Award new badges and rewards
      const newBadges = [...currentBadges, ...badgeCheck.newBadges];
      const currentCoins = progression?.gameCoins || 0;
      const newCoins = currentCoins + badgeCheck.rewards.coins;

      await db.update(learningProgression)
        .set({
          gameBadges: newBadges,
          gameCoins: newCoins,
        })
        .where(eq(learningProgression.userId, userId));

      console.log(`🏆 Badge check for user ${userId}: ${badgeCheck.newBadges.length} new badges unlocked`);
      console.log(`   Badges: ${badgeCheck.newBadges.join(', ')}`);
      console.log(`   Rewards: ${badgeCheck.rewards.coins} coins, ${badgeCheck.rewards.xp} XP`);

      res.json({
        success: true,
        newBadges: badgeCheck.newBadges,
        rewards: badgeCheck.rewards,
        totalBadges: newBadges.length
      });
    } else {
      res.json({
        success: true,
        newBadges: [],
        rewards: { coins: 0, xp: 0 },
        totalBadges: currentBadges.length,
        message: 'No new badges to unlock'
      });
    }
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// Get all available badges and their status for a user
router.get('/badges/:userId', isAuthenticated, async (req, res) => {
  try {
    const requesterId = (req.session as any)?.userId;
    const { userId } = req.params;

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(requesterId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s badges' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Import badge definitions
    const { ZOO_BADGES } = await import('../../client/src/lib/zoo-game-system.js');

    const currentBadges = (progression?.gameBadges || []) as string[];
    const currentCollected = (progression?.gameAnimalsCollected || []) as string[];

    // Build badge status for each badge
    const badgeStatus = Object.entries(ZOO_BADGES).map(([badgeId, badge]) => {
      const earned = currentBadges.includes(badgeId);

      // Calculate progress towards this badge
      let progress = 0;
      let maxProgress = 1;

      if (badgeId === 'first-animal') {
        progress = Math.min(currentCollected.length, 1);
      } else if (badgeId === 'animal-collector-5') {
        progress = currentCollected.length;
        maxProgress = 5;
      } else if (badgeId === 'animal-collector-10') {
        progress = currentCollected.length;
        maxProgress = 10;
      } else if (badgeId === 'animal-collector-20') {
        progress = currentCollected.length;
        maxProgress = 20;
      } else if (badgeId === 'animal-collector-30') {
        progress = currentCollected.length;
        maxProgress = 30;
      } else if (badgeId === 'all-animals') {
        progress = currentCollected.length;
        maxProgress = 56; // Total animals in system
      }

      return {
        badgeId,
        name: badge.name,
        emoji: badge.emoji,
        description: badge.description,
        earned,
        progress: Math.min(progress, maxProgress),
        maxProgress,
        reward: badge.reward
      };
    });

    res.json({
      totalBadges: Object.keys(ZOO_BADGES).length,
      earnedBadges: currentBadges.length,
      badges: badgeStatus
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});


// ===== ANIMAL XP & GROWTH SYSTEM =====

// Helper: Ensure all animals have animalType (migration from gameAnimalsCollected)
async function ensureAnimalsHaveType(userId: string, animals: any[], collectedAnimals: string[]) {
  const needsMigration = animals.length === 0 || 
                        animals.length < collectedAnimals.length ||
                        animals.some((a: any) => !a.animalType);

  if (needsMigration && collectedAnimals.length > 0) {
    const now = new Date();
    const existingAnimalTypes = new Set(animals.filter((a: any) => a.id && a.animalType).map((a: any) => a.animalType));
    const missingAnimals = collectedAnimals.filter(type => !existingAnimalTypes.has(type));

    const newAnimals = missingAnimals.map((animalType, index) => ({
      id: `${animalType}-${Date.now()}-${index}`,
      animalType,
      age: 'adult' as const,
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: 1000,
      unlockedAt: now.toISOString()
    }));

    const migratedAnimals = animals.filter((a: any) => a.id).map((a: any) => {
      if (!a.animalType) {
        return { ...a, animalType: 'unknown' };
      }
      if (a.xp >= 500 && a.age === 'baby') {
        return {
          ...a,
          age: 'adult' as const,
          xp: 1000,
          gender: (Math.random() > 0.5 ? 'female' : 'male') as 'female' | 'male'
        };
      }
      if (a.age === 'adult' && !a.gender) {
        return {
          ...a,
          gender: (Math.random() > 0.5 ? 'female' : 'male') as 'female' | 'male'
        };
      }
      if (a.age === 'baby') {
        const { gender, ...babyWithoutGender } = a;
        return babyWithoutGender;
      }
      return a;
    });

    const updatedAnimals = [...migratedAnimals, ...newAnimals];

    await db.update(learningProgression)
      .set({ zooAnimals: updatedAnimals })
      .where(eq(learningProgression.userId, userId));

    console.log(`🔄 Migrated/added ${newAnimals.length} missing animals (ensureAnimalsHaveType)`);
    return updatedAnimals;
  }

  return animals;
}

// Trigger breeding check (can be called manually or automatically)
router.post('/breeding/check', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { calculateBreeding } = await import('../lib/zoo-economy-engine.js');

    // Fetch animals from user_animal_cards table
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: { animalCard: true },
    });

    const animals = userAnimalsFromDB.map((ua, index) => ({
      id: ua.id,
      animalType: ua.animalCard.animalType,
      age: ua.xp >= 500 ? 'adult' : 'baby',
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: ua.xp || 0,
      unlockedAt: ua.unlockedAt?.toISOString() || new Date().toISOString(),
    }));

    const lastBreedingCheck = progression?.lastBreedingCheck || progression?.lastLoginAt || new Date();
    const breedingResult = calculateBreeding(animals, lastBreedingCheck);

    if (breedingResult.newBabies.length > 0) {
      // Create new baby in user_animal_cards table (breeding not implemented yet)
      console.log(`🐣 Breeding check found ${breedingResult.newBabies.length} potential babies (feature under development)`);

      console.log(`🐣 Breeding successful! ${breedingResult.newBabies.length} new babies for user ${userId}`);

      res.json({
        success: true,
        newBabies: breedingResult.newBabies.length,
        breedingPairs: breedingResult.breedingPairs
      });
    } else {
      res.json({
        success: true,
        newBabies: 0,
        message: 'No breeding pairs or too early'
      });
    }
  } catch (error) {
    console.error('Error checking breeding:', error);
    res.status(500).json({ error: 'Failed to check breeding' });
  }
});

// 🆕 ACTIVE BREEDING - Gezieltes Paaren (nur mit Partner-Zoos)
router.post('/breeding/active', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { animalType, femaleId, maleId } = req.body;

    if (!animalType || !femaleId || !maleId) {
      return res.status(400).json({ error: 'Animal type and parent IDs required' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any unlocked partner zoos (required for active breeding)
    const partnerZoos = await storage.getPartnerZoosByUserId(userId);
    const hasPartnerZoo = partnerZoos.some(p => p.isUnlocked);

    if (!hasPartnerZoo) {
      return res.status(403).json({ 
        error: 'Partner-Zoo erforderlich',
        message: 'Du brauchst mindestens einen Partner-Zoo für aktive Zucht!'
      });
    }

    // Fetch animals from user_animal_cards table
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: { animalCard: true },
    });

    const animals = userAnimalsFromDB.map((ua, index) => ({
      id: ua.id,
      animalType: ua.animalCard.animalType,
      age: ua.xp >= 500 ? 'adult' : 'baby',
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: ua.xp || 0,
      unlockedAt: ua.unlockedAt?.toISOString() || new Date().toISOString(),
    }));

    const femaleAnimal = animals.find((a: any) => 
      a.animalType === animalType && a.age === 'adult' && a.gender === 'female' && a.id === femaleId
    );
    const maleAnimal = animals.find((a: any) => 
      a.animalType === animalType && a.age === 'adult' && a.gender === 'male' && a.id === maleId
    );

    if (!femaleAnimal || !maleAnimal) {
      return res.status(404).json({ error: 'Breeding pair not found' });
    }

    // Find animal card for new baby
    const animalCard = await db.query.animalCards.findFirst({
      where: (ac) => ac.animalType === animalType,
    });

    if (!animalCard) {
      return res.status(400).json({ error: 'Animal card not found' });
    }

    // Create new baby in user_animal_cards table
    const now = new Date();
    const newUserAnimal = {
      id: `user-animal-${userId}-${animalType}-baby-${Date.now()}`,
      userId,
      animalCardId: animalCard.id,
      friendshipLevel: 1,
      xp: 0,
      xpToNextLevel: 100,
      timesUsed: 0,
      gamesWon: 0,
      isUnlocked: true,
      unlockedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(userAnimalCards).values(newUserAnimal);

    console.log(`💕 Active breeding: ${animalType} baby created for user ${userId}`);

    res.json({
      success: true,
      baby: newBaby,
      message: 'Baby erfolgreich gezüchtet!'
    });
  } catch (error) {
    console.error('Error in active breeding:', error);
    res.status(500).json({ error: 'Failed to breed animals' });
  }
});

// 🆕 SELL ANIMALS - Verkaufe Tiere gegen Münzen (nur mit Partner-Zoos)
router.post('/animals/sell', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { animalIndex, sellPrice } = req.body;

    if (animalIndex === undefined || !sellPrice) {
      return res.status(400).json({ error: 'Animal index and price required' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any unlocked partner zoos (required for selling)
    const partnerZoos = await storage.getPartnerZoosByUserId(userId);
    const hasPartnerZoo = partnerZoos.some(p => p.isUnlocked);

    if (!hasPartnerZoo) {
      return res.status(403).json({ 
        error: 'Partner-Zoo erforderlich',
        message: 'Du brauchst mindestens einen Partner-Zoo zum Verkaufen!'
      });
    }

    // Fetch animals from user_animal_cards table
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: { animalCard: true },
    });

    if (animalIndex < 0 || animalIndex >= userAnimalsFromDB.length) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const soldAnimalRecord = userAnimalsFromDB[animalIndex];
    const soldAnimal = {
      animalType: soldAnimalRecord.animalCard.animalType,
      age: soldAnimalRecord.xp >= 500 ? 'adult' : 'baby',
    };

    // Delete animal from user_animal_cards
    await db.delete(userAnimalCards).where(eq(userAnimalCards.id, soldAnimalRecord.id));

    // Add coins
    const currentCoins = progression?.gameCoins || 0;
    const newCoins = currentCoins + sellPrice;

    await db.update(learningProgression)
      .set({
        gameCoins: newCoins,
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`💰 Sold ${soldAnimal.animalType} (${soldAnimal.age}) for ${sellPrice} coins, user ${userId}`);

    res.json({
      success: true,
      soldAnimal,
      coinsEarned: sellPrice,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error selling animal:', error);
    res.status(500).json({ error: 'Failed to sell animal' });
  }
});

// Get animal statistics (babies, females, males per species)
router.get('/animals/stats/:userId', isAuthenticated, async (req, res) => {
  try {
    const requesterId = (req.session as any)?.userId;
    const { userId } = req.params;

    // SECURITY: Check if user has permission
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(requesterId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch animals from user_animal_cards table (actual source of truth!)
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: {
        animalCard: true,
      },
    });

    // Transform to format with gender for stats calculation
    // Distribute gender: 50% female, 50% male randomly
    const animals = userAnimalsFromDB.map((ua, index) => ({
      id: ua.id,
      animalType: ua.animalCard.animalType,
      age: ua.xp >= 500 ? 'adult' : 'baby',  // >= 500 XP = adult
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: ua.xp || 0,
      unlockedAt: ua.unlockedAt?.toISOString() || new Date().toISOString(),
    }));

    const { calculateAnimalStats } = await import('../lib/zoo-economy-engine.js');
    const stats = calculateAnimalStats(animals);

    console.log(`📊 Stats calculated for user ${userId}:`, stats);

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching animal stats:', error);
    res.status(500).json({ error: 'Failed to fetch animal stats' });
  }
});

// ===== ANIMAL XP & GROWTH SYSTEM =====

// Get all animals with XP status (AUTH PROTECTED)
router.get('/animals/:userId', isAuthenticated, async (req, res) => {
  try {
    const requesterId = (req.session as any)?.userId;
    const { userId } = req.params;

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(requesterId, userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s animals' });
    }

    // Fetch animals from user_animal_cards table (actual source of truth!)
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: {
        animalCard: true,
      },
    });

    // Transform to ZooAnimalWithXP format expected by frontend
    const animals = userAnimalsFromDB.map((ua, index) => ({
      id: ua.id,
      animalType: ua.animalCard.animalType,
      age: ua.xp >= 500 ? 'adult' : 'baby',  // >= 500 XP = adult
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: ua.xp || 0,
      unlockedAt: ua.unlockedAt?.toISOString() || new Date().toISOString(),
    }));

    console.log(`🐾 Returning ${animals.length} animals for user ${userId}`);
    res.json({ animals });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// Unlock new animal (as baby with 0 XP) - AUTH PROTECTED
router.post('/animals/unlock', isAuthenticated, async (req, res) => {
  try {
    const requesterId = (req.session as any)?.userId;
    const { animalType, userId: targetUserId } = req.body;

    if (!requesterId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Determine which user's zoo we're modifying
    const userId = targetUserId || requesterId;

    // Authorization: Only allow users to modify their own zoo or admins/teachers
    if (requesterId !== userId) {
      const requester = await db.query.users.findFirst({
        where: eq(users.id, requesterId),
      });

      if (!requester || (requester.role !== 'admin' && requester.role !== 'teacher')) {
        return res.status(403).json({ error: 'Unauthorized - can only unlock animals for yourself' });
      }
    }

    if (!animalType) {
      return res.status(400).json({ error: 'Animal type required' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already unlocked in user_animal_cards table
    const existingAnimal = await db.query.userAnimalCards.findFirst({
      where: (ua) => ua.userId === userId && ua.animalCard?.animalType === animalType,
      with: { animalCard: true },
    });

    if (existingAnimal) {
      return res.status(400).json({ error: 'Animal already unlocked' });
    }

    // Find animal card by type
    const animalCard = await db.query.animalCards.findFirst({
      where: (ac) => ac.animalType === animalType,
    });

    if (!animalCard) {
      return res.status(400).json({ error: 'Animal card not found' });
    }

    // Insert into user_animal_cards table
    const newUserAnimal = {
      id: `user-animal-${userId}-${animalType}-${Date.now()}`,
      userId,
      animalCardId: animalCard.id,
      friendshipLevel: 1,
      xp: 0,
      xpToNextLevel: 100,
      timesUsed: 0,
      gamesWon: 0,
      isUnlocked: true,
      unlockedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userAnimalCards).values(newUserAnimal);

    // Update gameAnimalsCollected for backwards compatibility
    const currentCollected = (progression?.gameAnimalsCollected || []) as string[];
    const newCollected = [...currentCollected, animalType];

    const { checkCollectionBadges } = await import('../../client/src/lib/zoo-game-system.js');
    const currentBadges = (progression?.gameBadges || []) as string[];
    const badgeCheck = checkCollectionBadges(newCollected.length, currentBadges);
    const newBadges = [...currentBadges, ...badgeCheck.newBadges];
    const currentCoins = progression?.gameCoins || 0;
    const newCoins = currentCoins + badgeCheck.rewards.coins;

    await db.update(learningProgression)
      .set({
        gameAnimalsCollected: newCollected,
        gameBadges: newBadges,
        gameCoins: newCoins,
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`🐾 New baby animal unlocked: ${animalType} for user ${userId}`);

    if (badgeCheck.newBadges.length > 0) {
      console.log(`🏆 Badges unlocked: ${badgeCheck.newBadges.join(', ')} (+${badgeCheck.rewards.coins} coins, +${badgeCheck.rewards.xp} XP)`);
    }

    res.json({ 
      success: true, 
      animal: newAnimal,
      badges: {
        unlocked: badgeCheck.newBadges,
        rewards: badgeCheck.rewards
      }
    });
  } catch (error) {
    console.error('Error unlocking animal:', error);
    res.status(500).json({ error: 'Failed to unlock animal' });
  }
});

// Add XP to animal (automatically evolves at 1000 XP)
router.post('/animals/add-xp', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { animalType, xp } = req.body;

    if (!animalType || !xp || xp <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    const animals = (progression?.zooAnimals || []) as Array<{
      animalType: string;
      age: 'baby' | 'adult';
      xp: number;
      unlockedAt: string;
    }>;

    const animalIndex = animals.findIndex(a => a.animalType === animalType);
    if (animalIndex === -1) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const animal = animals[animalIndex];

    // Don't add XP to already adult animals
    if (animal.age === 'adult') {
      return res.json({ 
        success: true, 
        animal,
        evolved: false,
        message: 'Animal is already adult'
      });
    }

    // Add XP
    const newXp = Math.min(animal.xp + xp, 1000);
    const evolved = newXp >= 1000 && animal.age === 'baby';

    // Update animal
    const updatedAnimal = {
      ...animal,
      xp: newXp,
      age: evolved ? ('adult' as const) : animal.age,
    };

    animals[animalIndex] = updatedAnimal;

    await db.update(learningProgression)
      .set({
        zooAnimals: animals,
      })
      .where(eq(learningProgression.userId, userId));

    if (evolved) {
      console.log(`✨ EVOLUTION! ${animalType} grew from baby to adult! User: ${userId}`);
    } else {
      console.log(`🌱 Added ${xp} XP to ${animalType} (${newXp}/1000 XP) for user ${userId}`);
    }

    res.json({ 
      success: true, 
      animal: updatedAnimal,
      evolved,
      xpGained: xp
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ error: 'Failed to add XP' });
  }
});

// ===== IDLE ECONOMY SYSTEM =====

// Claim offline rewards (calculate rewards for time away)
router.post('/claim-offline-rewards', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch animals from user_animal_cards table
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: { animalCard: true },
    });

    const currentAnimals = userAnimalsFromDB.map((ua, index) => ({
      id: ua.id,
      animalType: ua.animalCard.animalType,
      age: ua.xp >= 500 ? 'adult' : 'baby',
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: ua.xp || 0,
      unlockedAt: ua.unlockedAt?.toISOString() || new Date().toISOString(),
    }));

    // Import economy engine from server lib
    const { calculateOfflineRewards } = await import('../lib/zoo-economy-engine.js');

    const lastLoginAt = progression?.lastLoginAt || progression.createdAt;
    const currentCoins = progression?.totalXp ?? progression?.gameCoins ?? 0;
    const ownedShopItems = (progression?.gameShopItems || []) as string[];
    const ticketPrice = progression.ticketPrice ?? 1.0; // 🎟️ Get user's ticket price

    console.log(`🏦 Calculating offline rewards for user ${userId}: Animals: ${currentAnimals.length}, Coins: ${currentCoins}`);

    const rewards = calculateOfflineRewards(
      lastLoginAt,
      currentAnimals,
      currentCoins,
      ownedShopItems,
      ticketPrice
    );

    // Update coins and XP
    await db.update(learningProgression)
      .set({
        totalXp: rewards.finalCoins,
        gameCoins: rewards.finalCoins,
        lastLoginAt: new Date(),
      })
      .where(eq(learningProgression.userId, userId));

    console.log(`💰 User ${userId} claimed offline rewards: ${rewards.netIncome} coins, ${rewards.evolvedAnimals.length} evolutions`);

    res.json(rewards);
  } catch (error) {
    console.error('Error claiming offline rewards:', error);
    res.status(500).json({ error: 'Failed to claim offline rewards' });
  }
});

// Get current economy status (passive income rates, costs, next evolution)
router.get('/economy-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch animals from user_animal_cards table
    const userAnimalsFromDB = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
      with: { animalCard: true },
    });

    const animals = userAnimalsFromDB.map((ua, index) => ({
      id: ua.id,
      animalType: ua.animalCard.animalType,
      age: ua.xp >= 500 ? 'adult' : 'baby',
      gender: (index % 2 === 0 ? 'female' : 'male') as 'female' | 'male',
      xp: ua.xp || 0,
      unlockedAt: ua.unlockedAt?.toISOString() || new Date().toISOString(),
    }));

    // Import economy engine from server lib
    const { calculateEconomyStatus } = await import('../lib/zoo-economy-engine.js');

    const ownedShopItems = (progression?.gameShopItems || []) as string[];
    const ticketPrice = progression.ticketPrice ?? 1.0; // 🎟️ Get user's ticket price

    // Calculate current economy status with dynamic pricing
    const status = calculateEconomyStatus(animals, ownedShopItems, ticketPrice);

    // Update the cached economy stats in DB
    await db.update(learningProgression)
      .set({
        zooEconomyStats: {
          passiveIncomePerHour: status.passiveIncomePerHour,
          maintenanceCostPerHour: status.maintenanceCostPerHour,
          totalVisitorsPerHour: status.totalVisitorsPerHour,
          netIncomePerHour: status.netIncomePerHour,
          zooLevel: Math.floor(animals.length / 5) + 1,
          totalLifetimeVisitors: ((progression?.zooEconomyStats as any)?.totalLifetimeVisitors || 0),
          totalLifetimeIncome: ((progression?.zooEconomyStats as any)?.totalLifetimeIncome || 0),
        }
      })
      .where(eq(learningProgression.userId, userId));

    res.json(status);
  } catch (error) {
    console.error('Error getting economy status:', error);
    res.status(500).json({ error: 'Failed to get economy status' });
  }
});

// 🎮 GENERIC GAME SAVE ENDPOINT - speichert Spielergebnisse und Tiere!
router.post('/games/save', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { game, score, reward } = req.body;
    console.log(`🎮 Saving ${game} game result for user ${userId}:`, { score, reward });

    if (!game || reward === undefined) {
      return res.status(400).json({ error: 'Missing game or reward data' });
    }

    // Get current progression
    let progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      // Create new progression if doesn't exist
      progression = {
        userId,
        gameCoins: 0,
        gameAnimalsCollected: [],
        gameBadges: [],
        gameShopItems: [],
      } as any;
    }

    // Extract reward data
    const { coins = 0, animals = [], experience = 0 } = reward;
    
    // Update coins only (animals are in user_animal_cards table, not here)
    const newCoins = (progression.gameCoins || 0) + coins;

    console.log(`📊 Game result: +${coins} coins, +${animals.length} animals`);
    console.log(`🦁 Animals: ${animals.join(', ')}`);

    // Update progression with coins and total XP (which represents coins)
    const newTotalXp = (progression.totalXp || 0) + coins;
    
    await db.update(learningProgression)
      .set({
        gameCoins: newCoins,
        totalXp: newTotalXp,
        gameLastPlayed: new Date(),
      })
      .where(eq(learningProgression.userId, userId));

    // Add animals to user_animal_cards table if provided
    if (animals && animals.length > 0) {
      for (const animalType of animals) {
        const animalCard = await db.query.animalCards.findFirst({
          where: (ac) => ac.animalType === animalType,
        });
        if (animalCard) {
          const existingAnimal = await db.query.userAnimalCards.findFirst({
            where: (ua) => ua.userId === userId && ua.animalCardId === animalCard.id,
          });
          if (!existingAnimal) {
            await db.insert(userAnimalCards).values({
              id: `user-animal-${userId}-${animalType}-${Date.now()}`,
              userId,
              animalCardId: animalCard.id,
              friendshipLevel: 1,
              xp: 0,
              xpToNextLevel: 100,
              timesUsed: 0,
              gamesWon: 0,
              isUnlocked: true,
              unlockedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            } as any);
          }
        }
      }
    }

    // 🏆 AUTO-CHECK BADGES after animals are collected!
    if (animals.length > 0) {
      const currentBadges = Array.isArray(progression.gameBadges) ? progression.gameBadges : [];
      const updatedBadges = [...currentBadges];
      let badgesChanged = false;

      // Check animal collector badges
      if (newAnimals.length >= 5 && !updatedBadges.includes('animal-collector-5')) {
        updatedBadges.push('animal-collector-5');
        badgesChanged = true;
      }
      if (newAnimals.length >= 10 && !updatedBadges.includes('animal-collector-10')) {
        updatedBadges.push('animal-collector-10');
        badgesChanged = true;
      }
      if (newAnimals.length >= 20 && !updatedBadges.includes('animal-collector-20')) {
        updatedBadges.push('animal-collector-20');
        badgesChanged = true;
      }
      if (newAnimals.length >= 30 && !updatedBadges.includes('animal-collector-30')) {
        updatedBadges.push('animal-collector-30');
        badgesChanged = true;
      }

      if (badgesChanged) {
        await db.update(learningProgression)
          .set({ gameBadges: updatedBadges })
          .where(eq(learningProgression.userId, userId));
      }
    }

    res.json({
      success: true,
      message: `Game saved! +${coins} coins, +${animals.length} animals`,
      totals: {
        coins: newCoins,
        animals: newAnimals.length,
        animalsCollected: newAnimals
      }
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// 🏆 CHECK & UPDATE BADGES AUTOMATICALLY when animals change
router.post('/check-badges', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get current progression
    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });

    if (!progression) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current badges and animals from actual user_animal_cards table
    const currentBadges = Array.isArray(progression.gameBadges) ? progression.gameBadges : [];
    const userAnimalsCount = await db.query.userAnimalCards.findMany({
      where: eq(userAnimalCards.userId, userId),
    });
    const collectedAnimalsCount = userAnimalsCount.length;

    const newBadges = [...currentBadges];
    let badgesAdded = false;

    // Auto-check badge conditions
    // Animal collector badges (5, 10, 20, 30 animals)
    if (collectedAnimalsCount >= 5 && !newBadges.includes('animal-collector-5')) {
      newBadges.push('animal-collector-5');
      badgesAdded = true;
    }
    if (collectedAnimalsCount >= 10 && !newBadges.includes('animal-collector-10')) {
      newBadges.push('animal-collector-10');
      badgesAdded = true;
    }
    if (collectedAnimalsCount >= 20 && !newBadges.includes('animal-collector-20')) {
      newBadges.push('animal-collector-20');
      badgesAdded = true;
    }
    if (collectedAnimalsCount >= 30 && !newBadges.includes('animal-collector-30')) {
      newBadges.push('animal-collector-30');
      badgesAdded = true;
    }

    // If badges were added, update database
    if (badgesAdded) {
      await db.update(learningProgression)
        .set({ gameBadges: newBadges })
        .where(eq(learningProgression.userId, userId));
    }

    res.json({
      success: true,
      badgesUpdated: badgesAdded,
      newBadges: newBadges,
      totalAnimals: collectedAnimalsCount
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// 🎮 GENERATE TASK FOR ZOO ADVENTURE LEVEL - respects level configuration!
router.post('/task-by-level', isAuthenticated, async (req, res) => {
  try {
    const { level } = req.body;
    
    if (!level || level < 1 || level > 8) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    // Import level config
    const { ZOO_ADVENTURE_LEVELS } = await import('@shared/game-levels');
    const levelConfig = ZOO_ADVENTURE_LEVELS[level - 1];
    
    if (!levelConfig) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const { numberRange, operations, requiresTransition } = levelConfig;
    
    // Generate task respecting level config
    let operation: '+' | '-';
    let num1: number, num2: number;
    
    // Pick random operation from allowed operations for this level
    operation = operations[Math.floor(Math.random() * operations.length)] as '+' | '-';
    
    // Generate numbers based on range and operation
    if (numberRange === 10) {
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * (10 - num1)) + 1;
      } else {
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * num1) + 1;
      }
    } else if (numberRange === 20) {
      if (operation === '+') {
        if (requiresTransition) {
          // Force crossing 10
          num1 = Math.floor(Math.random() * 3) + 7;
          num2 = Math.floor(Math.random() * 6) + (11 - num1);
          if (num1 + num2 > 20) num2 = 20 - num1;
        } else {
          // No transition
          num1 = Math.floor(Math.random() * 5) + 11;
          num2 = Math.floor(Math.random() * (20 - num1)) + 1;
        }
      } else {
        if (requiresTransition) {
          // Subtraction with transition (crossing below 10)
          num1 = Math.floor(Math.random() * 8) + 11;
          const onesDigit = num1 % 10;
          num2 = Math.floor(Math.random() * (onesDigit + 5)) + 1;
          if (num2 > num1) num2 = num1 - 1;
        } else {
          // Subtraction without transition
          num1 = Math.floor(Math.random() * 8) + 12;
          const onesDigit = num1 % 10;
          num2 = Math.floor(Math.random() * onesDigit) + 1;
        }
      }
    } else if (numberRange === 100) {
      // ZR 100 - larger numbers
      num1 = Math.floor(Math.random() * 50) + 25;
      if (operation === '+') {
        num2 = Math.floor(Math.random() * Math.min(50, 100 - num1)) + 1;
      } else {
        num2 = Math.floor(Math.random() * Math.min(40, num1)) + 1;
      }
    }

    res.json({
      number1: num1!,
      number2: num2!,
      operation: operation,
      numberRange,
      level
    });
  } catch (error) {
    console.error('Error generating task:', error);
    res.status(500).json({ error: 'Failed to generate task' });
  }
});

export const zooRoutes = router;
export default router;

function registerZooRoutes(app: Express) {
  // Get zoo missions
  app.get('/api/zoo/missions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Mock missions data - in production, fetch from database
      const missions = [
        {
          id: 'mission-africa',
          type: 'continent',
          title: '🌍 Afrika-Expedition',
          description: 'Sammle 10 verschiedene Tiere aus Afrika',
          emoji: '🦁',
          targetCount: 10,
          currentProgress: 0,
          isCompleted: false,
          completedAt: null,
          coinReward: 500,
          xpReward: 100,
          difficulty: 2,
          unlockLevel: 1
        },
        {
          id: 'mission-asia',
          type: 'continent',
          title: '🌏 Asien-Abenteuer',
          description: 'Sammle 10 verschiedene Tiere aus Asien',
          emoji: '🐼',
          targetCount: 10,
          currentProgress: 0,
          isCompleted: false,
          completedAt: null,
          coinReward: 500,
          xpReward: 100,
          difficulty: 2,
          unlockLevel: 1
        },
        {
          id: 'mission-mammals',
          type: 'group',
          title: '🦁 Säugetier-Sammler',
          description: 'Sammle 15 verschiedene Säugetiere',
          emoji: '🐘',
          targetCount: 15,
          currentProgress: 0,
          isCompleted: false,
          completedAt: null,
          coinReward: 600,
          xpReward: 120,
          difficulty: 3,
          unlockLevel: 5
        },
        {
          id: 'mission-birds',
          type: 'group',
          title: '🦅 Vogel-Experte',
          description: 'Sammle 12 verschiedene Vögel',
          emoji: '🦜',
          targetCount: 12,
          currentProgress: 0,
          isCompleted: false,
          completedAt: null,
          coinReward: 550,
          xpReward: 110,
          difficulty: 3,
          unlockLevel: 5
        }
      ];

      res.json(missions);
    } catch (error) {
      console.error('Error fetching missions:', error);
      res.status(500).json({ error: 'Failed to fetch missions' });
    }
  });

  // Complete mission
  app.post('/api/zoo/missions/:missionId/complete', async (req, res) => {
    try {
      const { missionId } = req.params;
      const { userId } = req.body;

      // Mock completion - in production, update database
      const rewards = {
        coins: 500,
        xp: 100
      };

      res.json({ success: true, rewards });
    } catch (error) {
      console.error('Error completing mission:', error);
      res.status(500).json({ error: 'Failed to complete mission' });
    }
  });

  // Get partner zoos
  app.get('/api/zoo/partner-zoos/:userId', async (req, res) => {
    try {
      const partnerZoos = [
        {
          id: 'san-diego',
          name: 'San Diego Zoo',
          country: 'USA',
          continent: 'Nordamerika',
          flag: '🇺🇸',
          emoji: '🦒',
          description: 'Einer der grössten Zoos der Welt mit über 3.700 Tieren',
          specialAnimals: ['Giraffe', 'Koala', 'Panda'],
          isUnlocked: true,
          unlockedAt: new Date(),
          requirements: { level: 1 },
          rewards: { coins: 1000, badge: 'San Diego Forscher' }
        },
        {
          id: 'singapore',
          name: 'Singapore Zoo',
          country: 'Singapur',
          continent: 'Asien',
          flag: '🇸🇬',
          emoji: '🐯',
          description: 'Weltberühmt für seine naturnahen Gehege',
          specialAnimals: ['Tiger', 'Orang-Utan', 'Weisser Tiger'],
          isUnlocked: false,
          unlockedAt: null,
          requirements: { level: 5, coins: 500 },
          rewards: { coins: 1200, badge: 'Singapur Explorer' }
        },
        {
          id: 'berlin',
          name: 'Zoo Berlin',
          country: 'Deutschland',
          continent: 'Europa',
          flag: '🇩🇪',
          emoji: '🐼',
          description: 'Ältester Zoo Deutschlands mit über 20.000 Tieren',
          specialAnimals: ['Panda', 'Eisbär', 'Elefant'],
          isUnlocked: false,
          unlockedAt: null,
          requirements: { level: 8, animals: 30 },
          rewards: { coins: 1500, badge: 'Berlin Experte' }
        },
        {
          id: 'taronga',
          name: 'Taronga Zoo Sydney',
          country: 'Australien',
          continent: 'Ozeanien',
          flag: '🇦🇺',
          emoji: '🦘',
          description: 'Spektakuläre Lage mit Blick auf Sydney Harbour',
          specialAnimals: ['Känguru', 'Koala', 'Wombat'],
          isUnlocked: false,
          unlockedAt: null,
          requirements: { level: 10, animals: 30 },
          rewards: { coins: 1800, badge: 'Australien Meister' }
        },
        {
          id: 'london',
          name: 'London Zoo',
          country: 'England',
          continent: 'Europa',
          flag: '🇬🇧',
          emoji: '🦁',
          description: 'Ältester wissenschaftlicher Zoo der Welt (1828)',
          specialAnimals: ['Löwe', 'Gorilla', 'Pinguin'],
          isUnlocked: false,
          unlockedAt: null,
          requirements: { level: 12, continents: 3 },
          rewards: { coins: 2000, badge: 'London Legende' }
        },
        {
          id: 'bronx',
          name: 'Bronx Zoo',
          country: 'USA',
          continent: 'Nordamerika',
          flag: '🇺🇸',
          emoji: '🦓',
          description: 'Grösster Stadtzoo der USA mit 265 Hektar',
          specialAnimals: ['Zebra', 'Nashorn', 'Schneeleopard'],
          isUnlocked: false,
          unlockedAt: null,
          requirements: { level: 15, mastery: 5 },
          rewards: { coins: 2500, badge: 'Bronx Champion' }
        }
      ];

      res.json(partnerZoos);
    } catch (error) {
      console.error('Error fetching partner zoos:', error);
      res.status(500).json({ error: 'Failed to fetch partner zoos' });
    }
  });

  // Unlock partner zoo
  app.post('/api/zoo/partner-zoos/:zooId/unlock', async (req, res) => {
    try {
      const { zooId } = req.params;
      const { userId } = req.body;

      // Mock unlock - in production, update database
      const rewards = {
        coins: 1000,
        badge: 'Zoo Partner'
      };

      res.json({ success: true, rewards });
    } catch (error) {
      console.error('Error unlocking partner zoo:', error);
      res.status(500).json({ error: 'Failed to unlock partner zoo' });
    }
  });

  // Get big goals
  app.get('/api/zoo/big-goals/:userId', async (req, res) => {
    try {
      const bigGoals = [
        {
          id: 'continent-master',
          title: 'Kontinente-Meister',
          description: 'Sammle Tiere von allen 6 Kontinenten',
          emoji: '🌍',
          targetProgress: 6,
          currentProgress: 0,
          measureType: 'continents',
          hugereward: {
            coins: 5000,
            xp: 1000,
            badge: 'Welt-Entdecker'
          },
          isCompleted: false,
          completedAt: null
        },
        {
          id: 'animal-collector',
          title: 'Tier-Sammler',
          description: 'Sammle insgesamt 100 verschiedene Tiere',
          emoji: '🦁',
          targetProgress: 100,
          currentProgress: 0,
          measureType: 'animals',
          hugereward: {
            coins: 10000,
            xp: 2000,
            badge: 'Super-Sammler'
          },
          isCompleted: false,
          completedAt: null
        },
        {
          id: 'coin-millionaire',
          title: 'Münzen-Millionär',
          description: 'Verdiene insgesamt 50.000 Münzen',
          emoji: '💰',
          targetProgress: 50000,
          currentProgress: 0,
          measureType: 'coins',
          hugereward: {
            coins: 15000,
            xp: 3000,
            badge: 'Rechen-Milionär'
          },
          isCompleted: false,
          completedAt: null
        },
        {
          id: 'game-master',
          title: 'Spiel-Meister',
          description: 'Spiele 500 Mathe-Spiele',
          emoji: '🎮',
          targetProgress: 500,
          currentProgress: 0,
          measureType: 'games_played',
          hugereward: {
            coins: 8000,
            xp: 1500,
            badge: 'Spiel-Champion'
          },
          isCompleted: false,
          completedAt: null
        },
        {
          id: 'partner-explorer',
          title: 'Partner-Zoo Explorer',
          description: 'Schalte alle 6 Partner-Zoos frei',
          emoji: '🗺️',
          targetProgress: 6,
          currentProgress: 0,
          measureType: 'partners',
          hugereward: {
            coins: 12000,
            xp: 2500,
            badge: 'Zoo-Netzwerker'
          },
          isCompleted: false,
          completedAt: null
        },
        {
          id: 'competency-legend',
          title: 'Rechen-Legende',
          description: 'Meistere 10 Mathematik-Kompetenzen',
          emoji: '🧮',
          targetProgress: 10,
          currentProgress: 0,
          measureType: 'groups',
          hugereward: {
            coins: 20000,
            xp: 5000,
            badge: 'Mathe-Legende'
          },
          isCompleted: false,
          completedAt: null
        }
      ];

      res.json(bigGoals);
    } catch (error) {
      console.error('Error fetching big goals:', error);
      res.status(500).json({ error: 'Failed to fetch big goals' });
    }
  });

  // Complete big goal
  app.post('/api/zoo/big-goals/:goalId/complete', async (req, res) => {
    try {
      const { goalId } = req.params;
      const { userId } = req.body;

      // Mock completion - in production, update database
      const rewards = {
        coins: 5000,
        xp: 1000,
        badge: 'Champion'
      };

      res.json({ success: true, rewards });
    } catch (error) {
      console.error('Error completing big goal:', error);
      res.status(500).json({ error: 'Failed to complete big goal' });
    }
  });
}