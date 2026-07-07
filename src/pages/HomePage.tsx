import Hero from '../components/Hero';
import Services from '../components/Services';
import Features from '../components/Features';
import CatalogueSection from '../components/CatalogueSection';
import Testimonials from '../components/Testimonials';
import CTABanner from '../components/CTABanner';
import Contact from '../components/Contact';

const HomePage = () => {
  return (
    <main>
      <Hero />
      <Services />
      <Features />
      <CatalogueSection />
      <Testimonials />
      <CTABanner />
      <Contact />
    </main>
  );
};

export default HomePage;
