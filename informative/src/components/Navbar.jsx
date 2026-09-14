import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { GlowButton } from "./ui/GlowButton";
import { cn } from "../lib/utils";

export function Navbar() {
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
    { name: "How It Works", href: "#how-it-works" },
    { name: "Field Execution", href: "#execution" },
    { name: "Photo Proof", href: "#photo-proof" },
    { name: "Earnings & Payout", href: "#earnings" },
    { name: "Partner App", href: "#download" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-[rgba(8,12,20,0.85)] backdrop-blur-md border-b border-[#1E2D42] py-4" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Local PCO Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-[#8FA3BF] hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <GlowButton 
                href="/admin" 
                variant="secondary"
                size="sm"
                className="hidden lg:flex"
              >
                Operations Login
              </GlowButton>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0F1623] border-b border-[#1E2D42] overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-[#8FA3BF] hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <GlowButton 
                  href="/admin" 
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Operations Login
                </GlowButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
