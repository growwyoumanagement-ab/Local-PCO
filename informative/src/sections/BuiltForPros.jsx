import { motion } from "framer-motion";
import { Wrench, Zap, Bug, Droplets, Hammer, Sparkles, HardHat, ShieldCheck } from "lucide-react";

export function BuiltForPros() {
  const tradeCategories = [
    { name: "Plumbing Specialists", icon: <Droplets size={24} className="text-blue-400" />, desc: "Piping, leak detection, fixture repairs, water heaters" },
    { name: "Electrical Experts", icon: <Zap size={24} className="text-amber-400" />, desc: "Wiring, switchboards, inverters, circuit breakers" },
    { name: "Appliance Technicians", icon: <Wrench size={24} className="text-emerald-400" />, desc: "AC repair, refrigeration, washing machines, microwaves" },
    { name: "Pest Control Operators", icon: <Bug size={24} className="text-teal-400" />, desc: "Termite treatments, commercial fumigation, general pest" },
    { name: "Carpenters & Fitters", icon: <Hammer size={24} className="text-orange-400" />, desc: "Furniture assembly, door hardware, custom woodwork" },
    { name: "Deep Cleaning Pros", icon: <Sparkles size={24} className="text-cyan-400" />, desc: "Home sanitization, bathroom scrubbing, sofa cleaning" },
  ];

  return (
    <section id="operations" className="py-24 bg-[#080C14] border-t border-zinc-800/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Phase 6 • Partner Community
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Built for Local Field Professionals
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Engineered for high readability in outdoor sunlight, large touch targets for gloved or busy hands, and zero clutter.
          </p>
        </div>

        {/* 6 Trades Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tradeCategories.map((t, idx) => (
            <div key={idx} className="bg-[#0F1623] border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                {t.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Philosophy Callout */}
        <div className="bg-gradient-to-r from-emerald-950/30 via-zinc-900/80 to-zinc-950 border border-emerald-500/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HardHat size={16} />
            Field-First Philosophy
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-3">
            “I opened this because I have a job to do.”
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto">
            Every feature in Local PCO is designed to reduce screen time and cognitive load so you can focus on high quality fieldwork and getting paid on time.
          </p>
        </div>

      </div>
    </section>
  );
}
