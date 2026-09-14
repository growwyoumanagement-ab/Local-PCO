import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { SectionHeading } from "../components/ui/SectionHeading";
import { GlowButton } from "../components/ui/GlowButton";
import { Badge } from "../components/ui/Badge";

export function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "forever",
      desc: "Perfect for new professionals getting started.",
      features: [
        "5 leads/month",
        "Standard priority in queue",
        "Basic profile listing",
      ],
      ctaText: "Start Free",
      ctaVariant: "outline",
      popular: false
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      desc: "For serious professionals ready to scale.",
      features: [
        "Unlimited leads",
        "Priority queue placement",
        "Verified badge & trust signaling",
        "Basic analytics & stats",
      ],
      ctaText: "Get Started",
      ctaVariant: "primary",
      popular: true
    },
    {
      name: "Premium",
      price: "₹2,499",
      period: "/month",
      desc: "For agencies and top-tier vendors.",
      features: [
        "Unlimited leads",
        "Top of queue (highest priority)",
        "Featured listing (+50 score boost)",
        "Full analytics dashboard",
        "Dedicated account support"
      ],
      ctaText: "Go Premium",
      ctaVariant: "outline",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#0F1623]/30">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading 
          title="Simple, Transparent Pricing" 
          subtitle="Start free. Scale as your business grows." 
        />

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 items-start">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`glass rounded-2xl p-8 relative flex flex-col h-full ${
                plan.popular 
                ? 'border-[#FF5C1A]/50 shadow-[0_0_30px_rgba(255,92,26,0.15)] md:-mt-4 md:mb-4 bg-[#1E2D42]/40' 
                : 'border-[#1E2D42]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="px-4 py-1 text-sm bg-[#FF5C1A] text-white border-none shadow-[0_0_15px_rgba(255,92,26,0.5)]">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-[#8FA3BF] text-sm h-10">{plan.desc}</p>
              </div>

              <div className="mb-8 flex items-end gap-1">
                <span className="text-5xl font-bold text-white font-mono">{plan.price}</span>
                <span className="text-[#8FA3BF] mb-2">{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-4 mb-10 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-[#8FA3BF]">
                    <Check size={20} className="text-[#00E676] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto mt-16 mt-12 p-4 rounded-xl border border-[#00D4FF]/30 bg-[#00D4FF]/5 flex items-center justify-center gap-3 text-center"
        >
          <Star className="text-[#00D4FF] fill-[#00D4FF]" size={20} />
          <p className="text-white text-sm">
            <span className="font-bold text-[#00D4FF]">Add-on:</span> Featured Vendor Listing — ₹499 for 30 days. Get +50 priority score boost.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
