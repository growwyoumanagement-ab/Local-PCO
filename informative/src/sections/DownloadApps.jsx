import { Download, CheckCircle2 } from "lucide-react";

export function DownloadApps() {
  return (
    <section id="download" className="py-12 sm:py-16 md:py-20 bg-[#FAF8F5] border-t border-[#E8E4DA]/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -left-20 w-[30vw] h-[30vw] rounded-full bg-[#EBF1ED] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] rounded-full bg-[#FAF0DC]/60 blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#4E715E] block mb-2.5">
            Take Local PCO Everywhere
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight mb-3">
            Your workday. <br />
            In your pocket.
          </h2>
          <p className="text-sm sm:text-base text-[#526058] font-light max-w-xl mx-auto">
            Download the native Android app for a faster, simpler, and more reliable home-service experience.
          </p>
        </div>

        {/* Dual App Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          
          {/* Client App Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4DA] editorial-shadow-lg flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-13 h-13 rounded-2xl bg-[#EBF1ED] border border-[#E8E4DA] p-2 flex items-center justify-center shrink-0">
                  <img src="/client.png" alt="Local PCO Client App" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif-display font-bold text-[#1B2620]">
                    Local PCO Client
                  </h3>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#0E382C] block">
                    Homeowner & Resident Edition
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#526058] leading-relaxed mb-6 font-light">
                Discover qualified local technicians, view real customer ratings, track live GPS arrivals, and inspect mandatory work proof before release of payment.
              </p>

              <div className="space-y-2 mb-7">
                {[
                  "One-tap booking for 9 core categories",
                  "Live specialist location & arrival updates",
                  "Before & after photo proof inspection",
                  "UPI, Card & NetBanking escrow payment"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-[#526058]">
                    <CheckCircle2 size={14} className="text-[#0E382C]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <a
                href="/client-app.apk"
                download
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
              >
                <Download size={15} />
                <span>Download Client APK (68 MB)</span>
              </a>
              <span className="text-[11px] text-[#7E8C83] text-center block mt-2 font-sans font-medium">
                Android 8.0+ • Standalone install
              </span>
            </div>
          </div>

          {/* Partner App Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E4DA] editorial-shadow-lg flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-13 h-13 rounded-2xl bg-[#FAF0DC] border border-[#E8E4DA] p-2 flex items-center justify-center shrink-0">
                  <img src="/partner.png" alt="Local PCO Partner App" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif-display font-bold text-[#1B2620]">
                    Local PCO Partner
                  </h3>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#C28E46] block">
                    Field Operations Workspace
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#526058] leading-relaxed mb-6 font-light">
                Discover instant nearby broadcast jobs, navigate to client premises, capture mandatory before/after photo proof, and receive immediate OTP-verified bank withdrawals.
              </p>

              <div className="space-y-2 mb-7">
                {[
                  "Real-time 30-second broadcast acceptance",
                  "Turn-by-turn routing with client contact",
                  "In-app camera proof verification engine",
                  "Direct 2FA bank account payouts"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-[#526058]">
                    <CheckCircle2 size={14} className="text-[#0E382C]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <a
                href="/partner-app.apk"
                download
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#1B2620] hover:bg-[#0E382C] text-white text-sm font-semibold py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
              >
                <Download size={15} />
                <span>Download Partner APK (66 MB)</span>
              </a>
              <span className="text-[11px] text-[#7E8C83] text-center block mt-2 font-sans font-medium">
                Android 8.0+ • Field Verified Build
              </span>
            </div>
          </div>

        </div>

        {/* Community Trust Badge Bridge */}
        <div className="mt-8 sm:mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8E4DA] text-xs font-medium text-[#526058] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            <span>Real People • Strong Homes • Better Communities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
