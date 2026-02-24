import Settings from "@/components/userDashboard/pages/Settings"

export const metadata = {
    title: 'Settings - EcomStore',
    description: 'Manage your account settings, including profile, security, and preferences. Customize your online shopping experience with ease.',
}
const page = () => {
  return (
    <div>
      <Settings />
    </div>
  )
}

export default page