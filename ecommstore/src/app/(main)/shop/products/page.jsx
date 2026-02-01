import { getProducts } from '@/lib/api/product';
import SingleProductPage from './[slug]/page'

export const metadata = {
  title: 'Products - EcomStore',
  description: 'Explore our wide range of products at EcomStore. Find the latest trends, best deals, and top-quality items across various categories to suit your needs.',
}

const page = async () => {
   const {data: products} = await getProducts();
   console.log(products)
  return (
    <div>
      <SingleProductPage products={products} />
    </div>
  )
}

export default page