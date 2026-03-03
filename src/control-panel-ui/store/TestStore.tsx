import React, { createContext, useContext, ReactNode, Dispatch } from 'react';
import type { InjectedTestInfo } from '../../types';

// Types
export type Step = {
  text: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  reason?: string;
  isSoft?: boolean;
  data?: Record<string, any>;
};

interface State {
  testName: string;
  steps: Step[];
  testInfo: InjectedTestInfo | undefined;
  createJiraTicket: boolean;
}

const initialState: State = {
  testName: 'Loading...',
  steps: [],
  testInfo: undefined,
  createJiraTicket: false,
};

// Actions
export type Action =
  | { type: 'SET_TEST_NAME'; payload: string }
  | { type: 'SET_TEST_INFO'; payload: InjectedTestInfo }
  | { type: 'ADD_STEP'; payload: { step: string; isSoft?: boolean; data?: Record<string, any> } }
  | { type: 'PASS_STEP' }
  | { type: 'FAIL_STEP'; payload: string }
  | { type: 'SKIP_STEP'; payload?: string }
  | { type: 'TOGGLE_JIRA_TICKET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TEST_NAME':
      return { ...state, testName: action.payload };
    case 'SET_TEST_INFO':
      return { ...state, testInfo: action.payload };
    case 'ADD_STEP':
      return {
        ...state,
        steps: [...state.steps, { 
          text: action.payload.step, 
          status: 'pending', 
          isSoft: action.payload.isSoft,
          data: action.payload.data
        }],
      };
    case 'PASS_STEP': {
      const steps = [...state.steps];
      if (steps.length > 0) {
        steps[steps.length - 1] = {
          ...steps[steps.length - 1],
          status: 'pass',
        };
      }
      return { ...state, steps };
    }
    case 'FAIL_STEP': {
      const steps = [...state.steps];
      if (steps.length > 0) {
        steps[steps.length - 1] = {
          ...steps[steps.length - 1],
          status: steps[steps.length - 1].isSoft ? 'warning' : 'fail',
          reason: action.payload,
        };
      }
      return { ...state, steps };
    }
    case 'SKIP_STEP': {
      const steps = [...state.steps];
      if (steps.length > 0) {
        steps[steps.length - 1] = {
          ...steps[steps.length - 1],
          status: 'warning',
          reason: action.payload || 'Step skipped',
        };
      }
      return { ...state, steps };
    }
    case 'TOGGLE_JIRA_TICKET': {
      return { ...state, createJiraTicket: !state.createJiraTicket };
    }
    default:
      return state;
  }
}

const TestStoreContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

// Create a single store instance
const store = {
  state: initialState,
  dispatch: (action: Action) => {
    store.state = reducer(store.state, action);
    store.listeners.forEach(listener => listener(store.state));
  },
  listeners: new Set<(state: State) => void>(),
  subscribe: (listener: (state: State) => void) => {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  }
};

export function TestStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = React.useState(store.state);
  
  React.useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return () => { unsubscribe(); };
  }, []);

  return (
    <TestStoreContext.Provider value={{ state, dispatch: store.dispatch }}>
      {children}
    </TestStoreContext.Provider>
  );
}

export function useTestStore() {
  const context = useContext(TestStoreContext);
  if (!context) {
    throw new Error('useTestStore must be used within a TestStoreProvider');
  }
  return context;
} 