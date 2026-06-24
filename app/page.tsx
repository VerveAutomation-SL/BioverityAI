import Hero from "./sections/Hero";
import NexusSection from "./sections/NexusSection";
import ProductHighlights from "./sections/ProductHighlights";
import About from "./sections/About";
import Solutions from "./sections/Solutions";
import Industries from "./sections/Industries";
import Integrations from "./sections/Integrations";
import WhyChooseUs from "./sections/WhyChooseUs";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <NexusSection />
      <ProductHighlights />
      <About />
      <Solutions />
      <Industries />
      <Integrations />
      <WhyChooseUs />
      <Contact />
      <Footer />
    </main>
  );
}
