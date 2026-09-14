import { cn } from "../../lib/utils";

export function Badge({ children, className, variant = 'default' }) {
  const variants = {
    default: "bg-[#1E2D42] text-[#8FA3BF] border border-[#2A3A55]",
    success: "bg-[rgba(0,230,118,0.1)] text-[#00E676] border border-[rgba(0,230,118,0.3)]",
    primary: "bg-[rgba(255,92,26,0.1)] text-[#FF5C1A] border border-[rgba(255,92,26,0.3)]"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}
