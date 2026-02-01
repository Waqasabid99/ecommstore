import SingleProductPage from "@/components/product/SingleProduct";
import { getProducts } from "@/lib/api/product"

const page = async () => {
    const products = await getProducts();
  return (
    <div>
        <SingleProductPage products={products} />
    </div>
  )
}

export default page