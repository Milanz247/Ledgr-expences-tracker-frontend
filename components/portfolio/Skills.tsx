"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/badge";
import { Code2, Server, Settings, GitBranch, Layers, Shield } from "lucide-react";

const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Professional skill categories with honest proficiency levels
  const skillCategories = [
    {
      title: "Production-Ready Skills",
      icon: Code2,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      technologies: [
        "Laravel/PHP (Daily use)", "React.js (Team projects)", "MySQL (Query optimization)", "Git (Merge conflict resolution)",
        "RESTful APIs (Built 15+ endpoints)", "Linux CLI (Production troubleshooting)"
      ]
    },
    {
      title: "Growing Expertise",
      icon: Settings,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      technologies: [
        "RHEL Administration (6 months hands-on)", "Shell Scripting (Automation tasks)", "WildFly (Deployment & monitoring)",
        "System Monitoring (Log analysis)", "Docker (Learning containers)", "CI/CD (GitHub Actions basics)"
      ]
    },
    {
      title: "Battle-Tested Experience",
      icon: Server,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      technologies: [
        "Database Debugging (Performance issues)", "API Development (Error handling)", "Team Collaboration (4-person teams)",
        "Production Support (99.5% uptime)", "Code Reviews (Given & received)", "Agile Workflow (Sprint planning)"
      ]
    },
    {
      title: "Development Tools",
      icon: GitBranch,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      technologies: [
        "VS Code (Extensions & shortcuts)", "JIRA (Issue tracking)", "Postman (API testing)",
        "GitHub (Branch management)", "Command Line (Daily workflows)", "Debugging (Chrome DevTools)"
      ]
    }
  ];


  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Animate the section container
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Technical Skills
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
            Growing expertise in full-stack development and system administration,
            with 1.5+ years of hands-on experience and continuous learning in DevOps practices.
          </p>
        </div>

        {/* Enhanced Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {skillCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg ${category.color} relative overflow-hidden`}>
                    <IconComponent className="w-6 h-6 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {category.title}
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-green-500 rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Technologies List */}
                <div className="flex flex-wrap gap-2">
                  {category.technologies.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="text-xs px-3 py-1"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expertise Highlights */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold">Core Expertise</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Full-stack web application development with production experience
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Enterprise POS system features serving real businesses
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Linux system administration with hands-on troubleshooting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Database optimization and performance debugging
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Team collaboration and knowledge sharing in Agile environment
              </li>
            </ul>
          </div>

          {/* Current Focus */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold">Current Focus</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Red Hat Enterprise Linux certification preparation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Docker containerization and orchestration basics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                AWS cloud fundamentals and services exploration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                CI/CD pipeline implementation and automation
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Stats */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">1.5+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Years Experience</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">15+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Technologies</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">5+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Projects</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">3+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Articles</div>
            </div>
          </div>
        </div>

        {/* Technical Decision Making & Problem Solving */}
        <div className="mt-16 bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Problem-Solving Approach
            </h3>
            <p className="text-muted-foreground text-sm">Real-world decisions and trade-offs from actual projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <div className="text-base font-semibold mb-2">Technical Decisions</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chose MySQL over MongoDB for better team familiarity</li>
                <li>• Prioritized query optimization over caching for sustainable performance</li>
                <li>• Selected simple rsync backup over complex solutions for reliability</li>
                <li>• Used Laravel over microservices to match team expertise</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <div className="text-base font-semibold mb-2">Debugging Approach</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with logs and error messages, not assumptions</li>
                <li>• Reproduce issues in development before touching production</li>
                <li>• Document solutions for team knowledge sharing</li>
                <li>• Ask for help when stuck (learned this the hard way)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
