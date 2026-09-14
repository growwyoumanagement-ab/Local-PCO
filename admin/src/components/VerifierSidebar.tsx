import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    LogOut,
    ListChecks,
    History,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/verification", icon: LayoutDashboard },
    { name: "Verification Queue", href: "/verification/queue", icon: ListChecks },
    { name: "History", href: "/verification/history", icon: History },
];

export function VerifierSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

    return (
        <div className="flex flex-col h-[95vh] w-72 m-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden relative transition-colors duration-500">
            {/* Neon Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50"></div>

            <div className="p-8">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">Local PCO</span>
                </h1>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold tracking-[0.2em] uppercase pl-1">Verification Center</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== "/verification" && location.pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center px-5 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-white shadow-lg shadow-emerald-500/10"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/70 border-l-2 border-emerald-500"></div>
                            )}

                            <item.icon
                                className={cn(
                                    "mr-4 h-5 w-5 transition-all duration-300 z-10",
                                    isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                                )}
                                aria-hidden="true"
                            />
                            <span className="z-10 tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mx-4 mb-4 mt-auto">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-zinc-50/50 to-zinc-100/50 dark:from-zinc-800/50 dark:to-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:border-emerald-500/20 dark:hover:border-white/10 transition-colors group">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-white">VF</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors">{user.name || "Verifier"}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Verifier</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('adminToken');
                            localStorage.removeItem('adminUser');
                            window.location.href = '/login';
                        }}
                        className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
