"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";

const Hero = () => {
  const { isLoading } = useLoading();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Start animations only after loading is complete
    if (!isLoading) {
      // Small delay to ensure loading screen has finished its exit animation
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden w-full pt-8 relative">
      {/* Simplified overlay for better contrast - Background is now in layout */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/50 to-background/70 dark:from-background/50 dark:via-background/30 dark:to-background/50"></div>

      <div className="text-center space-y-8 max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
        {/* Enhanced Profile Avatar */}
        <motion.div
          className="flex justify-center relative"
          initial={{ opacity: 0, scale: 0, y: -50 }}
          animate={{
            opacity: shouldAnimate ? 1 : 0,
            scale: shouldAnimate ? 1 : 0,
            y: shouldAnimate ? 0 : -50
          }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="profile-glow-container">
              <div className="profile-glow-effect"></div>
              <div className="profile-glow-content">
                <Avatar className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-transparent shadow-xl">
                  <AvatarImage
                    src="/images/profile"
                    alt="Milan Madusanka - Full-Stack Developer"
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                    MM
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Heading with Simplified, Premium Animation */}
        <div className="space-y-6">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight relative"
            initial={{ opacity: 0, y: 30 }}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.23, 1, 0.32, 1]
            }}
            aria-label="Milan Madusanka - Official Portfolio"
          >
            <span className="text-foreground drop-shadow-sm">
              Milan Madusanka
            </span>

            {/* Single, Focused Underline Animation */}
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={shouldAnimate ? { width: "100%" } : { width: 0 }}
              transition={{
                duration: 1.2,
                delay: 1.3,
                ease: [0.23, 1, 0.32, 1]
              }}
            />
          </motion.h1>

          {/* Enhanced Description with Key Skills */}
          <div className="relative space-y-4">
            <motion.h2
              className="text-2xl sm:text-3xl font-semibold text-foreground/90"
              initial={{ opacity: 0, y: 20 }}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              I Build & Deploy Scalable Applications
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              Web Application Developer & DevOps Engineer helping businesses build, deploy, and scale with Laravel, Next.js, Docker, and Kubernetes. Let&apos;s turn your ideas into reality.
            </motion.p>
          </div>
        </div>

        {/* Clean Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: shouldAnimate ? 1 : 0,
            y: shouldAnimate ? 0 : 30
          }}
          transition={{
            delay: 1.4,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
            <Link href="#projects">
              <span className="font-semibold">View My Work</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 border-2">
            <a href="/cv.html" target="_blank" rel="noopener noreferrer">
              <span className="font-semibold">Download Resume</span>
            </a>
          </Button>

          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto h-12 px-6 border border-border">
            <Link href="#contact">
              <span className="font-medium">Get In Touch</span>
            </Link>
          </Button>
        </motion.div>

        {/* Simple Status */}
        <motion.div
          className="flex justify-center items-center gap-2 text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Available for opportunities</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
