import { Wallet, CheckCircle2, ShieldCheck, Building2, Lock, ArrowRight } from "lucide-react";

export function EarningsStory({ onOpenPartnerModal }) {
  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-[#FAF8F5] border-t border-[#E8E4DA]/80">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Financial Ledger Phone Interface Mockup */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="mx-auto max-w-[370px] bg-white rounded-[32px] p-5 sm:p-6 border border-[#E8E4DA] editorial-shadow-lg text-left">
              
              {/* Ledger Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E8E4DA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center">
                    <Wallet size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1B2620] block">Partner Ledger</span>
                    <span className="text-[10px] text-[#7E8C83] font-mono">HDFC Bank •• 8912</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E382C] bg-[#EBF1ED] px-2.5 py-1 rounded-full">
                  Instant Direct Payout
                </span>
              </div>

              {/* Main Balance Highlight */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] mb-4">
                <span className="text-[11px] font-sans font-semibold text-[#7E8C83] uppercase tracking-wider block mb-1">
                  This Month's Earnings
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif-display font-bold text-[#0E382C]">
                    ₹12,450
                  </span>
                  <span className="text-xs text-[#526058]">from 32 completed jobs</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3.5 border-t border-[#E8E4DA]">
                  <div>
                    <span className="text-[10px] text-[#7E8C83] uppercase font-sans font-medium block">Paid to Bank</span>
                    <span className="text-sm font-bold text-[#1B2620]">₹9,250</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7E8C83] uppercase font-sans font-medium block">Pending Clearance</span>
                    <span className="text-sm font-bold text-[#C28E46]">₹3,200</span>
                  </div>
                </div>
              </div>

              {/* Recent Dispatches Breakdown */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-[#1B2620] block">Recent Job Settlements</span>
                
                <div className="p-2.5 rounded-xl bg-white border border-[#E8E4DA] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1B2620] block">AC Deep Servicing</span>
                    <span className="text-[10px] text-[#7E8C83]">Today, 11:30 AM • Completed</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0E382C]">+₹800</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E8E4DA] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1B2620] block">Kitchen Pipe Leak Fix</span>
                    <span className="text-[10px] text-[#7E8C83]">Yesterday, 4:15 PM • Completed</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0E382C]">+₹600</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E8E4DA] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1B2620] block">Switchboard Replacement</span>
                    <span className="text-[10px] text-[#7E8C83]">13 Sep, 2:00 PM • Completed</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0E382C]">+₹450</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onOpenPartnerModal}
                className="w-full bg-[#0E382C] hover:bg-[#165342] text-white text-xs font-semibold py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Lock size={13} />
                <span>Initiate 2FA Bank Withdrawal</span>
              </button>
            </div>
          </div>

          {/* Right: Editorial Story Column */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#4E715E] block mb-2.5">
              Transparent Financial System
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-normal text-[#1B2620] tracking-tight mb-4">
              Work done. <br />
              Earnings clear.
            </h2>

            <p className="text-sm sm:text-base text-[#526058] font-light leading-relaxed mb-7">
              We believe technicians and service specialists should never wait weeks for payment or decipher complicated deduction statements. Every rupee you earn is immediately credited upon work proof sign-off.
            </p>

            {/* Financial Pillars */}
            <div className="space-y-3.5 mb-7">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B2620]">Zero Delayed Invoices</h4>
                  <p className="text-xs text-[#526058] mt-0.5">
                    Jobs are credited to your active wallet immediately upon customer completion confirmation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B2620]">Direct Bank Settlement via IMPS / NEFT</h4>
                  <p className="text-xs text-[#526058] mt-0.5">
                    Withdraw directly to your verified bank account with bank-grade 2FA OTP security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B2620]">Crystal-Clear Commission Ledger</h4>
                  <p className="text-xs text-[#526058] mt-0.5">
                    Audit every booking fee, client tip, and platform commission line-by-line right inside the app.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenPartnerModal}
              className="inline-flex items-center gap-2 bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-sm cursor-pointer"
            >
              <span>Join as a verified professional</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
