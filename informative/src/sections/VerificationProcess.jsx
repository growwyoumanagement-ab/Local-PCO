import { motion } from "framer-motion";
import { FileText, Search, Users, Shield } from "lucide-react";
import { SectionHeading } from "../components/ui/SectionHeading";

export function VerificationProcess() {
  const steps = [
    {
      title: "Submit Application",
      desc: "Vendor submits their profile, service details, and government-issued documents via the app.",
      icon: <FileText size={24} className="text-[#00D4FF]" />
    },
    {
      title: "Document Review",
      desc: "Our internal verification team manually reviews ID proof and address proof — no automated shortcuts.",
      icon: <Search size={24} className="text-[#FF5C1A]" />
    },
    {
      title: "Background Check",
      desc: "Service history, portfolio, and submitted information are cross-verified by a trained verifier.",
      icon: <Users size={24} className="text-[#00D4FF]" />
    },
    {
      title: "Approved & Activated",
      desc: "Approved vendors receive their Verified Badge and start receiving leads immediately.",
      icon: <Shield size={24} className="text-[#00E676]" />
    }
  ];

  return (
    <section className="py-24 relative bg-[#0F1623]/50">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading 
          title="Every Vendor. Manually Verified." 
          subtitle="Our KYC process ensures only genuine professionals reach you." 
        />

        <div className="relative max-w-4xl mx-auto mt-20">
          {/* Vertical Line */}
          <div className="absolute left-[39px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#1E2D42]">
            <motion.div 
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full bg-gradient-to-b from-[#FF5C1A] via-[#00D4FF] to-[#00E676]"
            ></motion.div>
          </div>

          <div className="flex flex-col gap-12">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`relative flex items-center md:justify-between ${isEven ? 'flex-row' : 'flex-row md:flex-row-reverse'}`}>
                  
                  {/* Empty space for desktop alternating layout */}
                  <div className="hidden md:block md:w-[45%]"></div>
                  
                  {/* Icon Circle */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.4, type: "spring" }}
                    className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-20 h-20 rounded-full bg-[#080C14] border-4 border-[#1E2D42] flex items-center justify-center z-10 shrink-0"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#1E2D42] flex items-center justify-center">
                      {step.icon}
                    </div>
                  </motion.div>

                  {/* Content Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 50 : -50, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.4 + 0.2, duration: 0.5 }}
                    className={`ml-28 md:ml-0 md:w-[45%] glass p-6 rounded-2xl ${idx === steps.length - 1 ? 'border-[#00E676]/30 shadow-[0_0_20px_rgba(0,230,118,0.1)]' : ''}`}
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[#8FA3BF] leading-relaxed text-sm md:text-base">{step.desc}</p>
                    
                    {idx === steps.length - 1 && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="animate-pulse w-3 h-3 rounded-full bg-[#00E676]"></div>
                        <span className="text-[#00E676] text-sm font-bold uppercase tracking-wider">Verification Complete</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
