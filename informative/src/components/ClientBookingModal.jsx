import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, ArrowRight, Download, ShieldCheck } from "lucide-react";

export function ClientBookingModal({ isOpen, onClose, initialService }) {
  const [selectedService, setSelectedService] = useState(initialService?.title || "AC & Cooling");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Agra (Central)");
  const [submitted, setSubmitted] = useState(false);
  const [prevInitialService, setPrevInitialService] = useState(initialService);

  // Synchronize state when initialService prop changes without useEffect cascading renders
  if (initialService !== prevInitialService) {
    setPrevInitialService(initialService);
    if (initialService?.title) {
      setSelectedService(initialService.title);
    }
  }

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
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0E382C]">
                Instant Service Request
              </span>
            </div>
            <h3 className="text-2xl font-serif-display font-normal text-[#1B2620] mb-2">
              Book a verified professional
            </h3>
            <p className="text-xs text-[#526058] mb-6 font-light">
              Connect with nearby specialists in 5 minutes with fixed upfront quotes.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Select */}
              <div>
                <label className="text-xs font-semibold text-[#1B2620] block mb-1.5">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DA] rounded-xl px-3.5 py-2.5 text-sm text-[#1B2620] focus:outline-none focus:border-[#0E382C]"
                >
                  <option>AC & Cooling</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Cleaning</option>
                  <option>Pest Control</option>
                  <option>Appliance Repair</option>
                  <option>Carpentry</option>
                  <option>Painting</option>
                  <option>Home Maintenance</option>
                </select>
              </div>

              {/* Phone Input */}
              <div>
                <label className="text-xs font-semibold text-[#1B2620] block mb-1.5">
                  Mobile Number
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

              {/* Area Select */}
              <div>
                <label className="text-xs font-semibold text-[#1B2620] block mb-1.5">
                  Your Locality / Area
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-white border border-[#E8E4DA] rounded-xl px-3.5 py-2.5 text-sm text-[#1B2620] focus:outline-none focus:border-[#0E382C]"
                />
              </div>

              {/* Trust Callout */}
              <div className="p-3 rounded-xl bg-[#EBF1ED] border border-[#D1DFD7] flex items-center gap-2 text-xs text-[#0E382C]">
                <ShieldCheck size={16} className="shrink-0" />
                <span>Zero cancellation fee. Pay only after inspecting verified photo proof.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Request Nearby Professional</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-[#E8E4DA] flex items-center justify-between text-[11px] text-[#7E8C83]">
              <span>Or use the resident mobile app:</span>
              <a href="/client-app.apk" download className="text-[#0E382C] font-semibold flex items-center gap-1 hover:underline">
                <Download size={12} />
                <span>Download Client APK</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#EBF1ED] text-[#0E382C] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-serif-display font-normal text-[#1B2620] mb-2">
              Broadcast Initiated!
            </h3>
            <p className="text-sm text-[#526058] font-light max-w-sm mx-auto mb-6">
              Nearby {selectedService} specialists in {area} are being notified. You will receive an SMS confirmation on +91 {phone} shortly.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] max-w-sm mx-auto mb-6 text-left text-xs text-[#526058] space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-[#1B2620]">Service:</span>
                <span>{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#1B2620]">Status:</span>
                <span className="text-[#0E382C] font-bold">Matching nearby specialist...</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#0E382C] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#165342]"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
