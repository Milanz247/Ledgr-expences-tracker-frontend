import Hero from "@/components/portfolio/Hero";
import TechStackTicker from "@/components/portfolio/TechStackTicker";
import About from "@/components/portfolio/About";
import Skills from "@/components/portfolio/Skills";
import Experience from "@/components/portfolio/Experience";
import Education from "@/components/portfolio/Education";
import Certifications from "@/components/portfolio/Certifications";
import Projects from "@/components/portfolio/Projects";
import Gallery from "@/components/portfolio/Gallery";
import Blog from "@/components/portfolio/Blog";
import Contact from "@/components/portfolio/Contact";

export default function Home() {
  return (
    <main id="main-content" className="overflow-x-hidden w-full max-w-full">
      <Hero />

      {/* Tech Stack Section - Added after Hero */}
      <TechStackTicker />

      <section id="about" className="py-16">
        <About />
      </section>

      <section id="skills" className="py-20">
        <Skills />
      </section>

      <section id="experience" className="py-20">
        <Experience />
      </section>

      <section id="education" className="py-16">
        <Education />
      </section>

      <section id="certifications" className="py-16">
        <Certifications />
      </section>

      <section id="projects" className="py-16">
        <Projects />
      </section>

      <Gallery />

      <section id="blog" className="py-20">
        <Blog />
      </section>

      <section id="contact" className="py-16">
        <Contact />
      </section>

    </main>
  );
}
