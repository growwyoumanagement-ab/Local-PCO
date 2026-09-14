import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, Calendar, Download, Sparkles, User, Briefcase, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export type Booking = {
    _id: string
    clientId: { name: string, email?: string, phone?: string }
    partnerId?: {
        _id?: string
        name: string,
        email?: string,
        phone?: string,
        serviceCategory?: { name: string, _id: string }
    }
    serviceName: string
    serviceType: string
    createdAt: string
    finalCharges?: number
    estimatedCharges?: number
    status: "pending" | "completed" | "cancelled" | "in_progress" | "accepted"
    address?: {
        city?: string
        full?: string
    }
}

export default function Bookings() {
    const [data, setData] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Filter, Date, Sort, Search states
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Date Filter Dialog
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [appliedStartDate, setAppliedStartDate] = useState<string>('');
    const [appliedEndDate, setAppliedEndDate] = useState<string>('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const loadBookings = useCallback(async (
        currentPage = page,
        currentStatus = statusFilter,
        currentSearch = searchQuery,
        currentSortBy = sortBy,
        currentSortOrder = sortOrder,
        currentStartDate = appliedStartDate,
        currentEndDate = appliedEndDate
    ) => {
        try {
            setLoading(true);
            const response = await adminService.getAllBookings({
                page: currentPage,
                limit,
                status: currentStatus,
                search: currentSearch,
                sortBy: currentSortBy,
                sortOrder: currentSortOrder,
                startDate: currentStartDate || undefined,
                endDate: currentEndDate || undefined
            });

            setData(response.data || []);
            setTotal(response.pagination?.total || 0);
            setTotalPages(response.pagination?.pages || 1);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, searchQuery, sortBy, sortOrder, appliedStartDate, appliedEndDate]);

    useEffect(() => {
        loadBookings(page, statusFilter, searchQuery, sortBy, sortOrder, appliedStartDate, appliedEndDate);
    }, [page, statusFilter, searchQuery, sortBy, sortOrder, appliedStartDate, appliedEndDate, loadBookings]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1);
    };

    const handleApplyDateFilter = () => {
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                toast.error("Start date cannot be after end date.");
                return;
            }
        }
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setPage(1);
        setShowDateFilter(false);
        toast.success("Date filter applied");
    };

    const handleClearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        setPage(1);
        setShowDateFilter(false);
        toast.info("Date filter cleared");
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCanonicalId = (id: string) => {
        if (!id) return '';
        return `#${id.slice(-8).toUpperCase()}`;
    };

    const formatServiceName = (booking: Booking) => {
        if (booking.serviceName && booking.serviceName !== 'Unknown Service') {
            return booking.serviceName;
        }
        if (booking.partnerId?.serviceCategory?.name) {
            return booking.partnerId.serviceCategory.name;
        }
        if (booking.serviceType && typeof booking.serviceType === 'string' && booking.serviceType.includes('_')) {
            return booking.serviceType
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
        return 'General Service';
    };

    const handleExport = () => {
        if (data.length === 0) {
            toast.error("No bookings to export");
            return;
        }

        const headers = ['Booking ID', 'Full ID', 'Client Name', 'Client Phone', 'Client Email', 'Partner Name', 'Partner Phone', 'Partner Email', 'Service Name', 'Booking Date', 'Status', 'Charges'];
        const csvData = data.map(b => [
            `"${formatCanonicalId(b._id)}"`,
            `"${b._id}"`,
            `"${b.clientId?.name || 'Unknown'}"`,
            `"${b.clientId?.phone || ''}"`,
            `"${b.clientId?.email || ''}"`,
            `"${b.partnerId?.name || 'Unassigned'}"`,
            `"${b.partnerId?.phone || ''}"`,
            `"${b.partnerId?.email || ''}"`,
            `"${formatServiceName(b)}"`,
            `"${formatDate(b.createdAt)}"`,
            `"${b.status}"`,
            `"${b.finalCharges || b.estimatedCharges || 0}"`
        ]);

        const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Bookings exported successfully");
    };

    const columns = useMemo<ColumnDef<Booking>[]>(() => [
        {
            accessorKey: "_id",
            header: "Booking ID",
            cell: ({ row }) => (
                <span className="font-mono text-xs text-violet-600 dark:text-violet-400 font-semibold tracking-wide">
                    {formatCanonicalId(row.getValue<string>("_id"))}
                </span>
            )
        },
        {
            id: "client",
            accessorFn: (row) => row.clientId?.name || 'Unknown',
            header: "Client",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{row.original.clientId?.name || 'Unknown'}</span>
                    <span className="text-xs text-zinc-400">{row.original.clientId?.phone || ''}</span>
                </div>
            )
        },
        {
            id: "partner",
            accessorFn: (row) => row.partnerId?.name || 'Unassigned',
            header: "Partner",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">{row.original.partnerId?.name || 'Unassigned'}</span>
                    <span className="text-xs text-zinc-400">{row.original.partnerId?.phone || ''}</span>
                </div>
            )
        },
        {
            accessorKey: "serviceName",
            header: "Service",
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatServiceName(row.original)}
                </span>
            )
        },
        {
            accessorKey: "createdAt",
            header: () => {
                return (
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-violet-600 dark:hover:text-violet-400 font-bold uppercase tracking-widest text-[10px] text-zinc-500"
                        onClick={() => {
                            if (sortBy === 'createdAt') {
                                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            } else {
                                setSortBy('createdAt');
                                setSortOrder('asc');
                            }
                        }}
                    >
                        Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="text-zinc-500 text-xs font-mono">{formatDate(row.getValue("createdAt"))}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const booking = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => setSelectedBooking(booking)}
                                className="cursor-pointer focus:bg-violet-50 dark:focus:bg-violet-600 focus:text-violet-600 dark:focus:text-white"
                            >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [sortBy, sortOrder]);

    const isDateFiltered = Boolean(appliedStartDate || appliedEndDate);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl relative overflow-hidden gap-4">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        Bookings <span className="text-xl text-zinc-400 font-medium">({total})</span>
                        <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-pulse" />
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Live service request feed & full booking history</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-zinc-800">
                            <SelectValue placeholder="Booking Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant={isDateFiltered ? "default" : "outline"}
                        onClick={() => setShowDateFilter(true)}
                        className={`gap-2 ${isDateFiltered ? 'bg-violet-600 text-white' : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300'}`}
                    >
                        <Calendar className="h-4 w-4" />
                        {isDateFiltered ? "Date Filter Active" : "Filter Date"}
                    </Button>

                    {isDateFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearDateFilter}
                            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                            <X className="h-3.5 w-3.5 mr-1" /> Reset Date
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="gap-2 border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {loading && data.length === 0 ? (
                <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading bookings...</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    searchValue={searchQuery}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Search by service, city, or address..."
                    pagination={{
                        page,
                        limit,
                        total,
                        pages: totalPages,
                        onPageChange: setPage
                    }}
                />
            )}

            {/* Date Range Filter Modal */}
            <Dialog open={showDateFilter} onOpenChange={setShowDateFilter}>
                <DialogContent className="sm:max-w-[420px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="w-5 h-5 text-violet-500" />
                            Filter Bookings by Date
                        </DialogTitle>
                        <DialogDescription>
                            Select start and end dates to filter booking records.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleClearDateFilter}>Clear</Button>
                        <Button type="button" onClick={handleApplyDateFilter} className="bg-violet-600 hover:bg-violet-700 text-white">
                            Apply Filter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Booking Details Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
                        <DialogDescription className="font-mono text-sm font-semibold text-violet-600 dark:text-violet-400">
                            Booking ID: {selectedBooking ? formatCanonicalId(selectedBooking._id) : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                        {formatServiceName(selectedBooking)}
                                    </h3>
                                    <p className="text-sm text-zinc-500 mt-1 font-mono">
                                        {formatDate(selectedBooking.createdAt)}
                                    </p>
                                </div>
                                <StatusBadge status={selectedBooking.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                            <User className="h-4 w-4 text-violet-500" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">Client Details</span>
                                        </div>
                                        <div className="pl-6 space-y-1">
                                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                                                {selectedBooking.clientId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {selectedBooking.clientId?.phone || 'No phone'}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {selectedBooking.clientId?.email || 'No email'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                            <Briefcase className="h-4 w-4 text-violet-500" />
                                            <span className="text-xs font-semibold uppercase tracking-wider">Partner Details</span>
                                        </div>
                                        <div className="pl-6 space-y-1">
                                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                                                {selectedBooking.partnerId?.name || 'Not assigned'}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {selectedBooking.partnerId?.phone || 'No phone'}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {selectedBooking.partnerId?.email ? selectedBooking.partnerId.email : 'No email'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
