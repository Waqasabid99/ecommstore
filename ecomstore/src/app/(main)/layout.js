import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/constants/BreadCrumb";
import RouteTransition from "@/components/Transitions/RouteTransition";
import FloatingCart from "@/components/FloatingCart";

export default function MainLayout({ children }) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <RouteTransition>
          <Breadcrumbs />
          <FloatingCart />
          {children}
        </RouteTransition>
      </main>
      <Footer />
    </>
  );
}