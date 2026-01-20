import { Outlet, useNavigate } from "react-router-dom"
import LoadingPage from "../Pages/LoadingPage";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const RootLayout = () => {
  const navigate = useNavigate();
  return (
    <>
    {navigate.state === "loading" && <LoadingPage />}
    <Navbar />
    <Outlet />
    <Footer />
    </>
  )
}

export default RootLayout