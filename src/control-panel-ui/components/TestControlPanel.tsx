import React, { useEffect } from 'react';
import { useTestStore } from '../store/TestStore';
import StepsList from './StepsList';
import TestInfo from './TestInfo';

export default function TestControlPanel() {
  const { dispatch } = useTestStore();

  useEffect(() => {
    (window as any).testUtils = {
      addStep: (
        step: string,
        params: { isSoft?: boolean; [key: string]: any } = {}
      ) => {
        const { isSoft, ...data } = params;
        dispatch({
          type: 'ADD_STEP',
          payload: { step, isSoft: isSoft || false, data },
        });
      },
    };
    // Cleanup
    return () => {
      delete (window as any).testUtils;
    };
  }, [dispatch]);

  useEffect(() => {
    const loadTestInfo = async () => {
      const getTestInfo = window.getTestInfo;

      if (getTestInfo) {
        const testInfo = await getTestInfo();
        dispatch({ type: 'SET_TEST_INFO', payload: testInfo });
        if (testInfo?.title) {
          dispatch({ type: 'SET_TEST_NAME', payload: testInfo.title });
        }
      } else {
        setTimeout(loadTestInfo, 100);
      }
    };

    loadTestInfo();
  }, [dispatch]);

  return (
    <main className="flex-1 p-4">
      <TestInfo />
      <StepsList />
    </main>
  );
}
