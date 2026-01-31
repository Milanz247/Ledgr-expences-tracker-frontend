// src/components/layout/Footer.tsx

import Link from "next/link";
import { Mail, MapPin, Code2, ExternalLink } from "lucide-react";
import { SiLaravel, SiNextdotjs, SiVuedotjs, SiGo, SiTailwindcss } from "react-icons/si";

const navigationLinks = [
  { name: "About", href: "/#about" },
  { name: "Skills", href: "/#skills" },
  { name: "Experience", href: "/#experience" },
  { name: "Education", href: "/#education" },
  { name: "Projects", href: "/#projects" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
];

const professionalLinks = [
  { name: "GitHub", href: "https://github.com/Milanz247", external: true },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/milanmadusanka/", external: true },
  { name: "Medium", href: "https://medium.com/@milanmadusankamms", external: true },
  { name: "Resume", href: "/cv.html", external: true },
  { name: "WhatsApp", href: "https://wa.me/94777392706", external: true },
];

const techStack = [
  { name: "Laravel", icon: SiLaravel, color: "#FF2D20" },
  { name: "Next.js", icon: SiNextdotjs, color: "currentColor" },
  { name: "Vue.js", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "Golang", icon: SiGo, color: "#00ADD8" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="px-4 py-8 sm:py-12 lg:px-8">
          
          {/* Mobile-First Layout */}
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-12">
            
            {/* Professional Profile - Full width on mobile */}
            <div className="space-y-4 lg:space-y-6">
              <div className="space-y-2 lg:space-y-3">
                <Link href="/" className="inline-flex items-center gap-2 group">
                  <Code2 className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  <h3 className="text-lg lg:text-xl font-bold text-card-foreground tracking-tight group-hover:text-primary transition-colors">
                    Milan Madusanka
                  </h3>
                </Link>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                  Web Developer & DevOps Engineer
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed lg:pr-4">
                  Building scalable web applications with modern technologies.
                </p>
              </div>
              
              {/* Tech Stack - Compact on mobile */}
              <div className="space-y-2 lg:space-y-3">
                <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider">
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="group flex items-center gap-1.5 px-2 py-1.5 text-xs bg-card border border-border rounded-md hover:border-primary/50 transition-all duration-200 hover:scale-105"
                      title={tech.name}
                    >
                      <tech.icon
                        className="w-3 h-3"
                        style={{ color: tech.color }}
                      />
                      <span className="text-card-foreground font-medium">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info - Mobile optimized */}
              <div className="space-y-2 pt-2 lg:hidden">
                <a 
                  href="mailto:milanmadusankamms@gmail.com"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">milanmadusankamms@gmail.com</span>
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>Matale, Sri Lanka</span>
                </div>
              </div>
            </div>

            {/* Navigation & Professional Links - Side by side on mobile */}
            <div className="grid grid-cols-2 gap-6 lg:gap-0 lg:grid-cols-1 lg:col-span-2 lg:grid lg:lg:grid-cols-2">
              
              {/* Quick Navigation */}
              <div className="space-y-4 lg:space-y-6">
                <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider">
                  Portfolio
                </h4>
                <nav className="space-y-1.5 lg:space-y-2">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Professional Links */}
              <div className="space-y-4 lg:space-y-6">
                <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider">
                  Connect
                </h4>
                
                <nav className="space-y-1.5 lg:space-y-2">
                  {professionalLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                    >
                      <span>{link.name}</span>
                      {link.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Contact Info - Desktop only */}
                <div className="hidden lg:block space-y-2 pt-2">
                  <a 
                    href="mailto:milanmadusankamms@gmail.com"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>milanmadusankamms@gmail.com</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Matale, Sri Lanka</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section - Mobile optimized */}
        <div className="border-t border-border/50">
          <div className="px-4 py-4 lg:py-6 lg:px-8">
            <div className="space-y-3 lg:space-y-0 lg:flex lg:justify-between lg:items-center text-xs text-muted-foreground">
              
              {/* Copyright - Always on top on mobile */}
              <div className="text-center lg:text-left">
                <p>© {currentYear} Milan Madusanka Senarathna</p>
              </div>
              
              {/* Status indicators - Stacked on mobile */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2 sm:gap-4">
                <span className="hidden sm:inline">Built with Next.js & Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
