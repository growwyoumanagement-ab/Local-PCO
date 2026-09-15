import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  Users, 
  Clock, 
  Camera, 
  Smile, 
  ArrowRight
} from "lucide-react";

export function NeighborhoodJourney({ onOpenClientModal }) {
  const [activeStep, setActiveStep] = useState(2);

  const steps = [
    {
      number: "01",
      title: "Book a service",
      desc: "Tell us what you need and pick your preferred time.",
      icon: ClipboardList,
      pinTime: "Just now",
      detail: "Client selects category (e.g. AC repair), provides basic details or photos, and chooses an immediate or scheduled slot."
    },
    {
      number: "02",
      title: "Get matched",
      desc: "Connect with verified local professionals nearby.",
      icon: Users,
      pinTime: "30s response",
      detail: "The job broadcasts in real-time to qualified partners within a 5 km radius with transparent rates and client site address."
    },
    {
      number: "03",
      title: "Work gets done",
      desc: "Track progress in real time with arrival updates.",
      icon: Clock,
      pinTime: "2 min away",
      detail: "Partner navigates directly to premises. Check-in logs exact arrival time and starts the active service work timer."
    },
    {
      number: "04",
      title: "Show the result",
      desc: "Mandatory photo proof & verification before sign-off.",
      icon: Camera,
      pinTime: "Photo verified",
      detail: "Before and after photographs are captured in-app. Homeowner confirms job completion before payment is settled."
    },
    {
      number: "05",
      title: "Everyone wins",
      desc: "Happy homes. Instant bank settlements for partners.",
      icon: Smile,
      pinTime: "Settled to bank",
      detail: "Guaranteed satisfaction with immediate ledger credit and OTP-authenticated direct withdrawal into the partner's account."
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-[#FAF8F5] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#4E715E] block mb-2.5">
            Simple. Clear. Reliable.
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight mb-3">
            From request to resolution.
          </h2>
          <p className="text-sm sm:text-base text-[#526058] font-light max-w-2xl">
            A seamless, transparent experience engineered for both homeowners and service partners.
          </p>
        </div>

        {/* Artistic Interactive Neighborhood Map Canvas */}
        <div className="relative rounded-3xl bg-white border border-[#E8E4DA] p-5 sm:p-8 editorial-shadow-lg overflow-hidden">
          {/* Subtle architectural grid backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#E8E4DA_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>

          {/* Artistic Neighborhood Route Illustration (SVG) */}
          <div className="relative w-full h-[220px] sm:h-[260px] md:h-[290px] rounded-2xl bg-[#F7F5EE]/60 border border-[#ECE7DD] overflow-hidden flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 400"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Neighborhood Roads / Paths */}
              <path
                d="M 50 320 Q 250 340, 420 280 T 780 180 T 950 120"
                stroke="#E2DDD2"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d="M 50 320 Q 250 340, 420 280 T 780 180 T 950 120"
                stroke="#FAF8F5"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Side Road Branch */}
              <path
                d="M 420 280 Q 500 370, 680 340"
                stroke="#E2DDD2"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Minimalist Houses / Buildings in neighborhood */}
              {/* House 1: Request Origin */}
              <g transform="translate(100, 240)">
                <rect x="0" y="20" width="40" height="30" rx="3" fill={activeStep === 0 ? "#FFFFFF" : "#EAE5DA"} stroke={activeStep === 0 ? "#0E382C" : "#D5CFBF"} strokeWidth={activeStep === 0 ? "2" : "1.5"} />
                <polygon points="20,5 45,20 -5,20" fill="#0E382C" opacity={activeStep === 0 ? 1 : 0.75} />
              </g>

              {/* House 2: Partner Depot */}
              <g transform="translate(240, 200)">
                <rect x="0" y="25" width="48" height="35" rx="3" fill={activeStep === 1 ? "#FFFFFF" : "#EAE5DA"} stroke={activeStep === 1 ? "#0E382C" : "#D5CFBF"} strokeWidth={activeStep === 1 ? "2" : "1.5"} />
                <polygon points="24,8 54,25 -6,25" fill="#C28E46" opacity={activeStep === 1 ? 1 : 0.75} />
              </g>

              {/* House 3: Client Destination */}
              <g transform="translate(560, 130)">
                <rect x="0" y="25" width="55" height="40" rx="4" fill="#FFFFFF" stroke={activeStep >= 2 ? "#0E382C" : "#D5CFBF"} strokeWidth="2" />
                <polygon points="27.5,5 62,25 -7,25" fill="#0E382C" />
                <circle cx="27.5" cy="45" r="4" fill="#C28E46" />
              </g>

              {/* House 4 */}
              <g transform="translate(740, 100)">
                <rect x="0" y="20" width="42" height="30" rx="3" fill="#EAE5DA" stroke="#D5CFBF" strokeWidth="1.5" />
                <polygon points="21,5 47,20 -5,20" fill="#4E715E" opacity="0.8" />
              </g>

              {/* Trees */}
              {[
                [170, 260], [210, 275], [360, 220], [490, 230],
                [650, 120], [820, 110], [600, 310], [720, 300]
              ].map(([x, y], idx) => (
                <g key={idx} transform={`translate(${x}, ${y})`}>
                  <line x1="0" y1="12" x2="0" y2="20" stroke="#B0A895" strokeWidth="2" />
                  <circle cx="0" cy="8" r="10" fill="#D6E2D9" stroke="#B4C7BA" strokeWidth="1.2" />
                </g>
              ))}

              {/* Animated Journey Path */}
              <motion.path
                d="M 120 280 C 260 300, 380 270, 580 180 S 760 130, 890 120"
                stroke="#0E382C"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {/* Dynamic Reactive Map Pin that matches activeStep */}
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[42%] left-[10%] sm:left-[14%] z-20 bg-white rounded-2xl p-2.5 sm:p-3 border border-[#0E382C] shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E382C] text-white flex items-center justify-center shrink-0">
                    <ClipboardList size={15} />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1B2620] block leading-tight">Requirement posted</span>
                    <span className="text-[9px] sm:text-[10px] text-[#0E382C] font-semibold">Immediate slot selected</span>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[32%] left-[28%] sm:left-[32%] z-20 bg-white rounded-2xl p-2.5 sm:p-3 border border-[#0E382C] shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E382C] text-white flex items-center justify-center shrink-0">
                    <Users size={15} />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1B2620] block leading-tight">Broadcast sent</span>
                    <span className="text-[9px] sm:text-[10px] text-[#0E382C] font-semibold">5 km radius • 30s response</span>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[30%] left-[48%] sm:left-[54%] z-20 bg-white rounded-2xl p-2.5 sm:p-3 border border-[#0E382C] shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E382C] text-white flex items-center justify-center shrink-0">
                    <Clock size={15} />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1B2620] block leading-tight">Professional on the way</span>
                    <span className="text-[9px] sm:text-[10px] text-[#0E382C] font-semibold">2 min away • Live GPS Tracking</span>
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[18%] right-[8%] sm:right-[14%] z-20 bg-[#0E382C] text-white rounded-2xl p-2.5 sm:p-3 shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0E382C] flex items-center justify-center shrink-0">
                    <Camera size={15} />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] sm:text-xs font-bold text-white block leading-tight">Mandatory photo proof</span>
                    <span className="text-[9px] sm:text-[10px] text-[#A7F3D0] font-semibold">Before & after verified ✓</span>
                  </div>
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[20%] right-[8%] sm:right-[14%] z-20 bg-white rounded-2xl p-2.5 sm:p-3 border border-[#0E382C] shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                    <Smile size={15} />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] sm:text-xs font-bold text-[#1B2620] block leading-tight">Direct bank payout</span>
                    <span className="text-[9px] sm:text-[10px] text-[#16A34A] font-semibold">Escrow settled to bank</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Editorial Map Annotation */}
            <div className="absolute bottom-3 right-5 font-handwriting text-lg sm:text-xl text-[#526058] select-none hidden md:block">
              Local people, real impact
            </div>
          </div>

          {/* 5 Step Journey Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "bg-[#FAF8F5] border-[#0E382C] shadow-sm ring-1 ring-[#0E382C]"
                      : "bg-white border-[#E8E4DA] hover:border-[#B4C7BA]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isActive ? "bg-[#0E382C] text-white" : "bg-[#EBF1ED] text-[#0E382C]"
                      }`}>
                        <Icon size={17} />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#7E8C83]">
                        {step.number}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#1B2620] mb-1">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#526058] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E8E4DA]/60 flex items-center justify-between text-[11px] text-[#7E8C83]">
                    <span className="font-mono">{step.pinTime}</span>
                    <ArrowRight size={12} className={isActive ? "text-[#0E382C]" : "opacity-40"} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Step Details Expander */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E382C] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 sm:mt-0">
                  {steps[activeStep].number}
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-[#1B2620]">
                    {steps[activeStep].title} — In-depth overview
                  </h5>
                  <p className="text-xs text-[#526058] mt-0.5">
                    {steps[activeStep].detail}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenClientModal}
                className="inline-flex items-center gap-2 bg-[#0E382C] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#165342] transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                <span>Experience this flow</span>
                <ArrowRight size={12} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
