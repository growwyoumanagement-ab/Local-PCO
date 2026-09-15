import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, MapPin } from "lucide-react";
import { ADMIN_PORTAL_URL } from "../config/constants";

export function Navbar({ onOpenClientModal, onOpenPartnerModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How it works", href: "#how-it-works" },
    { name: "Services", href: "#services" },
    { name: "For Partners", href: "#partners" },
    { name: "Pricing", href: "#pricing" },
    { name: "Support", href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4DA] py-3.5 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Local PCO Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-[#0E382C] leading-none">
              Local PCO
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#526058] hover:text-[#0E382C] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={ADMIN_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#526058] hover:text-[#0E382C] transition-colors px-2 py-1"
            >
              Sign in
            </a>

            <button
              onClick={onOpenClientModal}
              className="inline-flex items-center gap-2 bg-[#0E382C] hover:bg-[#165342] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-[#1B2620] p-2 rounded-lg hover:bg-[#EFECE3] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FAF8F5] border-b border-[#E8E4DA] shadow-lg overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-[#1B2620] hover:text-[#0E382C] py-1 border-b border-[#F0ECE4]"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenClientModal?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#0E382C] text-white font-semibold py-3 rounded-full shadow-sm text-sm"
                >
                  <span>Find a service</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPartnerModal?.();
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#0E382C] border border-[#E8E4DA] rounded-full bg-white hover:bg-[#F4F1EA]"
                >
                  Become a partner
                </button>

                <a
                  href={ADMIN_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-xs font-semibold text-[#526058] hover:text-[#0E382C]"
                >
                  Operations Login →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
