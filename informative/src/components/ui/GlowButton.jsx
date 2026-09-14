import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function GlowButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  onClick,
  href,
  ...props 
}) {
  const baseStyles = "relative inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 overflow-hidden cursor-pointer";
  
  const variants = {
    primary: "bg-[#FF5C1A] text-white hover:bg-[#ff763d] shadow-[0_0_20px_rgba(255,92,26,0.4)] hover:shadow-[0_0_30px_rgba(255,92,26,0.6)] border border-[#FF5C1A]",
    outline: "bg-transparent text-[#00D4FF] border border-[#00D4FF] hover:bg-[rgba(0,212,255,0.1)] shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)]",
    secondary: "bg-[#1E2D42] text-white border border-[#1E2D42] hover:border-[#FF5C1A]/50 hover:bg-[#253954] shadow-lg"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      target={href?.startsWith('http') ? "_blank" : undefined}
      rel={href?.startsWith('http') ? "noopener noreferrer" : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Component>
  );
}
