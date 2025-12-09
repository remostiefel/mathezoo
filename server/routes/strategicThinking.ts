import { Router } from 'express';
import { strategicThinkingHelper } from '../strategicThinkingHelper';
import { isAuthenticated } from '../authService';

export const strategicThinkingRoutes = Router();

/**
 * POST /api/strategic-thinking/strategies
 * Generate thinking strategies for a task
 */
strategicThinkingRoutes.post('/strategies', isAuthenticated, async (req, res) => {
  try {
    const { num1, num2, operation, numberRange = 20 } = req.body;

    if (!num1 || !num2 || !operation) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const strategies = strategicThinkingHelper.generateStrategies(
      parseInt(num1),
      parseInt(num2),
      operation,
      numberRange
    );

    res.json({ strategies });
  } catch (error) {
    console.error('Error generating strategies:', error);
    res.status(500).json({ error: 'Failed to generate strategies' });
  }
});

/**
 * POST /api/strategic-thinking/evaluate
 * Evaluate user's strategy choice
 */
strategicThinkingRoutes.post('/evaluate', isAuthenticated, async (req, res) => {
  try {
    const { chosenStrategyId, allStrategies } = req.body;

    if (!chosenStrategyId || !allStrategies) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const chosenStrategy = allStrategies.find((s: any) => s.id === chosenStrategyId);

    if (!chosenStrategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const feedback = strategicThinkingHelper.evaluateUserChoice(
      chosenStrategy,
      allStrategies
    );

    res.json(feedback);
  } catch (error) {
    console.error('Error evaluating strategy:', error);
    res.status(500).json({ error: 'Failed to evaluate strategy' });
  }
});