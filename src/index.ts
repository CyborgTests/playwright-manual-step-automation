import { config } from './config';
import test from './test';
import {
  getFeedbackState,
  incrementRunCount,
  markFeedbackSent,
} from './utils/feedbackStorage';

export { config, getFeedbackState, incrementRunCount, markFeedbackSent };

export default test;
