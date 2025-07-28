import { Divider } from '@heroui/react';
import { useTestStore } from '../store/TestStore';
import React, { Fragment } from 'react';

const getStatusColor = (status: string) => {
  if (status === 'pass') {
    return 'text-success';
  } else if (status === 'fail') {
    return 'text-danger';
  } else if (status === 'warning') {
    return 'text-warning';
  } else {
    return 'text-foreground';
  }
};

export default function StepsList() {
  const { state } = useTestStore();
  if (state.steps.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <div>
        <h4 className="text-default-600 text-sm font-medium mb-2">Steps:</h4>
        <ol id="stepsList" className="list-decimal list-inside space-y-2">
          {state.steps.map((step, idx) => (
            <li
              key={idx}
              className={`${getStatusColor(step.status)} text-sm leading-relaxed`}
            >
              {step.status === 'pass' && '✅ '}
              {step.status === 'fail' && '❌ '}
              {step.status === 'warning' && '⚠️ '}
              {step.text}
              {step.status === 'fail' && step.reason ? ` - ${step.reason}` : ''}
            </li>
          ))}
        </ol>
      </div>
      <Divider className="my-4" />
    </Fragment>
  );
} 