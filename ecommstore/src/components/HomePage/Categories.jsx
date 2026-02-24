"use client";
import { useRouter } from "next/navigation";

const Categories = ({ categories }) => {
  const navigate = useRouter();
  const handleCategoryClick = (category) => {
    navigate.push(`/shop/?category=${category}`);
  }
  return (
    <section className="px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
            Shop by Category
          </h2>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Discover our curated collections
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {categories.slice(0, 3).map((category) => (
            <div
            onClick={() => handleCategoryClick(category.slug)}
              key={category.id}
              className="group relative overflow-hidden rounded cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 border duration-(--transition-normal)"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-r from-(--color-brand-primary) to-(--color-blue)"
              />

              <div className="relative px-6 py-5 md:py-5">
                <h3 
                  className="text-xl md:text-2xl font-bold mb-2 transition-colors duration-300 text-(--text-heading)"
                >
                  {category.name}
                </h3>
              </div>  
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;