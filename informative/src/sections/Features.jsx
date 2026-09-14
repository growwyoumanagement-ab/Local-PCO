import { motion } from "framer-motion";
import { Radio, Shield, TrendingUp, Clock, Lock, Star } from "lucide-react";
import { SectionHeading } from "../components/ui/SectionHeading";

export function Features() {
  const features = [
    {
      icon: <Radio size={24} className="text-[#FF5C1A]" />,
      title: "Multi-Vendor Broadcast",
      desc: "Your request reaches up to 10 verified vendors simultaneously. Competition means better pricing for you."
    },
    {
      icon: <Shield size={24} className="text-[#00D4FF]" />,
      title: "Manual KYC Verification",
      desc: "Every vendor is manually reviewed by our team before going live. No bots, no fake profiles."
    },
    {
      icon: <TrendingUp size={24} className="text-[#00E676]" />,
      title: "Priority Scoring System",
      desc: "Our algorithm surfaces the best, closest, highest-rated vendors first. You always get the best options."
    },
    {
      icon: <Clock size={24} className="text-[#FF5C1A]" />,
      title: "ASAP to Scheduled",
      desc: "Need someone now? Or planning ahead? Set urgency — ASAP (within 2 hrs), Today, or Schedule for later."
    },
    {
      icon: <Lock size={24} className="text-[#00D4FF]" />,
      title: "Customer Privacy First",
      desc: "Your phone number is never shown publicly. Only revealed when a verified vendor is ready to call you."
    },
    {
      icon: <Star size={24} className="text-[#00E676]" />,
      title: "Rating & Accountability",
      desc: "Rate every job. Ratings affect vendor lead priority — keeping quality high across the platform."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#FF5C1A] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading 
          title="Built for Speed. Built for Trust." 
          subtitle="We've redesigned the service experience from the ground up." 
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: '0 0 30px rgba(0,212,255,0.15)' }}
              className="glass p-8 rounded-2xl glass-hover bg-[#0F1623]/80 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#1E2D42] border border-[#2A3A55] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-[#8FA3BF] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
