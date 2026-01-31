"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import { LoadingProvider } from "@/contexts/LoadingContext";

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and ensure all resources are loaded
    const minLoadTime = 4000; // Minimum loading time for UX
    const startTime = Date.now();

    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    // Check if page is already loaded
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <LoadingProvider isLoading={isLoading}>
      {/* Content is always visible so users can scroll */}
      <div className="min-h-screen">
        {children}
      </div>
      
      {/* Loading screen overlays the content */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen
            key="loading"
            onLoadingComplete={() => setIsLoading(false)}
            duration={4000}
          />
        )}
      </AnimatePresence>
    </LoadingProvider>
  );
};

export default ClientWrapper;
