
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface GameRecommendation {
  gameId: string;
  gameName: string;
  emoji: string;
  recommendedLevel: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface ErrorPattern {
  errorType: string;
  errorLabel: string;
  count: number;
  lastOccurrence: string;
}

export function useGameRecommendations(userId?: string) {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState<{
    errorType: string;
    errorLabel: string;
    recommendation: GameRecommendation;
    errorCount: number;
  } | null>(null);

  // Fetch recent error patterns
  const { data: errorPatterns } = useQuery({
    queryKey: ['/api/error-patterns', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/error-patterns/${userId}`);
      return await response.json();
    },
    enabled: !!userId,
    refetchInterval: 30000 // Check every 30 seconds
  });

  useEffect(() => {
    if (!errorPatterns?.recentPatterns) return;

    // Find the most critical error pattern (high frequency in recent tasks)
    const criticalPattern = errorPatterns.recentPatterns.find(
      (pattern: ErrorPattern) => pattern.count >= 3 // 3+ errors of same type
    );

    if (criticalPattern && !showRecommendation) {
      // Fetch recommendation for this error type
      fetchRecommendation(criticalPattern);
    }
  }, [errorPatterns]);

  const fetchRecommendation = async (pattern: ErrorPattern) => {
    try {
      const response = await apiRequest('POST', '/api/game-recommendation', {
        errorType: pattern.errorType,
        userId
      });
      const data = await response.json();

      if (data.recommendation) {
        setCurrentRecommendation({
          errorType: pattern.errorType,
          errorLabel: pattern.errorLabel,
          recommendation: data.recommendation,
          errorCount: pattern.count
        });
        setShowRecommendation(true);
      }
    } catch (error) {
      console.error('Failed to fetch game recommendation:', error);
    }
  };

  const dismissRecommendation = () => {
    setShowRecommendation(false);
    // Store dismissal in localStorage to avoid showing again for same pattern
    if (currentRecommendation) {
      const dismissed = JSON.parse(localStorage.getItem('dismissedRecommendations') || '[]');
      dismissed.push({
        errorType: currentRecommendation.errorType,
        timestamp: Date.now()
      });
      localStorage.setItem('dismissedRecommendations', JSON.stringify(dismissed));
    }
  };

  return {
    showRecommendation,
    currentRecommendation,
    dismissRecommendation
  };
}
