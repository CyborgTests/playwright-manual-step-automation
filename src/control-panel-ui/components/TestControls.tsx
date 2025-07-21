import React, { Fragment, useEffect, useState } from 'react';
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
    <Fragment>
      <button
        className="btn btn-success"
        disabled={controlButtonsAreDisabled}
        onClick={() => {
          if (controlButtonsAreDisabled) return;
          dispatch({ type: 'PASS_STEP' });
          (window as any).playwright?.resume();
          trackButtonClick('pass_step');
        }}
      >
        ✅ Step passed
      </button>
      
      <input 
        placeholder="Failure reason" 
        id="failureReasonInput" 
        value={failureReason} 
        onChange={(e) => setFailureReason(e.target.value)} 
      />
      
      <button
        className="btn btn-danger"
        disabled={controlButtonsAreDisabled}
        onClick={() => {
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
      </button>
    </Fragment>
  );
} 