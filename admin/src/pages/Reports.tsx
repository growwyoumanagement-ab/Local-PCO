import { BarChart3, TrendingUp, Users, PieChart } from "lucide-react";

export default function Reports() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                    Reports & Analytics
                    <BarChart3 className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
                </h1>
                <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Deep dive into platform metrics</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-8 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl h-80 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-violet-600/5 dark:bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="h-16 w-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 relative z-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white relative z-10">Revenue Trend</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mt-3 relative z-10">Detailed revenue charts and breakdowns will appear here.</p>
                </div>

                <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-8 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl h-80 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-600/5 dark:bg-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 relative z-10 group-hover:scale-110 transition-transform">
                        <PieChart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white relative z-10">Service Performance</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mt-3 relative z-10">Most popular services and booking frequency analysis.</p>
                </div>

                <div className="col-span-2 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-8 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl h-64 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-600/5 dark:bg-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 relative z-10 group-hover:scale-110 transition-transform">
                        <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white relative z-10">Partner Growth</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mt-3 relative z-10">New partner registrations and retention metrics.</p>
                </div>
            </div>
        </div>
    )
}
