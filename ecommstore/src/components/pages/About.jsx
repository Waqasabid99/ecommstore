'use client';
import { Package, Users, Award, TrendingUp, CheckCircle, ShoppingBag, Headphones, Shield } from 'lucide-react';

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Products" },
  { value: "50+", label: "Team Members" },
  { value: "99%", label: "Satisfaction Rate" }
];

const values = [
  {
    icon: <Award size={32} />,
    title: "Quality First",
    description: "We source only the highest quality electronics from trusted manufacturers worldwide."
  },
  {
    icon: <Users size={32} />,
    title: "Customer Focused",
    description: "Your satisfaction is our priority. We're here to help you find the perfect tech solutions."
  },
  {
    icon: <TrendingUp size={32} />,
    title: "Innovation Driven",
    description: "We stay ahead of the curve, bringing you the latest technology and trends in electronics."
  },
  {
    icon: <Shield size={32} />,
    title: "Trusted & Secure",
    description: "Shop with confidence knowing your data and purchases are protected with industry-leading security."
  }
];

const features = [
  {
    icon: <Package size={28} />,
    title: "Fast Shipping",
    description: "Get your orders delivered quickly with our reliable shipping partners."
  },
  {
    icon: <ShoppingBag size={28} />,
    title: "Easy Returns",
    description: "30-day hassle-free returns on all products with full refund guarantee."
  },
  {
    icon: <Headphones size={28} />,
    title: "24/7 Support",
    description: "Our dedicated support team is always ready to assist you anytime."
  }
];

const milestones = [
  { year: "2018", event: "Company Founded", description: "Started our journey with a vision to revolutionize electronics retail" },
  { year: "2020", event: "10,000 Customers", description: "Reached our first major milestone of serving 10,000 happy customers" },
  { year: "2022", event: "Nationwide Expansion", description: "Expanded our services to cover all major cities across the country" },
  { year: "2024", event: "Industry Leader", description: "Recognized as one of the top electronics retailers in the region" }
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-16 md:py-24 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Text Content */}
            <div className="md:w-1/2 text-center md:text-left">
              <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-4">
                OUR STORY
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-5 mb-4 text-(--text-heading) leading-tight">
                Bringing Technology <br className="hidden md:block" /> 
                <span className="text-(--color-brand-primary)">To Your Doorstep</span>
              </h1>

              <p className="text-(--text-secondary) text-lg mb-8 leading-relaxed">
                Since 2018, we've been on a mission to make cutting-edge electronics accessible to everyone. 
                From smartphones to smart homes, we're your trusted partner in the digital age.
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium">
                  Shop Now
                </button>
                <button className="border-2 border-(--border-inverse) text-(--text-primary) px-8 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium">
                  Contact Us
                </button>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-(--color-brand-primary) opacity-10 rounded-full blur-3xl"></div>
                {/* <img
                  src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=600&fit=crop"
                  alt="About Us"
                  className="relative rounded-2xl shadow-2xl w-full max-w-md"
                /> */}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-white py-12 mb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 text-(--color-brand-primary)">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-(--text-secondary) font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-[#FFF5F5] py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-6 py-2 rounded-full text-sm font-medium border-2 text-(--color-brand-primary) bg-transparent border-(--color-brand-primary) mb-4">
              OUR MISSION
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-(--text-heading)">
              Empowering Lives Through Technology
            </h2>
            <p className="text-(--text-secondary) text-lg max-w-3xl mx-auto leading-relaxed">
              We believe technology should enhance every aspect of life. Our mission is to provide high-quality, 
              innovative electronics that empower individuals and businesses to achieve more, connect better, 
              and live smarter.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white border border-(--border-default) rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="text-(--color-brand-primary) mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-(--text-heading)">
                  {value.title}
                </h3>
                <p className="text-(--text-secondary) text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-white py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-6 py-2 rounded-full text-sm font-medium border-2 text-(--color-brand-primary) bg-transparent border-(--color-brand-primary) mb-4">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-(--text-heading)">
              Our Milestones
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-(--border-default)"></div>

            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="md:w-1/2 text-center md:text-left">
                    <div className="inline-block bg-(--color-brand-primary) text-white text-2xl font-bold px-6 py-2 rounded-full mb-4">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-(--text-heading)">
                      {milestone.event}
                    </h3>
                    <p className="text-(--text-secondary)">
                      {milestone.description}
                    </p>
                  </div>
                  
                  {/* Center Circle */}
                  <div className="hidden md:block w-4 h-4 bg-(--color-brand-primary) rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-linear-to-br from-purple-50 to-blue-50 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-6 py-2 rounded-full text-sm font-medium border-2 text-(--color-brand-primary) bg-transparent border-(--color-brand-primary) mb-4">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-(--text-heading)">
              Your Trusted Electronics Partner
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-(--border-default) rounded-xl p-8 text-center hover:shadow-xl transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-(--bg-primary) text-(--icon-inverse) rounded-full mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-(--text-heading)">
                  {feature.title}
                </h3>
                <p className="text-(--text-secondary) leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-(--bg-inverse) text-(--text-inverse) py-16 md:py-20 mb-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Join thousands of satisfied customers who trust us for their electronics needs. 
            Start shopping today and discover the perfect tech for your lifestyle.
          </p>
          <button className="bg-(--color-brand-primary) text-white px-10 py-4 rounded-full hover:bg-(--color-blue) transition-all font-medium text-lg">
            Start Shopping
          </button>
        </div>
      </section>

    </div>
  );
};

export default About;