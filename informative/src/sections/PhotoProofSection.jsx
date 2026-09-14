import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, CheckCircle, ShieldCheck, UploadCloud, AlertCircle } from "lucide-react";

export function PhotoProofSection() {
  const proofBenefits = [
    {
      title: "Direct In-App Camera & Gallery",
      desc: "Snap job photos directly with your phone camera or select recent images from your device gallery in seconds.",
      icon: <Camera size={20} className="text-emerald-400" />
    },
    {
      title: "Clear Completion Verification",
      desc: "Before/after work photos eliminate disputes and give both customer and partner transparent confirmation.",
      icon: <ShieldCheck size={20} className="text-blue-400" />
    },
    {
      title: "Automatic Quality Cloud Sync",
      desc: "Images upload securely in the background with immediate visual upload badges and retry support if connectivity drops.",
      icon: <UploadCloud size={20} className="text-teal-400" />
    }
  ];

  return (
    <section id="photo-proof" className="py-24 bg-[#0B101B] border-t border-zinc-800/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Phase 3 • Quality & Proof
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Photo Proof & Completion Tracking
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Verify every completed task with visual evidence. High reliability, zero paperwork, and instantaneous validation before payout trigger.
          </p>
        </div>

        {/* 2-Column: Features + Interactive Preview */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            {proofBenefits.map((item, idx) => (
              <div key={idx} className="bg-[#0F1623] border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 bg-[#0F1623] border border-zinc-800 rounded-2xl p-6 lg:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div>
                <h4 className="text-base font-bold text-white">Upload Completion Proof</h4>
                <p className="text-xs text-zinc-400">Job #REQ-7281 • Drain Clearance</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                2 Photos Added
              </span>
            </div>

            {/* Proof Thumbnails Mockup */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 flex flex-col items-center justify-center text-center p-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <CheckCircle size={18} />
                </div>
                <span className="text-xs font-semibold text-white">Work Area Before</span>
                <span className="text-[10px] text-zinc-400">Uploaded 10:42 AM</span>
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden border border-emerald-500/40 bg-zinc-900 flex flex-col items-center justify-center text-center p-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <CheckCircle size={18} />
                </div>
                <span className="text-xs font-semibold text-white">Work Area After</span>
                <span className="text-[10px] text-zinc-400">Uploaded 11:15 AM</span>
              </div>
            </div>

            <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800 text-xs text-zinc-300 mb-5 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-400" />
                Proof Requirements Satisfied
              </p>
              <p className="text-zinc-400 text-[11px]">
                Both before and after photos confirmed. Partner notes attached. Ready for instant completion submission.
              </p>
            </div>

            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors">
              Submit Completion & Trigger Settlement
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
