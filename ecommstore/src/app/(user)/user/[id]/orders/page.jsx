import Orders from "@/components/userDashboard/pages/Orders"

export const metadata = {
    title: 'Orders - EcomStore',
    description: 'Manage your orders and their statuses. View, track, and update order details as needed.',
}

const page = () => {
  return <Orders />
}

export default page