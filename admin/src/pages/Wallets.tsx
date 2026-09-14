import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Coins, History, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle, XCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react";
import { walletService } from "@/services/wallet.service";
import type { WalletData } from "@/services/wallet.service";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function BalanceCard({ title, amount, subtext, type }: { title: string, amount: string, subtext: string, type: 'neutral' | 'success' | 'warning' }) {
    const colors = {
        neutral: "from-zinc-50/50 to-zinc-100/50 dark:from-zinc-800/50 dark:to-zinc-900/50 border-zinc-200 dark:border-white/5",
        success: "from-emerald-50/50 to-zinc-50/50 dark:from-emerald-900/20 dark:to-zinc-900/50 border-emerald-100 dark:border-emerald-500/20",
        warning: "from-amber-50/50 to-zinc-50/50 dark:from-amber-900/20 dark:to-zinc-900/50 border-amber-100 dark:border-amber-500/20"
    };

    const textColors = {
        neutral: "text-zinc-900 dark:text-white",
        success: "text-emerald-700 dark:text-emerald-400",
        warning: "text-amber-700 dark:text-amber-400"
    }

    const icons = {
        neutral: <Wallet className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
        success: <ArrowDownLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
        warning: <ArrowUpRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    }

    return (
        <div className={`p-6 rounded-3xl border shadow-sm dark:shadow-xl bg-gradient-to-br ${colors[type]} backdrop-blur-md relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
            {/* Background Glow */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-[40px] opacity-20 ${type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : 'bg-violet-500'} group-hover:opacity-30 transition-opacity`}></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-[10px]">{title}</p>
                <div className="p-2 bg-white/40 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/5 backdrop-blur-sm">
                    {icons[type]}
                </div>
            </div>
            <h3 className={`text-3xl font-bold ${textColors[type]} relative z-10 tracking-tight`}>{amount}</h3>
            <p className="text-xs mt-2 text-zinc-500 font-medium relative z-10">{subtext}</p>
        </div>
    )
}

export default function Wallets() {
    const [data, setData] = useState<WalletData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        loadWallets(page);
    }, [page]);

    const loadWallets = async (currentPage: number) => {
        setLoading(true);
        try {
            const res = await walletService.getAllWallets(currentPage, limit);
            setData(res.data);
            setTotal(res.total || 0);
            setTotalPages(Math.ceil((res.total || 0) / limit) || 1);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load wallets");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (transactionId: string) => {
        try {
            await walletService.approvePayout(transactionId);
            toast.success("Payout approved successfully");
            loadWallets(page);
        } catch (err) {
            toast.error("Failed to approve payout");
        }
    }

    const handleReject = async (transactionId: string) => {
        try {
            await walletService.rejectPayout(transactionId, "Admin rejected");
            toast.success("Payout rejected successfully");
            loadWallets(page);
        } catch (err) {
            toast.error("Failed to reject payout");
        }
    }

    const columns: ColumnDef<WalletData>[] = [
        {
            accessorKey: "partnerName",
            header: "Partner Name",
            cell: ({ row }) => <span className="font-medium text-zinc-900 dark:text-zinc-200">{row.getValue("partnerName")}</span>
        },
        {
            accessorKey: "balance",
            header: "Wallet Balance",
            cell: ({ row }) => <span className="font-bold text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">₹{row.getValue<number>("balance")?.toLocaleString('en-IN') || 0}</span>
        },
        {
            accessorKey: "pendingPayout",
            header: "Pending Payout",
            cell: ({ row }) => <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md text-xs border border-amber-200 dark:border-amber-500/20">₹{row.getValue<number>("pendingPayout")?.toLocaleString('en-IN') || 0}</span>
        },
        {
            id: "bankDetails",
            header: "Bank Details",
            cell: ({ row }) => {
                const accounts = row.original.bankAccounts;
                const primaryAccount = accounts?.find(a => a.isPrimary) || accounts?.[0];
                return primaryAccount ? (
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-700 dark:text-zinc-300">{primaryAccount.bankName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                            {primaryAccount.accountNumber ? `...${primaryAccount.accountNumber.slice(-4)}` : "...xxxx"}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-zinc-400">Not provided</span>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const partner = row.original;
                const pendingPayouts = partner.pendingPayoutsList || [];
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
                            
                            {pendingPayouts.length > 0 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer focus:bg-amber-50 dark:focus:bg-amber-600/20 focus:text-amber-600 dark:focus:text-amber-400">
                                            <Coins className="mr-2 h-4 w-4" /> Resolve Payouts
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Pending Payouts</DialogTitle>
                                            <DialogDescription>
                                                Approve or reject payouts for {partner.partnerName}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                            {pendingPayouts.map(tx => (
                                                <div key={tx._id} className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                    <div>
                                                        <p className="font-bold text-zinc-900 dark:text-zinc-100">₹{tx.amount}</p>
                                                        <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleApprove(tx._id)}>
                                                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(tx._id)}>
                                                            <XCircle className="h-4 w-4 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}

                            <DropdownMenuItem className="cursor-pointer focus:bg-violet-50 dark:focus:bg-violet-600 focus:text-violet-600 dark:focus:text-white">
                                <History className="mr-2 h-4 w-4" /> View History
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    // Calculate totals across current page
    const totalBalance = data.reduce((acc, curr) => acc + (curr.balance || 0), 0);
    const totalPending = data.reduce((acc, curr) => acc + (curr.pendingPayout || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        Wallets & Payouts
                        <CreditCard className="h-6 w-6 text-fuchsia-500 dark:text-fuchsia-400" />
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium tracking-wide">Financial control center</p>
                </div>
                <Button className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-white/5 shadow-md">
                    <History className="mr-2 h-4 w-4" /> Payout History
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BalanceCard title="Current Page Balance" amount={`₹${totalBalance.toLocaleString('en-IN')}`} subtext="Sum of balances shown below" type="neutral" />
                <BalanceCard title="Pending Payouts" amount={`₹${totalPending.toLocaleString('en-IN')}`} subtext={`${data.filter(w => w.pendingPayout > 0).length} partners pending on this page`} type="warning" />
                <BalanceCard title="Processed this Month" amount="₹0" subtext="Not integrated yet" type="success" />
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl p-6 space-y-6">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-violet-500"></div>
                    Partner Wallets
                </h3>
                {loading ? (
                    <div className="p-10 text-center">Loading Wallets...</div>
                ) : (
                    <DataTable 
                        columns={columns} 
                        data={data} 
                        searchKey="partnerName" 
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
        </div>
    )
}
