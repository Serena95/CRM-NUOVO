import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Layout,
  ArrowRight,
  Globe,
  Smartphone,
  Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-white text-brand-gray font-sans selection:bg-brand-blue/20 selection:text-brand-blue">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-blue rounded-[8px] flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
              <Layout size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-brand-blue uppercase">Nexus <span className="text-brand-yellow">OS</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Funzionalità', 'Prezzi', 'Soluzioni', 'Risorse'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-black text-brand-gray hover:text-brand-blue transition-colors uppercase tracking-widest">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onLogin} className="font-black text-xs uppercase tracking-widest text-brand-blue">Accedi</Button>
            <Button onClick={onLogin} className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue font-black rounded-full px-8 text-xs uppercase tracking-widest shadow-lg shadow-brand-yellow/20">
              Inizia Ora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                <Zap size={14} />
                <span>La piattaforma Enterprise per il tuo business</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-brand-blue leading-[1.1] tracking-tight uppercase">
                Gestisci tutto in <span className="text-brand-yellow">un unico</span> posto.
              </h1>
              <p className="text-xl text-brand-gray leading-relaxed max-w-lg">
                CRM, Task, Chat e Automazione. Tutto quello di cui la tua azienda ha bisogno per crescere, integrato in una sola piattaforma potente e intuitiva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onLogin} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-black rounded-full px-10 h-14 text-sm uppercase tracking-widest shadow-xl shadow-brand-blue/20 group">
                  Prova Gratis 30 Giorni
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="rounded-full px-10 h-14 text-sm font-black uppercase tracking-widest border-[#DDDDDD] text-brand-blue">
                  Guarda Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-400">
                  <span className="text-slate-800">+10,000</span> aziende si fidano di noi
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden aspect-[4/3] group">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/900" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500 rounded-3xl -z-0 blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-cyan-400 rounded-full -z-0 blur-3xl opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="funzionalità" className="py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em]">Cosa offriamo</h2>
            <h3 className="text-4xl font-black text-brand-blue uppercase tracking-tight">Strumenti potenti per team ambiziosi</h3>
            <p className="text-lg text-brand-gray">Abbiamo costruito ogni modulo per essere il migliore della categoria, garantendo al contempo una perfetta integrazione.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'CRM Avanzato', desc: 'Gestisci lead, deal e contatti con pipeline personalizzabili e automazioni intelligenti.' },
              { icon: CheckCircle2, title: 'Task & Progetti', desc: 'Organizza il lavoro con Kanban, Gantt e checklist. Monitora il tempo e le scadenze.' },
              { icon: MessageSquare, title: 'Comunicazione', desc: 'Chat interna, videochiamate e feed aziendale per mantenere tutti allineati.' },
              { icon: BarChart3, title: 'Analytics', desc: 'Report dettagliati e dashboard in tempo reale per prendere decisioni basate sui dati.' },
              { icon: Cloud, title: 'Drive & Documenti', desc: 'Archivia file in modo sicuro e collabora sui documenti in tempo reale.' },
              { icon: Shield, title: 'Sicurezza Enterprise', desc: 'Protezione dei dati di livello bancario e gestione granulare dei permessi.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[8px] shadow-sm border border-[#EEEEEE] hover:shadow-xl hover:shadow-brand-blue/5 transition-all"
              >
                <div className="w-14 h-14 bg-brand-blue/10 rounded-[8px] flex items-center justify-center text-brand-blue mb-6">
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-black text-brand-blue uppercase tracking-tight mb-4">{feature.title}</h4>
                <p className="text-brand-gray leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-blue rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-blue/20">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Pronto a trasformare la tua azienda?</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Unisciti a migliaia di team che hanno già scelto Nexus per scalare il loro business.
              </p>
              <Button onClick={onLogin} className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-black rounded-full px-12 h-16 text-sm uppercase tracking-widest shadow-xl group">
                Inizia ora gratuitamente
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-yellow/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-[#EEEEEE]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
                  <Layout size={18} />
                </div>
                <span className="text-lg font-black tracking-tighter text-brand-blue uppercase">Nexus</span>
              </div>
              <p className="text-sm text-brand-gray/60 leading-relaxed">
                La soluzione all-in-one per la gestione aziendale moderna. Made with ❤️ for ambitious teams.
              </p>
            </div>
            {[
              { title: 'Prodotto', links: ['CRM', 'Task', 'Chat', 'Drive'] },
              { title: 'Azienda', links: ['Chi siamo', 'Carriere', 'Contatti', 'Legal'] },
              { title: 'Supporto', links: ['Help Center', 'API Docs', 'Status', 'Webinar'] }
            ].map((col, i) => (
              <div key={i} className="space-y-6">
                <h5 className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm font-bold text-brand-gray/60 hover:text-brand-blue transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-[#EEEEEE] text-xs font-bold text-brand-gray/40 uppercase tracking-widest">
            <p>© 2024 Nexus. Tutti i diritti riservati.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-brand-blue transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
