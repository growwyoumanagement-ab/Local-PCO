import { useEffect, useState } from "react";
import { verifierService, type VerifierStats, type AuditLogEntry } from "@/services/verifierService";
import { toast } from "sonner";
import {
    Clock,
    CheckCircle2,
    XCircle,
    PauseCircle,
    AlertTriangle,
    MessageSquare,
    Activity,
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const actionLabels: Record<string, string> = {
    approve: "Approved",
    reject: "Rejected",
    put_on_hold: "Put on Hold",
    request_more_info: "Requested Info",
    submitted: "Submitted",
};

const actionColors: Record<string, string> = {
    approve: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    reject: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    put_on_hold: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    request_more_info: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    submitted: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
};

export default function VerifierDashboard() {
    const [stats, setStats] = useState<VerifierStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await verifierService.getStats();
            setStats(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        { label: "Pending Review", value: stats.pendingCount, icon: Clock, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
        { label: "Approved", value: stats.approvedCount, icon: CheckCircle2, color: "from-emerald-500 to-green-500", shadow: "shadow-emerald-500/20" },
        { label: "Rejected", value: stats.rejectedCount, icon: XCircle, color: "from-rose-500 to-red-500", shadow: "shadow-rose-500/20" },
        { label: "On Hold", value: stats.onHoldCount, icon: PauseCircle, color: "from-amber-400 to-yellow-500", shadow: "shadow-yellow-500/20" },
        { label: "Need More Info", value: stats.needInfoCount, icon: MessageSquare, color: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20" },
        { label: "SLA Breached", value: stats.slaBreachedCount, icon: AlertTriangle, color: "from-red-600 to-rose-600", shadow: "shadow-red-500/20" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                        Verification Dashboard
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        KYC verification overview · {stats.todayActionsCount} actions today
                    </p>
                </div>
                <button
                    onClick={() => navigate("/verification/queue")}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm"
                >
                    Open Queue <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 p-6 shadow-lg ${card.shadow} transition-all hover:scale-[1.02]`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
                                <p className="text-3xl font-bold mt-1 text-zinc-900 dark:text-white">{card.value}</p>
                            </div>
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/5 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-violet-500" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Verification Activity</h2>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-white/5">
                    {stats.recentActions.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No recent activity</div>
                    ) : (
                        stats.recentActions.map((log: AuditLogEntry) => (
                            <div key={log._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${actionColors[log.action] || "text-zinc-600 bg-zinc-100"}`}>
                                        {actionLabels[log.action] || log.action}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {log.partnerId?.name || "Unknown Partner"}
                                        </p>
                                        {log.reason && (
                                            <p className="text-xs text-zinc-500 mt-0.5 max-w-[200px] sm:max-w-md truncate">
                                                Reason: {log.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xs text-zinc-500">
                                        {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm a")}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        by {log.verifierId?.name || "System"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
