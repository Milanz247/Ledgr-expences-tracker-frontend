// src/components/layout/Header.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, User, Code2, Briefcase, Award, FolderOpen, Mail, FileText, X, GraduationCap, BookOpen, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/portfolio/ModeToggle";
import { BackgroundToggle } from "@/components/portfolio/BackgroundToggle";

// Animated Hamburger Icon Component
const AnimatedMenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <div className="w-6 h-6 flex flex-col justify-center items-center relative">
    <motion.span
      className="absolute w-5 h-0.5 bg-current rounded-full"
      animate={{
        rotate: isOpen ? 45 : 0,
        y: isOpen ? 0 : -4,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
    <motion.span
      className="absolute w-5 h-0.5 bg-current rounded-full"
      animate={{
        opacity: isOpen ? 0 : 1,
        scaleX: isOpen ? 0 : 1,
      }}
      transition={{ duration: 0.2 }}
    />
    <motion.span
      className="absolute w-5 h-0.5 bg-current rounded-full"
      animate={{
        rotate: isOpen ? -45 : 0,
        y: isOpen ? 0 : 4,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </div>
);

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/#about", icon: User },
    { name: "Skills", href: "/#skills", icon: Code2 },
    { name: "Experience", href: "/#experience", icon: Briefcase },
    { name: "Education", href: "/#education", icon: GraduationCap },
    { name: "Certifications", href: "/#certifications", icon: Award },
    { name: "Projects", href: "/#projects", icon: FolderOpen },
    { name: "Blog", href: "/#blog", icon: BookOpen },
    { name: "Contact", href: "/#contact", icon: Mail },
  ];

  return (
    <>
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Main navigation bar */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-300">
        <div className="w-full flex h-16 items-center justify-between px-4 lg:px-8">

          {/* Logo/Name - Left Side */}
          <Link href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
            Milan Madusanka
          </Link>

          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.name}>
                    <NavigationMenuLink asChild>
                      <Link href={link.href} className={navigationMenuTriggerStyle()}>
                        {link.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <div className="absolute right-4 flex items-center space-x-2">

            {/* Login Link */}
            <Button variant="ghost" size="icon" asChild title="Login to Lgder">
              <Link href="/login">
                <LogIn className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>

            {/* Background Toggle */}
            <BackgroundToggle />

            {/* Theme Toggle */}
            <ModeToggle />

            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <AnimatedMenuIcon isOpen={isMenuOpen} />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  {/* Mobile Menu Header */}
                  <div className="p-6 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">Milan Madusanka</h2>
                        <p className="text-sm text-muted-foreground">Web Developer & DevOps Engineer</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col p-4 gap-1">
                    <AnimatePresence>
                      {navLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <motion.div
                            key={link.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                            <Link
                              href={link.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground rounded-lg transition-all hover:bg-muted hover:text-foreground group"
                            >
                              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              {link.name}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </nav>

                  {/* CTA Section */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-muted/30">
                    <div className="flex flex-col gap-3">
                      <Button asChild className="w-full" onClick={() => setIsMenuOpen(false)}>
                        <Link href="/#contact">
                          <Mail className="h-4 w-4 mr-2" />
                          Hire Me
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <a href="/cv.html" target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          Download CV
                        </a>
                      </Button>
                    </div>
                  </div>

                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}