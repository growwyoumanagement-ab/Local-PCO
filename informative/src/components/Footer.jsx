import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { ADMIN_PORTAL_URL } from "../config/constants";

export function Footer({ onOpenClientModal, onOpenPartnerModal }) {
  const footerLinks = {
    "Operations": [
      { name: "How It Works", href: "#how-it-works" },
      { name: "The Job Journey", href: "#how-it-works" },
      { name: "Visual Photo Proof", href: "#proof" },
      { name: "Safety & KYC Verification", href: "#partners" },
    ],
    "Services": [
      { name: "AC & Cooling Repair", onClick: () => onOpenClientModal?.({ title: "AC & Cooling" }) },
      { name: "Plumbing Services", onClick: () => onOpenClientModal?.({ title: "Plumbing" }) },
      { name: "Electrical Troubleshooting", onClick: () => onOpenClientModal?.({ title: "Electrical" }) },
      { name: "Deep Home Cleaning", onClick: () => onOpenClientModal?.({ title: "Cleaning" }) },
      { name: "Pest Control & Termite", onClick: () => onOpenClientModal?.({ title: "Pest Control" }) },
    ],
    "Partners": [
      { name: "Join as a Professional", href: "#partners", onClick: onOpenPartnerModal },
      { name: "Partner Earnings & Ledger", href: "#pricing" },
      { name: "Field App (Android APK)", href: "/partner-app.apk", isDownload: true },
      { name: "Operations Command Center", href: ADMIN_PORTAL_URL, isExternal: true },
    ],
    "Company": [
      { name: "About Local PCO", href: "#how-it-works" },
      { name: "Resident App (Android APK)", href: "/client-app.apk", isDownload: true },
      { name: "Safety Guarantee", href: "#proof" },
      { name: "Partner Onboarding", href: "#partners", onClick: onOpenPartnerModal },
    ],
  };

  return (
    <footer className="bg-[#FAF8F5] border-t border-[#E8E4DA] pt-14 pb-10 text-left">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-[#E8E4DA]">
          
          {/* Brand & Manifesto Column */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4 group">
              <img
                src="/logo.png"
                alt="Local PCO Logo"
                className="w-8 h-8 md:w-9 md:h-9 object-contain"
              />
              <span className="font-serif-display text-2xl font-bold text-[#0E382C]">
                Local PCO
              </span>
            </a>

            <p className="text-sm text-[#526058] font-light leading-relaxed mb-5 max-w-sm">
              Your local service network, connected. Connecting homeowners with vetted local specialists for plumbing, electrical, AC, and home maintenance.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF1ED] border border-[#D1DFD7] text-xs font-semibold text-[#0E382C]">
              <ShieldCheck size={14} />
              <span>Verified Home Service Marketplace</span>
            </div>
          </div>

          {/* Nav Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="text-[11px] font-sans font-bold uppercase tracking-[0.14em] text-[#1B2620] mb-3.5">
                {title}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-xs text-[#526058] hover:text-[#0E382C] transition-colors text-left cursor-pointer"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        download={link.isDownload ? true : undefined}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                        className="text-xs text-[#526058] hover:text-[#0E382C] transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{link.name}</span>
                        {link.isExternal && (
                          <ArrowUpRight size={11} className="opacity-60 group-hover:opacity-100" />
                        )}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Colophon */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E8C83]">
          <p>© {new Date().getFullYear()} Local PCO. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Agra • Uttar Pradesh</span>
            <span className="w-1 h-1 rounded-full bg-[#D8D2C5]"></span>
            <span>Built for Real Homes & Real People</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
