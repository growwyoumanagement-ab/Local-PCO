import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function TrustStrip() {
  const metrics = [
    {
      value: "10K+",
      label: "Service Partners",
      detail: "Verified professionals",
    },
    {
      value: "20+",
      label: "Cities",
      detail: "Active operational zones",
    },
    {
      value: "4.8",
      hasStar: true,
      label: "Average Rating",
      detail: "From 45,000+ completed jobs",
    },
    {
      value: "< 5 min",
      label: "Response Time",
      detail: "Median dispatch time",
    },
    {
      value: "98%",
      label: "Customer Satisfaction",
      detail: "Verified completion rate",
    },
  ];

  return (
    <section className="py-10 md:py-12 bg-[#FAF8F5] border-y border-[#E8E4DA]/80">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 w-full lg:w-auto flex-1">
            {metrics.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-serif-display text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#1B2620] tracking-tight leading-none">
                    {item.value}
                  </span>
                  {item.hasStar && (
                    <Star size={18} className="fill-[#C28E46] text-[#C28E46] shrink-0" />
                  )}
                </div>
                <span className="text-xs font-semibold text-[#1B2620] uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-[11px] text-[#7E8C83] font-light mt-0.5">
                  {item.detail}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Editorial Handwritten Brand Note */}
          <div className="w-full lg:w-auto lg:border-l lg:border-[#E8E4DA] lg:pl-10 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
            <span className="font-handwriting text-2xl md:text-3xl text-[#0E382C] leading-snug">
              A stronger neighbourhood <br className="hidden sm:inline" />
              for a better tomorrow
            </span>
            <div className="w-20 h-0.5 bg-[#0E382C] rounded-full mt-2 opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
