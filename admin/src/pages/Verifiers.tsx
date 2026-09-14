import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Shield, ShieldCheck, UserPlus, Power, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Verifiers() {
    const navigate = useNavigate();
    const [verifiers, setVerifiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerifier, setSelectedVerifier] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        loadVerifiers(page, searchQuery, sortBy, sortOrder);
    }, [page, searchQuery, sortBy, sortOrder]);

    const loadVerifiers = async (currentPage = page, currentSearch = searchQuery, currentSort = sortBy, currentOrder = sortOrder) => {
        try {
            setLoading(true);
            const response = await adminService.getVerifiers({
                page: currentPage,
                limit,
                search: currentSearch,
                sortBy: currentSort,
                sortOrder: currentOrder
            });
            setVerifiers(response.data || []);
            setTotal(response.pagination?.total || 0);
            setTotalPages(response.pagination?.pages || 1);
        } catch (error) {
            toast.error("Failed to load verifiers");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1);
    };

    const handleToggleStatus = async (id: string, isBlocked: boolean) => {
        try {
            await adminService.toggleVerifierStatus(id, !isBlocked);
            toast.success(`Verifier ${isBlocked ? 'activated' : 'deactivated'} successfully`);
            loadVerifiers(page, searchQuery, sortBy, sortOrder);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: "name",
            header: () => (
                <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent hover:text-violet-600 dark:hover:text-violet-400 font-bold uppercase tracking-widest text-[10px] text-zinc-500"
                    onClick={() => {
                        if (sortBy === 'name') {
                            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortBy('name');
                            setSortOrder('asc');
                        }
                    }}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.photo ? (
                        <img src={row.original.photo} alt="" className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                    )}
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{row.getValue("name")}</span>
                </div>
            )
        },
        {
            id: "contact",
            header: "Contact",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{row.original.phone}</span>
                    <span className="text-xs text-zinc-500">{row.original.email}</span>
                </div>
            )
        },
        {
            accessorKey: "isBlocked",
            header: "Status",
            cell: ({ row }) => {
                const isBlocked = row.getValue("isBlocked");
                return <StatusBadge status={isBlocked ? "blocked" : "active"} />;
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const verifier = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedVerifier(verifier)}
                            className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/20"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(verifier._id, verifier.isBlocked)}
                            className={`hover:bg-opacity-20 ${verifier.isBlocked ? 'text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20' : 'text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/20'}`}
                        >
                            <Power className="mr-2 h-4 w-4" />
                            {verifier.isBlocked ? 'Activate' : 'Deactivate'}
                        </Button>
                    </div>
                );
            }
        }
    ], []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex w-full justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            Verifiers
                            <ShieldCheck className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Manage verification team members</p>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
                        onClick={() => navigate("/verifiers/add")}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Verifier
                    </Button>
                </div>
            </div>

            {loading && verifiers.length === 0 ? (
                <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading verifiers...</p>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={verifiers} 
                    searchValue={searchQuery}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Search by name, phone, email, address..."
                    pagination={{
                        page,
                        limit,
                        total,
                        pages: totalPages,
                        onPageChange: setPage
                    }}
                />
            )}

            {/* Verifier Details Modal */}
            {selectedVerifier && (
                <Dialog open={!!selectedVerifier} onOpenChange={(open) => !open && setSelectedVerifier(null)}>
                    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-4">
                                {selectedVerifier.photo ? (
                                    <img src={selectedVerifier.photo} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-md" />
                                ) : (
                                    <div className="h-16 w-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-md">
                                        <Shield className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                                    </div>
                                )}
                                <div>
                                    <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
                                        {selectedVerifier.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="outline" className="text-xs uppercase tracking-wider">{selectedVerifier.role}</Badge>
                                        <StatusBadge status={selectedVerifier.isBlocked ? "blocked" : "active"} />
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="w-full grid grid-cols-4 mb-6 bg-zinc-100/80 dark:bg-zinc-900">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="identity">Identity</TabsTrigger>
                                    <TabsTrigger value="address">Address</TabsTrigger>
                                    <TabsTrigger value="contact">Contact</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Full Name</p>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedVerifier.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Email Address</p>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedVerifier.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Primary Phone</p>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedVerifier.phone}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Date Joined</p>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {new Date(selectedVerifier.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="identity" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Aadhaar Card Number</p>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100 tracking-wider bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg inline-block">
                                                    {selectedVerifier.aadhaarCard?.replace(/(\d{4})/g, '$1 ').trim() || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase">Front Image</p>
                                                    {selectedVerifier.aadhaarFrontImage ? (
                                                        <a href={selectedVerifier.aadhaarFrontImage} target="_blank" rel="noopener noreferrer">
                                                            <img src={selectedVerifier.aadhaarFrontImage} alt="Aadhaar Front" className="w-full h-24 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 hover:opacity-90 transition-opacity" />
                                                        </a>
                                                    ) : (
                                                        <div className="w-full h-24 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">No Image</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase">Back Image</p>
                                                    {selectedVerifier.aadhaarBackImage ? (
                                                        <a href={selectedVerifier.aadhaarBackImage} target="_blank" rel="noopener noreferrer">
                                                            <img src={selectedVerifier.aadhaarBackImage} alt="Aadhaar Back" className="w-full h-24 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 hover:opacity-90 transition-opacity" />
                                                        </a>
                                                    ) : (
                                                        <div className="w-full h-24 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">No Image</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">PAN Card Number</p>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100 tracking-wider bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg inline-block">
                                                    {selectedVerifier.panCard || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-semibold text-zinc-500 uppercase">PAN Image</p>
                                                {selectedVerifier.panCardImage ? (
                                                    <a href={selectedVerifier.panCardImage} target="_blank" rel="noopener noreferrer">
                                                        <img src={selectedVerifier.panCardImage} alt="PAN Card" className="w-1/2 h-24 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 hover:opacity-90 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <div className="w-1/2 h-24 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">No Image</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="address" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="space-y-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                                Residential Address
                                            </h4>
                                            <div className="space-y-1">
                                                {selectedVerifier.houseNumber && <p className="text-sm text-zinc-800 dark:text-zinc-300"><span className="font-medium">House/Flat No:</span> {selectedVerifier.houseNumber}</p>}
                                                {selectedVerifier.houseAddress ? (
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedVerifier.houseAddress}</p>
                                                ) : (
                                                    <p className="text-sm text-zinc-400 italic">No residential address provided.</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                                Workplace / Business Address
                                            </h4>
                                            {selectedVerifier.workplaceAddress ? (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedVerifier.workplaceAddress}</p>
                                            ) : (
                                                <p className="text-sm text-zinc-400 italic">No workplace address provided.</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="contact" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">1</div>
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Primary Phone</p>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedVerifier.phone}</p>
                                            </div>
                                        </div>
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">2</div>
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Secondary Phone</p>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedVerifier.phone2 || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/60 flex items-center gap-4 sm:col-span-2">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">H</div>
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">House Phone</p>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedVerifier.housePhone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
