import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
import { NeighborhoodJourney } from "./sections/NeighborhoodJourney";
import { ClientPartnerSplit } from "./sections/ClientPartnerSplit";
import { ServicesDirectory } from "./sections/ServicesDirectory";
import { BeforeAfterProof } from "./sections/BeforeAfterProof";
import { EarningsStory } from "./sections/EarningsStory";
import { DownloadApps } from "./sections/DownloadApps";
import { Footer } from "./components/Footer";
import { ClientBookingModal } from "./components/ClientBookingModal";
import { PartnerJoinModal } from "./components/PartnerJoinModal";
import { ADMIN_PORTAL_URL } from "./config/constants";

function AdminRedirect() {
  useEffect(() => {
    window.location.replace(ADMIN_PORTAL_URL);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF8F5] text-[#1B2620]">
      <div className="text-center p-8 bg-white rounded-3xl border border-[#E8E4DA] shadow-xl max-w-md">
        <img src="/logo.png" alt="Local PCO Logo" className="w-12 h-12 object-contain mx-auto mb-4" />
        <p className="text-lg font-serif-display font-bold mb-2">
          Redirecting to Operations Command Center...
        </p>
        <p className="text-xs text-[#526058] mb-4">
          If you are not redirected automatically,{" "}
          <a href={ADMIN_PORTAL_URL} className="text-[#0E382C] font-bold underline">
            click here to continue
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setClientModalOpen(true);
  };

  return (
    <div className="font-sans text-[#1B2620] bg-[#FAF8F5] min-h-screen selection:bg-[#0E382C] selection:text-white relative">
      {/* Top Navbar */}
      <Navbar
        onOpenClientModal={() => setClientModalOpen(true)}
        onOpenPartnerModal={() => setPartnerModalOpen(true)}
      />

      {/* Main Campaign Sections */}
      <main>
        <Hero
          onOpenClientModal={() => setClientModalOpen(true)}
          onOpenPartnerModal={() => setPartnerModalOpen(true)}
        />
        <TrustStrip />
        <NeighborhoodJourney
          onOpenClientModal={() => setClientModalOpen(true)}
        />
        <ClientPartnerSplit
          onOpenClientModal={() => setClientModalOpen(true)}
          onOpenPartnerModal={() => setPartnerModalOpen(true)}
        />
        <ServicesDirectory onSelectService={handleSelectService} />
        <BeforeAfterProof />
        <EarningsStory
          onOpenPartnerModal={() => setPartnerModalOpen(true)}
        />
        <DownloadApps />
      </main>

      {/* Footer */}
      <Footer
        onOpenClientModal={() => setClientModalOpen(true)}
        onOpenPartnerModal={() => setPartnerModalOpen(true)}
      />

      {/* Interactive Booking & Onboarding Modals */}
      <ClientBookingModal
        isOpen={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false);
          setSelectedService(null);
        }}
        initialService={selectedService}
      />

      <PartnerJoinModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/*" element={<AdminRedirect />} />
      <Route path="/login" element={<AdminRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
