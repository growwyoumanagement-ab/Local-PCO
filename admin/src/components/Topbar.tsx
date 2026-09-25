import { ModeToggle } from "@/components/mode-toggle";

export function Topbar() {
    return (
        <div className="h-20 mt-4 mr-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/5 px-8 flex items-center justify-end sticky top-4 z-10 shadow-lg">
            <div className="flex items-center gap-4">
                <ModeToggle />
            </div>
        </div>
    );
}
