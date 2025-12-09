import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTaskTimerReturn {
  elapsedTime: number;
  formattedTime: string;
  startTimer: () => void;
  stopTimer: () => number;
  resetTimer: () => void;
  isRunning: boolean;
}

export function useTaskTimer(): UseTaskTimerReturn {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const lastElapsedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    let finalElapsed = lastElapsedRef.current;
    
    if (startTimeRef.current !== null) {
      const currentTime = Date.now();
      finalElapsed = (currentTime - startTimeRef.current) / 1000;
      const roundedElapsed = Math.round(finalElapsed * 10) / 10;
      lastElapsedRef.current = roundedElapsed;
      setElapsedTime(roundedElapsed);
      finalElapsed = roundedElapsed;
    }
    
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return finalElapsed;
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedTime(0);
    setIsRunning(false);
    startTimeRef.current = null;
    lastElapsedRef.current = 0;
  }, []);

  useEffect(() => {
    if (isRunning && startTimeRef.current !== null) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = (currentTime - startTimeRef.current!) / 1000;
        const roundedElapsed = Math.round(elapsed * 10) / 10;
        lastElapsedRef.current = roundedElapsed;
        setElapsedTime(roundedElapsed);
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const formattedTime = `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toFixed(1).padStart(4, '0')}`;

  return {
    elapsedTime,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer,
    isRunning,
  };
}
