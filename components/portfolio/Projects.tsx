"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Code2, Folder, GitBranch, Layers } from "lucide-react";
import Link from "next/link";

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);

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

  // Featured projects only - real, published work
  const featuredProjects = [
    {
      title: "Thenuka Mobile - E-Commerce Store",
      description: "Full-featured e-commerce website for a mobile phone shop with product catalog, shopping cart, and online ordering system.",
      technologies: ["Next.js", "Laravel", "Tailwind CSS", "SEO"],
      image: "/images/project/thenukamobile.png",
      githubLink: "",
      liveLink: "https://thenukamobile.lk/",
      category: "Full-Stack",
      year: "2025",
    },
    {
      title: "Personal Portfolio Website",
      description: "Modern, responsive portfolio built with Next.js, TypeScript, and Tailwind CSS featuring smooth animations and dark mode.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Framer Motion"],
      image: "/images/project/portfolio.png",
      githubLink: "https://github.com/Milanz247/My-Portfolio",
      liveLink: "https://milanmadusanka.me",
      category: "Frontend",
      year: "2025",
    },
    {
      title: "Enterprise POS System (Team Project)",
      description: "Contributed to Laravel-based Point of Sale system serving 50+ retail businesses with inventory management and reporting.",
      technologies: ["Laravel", "Bootstrap", "HTML", "MySQL"],
      image: "/images/project/teampos.png",
      githubLink: "https://github.com/Milanz247",
      liveLink: "",
      category: "Full-Stack",
      year: "2024",
    },
    {
      title: "Linux Administration Lab",
      description: "Personal learning environment for practicing Red Hat Enterprise Linux administration and system operations.",
      technologies: ["RHEL", "Shell Scripting", "WildFly", "Docker", "System Monitoring"],
      image: "",
      githubLink: "https://github.com/Milanz247",
      liveLink: "",
      category: "DevOps",
      year: "2025",
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Full-Stack": return <Code2 className="w-4 h-4" />;
      case "DevOps": return <GitBranch className="w-4 h-4" />;
      case "Frontend": return <Layers className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/5 via-background to-muted/10">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Folder className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Projects
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Real projects I&apos;ve built and contributed to during my development journey.
          </p>
        </motion.div>

        {/* Featured Projects Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {featuredProjects.map((project, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group"
            >
              <Card className="h-full border hover:border-primary/50 transition-all duration-300 bg-card hover:shadow-lg overflow-hidden">
                {/* Project Image */}
                {project.image && (
                  <div className="relative w-full h-32 sm:h-36 lg:h-44 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader className="py-2 sm:py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(project.category)}
                    <Badge variant="secondary" className="text-xs">
                      {project.category}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-sm sm:text-base font-bold mb-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </CardHeader>

                <CardContent className="py-1 sm:py-2 px-3 sm:px-4">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-1.5 py-0.5 bg-muted text-xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-1.5 py-0.5 bg-muted/50 text-xs rounded-md text-muted-foreground">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-2 sm:pb-3 px-3 sm:px-4">
                  <div className="flex gap-2 w-full">
                    {project.githubLink && (
                      <Button asChild size="sm" className="flex-1 h-8 text-xs">
                        <Link href={project.githubLink} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3.5 h-3.5 mr-1.5" />
                          Code
                        </Link>
                      </Button>
                    )}
                    {project.liveLink && (
                      <Button asChild variant={project.githubLink ? "outline" : "default"} size="sm" className="flex-1 h-8 text-xs">
                        <Link href={project.liveLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Live
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-muted-foreground text-sm mb-4">
            More projects on my GitHub
          </p>
          <Button asChild variant="outline">
            <Link href="https://github.com/Milanz247" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              View GitHub Profile
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
