import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck, Eye, CheckCircle, KeyRound, EyeOff, XCircle, Plus, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import type { Partner } from "@/pages/Partners";
import { Switch } from "@/components/ui/switch";

interface PartnerDetailsDialogProps {
    partner: Partner | null;
    onClose: () => void;
    onVerifyKyc?: (id: string, status: 'approved' | 'rejected') => void;
    onVerifyDocument: (docId: string, status: 'approved' | 'rejected') => void;
    onVerifyBank: (id: string, accountId?: string) => void;
    onToggleStatus?: (id: string, isActive: boolean) => void;
}

export function PartnerDetailsDialog({
    partner,
    onClose,
    onVerifyDocument,
    onVerifyBank,
    onToggleStatus
}: PartnerDetailsDialogProps) {
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Add Bank Account State
    const [showAddBank, setShowAddBank] = useState(false);
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [bankForm, setBankForm] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifsc: '',
        isPrimary: false
    });

    if (!partner) return null;

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsResetting(true);
        try {
            await adminService.resetPartnerPassword(partner._id, newPassword);
            toast.success("Password reset successfully");
            setShowPasswordReset(false);
            setNewPassword("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setIsResetting(false);
        }
    };

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankForm.accountHolderName.trim() || !bankForm.accountNumber.trim() || !bankForm.bankName.trim() || !bankForm.ifsc.trim()) {
            toast.error("Please fill in all bank details");
            return;
        }

        setIsAddingBank(true);
        try {
            await adminService.addPartnerBankAccount(partner._id, bankForm);
            toast.success("Bank account added successfully");
            setShowAddBank(false);
            setBankForm({ accountHolderName: '', accountNumber: '', bankName: '', ifsc: '', isPrimary: false });
            // Trigger refresh via onVerifyBank callback
            onVerifyBank(partner._id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add bank account");
        } finally {
            setIsAddingBank(false);
        }
    };

    // Extract categories
    const categories: string[] = [];
    if (partner.serviceCategories && partner.serviceCategories.length > 0) {
        partner.serviceCategories.forEach(cat => {
            const name = typeof cat === 'object' && cat !== null ? (cat as any).name : String(cat);
            if (name) categories.push(name);
        });
    } else if (partner.serviceCategory) {
        const name = typeof partner.serviceCategory === 'object' && partner.serviceCategory !== null ? (partner.serviceCategory as any).name : String(partner.serviceCategory);
        if (name) categories.push(name);
    }

    // Format address safely
    const addressStr = partner.address
        ? [partner.address.street, partner.address.city, partner.address.state, partner.address.pincode].filter(Boolean).join(', ')
        : 'N/A';

    return (
        <Dialog open={!!partner} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl font-bold">Partner Details</DialogTitle>
                            <DialogDescription>
                                Review partner information, bank accounts, and KYC documents.
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col gap-2 mr-6 items-end">
                            {onToggleStatus && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Account Active</span>
                                    <Switch
                                        checked={partner.isActive}
                                        onCheckedChange={(checked) => onToggleStatus(partner._id, checked)}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 shrink-0 text-xs border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                                onClick={() => setShowPasswordReset(!showPasswordReset)}
                            >
                                <KeyRound className="w-3.5 h-3.5" /> Reset Password
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {showPasswordReset && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3 mt-4">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
                            Set New Password
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type={isPasswordVisible ? "text" : "password"}
                                    placeholder="Enter new password (min 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                            <Button
                                onClick={handleResetPassword}
                                disabled={isResetting}
                                className="bg-violet-600 hover:bg-violet-700 text-white"
                            >
                                {isResetting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-6 mt-4">
                    {/* General Information Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1 font-medium uppercase tracking-wider">Partner Name</label>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{partner.name}</div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1 font-medium uppercase tracking-wider">Phone</label>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{partner.phone}</div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1 font-medium uppercase tracking-wider">Email</label>
                            <div className="text-zinc-900 dark:text-zinc-100">{partner.email || 'No email'}</div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1 font-medium uppercase tracking-wider">Service Subcategory</label>
                            <div className="text-zinc-900 dark:text-zinc-100">{partner.serviceSubcategory || 'None'}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-zinc-500 block mb-1.5 font-medium uppercase tracking-wider">Assigned Categories</label>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.length > 0 ? (
                                    categories.map((catName, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700"
                                        >
                                            {catName}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-zinc-400 text-xs">No categories assigned</span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-zinc-500 block mb-1 font-medium uppercase tracking-wider">Service Location & Address</label>
                            <div className="text-zinc-900 dark:text-zinc-100">{addressStr || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Bank Accounts Section */}
                    <div className="border-t border-zinc-100 dark:border-white/5 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-violet-500" />
                                Bank Accounts
                            </h3>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-dashed"
                                onClick={() => setShowAddBank(!showAddBank)}
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Account
                            </Button>
                        </div>

                        {showAddBank && (
                            <form onSubmit={handleAddBank} className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">Add New Bank Account</h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="text-zinc-500 block mb-1 font-medium">Bank Name *</label>
                                        <Input
                                            required
                                            placeholder="e.g. HDFC Bank"
                                            value={bankForm.bankName}
                                            onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-zinc-500 block mb-1 font-medium">Account Number *</label>
                                        <Input
                                            required
                                            placeholder="e.g. 5010023456789"
                                            value={bankForm.accountNumber}
                                            onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-zinc-500 block mb-1 font-medium">Account Holder Name *</label>
                                        <Input
                                            required
                                            placeholder="e.g. John Doe"
                                            value={bankForm.accountHolderName}
                                            onChange={e => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-zinc-500 block mb-1 font-medium">IFSC Code *</label>
                                        <Input
                                            required
                                            placeholder="e.g. HDFC0001234"
                                            value={bankForm.ifsc}
                                            onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                                            className="h-8 text-xs uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddBank(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" disabled={isAddingBank} className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white">
                                        {isAddingBank ? "Saving..." : "Save Bank Account"}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {partner.bankAccounts && partner.bankAccounts.length > 0 ? (
                            <div className="space-y-3">
                                {partner.bankAccounts.map((account, idx) => (
                                    <div
                                        key={account._id || idx}
                                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-5 shadow-lg border border-zinc-700/50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-white/10 rounded-lg border border-white/10">
                                                    <Building2 className="w-4 h-4 text-violet-300" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-sm uppercase block tracking-wide">
                                                        {account.bankName}
                                                    </span>
                                                    {account.isPrimary && (
                                                        <span className="text-[10px] bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full font-bold">PRIMARY</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {account.isActive ? (
                                                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">
                                                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="h-6 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5"
                                                        onClick={() => onVerifyBank(partner._id, account._id)}
                                                    >
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Verify
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="my-3 font-mono text-lg font-bold tracking-widest text-zinc-100 flex items-center gap-2">
                                            <span>••••</span>
                                            <span>{account.accountNumber.slice(-4)}</span>
                                            <span className="text-xs font-normal text-zinc-400 font-sans ml-2">({account.accountNumber})</span>
                                        </div>

                                        <div className="flex justify-between text-xs text-zinc-300 pt-2 border-t border-white/10">
                                            <div>
                                                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Holder</span>
                                                <span>{account.accountHolderName}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-zinc-500 block uppercase font-medium">IFSC</span>
                                                <span className="font-mono">{account.ifsc}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 bg-zinc-50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <Building2 className="w-6 h-6 text-zinc-400 mb-2" />
                                <p className="text-zinc-500 text-xs font-medium">No bank accounts registered.</p>
                            </div>
                        )}
                    </div>

                    {/* KYC Documents Section */}
                    <div className="border-t border-zinc-100 dark:border-white/5 pt-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider mb-3 text-zinc-700 dark:text-zinc-300">
                            KYC Documents
                        </h3>
                        {partner.kycDocuments && partner.kycDocuments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {partner.kycDocuments.map((doc) => (
                                    <div key={doc._id} className="border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative group">
                                            <img
                                                src={doc.imageUrl}
                                                alt={doc.documentType}
                                                className="w-full h-full object-cover"
                                            />
                                            <a
                                                href={doc.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-2"
                                            >
                                                <Eye className="w-5 h-5" />
                                                <span className="text-xs font-medium">View Original</span>
                                            </a>
                                        </div>
                                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                                                {doc.documentType}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {doc.status === 'pending' || doc.status === 'under_review' ? (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                            onClick={() => onVerifyDocument(doc._id, 'approved')}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() => onVerifyDocument(doc._id, 'rejected')}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                                        doc.status === 'approved'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-xs italic">No KYC documents uploaded yet.</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
