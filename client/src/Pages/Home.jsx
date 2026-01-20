import Hero from "../Components/HomePage/Hero"
import Categories from "../Components/HomePage/Categories"
import OurSpecialties from "../Components/HomePage/OurSpecialties"
import About from "../Components/HomePage/About"
import Catalog from "../Components/HomePage/Catalog"
import LimitedTimeOffer from "../Components/HomePage/LimitedTimeOffer"
import PartnersSlider from "../Components/HomePage/OurPartners"
import SEO from "../constants/SEO"

const Home = () => {
  return (
    <>
      <SEO title="Ecom Store." description="Shop electronics, mobiles, and accessories online at best prices with fast delivery."/>
      <Hero />
      <OurSpecialties />
      <Categories />
      <About />
      <Catalog />
      <LimitedTimeOffer />
      <PartnersSlider />
    </>
  )
}

export default Home
