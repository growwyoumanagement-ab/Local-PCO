import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ColumnDef } from "@tanstack/react-table";

interface BookingRow {
    _id: string;
    serviceName: string;
    serviceType: string;
    status: string;
    clientId?: { _id: string; name: string; phone: string; email?: string };
    partnerId?: {
        _id: string;
        name: string;
        phone: string;
        serviceCategory: { name: string } | string;
    };
    interestedPartners?: { partnerId?: { _id: string; name: string; phone: string }; clickedAt?: string }[];
    createdAt: string;
    completedAt?: string;
}

export default function Clients() {
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const activePageRef = useRef(1);

    const fetchBookings = useCallback(async (currentPage = page, currentSearch = searchQuery) => {
        activePageRef.current = currentPage;
        try {
            setLoading(true);
            const response = await adminService.getAllBookings({
                page: currentPage,
                limit,
                search: currentSearch
            });
            if (activePageRef.current === currentPage) {
                setBookings(response.data || []);
                setTotal(response.pagination?.total || 0);
                setTotalPages(response.pagination?.pages || 1);
            }
        } catch (error) {
            if (activePageRef.current === currentPage) {
                toast.error('Failed to fetch bookings');
            }
        } finally {
            if (activePageRef.current === currentPage) {
                setLoading(false);
            }
        }
    }, [page, limit, searchQuery]);

    useEffect(() => {
        fetchBookings(page, searchQuery);
    }, [page, searchQuery, fetchBookings]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1);
    };

    const columns = useMemo<ColumnDef<BookingRow>[]>(() => [
        {
            id: "client",
            header: "Client",
            accessorFn: (row) => `${row.clientId?.name || ''} ${row.clientId?.phone || ''}`,
            cell: ({ row }) => {
                const client = row.original.clientId;
                if (!client) return <span className="text-zinc-400">—</span>;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200 text-sm">{client.name}</span>
                        <span className="text-xs text-zinc-500">{client.phone}</span>
                    </div>
                );
            }
        },
        {
            id: "service",
            accessorKey: "serviceName",
            header: "Service",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{row.original.serviceName || row.original.serviceType}</p>
                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-mono font-semibold">#{row.original._id.slice(-8).toUpperCase()}</p>
                </div>
            )
        },
        {
            id: "serviceCategory",
            header: "Service Category",
            cell: ({ row }) => {
                const partner = row.original.partnerId;
                const cat = partner?.serviceCategory;
                return (
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {typeof cat === 'object' && cat !== null ? cat.name : (cat || row.original.serviceType || '—')}
                    </span>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
        },
        {
            id: "clickedPartners",
            header: "Partners Clicked",
            cell: ({ row }) => {
                const partners = row.original.interestedPartners || [];
                const count = partners.length;
                
                if (count === 0) {
                    return (
                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500">
                            0
                        </span>
                    );
                }

                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 transition-colors cursor-pointer">
                                {count}
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 shadow-2xl">
                            <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
                                <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                    Interested Partners
                                </DialogTitle>
                            </DialogHeader>
                            <div className="px-6 pb-6 space-y-3 max-h-[60vh] overflow-y-auto">
                                {partners.map((p, i) => {
                                    if (!p.partnerId) return null;
                                    return (
                                        <div key={i} className="group flex justify-between items-center p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-shrink-0 items-center justify-center w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                                    {p.partnerId.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-tight mb-0.5">
                                                        {p.partnerId.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 font-medium">
                                                        {p.partnerId.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            {p.clickedAt && (
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                        {new Date(p.clickedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tight mr-0.5">
                                                        {new Date(p.clickedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            }
        },
        {
            id: "completedBy",
            header: "Completed By",
            cell: ({ row }) => {
                const booking = row.original;
                if (booking.status === 'completed' && booking.partnerId) {
                    return (
                        <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{booking.partnerId.name}</p>
                            <p className="text-[10px] text-zinc-500">{booking.partnerId.phone}</p>
                        </div>
                    );
                }
                return <span className="text-xs text-zinc-400">—</span>;
            }
        },
        {
            accessorKey: "createdAt",
            header: "Created Date",
            cell: ({ row }) => (
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {new Date(row.getValue("createdAt")).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            id: "completedAt",
            header: "Completed Date",
            cell: ({ row }) => {
                const d = row.original.completedAt;
                if (!d) return <span className="text-xs text-zinc-400">—</span>;
                return (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        {new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                );
            }
        },
    ], []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Clients & Bookings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                    All bookings with client details, partner activity, and completion status
                </p>
            </div>

            {loading && bookings.length === 0 ? (
                <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading bookings...</p>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={bookings} 
                    searchValue={searchQuery}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Search by client name, service, or booking ID..."
                    pagination={{
                        page,
                        limit,
                        total,
                        pages: totalPages,
                        onPageChange: setPage
                    }}
                />
            )}
        </div>
    );
}
