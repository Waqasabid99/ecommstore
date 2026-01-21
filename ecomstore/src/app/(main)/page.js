import Catalog from "@/components/HomePage/Catalog";
import Categories from "@/components/HomePage/Categories";
import Hero from "@/components/HomePage/Hero";
import HomeSectionAbout from "@/components/HomePage/HomeSectionAbout";
import LimitedTimeOffer from "@/components/HomePage/LimitedTimeOffer";
import PartnersSlider from "@/components/HomePage/OurPartners";
import OurSpecialties from "@/components/HomePage/OurSpecialties";
import PageTransition from "@/components/Transitions/PageTransition";
import { getCategories } from "../api/category";
import { getProducts } from "../api/product";

export default async function Home() {
  const fetchedProducts = getProducts();
  const fetchedCategories = getCategories();
  const products = fetchedProducts.data;
  const categories = fetchedCategories.data;
  return (
    <>
      <PageTransition>
        <Hero />
        <OurSpecialties />
        <Categories categories={categories} />
        <HomeSectionAbout />
        <Catalog products={products} />
        <LimitedTimeOffer />
        <PartnersSlider />
      </PageTransition>
    </>
  );
}
