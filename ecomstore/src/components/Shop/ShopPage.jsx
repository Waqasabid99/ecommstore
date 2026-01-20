'use client';
import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { products } from '@/constants/utils';
import ProductCard from '@/components/ProductCard';
import ProductRating from '@/constants/ProductRating';

const ShopPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showInStock, setShowInStock] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    rating: true
  });

  const categories = [
    { name: 'Audio', count: 45 },
    { name: 'Wearables', count: 32 },
    { name: 'Gaming', count: 58 },
    { name: 'Accessories', count: 67 },
    { name: 'Computers', count: 29 }
  ];

  const brands = [
    'TechSound', 'FitTech', 'SoundWave', 'GameGear', 'ErgoTech', 'ConnectPro', 'ViewPlus'
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 50000]);
    setSelectedRating(0);
    setShowInStock(false);
  };

  const activeFiltersCount = selectedCategories.length + selectedBrands.length + 
    (selectedRating > 0 ? 1 : 0) + (showInStock ? 1 : 0);

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'fixed inset-0 z-50 lg:hidden' : 'hidden lg:block'}`}>
      {isMobile && (
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <aside className={`${
        isMobile 
          ? 'absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto' 
          : 'sticky top-4'
      } space-y-4`}>
        
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-(--border-default)">
            <h3 className="text-lg font-bold text-(--text-heading)">Filters</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-(--bg-surface) rounded-lg">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <div className={`bg-white border border-(--border-default) rounded-xl p-4 ${isMobile ? 'mx-4' : ''}`}>
            <button
              onClick={clearAllFilters}
              className="w-full text-sm text-(--color-brand-primary) font-medium hover:underline"
            >
              Clear All Filters ({activeFiltersCount})
            </button>
          </div>
        )}

        {/* Categories */}
        <div className={`bg-white border border-(--border-default) rounded-xl overflow-hidden ${isMobile ? 'mx-4' : ''}`}>
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between p-4 hover:bg-(--bg-surface) transition-colors"
          >
            <h3 className="font-semibold text-(--text-heading)">Categories</h3>
            {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.categories && (
            <div className="p-4 pt-0 space-y-2">
              {categories.map((category) => (
                <label key={category.name} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name.toLowerCase())}
                      onChange={() => toggleCategory(category.name.toLowerCase())}
                      className="w-4 h-4 rounded border-gray-300 text-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)"
                    />
                    <span className="text-sm text-(--text-primary) group-hover:text-(--color-brand-primary)">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-(--text-secondary)">({category.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className={`bg-white border border-(--border-default) rounded-xl overflow-hidden ${isMobile ? 'mx-4' : ''}`}>
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-4 hover:bg-(--bg-surface) transition-colors"
          >
            <h3 className="font-semibold text-(--text-heading)">Price Range</h3>
            {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.price && (
            <div className="p-4 pt-0 space-y-4">
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">Rs. 0</span>
                <span className="font-medium text-(--text-heading)">Rs. {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Brands */}
        <div className={`bg-white border border-(--border-default) rounded-xl overflow-hidden ${isMobile ? 'mx-4' : ''}`}>
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between p-4 hover:bg-(--bg-surface) transition-colors"
          >
            <h3 className="font-semibold text-(--text-heading)">Brands</h3>
            {expandedSections.brands ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.brands && (
            <div className="p-4 pt-0 space-y-2">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="w-4 h-4 rounded border-gray-300 text-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)"
                  />
                  <span className="text-sm text-(--text-primary) group-hover:text-(--color-brand-primary)">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className={`bg-white border border-(--border-default) rounded-xl overflow-hidden ${isMobile ? 'mx-4' : ''}`}>
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between p-4 hover:bg-(--bg-surface) transition-colors"
          >
            <h3 className="font-semibold text-(--text-heading)">Customer Rating</h3>
            {expandedSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.rating && (
            <div className="p-4 pt-0 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === rating}
                    onChange={() => setSelectedRating(rating)}
                    className="w-4 h-4 text-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)"
                  />
                  <div className="flex items-center gap-2">
                    <ProductRating rating={rating} />
                    <span className="text-sm text-(--text-secondary)">& Up</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div className={`bg-white border border-(--border-default) rounded-xl p-4 ${isMobile ? 'mx-4' : ''}`}>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showInStock}
              onChange={(e) => setShowInStock(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)"
            />
            <span className="text-sm font-medium text-(--text-primary) group-hover:text-(--color-brand-primary)">
              In Stock Only
            </span>
          </label>
        </div>

        {/* Mobile Apply Button */}
        {isMobile && (
          <div className="p-4 border-t border-(--border-default)">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-full bg-(--btn-bg-primary) text-(--btn-text-primary) py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium"
            >
              Apply Filters
            </button>
          </div>
        )}
      </aside>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="bg-white border border-(--border-default) rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-(--text-heading) mb-1">
                  Shop All Products
                </h1>
                <p className="text-(--text-secondary)">Showing {products.length} products</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-(--border-default) rounded-lg hover:bg-(--bg-surface) transition-colors"
                >
                  <SlidersHorizontal size={18} />
                  <span className="text-sm font-medium">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-(--color-brand-primary) text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar */}
            {isSidebarOpen && <Sidebar isMobile />}

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-(--border-default) rounded-lg hover:bg-(--bg-surface) transition-colors text-sm font-medium">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-(--btn-bg-primary) text-(--btn-text-primary) rounded-lg font-medium text-sm">
                    1
                  </button>
                  <button className="px-4 py-2 border border-(--border-default) rounded-lg hover:bg-(--bg-surface) transition-colors text-sm font-medium">
                    2
                  </button>
                  <button className="px-4 py-2 border border-(--border-default) rounded-lg hover:bg-(--bg-surface) transition-colors text-sm font-medium">
                    3
                  </button>
                  <button className="px-4 py-2 border border-(--border-default) rounded-lg hover:bg-(--bg-surface) transition-colors text-sm font-medium">
                    Next
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;