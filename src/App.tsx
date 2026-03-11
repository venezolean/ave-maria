import Hero from './components/Hero';
import Features from './components/Features';
import ProductPreview from './components/ProductPreview';
import HowItWorks from './components/HowItWorks';
import FinalCTA from './components/FinalCTA';

function App() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white overflow-hidden">
      <Hero />
      <Features />
      <ProductPreview />
      <HowItWorks />
      <FinalCTA />
    </div>
  );
}

export default App;
