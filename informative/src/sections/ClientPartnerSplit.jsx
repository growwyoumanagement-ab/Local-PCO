import { 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Wrench, 
  Zap, 
  Wind, 
  Sparkles,
  ShieldCheck
} from "lucide-react";

export function ClientPartnerSplit({ onOpenClientModal, onOpenPartnerModal }) {
  return (
    <section id="partners" className="py-12 sm:py-16 md:py-20 bg-[#FAF8F5] border-t border-[#E8E4DA]/80 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          
          {/* ================= LEFT: FOR CLIENTS ================= */}
          <div className="flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 md:p-9 border border-[#E8E4DA] editorial-shadow-lg relative overflow-hidden">
            {/* Top Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1ED] text-[#0E382C] text-[11px] font-bold uppercase tracking-wider mb-4">
                For Clients
              </div>

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight mb-3">
                Need something <br className="hidden sm:inline" />
                fixed at home?
              </h3>

              <p className="text-[#526058] text-sm sm:text-base leading-relaxed mb-6 font-light">
                Find trusted local professionals for all your home service needs with upfront pricing and verified background credentials.
              </p>

              {/* Benefits Checklist */}
              <div className="space-y-2.5 mb-7">
                {[
                  "Verified & rated professionals",
                  "Transparent upfront pricing with zero surprises",
                  "Real-time GPS arrival tracking",
                  "Secure digital payments with satisfaction guarantee"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#0E382C] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#1B2620]">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenClientModal}
                className="inline-flex items-center gap-2 bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow cursor-pointer mb-6"
              >
                <span>Find a service</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Realistic Client App Phone Mockup */}
            <div className="relative mt-2 pt-5 border-t border-[#E8E4DA]/60">
              <div className="relative mx-auto max-w-[320px] bg-[#FAF8F5] rounded-[32px] p-2.5 border-[3.5px] border-[#222E28] ring-1 ring-black/10 shadow-xl overflow-hidden">
                {/* Phone Speaker Notch */}
                <div className="w-20 h-3 bg-[#222E28] rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                  <div className="w-7 h-0.5 bg-[#4A5750] rounded-full"></div>
                </div>

                {/* In-App Screen Content */}
                <div className="bg-white rounded-[24px] p-4 border border-[#E8E4DA] text-left">
                  {/* Greeting & Location */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] text-[#7E8C83] block">Welcome back,</span>
                      <span className="text-sm font-bold text-[#1B2620]">Priya Sharma</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#0E382C] bg-[#EBF1ED] px-2.5 py-1 rounded-full">
                      <MapPin size={11} />
                      <span>Agra, UP</span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-xs text-[#7E8C83] mb-3">
                    <Search size={14} className="text-[#0E382C]" />
                    <span>What service do you need?</span>
                  </div>

                  {/* Category Pills */}
                  <div className="grid grid-cols-4 gap-1.5 mb-4 text-center">
                    {[
                      { name: "AC", icon: Wind, active: true },
                      { name: "Plumbing", icon: Wrench },
                      { name: "Electrical", icon: Zap },
                      { name: "Cleaning", icon: Sparkles },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div
                          key={cat.name}
                          className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-colors ${
                            cat.active
                              ? "bg-[#0E382C] text-white border-[#0E382C]"
                              : "bg-[#FAF8F5] text-[#526058] border-[#E8E4DA]"
                          }`}
                        >
                          <Icon size={14} />
                          <span className="text-[10px] font-semibold">{cat.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Top Professionals List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1B2620]">
                      <span>Top Professionals Near You</span>
                      <span className="text-[10px] text-[#0E382C]">See all</span>
                    </div>

                    {/* Specialist 1 */}
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#0E382C] text-white flex items-center justify-center font-bold text-xs">
                          RS
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1B2620]">Rohit Sharma</span>
                            <span className="text-[10px] font-semibold text-[#0E382C] flex items-center">
                              ★ 4.9
                            </span>
                          </div>
                          <span className="text-[10px] text-[#7E8C83] block">
                            AC Technician • 2.4 km away
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={onOpenClientModal}
                        className="bg-[#0E382C] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#165342]"
                      >
                        Book
                      </button>
                    </div>

                    {/* Specialist 2 */}
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#C28E46] text-white flex items-center justify-center font-bold text-xs">
                          AV
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1B2620]">Amit Verma</span>
                            <span className="text-[10px] font-semibold text-[#0E382C] flex items-center">
                              ★ 4.7
                            </span>
                          </div>
                          <span className="text-[10px] text-[#7E8C83] block">
                            Electrician • 3.1 km away
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={onOpenClientModal}
                        className="bg-[#FAF8F5] border border-[#0E382C] text-[#0E382C] text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* ================= RIGHT: FOR SERVICE PARTNERS ================= */}
          <div className="flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 md:p-9 border border-[#E8E4DA] editorial-shadow-lg relative overflow-hidden">
            {/* Top Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0DC] text-[#C28E46] text-[11px] font-bold uppercase tracking-wider mb-4">
                For Service Partners
              </div>

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight mb-3">
                Your next job is closer <br className="hidden sm:inline" />
                than you think.
              </h3>

              <p className="text-[#526058] text-sm sm:text-base leading-relaxed mb-6 font-light">
                Get real job opportunities in your area, manage every step with built-in navigation and photo proof, and keep track of guaranteed payouts.
              </p>

              {/* Benefits Checklist */}
              <div className="space-y-2.5 mb-7">
                {[
                  "Receive nearby broadcast alerts with transparent guaranteed fees",
                  "Turn-by-turn customer navigation and automatic arrival check-in",
                  "In-app photo proof submission to complete work securely",
                  "Direct bank settlements with zero delayed invoices"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#0E382C] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#1B2620]">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenPartnerModal}
                className="inline-flex items-center gap-2 bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow cursor-pointer mb-6"
              >
                <span>Join as a partner</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Split Visual: Partner Phone Mockup + Smiling Technician */}
            <div className="relative mt-2 pt-5 border-t border-[#E8E4DA]/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* Partner App Phone Mockup */}
                <div className="relative mx-auto w-full max-w-[270px] bg-[#FAF8F5] rounded-[28px] p-2.5 border-[3.5px] border-[#222E28] ring-1 ring-black/10 shadow-xl">
                  {/* Phone Speaker Notch */}
                  <div className="w-16 h-3 bg-[#222E28] rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-[#4A5750] rounded-full"></div>
                  </div>

                  {/* In-App Screen Content */}
                  <div className="bg-white rounded-[20px] p-3 border border-[#E8E4DA]">
                    {/* Header with Switcher Tabs */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E8E4DA]">
                      <span className="text-xs font-bold text-[#1B2620]">Available Jobs</span>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#0E382C] text-white font-bold">New (1)</span>
                        <span className="px-1.5 py-0.5 text-[#7E8C83]">Active</span>
                      </div>
                    </div>

                    {/* Job Card 1 (AC Repair) */}
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#0E382C] shadow-sm mb-2 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#0E382C] uppercase tracking-wider">
                          AC Repair
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#1B2620]">₹800</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[#526058] mb-1">
                        <MapPin size={10} className="text-[#0E382C]" />
                        <span>Shastri Nagar, Agra • 2.4 km</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[#7E8C83] mb-2">
                        <Clock size={10} />
                        <span>Today • 11:30 AM Slot</span>
                      </div>

                      <button
                        onClick={onOpenPartnerModal}
                        className="w-full bg-[#0E382C] hover:bg-[#165342] text-white text-[11px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Accept Job</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>

                    {/* Job Card 2 (Plumbing) */}
                    <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#1B2620]">
                          Plumbing — Tap Leakage
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#1B2620]">₹600</span>
                      </div>
                      <span className="text-[9px] text-[#7E8C83] block mt-0.5">
                        Civil Lines, Agra • 3.1 km away
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smiling Technician Photo Box */}
                <div className="relative rounded-2xl overflow-hidden border border-[#E8E4DA] aspect-[4/5] sm:aspect-auto sm:h-full min-h-[220px]">
                  <img
                    src="/images/partner-tech.jpg"
                    alt="Verified Local PCO Partner Technician"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-[#E8E4DA] text-left shadow-sm">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#0E382C]" />
                      <div>
                        <span className="text-xs font-bold text-[#1B2620] block leading-none">
                          Verified Specialist
                        </span>
                        <span className="text-[10px] text-[#7E8C83] font-mono">
                          ID: PCO-AGR-4092
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
