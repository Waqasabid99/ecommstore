import { getProducts } from "@/lib/api/product";
import ShopPage from "./shop/page"
import { getCategories } from "@/lib/api/category";

export const metadata = {
  title: 'Shop - EcomStore',
  description: 'Browse and shop a wide variety of products at EcomStore. Discover the latest trends, best deals, and top-quality items across multiple categories to enhance your shopping experience.',
}

const page = async () => {
  const products = await getProducts();
  const {pagination} = await getProducts();
  const categories = await getCategories();
  return <ShopPage products={products} categories={categories} pagination={pagination} />

}

export default page
