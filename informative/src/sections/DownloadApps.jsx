import { motion } from "framer-motion";
import { Download, Smartphone, Shield, Star, MapPin, Briefcase, Users, TrendingUp, Clock } from "lucide-react";
import { SectionHeading } from "../components/ui/SectionHeading";

const AndroidIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 2.237a.625.625 0 0 0-.857.228l-1.066 1.845a7.187 7.187 0 0 0-7.2 0L7.334 2.465a.627.627 0 0 0-1.085.629L7.3 4.907A7.209 7.209 0 0 0 3.6 11.1h16.8a7.209 7.209 0 0 0-3.7-6.193l1.051-1.841a.625.625 0 0 0-.228-.829zM8.4 8.4a.9.9 0 1 1 .9-.9.9.9 0 0 1-.9.9zm7.2 0a.9.9 0 1 1 .9-.9.9.9 0 0 1-.9.9zM3.6 12.3v7.5a1.5 1.5 0 0 0 3 0v-7.5zm13.8 0v7.5a1.5 1.5 0 0 0 3 0v-7.5zm-12 0v8.1a1.8 1.8 0 0 0 1.8 1.8h1.5v3a1.5 1.5 0 0 0 3 0v-3h.6v3a1.5 1.5 0 0 0 3 0v-3h1.5a1.8 1.8 0 0 0 1.8-1.8v-8.1z"/>
  </svg>
);

const apps = [
  {
    name: "Local PCO Partner",
    subtitle: "Field Operations Workspace",
    description: "Accept real-time jobs, navigate to client premises, capture photo proof, and track instant bank payouts.",
    icon: "/partner.png",
    downloadUrl: "#download",
    fileSize: "64 MB • Android APK",
    accentColor: "#16A34A",
    accentBg: "rgba(22, 163, 74, 0.1)",
    accentBorder: "rgba(22, 163, 74, 0.3)",
    glowColor: "rgba(22, 163, 74, 0.15)",
    features: [
      { icon: <Briefcase size={16} />, text: "Real-time job broadcast alerts" },
      { icon: <Clock size={16} />, text: "Step-by-step lifecycle tracking" },
      { icon: <Shield size={16} />, text: "In-app camera photo proof upload" },
      { icon: <TrendingUp size={16} />, text: "Direct OTP-verified bank payouts" },
    ],
  },
  {
    name: "Local PCO Client",
    subtitle: "Customer Booking App",
    description: "Book verified local technicians, track specialist arrival in real-time, and inspect verified job completion proof.",
    icon: "/client.png",
    downloadUrl: "#download",
    fileSize: "62 MB • Android APK",
    accentColor: "#0284C7",
    accentBg: "rgba(2, 132, 199, 0.1)",
    accentBorder: "rgba(2, 132, 199, 0.3)",
    glowColor: "rgba(2, 132, 199, 0.15)",
    features: [
      { icon: <Users size={16} />, text: "Book verified specialists in minutes" },
      { icon: <MapPin size={16} />, text: "Live technician GPS presence" },
      { icon: <Shield size={16} />, text: "Photo work proof before payment" },
      { icon: <Star size={16} />, text: "Transparent pricing & upfront quotes" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function DownloadApps() {
  return (
    <section id="download" className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-1/3 -left-[15%] w-[35vw] h-[35vw] rounded-full bg-[#FF5C1A] opacity-[0.06] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-[15%] w-[30vw] h-[30vw] rounded-full bg-[#00D4FF] opacity-[0.05] blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          title={
            <>
              Download Our{" "}
              <span className="text-gradient-primary">Apps</span>
            </>
          }
          subtitle="Get started with Local PCO — connect with field service partners and manage jobs seamlessly."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-16"
        >
          {apps.map((app) => (
            <motion.div
              key={app.name}
              variants={cardVariants}
              className="group relative glass rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                borderColor: app.accentBorder,
              }}
              whileHover={{
                boxShadow: `0 0 40px ${app.glowColor}`,
                borderColor: app.accentColor,
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                  background: `linear-gradient(to right, transparent, ${app.accentColor}, transparent)`,
                }}
              ></div>

              <div className="p-8">
                {/* App header */}
                <div className="flex items-start gap-5 mb-6">
                  <div
                    className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shrink-0"
                    style={{
                      boxShadow: `0 4px 20px ${app.glowColor}`,
                    }}
                  >
                    <img
                      src={app.icon}
                      alt={`${app.name} icon`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-1">
                      {app.name}
                    </h3>
                    <span
                      className="text-xs font-bold tracking-wide uppercase px-2.5 py-1 rounded-full"
                      style={{
                        color: app.accentColor,
                        backgroundColor: app.accentBg,
                      }}
                    >
                      {app.subtitle}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#8FA3BF] text-sm leading-relaxed mb-6">
                  {app.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {app.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: app.accentBg,
                          color: app.accentColor,
                        }}
                      >
                        {feature.icon}
                      </div>
                      <span className="text-sm text-[#8FA3BF] group-hover:text-white transition-colors duration-300">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Download button & info */}
                <div className="flex flex-col gap-3">
                  <motion.a
                    href={app.downloadUrl}
                    download
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative inline-flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: app.accentColor,
                      boxShadow: `0 0 20px ${app.glowColor}`,
                    }}
                  >
                    <Download size={20} />
                    <span>Download APK</span>
                  </motion.a>

                  <div className="flex items-center justify-center gap-4 text-xs text-[#8FA3BF]">
                    <div className="flex items-center gap-1.5">
                      <AndroidIcon size={14} />
                      <span>Android</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-[#1E2D42]"></div>
                    <span>{app.fileSize}</span>
                    <div className="w-1 h-1 rounded-full bg-[#1E2D42]"></div>
                    <span>Free</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border-[#1E2D42]">
            <Smartphone size={16} className="text-[#00E676]" />
            <span className="text-sm text-[#8FA3BF]">
              Works on all Android devices • No Play Store required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
