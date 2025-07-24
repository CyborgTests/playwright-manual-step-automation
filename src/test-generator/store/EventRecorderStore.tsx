import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface RecordedElement {
  selector: string;
  eventType: 'click' | 'keydown' | 'should-exists' | 'should-not-exist' | 'focus';
  data?: {
    text?: string;
    mightNavigate?: boolean;
    isDirectLinkClick?: boolean;
    href?: string | null;
  };
}

interface EventRecorderState {
  recordedElements: RecordedElement[];
  isRecording: boolean;
}

type EventRecorderAction =
  | { type: 'ADD_ELEMENT'; payload: RecordedElement }
  | { type: 'CLEAR_ELEMENTS' }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_ELEMENTS'; payload: RecordedElement[] };

const initialState: EventRecorderState = {
  recordedElements: [],
  isRecording: false,
};

const eventRecorderReducer = (state: EventRecorderState, action: EventRecorderAction): EventRecorderState => {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      console.log('state', state);
      const element = action.payload;
      if (state.recordedElements.length > 0) {
        const lastElement = state.recordedElements[state.recordedElements.length - 1];
        if (lastElement.eventType === 'keydown' && element.eventType === 'keydown' && lastElement.selector === element.selector) {
          const updatedElements = [...state.recordedElements];
          updatedElements[updatedElements.length - 1] = {
            ...lastElement,
            data: {
              ...lastElement.data,
              text: element.data?.text
            }
          };
          return {
            ...state,
            recordedElements: updatedElements,
          };
        }
      }
      return {
        ...state,
        recordedElements: [...state.recordedElements, element],
      };
    }
    case 'CLEAR_ELEMENTS':
      return {
        ...state,
        recordedElements: [],
      };
    case 'SET_RECORDING':
      return {
        ...state,
        isRecording: action.payload,
      };
    case 'SET_ELEMENTS':
      return {
        ...state,
        recordedElements: action.payload,
      };
    default:
      return state;
  }
};

interface EventRecorderContextType {
  state: EventRecorderState;
  addElement: (element: RecordedElement) => void;
  clearElements: () => void;
  setRecording: (isRecording: boolean) => void;
  loadFromStorage: () => void;
}

const EventRecorderContext = createContext<EventRecorderContextType | undefined>(undefined);

export const useEventRecorder = () => {
  const context = useContext(EventRecorderContext);
  if (!context) {
    throw new Error('useEventRecorder must be used within an EventRecorderProvider');
  }
  return context;
};

interface EventRecorderProviderProps {
  children: React.ReactNode;
}

export const EventRecorderProvider: React.FC<EventRecorderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventRecorderReducer, initialState);

  const addElement = (element: RecordedElement) => {
    dispatch({ type: 'ADD_ELEMENT', payload: element });
  };

  const clearElements = () => {
    dispatch({ type: 'CLEAR_ELEMENTS' });
  };

  const setRecording = (isRecording: boolean) => {
    dispatch({ type: 'SET_RECORDING', payload: isRecording });
    if (!isRecording) {
      clearElements();
    }
  };

  const loadFromStorage = () => {
    try {
      const savedElements = localStorage.getItem('eventRecorderElements');
      if (savedElements) {
        const parsedElements = JSON.parse(savedElements);
        dispatch({ type: 'SET_ELEMENTS', payload: parsedElements });
        dispatch({ type: 'SET_RECORDING', payload: true });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  useEffect(() => {
    if (state.recordedElements.length === 0) return;
    localStorage.setItem('eventRecorderElements', JSON.stringify(state.recordedElements));
  }, [state.recordedElements]);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const value: EventRecorderContextType = {
    state,
    addElement,
    clearElements,
    setRecording,
    loadFromStorage,
  };

  return (
    <EventRecorderContext.Provider value={value}>
      {children}
    </EventRecorderContext.Provider>
  );
}; 