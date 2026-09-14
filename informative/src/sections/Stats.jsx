import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { WorldMap } from "../components/ui/WorldMap";
import { motion } from "framer-motion";
import { Users, CheckCircle, MapPin, Star, Zap, Heart } from "lucide-react";

export function Stats() {
  const stats = [
    {
      value: 10000,
      suffix: "+",
      label: "Verified Vendors",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400"
    },
    {
      value: 50000,
      suffix: "+",
      label: "Service Requests",
      icon: CheckCircle,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400"
    },
    {
      value: 20,
      suffix: "+",
      label: "Cities Active",
      icon: MapPin,
      color: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-400"
    },
    {
      value: 4.8,
      suffix: "/5",
      label: "Vendor Rating",
      icon: Star,
      decimals: 1,
      color: "from-yellow-500/20 to-orange-500/20",
      iconColor: "text-yellow-400"
    },
    {
      prefix: "< ",
      value: 5,
      suffix: " min",
      label: "Fast Response",
      icon: Zap,
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400"
    },
    {
      value: 98,
      suffix: "%",
      label: "Satisfaction",
      icon: Heart,
      color: "from-rose-500/20 to-red-500/20",
      iconColor: "text-rose-400"
    }
  ];

  const mapDots = [
    { start: { lat: 28.6139, lng: 77.2090, label: "Delhi" }, end: { lat: 26.9124, lng: 75.7873, label: "Jaipur" } },
    { start: { lat: 19.0760, lng: 72.8777, label: "Mumbai" }, end: { lat: 18.5204, lng: 73.8567, label: "Pune" } },
    { start: { lat: 12.9716, lng: 77.5946, label: "Bangalore" }, end: { lat: 13.0827, lng: 80.2707, label: "Chennai" } },
    { start: { lat: 17.3850, lng: 78.4867, label: "Hyderabad" }, end: { lat: 12.9716, lng: 77.5946, label: "Bangalore" } },
    { start: { lat: 22.5726, lng: 88.3639, label: "Kolkata" }, end: { lat: 28.6139, lng: 77.2090, label: "Delhi" } },
    { start: { lat: 26.8467, lng: 80.9462, label: "Lucknow" }, end: { lat: 28.6139, lng: 77.2090, label: "Delhi" } },
    { start: { lat: 22.7196, lng: 75.8577, label: "Indore" }, end: { lat: 19.0760, lng: 72.8777, label: "Mumbai" } },
    { start: { lat: 27.1767, lng: 78.0081, label: "Agra" }, end: { lat: 28.6139, lng: 77.2090, label: "Delhi" } },
    { start: { lat: 30.7333, lng: 76.7794, label: "Chandigarh" }, end: { lat: 28.6139, lng: 77.2090, label: "Delhi" } }
  ];

  return (
    <section className="py-20 md:py-28 bg-[#0F1623] border-y border-[#1E2D42] relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F1623] via-transparent to-[#0F1623] z-0"></div>

      {/* Animated Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-[#FF5C1A] text-sm font-bold tracking-[0.2em] uppercase mb-4"
            >
              <div className="w-8 h-[2px] bg-[#FF5C1A]"></div>
              Real-time Impact
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold font-display text-white leading-tight"
            >
              The Network That <span className="text-gradient-primary italic">Powers</span> India
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#8FA3BF] text-lg max-w-sm font-medium leading-relaxed"
          >
            Leveraging cutting-edge logistics to connect you with verified professionals in seconds.
          </motion.p>
        </div>

        {/* Side-by-side Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* LEFT — Stats Bento Grid (45%) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                className="relative group overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-[#1E2D42]/50 to-transparent hover:from-[#FF5C1A]/20 transition-all duration-500"
              >
                <div className="relative h-full bg-[#0F1623]/80 backdrop-blur-md rounded-[23px] p-6 flex flex-col items-start gap-4">
                  {/* Subtle Background Glow on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  <div className="relative z-10 w-full">
                    {/* Icon Container */}
                    <div className={`w-12 h-12 rounded-2xl bg-[#1E2D42]/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon size={24} className={`${stat.iconColor} group-hover:drop-shadow-[0_0_8px_currentColor] transition-all`} />
                    </div>

                    <div className="space-y-1">
                      <div className="text-3xl font-bold font-mono text-white tracking-tighter flex items-baseline gap-1">
                        <span className="text-sm text-[#FF5C1A] opacity-80">{stat.prefix}</span>
                        <AnimatedCounter value={stat.value} decimals={stat.decimals || 0} className="text-white" />
                        <span className="text-xl text-[#FF5C1A] font-mono">{stat.suffix}</span>
                      </div>
                      <p className="text-[#8FA3BF] text-sm font-semibold tracking-wide uppercase">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RIGHT — India Map & Interactive Visualization (55%) */}
          <div className="lg:col-span-7 h-[500px] lg:h-[600px] relative rounded-[40px] border border-[#1E2D42]/40 bg-[#0A0F1A]/40 p-4 group">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#FF5C1A]/20 rounded-tl-[40px]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#FF5C1A]/20 rounded-br-[40px]"></div>

            <div className="w-full h-full relative overflow-hidden rounded-[30px]">
              <WorldMap dots={mapDots} />
            </div>

            {/* Map Statistics Overlay */}
            <div className="absolute top-8 left-8 z-30 pointer-events-none">
              <div className="bg-[#0F1623]/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#FF5C1A] animate-ping"></div>
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Active Network Stream</span>
              </div>
            </div>

            {/* Hub Legend */}
            <div className="absolute bottom-8 left-8 right-8 z-30 flex flex-wrap gap-4 items-center justify-center sm:justify-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* <div className="bg-[#0F1623]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF5C1A]"></div>
                <span className="text-[10px] text-[#8FA3BF] font-bold uppercase">Pickup Points</span>
              </div>
              <div className="bg-[#0F1623]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D4FF]"></div>
                <span className="text-[10px] text-[#8FA3BF] font-bold uppercase">Central Hubs</span>
              </div> */}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
