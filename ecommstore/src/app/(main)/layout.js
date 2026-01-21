import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/BreadCrumb";
import RouteTransition from "@/components/Transitions/RouteTransition";
import FloatingCart from "@/components/ui/FloatingCart";

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