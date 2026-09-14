import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function SectionHeading({ title, subtitle, className, centered = true }) {
  return (
    <div className={cn("mb-12 max-w-3xl", centered && "mx-auto text-center", className)}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#8FA3BF] text-lg md:text-xl"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
