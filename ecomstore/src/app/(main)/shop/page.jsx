import { getCategories } from '@/app/api/category';
import { getProducts } from '@/app/api/product'
import ShopPage from '@/components/Shop/ShopPage'

export const metadata = {
  title: 'Shop - EcomStore',
  description: 'Browse and shop a wide variety of products at EcomStore. Discover the latest trends, best deals, and top-quality items across multiple categories to enhance your shopping experience.',
}

const page = async () => {
  const fetchedproducts = await getProducts();
  const fetchedcategories = await getCategories();
  const products = fetchedproducts.data;
  const categories = fetchedcategories.data;
  console.log(products, categories);
  return (
    <main>
      <ShopPage />
    </main>
  )
}

export default page
