
import { useState, useCallback } from "react";
import { Tip, getTipForSituation, TipContext } from "@/lib/tips-system";

export function useTipSystem() {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [tipHistory, setTipHistory] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const showTip = useCallback((
    situation: 'correct' | 'wrong' | 'levelup' | 'start' | 'shop' | 'evolution' | 'idle',
    userLevel: number,
    asModal: boolean = false
  ) => {
    const tip = getTipForSituation(situation, userLevel);
    
    if (tip && !tipHistory.includes(tip.id)) {
      setCurrentTip(tip);
      setTipHistory(prev => [...prev, tip.id]);
      
      if (asModal) {
        setShowModal(true);
      } else {
        setShowToast(true);
      }
    }
  }, [tipHistory]);

  const closeTip = useCallback(() => {
    setShowToast(false);
    setShowModal(false);
  }, []);

  const markHelpful = useCallback(() => {
    // Hier könnte Tracking implementiert werden
    console.log(`Tip ${currentTip?.id} was marked as helpful`);
  }, [currentTip]);

  return {
    currentTip,
    showToast,
    showModal,
    showTip,
    closeTip,
    markHelpful,
    tipHistory
  };
}
