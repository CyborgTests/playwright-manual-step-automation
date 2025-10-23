import { Button, Input } from '@heroui/react';
import { useTestStore } from '../store/TestStore';
import React, { useState } from 'react';
import { trackEvent } from '../../utils/analytics';

export default function StepsList() {
  const { state, dispatch } = useTestStore();
  const [comments, setComments] = useState<string[]>(
    new Array(state.steps.length).fill('')
  );
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (state.steps.length === 0) {
    return null;
  }

  const handleCommentChange = (stepIndex: number, value: string) => {
    const newComments = [...comments];
    newComments[stepIndex] = value;
    setComments(newComments);
  };

  const trackButtonClick = (buttonName: string) => {
    trackEvent(`app_${buttonName}_click`);
  };

  const handleStepAction = (
    stepIndex: number,
    action: 'pass' | 'fail' | 'skip'
  ) => {
    const step = state.steps[stepIndex];
    if (step.status !== 'pending') return;

    if (action === 'pass') {
      dispatch({ type: 'PASS_STEP' });
      (window as any).testUtils?.resumeTest?.();
      trackButtonClick('pass_step');
    } else if (action === 'fail') {
      dispatch({
        type: 'FAIL_STEP',
        payload: comments[stepIndex] || 'No failure reason provided',
      });
      (window as any).testUtils.hasFailed = true;
      (window as any).testUtils.failedReason =
        comments[stepIndex] || 'No failure reason provided';
      (window as any).testUtils?.resumeTest?.();
      trackButtonClick('fail_step');
    } else if (action === 'skip') {
      dispatch({ type: 'SKIP_STEP' });
      (window as any).skipTest?.();
      trackButtonClick('skip_step');
    }

    (window as any).resumeTest?.();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const isStepCompleted = (step: any) =>
    step.status === 'pass' ||
    step.status === 'fail' ||
    step.status === 'warning';
  const isCurrentStep = (stepIndex: number) =>
    stepIndex === state.steps.length - 1 &&
    state.steps[stepIndex].status === 'pending';

  return (
    <div className="space-y-4 mt-4">
      {state.steps.map((step, idx) => (
        <div
          key={idx}
          className={`rounded-lg bg-gray-50 p-4 ${
            isStepCompleted(step) ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100"
              style={{ border: '1px solid #BBBBBB' }}
            >
              {isStepCompleted(step) ? (
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="font-medium text-gray-600">{idx + 1}</span>
              )}
            </div>

            <div className="flex-1">
              <p
                className={`font-medium ${
                  isStepCompleted(step) ? 'text-gray-600' : 'text-gray-900'
                }`}
              >
                {step.text}
              </p>

              {step.status === 'pass' && (
                <p className="text-xs text-gray-500 mt-1">Step passed</p>
              )}
              {step.status === 'fail' && (
                <p className="text-xs text-red-600 mt-1">
                  {step.isSoft ? 'Soft failed' : 'Step failed'}
                  {step.reason ? ` - ${step.reason}` : ''}
                </p>
              )}
              {step.status === 'warning' && (
                <p className="text-xs text-yellow-600 mt-1">
                  {step.reason === 'Step skipped'
                    ? 'Step skipped'
                    : `Soft failed${step.reason ? ` - ${step.reason}` : ''}`}
                </p>
              )}
            </div>
          </div>

          {isCurrentStep(idx) && (
            <div className="space-y-3">
              <Input
                placeholder="Comments (optional)"
                value={comments[idx]}
                onChange={e => handleCommentChange(idx, e.target.value)}
                className="w-full bg-white"
                variant="bordered"
              />

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white border-none"
                    onPress={() => handleStepAction(idx, 'pass')}
                    color="success"
                  >
                    Passed
                  </Button>
                  <Button
                    className="flex-1 text-white border-none"
                    onPress={() => handleStepAction(idx, 'fail')}
                    color="danger"
                  >
                    Failed
                  </Button>
                </div>
                <Button
                  color="default"
                  variant="bordered"
                  className="w-full"
                  onPress={() => handleStepAction(idx, 'skip')}
                >
                  Skip Step
                </Button>
                <Button
                  className="w-full bg-indigo-500 text-white"
                  onPress={() => dispatch({ type: 'TOGGLE_JIRA_TICKET' })}
                >
                  Create Jira Ticket
                </Button>
              </div>
              {step.data && Object.keys(step.data).length > 0 && (
                <div className="mt-3">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(step.data).map(([key, value]) => {
                        const itemId = `${idx}-${key}`;
                        const valueStr = String(value);
                        return (
                          <tr key={key} className="py-1">
                            <td
                              className="pr-2 text-gray-600"
                              style={{ width: '40%' }}
                            >
                              {key}:
                            </td>
                            <td
                              className="relative group cursor-pointer"
                              style={{ width: '60%' }}
                              onMouseEnter={() => setHoveredItem(itemId)}
                              onMouseLeave={() => setHoveredItem(null)}
                              onClick={() => copyToClipboard(valueStr)}
                            >
                              <span className="break-all">{valueStr}</span>
                              {hoveredItem === itemId && (
                                <svg
                                  className="w-3 h-3 inline-block ml-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
