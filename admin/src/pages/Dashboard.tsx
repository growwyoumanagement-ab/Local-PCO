import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecentBookingsTable } from "@/components/RecentBookingsTable";
import { BookingStatusChart } from "@/components/BookingStatusChart";
import { StatCard } from "@/components/StatCard";
import { Users, UserCheck, IndianRupee, Activity, ShieldCheck } from "lucide-react";
import { adminService, type DashboardStats } from "@/services/adminService";
import { RecentVerificationsTable } from "@/components/RecentVerificationsTable";

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full p-10">
                <div className="animate-spin h-8 w-8 border-4 border-violet-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                        Dashboard
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Live platform overview</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Partners"
                    value={stats?.totalPartners.toString() || "0"}
                    icon={UserCheck}
                    description="Registered Partners"
                    onClick={() => navigate("/partners")}
                />
                <StatCard
                    title="Total Clients"
                    value={stats?.totalClients.toString() || "0"}
                    icon={Users}
                    description="Registered Users"
                    onClick={() => navigate("/clients")}
                />
                <StatCard
                    title="Active Bookings"
                    value={stats?.activeBookings.toString() || "0"}
                    icon={Activity}
                    description="In Progress"
                    className="border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 hover:bg-violet-100 dark:hover:bg-violet-500/10"
                    onClick={() => navigate("/bookings")}
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue.toLocaleString('en-IN') || "0"}`}
                    icon={IndianRupee}
                    description=" Lifetime Revenue"
                    onClick={() => navigate("/bookings")}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 flex flex-col gap-6">
                    <div 
                        onClick={() => navigate("/bookings")}
                        className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-sm dark:shadow-2xl cursor-pointer hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <div className="h-6 w-1 rounded-full bg-cyan-500"></div>
                                Recent Bookings
                            </h3>
                        </div>
                        <RecentBookingsTable data={stats?.recentBookings} />
                    </div>

                    <div 
                        onClick={() => navigate("/verification-history")}
                        className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-sm dark:shadow-2xl cursor-pointer hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                Verification History
                            </h3>
                        </div>
                        <RecentVerificationsTable />
                    </div>
                </div>
                <div className="col-span-3 min-w-0">
                    <div 
                        onClick={() => navigate("/bookings")}
                        className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-sm dark:shadow-2xl h-full flex flex-col relative overflow-hidden cursor-pointer hover:border-violet-500/30 transition-all duration-300 min-w-0"
                    >
                        {/* Glow Gradient (Dark Mode Only) */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none opacity-0 dark:opacity-100"></div>

                        <div className="relative z-10">
                            <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-2">
                                <div className="h-6 w-1 rounded-full bg-fuchsia-500"></div>
                                Booking Overview
                            </h3>
                            <p className="text-sm text-zinc-500">Real-time status distribution</p>
                        </div>
                        <div className="flex-1 w-full min-w-0 flex items-center justify-center relative z-10">
                            <BookingStatusChart data={stats?.bookingStatusDistribution} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
