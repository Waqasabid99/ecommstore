import SingleProductPage from "@/components/product/SingleProduct";
import { getProducts } from "@/lib/api/product"

const page = async () => {
    const products = await getProducts();
  return <SingleProductPage products={products} />

}

export default page