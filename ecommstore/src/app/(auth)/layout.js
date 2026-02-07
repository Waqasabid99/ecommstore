import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: 'Login - EcomStore',
  description: 'Access your EcomStore account by logging in or signing up. Enjoy a personalized shopping experience, track your orders, and manage your preferences with ease.',
};

export default function AuthLayout({ children }) {
  return (
    <main>
      {children}
    </main>
  );
}
