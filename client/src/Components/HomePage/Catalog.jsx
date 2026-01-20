import { useRef } from "react";
import { categories } from "../../constants/utlits";
import Products from "./Products";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Catalog = () => {
  const categoryRef = useRef(null);

  const handleScroll = (direction) => {
    if (!categoryRef.current) return;

    const scrollAmount = categoryRef.current.offsetWidth * 0.6;

    categoryRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-4 border border-(--border-default) rounded-xl pt-8 md:pt-12 mb-6">

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-(--border-default) px-4 sm:px-6 md:px-10 pb-6">

        {/* Left */}
        <div>
          <span className="inline-block text-(--color-brand-primary) text-[10px]
                           border-2 border-(--border-primary)
                           rounded-full px-3 py-1">
            EXCLUSIVE PRODUCTS
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl
                         font-semibold leading-tight text-(--text-heading) mt-3">
            Our Featured Products
          </h2>
        </div>

        {/* Categories Slider */}
        <div className="relative flex items-center gap-2">

          {/* Left Arrow */}
          <button
            onClick={() => handleScroll("left")}
            className="hidden md:flex"
          >
            <ChevronLeft size={24} className="bg-(--bg-primary) text-(--text-inverse) rounded-full" />
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
            {categories.map((category) => (
              <button
                key={category.id}
                className="
                  whitespace-nowrap
                  border border-(--border-default)
                  bg-(--bg-primary)
                  text-(--btn-text-primary)
                  rounded-full px-4 py-1.5
                  hover:bg-(--btn-bg-hover)
                  transition-all
                "
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => handleScroll("right")}
            className="hidden md:flex"
          >
            <ChevronRight size={24} className="bg-(--bg-primary) text-(--text-inverse) rounded-full" />
          </button>

        </div>
      </div>

      <Products />
    </section>
  );
};

export default Catalog;