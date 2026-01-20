import ForgotPassword from '@/components/Auth/ForgetPassword'
export const metadata = {
  title: 'Forgot Password - EcomStore',
  description: 'Reset your EcomStore account password easily. Enter your email to receive a password reset link and regain access to your account securely.',
}

const page = () => {
  return (
    <div>
      <ForgotPassword />
    </div>
  )
}

export default page
