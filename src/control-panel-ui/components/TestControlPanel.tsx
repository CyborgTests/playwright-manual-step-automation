import React, { useEffect } from 'react';
import { Card, CardBody, Divider } from '@heroui/react';
import { useTestStore } from '../store/TestStore';
import TestControls from './TestControls';
import StepsList from './StepsList';
import TestInfo from './TestInfo';

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
    <main className="flex-1 px-6 py-12">
      <Card className="w-full max-w-md mx-auto transition-none">
        <CardBody className="p-6">
          <TestInfo />
          <Divider className="my-4" />
          <StepsList />
          <TestControls />
        </CardBody>
      </Card>
    </main>
  );
}