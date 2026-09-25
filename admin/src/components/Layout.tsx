import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Layout() {
    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-auto p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
