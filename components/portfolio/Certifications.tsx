"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Certifications = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const certifications = [
    {
      id: 1,
      name: "Red Hat Certified System Administrator (RHCSA)",
      issuer: "Red Hat",
      status: "in-progress",
      expectedDate: "2025",
      description: "Enterprise Linux system administration, user management, storage, networking",
      skills: ["RHEL", "Linux Admin", "Shell Scripting", "System Security"],
      link: "https://www.redhat.com/en/services/certification/rhcsa"
    },
    {
      id: 2,
      name: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      status: "planned",
      expectedDate: "2025",
      description: "Cloud concepts, AWS services, security, architecture, pricing",
      skills: ["AWS", "Cloud Computing", "Infrastructure"],
      link: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
    },
    {
      id: 3,
      name: "Docker Certified Associate",
      issuer: "Docker",
      status: "planned",
      expectedDate: "2026",
      description: "Container fundamentals, Docker orchestration, security best practices",
      skills: ["Docker", "Containers", "DevOps"],
      link: "https://training.mirantis.com/dca-certification-exam/"
    }
  ];

  const languages = [
    { name: "Sinhala", level: "Native", proficiency: 100 },
    { name: "English", level: "Professional Working", proficiency: 75 },
  ];

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

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Certifications & Languages
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
            Professional certifications in progress and language proficiency
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certifications */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Professional Certifications
            </h3>
            
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          cert.status === 'completed' 
                            ? 'bg-green-500/10 text-green-600 border-green-200' 
                            : cert.status === 'in-progress'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-200'
                            : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
                        }`}
                      >
                        {cert.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {cert.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                        {cert.status === 'completed' ? 'Completed' : cert.status === 'in-progress' ? 'In Progress' : 'Planned'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Expected: {cert.expectedDate}</span>
                    </div>
                    <h4 className="font-semibold text-card-foreground mb-1">{cert.name}</h4>
                    <p className="text-sm text-primary mb-2">{cert.issuer}</p>
                    <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="ml-2">
                    <a href={cert.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Languages</h3>
            
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="space-y-4">
                {languages.map((lang, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-card-foreground">{lang.name}</span>
                      <span className="text-sm text-muted-foreground">{lang.level}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${lang.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold mb-4">Quick Facts</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">1.5+ Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">Matale, Sri Lanka</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Type</span>
                  <span className="font-medium">Remote / On-site</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="font-medium text-green-600">Open to Work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
