import { motion } from "framer-motion";
import { Star, Clock, ArrowUpRight } from "lucide-react";

export function ServicesDirectory({ onSelectService }) {
  const services = [
    {
      id: "plumbing",
      title: "Plumbing",
      tagline: "Leaks, pipelines, faucets & drainage",
      image: "/images/service-plumber.jpg",
      startingPrice: "₹299",
      avgTime: "45 mins",
      rating: "4.9",
      features: ["Pipe leak repair", "Tap & fixture replacement", "Drain unclogging", "Water tank valve checks"]
    },
    {
      id: "electrical",
      title: "Electrical",
      tagline: "Wiring, switchboards, lighting & appliances",
      image: "/images/service-electrician.jpg",
      startingPrice: "₹249",
      avgTime: "40 mins",
      rating: "4.8",
      features: ["Switchboard repair", "MCB & wiring fault trace", "Fan & chandelier install", "Power outlet upgrades"]
    },
    {
      id: "ac",
      title: "AC & Cooling",
      tagline: "Deep foam servicing, gas refilling & repair",
      image: "/images/service-ac.jpg",
      startingPrice: "₹599",
      avgTime: "60 mins",
      rating: "4.9",
      features: ["Deep jet pump wash", "Gas leak & refill check", "Cooling coil diagnosis", "Compressor inspection"]
    },
    {
      id: "cleaning",
      title: "Cleaning",
      tagline: "Deep sanitization for sparkling homes",
      image: "/images/service-cleaner.jpg",
      startingPrice: "₹499",
      avgTime: "120 mins",
      rating: "4.8",
      features: ["Full house deep scrub", "Kitchen grease removal", "Bathroom tile descaling", "Sofa & mattress shampoo"]
    },
    {
      id: "pest-control",
      title: "Pest Control",
      tagline: "Safe herbal treatment & protection",
      image: "/images/service-pestcontrol.jpg",
      startingPrice: "₹699",
      avgTime: "90 mins",
      rating: "4.9",
      features: ["Termite eradication", "Herbal cockroach gel", "Mosquito control fogging", "Rodent safe traps"]
    },
    {
      id: "appliance",
      title: "Appliance Repair",
      tagline: "Washing machines, refrigerators & geysers",
      image: "/images/service-appliance.jpg",
      startingPrice: "₹399",
      avgTime: "50 mins",
      rating: "4.8",
      features: ["Washing machine motor fix", "Refrigerator cooling repair", "Microwave diagnosis", "Geyser heating element"]
    },
    {
      id: "carpentry",
      title: "Carpentry",
      tagline: "Custom woodwork, hinges & furniture assembly",
      image: "/images/service-carpentry.jpg",
      startingPrice: "₹349",
      avgTime: "60 mins",
      rating: "4.8",
      features: ["Door lock & latch repair", "Furniture assembly & fixes", "Cabinet hinge alignment", "Custom shelf fitting"]
    },
    {
      id: "painting",
      title: "Painting",
      tagline: "Fresh coats, waterproofing & clean finish",
      image: "/images/service-painting.jpg",
      startingPrice: "₹1,499",
      avgTime: "1 day",
      rating: "4.9",
      features: ["Single wall accent paint", "Waterproof primer coat", "Smooth putty & sanding", "Mess-free post clean"]
    },
    {
      id: "maintenance",
      title: "Home Maintenance",
      tagline: "General repairs, fixtures & all-around checkups",
      image: "/images/service-maintenance.jpg",
      startingPrice: "₹449",
      avgTime: "60 mins",
      rating: "4.7",
      features: ["Drill & hang wall fixtures", "Curtain rod installation", "Door stopper & weather strips", "Comprehensive home audit"]
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 md:py-20 bg-[#FAF8F5] border-t border-[#E8E4DA]/80">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-5">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#4E715E] block mb-2.5">
              Every home service, one platform
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight">
              Our Services
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#526058] font-light max-w-md">
            Trusted professionals for every need. Book upfront with fixed rates, verified credentials, and real-time tracking.
          </p>
        </div>

        {/* 9 Services Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group bg-white rounded-3xl overflow-hidden border border-[#E8E4DA] hover:border-[#0E382C] transition-all duration-300 editorial-shadow hover:editorial-shadow-lg flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F4F1EA]">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Rating Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#E8E4DA] text-xs font-semibold text-[#1B2620] flex items-center gap-1 shadow-sm">
                  <Star size={11} className="fill-[#C28E46] text-[#C28E46]" />
                  <span>{service.rating}</span>
                </div>

                {/* Starting Price Pill */}
                <div className="absolute top-3 right-3 bg-[#0E382C] text-white px-2.5 py-1 rounded-full text-xs font-sans font-bold tracking-wide shadow-sm">
                  From {service.startingPrice}
                </div>
              </div>

              {/* Service Info Content */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-lg sm:text-xl font-serif-display font-bold text-[#1B2620]">
                      {service.title}
                    </h3>
                    <span className="text-xs font-mono text-[#7E8C83] flex items-center gap-1">
                      <Clock size={12} />
                      {service.avgTime}
                    </span>
                  </div>

                  <p className="text-xs text-[#526058] leading-relaxed mb-4">
                    {service.tagline}
                  </p>

                  {/* Bullet features */}
                  <div className="space-y-1.5 mb-5">
                    {service.features.slice(0, 3).map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-[#526058]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0E382C]"></span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <button
                  onClick={() => onSelectService(service)}
                  className="w-full mt-2 py-2.5 px-4 rounded-full border border-[#E8E4DA] group-hover:border-[#0E382C] hover:bg-[#0E382C] hover:text-white text-[#1B2620] text-xs font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Book this service</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
