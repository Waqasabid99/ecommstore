import BlogPage from '@/components/BlogPage/BlogMain'
export const metadata = {
  title: 'Blog - EcomStore',
  description: 'Read the latest articles, tips, and news about online shopping, product reviews, and industry trends on the EcomStore blog.',
}

const page = () => {
  return (
    <main>
      <BlogPage />
    </main>
  )
}

export default page
