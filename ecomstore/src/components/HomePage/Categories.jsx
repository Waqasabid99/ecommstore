import { categories } from "@/constants/utils";
import { MdKeyboardArrowRight } from "react-icons/md";

const Categories = () => {
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
          {categories.slice(0, 3).map((category, index) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 bg-[#B7D9E7] duration-(--transition-normal)"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-r from-(--color-brand-primary) to-(--color-blue)"
              />

              <div className="relative px-6 py-8 md:py-10">
                <div className="mb-6 overflow-hidden rounded-xl transform transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <h3 
                  className="text-xl md:text-2xl font-bold mb-2 transition-colors duration-300 text-(--text-heading)"
                >
                  {category.name}
                </h3>

                <p 
                  className="text-sm md:text-base mb-4 opacity-80 text-(--text-secondary)"
                >
                  {category.description}
                </p>

                {/* Explore Button */}
                <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                  <span className="text-(--color-brand-primary)">
                    Explore
                  </span>
                  <MdKeyboardArrowRight  className='text-(--color-brand-primary)'/>
                </div>
              </div>  
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 md:mt-12 text-center">
          <button
            className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 bg-(var(--btn-bg-primary)) text-(--btn-text-primary)"
            style={{
              backgroundColor: 'var(--btn-bg-primary)',
              color: 'var(--btn-text-primary)',
            }}
          >
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;