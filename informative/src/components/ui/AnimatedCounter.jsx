import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";

export function AnimatedCounter({ value, decimals = 0, direction = "up", delay = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    mass: 1
  });

  useEffect(() => {
    if (inView) {
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
    }
  }, [value, inView, delay, motionValue, direction]);

  useEffect(() => {
    const unsub = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest);
      }
    });
    return () => unsub();
  }, [springValue, decimals]);

  return <span className={cn("font-mono font-bold", className)} ref={ref}>0</span>;
}
