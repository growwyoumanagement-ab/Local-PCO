import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase()
        if (s === 'active' || s === 'completed' || s === 'verified' || s === 'accepted') {
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
        }
        if (s === 'pending' || s === 'in_progress' || s === 'suspended') {
            return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
        }
        if (s === 'inactive' || s === 'rejected' || s === 'cancelled') {
            return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]"
        }
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm transition-all hover:scale-105",
            getStatusStyles(status),
            className
        )}>
            <span className={cn(
                "mr-1.5 h-1.5 w-1.5 rounded-full",
                status.toLowerCase().includes('pending') ? "animate-pulse" : ""
            )} style={{ backgroundColor: 'currentColor' }}></span>
            {status.replace('_', ' ')}
        </span>
    )
}
