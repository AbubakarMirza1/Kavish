import { createContext, useContext, useState } from 'react';

const Scope3Context = createContext(null);

export const Scope3Provider = ({ children }) => {
  const [wasteMaterials, setWasteMaterials] = useState([]);
  const [disposalMethods, setDisposalMethods] = useState([]);
  const [changes, setChanges] = useState(0); // Change tracker

  const updateWasteMaterials = (materials) => {
    setWasteMaterials(materials);
    setChanges(prev => prev + 1); // Increment to notify dependent components
  };

  const updateDisposalMethods = (methods) => {
    setDisposalMethods(methods);
    setChanges(prev => prev + 1);
  };

  return (
    <Scope3Context.Provider value={{ wasteMaterials, disposalMethods, updateWasteMaterials, updateDisposalMethods, changes }}>
      {children}
    </Scope3Context.Provider>
  );
};

export const useScope3Store = () => {
  const context = useContext(Scope3Context);
  if (!context) {
    throw new Error("useScope3Store must be used within a Scope3Provider");
  }
  return context;
};
