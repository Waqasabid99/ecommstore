import Cart from '@/components/Cart/Cart'
export const metadata = {
  title: 'Your Shopping Cart - EcomStore',
  description: 'Review the items in your shopping cart, update quantities, and proceed to checkout to complete your purchase at EcomStore.',
}
const page = () => {
  return (
    <main>
      <Cart />
    </main>
  )
}

export default page
