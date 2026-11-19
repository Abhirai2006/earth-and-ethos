import Hero from "@/components/hero/Hero";
import Intro from "@/components/Intro";
import Foyer from "@/components/sections/Foyer";
import Founder from "@/components/sections/Founder";
import Built from "@/components/sections/Built";
import DrawingBoard from "@/components/sections/DrawingBoard";
import Details from "@/components/sections/Details";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Intro />
      <Hero />
      <Foyer />
      <Founder />
      <Built />
      <DrawingBoard />
      <Details />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
