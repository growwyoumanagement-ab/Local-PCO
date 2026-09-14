import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-zinc-600" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-400" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-zinc-200 dark:border-white/5 shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer focus:bg-violet-50 focus:text-violet-600 dark:focus:bg-violet-500/10 dark:focus:text-violet-300">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer focus:bg-violet-50 focus:text-violet-600 dark:focus:bg-violet-500/10 dark:focus:text-violet-300">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer focus:bg-violet-50 focus:text-violet-600 dark:focus:bg-violet-500/10 dark:focus:text-violet-300">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
