import { useEffect, useState } from 'react';

declare global {
  interface Window {
    incrementRunCount?: () => Promise<number>;
  }
}

const RUNS_TO_SHOW_POPUP = [50, 150, 300];

export const useFeedbackPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  const hasIncrementRunCount = !!window.incrementRunCount;
  useEffect(() => {
    const checkFeedbackState = async () => {
      try {
        const newRunCount = await window.incrementRunCount?.();

        if (newRunCount && RUNS_TO_SHOW_POPUP.includes(newRunCount)) {
          setShowPopup(true);
        }
      } catch (error) {
        console.warn('Failed to check feedback state:', error);
      }
    };

    if (hasIncrementRunCount) {
      checkFeedbackState();
    }
  }, [hasIncrementRunCount]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return {
    showPopup,
    closePopup,
    setShowPopup,
  };
};
