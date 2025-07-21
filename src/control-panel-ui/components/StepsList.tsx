import { useTestStore } from '../store/TestStore';
import React, { Fragment } from 'react';

const getClassName = (status: string) => {
  if (status === 'pass') {
    return 'step-pass';
  } else if (status === 'fail') {
    return 'step-fail';
  } else if (status === 'warning') {
    return 'step-warning';
  } else {
    return '';
  }
};

export default function StepsList() {
  const { state } = useTestStore();

  return (
    <Fragment>
      <h4>Steps:</h4>
      <ol id="stepsList">
        {state.steps.map((step, idx) => (
          <li
            key={idx}
            className={getClassName(step.status)}
          >
            {step.status === 'pass' && '✅ '}
            {step.status === 'fail' && '❌ '}
            {step.status === 'warning' && '⚠️ '}
            {step.text}
            {step.status === 'fail' && step.reason ? ` - ${step.reason}` : ''}
          </li>
        ))}
      </ol>
    </Fragment>
  );
} 