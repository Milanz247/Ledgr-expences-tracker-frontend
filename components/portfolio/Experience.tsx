"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Calendar, MapPin, Building2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Experience = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const experiences = [
    {
      id: 1,
      position: "System Engineer Intern",
      company: "Epic Lanka (Pvt) Ltd",
      location: "Sri Jayawardenepura Kotte",
      duration: "Jun 2024 – Present",
      durationText: "6 months",
      type: "Internship",
      status: "current",
      description: "Gaining hands-on experience in Linux system administration and DevOps practices in an enterprise environment.",
      achievements: [
        "Administering RHEL servers in production",
        "Docker & Kubernetes container orchestration",
        "CI/CD pipelines with Jenkins & ArgoCD",
        "System monitoring with Prometheus & Grafana"
      ],
      technologies: ["RHEL", "Docker", "Kubernetes", "Jenkins", "ArgoCD", "Prometheus", "Grafana"]
    },
    {
      id: 2,
      position: "Software Engineer",
      company: "Taprobane IT (Pvt) Ltd",
      location: "Matale",
      duration: "Oct 2023 – Feb 2025",
      durationText: "1 yr 5 mos",
      type: "Full-time",
      status: "completed",
      promoted: true,
      description: "Started as intern, promoted to Junior Engineer. Built full-stack features for enterprise POS/ERP solutions.",
      achievements: [
        "Promoted from Intern within 6 months",
        "POS/ERP features serving 50+ businesses",
        "30% database performance improvement",
        "Mentored 3 interns"
      ],
      technologies: ["Laravel", "React.js", "MySQL", "REST APIs", "Git"]
    }
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    gsap.from(".exp-card", {
      opacity: 0,
      x: -30,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".exp-timeline",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <Briefcase className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Professional Journey
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            From software development to system operations — building expertise in both code and infrastructure.
          </p>
        </div>

        {/* Left-aligned Timeline */}
        <div className="exp-timeline relative">
          {/* Vertical Line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

          <div className="space-y-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="exp-card relative pl-12 sm:pl-16">
                {/* Timeline Node */}
                <div className={`absolute left-2 sm:left-4 top-6 w-4 h-4 rounded-full border-4 border-background shadow-md z-10 ${
                  exp.status === 'current' ? 'bg-green-500' : 'bg-primary'
                }`}>
                  {exp.status === 'current' && (
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
                  )}
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg sm:text-xl font-bold text-card-foreground">
                          {exp.position}
                        </h3>
                        {exp.promoted && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Promoted
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-primary font-medium text-sm">
                        <Building2 className="w-4 h-4" />
                        {exp.company}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs shrink-0 ${
                        exp.status === 'current' 
                          ? 'bg-green-500/10 text-green-600 border-green-300' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {exp.status === 'current' ? '● Current' : exp.type}
                    </Badge>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.duration} · {exp.durationText}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {exp.location}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Achievements - Compact List */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
                    {exp.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-card-foreground">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-muted text-xs rounded-md text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Career Stats - Compact */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "2+", label: "Years" },
            { value: "2", label: "Companies" },
            { value: "Linux", label: "Focus" },
            { value: "DevOps", label: "Goal" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 bg-card border border-border rounded-lg">
              <div className="text-xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

