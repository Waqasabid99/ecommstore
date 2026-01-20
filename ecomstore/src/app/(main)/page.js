import Catalog from "@/components/HomePage/Catalog";
import Categories from "@/components/HomePage/Categories";
import Hero from "@/components/HomePage/Hero";
import HomeSectionAbout from "@/components/HomePage/HomeSectionAbout";
import LimitedTimeOffer from "@/components/HomePage/LimitedTimeOffer";
import PartnersSlider from "@/components/HomePage/OurPartners";
import OurSpecialties from "@/components/HomePage/OurSpecialties";
import PageTransition from "@/components/Transitions/PageTransition";

export default function Home() {
  return (
    <>
      <PageTransition>
        <Hero />
        <OurSpecialties />
        <Categories />
        <HomeSectionAbout />
        <Catalog />
        <LimitedTimeOffer />
        <PartnersSlider />
      </PageTransition>
    </>
  );
}
