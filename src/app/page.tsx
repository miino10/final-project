// "use client";
import React from "react";
import Navbar from "./_components/Navbar";
import NotifyGradientLine from "./_components/NotifyGradientLine";
import { OurServiceCard } from "./_components/OurServiceCard";
import PricingCard from "./_components/PricingCard";
import FaqsCard from "./_components/FaqsCard";
import Footer from "./_components/Footer";
import Hero from "./_components/Hero";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import StickyScroll from "@/components/ui/Sticky-scroll";
import { useOrganizationList } from "@clerk/nextjs";
const words = "Discover Our Features";
export default function MainPage() {
  // const { setActive } = useOrganizationList();
  // const orgId = "org_2xRFfzdAmY8BactVinyBDc77Air";

  //   if (orgId && setActive) {
  //     setActive({
  //           organization: orgId,
  //         });
  //       }


  // console.log("orgId", orgId);
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <NotifyGradientLine />
      <Hero />
      <section id="solutions">
        <OurServiceCard />
      </section>

      <section id="features" className="py-20 ">
        <div className="max-w-7xl mx-auto px-4">
          <TextGenerateEffect words={words} />
          <StickyScroll contentClassName="bg-gradient-to-br from-white to-gray-500 " />
        </div>
      </section>
      <PricingCard />

      <FaqsCard />
      <Footer />
    </main>
  );
}
