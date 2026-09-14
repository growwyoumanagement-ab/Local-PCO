import { motion } from "framer-motion";
import { CheckCircle2, Navigation, Camera, Wallet, ShieldCheck, ArrowRight, Play } from "lucide-react";
import { GlowButton } from "../components/ui/GlowButton";

export function Hero() {
  const workflowFeatures = [
    { icon: <CheckCircle2 size={16} className="text-emerald-400" />, text: "Instant Job Broadcast" },
    { icon: <Navigation size={16} className="text-blue-400" />, text: "Live Route Navigation" },
    { icon: <Camera size={16} className="text-amber-400" />, text: "Photo Proof Completion" },
    { icon: <Wallet size={16} className="text-emerald-400" />, text: "Fast Bank Payouts" },
    { icon: <ShieldCheck size={16} className="text-indigo-400" />, text: "Verified Partner Network" }
  ];

  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 flex items-center overflow-hidden bg-[#080C14]">
      {/* Subtle grid pattern & operational backdrop */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      
      {/* Calm ambient brand glow */}
      <div className="absolute top-1/4 -left-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600 opacity-[0.07] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-[10%] w-[35vw] h-[35vw] rounded-full bg-teal-500 opacity-[0.05] blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            <div>
              {/* Supporting Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                  From job assignment to payout
                </span>
              </div>
              
              {/* Primary Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6">
                Your workday, <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
                  connected.
                </span>
              </h1>
              
              {/* Supporting Copy */}
              <p className="text-lg md:text-xl text-[#8FA3BF] max-w-xl leading-relaxed">
                Local PCO connects service partners with real-time bookings, guides every job from assignment to completion, and keeps proof, earnings, and payouts in one place.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <GlowButton href="#download" variant="primary" size="lg" className="flex items-center gap-2">
                <span>Get started</span>
                <ArrowRight size={18} />
              </GlowButton>
              <GlowButton href="#how-it-works" variant="secondary" size="lg" className="flex items-center gap-2">
                <Play size={16} className="fill-current" />
                <span>See how it works</span>
              </GlowButton>
            </div>

            {/* Micro reassurance */}
            <p className="text-xs text-zinc-400 font-medium">
              Purpose-built for technicians, electricians, plumbers, cleaners, and field specialists.
            </p>
          </motion.div>

          {/* Operational Mock UI Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md space-y-4">
              
              {/* Card 1: Job Broadcast Notification */}
              <div className="bg-[#0F1623] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl shadow-black/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300">
                      New Request
                    </span>
                    <span className="text-xs text-zinc-400">2 mins ago</span>
                  </div>
                  <span className="text-base font-bold text-white">₹850</span>
                </div>
                <div className="space-y-1 mb-4">
                  <h3 className="text-sm font-semibold text-white">Plumbing • Leakage Repair</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <span className="text-emerald-400">📍</span> 2.4 km away • Sector 14, Main Road
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-center">
                    Accept Job
                  </button>
                  <button className="py-2 px-3 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-center">
                    Decline
                  </button>
                </div>
              </div>

              {/* Card 2: In-Progress Job with Photo Proof */}
              <div className="bg-[#0F1623] border border-zinc-800 rounded-2xl p-5 shadow-xl shadow-black/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                    <span className="text-xs font-semibold text-blue-400">Service in Progress</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">Timer: 34m</span>
                </div>
                <p className="text-sm font-semibold text-white mb-2">Electrical Panel Upgrade</p>
                <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 mb-3">
                  <span>Photo Proof: 2 uploaded</span>
                  <span className="text-emerald-400 font-medium">✓ Ready to Complete</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-4/5 rounded-full"></div>
                </div>
              </div>

              {/* Card 3: Payout Snapshot */}
              <div className="bg-[#0F1623] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">Today's Earnings</p>
                  <p className="text-lg font-bold text-white">₹3,450</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={12} />
                    Auto Payout Active
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
        
        {/* Operational Workflow Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-16 pt-8 border-t border-zinc-800/80 flex flex-wrap justify-center gap-x-8 gap-y-3"
        >
          {workflowFeatures.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.icon}
              <span className="text-zinc-300 text-xs sm:text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
