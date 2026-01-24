import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/ui/BreadCrumb";
import RouteTransition from "@/components/Transitions/RouteTransition";
import FloatingCart from "@/components/ui/FloatingCart";
import { getProducts } from "@/lib/api/product";
import CartInitializer from "../../lib/CartInitializer";
import CheckAuth from "@/lib/AuthCheck";

export default async function MainLayout({ children }) {
  const fetchedProducts = await getProducts();
  const products = fetchedProducts.data;

  return (
    <>
      <CheckAuth>
        <CartInitializer>
          <header>
            <Navbar products={products} />
          </header>
          <main>
            <RouteTransition>
              <Breadcrumbs />
              <FloatingCart />
              {children}
            </RouteTransition>
          </main>
          <Footer />
        </CartInitializer>
      </CheckAuth>
    </>
  );
}
