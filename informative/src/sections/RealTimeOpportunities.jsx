import { motion } from "framer-motion";
import { BellRing, MapPin, Clock, DollarSign, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function RealTimeOpportunities() {
  const steps = [
    {
      title: "Real-Time Job Broadcast",
      description: "When a customer requests a service in your zone, all qualified partners receive an instant broadcast alert with exact location, service details, and pricing.",
      badge: "Instant Dispatch"
    },
    {
      title: "Scannable Job Intel",
      description: "Evaluate customer distance, estimated duration, payout amount, and specific instructions at a glance before accepting.",
      badge: "Zero Ambiguity"
    },
    {
      title: "One-Tap Acceptance",
      description: "Accept the booking in one tap to lock in the assignment. The job immediately transitions to your active queue.",
      badge: "Fast Lock-in"
    }
  ];

  return (
    <section id="opportunities" className="py-24 bg-[#0B101B] border-t border-zinc-800/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Phase 1 • Job Discovery
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Real-Time Job Opportunities Nearby
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            No endless searching or bidding. Qualified jobs within your service radius appear directly on your dashboard in real time.
          </p>
        </div>

        {/* 3-Column Operational Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="bg-[#0F1623] border border-zinc-800/90 rounded-2xl p-6 relative hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-zinc-600">0{idx + 1}</span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">
                  {step.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Interactive Preview Panel */}
        <div className="bg-[#080C14] border border-zinc-800 rounded-2xl p-6 lg:p-8 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-xl font-bold text-white">What a job card tells you instantly</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Every broadcast includes all the critical operational variables so you never have to guess before heading out to a site.
            </p>
            <ul className="space-y-2.5 pt-2">
              {[
                "Exact street address and map route distance",
                "Guaranteed partner earning value before acceptance",
                "Customer job notes, photos, and problem description",
                "Scheduled appointment slot or immediate arrival expectation"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 bg-[#0F1623] border border-emerald-500/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-bold uppercase text-emerald-400">Incoming Broadcast</span>
              </div>
              <span className="text-xs text-zinc-400">Expires in 28s</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base font-bold text-white">AC Jet Deep Cleaning (Split 1.5 Ton)</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Appliance Service • 45 min est.</p>
                </div>
                <span className="text-xl font-extrabold text-emerald-400">₹799</span>
              </div>

              <div className="bg-zinc-900/90 rounded-lg p-3 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>Flat 402, Green Glen Layout, Bellandur (3.1 km)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  <span>Scheduled: Today • 11:30 AM</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Accept Job
              </button>
              <button className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm font-medium rounded-lg transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
