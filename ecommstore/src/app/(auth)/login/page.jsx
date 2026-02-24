import Login from "@/components/pages/Login"

export const metadata = {
  title: 'Login - EcomStore',
  description: 'Access your EcomStore account by logging in or signing up. Enjoy a personalized shopping experience, track your orders, and manage your preferences with ease.',
}
const page = () => {
  return (
    <div>
      <Login />
    </div>
  )
}

export default page
