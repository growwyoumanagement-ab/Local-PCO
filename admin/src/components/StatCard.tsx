import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
    className?: string;
    onClick?: () => void;
}

export function StatCard({ title, value, icon: Icon, description, trend, className, onClick }: StatCardProps) {
    return (
        <Card 
            onClick={onClick}
            className={cn(
            "relative overflow-hidden bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-200 dark:border-white/5 hover:border-violet-500/30 transition-all duration-500 group rounded-3xl shadow-sm hover:shadow-md",
            onClick && "cursor-pointer active:scale-[0.98]",
            className
        )}>
            {/* Glow Blob */}
            <div className="absolute -right-10 -top-10 h-32 w-32 bg-violet-600/5 dark:bg-violet-600/20 blur-[60px] group-hover:bg-violet-600/10 dark:group-hover:bg-violet-600/30 transition-all duration-500 rounded-full" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/20 group-hover:border-violet-200 dark:group-hover:border-violet-500/30 transition-all duration-300">
                    <Icon className="h-5 w-5 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all">
                    {value}
                </div>
                {(description || trend) && (
                    <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2 font-medium">
                        {trend && (
                            <span className={cn(
                                "flex items-center px-2 py-1 rounded-lg text-[10px] tracking-wider uppercase border",
                                trend.startsWith("+")
                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                    : "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                            )}>
                                {trend}
                            </span>
                        )}
                        <span className="opacity-60">{description}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
