import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CreditCard, MapPin, Headphones, Star } from "lucide-react";

export function Hero({ onOpenClientModal, onOpenPartnerModal }) {
  return (
    <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 bg-[#FAF8F5] overflow-hidden">
      {/* Ambient background warmth */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[#EBF1ED]/80 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/4 -left-[10vw] w-[30vw] h-[30vw] rounded-full bg-[#F2EFEB]/90 blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ================= LEFT COLUMN: EDITORIAL COPY ================= */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Kicker tag */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E382C]"></span>
              <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#4E715E]">
                Trusted professionals. Happier homes.
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-[68px] font-serif-display font-normal text-[#1B2620] leading-[1.02] tracking-tight mb-5"
            >
              Your home. <br />
              Your people. <br />
              <span className="text-[#0E382C]">Connected.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-[#526058] font-light leading-relaxed max-w-lg mb-7"
            >
              Book trusted local professionals, or turn your next service job into your next opportunity — all through one connected network.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <button
                onClick={onOpenClientModal}
                className="inline-flex items-center gap-2.5 bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold px-6 py-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <span>Find a service</span>
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenPartnerModal}
                className="inline-flex items-center gap-2 bg-white hover:bg-[#F4F1EA] text-[#1B2620] text-sm font-semibold px-6 py-3.5 rounded-full border border-[#E8E4DA] transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
              >
                <span>Become a partner</span>
              </button>
            </motion.div>

            {/* Trust Row (2x2 grid) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 gap-y-3 gap-x-4 pt-6 border-t border-[#E8E4DA] max-w-md"
            >
              <div className="flex items-center gap-2 text-xs text-[#526058]">
                <ShieldCheck size={15} className="text-[#0E382C] shrink-0" />
                <span className="font-medium text-[#1B2620]">Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#526058]">
                <CreditCard size={15} className="text-[#0E382C] shrink-0" />
                <span className="font-medium text-[#1B2620]">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#526058]">
                <MapPin size={15} className="text-[#0E382C] shrink-0" />
                <span className="font-medium text-[#1B2620]">Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#526058]">
                <Headphones size={15} className="text-[#0E382C] shrink-0" />
                <span className="font-medium text-[#1B2620]">24/7 Dedicated Support</span>
              </div>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: INTEGRATED PHOTO COMPOSITION ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-[#E8E4DA] bg-white editorial-shadow-lg aspect-[16/11] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/11] max-h-[580px] w-full">
              {/* Main Photo: Client on couch (left), foyer (center), Technician at door (right) */}
              <img
                src="/images/hero-connected.jpg"
                alt="Local PCO connecting homeowner and service partner"
                className="w-full h-full object-cover object-center"
              />

              {/* Connecting Green Route SVG Line: Clean arch across upper space */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                viewBox="0 0 800 550"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
              >
                <motion.path
                  d="M 170 140 C 260 50, 390 50, 470 140"
                  stroke="#0E382C"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
                />
              </svg>

              {/* Handwritten script note above client */}
              <div className="absolute top-4 sm:top-6 left-[6%] sm:left-[8%] z-30 font-handwriting text-base sm:text-lg text-[#0E382C] rotate-[-5deg] select-none">
                From your home...
              </div>

              {/* Handwritten script note above partner card in foyer */}
              <div className="absolute top-4 sm:top-6 left-[46%] sm:left-[50%] z-30 font-handwriting text-base sm:text-lg text-[#0E382C] rotate-[3deg] select-none hidden sm:block">
                ...To new opportunities
              </div>

              {/* Client Micro-Card: AC Service (Placed in top-left shelf area, completely above the sofa) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute top-[16%] sm:top-[18%] left-[4%] sm:left-[6%] z-30 bg-white/95 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-[#E8E4DA] shadow-md max-w-[170px] sm:max-w-[190px]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] overflow-hidden shrink-0">
                    <img src="/images/service-ac.jpg" alt="AC" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#1B2620] truncate">AC Service</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#EBF1ED] flex items-center justify-center text-[#0E382C]">
                        <ArrowRight size={7} />
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-[#526058]">
                      <Star size={9} className="fill-[#C28E46] text-[#C28E46]" />
                      <span className="font-bold text-[#1B2620]">4.8</span>
                      <span>(330+)</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-semibold text-[#0E382C]">
                      <span className="w-1 h-1 rounded-full bg-[#16A34A]"></span>
                      Available today
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Client Quote Badge (Placed in bottom-left corner below the couch, non-overlapping) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute bottom-3 sm:bottom-4 left-[4%] sm:left-[6%] z-30 bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 border border-[#E8E4DA] shadow-sm max-w-[180px] sm:max-w-[200px]"
              >
                <p className="text-[10px] sm:text-[11px] font-medium text-[#1B2620] leading-snug">
                  “Finally, a reliable professional!”
                </p>
                <p className="text-[9px] font-mono text-[#7E8C83] mt-0.5">
                  — Priya, Agra
                </p>
              </motion.div>

              {/* Partner Micro-Card: Placed in the OPEN FOYER SPACE (left of the doorway, NOT covering the technician!) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute top-[20%] sm:top-[22%] left-[44%] sm:left-[48%] md:left-[50%] z-30 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-[#E8E4DA] shadow-md max-w-[170px] sm:max-w-[190px]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#0E382C]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                    New Job
                  </span>
                  <span className="text-[9px] font-mono text-[#7E8C83]">2.4 km away</span>
                </div>

                <h4 className="text-xs font-bold text-[#1B2620]">AC Repair</h4>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="text-sm font-serif-display font-bold text-[#0E382C]">₹800</span>
                  <span className="text-[8px] sm:text-[9px] text-[#7E8C83]">fixed fee</span>
                </div>

                <button
                  onClick={onOpenPartnerModal}
                  className="w-full mt-1.5 bg-[#0E382C] hover:bg-[#165342] text-white text-[10px] font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Accept Job</span>
                  <ArrowRight size={10} />
                </button>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
