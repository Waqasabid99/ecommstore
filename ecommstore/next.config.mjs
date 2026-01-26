const nextConfig = {
  images: {
    remotePatterns: [
      // Local dev
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dekmmxetv/image/upload/**",
      },
      // // Production API
      // {
      //   protocol: "https",
      //   hostname: "api.yoursite.com",
      //   pathname: "/uploads/products/**",
      // },
    ],
  },
};

export default nextConfig;