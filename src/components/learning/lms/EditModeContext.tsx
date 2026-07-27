import React, { createContext, useContext, useState, useCallback } from 'react';

interface EditModeContextType {
  editMode: boolean;
  setEditMode: (b: boolean) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'maxagile-lms-editmode';

const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => {},
  toggle: () => {},
});

function readInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persist(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    // storage unavailable — edit mode simply won't persist
  }
}

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editMode, setEditModeState] = useState<boolean>(readInitial);

  const setEditMode = useCallback((b: boolean) => {
    setEditModeState(b);
    persist(b);
  }, []);

  const toggle = useCallback(() => {
    setEditModeState((prev) => {
      const next = !prev;
      persist(next);
      return next;
    });
  }, []);

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode, toggle }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextType => useContext(EditModeContext);
