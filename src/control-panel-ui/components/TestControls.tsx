import React, { useEffect, useState } from 'react';
import { Input, Button } from '@heroui/react';

import { useTestStore } from '../store/TestStore';
import { trackEvent } from '../../utils/analytics';

export default function TestControls() {
  const { state } = useTestStore();

  const { dispatch } = useTestStore();
  const [failureReason, setFailureReason] = useState('');

  const trackButtonClick = (buttonName: string) => {
    trackEvent(`app_${buttonName}_click`);
  };

  const controlButtonsAreDisabled = state.steps[state.steps.length - 1]?.status !== 'pending';

  return (
    <div className="space-y-3">
      <Button
        color="success"
        className={`w-full ${controlButtonsAreDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        disableAnimation
        onPress={() => {
          if (controlButtonsAreDisabled) return;
          dispatch({ type: 'PASS_STEP' });
          (window as any).playwright?.resume();
          trackButtonClick('pass_step');
        }}
      >
        ✅ Step passed
      </Button>
      
      <Input 
        placeholder="Failure reason" 
        id="failureReasonInput" 
        value={failureReason} 
        onChange={(e) => setFailureReason(e.target.value)}
        className={`w-full ${controlButtonsAreDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        variant="bordered"
      />
      
      <Button
        color="primary"
        className={`w-full ${controlButtonsAreDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        disableAnimation
        onPress={() => {
          if (controlButtonsAreDisabled) return;
          dispatch({ type: 'FAIL_STEP', payload: failureReason || 'No failure reason provided' });
          (window as any).testUtils.hasFailed = true;
          (window as any).testUtils.failedReason = failureReason;
          (window as any).playwright?.resume();
          setFailureReason('');
          trackButtonClick('fail_step');
        }}
      >
        ❌ Step Failed
      </Button>
    </div>
  );
} 