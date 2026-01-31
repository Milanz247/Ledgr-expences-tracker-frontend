"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { User, Briefcase, ChevronDown, CheckCircle } from "lucide-react";
import Image from "next/image";

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  const highlights = [
    "1.5+ years development experience in enterprise systems",
    "POS systems serving 50+ retail businesses",
    "Database optimization: 30% response time improvement",
    "Currently learning RHEL, Docker & DevOps practices",
  ];

  return (
    <section ref={sectionRef} className="section-spacing px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/30 via-background to-muted/10">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              About Me
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
            Web Application Developer transitioning to DevOps Engineer with proven enterprise application experience
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Professional Image with Framer Motion */}
          <motion.div 
            className="order-1 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="relative aspect-square w-full max-w-md mx-auto lg:mx-0">
                <div className="relative w-full h-full bg-gradient-to-br from-card to-muted rounded-xl border border-border shadow-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Image
                      src="/images/aboutimg.jpg"
                      alt="Milan Madusanka - Full-Stack Developer & System Engineer"
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Content */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Quick Highlights - Always Visible */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Professional Profile
              </h3>
              
              {/* Key Highlights - Quick Scan */}
              <div className="space-y-3 mb-4">
                {highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-card-foreground">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Current Role */}
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-card-foreground">Currently:</strong> System Engineer Intern at Epic Lanka (Pvt) Ltd (since Jun 2024), 
                working with RHEL, WildFly, Docker, and Kubernetes.
              </p>

              {/* Expandable Details */}
              <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-4 border-t border-border space-y-4 text-sm text-card-foreground leading-relaxed">
                  <p>
                    My development background provides unique value in understanding application deployment, 
                    performance optimization, and system integration challenges. I bridge the gap between 
                    development and operations teams.
                  </p>
                  <p>
                    <strong className="text-primary">Problem-solving example:</strong> Debugged a critical 
                    production API timeout issue, traced it to unoptimized database queries, 
                    and achieved 30% response time improvement through proper indexing. 
                    Chose pragmatic MySQL optimization over trendy NoSQL migration to minimize business risk.
                  </p>
                  <p>
                    Passionate about building reliable, scalable systems and helping teams deliver 
                    software efficiently through modern DevOps practices.
                  </p>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-4 py-2 px-4 bg-muted/50 hover:bg-muted rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium text-card-foreground"
                suppressHydrationWarning
              >
                <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
