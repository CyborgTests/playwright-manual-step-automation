import React from 'react';
import { useTestStore } from '../store/TestStore';

export default function TestInfo() {
  const { state } = useTestStore();
  
  return (
    <div>
      <h4 className="text-default-600 text-sm font-medium mb-2">Test:</h4>
      <h3 id="testName" className="text-foreground text-lg font-semibold break-words">
        {state.testName}
      </h3>
    </div>
  );
} 