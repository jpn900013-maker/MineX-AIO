import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { PopularTools } from "@/components/sections/PopularTools";
import { Features } from "@/components/sections/Features";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Categories />
        <PopularTools />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
