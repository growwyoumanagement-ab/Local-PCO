import { motion } from "framer-motion";
import { 
  Wrench, 
  Zap, 
  Wind, 
  Palette, 
  Axe, 
  Lock, 
  Sparkles, 
  Bug, 
  Video, 
  Focus, 
  Plug, 
  Droplets, 
  Package, 
  Home, 
  Leaf,
  Plus
} from "lucide-react";
import { SectionHeading } from "../components/ui/SectionHeading";

const categories = [
  { name: "Plumber", icon: <Wrench size={28} />, color: "#FF5C1A" },
  { name: "Electrician", icon: <Zap size={28} />, color: "#FFD60A" },
  { name: "AC Repair", icon: <Wind size={28} />, color: "#00D4FF" },
  { name: "Painter", icon: <Palette size={28} />, color: "#FF007A" },
  { name: "Carpenter", icon: <Axe size={28} />, color: "#B38B67" },
  { name: "Locksmith", icon: <Lock size={28} />, color: "#8E44AD" },
  { name: "Cleaning", icon: <Sparkles size={28} />, color: "#00E676" },
  { name: "Pest Control", icon: <Bug size={28} />, color: "#F1C40F" },
  { name: "CCTV", icon: <Video size={28} />, color: "#E74C3C" },
  { name: "Flooring", icon: <Focus size={28} />, color: "#2ECC71" },
  { name: "Appliances", icon: <Plug size={28} />, color: "#3498DB" },
  { name: "Waterproofing", icon: <Droplets size={28} />, color: "#00D4FF" },
  { name: "Movers", icon: <Package size={28} />, color: "#E67E22" },
  { name: "Interior", icon: <Home size={28} />, color: "#9B59B6" },
  { name: "Garden", icon: <Leaf size={28} />, color: "#27AE60" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

export function ServiceCategories() {
  return (
    <section id="services" className="py-24 relative overflow-hidden bg-[#080C14]">
      {/* Abstract Background Orbs */}
      <div className="absolute top-1/2 left-1/4 w-[30%] h-[30%] bg-[#FF5C1A]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#00D4FF]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading 
          title="Every Home Service, One Platform" 
          subtitle="Explore our 15+ premium categories — trusted experts, verified quality" 
          centered={true}
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-16"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-5 cursor-pointer border-[#1E2D42] hover:border-[#FF5C1A]/50 transition-all duration-300 h-full relative z-10 overflow-hidden shadow-xl shadow-black/20">
                
                {/* Icon Background Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-24 h-24 blur-[30px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>

                {/* Icon Container */}
                <div className="relative">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${cat.color}15`,
                      border: `1px solid ${cat.color}30`,
                      boxShadow: `0 8px 16px -4px ${cat.color}20` 
                    }}
                  >
                    <div style={{ color: cat.color }}>
                      {cat.icon}
                    </div>
                  </div>
                  
                  {/* Outer Orbitals (Visual only) */}
                  <div className="absolute inset-0 border border-white/5 rounded-2xl scale-[1.3] opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 pointer-events-none"></div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-white font-bold text-lg group-hover:text-white transition-colors uppercase tracking-wider">{cat.name}</h4>
                  <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-[#FF5C1A] to-transparent transition-all duration-500 mx-auto opacity-50"></div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Enhanced Coming Soon Card */}
          <motion.div
            variants={itemVariants}
            className="group glass p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-5 border-dashed border-[#1E2D42] bg-transparent h-full relative"
          >
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#1E2D42] flex items-center justify-center text-[#8FA3BF] group-hover:border-[#00D4FF]/50 transition-colors duration-500">
              <Plus size={24} className="group-hover:rotate-180 transition-transform duration-700" />
            </div>
            
            <div className="flex flex-col gap-1">
              <h4 className="text-[#8FA3BF] font-bold text-sm md:text-base uppercase tracking-tighter">More Services</h4>
              <p className="text-[#8FA3BF]/60 text-xs">Arriving Monthly</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
