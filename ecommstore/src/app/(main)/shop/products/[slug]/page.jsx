import SingleProductPage from "@/components/product/SingleProduct";
import { getProducts } from "@/lib/api/product"

const page = async () => {
    const fetchedProduct = await getProducts();
    const products = fetchedProduct.data;
  return (
    <div>
        <SingleProductPage products={products} />
    </div>
  )
}

export default page