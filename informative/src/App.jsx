import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { RealTimeOpportunities } from './sections/RealTimeOpportunities';
import { SimpleJobExecution } from './sections/SimpleJobExecution';
import { PhotoProofSection } from './sections/PhotoProofSection';
import { EarningsVisibility } from './sections/EarningsVisibility';
import { ReliablePayout } from './sections/ReliablePayout';
import { BuiltForPros } from './sections/BuiltForPros';
import { DownloadApps } from './sections/DownloadApps';

function App() {
  return (
    <div className="font-body text-[#8FA3BF] bg-[#080C14] min-h-screen selection:bg-emerald-500 selection:text-white">
      <Navbar />
      
      <main>
        <Hero />
        <RealTimeOpportunities />
        <SimpleJobExecution />
        <PhotoProofSection />
        <EarningsVisibility />
        <ReliablePayout />
        <BuiltForPros />
        <DownloadApps />
      </main>

      <Footer />
    </div>
  );
}

export default App;
