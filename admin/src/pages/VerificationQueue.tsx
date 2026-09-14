import { useEffect, useState } from "react";
import { verifierService, type QueuePartner, type AuditLogEntry } from "@/services/verifierService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CheckCircle2,
    XCircle,
    PauseCircle,
    MessageSquare,
    Clock,
    AlertTriangle,
    Search,
    Filter,
    Eye,
    FileText,
    User,
    Phone,
    MapPin,
    History,
    Copy,
    Camera,
    Loader2,
    ImageIcon,
    Navigation,
} from "lucide-react";
import { format } from "date-fns";

const statusOptions = [
    { value: "all", label: "All Pending" },
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "on_hold", label: "On Hold" },
    { value: "need_info", label: "Need Info" },
    { value: "rejected", label: "Rejected" },
];

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    under_review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    need_info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const actionLabels: Record<string, string> = {
    approve: "Approved",
    reject: "Rejected",
    put_on_hold: "Put on Hold",
    request_more_info: "Requested Info",
    submitted: "Submitted",
    site_visit: "Site Visit",
};

export default function VerificationQueue() {
    const [partners, setPartners] = useState<QueuePartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Action modal
    const [actionModal, setActionModal] = useState<{
        open: boolean;
        partner: QueuePartner | null;
        action: string;
    }>({ open: false, partner: null, action: "" });
    const [actionReason, setActionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Detail / Audit modal
    const [detailModal, setDetailModal] = useState<{
        open: boolean;
        partner: QueuePartner | null;
    }>({ open: false, partner: null });
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    // Site visit modal
    const [siteVisitModal, setSiteVisitModal] = useState<{
        open: boolean;
        partner: QueuePartner | null;
    }>({ open: false, partner: null });
    const [siteVisitImage, setSiteVisitImage] = useState<string>("");
    const [siteVisitImagePreview, setSiteVisitImagePreview] = useState<string>("");
    const [siteVisitLocation, setSiteVisitLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
        address: string;
    }>({ latitude: null, longitude: null, address: "" });
    const [locationLoading, setLocationLoading] = useState(false);
    const [siteVisitUploading, setSiteVisitUploading] = useState(false);
    // Track which partners have site visits done
    const [siteVisitMap, setSiteVisitMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchQueue();
        fetchCategories();
    }, []);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const data = await verifierService.getQueue({
                status: statusFilter || undefined,
                city: cityFilter || undefined,
                category: categoryFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setPartners(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load queue");
        } finally {
            setLoading(false);
        }
    };

    // Check site visit status for all partners after queue loads
    useEffect(() => {
        if (partners.length > 0) {
            checkAllSiteVisits();
        }
    }, [partners]);

    const checkAllSiteVisits = async () => {
        const map: Record<string, boolean> = {};
        await Promise.all(
            partners.map(async (p) => {
                try {
                    const has = await verifierService.checkSiteVisit(p._id);
                    map[p._id] = has;
                } catch {
                    map[p._id] = false;
                }
            })
        );
        setSiteVisitMap(map);
    };

    const fetchCategories = async () => {
        try {
            const data = await verifierService.getCategories();
            setCategories(data);
        } catch (e) { /* ignore */ }
    };

    const handleApplyFilters = () => {
        fetchQueue();
    };

    const handleClearFilters = () => {
        setStatusFilter("");
        setCityFilter("");
        setCategoryFilter("");
        setStartDate("");
        setEndDate("");
        setTimeout(fetchQueue, 0);
    };

    // Open action modal
    const openAction = (partner: QueuePartner, action: string) => {
        setActionModal({ open: true, partner, action });
        setActionReason("");
    };

    // Submit action
    const submitAction = async () => {
        if (!actionModal.partner) return;

        if (["reject", "request_more_info"].includes(actionModal.action) && !actionReason.trim()) {
            toast.error("Reason is mandatory for this action");
            return;
        }

        setActionLoading(true);
        try {
            await verifierService.performAction(
                actionModal.partner._id,
                actionModal.action,
                actionReason.trim() || undefined
            );
            toast.success(`Partner ${actionModal.action === "approve" ? "approved" : actionModal.action === "reject" ? "rejected" : actionModal.action === "put_on_hold" ? "put on hold" : "info requested"} successfully`);
            setActionModal({ open: false, partner: null, action: "" });
            fetchQueue();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Quick approve (no modal needed)
    const handleQuickApprove = async (partner: QueuePartner) => {
        if (!siteVisitMap[partner._id]) {
            toast.error("Site visit photo is required before approving. Please upload a site visit first.");
            return;
        }
        try {
            await verifierService.performAction(partner._id, "approve");
            toast.success(`${partner.name} approved successfully`);
            fetchQueue();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Approval failed");
        }
    };

    // Open detail modal with audit logs
    const openDetail = async (partner: QueuePartner) => {
        setDetailModal({ open: true, partner });
        setAuditLoading(true);
        try {
            const logs = await verifierService.getAuditLog(partner._id);
            setAuditLogs(logs);
        } catch (error) {
            setAuditLogs([]);
        } finally {
            setAuditLoading(false);
        }
    };

    const needsReason = ["reject", "request_more_info"].includes(actionModal.action);
    const actionTitle: Record<string, string> = {
        reject: "Reject Partner",
        put_on_hold: "Put on Hold",
        request_more_info: "Request More Info",
    };

    // Site visit modal handlers
    const openSiteVisitModal = (partner: QueuePartner) => {
        setSiteVisitModal({ open: true, partner });
        setSiteVisitImage("");
        setSiteVisitImagePreview("");
        setSiteVisitLocation({ latitude: null, longitude: null, address: "" });
        
        // Auto-capture GPS coordinates immediately upon opening to reduce manual clicks
        setTimeout(() => {
            captureLocation();
        }, 100);
    };

    const handleSiteVisitImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Strictly enforce location freshness at the exact moment of photo selection
            captureLocation();

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setSiteVisitImage(base64);
                setSiteVisitImagePreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const captureLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Try reverse geocoding
                let address = "";
                try {
                    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await resp.json();
                    address = data.display_name || "";
                } catch { /* ignore */ }
                setSiteVisitLocation({ latitude, longitude, address });
                setLocationLoading(false);
                toast.success("Location captured successfully");
            },
            (error) => {
                setLocationLoading(false);
                toast.error("Failed to capture location: " + error.message);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const submitSiteVisit = async () => {
        if (!siteVisitModal.partner) return;
        if (!siteVisitImage) {
            toast.error("Please select a photo");
            return;
        }
        if (!siteVisitLocation.latitude || !siteVisitLocation.longitude) {
            toast.error("Please capture your GPS location");
            return;
        }
        setSiteVisitUploading(true);
        try {
            await verifierService.uploadSiteVisit(siteVisitModal.partner._id, {
                image: siteVisitImage,
                latitude: siteVisitLocation.latitude,
                longitude: siteVisitLocation.longitude,
                address: siteVisitLocation.address || undefined
            });
            toast.success("Site visit uploaded successfully!");
            setSiteVisitModal({ open: false, partner: null });
            // Update the map
            setSiteVisitMap(prev => ({ ...prev, [siteVisitModal.partner!._id]: true }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setSiteVisitUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                    Verification Queue
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    {partners.length} partners waiting for review · Sorted oldest first
                </p>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Filters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="City"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="rounded-xl"
                    />

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((c: any) => (
                                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
                </div>
                <div className="flex gap-2 mt-3">
                    <Button onClick={handleApplyFilters} size="sm" className="rounded-xl bg-violet-600 hover:bg-violet-700">
                        <Search className="h-4 w-4 mr-1" /> Apply
                    </Button>
                    <Button onClick={handleClearFilters} size="sm" variant="outline" className="rounded-xl">
                        Clear
                    </Button>
                </div>
            </div>

            {/* Queue Table */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="h-8 w-8 border-2 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />
                    </div>
                ) : partners.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Queue is empty</p>
                        <p className="text-sm text-zinc-500 mt-1">All partners have been reviewed</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-800/50">
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Partner</th>
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Category</th>
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">City</th>
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Status</th>
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">SLA</th>
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Submitted</th>
                                    <th className="text-right px-5 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                {partners.map((p) => (
                                    <tr key={p._id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {p.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-white">{p.name}</p>
                                                    <p className="text-xs text-zinc-500">{p.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                                            {p.serviceCategory?.name || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                                            {p.address?.city || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[p.kycStatus] || ""}`}>
                                                {p.kycStatus.replace("_", " ").toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {p.slaBreached ? (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    {p.slaHoursElapsed}h (Breached)
                                                </span>
                                            ) : p.slaWarning ? (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {p.slaHoursElapsed}h (Warning)
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-500">{p.slaHoursElapsed}h</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-zinc-500">
                                            {format(new Date(p.kycSubmittedAt || p.createdAt), "dd MMM yyyy")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openDetail(p)}
                                                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-violet-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openSiteVisitModal(p)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        siteVisitMap[p._id]
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                                            : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 text-zinc-500 hover:text-orange-600'
                                                    }`}
                                                    title={siteVisitMap[p._id] ? "Site Visit Done ✓" : "Upload Site Visit Photo (Required)"}
                                                >
                                                    <Camera className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleQuickApprove(p)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        siteVisitMap[p._id]
                                                            ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-zinc-500 hover:text-emerald-600'
                                                            : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                                                    }`}
                                                    title={siteVisitMap[p._id] ? "Approve" : "Upload site visit first"}
                                                    disabled={!siteVisitMap[p._id]}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openAction(p, "reject")}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        siteVisitMap[p._id]
                                                            ? 'hover:bg-rose-50 dark:hover:bg-rose-900/20 text-zinc-500 hover:text-rose-600'
                                                            : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                                                    }`}
                                                    title={siteVisitMap[p._id] ? "Reject" : "Upload site visit first"}
                                                    disabled={!siteVisitMap[p._id]}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openAction(p, "put_on_hold")}
                                                    className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-zinc-500 hover:text-amber-600 transition-colors"
                                                    title="Put on Hold"
                                                >
                                                    <PauseCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openAction(p, "request_more_info")}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-500 hover:text-blue-600 transition-colors"
                                                    title="Request More Info"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Modal (Reject / Hold / Request Info) */}
            <Dialog open={actionModal.open} onOpenChange={(open) => !open && setActionModal({ open: false, partner: null, action: "" })}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{actionTitle[actionModal.action] || "Action"}</DialogTitle>
                        <DialogDescription>
                            {actionModal.partner?.name} · {actionModal.partner?.phone}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Reason {needsReason ? "(Required)" : "(Optional)"}
                        </label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="Enter reason..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionModal({ open: false, partner: null, action: "" })}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAction}
                            disabled={actionLoading || (needsReason && !actionReason.trim())}
                            className="rounded-xl bg-violet-600 hover:bg-violet-700"
                        >
                            {actionLoading ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail / Audit Modal */}
            <Dialog open={detailModal.open} onOpenChange={(open) => !open && setDetailModal({ open: false, partner: null })}>
                <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-violet-500" />
                            {detailModal.partner?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {detailModal.partner && (
                        <div className="space-y-5">
                            {/* Partner Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <Phone className="h-4 w-4" /> {detailModal.partner.phone}
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <MapPin className="h-4 w-4" /> {detailModal.partner.address?.city || "No city"}
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <FileText className="h-4 w-4" /> {detailModal.partner.serviceCategory?.name || "No category"}
                                </div>
                                <div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[detailModal.partner.kycStatus] || ""}`}>
                                        {detailModal.partner.kycStatus.replace("_", " ").toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Rejection Reason if present */}
                            {detailModal.partner.kycRejectionReason && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Rejection/Hold Reason</p>
                                    <p className="text-sm text-rose-600 dark:text-rose-300">{detailModal.partner.kycRejectionReason}</p>
                                </div>
                            )}

                            {/* KYC Location Preview */}
                            {detailModal.partner.kycLocation && detailModal.partner.kycLocation.latitude && (
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-violet-500" />
                                        Captured Location
                                    </h3>
                                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-zinc-50 dark:bg-zinc-800/50">
                                        <iframe
                                            width="100%"
                                            height="200"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight={0}
                                            marginWidth={0}
                                            src={`https://maps.google.com/maps?q=${detailModal.partner.kycLocation.latitude},${detailModal.partner.kycLocation.longitude}&z=15&output=embed`}
                                            className="border-b border-zinc-200 dark:border-white/10"
                                            title="KYC Location Map"
                                        ></iframe>
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="flex-1 pr-4">
                                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                                    {detailModal.partner.kycLocation.address || 'Address not available'}
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    Lat: {detailModal.partner.kycLocation.latitude.toFixed(6)}, Lng: {detailModal.partner.kycLocation.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs rounded-lg flex-shrink-0"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${detailModal.partner!.kycLocation!.latitude}, ${detailModal.partner!.kycLocation!.longitude}`);
                                                    alert("Coordinates copied to clipboard!");
                                                }}
                                            >
                                                <Copy className="h-3 w-3 mr-1.5" /> Copy
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* KYC Documents */}
                            {detailModal.partner.kycDocuments && detailModal.partner.kycDocuments.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">KYC Documents</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {detailModal.partner.kycDocuments.map((doc: any) => (
                                            <div key={doc._id} className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden">
                                                {/* Image Preview */}
                                                {doc.imageUrl && (
                                                    <a href={doc.imageUrl} target="_blank" rel="noopener noreferrer" className="block group">
                                                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                                                            <img
                                                                src={doc.imageUrl}
                                                                alt={`${doc.documentType} ${doc.side || ''}`}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                    </a>
                                                )}
                                                {/* Document Info */}
                                                <div className="p-3">
                                                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                                                        {doc.documentType}{doc.side ? ` (${doc.side})` : ''}
                                                    </p>
                                                    {doc.documentNumber && <p className="text-xs text-zinc-500 mt-0.5">{doc.documentNumber}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Audit Trail */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                                    <History className="h-4 w-4" /> Audit Trail
                                </h3>
                                {auditLoading ? (
                                    <div className="flex justify-center py-4">
                                        <div className="h-5 w-5 border-2 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />
                                    </div>
                                ) : auditLogs.length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-3">No audit history</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {auditLogs.map((log) => (
                                            <div key={log._id} className={`p-2.5 rounded-xl text-xs ${log.action === 'site_visit' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40' : 'bg-zinc-50 dark:bg-zinc-800/50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <span className={`px-2 py-0.5 rounded-md font-semibold shrink-0 ${log.action === 'site_visit' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400' : statusColors[log.newStatus] || "bg-zinc-100 text-zinc-600"}`}>
                                                        {actionLabels[log.action] || log.action}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        {log.reason && <p className="text-zinc-600 dark:text-zinc-400 truncate">{log.reason}</p>}
                                                        <p className="text-zinc-400 mt-0.5">
                                                            by {log.verifierId?.name || "System"} · {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm a")}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Site Visit Image & Location */}
                                                {log.action === 'site_visit' && (
                                                    <div className="mt-3 space-y-2">
                                                        {log.siteVisitImage && (
                                                            <a href={log.siteVisitImage} target="_blank" rel="noopener noreferrer" className="block group">
                                                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-orange-200 dark:border-orange-800/40">
                                                                    <img src={log.siteVisitImage} alt="Site Visit" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        )}
                                                        {log.siteVisitLocation && log.siteVisitLocation.latitude && (
                                                            <div className="rounded-lg border border-orange-200 dark:border-orange-800/40 overflow-hidden">
                                                                <iframe
                                                                    width="100%"
                                                                    height="120"
                                                                    frameBorder="0"
                                                                    scrolling="no"
                                                                    src={`https://maps.google.com/maps?q=${log.siteVisitLocation.latitude},${log.siteVisitLocation.longitude}&z=15&output=embed`}
                                                                    title="Site Visit Location"
                                                                ></iframe>
                                                                <div className="p-2 text-[10px] text-zinc-500">
                                                                    {log.siteVisitLocation.address || `${log.siteVisitLocation.latitude.toFixed(5)}, ${log.siteVisitLocation.longitude.toFixed(5)}`}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Site Visit Upload Modal */}
            <Dialog open={siteVisitModal.open} onOpenChange={(open) => !open && setSiteVisitModal({ open: false, partner: null })}>
                <DialogContent className="sm:max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-orange-500" />
                            Site Visit Photo
                        </DialogTitle>
                        <DialogDescription>
                            Upload a photo from {siteVisitModal.partner?.name}'s location with your GPS coordinates.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        {/* Image Upload */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Photo *</label>
                            {siteVisitImagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10">
                                    <img src={siteVisitImagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                    <button
                                        onClick={() => { setSiteVisitImage(""); setSiteVisitImagePreview(""); }}
                                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors">
                                    <ImageIcon className="h-10 w-10 text-zinc-400 mb-2" />
                                    <span className="text-sm text-zinc-500 font-medium">Click to upload photo</span>
                                    <span className="text-xs text-zinc-400 mt-1">Take a photo at the partner's location</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleSiteVisitImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* GPS Location */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">GPS Location *</label>
                            {siteVisitLocation.latitude && siteVisitLocation.longitude ? (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                        <Navigation className="h-4 w-4" />
                                        Location Captured ✓
                                    </div>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                        Lat: {siteVisitLocation.latitude.toFixed(6)}, Lng: {siteVisitLocation.longitude.toFixed(6)}
                                    </p>
                                    {siteVisitLocation.address && (
                                        <p className="text-xs text-zinc-500 leading-relaxed">{siteVisitLocation.address}</p>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg text-xs mt-1"
                                        onClick={captureLocation}
                                        disabled={locationLoading}
                                    >
                                        {locationLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Navigation className="h-3 w-3 mr-1" />}
                                        Re-capture
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full h-16 rounded-xl border-dashed border-2 flex flex-col gap-1 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:border-orange-500 dark:hover:bg-orange-900/10 transition-colors"
                                    onClick={captureLocation}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                            <span className="text-xs text-zinc-500">Capturing location...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="h-5 w-5 text-zinc-400" />
                                            <span className="text-xs text-zinc-500">Tap to capture your GPS location</span>
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSiteVisitModal({ open: false, partner: null })}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitSiteVisit}
                            disabled={siteVisitUploading || !siteVisitImage || !siteVisitLocation.latitude}
                            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {siteVisitUploading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                            ) : (
                                <><Camera className="h-4 w-4 mr-2" /> Upload Site Visit</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
