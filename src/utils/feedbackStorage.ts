import fs from 'fs';
import path from 'path';

const FEEDBACK_STORAGE_FILE = path.join(
  __dirname,
  '..',
  '..',
  '.cyborg-feedback.json'
);

interface FeedbackState {
  runCount: number;
  feedbackSent: boolean;
}

const defaultState: FeedbackState = {
  runCount: 0,
  feedbackSent: false,
};

export const getFeedbackState = (): FeedbackState => {
  try {
    if (fs.existsSync(FEEDBACK_STORAGE_FILE)) {
      const data = fs.readFileSync(FEEDBACK_STORAGE_FILE, 'utf-8');
      return { ...defaultState, ...JSON.parse(data) };
    }
  } catch (error) {
    console.warn('Failed to read feedback state:', error);
  }
  return defaultState;
};

export const updateFeedbackState = (updates: Partial<FeedbackState>): void => {
  try {
    const currentState = getFeedbackState();
    const newState = { ...currentState, ...updates };
    fs.writeFileSync(FEEDBACK_STORAGE_FILE, JSON.stringify(newState, null, 2));
  } catch (error) {
    console.error('Failed to update feedback state:', error);
  }
};

export const incrementRunCount = (): number => {
  const currentState = getFeedbackState();
  const newRunCount = currentState.runCount + 1;
  updateFeedbackState({ runCount: newRunCount });
  return newRunCount;
};

export const markFeedbackSent = (): void => {
  updateFeedbackState({ feedbackSent: true });
};
