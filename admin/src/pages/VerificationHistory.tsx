import { useEffect, useMemo, useState } from "react";
import { verifierService, type AuditLogEntry } from "@/services/verifierService";
import { format } from "date-fns";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { History, ShieldCheck, ArrowUpDown, UserCircle, Camera, MapPin, ExternalLink, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerDetailsDialog } from "@/components/PartnerDetailsDialog";
import { adminService } from "@/services/adminService";
import type { Partner } from "@/pages/Partners";
import { toast } from "sonner";

const actionColors: Record<string, string> = {
    approve: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    reject: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    put_on_hold: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    request_more_info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    site_visit: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const actionLabels: Record<string, string> = {
    approve: "Approved",
    reject: "Rejected",
    put_on_hold: "Hold",
    request_more_info: "Need Info",
    site_visit: "Site Visit",
};

export default function VerificationHistory() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [previewLog, setPreviewLog] = useState<AuditLogEntry | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const { data } = await verifierService.getHistory(1, 500); // Fetching up to 500 latest entries for history table
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerClick = async (partnerId: string) => {
        try {
            const partner = await adminService.getPartnerById(partnerId);
            setSelectedPartner(partner);
        } catch (error) {
            toast.error("Failed to fetch partner details");
        }
    };

    const handleVerifyKyc = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await adminService.verifyPartnerKyc(id, status);
            toast.success(`KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`);
            loadHistory();
        } catch (error) {
            toast.error("Failed to update KYC status");
        }
    };

    const handleVerifyBank = async (id: string) => {
        try {
            await adminService.verifyPartnerBankDetails(id);
            toast.success("Bank details verified");
            if (selectedPartner) {
                setSelectedPartner({
                    ...selectedPartner,
                    bankDetails: {
                        ...selectedPartner.bankDetails!,
                        isVerified: true
                    }
                });
            }
            loadHistory();
        } catch (error) {
            toast.error("Failed to verify bank details");
        }
    };

    const handleVerifyDocument = async (docId: string, status: 'approved' | 'rejected') => {
        try {
            await adminService.updateKycDocumentStatus(docId, status);
            toast.success(`Document ${status}`);
            loadHistory();
        } catch (error) {
            toast.error("Failed to update KYC status");
        }
    };

    const columns = useMemo<ColumnDef<AuditLogEntry>[]>(() => [
        {
            accessorKey: "timestamp",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-violet-600 dark:hover:text-violet-400 font-bold uppercase tracking-widest text-[10px] text-zinc-500"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date / Time
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">
                        {format(new Date(row.original.timestamp), "dd MMM yyyy")}
                    </span>
                    <span className="text-xs text-zinc-500">
                        {format(new Date(row.original.timestamp), "hh:mm a")}
                    </span>
                </div>
            )
        },
        {
            id: "partner",
            header: "Partner",
            cell: ({ row }) => {
                const partner = row.original.partnerId;
                if (!partner) return <span className="text-zinc-500">Deleted Partner</span>;
                return (
                    <div 
                        className="flex flex-col cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-1.5 -ml-1.5 rounded-lg transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        onClick={() => handlePartnerClick((partner as any)._id)}
                    >
                        <span className="font-medium text-violet-600 dark:text-violet-400 group-hover:underline flex items-center gap-1.5">
                            <UserCircle className="w-3.5 h-3.5" />
                            {partner.name}
                        </span>
                        <span className="text-xs text-zinc-500 ml-5">{partner.phone}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "action",
            header: "Action Taken",
            cell: ({ row }) => {
                const action = row.getValue("action") as string;
                return (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${actionColors[action] || "text-zinc-600 bg-zinc-100"}`}>
                        {actionLabels[action] || action}
                    </span>
                )
            }
        },
        {
            accessorKey: "reason",
            header: "Reason / Notes",
            cell: ({ row }) => {
                const reason = row.getValue("reason") as string;
                const action = row.original.action;
                if (action === 'site_visit') {
                    return (
                        <span className="text-xs text-zinc-500 italic">Site verification visit</span>
                    )
                }
                return (
                    <div className="max-w-[300px] text-sm text-zinc-600 dark:text-zinc-400 truncate" title={reason}>
                        {reason || "-"}
                    </div>
                )
            }
        },
        {
            id: "siteVisit",
            header: "Site Visit Details",
            cell: ({ row }) => {
                const log = row.original;
                const partnerLoc = log.partnerId?.kycLocation;
                const verifierLoc = log.siteVisitLocation;
                const img = log.siteVisitImage;

                if (!img && !verifierLoc && !partnerLoc) {
                    return (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                            <span className="text-sm">—</span>
                        </div>
                    );
                }

                return (
                    <Button 
                        onClick={() => setPreviewLog(log)}
                        variant="outline" 
                        size="sm"
                        className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 bg-orange-50/50 dark:bg-orange-900/10 dark:hover:bg-orange-900/30 dark:border-orange-900/50 dark:text-orange-400 font-medium"
                    >
                        <Camera className="w-3.5 h-3.5 mr-1.5" />
                        View Details
                    </Button>
                );
            }
        },
        {
            id: "verifier",
            header: "Verifier",
            cell: ({ row }) => {
                const verifier = row.original.verifierId;
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                           <ShieldCheck className="w-3 h-3 text-zinc-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                             {verifier?.name || 'System'}
                        </span>
                    </div>
                )
            }
        }
    ], []);

    const filteredLogs = useMemo(() => {
        let filtered = logs;
        if (startDate) {
            filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(log => new Date(log.timestamp) <= end);
        }
        return filtered;
    }, [logs, startDate, endDate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl relative overflow-hidden group gap-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        Verification History
                        <History className="h-6 w-6 text-violet-500 dark:text-violet-400" />
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Complete audit trail of all KYC actions</p>
                </div>
                
                <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex flex-col w-full sm:w-auto">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 ml-1">Start Date</label>
                        <Input 
                            type="date" 
                            className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 w-full"
                            value={startDate}
                            onChange={(e) => {
                                const newStart = e.target.value;
                                if (newStart && endDate && new Date(newStart) > new Date(endDate)) {
                                    toast.error("Start date cannot be after end date.");
                                    return;
                                }
                                setStartDate(newStart);
                            }}
                        />
                    </div>
                    <div className="flex flex-col w-full sm:w-auto">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1 ml-1">End Date</label>
                        <Input 
                            type="date" 
                            className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 w-full"
                            value={endDate}
                            onChange={(e) => {
                                const newEnd = e.target.value;
                                if (startDate && newEnd && new Date(startDate) > new Date(newEnd)) {
                                    toast.error("Start date cannot be after end date.");
                                    return;
                                }
                                setEndDate(newEnd);
                            }}
                            min={startDate}
                        />
                    </div>
                    {(startDate || endDate) && (
                        <div className="flex flex-col w-full sm:w-auto sm:self-end">
                            <Button 
                                variant="ghost" 
                                className="h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0"
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <DataTable columns={columns} data={filteredLogs} searchKey="action" />

            <PartnerDetailsDialog
                partner={selectedPartner}
                onClose={() => setSelectedPartner(null)}
                onVerifyKyc={handleVerifyKyc}
                onVerifyDocument={handleVerifyDocument}
                onVerifyBank={handleVerifyBank}
                onToggleStatus={async (id, active) => {
                    try {
                        await adminService.togglePartnerStatus(id, active);
                        toast.success(`Partner ${active ? 'Activated' : 'Deactivated'}`);
                        loadHistory();
                    } catch (err) {
                        toast.error("Failed to toggle status");
                    }
                }}
            />

            {/* Live Location Preview Modal */}
            <Dialog open={!!previewLog} onOpenChange={(open) => !open && setPreviewLog(null)}>
                <DialogContent className="sm:max-w-5xl rounded-3xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                    
                    {/* Global Header */}
                    <div className="pl-6 pr-14 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between relative">
                        <div>
                            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                Location & Visit Analysis
                                <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-widest leading-none">Live Audit</span>
                            </DialogTitle>
                            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                                <UserCircle className="w-4 h-4 opacity-70" />
                                Partner: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{previewLog?.partnerId?.name || "Unknown"}</span>
                            </DialogDescription>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Evaluation Date</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 mt-0.5">
                                {previewLog?.timestamp ? format(new Date(previewLog.timestamp), "dd MMM yyyy, hh:mm a") : "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row h-auto max-h-[80vh] md:h-[75vh] md:max-h-[850px] md:min-h-[600px] bg-white dark:bg-zinc-950 overflow-y-auto overflow-x-hidden md:overflow-hidden">
                        {/* Left Column: Photo Evidence (40% width) */}
                        <div className="w-full md:w-5/12 h-[300px] sm:h-[400px] md:h-full bg-zinc-100 dark:bg-black relative shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
                            {previewLog?.siteVisitImage ? (
                                <a href={previewLog.siteVisitImage} target="_blank" rel="noopener noreferrer" className="block w-full h-full group relative">
                                    <img 
                                        src={previewLog.siteVisitImage} 
                                        alt="Visit Evidence" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none">
                                        <div className="flex z-10 relative items-start gap-4">
                                            <div className="p-2 md:p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-white shadow-xl">
                                                <Camera className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <div className="drop-shadow-md">
                                                <h3 className="font-bold text-base md:text-lg text-white">Site Visit Photo</h3>
                                                <p className="text-xs md:text-sm text-zinc-300 mt-0.5 md:mt-1">
                                                    Uploaded by <span className="font-semibold text-white">{previewLog.verifierId?.name || "Verifier"}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/60 border border-white/20 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md hover:bg-black">
                                        <ExternalLink className="h-5 w-5" />
                                    </div>
                                </a>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600">
                                    <div className="p-5 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50 mb-4 border border-zinc-200 dark:border-zinc-800">
                                        <Camera className="h-10 w-10 opacity-50" />
                                    </div>
                                    <p className="text-base font-semibold text-zinc-600 dark:text-zinc-400">No Image Uploaded</p>
                                    <p className="text-sm mt-1 max-w-[250px] text-center px-4">There is no photographic evidence on file for this audit.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Vertically Stacked Maps (60% width) */}
                        <div className="w-full md:w-7/12 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 overflow-visible md:overflow-y-auto">
                            
                            {/* Partner Registered Address Block */}
                            <div className="flex-none md:flex-1 flex flex-col min-h-[350px]">
                                <div className="p-4 md:p-5 bg-white dark:bg-zinc-900/40 flex flex-col gap-3 shrink-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 rounded-xl border border-violet-200 dark:border-violet-500/30 shadow-sm shrink-0">
                                            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100">Registered Partner Address</h4>
                                            {previewLog?.partnerId?.kycLocation?.latitude ? (
                                                <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                                                    {previewLog.partnerId.kycLocation.latitude.toFixed(6)}, {previewLog.partnerId.kycLocation.longitude.toFixed(6)}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] md:text-xs text-zinc-400 italic mt-0.5">Coordinates not captured</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative w-full min-h-[250px] bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-0">
                                    {previewLog?.partnerId?.kycLocation?.latitude ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            src={`https://maps.google.com/maps?q=${previewLog.partnerId.kycLocation.latitude},${previewLog.partnerId.kycLocation.longitude}&z=15&output=embed`}
                                            title="Partner Location"
                                            className="absolute inset-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 text-sm text-center p-6 pb-12">
                                            <MapPin className="h-8 w-8 md:h-10 md:w-10 mb-4 opacity-20" />
                                            <span>No GPS map available for partner profile.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Verifier Site Visit GPS Block */}
                            <div className="flex-none md:flex-1 flex flex-col min-h-[350px]">
                                <div className="p-4 md:p-5 bg-white dark:bg-zinc-900/40 flex flex-col gap-3 shrink-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 rounded-xl border border-orange-200 dark:border-orange-500/30 shadow-sm shrink-0">
                                            <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100">Live Site Visit Location (Verifier)</h4>
                                            {previewLog?.siteVisitLocation?.latitude ? (
                                                <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                                                    {previewLog.siteVisitLocation.latitude.toFixed(6)}, {previewLog.siteVisitLocation.longitude.toFixed(6)}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] md:text-xs text-zinc-400 italic mt-0.5">Coordinates not captured</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 relative w-full min-h-[250px] bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-0">
                                    {previewLog?.siteVisitLocation?.latitude ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            src={`https://maps.google.com/maps?q=${previewLog.siteVisitLocation.latitude},${previewLog.siteVisitLocation.longitude}&z=16&output=embed`}
                                            title="Verifier Location"
                                            className="absolute inset-0 opacity-100"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 text-sm text-center p-6 pb-12">
                                            <Navigation className="h-8 w-8 md:h-10 md:w-10 mb-4 opacity-20" />
                                            <span>No GPS map available for this site visit.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
