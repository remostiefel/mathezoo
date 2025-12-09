
import { Router } from 'express';
import { db } from '../db';
import { userFeedback, learningProgression, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../authService';

export const feedbackRoutes = Router();

// Feedback-Fragen-Katalog (erweitert)
const FEEDBACK_QUESTIONS = {
  // Mathematische Strategien
  math_strategy_q1: {
    id: 'math_strategy_q1',
    category: 'math',
    questionText: 'Wie hast du die Aufgabe gelöst?',
    options: [
      { value: 'memorized', label: 'Auswendig gewusst', emoji: '🧠' },
      { value: 'make_ten', label: 'Zuerst zur 10', emoji: '➕' },
      { value: 'counting', label: 'Abgezählt', emoji: '👆' },
      { value: 'guessed', label: 'Geraten', emoji: '🤔' }
    ]
  },
  math_strategy_q2: {
    id: 'math_strategy_q2',
    category: 'math',
    questionText: 'Was hat dir beim Rechnen geholfen?',
    options: [
      { value: 'twenty_frame', label: 'Das 20er-Feld', emoji: '🟦' },
      { value: 'number_line', label: 'Der Zahlenstrahl', emoji: '📏' },
      { value: 'fingers', label: 'Meine Finger', emoji: '✋' },
      { value: 'thinking', label: 'Nur Nachdenken', emoji: '💭' }
    ]
  },
  
  // Schwierigkeit & Challenge
  difficulty_q1: {
    id: 'difficulty_q1',
    category: 'ux',
    questionText: 'Die letzte Aufgabe war für mich...',
    options: [
      { value: 'too_easy', label: 'Zu leicht / langweilig', emoji: '😴' },
      { value: 'just_right', label: 'Genau richtig!', emoji: '✅' },
      { value: 'too_hard', label: 'Zu schwer / verwirrend', emoji: '😰' }
    ]
  },
  difficulty_q2: {
    id: 'difficulty_q2',
    category: 'ux',
    questionText: 'Möchtest du schwerere oder leichtere Aufgaben?',
    options: [
      { value: 'harder', label: 'Ich will eine Herausforderung!', emoji: '🔥' },
      { value: 'same', label: 'So ist es gut', emoji: '👍' },
      { value: 'easier', label: 'Lieber einfacher', emoji: '🌟' }
    ]
  },
  
  // Spaß & Motivation
  fun_q1: {
    id: 'fun_q1',
    category: 'fun',
    questionText: 'Wie viel Spaß macht dir das Training gerade?',
    options: [
      { value: 'very_fun', label: 'Mega viel!', emoji: '🤩' },
      { value: 'fun', label: 'Gut', emoji: '😊' },
      { value: 'okay', label: 'Geht so', emoji: '😐' },
      { value: 'not_fun', label: 'Nicht so toll', emoji: '😞' }
    ]
  },
  fun_q2: {
    id: 'fun_q2',
    category: 'fun',
    questionText: 'Was würdest du gerne öfter machen?',
    options: [
      { value: 'more_games', label: 'Mehr Spiele spielen', emoji: '🎮' },
      { value: 'more_animals', label: 'Mehr Tiere sammeln', emoji: '🦁' },
      { value: 'more_badges', label: 'Mehr Abzeichen holen', emoji: '🏆' },
      { value: 'more_practice', label: 'Mehr üben', emoji: '📚' }
    ]
  },
  
  // Darstellungen & Interface
  representation_q1: {
    id: 'representation_q1',
    category: 'ux',
    questionText: 'Welche Darstellung findest du am hilfreichsten?',
    options: [
      { value: 'twenty_frame', label: '20er-Feld', emoji: '🟦' },
      { value: 'number_line', label: 'Zahlenstrahl', emoji: '📏' },
      { value: 'counters', label: 'Wendeplättchen', emoji: '🔴' },
      { value: 'symbolic', label: 'Nur Zahlen', emoji: '🔢' }
    ]
  },
  representation_q2: {
    id: 'representation_q2',
    category: 'ux',
    questionText: 'Brauchst du noch die Bilder oder kannst du schon ohne rechnen?',
    options: [
      { value: 'need_visuals', label: 'Ich brauche die Bilder noch', emoji: '🖼️' },
      { value: 'sometimes', label: 'Manchmal helfen sie', emoji: '🤷' },
      { value: 'no_need', label: 'Ich kann ohne rechnen', emoji: '💪' }
    ]
  },
  
  // Selbsteinschätzung
  meta_q1: {
    id: 'meta_q1',
    category: 'meta',
    questionText: 'Wie sicher bist du bei solchen Aufgaben?',
    options: [
      { value: 'very_confident', label: 'Sehr sicher!', emoji: '💪' },
      { value: 'confident', label: 'Ziemlich sicher', emoji: '👍' },
      { value: 'unsure', label: 'Noch unsicher', emoji: '🤔' },
      { value: 'need_help', label: 'Brauche Hilfe', emoji: '🆘' }
    ]
  },
  meta_q2: {
    id: 'meta_q2',
    category: 'meta',
    questionText: 'Merkst du, dass du besser wirst?',
    options: [
      { value: 'yes_progress', label: 'Ja, ich werde besser!', emoji: '📈' },
      { value: 'some_progress', label: 'Ein bisschen', emoji: '🌱' },
      { value: 'no_progress', label: 'Nicht wirklich', emoji: '😕' }
    ]
  }
};

/**
 * POST /api/feedback
 * Submit user feedback
 */
feedbackRoutes.post('/', isAuthenticated, async (req, res) => {
  try {
    const sessionUserId = (req.session as any)?.userId;
    const { questionId, answer, context } = req.body;

    if (!sessionUserId || !questionId || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // SECURITY: Use session userId, not from body
    const userId = sessionUserId;

    const question = FEEDBACK_QUESTIONS[questionId as keyof typeof FEEDBACK_QUESTIONS];
    if (!question) {
      return res.status(400).json({ error: 'Invalid question ID' });
    }

    // Save feedback
    const [feedback] = await db.insert(userFeedback).values({
      userId,
      questionId,
      category: question.category,
      answer,
      context: context || {},
    }).returning();

    // Belohnung: +10 Münzen
    await db.update(learningProgression)
      .set({ gameCoins: sql`COALESCE(game_coins, 0) + 10` })
      .where(eq(learningProgression.userId, userId));

    res.json({ success: true, feedback, coinsEarned: 10 });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

/**
 * GET /api/feedback/question/:category
 * Get random question from category
 */
feedbackRoutes.get('/question/:category', isAuthenticated, async (req, res) => {
  try {
    const { category } = req.params;
    // SECURITY: Always use session userId, ignore query parameter to prevent cross-user lookups
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Filter questions by category
    const categoryQuestions = Object.values(FEEDBACK_QUESTIONS).filter(
      q => q.category === category
    );

    if (categoryQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions found for category' });
    }

    // Avoid recently asked questions for this user
    let availableQuestions = categoryQuestions;
    const recentFeedback = await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.userId, userId))
      .orderBy(desc(userFeedback.createdAt))
      .limit(5);

    const recentQuestionIds = recentFeedback.map(f => f.questionId);
    availableQuestions = categoryQuestions.filter(
      q => !recentQuestionIds.includes(q.id)
    );

    // If all questions were asked recently, use all
    if (availableQuestions.length === 0) {
      availableQuestions = categoryQuestions;
    }

    // Select random question
    const randomQuestion = availableQuestions[
      Math.floor(Math.random() * availableQuestions.length)
    ];

    res.json(randomQuestion);
  } catch (error) {
    console.error('Failed to get question:', error);
    res.status(500).json({ error: 'Failed to get question' });
  }
});

/**
 * GET /api/feedback/analytics/:userId
 * Get feedback analytics for a user (teacher view)
 */
feedbackRoutes.get('/analytics/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const sessionUserId = (req.session as any)?.userId;

    // SECURITY: Check if user has permission to access this student's data
    const { canAccessUserData } = await import('../authService');
    const hasAccess = await canAccessUserData(sessionUserId, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this user\'s analytics' });
    }

    const allFeedback = await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.userId, userId))
      .orderBy(desc(userFeedback.createdAt));

    // Aggregate by category and question
    const analytics: any = {
      totalResponses: allFeedback.length,
      byCategory: {} as Record<string, any>,
      byQuestion: {} as Record<string, any>,
      trends: {
        difficulty: [],
        fun: [],
        confidence: []
      }
    };

    // Group by category
    allFeedback.forEach(feedback => {
      if (!analytics.byCategory[feedback.category]) {
        analytics.byCategory[feedback.category] = {
          count: 0,
          responses: {}
        };
      }
      analytics.byCategory[feedback.category].count++;

      if (!analytics.byCategory[feedback.category].responses[feedback.answer]) {
        analytics.byCategory[feedback.category].responses[feedback.answer] = 0;
      }
      analytics.byCategory[feedback.category].responses[feedback.answer]++;

      // Track by question
      if (!analytics.byQuestion[feedback.questionId]) {
        analytics.byQuestion[feedback.questionId] = {
          count: 0,
          responses: {}
        };
      }
      analytics.byQuestion[feedback.questionId].count++;
      if (!analytics.byQuestion[feedback.questionId].responses[feedback.answer]) {
        analytics.byQuestion[feedback.questionId].responses[feedback.answer] = 0;
      }
      analytics.byQuestion[feedback.questionId].responses[feedback.answer]++;
    });

    // Extract trends (last 10 responses for key categories)
    const recentFeedback = allFeedback.slice(0, 10);
    recentFeedback.forEach(feedback => {
      if (feedback.questionId === 'difficulty_q1') {
        analytics.trends.difficulty.unshift({
          answer: feedback.answer,
          date: feedback.createdAt
        });
      }
      if (feedback.questionId === 'fun_q1') {
        analytics.trends.fun.unshift({
          answer: feedback.answer,
          date: feedback.createdAt
        });
      }
      if (feedback.questionId === 'meta_q1') {
        analytics.trends.confidence.unshift({
          answer: feedback.answer,
          date: feedback.createdAt
        });
      }
    });

    res.json(analytics);
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default feedbackRoutes;
