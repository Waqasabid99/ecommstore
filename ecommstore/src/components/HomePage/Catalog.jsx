"use client";
import React, { useEffect, useRef, useState } from "react";
import Products from "./Products";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Catalog = ({ products, categories }) => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  
  const categoryRef = useRef(null);

  const handleScroll = (direction) => {
    if (!categoryRef.current) return;

    const scrollAmount = categoryRef.current.offsetWidth * 0.6;

    categoryRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (categoryId) => {
    // If clicking the same category, reset to show all products
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setFilteredProducts(products);
      setIsEmpty(products.length === 0);
      return;
    }

    // Filter products by category.id
    const filtered = products.filter(
      (product) => product.category?.id === categoryId
    );

    setSelectedCategory(categoryId);
    setFilteredProducts(filtered);
    setIsEmpty(filtered.length === 0);
  };

  const renderCategoryButtons = (items, level = 0) => {
  return items.map((category) => (
    <React.Fragment key={category.id}>
      <button
        onClick={() => handleCategoryClick(category.id)}
        className={`
          whitespace-nowrap
          border border-(--border-default)
          rounded-full px-4 py-1.5
          transition-all
          ${selectedCategory === category.id
            ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
            : "bg-(--bg-primary) text-(--btn-text-primary) hover:bg-(--btn-bg-hover)"
          }
          ml-${level * 4}  /* optional: indent nested buttons */
        `}
      >
        {category.name}
      </button>

      {/* recursively render children if they exist */}
      {category.children?.length > 0 &&
        renderCategoryButtons(category.children, level + 1)}
    </React.Fragment>
  ));
};


  // Reset when products change
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProducts(products);
      setIsEmpty(products.length === 0);
    }
  }, [products, selectedCategory]);

  return (
    <section className="mx-4 border border-(--border-default) rounded-xl pt-8 md:pt-12 mb-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-(--border-default) px-4 sm:px-6 md:px-10 pb-6">
        {/* Left */}
        <div>
          <span
            className="inline-block text-(--color-brand-primary) text-[10px]
                           border-2 border-(--border-primary)
                           rounded-full px-3 py-1"
          >
            EXCLUSIVE PRODUCTS
          </span>

          <h2
            className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl
                         font-semibold leading-tight text-(--text-heading) mt-3"
          >
            Our Featured Products
          </h2>
        </div>

        {/* Categories Slider */}
        <div className="relative flex items-center gap-2">
          {/* Left Arrow */}
          <button
            onClick={() => handleScroll("left")}
            className="hidden md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft
              size={24}
              className="bg-(--bg-primary) text-(--text-inverse) rounded-full"
            />
          </button>

          {/* Scroll Container */}
          <div
            ref={categoryRef}
            className="
              flex gap-3 max-w-[70vw] overflow-x-auto md:max-w-[30vw]
              md:overflow-x-hidden scroll-smooth
              scrollbar-hide
              pb-1
            "
          >
            {/* All Products Button */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setFilteredProducts(products);
                setIsEmpty(products.length === 0);
              }}
              className={`
                whitespace-nowrap
                border border-(--border-default)
                rounded-full px-4 py-1.5
                transition-all
                ${
                  selectedCategory === null
                    ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                    : "bg-(--bg-primary) text-(--btn-text-primary) hover:bg-(--btn-bg-hover)"
                }
              `}
            >
              All
            </button>

            {/* Category Buttons */}
            {renderCategoryButtons(categories)}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => handleScroll("right")}
            className="hidden md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight
              size={24}
              className="bg-(--bg-primary) text-(--text-inverse) rounded-full"
            />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <Products products={filteredProducts} isEmpty={isEmpty} />
    </section>
  );
};

export default Catalog;