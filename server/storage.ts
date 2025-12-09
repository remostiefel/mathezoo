import type {
  User,
  UpsertUser,
  CognitiveProfile,
  InsertCognitiveProfile,
  LearningSession,
  InsertLearningSession,
  Task,
  InsertTask,
  Achievement,
  InsertAchievement,
  LearningProgression,
  InsertLearningProgression,
  ProblemStatistics,
  InsertProblemStatistics,
  ZahlenwaageGameStats,
  InsertZahlenwaageGameStats,
  Mission,
  InsertMission,
  PartnerZoo,
  InsertPartnerZoo,
  BigGoal,
  InsertBigGoal,
  HomeworkSet,
  InsertHomeworkSet,
  AnimalCard,
  InsertAnimalCard,
  UserAnimalCard,
  InsertUserAnimalCard,
  TeamBonus,
  InsertTeamBonus,
  Campaign,
  InsertCampaign,
  UserCampaignProgress,
  InsertUserCampaignProgress,
  UserTeam,
  InsertUserTeam,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getStudentsByTeacherId(teacherId: string): Promise<User[]>;
  getStudentsByTeacherId(teacherId: string): Promise<User[]>;
  getStudentsByClassId(classId: string): Promise<User[]>;

  // Class Teacher operations
  addClassTeacher(classId: string, teacherId: string): Promise<void>;
  getClassTeachers(classId: string): Promise<User[]>;
  isTeacherOfClass(teacherId: string, classId: string): Promise<boolean>;

  // Cognitive Profile operations
  getCognitiveProfile(userId: string): Promise<CognitiveProfile | undefined>;
  createCognitiveProfile(profile: InsertCognitiveProfile): Promise<CognitiveProfile>;
  updateCognitiveProfile(userId: string, profile: Partial<InsertCognitiveProfile>): Promise<CognitiveProfile>;

  // Learning Session operations
  createLearningSession(session: InsertLearningSession): Promise<LearningSession>;
  getLearningSession(id: string): Promise<LearningSession | undefined>;
  getSessionsByUserId(userId: string): Promise<LearningSession[]>;
  updateLearningSession(id: string, session: Partial<InsertLearningSession>): Promise<LearningSession>;
  deleteLearningSessionsByUserId(userId: string): Promise<void>;

  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasksBySessionId(sessionId: string): Promise<Task[]>;
  getRecentTaskResults(userId: string, limit: number): Promise<Task[]>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  deleteTasksByUserId(userId: string): Promise<void>;

  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievementsByUserId(userId: string): Promise<Achievement[]>;
  unlockAchievement(id: string): Promise<Achievement>;

  // Learning Progression operations
  getLearningProgression(userId: string): Promise<LearningProgression | undefined>;
  createLearningProgression(progression: InsertLearningProgression): Promise<LearningProgression>;
  updateLearningProgression(userId: string, progression: Partial<InsertLearningProgression>): Promise<LearningProgression>;
  initializeProgressionForUser(userId: string): Promise<LearningProgression>;
  resetLearningProgression(userId: string): Promise<LearningProgression>;

  // Problem Statistics operations
  getProblemStatistics(operation: string, number1: number, number2: number, numberRange: number): Promise<ProblemStatistics | undefined>;
  upsertProblemStatistics(stats: InsertProblemStatistics): Promise<ProblemStatistics>;
  updateProblemStatisticsAfterAttempt(operation: string, number1: number, number2: number, numberRange: number, isCorrect: boolean, timeTaken: number): Promise<ProblemStatistics>;
  getAllProblemStatistics(): Promise<ProblemStatistics[]>;
  getAllProblemStatisticsWithPlaceholders(): Promise<any[]>;

  // Zahlenwaage Game Stats operations
  getZahlenwaageStats(userId: string, mode: 'student' | 'teacher_training'): Promise<ZahlenwaageGameStats | undefined>;
  upsertZahlenwaageStats(userId: string, mode: 'student' | 'teacher_training', stats: {
    animalsCollected: string[];
    partiesCount: number;
    totalAttempts: number;
    correctAnswers: number;
  }): Promise<ZahlenwaageGameStats>;

  // Mission operations
  getMissionsByUserId(userId: string): Promise<Mission[]>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMissionProgress(id: string, progress: number): Promise<Mission>;
  completeMission(id: string): Promise<Mission>;
  initializeMissionsForUser(userId: string): Promise<void>;

  // Partner Zoo operations
  getPartnerZoosByUserId(userId: string): Promise<PartnerZoo[]>;
  createPartnerZoo(partnerZoo: InsertPartnerZoo): Promise<PartnerZoo>;
  unlockPartnerZoo(id: string): Promise<PartnerZoo>;
  initializePartnerZoosForUser(userId: string): Promise<void>;

  // Big Goal operations
  getBigGoalsByUserId(userId: string): Promise<BigGoal[]>;
  createBigGoal(bigGoal: InsertBigGoal): Promise<BigGoal>;
  updateBigGoalProgress(id: string, progress: number): Promise<BigGoal>;
  completeBigGoal(id: string): Promise<BigGoal>;
  initializeBigGoalsForUser(userId: string): Promise<void>;

  // Homework Set operations
  createHomeworkSet(data: InsertHomeworkSet): Promise<HomeworkSet>;
  getHomeworkSet(homeworkSetId: string): Promise<HomeworkSet | null>;

  // Animal Card System operations
  getAllAnimalCards(): Promise<AnimalCard[]>;
  getAnimalCard(id: string): Promise<AnimalCard | undefined>;
  createAnimalCard(card: InsertAnimalCard): Promise<AnimalCard>;

  getUserAnimalCards(userId: string): Promise<UserAnimalCard[]>;
  getUserAnimalCard(userId: string, animalCardId: string): Promise<UserAnimalCard | undefined>;
  createUserAnimalCard(card: InsertUserAnimalCard): Promise<UserAnimalCard>;
  updateUserAnimalCard(id: string, updates: Partial<InsertUserAnimalCard>): Promise<UserAnimalCard>;
  unlockAnimalForUser(userId: string, animalCardId: string): Promise<UserAnimalCard>;
  addXPToAnimal(userId: string, animalCardId: string, xp: number): Promise<UserAnimalCard>;

  getAllTeamBonuses(): Promise<TeamBonus[]>;
  createTeamBonus(bonus: InsertTeamBonus): Promise<TeamBonus>;

  getAllCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;

  getUserCampaignProgress(userId: string, campaignId: string): Promise<UserCampaignProgress | undefined>;
  getUserAllCampaignProgress(userId: string): Promise<UserCampaignProgress[]>;
  createUserCampaignProgress(progress: InsertUserCampaignProgress): Promise<UserCampaignProgress>;
  updateUserCampaignProgress(id: string, updates: Partial<InsertUserCampaignProgress>): Promise<UserCampaignProgress>;

  // User Teams operations
  getUserTeams(userId: string): Promise<UserTeam[]>;
  getUserTeam(teamId: string): Promise<UserTeam | undefined>;
  createUserTeam(teamData: InsertUserTeam): Promise<UserTeam>;
  updateUserTeam(teamId: string, updates: Partial<InsertUserTeam>): Promise<UserTeam>;
  deleteUserTeam(teamId: string): Promise<void>;
  setActiveTeam(userId: string, teamId: string): Promise<UserTeam>;
  getActiveTeam(userId: string): Promise<UserTeam | undefined>;

  initializeAnimalCardsForUser(userId: string): Promise<void>;
}

import { db } from "./db";
import { eq, and, sql, inArray, isNotNull, desc } from "drizzle-orm";
import {
  users,
  classes,
  cognitiveProfiles,
  learningSessions,
  tasks,
  achievements,
  learningProgression,
  problemStatistics,
  zahlenwaageGameStats,
  missions,
  partnerZoos,
  bigGoals,
  homeworkSets,
  animalCards,
  userAnimalCards,
  userTeams,
  teamBonuses,
  campaigns,
  userCampaignProgress,
  classTeachers,
} from "../shared/schema";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Users table doesn't have email field, use username instead
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllClasses() {
    return db.select().from(classes);
  }

  async getClass(classId: string) {
    const result = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);
    return result[0] || null;
  }

  async getClassByName(name: string) {
    const result = await db
      .select()
      .from(classes)
      .where(eq(classes.name, name))
      .limit(1);
    return result[0] || null;
  }

  async createClass(classData: { name: string; teacherId: string }) {
    const [newClass] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return newClass;
  }

  async addClassTeacher(classId: string, teacherId: string): Promise<void> {
    await db
      .insert(classTeachers)
      .values({
        classId,
        teacherId,
      })
      .onConflictDoNothing();
  }

  async getClassTeachers(classId: string): Promise<User[]> {
    const results = await db
      .select({
        user: users
      })
      .from(classTeachers)
      .innerJoin(users, eq(classTeachers.teacherId, users.id))
      .where(eq(classTeachers.classId, classId));

    return results.map(r => r.user);
  }

  async isTeacherOfClass(teacherId: string, classId: string): Promise<boolean> {
    // Check primary teacher (legacy/single-owner support)
    const [classRecord] = await db
      .select()
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.teacherId, teacherId)))
      .limit(1);

    if (classRecord) return true;

    // Check secondary teachers (many-to-many)
    const [assignment] = await db
      .select()
      .from(classTeachers)
      .where(and(
        eq(classTeachers.classId, classId),
        eq(classTeachers.teacherId, teacherId)
      ))
      .limit(1);

    return !!assignment;
  }

  async getStudentsByTeacherId(teacherId: string): Promise<User[]> {
    // Check if user is admin
    const teacher = await db
      .select()
      .from(users)
      .where(eq(users.id, teacherId))
      .limit(1);

    if (teacher.length > 0 && teacher[0].role === 'admin') {
      // Admin sees all students
      console.log('Admin user - fetching all students');
      const allStudents = await db
        .select()
        .from(users)
        .where(eq(users.role, 'student'));
      console.log('Total students found for admin:', allStudents.length);
      return allStudents;
    }

    // Regular teacher - only see students from their classes
    const teacherClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, teacherId));

    const classIds = teacherClasses.map(c => c.id);

    // Also get classes where they are a secondary teacher
    const secondaryClasses = await db
      .select({ classId: classTeachers.classId })
      .from(classTeachers)
      .where(eq(classTeachers.teacherId, teacherId));

    const allClassIds = [...new Set([...classIds, ...secondaryClasses.map(sc => sc.classId)])];

    console.log('Class IDs (all):', allClassIds);

    if (allClassIds.length === 0) {
      console.log('No classes found for teacher:', teacherId);
      return [];
    }

    // OPTIMIZED: Single query instead of N queries (fixed N+1 problem)
    const students = await db
      .select()
      .from(users)
      .where(and(
        inArray(users.classId, allClassIds),
        eq(users.role, 'student')
      ));

    console.log('Total students found:', students.length);
    return students;
  }

  async getStudentsByClassId(classId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.classId, classId));
  }

  async getCognitiveProfile(userId: string): Promise<CognitiveProfile | undefined> {
    const [profile] = await db
      .select()
      .from(cognitiveProfiles)
      .where(eq(cognitiveProfiles.userId, userId))
      .limit(1);

    return profile;
  }

  async createCognitiveProfile(data: InsertCognitiveProfile): Promise<CognitiveProfile> {
    const [profile] = await db
      .insert(cognitiveProfiles)
      .values(data)
      .returning();

    return profile;
  }

  async updateCognitiveProfile(
    userId: string,
    profileData: Partial<InsertCognitiveProfile>
  ): Promise<CognitiveProfile> {
    const [updated] = await db
      .update(cognitiveProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(cognitiveProfiles.userId, userId))
      .returning();

    if (!updated) {
      throw new Error("Cognitive profile not found");
    }

    return updated;
  }

  async createLearningSession(session: InsertLearningSession): Promise<LearningSession> {
    const [newSession] = await db
      .insert(learningSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getLearningSession(id: string): Promise<LearningSession | undefined> {
    const [session] = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.id, id));
    return session;
  }

  async getSessionsByUserId(userId: string): Promise<LearningSession[]> {
    return await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.userId, userId));
  }

  async updateLearningSession(
    id: string,
    sessionData: Partial<InsertLearningSession>
  ): Promise<LearningSession> {
    const [updated] = await db
      .update(learningSessions)
      .set(sessionData)
      .where(eq(learningSessions.id, id))
      .returning();

    if (!updated) {
      throw new Error("Learning session not found");
    }

    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async deleteLearningSession(id: string): Promise<void> {
    await db.delete(learningSessions).where(eq(learningSessions.id, id));
  }

  async deleteTasksByUserId(userId: string): Promise<void> {
    const sessions = await this.getSessionsByUserId(userId);
    const sessionIds = sessions.map(session => session.id);
    if (sessionIds.length === 0) {
      return;
    }
    await db.delete(tasks).where(
      inArray(tasks.sessionId, sessionIds)
    );
  }

  async deleteLearningSessionsByUserId(userId: string): Promise<void> {
    await db.delete(learningSessions).where(eq(learningSessions.userId, userId));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return newTask;
  }

  async getTasksBySessionId(sessionId: string): Promise<Task[]>;
  async getTasksBySessionId(sessionId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.sessionId, sessionId));
  }

  async getRecentTaskResults(userId: string, limit: number): Promise<Task[]> {
    // Get all sessions for this user
    const userSessions = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.userId, userId));

    if (userSessions.length === 0) {
      return [];
    }

    const sessionIds = userSessions.map(s => s.id);

    // Get tasks from all sessions, ordered by creation date
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(tasks.createdAt);

    // Filter by session IDs and limit
    const userTasks = allTasks
      .filter(task => task.sessionId && sessionIds.includes(task.sessionId))
      .slice(-limit);

    return userTasks;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    const sessions = await this.getSessionsByUserId(userId);
    const sessionIds = sessions.map(s => s.id);

    if (sessionIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(tasks)
      .where(inArray(tasks.sessionId, sessionIds))
      .orderBy(desc(tasks.createdAt));
  }

  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievementData)
      .returning();
    return newAchievement;
  }

  async getAchievementsByUserId(userId: string): Promise<Achievement[]>;
  async getAchievementsByUserId(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }

  async unlockAchievement(id: string): Promise<Achievement> {
    const [updated] = await db
      .update(achievements)
      .set({
        isUnlocked: true,
        progress: 100,
        unlockedAt: new Date(),
      })
      .where(eq(achievements.id, id))
      .returning();

    if (!updated) {
      throw new Error("Achievement not found");
    }

    return updated;
  }

  async getUserTeams(userId: string): Promise<UserTeam[]> {
    return await db.select().from(userTeams).where(eq(userTeams.userId, userId));
  }

  async getUserTeam(teamId: string): Promise<UserTeam | undefined> {
    const [team] = await db.select().from(userTeams).where(eq(userTeams.id, teamId));
    return team;
  }

  async createUserTeam(teamData: InsertUserTeam): Promise<UserTeam> {
    const [newTeam] = await db.insert(userTeams).values(teamData).returning();
    return newTeam;
  }

  async updateUserTeam(teamId: string, updates: Partial<InsertUserTeam>): Promise<UserTeam> {
    const [updated] = await db
      .update(userTeams)
      .set(updates)
      .where(eq(userTeams.id, teamId))
      .returning();
    if (!updated) throw new Error("Team not found");
    return updated;
  }

  async deleteUserTeam(teamId: string): Promise<void> {
    await db.delete(userTeams).where(eq(userTeams.id, teamId));
  }

  async setActiveTeam(userId: string, teamId: string): Promise<UserTeam> {
    await db.update(userTeams).set({ isActive: false }).where(eq(userTeams.userId, userId));
    const [active] = await db
      .update(userTeams)
      .set({ isActive: true })
      .where(eq(userTeams.id, teamId))
      .returning();
    if (!active) throw new Error("Team not found");
    return active;
  }

  async getActiveTeam(userId: string): Promise<UserTeam | undefined> {
    const [team] = await db.select().from(userTeams).where(and(eq(userTeams.userId, userId), eq(userTeams.isActive, true)));
    return team;
  }

  async getLearningProgression(userId: string): Promise<LearningProgression | undefined> {
    try {
      const [progression] = await db
        .select()
        .from(learningProgression)
        .where(eq(learningProgression.userId, userId));
      return progression;
    } catch (err) {
      console.warn('getLearningProgression error:', err);
      return undefined;
    }
  }

  async createLearningProgression(progressionData: InsertLearningProgression): Promise<LearningProgression> {
    const [newProgression] = await db
      .insert(learningProgression)
      .values(progressionData)
      .returning();
    return newProgression;
  }

  async updateLearningProgression(
    userId: string,
    progressionData: Partial<InsertLearningProgression>
  ): Promise<LearningProgression> {
    const [updated] = await db
      .update(learningProgression)
      .set({
        ...progressionData,
        updatedAt: new Date(),
      })
      .where(eq(learningProgression.userId, userId))
      .returning();

    if (!updated) {
      throw new Error("Learning progression not found");
    }

    return updated;
  }

  async initializeProgressionForUser(userId: string): Promise<LearningProgression> {
    if (!userId || typeof userId !== 'string') {
      throw new Error(`Invalid userId provided: ${userId}`);
    }

    console.log("Initializing progression for userId:", userId);

    // Check if already exists - if yes, return it
    const existing = await this.getLearningProgression(userId);
    if (existing) {
      console.log("Progression already exists for user", userId);
      return existing;
    }

    // Verify user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }

    // Initialize with Level 1 - with all required defaults
    const initialProgression: InsertLearningProgression = {
      userId,
      currentLevel: 1,
      totalXP: 0,
      xpToNextLevel: 100,
      modulesAccessed: {} as any,
      plusMinusLevel: 0,
      plusMinusLeveledUp: false,
      multiplicationLevel: 0,
      multiplicationLeveledUp: false,
      zahlenwaageLeveledUp: false,
      zahlenwaageScore: 0,
      badges: '',
      gameCoins: 0,
      gameAnimalsCollected: [] as any, // DEPRECATED - use user_animal_cards table
      gameShopItems: [] as any,
      gameBadges: [] as any,
      gameCorrectAnswers: 0,
      gameHighScore: 0,
      gamePartiesCount: 0,
      gameTotalAttempts: 0,
      gameZahlenwaageScore: 0,
      gameZahlenwaagePlayed: 0,
      gameZahlenwaageHighScore: 0,
      gameDecompositionScore: 0,
      gameDecompositionPlayed: 0,
      gameDecompositionHighScore: 0,
      gameDoublingScore: 0,
      gameDoublingPlayed: 0,
      gameDoublingHighScore: 0,
      gameTenWinsScore: 0,
      gameTenWinsPlayed: 0,
      gameTenWinsHighScore: 0,
      gamePathfinderScore: 0,
      gamePathfinderPlayed: 0,
      gamePathfinderHighScore: 0,
      zooAnimals: [] as any, // DEPRECATED - use user_animal_cards table
      zooEconomyStats: {} as any,
      levelHistory: [] as any,
      ticketPrice: 1.0,
      totalCorrect: 0,
      totalTasksSolved: 0,
      currentStreak: 0,
      lastActivityAt: new Date(),
    };

    return await this.createLearningProgression(initialProgression);
  }

  async resetLearningProgression(userId: string): Promise<LearningProgression> {
    console.log("Resetting progression for userId:", userId);

    // Delete existing progression
    await db.delete(learningProgression)
      .where(eq(learningProgression.userId, userId));

    // Delete all tasks and learning sessions for this user
    await this.deleteTasksByUserId(userId);
    await this.deleteLearningSessionsByUserId(userId);

    // Reinitialize from scratch
    return await this.initializeProgressionForUser(userId);
  }

  // Problem Statistics operations
  async getProblemStatistics(
    operation: string,
    number1: number,
    number2: number,
    numberRange: number
  ): Promise<ProblemStatistics | undefined> {
    const [stats] = await db
      .select()
      .from(problemStatistics)
      .where(
        and(
          eq(problemStatistics.operation, operation as '+' | '-'),
          eq(problemStatistics.number1, number1),
          eq(problemStatistics.number2, number2),
          eq(problemStatistics.numberRange, numberRange)
        )
      );
    return stats;
  }

  async upsertProblemStatistics(statsData: InsertProblemStatistics): Promise<ProblemStatistics> {
    const correctAnswer = (statsData.number1 && statsData.number2 && statsData.operation === '+')
      ? statsData.number1 + statsData.number2
      : (statsData.number1 && statsData.number2)
        ? statsData.number1 - statsData.number2
        : 0;

    const [stats] = await db
      .insert(problemStatistics)
      .values({
        ...statsData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [
          problemStatistics.operation,
          problemStatistics.number1,
          problemStatistics.number2,
          problemStatistics.numberRange,
        ],
        set: {
          ...statsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return stats;
  }

  async updateProblemStatisticsAfterAttempt(
    operation: string,
    number1: number,
    number2: number,
    numberRange: number,
    isCorrect: boolean,
    timeTaken: number
  ): Promise<ProblemStatistics> {
    const existing = await this.getProblemStatistics(operation, number1, number2, numberRange);

    const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;

    if (!existing) {
      // Create new statistics entry
      return await this.upsertProblemStatistics({
        operation: operation as '+' | '-',
        number1,
        number2,
        numberRange,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        incorrectAttempts: isCorrect ? 0 : 1,
        successRate: isCorrect ? 1.0 : 0.0,
        averageTime: timeTaken,
        fastestTime: timeTaken,
        slowestTime: timeTaken,
        lastAttemptedAt: new Date(),
      });
    }

    // Update existing statistics
    const newTotalAttempts = existing.totalAttempts + 1;
    const newCorrectAttempts = existing.correctAttempts + (isCorrect ? 1 : 0);
    const newIncorrectAttempts = existing.incorrectAttempts + (isCorrect ? 0 : 1);
    const newSuccessRate = newCorrectAttempts / newTotalAttempts;

    // Update average time (weighted average)
    const newAverageTime =
      (existing.averageTime * existing.totalAttempts + timeTaken) / newTotalAttempts;

    const newFastestTime =
      existing.fastestTime ? Math.min(existing.fastestTime, timeTaken) : timeTaken;
    const newSlowestTime =
      existing.slowestTime ? Math.max(existing.slowestTime, timeTaken) : timeTaken;

    const [updated] = await db
      .update(problemStatistics)
      .set({
        totalAttempts: newTotalAttempts,
        correctAttempts: newCorrectAttempts,
        incorrectAttempts: newIncorrectAttempts,
        successRate: newSuccessRate,
        averageTime: newAverageTime,
        fastestTime: newFastestTime,
        slowestTime: newSlowestTime,
        lastAttemptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(problemStatistics.id, existing.id))
      .returning();

    return updated;
  }

  async getAllProblemStatistics(): Promise<any[]> {
    const result = await db
      .select({
        problem: sql<string>`CONCAT(${tasks.number1}, ${tasks.operation}, ${tasks.number2})`,
        operation: tasks.operation,
        numberRange: tasks.numberRange,
        averageTime: sql<number>`AVG(${tasks.timeTaken})`,
        successRate: sql<number>`SUM(CASE WHEN ${tasks.isCorrect} THEN 1 ELSE 0 END)::FLOAT / COUNT(*)`,
        totalAttempts: sql<number>`COUNT(*)`,
      })
      .from(tasks)
      .where(isNotNull(tasks.timeTaken))
      .groupBy(sql`CONCAT(${tasks.number1}, ${tasks.operation}, ${tasks.number2})`, tasks.operation, tasks.numberRange)
      .orderBy(sql`AVG(${tasks.timeTaken}) DESC`);

    return result;
  }

  async getAllProblemStatisticsWithPlaceholders() {
    const result = await db
      .select({
        problem: sql<string>`CASE
          WHEN ${tasks.placeholderPosition} = 'start' THEN CONCAT('_', ${tasks.operation}, ${tasks.number2}, '=', ${tasks.correctAnswer})
          WHEN ${tasks.placeholderPosition} = 'middle' THEN CONCAT(${tasks.number1}, ${tasks.operation}, '_=', ${tasks.correctAnswer})
          WHEN ${tasks.placeholderPosition} = 'end' THEN CONCAT(${tasks.number1}, ${tasks.operation}, ${tasks.number2}, '=_')
          ELSE CONCAT(${tasks.number1}, ${tasks.operation}, ${tasks.number2})
        END`,
        operation: tasks.operation,
        numberRange: tasks.numberRange,
        placeholderPosition: tasks.placeholderPosition,
        number1: tasks.number1,
        number2: tasks.number2,
        correctAnswer: tasks.correctAnswer,
        averageTime: sql<number>`AVG(${tasks.timeTaken})`,
        successRate: sql<number>`SUM(CASE WHEN ${tasks.isCorrect} THEN 1 ELSE 0 END)::FLOAT / COUNT(*)`,
        totalAttempts: sql<number>`COUNT(*)`,
      })
      .from(tasks)
      .where(isNotNull(tasks.timeTaken))
      .groupBy(
        sql`CASE
          WHEN ${tasks.placeholderPosition} = 'start' THEN CONCAT('_', ${tasks.operation}, ${tasks.number2}, '=', ${tasks.correctAnswer})
          WHEN ${tasks.placeholderPosition} = 'middle' THEN CONCAT(${tasks.number1}, ${tasks.operation}, '_=', ${tasks.correctAnswer})
          WHEN ${tasks.placeholderPosition} = 'end' THEN CONCAT(${tasks.number1}, ${tasks.operation}, ${tasks.number2}, '=_')
          ELSE CONCAT(${tasks.number1}, ${tasks.operation}, ${tasks.number2})
        END`,
        tasks.operation,
        tasks.numberRange,
        tasks.placeholderPosition,
        tasks.number1,
        tasks.number2,
        tasks.correctAnswer
      )
      .orderBy(sql`AVG(${tasks.timeTaken}) DESC`);

    return result;
  }

  async getZahlenwaageStats(userId: string, mode: 'student' | 'teacher_training'): Promise<ZahlenwaageGameStats | undefined> {
    const [stats] = await db
      .select()
      .from(zahlenwaageGameStats)
      .where(and(eq(zahlenwaageGameStats.userId, userId), eq(zahlenwaageGameStats.mode, mode)))
      .limit(1);
    return stats;
  }

  async upsertZahlenwaageStats(
    userId: string,
    mode: 'student' | 'teacher_training',
    stats: {
      animalsCollected: string[];
      partiesCount: number;
      totalAttempts: number;
      correctAnswers: number;
    }
  ): Promise<ZahlenwaageGameStats> {
    const existing = await this.getZahlenwaageStats(userId, mode);

    if (!existing) {
      // Create new entry
      const [newStats] = await db
        .insert(zahlenwaageGameStats)
        .values({
          userId,
          gameType: 'zahlenwaage',
          mode,
          totalAttempts: stats.totalAttempts,
          correctAnswers: stats.correctAnswers,
          confettiStreaks: stats.partiesCount,
          animalsCollected: stats.animalsCollected,
          gamesPlayed: 1,
          lastPlayedAt: new Date(),
        })
        .returning();
      return newStats;
    }

    // Update existing entry - accumulate stats
    const [updated] = await db
      .update(zahlenwaageGameStats)
      .set({
        totalAttempts: existing.totalAttempts + stats.totalAttempts,
        correctAnswers: existing.correctAnswers + stats.correctAnswers,
        confettiStreaks: existing.confettiStreaks + stats.partiesCount,
        animalsCollected: [
          ...(Array.isArray(existing.animalsCollected) ? existing.animalsCollected : []),
          ...stats.animalsCollected
        ],
        gamesPlayed: existing.gamesPlayed + 1,
        lastPlayedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(zahlenwaageGameStats.userId, userId),
        eq(zahlenwaageGameStats.mode, mode)
      ))
      .returning();
    return updated;
  }

  async getMissionsByUserId(userId: string): Promise<Mission[]> {
    return await db.select().from(missions).where(eq(missions.userId, userId));
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    const [newMission] = await db.insert(missions).values(mission).returning();
    return newMission;
  }

  async updateMissionProgress(id: string, progress: number): Promise<Mission> {
    const [updated] = await db
      .update(missions)
      .set({ progress })
      .where(eq(missions.id, id))
      .returning();
    return updated;
  }

  async completeMission(id: string): Promise<Mission> {
    const [completed] = await db
      .update(missions)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(missions.id, id))
      .returning();
    return completed;
  }

  async initializeMissionsForUser(userId: string): Promise<void> {
    // Missions werden dynamisch im Frontend basierend auf MISSION_TEMPLATES erstellt
    // Hier ist keine Initialisierung nötig
  }

  async getPartnerZoosByUserId(userId: string): Promise<PartnerZoo[]> {
    return await db.select().from(partnerZoos).where(eq(partnerZoos.userId, userId));
  }

  async createPartnerZoo(partnerZoo: InsertPartnerZoo): Promise<PartnerZoo> {
    const [newPartnerZoo] = await db.insert(partnerZoos).values(partnerZoo).returning();
    return newPartnerZoo;
  }

  async unlockPartnerZoo(id: string): Promise<PartnerZoo> {
    const [unlocked] = await db
      .update(partnerZoos)
      .set({ isUnlocked: true, unlockedAt: new Date() })
      .where(eq(partnerZoos.id, id))
      .returning();
    return unlocked;
  }

  async initializePartnerZoosForUser(userId: string): Promise<void> {
    // Partner Zoos werden dynamisch im Frontend basierend auf PARTNER_ZOOS erstellt
    // Hier ist keine Initialisierung nötig
  }

  async getBigGoalsByUserId(userId: string): Promise<BigGoal[]> {
    return await db.select().from(bigGoals).where(eq(bigGoals.userId, userId));
  }

  async createBigGoal(bigGoal: InsertBigGoal): Promise<BigGoal> {
    const [newBigGoal] = await db.insert(bigGoals).values(bigGoal).returning();
    return newBigGoal;
  }

  async updateBigGoalProgress(id: string, progress: number): Promise<BigGoal> {
    const [updated] = await db
      .update(bigGoals)
      .set({ currentProgress: progress })
      .where(eq(bigGoals.id, id))
      .returning();
    return updated;
  }

  async completeBigGoal(id: string): Promise<BigGoal> {
    const [completed] = await db
      .update(bigGoals)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(bigGoals.id, id))
      .returning();
    return completed;
  }

  async initializeBigGoalsForUser(userId: string): Promise<void> {
    // Big Goals werden dynamisch im Frontend basierend auf BIG_GOALS erstellt
    // Hier ist keine Initialisierung nötig
  }

  async createHomeworkSet(data: InsertHomeworkSet): Promise<HomeworkSet> {
    const [homeworkSet] = await db
      .insert(homeworkSets)
      .values(data)
      .returning();
    return homeworkSet;
  }

  async getHomeworkSet(homeworkSetId: string): Promise<HomeworkSet | null> {
    const [homeworkSet] = await db
      .select()
      .from(homeworkSets)
      .where(eq(homeworkSets.id, homeworkSetId))
      .limit(1);
    return homeworkSet || null;
  }

  // ===== ANIMAL CARD SYSTEM OPERATIONS =====

  async getAllAnimalCards(): Promise<AnimalCard[]> {
    return await db.select().from(animalCards);
  }

  async getAnimalCard(id: string): Promise<AnimalCard | undefined> {
    const [card] = await db.select().from(animalCards).where(eq(animalCards.id, id));
    return card;
  }

  async createAnimalCard(card: InsertAnimalCard): Promise<AnimalCard> {
    const [newCard] = await db.insert(animalCards).values(card).returning();
    return newCard;
  }

  async getUserAnimalCards(userId: string): Promise<UserAnimalCard[]> {
    return await db.select({
      id: userAnimalCards.id,
      userId: userAnimalCards.userId,
      animalCardId: userAnimalCards.animalCardId,
      individualName: userAnimalCards.individualName,
      friendshipLevel: userAnimalCards.friendshipLevel,
      xp: userAnimalCards.xp,
      xpToNextLevel: userAnimalCards.xpToNextLevel,
      timesUsed: userAnimalCards.timesUsed,
      gamesWon: userAnimalCards.gamesWon,
      isUnlocked: userAnimalCards.isUnlocked,
      unlockedAt: userAnimalCards.unlockedAt,
      lastUsedAt: userAnimalCards.lastUsedAt,
      createdAt: userAnimalCards.createdAt,
      updatedAt: userAnimalCards.updatedAt
    }).from(userAnimalCards).where(eq(userAnimalCards.userId, userId));
  }

  async getUserAnimalCard(userId: string, animalCardId: string): Promise<UserAnimalCard | undefined> {
    const [userCard] = await db
      .select({
        id: userAnimalCards.id,
        userId: userAnimalCards.userId,
        animalCardId: userAnimalCards.animalCardId,
        individualName: userAnimalCards.individualName,
        friendshipLevel: userAnimalCards.friendshipLevel,
        xp: userAnimalCards.xp,
        xpToNextLevel: userAnimalCards.xpToNextLevel,
        timesUsed: userAnimalCards.timesUsed,
        gamesWon: userAnimalCards.gamesWon,
        isUnlocked: userAnimalCards.isUnlocked,
        unlockedAt: userAnimalCards.unlockedAt,
        lastUsedAt: userAnimalCards.lastUsedAt,
        createdAt: userAnimalCards.createdAt,
        updatedAt: userAnimalCards.updatedAt
      })
      .from(userAnimalCards)
      .where(and(eq(userAnimalCards.userId, userId), eq(userAnimalCards.animalCardId, animalCardId)));
    return userCard;
  }

  async createUserAnimalCard(card: InsertUserAnimalCard): Promise<UserAnimalCard> {
    const [newCard] = await db.insert(userAnimalCards).values(card).returning();
    return newCard;
  }

  async updateUserAnimalCard(id: string, updates: Partial<InsertUserAnimalCard>): Promise<UserAnimalCard> {
    const [updated] = await db
      .update(userAnimalCards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userAnimalCards.id, id))
      .returning();
    return updated;
  }

  async unlockAnimalForUser(userId: string, animalCardId: string): Promise<UserAnimalCard> {
    const existing = await this.getUserAnimalCard(userId, animalCardId);

    if (existing) {
      return await this.updateUserAnimalCard(existing.id, {
        isUnlocked: true,
        unlockedAt: new Date(),
      });
    }

    return await this.createUserAnimalCard({
      userId,
      animalCardId,
      friendshipLevel: 1,
      xp: 0,
      xpToNextLevel: 100,
      timesUsed: 0,
      gamesWon: 0,
      isUnlocked: true,
      unlockedAt: new Date(),
    });
  }

  async addXPToAnimal(userId: string, animalCardId: string, xp: number): Promise<UserAnimalCard> {
    const userCard = await this.getUserAnimalCard(userId, animalCardId);

    if (!userCard) {
      throw new Error('User animal card not found');
    }

    let newXP = userCard.xp + xp;
    let newLevel = userCard.friendshipLevel;
    let xpToNextLevel = userCard.xpToNextLevel;

    while (newXP >= xpToNextLevel && newLevel < 5) {
      newXP -= xpToNextLevel;
      newLevel++;
      xpToNextLevel = newLevel * 100;
    }

    if (newLevel >= 5) {
      newLevel = 5;
      newXP = 0;
      xpToNextLevel = 0;
    }

    return await this.updateUserAnimalCard(userCard.id, {
      xp: newXP,
      friendshipLevel: newLevel,
      xpToNextLevel,
    });
  }

  async getAllTeamBonuses(): Promise<TeamBonus[]> {
    return await db.select().from(teamBonuses);
  }

  async createTeamBonus(bonus: InsertTeamBonus): Promise<TeamBonus> {
    const [newBonus] = await db.insert(teamBonuses).values(bonus).returning();
    return newBonus;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async getUserCampaignProgress(userId: string, campaignId: string): Promise<UserCampaignProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userCampaignProgress)
      .where(and(eq(userCampaignProgress.userId, userId), eq(userCampaignProgress.campaignId, campaignId)));
    return progress;
  }

  async getUserAllCampaignProgress(userId: string): Promise<UserCampaignProgress[]> {
    return await db.select().from(userCampaignProgress).where(eq(userCampaignProgress.userId, userId));
  }

  async createUserCampaignProgress(progress: InsertUserCampaignProgress): Promise<UserCampaignProgress> {
    const [newProgress] = await db.insert(userCampaignProgress).values(progress).returning();
    return newProgress;
  }

  async updateUserCampaignProgress(id: string, updates: Partial<InsertUserCampaignProgress>): Promise<UserCampaignProgress> {
    const [updated] = await db
      .update(userCampaignProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userCampaignProgress.id, id))
      .returning();
    return updated;
  }

  async initializeAnimalCardsForUser(userId: string): Promise<void> {
    const allCards = await this.getAllAnimalCards();
    const starterCards = allCards.filter(card => card.starterAnimal);

    for (const card of starterCards) {
      const existing = await this.getUserAnimalCard(userId, card.id);
      if (!existing) {
        await this.createUserAnimalCard({
          userId,
          animalCardId: card.id,
          friendshipLevel: 1,
          xp: 0,
          xpToNextLevel: 100,
          timesUsed: 0,
          gamesWon: 0,
          isUnlocked: true,
          unlockedAt: new Date(),
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();