// NOT BEING USED ATM BC IT DONT WORK



import React, { createContext, useContext, useEffect, useState } from 'react';
import { stateService } from '../services/state.service';
import { SelectionItem } from '../../types/states.model';

interface StateContextValue {
  currentSelection: SelectionItem[];
  codeSnippet: string;
}

const StateContext = createContext<StateContextValue | null>(null);

interface StateProviderProps {
  children: React.ReactNode;
}

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  console.log('StateProvider is being rendered');

  const [currentSelection, setCurrentSelection] = useState<SelectionItem[]>([]);
  const [codeSnippet, setCodeSnippet] = useState<string>('');

  useEffect(() => {
    const subscription = stateService.getObservable().subscribe(
      (newState) => {
        console.log('StateProvider received a new state:', newState);
        setCurrentSelection(newState.currentSelection);
        setCodeSnippet(newState.codeSnippet);
      },
      (error) => {
        console.error('An error occurred:', error);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <StateContext.Provider value={{ currentSelection, codeSnippet }}>
      {children}
    </StateContext.Provider>
  );
};
export const useStateContext = () => useContext(StateContext);