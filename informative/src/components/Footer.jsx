// Custom SVG Icons because lucide-react removed brand icons
const Instagram = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Linkedin = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Twitter = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export function Footer() {
  const footerLinks = {
    "Operations": [
      { name: "How It Works", href: "#how-it-works" },
      { name: "Job Broadcast", href: "#execution" },
      { name: "Photo Proof", href: "#photo-proof" },
    ],
    "Partners": [
      { name: "Partner Experience", href: "#operations" },
      { name: "Earnings & Payout", href: "#earnings" },
      { name: "Partner Verification", href: "#download" },
    ],
    "Applications": [
      { name: "Partner App (Android)", href: "#download" },
      { name: "Operations Portal", href: "/admin" },
    ],
    "Legal": [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Partner Agreement", href: "#" },
    ],
  };

  return (
    <footer className="relative pt-20 pb-10 bg-[#080C14] mt-20 border-t border-[#1E2D42]">
      {/* Subtle top gradient border effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#16A34A] to-transparent opacity-30"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Local PCO Logo" className="h-9 w-auto object-contain rounded-lg shadow-sm" />
            </a>
            <p className="text-[#8FA3BF] text-sm leading-relaxed mb-6">
              Field operations platform connecting service partners with real-time jobs, execution guidance, and instant payouts.
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Your workday, connected.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="text-white font-bold mb-4">{title}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-[#8FA3BF] text-sm hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[#1E2D42] text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#8FA3BF] text-sm">
            © {new Date().getFullYear()} Local PCO. All rights reserved.
          </p>
          <p className="text-xs text-zinc-500">
            From job assignment to payout.
          </p>
        </div>
      </div>
    </footer>
  );
}
