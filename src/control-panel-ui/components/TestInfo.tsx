import React, { Fragment } from 'react';
import { useTestStore } from '../store/TestStore';

export default function TestInfo() {
  const { state } = useTestStore();
  
  return (
    <Fragment>
      <h4>Test:</h4>
      <h3 id="testName">{state.testName}</h3>
    </Fragment>
  );
} 