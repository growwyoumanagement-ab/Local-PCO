import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, Download, ArrowRight, Building2, Smartphone } from "lucide-react";
import { ADMIN_PORTAL_URL } from "../config/constants";

export function PartnerJoinModal({ isOpen, onClose }) {
  const [trade, setTrade] = useState("AC Technician");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E8E4DA] shadow-2xl text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white border border-[#E8E4DA] text-[#1B2620] hover:bg-[#EFECE3] transition-colors"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Local PCO" className="w-6 h-6 object-contain" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C28E46]">
                Field Operations Onboarding
              </span>
            </div>
            <h3 className="text-2xl font-serif-display font-normal text-[#1B2620] mb-2">
              Join as a Service Partner
            </h3>
            <p className="text-xs text-[#526058] mb-6 font-light">
              Discover real nearby home service work, document photo proof, and get direct bank payouts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trade Select */}
              <div>
                <label className="text-xs font-semibold text-[#1B2620] block mb-1.5">
                  Your Primary Trade
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DA] rounded-xl px-3.5 py-2.5 text-sm text-[#1B2620] focus:outline-none focus:border-[#0E382C]"
                >
                  <option>AC Technician</option>
                  <option>Plumber</option>
                  <option>Electrician</option>
                  <option>Deep Cleaning Specialist</option>
                  <option>Pest Control Operator</option>
                  <option>Appliance Specialist</option>
                  <option>Carpenter</option>
                  <option>Painter</option>
                  <option>General Handyman</option>
                </select>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="text-xs font-semibold text-[#1B2620] block mb-1.5">
                  Mobile Number (for OTP & Verification)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#E8E4DA] bg-[#F4F1EA] text-xs font-mono text-[#526058]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full bg-white border border-[#E8E4DA] rounded-r-xl px-3.5 py-2.5 text-sm text-[#1B2620] focus:outline-none focus:border-[#0E382C]"
                  />
                </div>
              </div>

              {/* 3 Step Verification Checklist */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] space-y-2">
                <span className="text-[11px] font-bold text-[#1B2620] uppercase tracking-wider block">
                  Mandatory Partner Credentials
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#526058]">
                  <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E4DA]">
                    <span className="font-semibold text-[#1B2620] block">1. Aadhaar</span>
                    <span>Identity check</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E4DA]">
                    <span className="font-semibold text-[#1B2620] block">2. Bank Acc</span>
                    <span>Direct payout</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E4DA]">
                    <span className="font-semibold text-[#1B2620] block">3. Skill Proof</span>
                    <span>Certification</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Register as Partner</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-5 pt-3 border-t border-[#E8E4DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <a
                href="/partner-app.apk"
                download
                className="inline-flex items-center gap-1.5 text-[#0E382C] font-semibold hover:underline"
              >
                <Download size={13} />
                <span>Direct Download Partner App (APK)</span>
              </a>

              <a
                href={ADMIN_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7E8C83] hover:text-[#1B2620] text-[11px] font-mono"
              >
                Verifier Login →
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-serif-display font-normal text-[#1B2620] mb-2">
              Registration Registered!
            </h3>
            <p className="text-sm text-[#526058] font-light max-w-sm mx-auto mb-6">
              Our operations verification team will review your trade profile for {trade}. Download the partner APK below to complete your KYC document upload.
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto mb-6">
              <a
                href="/partner-app.apk"
                download
                className="inline-flex items-center justify-center gap-2 bg-[#0E382C] hover:bg-[#165342] text-white text-xs font-semibold py-3 rounded-full transition-colors shadow-sm"
              >
                <Download size={15} />
                <span>Download Partner App APK</span>
              </a>

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="text-xs font-semibold text-[#526058] hover:text-[#1B2620]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
