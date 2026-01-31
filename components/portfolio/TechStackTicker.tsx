"use client";

import { motion } from "framer-motion";
import {
  SiReact,
  SiLaravel,
  SiNginx,
  SiRedhat,
  SiLinux,
  SiJavascript,
  SiTypescript,
  SiPhp,
  SiMysql,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiPython,
  SiAmazon,
  SiGooglecloud,
  SiGo,
  SiSqlite,
  SiKubernetes,
  SiJenkins,
  SiArgo,
  SiHelm,
  SiRancher,
  SiPrometheus,
  SiGrafana,
  SiElastic,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiMongodb,
  SiRedis,
  SiUbuntu,
  SiCentos,
  SiTerraform,
  SiAnsible,
  SiVuedotjs,
  SiAngular,
  SiBootstrap,
  SiMariadb,
  SiExpress,
  SiDjango,
  SiSpring,
  SiFastapi,
  SiApache,
  SiGithubactions,
  SiCircleci,
  SiSymfony,
  SiOracle,
  SiDatadog,
  SiPodman,
  SiPulumi,
  SiChef,
  SiPuppet
} from "react-icons/si";
import { Server, Coffee, Cloud, Database, HardDrive, Workflow } from "lucide-react";

interface TechItem {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const softwareTech: TechItem[] = [
  // Frontend
  { name: "React", icon: <SiReact />, color: "#61DAFB" },
  { name: "Next.js", icon: <SiNextdotjs />, color: "#000000" },
  { name: "Vue.js", icon: <SiVuedotjs />, color: "#4FC08D" },
  { name: "Angular", icon: <SiAngular />, color: "#DD0031" },
  { name: "Tailwind CSS", icon: <SiTailwindcss />, color: "#06B6D4" },
  { name: "Bootstrap", icon: <SiBootstrap />, color: "#7952B3" },

  // Backend
  { name: "Laravel", icon: <SiLaravel />, color: "#FF2D20" },
  { name: "Symfony", icon: <SiSymfony />, color: "#000000" },
  { name: "Node.js", icon: <SiNodedotjs />, color: "#339933" },
  { name: "Express", icon: <SiExpress />, color: "#000000" },
  { name: "FastAPI", icon: <SiFastapi />, color: "#009688" },
  { name: "Django", icon: <SiDjango />, color: "#092E20" },
  { name: "Spring Boot", icon: <SiSpring />, color: "#6DB33F" },

  // Languages
  { name: "JavaScript", icon: <SiJavascript />, color: "#F7DF1E" },
  { name: "TypeScript", icon: <SiTypescript />, color: "#3178C6" },
  { name: "Python", icon: <SiPython />, color: "#3776AB" },
  { name: "PHP", icon: <SiPhp />, color: "#777BB4" },
  { name: "Java", icon: <Coffee />, color: "#007396" },
  { name: "Go", icon: <SiGo />, color: "#00ADD8" },

  // Databases
  { name: "MySQL", icon: <SiMysql />, color: "#4479A1" },
  { name: "MariaDB", icon: <SiMariadb />, color: "#003545" },
  { name: "PostgreSQL", icon: <SiPostgresql />, color: "#336791" },
  { name: "MongoDB", icon: <SiMongodb />, color: "#47A248" },
  { name: "Redis", icon: <SiRedis />, color: "#DC382D" },
  { name: "SQLite", icon: <SiSqlite />, color: "#003B57" },

  // Version Control
  { name: "Git", icon: <SiGit />, color: "#F05032" },
  { name: "GitHub", icon: <SiGithub />, color: "#181717" },
  { name: "GitLab", icon: <SiGitlab />, color: "#FCA121" },
  { name: "BitBucket", icon: <SiBitbucket />, color: "#0052CC" },
];

const devOpsTech: TechItem[] = [
  // Cloud & Infrastructure
  { name: "AWS", icon: <SiAmazon />, color: "#FF9900" },
  { name: "Azure", icon: <Cloud />, color: "#0078D4" },
  { name: "Google Cloud", icon: <SiGooglecloud />, color: "#4285F4" },
  { name: "Oracle Cloud", icon: <SiOracle />, color: "#F80000" },
  { name: "Terraform", icon: <SiTerraform />, color: "#7B42BC" },
  { name: "Ansible", icon: <SiAnsible />, color: "#EE0000" },
  { name: "Puppet", icon: <SiPuppet />, color: "#FFAE1A" },
  { name: "Chef", icon: <SiChef />, color: "#F09820" },
  { name: "Pulumi", icon: <SiPulumi />, color: "#8A3391" },

  // Containers & Orchestration
  { name: "Docker", icon: <SiDocker />, color: "#2496ED" },
  { name: "Kubernetes", icon: <SiKubernetes />, color: "#326CE5" },
  { name: "OpenShift", icon: <SiRedhat />, color: "#EE0000" },
  { name: "Rancher", icon: <SiRancher />, color: "#0075A8" },
  { name: "Helm", icon: <SiHelm />, color: "#0F1689" },
  { name: "Podman", icon: <SiPodman />, color: "#892CA0" },

  // CI/CD
  { name: "Jenkins", icon: <SiJenkins />, color: "#D24939" },
  { name: "GitLab CI/CD", icon: <SiGitlab />, color: "#FCA121" },
  { name: "GitHub Actions", icon: <SiGithubactions />, color: "#2088FF" },
  { name: "CircleCI", icon: <SiCircleci />, color: "#343434" },
  { name: "Azure DevOps", icon: <Workflow />, color: "#0078D4" },
  { name: "ArgoCD", icon: <SiArgo />, color: "#EF7B4D" },
  { name: "TeamCity", icon: <Server />, color: "#0CB0F2" },

  // Monitoring
  { name: "Prometheus", icon: <SiPrometheus />, color: "#E6522C" },
  { name: "Grafana", icon: <SiGrafana />, color: "#F46800" },
  { name: "ELK Stack", icon: <SiElastic />, color: "#005571" },
  { name: "Datadog", icon: <SiDatadog />, color: "#632CA6" },
  { name: "Zabbix", icon: <Database />, color: "#D40000" },

  // Linux & Networking
  { name: "Linux", icon: <SiLinux />, color: "#FCC624" },
  { name: "Red Hat", icon: <SiRedhat />, color: "#EE0000" },
  { name: "Ubuntu", icon: <SiUbuntu />, color: "#E95420" },
  { name: "CentOS", icon: <SiCentos />, color: "#262577" },
  { name: "Nginx", icon: <SiNginx />, color: "#009639" },
  { name: "Apache", icon: <SiApache />, color: "#D22128" },
  { name: "WildFly", icon: <Server />, color: "#FF6600" },
  { name: "VirtualBox", icon: <HardDrive />, color: "#183A61" },
];

const TechStackTicker: React.FC = () => {
  // Duplicate the arrays for seamless infinite scroll
  const duplicatedSoftwareTech = [...softwareTech, ...softwareTech];
  const duplicatedDevOpsTech = [...devOpsTech, ...devOpsTech];

  return (
    <section className="py-16 bg-muted/30 overflow-hidden w-full">
      <div className="container mx-auto px-4 mb-12 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Tech Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive toolset spanning Software Engineering & DevOps
          </p>
        </motion.div>
      </div>

      {/* Infinite Scrolling Tech Stack */}
      <div className="relative tech-stack-ticker overflow-hidden w-full space-y-8">
        {/* First row - Software Engineering (Left to Right) */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background/80 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background/80 to-transparent z-10"></div>

          <motion.div
            className="flex items-center gap-8 will-change-transform pl-4"
            animate={{
              x: [0, -50 * softwareTech.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
            style={{ minWidth: "max-content" }}
          >
            {duplicatedSoftwareTech.map((tech, index) => (
              <motion.div
                key={`software-${index}`}
                className="tech-item flex items-center gap-3 bg-card hover:bg-card/80 rounded-xl px-6 py-4 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 min-w-fit group cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  className="text-2xl transition-colors duration-300"
                  style={{ color: tech.color }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 360,
                    transition: { duration: 0.5 }
                  }}
                >
                  {tech.icon}
                </motion.div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Second row - DevOps (Right to Left) */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background/80 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background/80 to-transparent z-10"></div>

          <motion.div
            className="flex items-center gap-8 will-change-transform pl-4"
            animate={{
              x: [-50 * devOpsTech.length, 0],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 45,
                ease: "linear",
              },
            }}
            style={{ minWidth: "max-content" }}
          >
            {duplicatedDevOpsTech.map((tech, index) => (
              <motion.div
                key={`devops-${index}`}
                className="tech-item flex items-center gap-3 bg-card hover:bg-card/80 rounded-xl px-6 py-4 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 min-w-fit group cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  className="text-2xl transition-colors duration-300"
                  style={{ color: tech.color }}
                  whileHover={{
                    scale: 1.2,
                    rotate: -360,
                    transition: { duration: 0.5 }
                  }}
                >
                  {tech.icon}
                </motion.div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <p className="text-muted-foreground mb-4">
          Always learning and exploring new technologies
        </p>
        <motion.div
          className="inline-flex items-center gap-2 text-primary font-medium"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span>Let&apos;s build something amazing together</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TechStackTicker;
