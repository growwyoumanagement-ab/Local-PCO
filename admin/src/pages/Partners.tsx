import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, EyeOff, ShieldCheck, CheckCircle, XCircle, Power, Download, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { PartnerDetailsDialog } from "@/components/PartnerDetailsDialog";

import { useEffect, useMemo, useState, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

export type KYCDocument = {
    _id: string;
    documentType: string;
    imageUrl: string;
    status: string;
}

export type Partner = {
    _id: string
    name: string
    email?: string
    phone: string
    serviceCategory?: { _id: string; name: string } | string
    serviceCategories?: ({ _id: string; name: string } | string)[]
    serviceSubcategory?: string
    address?: {
        street?: string
        city?: string
        state?: string
        pincode?: string
        country?: string
    }
    isActive: boolean
    isOnline: boolean
    kycStatus: "verified" | "pending" | "rejected" | "approved" | "under_review" | "on_hold" | "need_info"
    kycDocuments?: KYCDocument[]
    bankAccounts?: {
        _id: string
        accountHolderName: string
        accountNumber: string
        bankName: string
        ifsc: string
        isPrimary: boolean
        isActive: boolean
    }[]
    bankDetails?: {
        accountHolderName?: string
        accountNumber?: string
        bankName?: string
        ifsc?: string
        isVerified?: boolean
    }
    lastActive?: string
}

const initialNewPartner = {
    name: '',
    phone: '',
    email: '',
    password: '',
    serviceCategories: [] as string[],
    serviceSubcategory: '',
    city: '',
    state: '',
    street: '',
    pincode: ''
};

export default function Partners() {
    const [data, setData] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Filter & Search states
    const [services, setServices] = useState<any[]>([]);
    const [showAddPartner, setShowAddPartner] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [kycFilter, setKycFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [newPartner, setNewPartner] = useState(initialNewPartner);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const resetAddPartnerForm = () => {
        setNewPartner(initialNewPartner);
        setIsPasswordVisible(false);
    };

    const handleOpenAddPartner = (open: boolean) => {
        if (!open) {
            resetAddPartnerForm();
        }
        setShowAddPartner(open);
    };

    const loadServices = async () => {
        try {
            const data = await adminService.getAllServices();
            setServices(data.filter((s: any) => s.isActive));
        } catch (error) {
            console.error("Failed to load services", error);
        }
    };

    const loadPartners = useCallback(async (
        currentPage = page,
        currentStatus = statusFilter,
        currentKyc = kycFilter,
        currentSearch = searchQuery,
        currentSortBy = sortBy,
        currentSortOrder = sortOrder
    ) => {
        try {
            setLoading(true);
            const response = await adminService.getAllPartners({
                page: currentPage,
                limit,
                status: currentStatus,
                kycStatus: currentKyc,
                search: currentSearch,
                sortBy: currentSortBy,
                sortOrder: currentSortOrder
            });

            setData(response.data || []);
            setTotal(response.pagination?.total || 0);
            setTotalPages(response.pagination?.pages || 1);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to load partners");
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, kycFilter, searchQuery, sortBy, sortOrder]);

    useEffect(() => {
        loadServices();
    }, []);

    // Fetch partners when pagination, filters, search, or sorting changes
    useEffect(() => {
        loadPartners(page, statusFilter, kycFilter, searchQuery, sortBy, sortOrder);
    }, [page, statusFilter, kycFilter, searchQuery, sortBy, sortOrder, loadPartners]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1); // Reset to page 1 on search
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPartner.name.trim() || !newPartner.phone.trim() || !newPartner.password.trim() || newPartner.serviceCategories.length === 0) {
            toast.error("Please fill in Name, Phone, Password, and select at least one Service Category");
            return;
        }

        if (newPartner.phone.length !== 10 || !/^\d+$/.test(newPartner.phone)) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: newPartner.name.trim(),
                phone: newPartner.phone.trim(),
                email: newPartner.email.trim() || undefined,
                password: newPartner.password,
                serviceCategory: newPartner.serviceCategories[0],
                serviceCategories: newPartner.serviceCategories,
                serviceSubcategory: newPartner.serviceSubcategory.trim() || undefined,
                address: {
                    city: newPartner.city.trim() || undefined,
                    state: newPartner.state.trim() || undefined,
                    street: newPartner.street.trim() || undefined,
                    pincode: newPartner.pincode.trim() || undefined
                }
            };

            await adminService.createPartner(payload);
            toast.success("Partner created successfully");
            handleOpenAddPartner(false);
            loadPartners(1, statusFilter, kycFilter, searchQuery, sortBy, sortOrder);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add partner");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleCategory = (catId: string) => {
        setNewPartner(prev => {
            const exists = prev.serviceCategories.includes(catId);
            const next = exists
                ? prev.serviceCategories.filter(id => id !== catId)
                : [...prev.serviceCategories, catId];
            return { ...prev, serviceCategories: next };
        });
    };

    const handleVerifyKyc = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await adminService.verifyPartnerKyc(id, status);
            toast.success(`KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`);
            loadPartners(page, statusFilter, kycFilter, searchQuery, sortBy, sortOrder);
        } catch (error) {
            toast.error("Failed to update KYC status");
        }
    };

    const handleToggleStatus = async (id: string, targetActive: boolean) => {
        try {
            await adminService.togglePartnerStatus(id, targetActive);
            toast.success(`Partner ${targetActive ? 'Activated' : 'Deactivated'}`);
            loadPartners(page, statusFilter, kycFilter, searchQuery, sortBy, sortOrder);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleVerifyBank = async (id: string, accountId?: string) => {
        try {
            await adminService.verifyPartnerBankDetails(id, accountId);
            toast.success("Bank details verified");
            if (selectedPartner) {
                const refreshed = await adminService.getPartnerById(id);
                setSelectedPartner(refreshed);
            }
            loadPartners(page, statusFilter, kycFilter, searchQuery, sortBy, sortOrder);
        } catch (error) {
            toast.error("Failed to verify bank details");
        }
    };

    const handleVerifyDocument = async (docId: string, status: 'approved' | 'rejected') => {
        try {
            await adminService.updateKycDocumentStatus(docId, status);
            toast.success(`Document ${status}`);
            if (selectedPartner) {
                const refreshed = await adminService.getPartnerById(selectedPartner._id);
                setSelectedPartner(refreshed);
            }
            loadPartners(page, statusFilter, kycFilter, searchQuery, sortBy, sortOrder);
        } catch (error) {
            toast.error("Failed to update document status");
        }
    };

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Phone', 'Email', 'Service Categories', 'Subcategory', 'City', 'KYC Status', 'Account Status'];
        const csvData = data.map(p => {
            let catNames = '';
            if (p.serviceCategories && p.serviceCategories.length > 0) {
                catNames = p.serviceCategories.map(c => typeof c === 'object' && c !== null ? (c as any).name : c).join('; ');
            } else if (p.serviceCategory) {
                catNames = typeof p.serviceCategory === 'object' && p.serviceCategory !== null ? (p.serviceCategory as any).name : String(p.serviceCategory);
            }

            return [
                `"${p._id}"`,
                `"${p.name || ''}"`,
                `"${p.phone || ''}"`,
                `"${p.email || ''}"`,
                `"${catNames || ''}"`,
                `"${p.serviceSubcategory || ''}"`,
                `"${p.address?.city || ''}"`,
                `"${p.kycStatus === 'approved' ? 'verified' : p.kycStatus}"`,
                `"${p.isActive ? 'active' : 'inactive'}"`
            ];
        });
        const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `partners_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = useMemo<ColumnDef<Partner>[]>(() => [
        {
            accessorKey: "name",
            header: () => {
                return (
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
                )
            },
            cell: ({ row }) => (
                <div className="flex flex-col">
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
                    <span className="text-xs text-zinc-500">{row.original.email || 'No email'}</span>
                </div>
            )
        },
        {
            id: "serviceCategories",
            header: "Services",
            cell: ({ row }) => {
                const p = row.original;
                const categories: string[] = [];

                if (p.serviceCategories && p.serviceCategories.length > 0) {
                    p.serviceCategories.forEach(cat => {
                        const name = typeof cat === 'object' && cat !== null ? (cat as any).name : String(cat);
                        if (name) categories.push(name);
                    });
                } else if (p.serviceCategory) {
                    const name = typeof p.serviceCategory === 'object' && p.serviceCategory !== null ? (p.serviceCategory as any).name : String(p.serviceCategory);
                    if (name) categories.push(name);
                }

                return (
                    <div className="flex flex-wrap gap-1.5 py-1 max-w-xs">
                        {categories.length > 0 ? (
                            categories.map((catName, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                                >
                                    {catName}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-zinc-400">N/A</span>
                        )}
                        {p.serviceSubcategory && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {p.serviceSubcategory}
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            id: "location",
            header: "Location",
            cell: ({ row }) => {
                const addr = row.original.address;
                if (!addr || (!addr.city && !addr.state)) {
                    return <span className="text-sm text-zinc-400">N/A</span>;
                }
                const parts = [addr.city, addr.state].filter(Boolean);
                return <span className="text-sm text-zinc-600 dark:text-zinc-400">{parts.join(', ')}</span>;
            }
        },
        {
            accessorKey: "kycStatus",
            header: "KYC Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("kycStatus") === 'approved' ? 'verified' : row.getValue("kycStatus")} />,
        },
        {
            accessorKey: "isOnline",
            header: "Availability",
            cell: ({ row }) => {
                const isOnline = row.getValue("isOnline");
                return (
                    <div className="flex items-center gap-2">
                        <span className={`relative flex h-2.5 w-2.5`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'hidden'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}></span>
                        </span>
                        <span className={`text-xs font-medium ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("isActive") ? 'active' : 'inactive'} />,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const partner = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(partner._id);
                                        toast.success("Partner ID copied to clipboard");
                                    } catch (err) {
                                        toast.error("Failed to copy Partner ID");
                                    }
                                }}
                                className="cursor-pointer focus:bg-violet-50 dark:focus:bg-violet-600 focus:text-violet-600 dark:focus:text-white"
                            >
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

                            {['pending', 'under_review'].includes(partner.kycStatus) && (
                                <>
                                    <DropdownMenuItem onClick={() => handleVerifyKyc(partner._id, 'approved')} className="text-emerald-600 focus:text-white focus:bg-emerald-600 cursor-pointer">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve KYC
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleVerifyKyc(partner._id, 'rejected')} className="text-rose-600 focus:text-white focus:bg-rose-600 cursor-pointer">
                                        <XCircle className="mr-2 h-4 w-4" /> Reject KYC
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                </>
                            )}

                            <DropdownMenuItem onClick={() => handleToggleStatus(partner._id, !partner.isActive)} className="cursor-pointer focus:bg-violet-50 dark:focus:bg-violet-600 focus:text-violet-600 dark:focus:text-white">
                                <Power className="mr-2 h-4 w-4" /> {partner.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

                            <DropdownMenuItem onClick={() => setSelectedPartner(partner)} className="cursor-pointer focus:bg-violet-50 dark:focus:bg-violet-600 focus:text-violet-600 dark:focus:text-white">
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [sortBy, sortOrder]);

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl relative overflow-hidden group gap-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 w-full flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            Partners
                            <ShieldCheck className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Manage service provider network</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <Select value={kycFilter} onValueChange={(val) => { setKycFilter(val); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-zinc-800">
                                <SelectValue placeholder="KYC Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All KYC</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-white dark:bg-zinc-800">
                                <SelectValue placeholder="Account Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                        <Button className="gap-2 shrink-0 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20" onClick={() => handleOpenAddPartner(true)}>
                            <Plus className="w-4 h-4" /> Add Partner
                        </Button>
                    </div>
                </div>
            </div>

            {loading && data.length === 0 ? (
                <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading partners...</p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    searchValue={searchQuery}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Search by name, phone, email, city..."
                    pagination={{
                        page,
                        limit,
                        total,
                        pages: totalPages,
                        onPageChange: setPage
                    }}
                />
            )}

            <PartnerDetailsDialog
                partner={selectedPartner}
                onClose={() => setSelectedPartner(null)}
                onVerifyKyc={handleVerifyKyc}
                onVerifyDocument={handleVerifyDocument}
                onVerifyBank={handleVerifyBank}
                onToggleStatus={handleToggleStatus}
            />

            {/* Add Partner Dialog with clean reset */}
            <Dialog open={showAddPartner} onOpenChange={handleOpenAddPartner}>
                <DialogContent className="sm:max-w-[550px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Partner</DialogTitle>
                        <DialogDescription>
                            Create a new partner account. They will use their phone number and password to login.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPartner} className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name *</label>
                            <Input
                                required
                                placeholder="E.g. John Doe"
                                value={newPartner.name}
                                onChange={e => setNewPartner({ ...newPartner, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone (10 digits) *</label>
                                <Input
                                    required
                                    placeholder="E.g. 9876543210"
                                    value={newPartner.phone}
                                    maxLength={10}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) {
                                            setNewPartner({ ...newPartner, phone: val });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password *</label>
                                <div className="relative">
                                    <Input
                                        required
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Temp password"
                                        value={newPartner.password}
                                        onChange={e => setNewPartner({ ...newPartner, password: e.target.value })}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    >
                                        {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="E.g. john@example.com"
                                value={newPartner.email}
                                onChange={e => setNewPartner({ ...newPartner, email: e.target.value })}
                            />
                        </div>

                        {/* Multiple Service Categories Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                                <span>Service Categories *</span>
                                <span className="text-xs text-zinc-500 font-normal">Select one or more</span>
                            </label>
                            <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 max-h-36 overflow-y-auto">
                                {services.map(s => {
                                    const isSelected = newPartner.serviceCategories.includes(s._id);
                                    return (
                                        <button
                                            type="button"
                                            key={s._id}
                                            onClick={() => handleToggleCategory(s._id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                isSelected
                                                    ? 'bg-violet-600 text-white shadow-sm'
                                                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                            }`}
                                        >
                                            {s.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subcategory (Optional)</label>
                            <Input
                                placeholder="E.g. AC Repair"
                                value={newPartner.serviceSubcategory}
                                onChange={e => setNewPartner({ ...newPartner, serviceSubcategory: e.target.value })}
                            />
                        </div>

                        {/* Partner Address & City */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">City</label>
                                <Input
                                    placeholder="E.g. Mumbai"
                                    value={newPartner.city}
                                    onChange={e => setNewPartner({ ...newPartner, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">State</label>
                                <Input
                                    placeholder="E.g. Maharashtra"
                                    value={newPartner.state}
                                    onChange={e => setNewPartner({ ...newPartner, state: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenAddPartner(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 text-white">
                                {isSubmitting ? "Adding..." : "Add Partner"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
