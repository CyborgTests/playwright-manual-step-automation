import React, { useEffect } from 'react';
import { useTestStore } from '../store/TestStore';
import TestControls from './TestControls';
import StepsList from './StepsList';
import TestInfo from './TestInfo';
import '../styles/TestControlPanel.css';

export default function TestControlPanel() {
  const { dispatch } = useTestStore();

  useEffect(() => {
    (window as any).testUtils = {
      setTestName: (name: string) => {
        dispatch({ type: 'SET_TEST_NAME', payload: name });
      },
      addStep: (step: string, params: { isSoft?: boolean } = {}) => {
        dispatch({ type: 'ADD_STEP', payload: { step, isSoft: params.isSoft || false } });
      },
    };
    // Cleanup
    return () => { delete (window as any).testUtils; };
  }, [dispatch]);

  return (
    <div id="container">
      <TestInfo />
      <div className="divider"></div>
      <StepsList />
      <div className="divider"></div>
      <TestControls />
    </div>
  );
}