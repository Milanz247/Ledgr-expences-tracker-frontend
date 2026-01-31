"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Github, Linkedin } from "lucide-react";
import { SiMedium } from "react-icons/si";
import { toast } from "sonner";

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast.success("Message sent!", {
        description: "I'll get back to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Failed to send message", {
        description: "Please try again or contact me directly via email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
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
  }, []);

  const socialLinks = [
    { href: "https://github.com/Milanz247", icon: Github, label: "GitHub", color: "text-[#333] dark:text-white hover:scale-110" },
    { href: "https://www.linkedin.com/in/milanmadusanka/", icon: Linkedin, label: "LinkedIn", color: "text-[#0077B5] hover:scale-110" },
    { href: "https://medium.com/@milanmadusankamms", icon: SiMedium, label: "Medium", color: "text-[#000] dark:text-white hover:scale-110" },
    { href: "https://wa.me/94777392706", icon: MessageCircle, label: "WhatsApp", color: "text-[#25D366] hover:scale-110" },
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Get In Touch
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Have a project in mind? Let&apos;s work together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Email</h3>
              <a
                href="mailto:milanmadusankamms@gmail.com"
                className="text-card-foreground hover:text-primary transition-colors text-sm"
              >
                milanmadusankamms@gmail.com
              </a>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Availability</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-card-foreground">Open for DevOps & Web Dev roles</span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Connect</h3>
              <div className="flex gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/50 ${link.color}`}
                    aria-label={link.label}
                  >
                    <link.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form - Right Side */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    className="h-10 text-sm"
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="h-10 text-sm"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell me about your project..."
                  rows={4}
                  required
                  className="resize-none text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 text-sm font-medium"
                suppressHydrationWarning
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
