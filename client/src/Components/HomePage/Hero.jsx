
const Hero = () => {
  return (
    <section className="bg-[#E6D3F0] mx-4 rounded-xl px-6 py-20">
      <div className="flex flex-col-reverse md:flex-row items-center gap-10">
        
        {/* Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-3 py-1">
            First Look
          </span>

          <h1 className="text-4xl md:text-5xl font-semibold mt-5 mb-3">
            5G-Friendly <br className="hidden md:block" /> With Face Detection
          </h1>

          <p className="mb-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, est.
          </p>

          <button className="bg-(--btn-bg-secondary) text-white px-6 py-2 rounded-full hover:bg-(--btn-bg-hover-secondary)">
            Shop Now
          </button>
        </div>

        {/* Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/hero-banner.svg"
            alt="Mobile Phone"
            width={240}
            height={240}
            className="w-60 max-w-sm"
          />
        </div>

      </div>
    </section>
  );
};

export default Hero;