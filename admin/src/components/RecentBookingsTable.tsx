import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/StatusBadge"

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

interface Booking {
    _id: string;
    partnerId: { name: string } | null;
    clientId: { name: string } | null;
    serviceName: string;
    status: string;
    createdAt: string;
    estimatedCharges?: number;
    finalCharges?: number;
}

interface RecentBookingsTableProps {
    data?: Booking[];
}

export function RecentBookingsTable({ data = [] }: RecentBookingsTableProps) {
    if (!data.length) {
        return (
            <div className="p-6 text-center text-zinc-500 text-sm">
                No recent bookings found.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/5 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                    <TableRow className="border-zinc-200 dark:border-white/5 hover:bg-transparent">
                        <TableHead className="w-[100px] text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">ID</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Partner</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Client</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Service</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Date</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-10">Status</TableHead>

                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((booking) => (
                        <TableRow key={booking._id} className="border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors group">
                            <TableCell className="font-mono text-xs text-violet-600 dark:text-violet-400 font-medium group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors">#{booking._id.slice(-6).toUpperCase()}</TableCell>
                            <TableCell className="text-sm font-medium text-zinc-800 dark:text-zinc-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-100">{booking.partnerId?.name || 'Unassigned'}</TableCell>
                            <TableCell className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">{booking.clientId?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">{booking.serviceName}</TableCell>
                            <TableCell className="text-xs text-zinc-500 font-mono">{formatDate(booking.createdAt)}</TableCell>
                            <TableCell>
                                <StatusBadge status={booking.status} />
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
