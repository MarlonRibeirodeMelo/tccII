import { createContext, useState, useContext } from 'react';

const UnsavedChangesContext = createContext();

export function UnsavedChangesProvider({ children }) {
  const [hasUnschedChanges, setHasUnschedChanges] = useState(false);

  return (
    <UnsavedChangesContext.Provider value={{ hasUnschedChanges, setHasUnschedChanges }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext);
}