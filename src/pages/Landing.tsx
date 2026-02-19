import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Github, Users, Flame, BookOpen, BarChart3, FileText } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeInUp} transition={{ duration: 0.6, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scroll-smooth">
      {/* Navigation */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
            <Github className="w-5 h-5" />
            hacktrack<span className="text-coral">.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how" onClick={(e) => scrollToSection(e, 'how')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="border-coral/50 hover:bg-coral/10 hover:text-coral transition-colors">Get Started</Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="pt-32 pb-24 px-6 relative overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto max-w-4xl relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 border border-coral/40 bg-coral/5 rounded-full text-xs text-coral">
              <Github className="w-3 h-3" />
              Connected to GitHub · Real-time tracking
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Track your hackathon
              <br />
              <span className="text-muted-foreground">team's <span className="text-amber">real work</span>.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Connect your GitHub repo and instantly see who's contributing what, auto-detect skills, 
              catch hero moments, and generate retrospectives—all in real time.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2 bg-coral text-coral-foreground hover:bg-coral/90 font-medium">
                Connect your repo <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="border-border hover:bg-accent gap-2">
                <Github className="w-4 h-4" /> See a demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
        {/* Parallax background shapes */}
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -80]) }} className="absolute top-20 right-10 w-72 h-72 bg-coral/5 rounded-full blur-3xl" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -120]) }} className="absolute bottom-0 left-10 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
      </section>

      {/* Stats */}
      <AnimatedSection>
        <section className="py-16 px-6 border-y border-border">
          <div className="container mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { number: '50+', label: 'Hackathon teams', color: 'text-coral' },
                { number: '10k+', label: 'Commits tracked', color: 'text-amber' },
                { number: '500+', label: 'Hero moments', color: 'text-sage' },
                { number: '<2s', label: 'Sync time', color: 'text-terracotta' },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeInUp} className="text-center space-y-1">
                  <div className={`font-display text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features */}
      <section id="features" className="py-24 px-6 scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection className="text-center mb-16 space-y-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Everything your <span className="text-sage">hackathon team</span> needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Powered by your GitHub repo. No manual tracking needed.</p>
          </AnimatedSection>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Github, title: 'GitHub Integration', description: 'Connect your repo and pull real commit data, PRs, and contributor stats automatically.', color: 'bg-coral/10 text-coral border-coral/30' },
              { icon: Users, title: 'Skill Detection', description: 'Auto-tag teammates by analyzing file types—frontend, backend, ML, design, and more.', color: 'bg-amber/10 text-amber border-amber/30' },
              { icon: Flame, title: 'Hero Moments', description: 'Spot clutch commits: late-night fixes, massive PRs, and critical hotfixes flagged automatically.', color: 'bg-terracotta/10 text-terracotta border-terracotta/30' },
              { icon: BarChart3, title: 'Smart Assignment', description: 'Suggest task assignees based on skill match and current workload balance.', color: 'bg-sage/10 text-sage border-sage/30' },
              { icon: BookOpen, title: 'Auto Retrospective', description: 'Generate contribution timelines, decision points, and flow-state analysis from GitHub data.', color: 'bg-amber/10 text-amber border-amber/30' },
              { icon: FileText, title: 'Portfolio Export', description: 'One-click export to GitHub README or Devpost submission format with all your stats.', color: 'bg-coral/10 text-coral border-coral/30' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.2 } }} className="p-6 border border-border rounded-lg hover:bg-card transition-colors">
                <div className={`w-10 h-10 border rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-card border-y border-border scroll-mt-20">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection className="text-center mb-16 space-y-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Three steps to <span className="text-terracotta">full visibility</span></h2>
          </AnimatedSection>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="space-y-12">
            {[
              { step: '01', title: 'Connect your GitHub repo', description: 'Paste your repo URL and optional access token. Works with public and private repos.', color: 'text-coral' },
              { step: '02', title: 'See your team in action', description: 'Commits, skills, and contributions are auto-analyzed. Hero moments are detected instantly.', color: 'text-amber' },
              { step: '03', title: 'Ship & showcase', description: 'Use the Kanban board to manage tasks, then export your project for Devpost or GitHub showcases.', color: 'text-sage' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex gap-8 items-start">
                <div className={`font-display text-4xl font-bold shrink-0 ${item.color}`}>{item.step}</div>
                <div className="pt-2">
                  <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-24 px-6 border-t border-border">
          <div className="container mx-auto max-w-2xl text-center space-y-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to <span className="text-amber">track your team</span>?</h2>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
              {[
                { text: 'Real GitHub integration', color: 'text-coral' },
                { text: 'Auto skill detection', color: 'text-amber' },
                { text: 'Hero moment tracking', color: 'text-sage' },
                { text: 'Portfolio-ready exports', color: 'text-terracotta' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex items-center justify-center gap-3">
                  <Check className={`w-4 h-4 ${item.color}`} />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2 bg-coral text-coral-foreground hover:bg-coral/90 font-medium">
                Get started now <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display text-lg font-bold flex items-center gap-2">
            <Github className="w-4 h-4" /> hacktrack<span className="text-coral">.</span>
          </div>
          <div className="text-sm text-muted-foreground">© 2025 Hacktrack. Built for builders.</div>
        </div>
      </footer>
    </div>
  );
}
