import { useState } from "react";
import { ShieldCheck, CheckCircle2, Camera, Calendar, MapPin } from "lucide-react";

export function BeforeAfterProof() {
  const [activeTab, setActiveTab] = useState("after");

  return (
    <section id="proof" className="py-12 sm:py-16 md:py-20 bg-[#FAF8F5] border-t border-[#E8E4DA]/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-5">
            <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#4E715E] block mb-2.5">
              Visual Work Verification
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight mb-4">
              Show the work. <br />
              Close the job.
            </h2>

            <p className="text-sm sm:text-base text-[#526058] font-light leading-relaxed mb-7">
              No guessing, no disputes. Local PCO requires service partners to upload high-resolution before & after photographs before marking any service complete.
            </p>

            {/* Verification Features */}
            <div className="space-y-3.5 mb-7">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center shrink-0 mt-0.5">
                  <Camera size={15} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B2620]">Dual Timestamped Capture</h4>
                  <p className="text-xs text-[#526058] mt-0.5">
                    Images are logged with exact GPS coordinates and network timestamps directly through the partner camera.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B2620]">Zero Payment Release Without Proof</h4>
                  <p className="text-xs text-[#526058] mt-0.5">
                    Clients inspect photo verification on their phone before any funds are settled from escrow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B2620]">Permanent Cloud Proof Archive</h4>
                  <p className="text-xs text-[#526058] mt-0.5">
                    Both client and partner retain encrypted proof records for warranty and service guarantee coverage.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4DA] text-xs font-medium text-[#1B2620] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>100% verified work across 45,000+ completed bookings</span>
            </div>
          </div>

          {/* Right Interactive Before / After Visual */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E4DA] editorial-shadow-lg">
              
              {/* Tab Switcher */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E4DA]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("before")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "before"
                        ? "bg-[#1B2620] text-white"
                        : "bg-[#FAF8F5] text-[#526058] hover:text-[#1B2620]"
                    }`}
                  >
                    Before Service
                  </button>
                  <button
                    onClick={() => setActiveTab("after")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "after"
                        ? "bg-[#0E382C] text-white"
                        : "bg-[#FAF8F5] text-[#526058] hover:text-[#1B2620]"
                    }`}
                  >
                    After Service (Verified ✓)
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#7E8C83]">
                  <MapPin size={12} className="text-[#0E382C]" />
                  <span>Job #PCO-8910</span>
                </div>
              </div>

              {/* Photo Display Card */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#F4F1EA] border border-[#E8E4DA]">
                <img
                  src={activeTab === "before" ? "/images/proof-before.jpg" : "/images/proof-after.jpg"}
                  alt={activeTab === "before" ? "Service problem before repair" : "Service completed after repair"}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />

                {/* Status Overlay Stamp */}
                <div className="absolute top-3.5 left-3.5">
                  {activeTab === "before" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                      Before Inspection (Initial State)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E382C]/90 backdrop-blur-md text-white text-xs font-semibold shadow-md">
                      <CheckCircle2 size={13} className="text-[#A7F3D0]" />
                      Verified Resolution (Sign-Off Approved)
                    </span>
                  )}
                </div>

                {/* Audit Watermark */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-[#E8E4DA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#526058]">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#0E382C]" />
                    <span>Captured: 15 Sep 2026 • 12:14 PM</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[#1B2620] font-semibold">
                    <span>GPS: 27.1767° N, 78.0081° E</span>
                    <span className="text-[#0E382C]">SHA-256 Verified</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Caption */}
              <div className="mt-3.5 pt-2.5 flex items-center justify-between text-xs text-[#7E8C83]">
                <span>Tap tabs above to inspect real-time photographic resolution</span>
                <span className="font-mono text-[#0E382C] font-semibold text-[11px]">Local PCO Camera Engine</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
