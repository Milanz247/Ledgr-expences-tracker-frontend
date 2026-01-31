"use client";

import { createContext, useContext, ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
  isLoading: boolean;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ 
  children, 
  isLoading 
}) => {
  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
