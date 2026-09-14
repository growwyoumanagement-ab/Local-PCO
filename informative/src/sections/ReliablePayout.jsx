import { motion } from "framer-motion";
import { Landmark, ShieldCheck, Zap, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";

export function ReliablePayout() {
  const payoutFeatures = [
    {
      title: "Direct Bank Account Linking",
      desc: "Link your verified primary savings or current bank account via IFSC with instant penny-drop validation.",
      icon: <Landmark size={20} className="text-emerald-400" />
    },
    {
      title: "OTP-Secured Withdrawals",
      desc: "Every payout trigger is secured by an SMS OTP sent directly to your registered partner phone number.",
      icon: <KeyRound size={20} className="text-blue-400" />
    },
    {
      title: "Real-Time Settlement Tracking",
      desc: "Track settlement stages explicitly: Available for payout → Processing → Paid to Bank. No guesswork.",
      icon: <Zap size={20} className="text-teal-400" />
    }
  ];

  return (
    <section id="payout" className="py-24 bg-[#0B101B] border-t border-zinc-800/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Phase 5 • Payout System
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Reliable Bank Payout Workflow
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Your earnings belong to you. Receive timely direct deposits to your bank account with complete cryptographic and audit traceability.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {payoutFeatures.map((f, idx) => (
            <div key={idx} className="bg-[#0F1623] border border-zinc-800 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Payout Pipeline Visual */}
        <div className="bg-[#080C14] border border-zinc-800 rounded-2xl p-6 lg:p-8">
          <h4 className="text-base font-bold text-white mb-6">Explicit Settlement Stages</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: "Available", desc: "Job signed off & verified", color: "text-emerald-400", border: "border-emerald-500/40" },
              { status: "Requested", desc: "Partner OTP confirmed", color: "text-blue-400", border: "border-blue-500/40" },
              { status: "Processing", desc: "Bank network clearing", color: "text-amber-400", border: "border-amber-500/40" },
              { status: "Paid", desc: "Deposited to bank account", color: "text-green-400", border: "border-green-500/40" }
            ].map((st, i) => (
              <div key={i} className={`p-4 rounded-xl bg-zinc-900/80 border ${st.border}`}>
                <span className={`text-sm font-bold block mb-1 ${st.color}`}>
                  {st.status}
                </span>
                <p className="text-xs text-zinc-400">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
