// Sample partner logos data
const partners = [
  { id: 1, name: "Apple", logo: "https://cdn.worldvectorlogo.com/logos/apple-11.svg" },
  { id: 2, name: "Samsung", logo: "https://cdn.worldvectorlogo.com/logos/samsung-8.svg" },
  { id: 3, name: "Sony", logo: "https://cdn.worldvectorlogo.com/logos/sony-2.svg" },
  { id: 4, name: "LG", logo: "https://cdn.worldvectorlogo.com/logos/lg-electronics-1.svg" },
  { id: 5, name: "Microsoft", logo: "https://cdn.worldvectorlogo.com/logos/microsoft-5.svg" },
  { id: 6, name: "Google", logo: "https://cdn.worldvectorlogo.com/logos/google-g-2015.svg" }
];

const PartnersSlider = () => {
  return (
    <section className="mx-4 rounded-xl py-8 md:py-12 mb-6 border border-(--border-default)">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 px-4 sm:px-6 md:px-10 mb-10">
        
        {/* Left Side */}
        <div className="lg:max-w-md">
          <span className="inline-block text-(--color-brand-primary) text-[10px]
                           border-2 border-(--border-primary)
                           rounded-full px-3 py-1">
            WELCOME TO OUR STORE
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl
                         font-semibold leading-tight text-(--text-heading) mt-3">
            Our Premium Brands
          </h2>
        </div>

      </div>

      {/* Logo Grid with borders */}
      <div className="px-4 sm:px-6 md:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-(--border-default)">
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              className={`
                flex items-center justify-center p-8 
                border-(--border-default) border
                grayscale hover:grayscale-0 transition-all duration-300 
                opacity-60 hover:opacity-100 bg-white
              `}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSlider;