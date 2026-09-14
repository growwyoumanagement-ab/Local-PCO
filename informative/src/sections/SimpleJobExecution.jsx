import { motion } from "framer-motion";
import { Check, ArrowRight, Navigation, MapPin, Wrench, Camera, CheckCircle2 } from "lucide-react";

export function SimpleJobExecution() {
  const lifecycleSteps = [
    {
      status: "Accepted",
      title: "Job Accepted",
      action: "Start Navigation",
      desc: "Instant turn-by-turn routing directly to the client's verified address.",
      icon: <Navigation size={20} className="text-blue-400" />,
      stateBadge: "On The Way"
    },
    {
      status: "Arrived",
      title: "Arrived at Location",
      action: "Confirm Arrival",
      desc: "Client gets an automated notification that their specialist has reached the premises.",
      icon: <MapPin size={20} className="text-amber-400" />,
      stateBadge: "At Premises"
    },
    {
      status: "In Progress",
      title: "Service Execution",
      action: "Start Job",
      desc: "Live job timer and safety guidelines keep the partner and client aligned throughout.",
      icon: <Wrench size={20} className="text-emerald-400" />,
      stateBadge: "Active Work"
    },
    {
      status: "Completed",
      title: "Proof & Sign-Off",
      action: "Submit Completion",
      desc: "Capture before/after photo proof and submit client sign-off to conclude the job.",
      icon: <Camera size={20} className="text-teal-400" />,
      stateBadge: "Completed"
    }
  ];

  return (
    <section id="execution" className="py-24 bg-[#080C14] border-t border-zinc-800/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Phase 2 • Job Execution
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Clear, Step-by-Step Job Lifecycle
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Never wonder what to do next. Local PCO guides field professionals through explicit operational states from departure to completed service.
          </p>
        </div>

        {/* State Machine Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lifecycleSteps.map((step, idx) => (
            <div 
              key={idx} 
              className="bg-[#0F1623] border border-zinc-800 rounded-2xl p-6 relative flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-800/80 text-zinc-300">
                    Step 0{idx + 1}
                  </span>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  {step.stateBadge}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Context Action:</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    {step.action}
                    <ArrowRight size={12} className="text-emerald-400" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
