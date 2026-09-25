import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns";
import { ShieldAlert } from "lucide-react";
import { verifierService, type AuditLogEntry } from "@/services/verifierService";

const actionLabels: Record<string, string> = {
    approve: "Approved",
    reject: "Rejected",
    put_on_hold: "On Hold",
    request_more_info: "Need Info",
    submitted: "Submitted",
};

const actionColors: Record<string, string> = {
    approve: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    reject: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    put_on_hold: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    request_more_info: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    submitted: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
};

export function RecentVerificationsTable() {
    const [data, setData] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            // Fetch just the first page of history (most recent)
            const result = await verifierService.getHistory(1, 5);
            setData(result.data);
        } catch (error) {
            console.error("Failed to load verification history", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 min-h-[140px] text-center text-zinc-500 text-sm flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-violet-500/30 border-t-violet-600 rounded-full"></div>
                <span className="ml-2">Loading history...</span>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="p-6 text-center text-zinc-500 text-sm flex flex-col items-center">
                <ShieldAlert className="h-8 w-8 text-zinc-300 mb-2" />
                No recent verification activity.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/5 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                    <TableRow className="border-zinc-200 dark:border-white/5 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10 w-[200px]">Partner</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Action</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Verifier</TableHead>
                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((log) => (
                        <TableRow key={log._id} className="border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors group">
                            <TableCell className="font-medium text-sm text-zinc-800 dark:text-zinc-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-100">
                                {log.partnerId?.name || 'Unknown Partner'}
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${actionColors[log.action] || "text-zinc-600 bg-zinc-100"}`}>
                                    {actionLabels[log.action] || log.action}
                                </span>
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                                {log.verifierId?.name || (log.action === 'submitted' ? 'System/Self' : 'System')}
                            </TableCell>
                            <TableCell className="text-right text-xs text-zinc-500 font-mono">
                                {format(new Date(log.timestamp), "MMM dd, HH:mm")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
