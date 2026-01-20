import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import ErrorPage from './Pages/ErrorPage.jsx'
import Home from './Pages/Home.jsx'
import { HelmetProvider } from 'react-helmet-async'
import About from './Pages/About.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      }
    ]
  },
  {
    path: '/about',
    element: <About />,
    errorElement: <ErrorPage />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>  
    <RouterProvider router={router} />
    </HelmetProvider>    
  </StrictMode>,
)
