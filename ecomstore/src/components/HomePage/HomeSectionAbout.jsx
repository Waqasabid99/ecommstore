import { stats } from "@/constants/utils";

const HomeSectionAbout = () => {

  return (
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-[#FFF5F5] py-8 md:py-12 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <span 
            className="px-6 py-2 rounded-full text-sm font-medium border-2 text-(--color-brand-primary) bg-transparent border-(--color-brand-primary) "
          >
            ABOUT COMPANY
          </span>
        </div>

        {/* Main Heading */}
        <div className="text-center border-b border-(--border-default)">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-(--text-heading)"
          >
            At Our Electronic Store, We Merge Tech and
            Innovation With convenience 
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center py-4 md:py-3 border-r border-(--border-default)"
            >
              <div 
                className="text-3xl md:text-3xl lg:text-3xl font-bold mb-2 text-(--text-heading)"
              >
                {stat.value}
              </div>
              <div 
                className="text-sm md:text-base text-(--text-secondary)"
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeSectionAbout;