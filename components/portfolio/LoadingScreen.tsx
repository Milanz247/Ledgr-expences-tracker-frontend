// 🚀 MINIMALIST TERMINAL LOADING SCREEN
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  duration?: number;
}

const LoadingScreenOptimized: React.FC<LoadingScreenProps> = ({ 
  onLoadingComplete, 
  duration = 2500
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [text, setText] = useState("");
  const fullText = "> initializing_portfolio...";
  const [progress, setProgress] = useState(0);

  // Typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Progress bar
  useEffect(() => {
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          setIsVisible(false);
          onLoadingComplete?.();
        }, 500);
      }
    };
    requestAnimationFrame(updateProgress);
  }, [duration, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0,
          y: -20,
          transition: { duration: 0.5, ease: "easeInOut" }
        }}
      >
        <div className="w-full max-w-md px-6">
          {/* Terminal Command */}
          <div className="font-mono text-lg md:text-xl text-slate-200 mb-6 flex items-center">
            <span className="mr-2 text-green-500">$</span>
            {text}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2.5 h-5 bg-green-500 ml-1 align-middle"
            />
          </div>

          {/* Minimal Progress Bar */}
          <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Status Text */}
          <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
            <span>system_check</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreenOptimized;
