import { getProducts } from '@/app/api/product'
import Products from '@/components/HomePage/Products'

export const metadata = {
  title: 'Products - EcomStore',
  description: 'Explore our wide range of products at EcomStore. Find the latest trends, best deals, and top-quality items across various categories to suit your needs.',
}

const page = async () => {
  const products = await getProducts();
  console.log(products);
  return (
    <div>
      <Products products={products} />
    </div>
  )
}

export default page
