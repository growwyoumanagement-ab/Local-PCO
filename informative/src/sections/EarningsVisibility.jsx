import { motion } from "framer-motion";
import { DollarSign, Calendar, TrendingUp, ArrowDownRight, Clock, Shield } from "lucide-react";

export function EarningsVisibility() {
  const metrics = [
    { label: "Today's Earnings", value: "₹2,850", detail: "4 jobs completed" },
    { label: "This Week", value: "₹18,400", detail: "26 jobs completed" },
    { label: "This Month", value: "₹72,650", detail: "98 jobs completed" },
    { label: "Available for Payout", value: "₹4,650", detail: "Ready to transfer" }
  ];

  return (
    <section id="earnings" className="py-24 bg-[#080C14] border-t border-zinc-800/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Phase 4 • Earnings Visibility
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            100% Transparent Partner Earnings
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Real-time balance calculations, itemized breakdown per completed service, and zero hidden deductions.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-[#0F1623] border border-zinc-800 rounded-2xl p-6 relative">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                {m.label}
              </span>
              <p className="text-3xl font-extrabold text-white mb-2">{m.value}</p>
              <span className="text-xs text-emerald-400 font-medium">{m.detail}</span>
            </div>
          ))}
        </div>

        {/* Breakdown Panel */}
        <div className="bg-[#0F1623] border border-zinc-800 rounded-2xl p-6 lg:p-8">
          <h3 className="text-lg font-bold text-white mb-4">Live Job Settlement Log</h3>
          <div className="space-y-3">
            {[
              { id: "JOB-4819", title: "Split AC Chemical Cleaning", amount: "+₹850", status: "Paid", time: "Today, 4:15 PM" },
              { id: "JOB-4818", title: "Bathroom Pipe Leakage Seal", amount: "+₹550", status: "Paid", time: "Today, 1:30 PM" },
              { id: "JOB-4815", title: "Main Switchboard Replacement", amount: "+₹1,450", status: "Processing", time: "Today, 11:00 AM" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-sm">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.id} • {item.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{item.amount}</p>
                  <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                    item.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
