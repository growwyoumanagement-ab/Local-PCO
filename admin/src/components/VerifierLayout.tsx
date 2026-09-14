import { Outlet } from "react-router-dom";
import { VerifierSidebar } from "./VerifierSidebar";
import { Topbar } from "./Topbar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

export function VerifierLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 transition-colors duration-500">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block shrink-0">
                <VerifierSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />
                    <div className="relative z-50 w-80 max-w-[85vw] h-full flex flex-col animate-in slide-in-from-left duration-300">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 right-4 z-50 rounded-full !bg-zinc-100/10 hover:!bg-zinc-200/20 text-white"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <VerifierSidebar onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full max-w-full">
                {/* Mobile Top Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 shadow-sm z-30">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <Menu className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                        </Button>
                        <span className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-lg">Local PCO</span>
                    </div>
                    <ModeToggle />
                </div>

                <div className="hidden lg:block">
                    <Topbar />
                </div>
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
