import Products from "@/components/HomePage/Products"
import { getProducts } from "@/lib/api/product"

export const metadata = {
    title: 'Shop - EcomStore',
    description: 'Browse and shop a wide variety of products at EcomStore. Discover the latest trends, best deals, and top-quality items across multiple categories to enhance your shopping experience.',
}
const page = async () => {
    const {data, pagination} = await getProducts();
  return (
    <Products products={data} pagination={pagination} />
  )
}

export default page