'use client';
import { useState } from 'react';
import { ArrowRight, Search, Tag, TrendingUp } from 'lucide-react';
import BlogCard from '@/components/BlogPage/BlogCard';

const blogPosts = [
  {
    id: 1,
    title: "10 Must-Have Smart Home Devices for 2025",
    excerpt: "Transform your living space with these cutting-edge smart home gadgets that combine convenience, efficiency, and style.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=500&fit=crop",
    category: "Smart Home",
    author: "Sarah Johnson",
    date: "Dec 28, 2025",
    readTime: "5 min read",
    views: "2.3k",
    featured: true
  },
  {
    id: 2,
    title: "Wireless Headphones Buying Guide: What to Look For",
    excerpt: "Everything you need to know before purchasing your next pair of wireless headphones, from sound quality to battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=500&fit=crop",
    category: "Audio",
    author: "Mike Chen",
    date: "Dec 26, 2025",
    readTime: "7 min read",
    views: "1.8k",
    featured: false
  },
  {
    id: 3,
    title: "The Future of Wearable Technology in Healthcare",
    excerpt: "Discover how smartwatches and fitness trackers are revolutionizing personal health monitoring and medical care.",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=500&fit=crop",
    category: "Wearables",
    author: "Dr. Emily Roberts",
    date: "Dec 24, 2025",
    readTime: "6 min read",
    views: "3.1k",
    featured: true
  },
  {
    id: 4,
    title: "How to Choose the Perfect Laptop for Remote Work",
    excerpt: "A comprehensive guide to selecting a laptop that meets all your work-from-home needs without breaking the bank.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop",
    category: "Laptops",
    author: "James Wilson",
    date: "Dec 22, 2025",
    readTime: "8 min read",
    views: "2.7k",
    featured: false
  },
  {
    id: 5,
    title: "5G Technology: What It Means for Your Devices",
    excerpt: "Understanding the impact of 5G networks on smartphones, tablets, and IoT devices in your daily life.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=500&fit=crop",
    category: "Technology",
    author: "Alex Martinez",
    date: "Dec 20, 2025",
    readTime: "5 min read",
    views: "1.5k",
    featured: false
  },
  {
    id: 6,
    title: "Gaming Accessories That Will Level Up Your Setup",
    excerpt: "From RGB keyboards to high-DPI mice, explore the essential gaming peripherals that pros swear by.",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=500&fit=crop",
    category: "Gaming",
    author: "Chris Taylor",
    date: "Dec 18, 2025",
    readTime: "6 min read",
    views: "4.2k",
    featured: false
  }
];

const categories = [
  { name: "All", count: 24 },
  { name: "Smart Home", count: 8 },
  { name: "Audio", count: 6 },
  { name: "Wearables", count: 5 },
  { name: "Laptops", count: 7 },
  { name: "Gaming", count: 9 },
  { name: "Technology", count: 12 }
];

const trendingTopics = [
  "5G Technology",
  "AI Integration",
  "Sustainable Tech",
  "Wireless Charging",
  "Smart Home Security"
];

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-16 md:py-20 mb-6">
        <div className="max-w-7xl mx-auto text-center">
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-5 mb-4 text-(--text-heading) leading-tight">
            Insights, Tips & <br className="hidden md:block" />
            <span className="text-(--color-brand-primary)">Tech Trends</span>
          </h1>

          <p className="text-(--text-secondary) text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Stay updated with the latest technology news, product reviews, buying guides, 
            and expert insights from our team.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-(--border-default) focus:outline-none focus:border-(--color-brand-primary) transition-colors text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              
              {/* Categories */}
              <div className="bg-white border border-(--border-default) rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-(--text-heading) flex items-center gap-2">
                  <Tag size={20} className="text-(--color-brand-primary)" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left ${
                        selectedCategory === category.name
                          ? 'bg-(--bg-primary) text-(--text-inverse)'
                          : 'hover:bg-(--bg-surface) text-(--text-primary)'
                      }`}
                    >
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === category.name
                          ? 'bg-white text-(--color-brand-primary)'
                          : 'bg-(--bg-surface) text-(--text-secondary)'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-linear-to-br from-orange-50 to-red-50 border border-(--border-default) rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-(--text-heading) flex items-center gap-2">
                  <TrendingUp size={20} className="text-(--color-brand-primary)" />
                  Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 bg-white border border-(--border-default) rounded-full text-xs font-medium hover:bg-(--bg-primary) hover:text-(--text-inverse) hover:border-(--bg-primary) transition-all"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-(--bg-inverse) text-(--text-inverse) rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2">
                  Subscribe to Our Newsletter
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get the latest tech news and updates delivered to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2.5 rounded-lg mb-3 text-(--text-inverse) border focus:outline-none"
                />
                <button className="w-full bg-(--color-brand-primary) text-white py-2.5 rounded-lg hover:bg-(--color-blue) transition-all font-medium">
                  Subscribe
                </button>
              </div>

            </aside>

            {/* Blog Posts */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-8 bg-(--color-brand-primary) rounded-full"></div>
                    <h2 className="text-2xl font-bold text-(--text-heading)">Featured Articles</h2>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {featuredPosts.map(post => (
                      <BlogCard key={post.id} post={post} featured={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Posts */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-8 bg-(--color-brand-primary) rounded-full"></div>
                  <h2 className="text-2xl font-bold text-(--text-heading)">Latest Articles</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {regularPosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>

              {/* Load More */}
              <div className="flex justify-center pt-8">
                <button className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-10 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium flex items-center gap-2">
                  Load More Articles
                  <ArrowRight size={18} />
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;