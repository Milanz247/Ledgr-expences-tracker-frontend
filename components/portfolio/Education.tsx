"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap, Calendar, MapPin, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Education = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const education = [
    {
      id: 1,
      degree: "Higher National Diploma in IT",
      fullDegree: "Higher National Diploma in Information Technology (HNDIT)",
      institution: "SLIATE",
      fullInstitution: "Sri Lanka Institute of Advanced Technological Education",
      location: "Sri Lanka",
      duration: "2021 - 2023",
      type: "Diploma",
      highlights: ["Software Development", "Database Management", "Web Technologies", "Networking"]
    },
    {
      id: 2,
      degree: "G.C.E. Advanced Level",
      fullDegree: "G.C.E. Advanced Level - Technology Stream",
      institution: "Sri Naga National School",
      fullInstitution: "Sri Naga National School",
      location: "Naula, Sri Lanka",
      duration: "2017 - 2019",
      type: "A/L",
      highlights: ["ICT", "Science for Technology", "Engineering Technology"]
    }
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Section fade in
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    // Cards animation - use ref instead of class selector
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.edu-card');
      gsap.fromTo(cards, 
        { 
          opacity: 0, 
          y: 30 
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-visible">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Education
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Foundation in Information Technology and Computer Science.
          </p>
        </div>

        {/* Education Cards - Responsive Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="edu-card bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/40 hover:shadow-md transition-all duration-300"
              style={{ opacity: 1 }} /* Ensure visibility on mobile */
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="text-xs mb-2">
                    {edu.type}
                  </Badge>
                  <h3 className="font-bold text-card-foreground text-sm sm:text-base leading-tight mb-1">
                    {edu.degree}
                  </h3>
                  <p className="text-primary text-xs sm:text-sm font-medium">
                    {edu.institution}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-3 sm:mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {edu.duration}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {edu.location}
                </span>
              </div>

              {/* Subjects/Highlights */}
              <div className="flex flex-wrap gap-1.5">
                {edu.highlights.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-muted text-xs rounded-md text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
