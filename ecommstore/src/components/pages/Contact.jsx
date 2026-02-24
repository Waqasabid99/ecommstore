'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, Instagram, Facebook, Twitter, Linkedin, X, XCircle } from 'lucide-react';
import axios from 'axios';
import { baseUrl } from '@/lib/utils';
import PhoneInput from 'react-phone-input-2';
import "react-phone-input-2/lib/style.css";

const contactInfo = [
  {
    icon: <Phone size={24} />,
    title: "Phone",
    details: ["+92 300 1234567", "+92 321 9876543"],
    description: "Mon-Sat, 9am-8pm"
  },
  {
    icon: <Mail size={24} />,
    title: "Email",
    details: ["support@electronics.com", "info@electronics.com"],
    description: "24/7 Email Support"
  },
  {
    icon: <MapPin size={24} />,
    title: "Location",
    details: ["Main Street, Plaza 123", "Saddiqabad, Punjab, Pakistan"],
    description: "Visit our store"
  },
  {
    icon: <Clock size={24} />,
    title: "Working Hours",
    details: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"],
    description: "We're here to help"
  }
];

const departments = [
  {
    icon: <MessageSquare size={28} />,
    title: "General Inquiries",
    email: "info@electronics.com",
    description: "For general questions and information about our products"
  },
  {
    icon: <Headphones size={28} />,
    title: "Customer Support",
    email: "support@electronics.com",
    description: "Need help with an order or have a technical question?"
  },
  {
    icon: <Send size={28} />,
    title: "Business Partnerships",
    email: "partnerships@electronics.com",
    description: "Interested in becoming a partner or supplier?"
  }
];

const socialLinks = [
  { icon: <Facebook size={20} />, name: "Facebook", url: "#" },
  { icon: <Instagram size={20} />, name: "Instagram", url: "#" },
  { icon: <Twitter size={20} />, name: "Twitter", url: "#" },
  { icon: <Linkedin size={20} />, name: "LinkedIn", url: "#" }
];

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {data} = await axios.post(`${baseUrl}/contact`, formData, {withCredentials: true});
      if (data.success) {
        setFormSubmitted(true);
        setLoading(false);
        setSuccess('Thank you for contacting us! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
      console.log('Form submitted:', formData);
    } catch (error) {
      setLoading(false);
      setFormSubmitted(true);
      setError('An error occurred while submitting the form.');
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-16 md:py-20 mb-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-4">
            GET IN TOUCH
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-5 mb-4 text-(--text-heading) leading-tight">
            We'd Love to <br className="hidden md:block" />
            <span className="text-(--color-brand-primary)">Hear From You</span>
          </h1>

          <p className="text-(--text-secondary) text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about our products or services? Our team is ready to help. 
            Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-white border border-(--border-default) rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-(--bg-primary) text-(--icon-inverse) rounded-full mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-(--text-heading)">
                  {info.title}
                </h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-(--text-secondary) text-sm mb-1">
                    {detail}
                  </p>
                ))}
                <p className="text-(--color-brand-primary) text-xs font-medium mt-2">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-(--text-heading)">
                  Send us a Message
                </h2>
                <p className="text-(--text-secondary)">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </div>

              <form className="space-y-6">
                {formSubmitted && (
                <div className={`flex w-full justify-between items-center ${success ? 'bg-green-50 border border-green-500 rounded-lg p-4 text-green-500' : error ? 'bg-red-50 border border-red-500 rounded-lg p-4 text-red-500' : ''}`}>
                {success ? <p>{success}</p> : error ? <p>{error}</p> : null}
                <XCircle className='cursor-pointer' onClick={() => setFormSubmitted(false)} size={20} />
                </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-(--text-heading) mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-(--text-heading) mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-(--text-heading) mb-2">
                      Phone Number
                    </label>
                    <PhoneInput
                      containerStyle={{ width: "100%" }}
                      inputStyle={{ width: "100%", padding: "" }}
                      country={"us"}
                      name="phone"
                      enableSearch
                      international
                      value={formData.phone}
                      onChange={(phone) =>
                                  handleChange({
                                    target: { name: "phone", value: phone },
                                  })
                                }
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-(--text-heading) mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-(--text-heading) mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Departments */}
              <div className="bg-[#FFF5F5] border border-(--border-default) rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-(--text-heading)">
                  Contact by Department
                </h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div 
                      key={index}
                      className="bg-white border border-(--border-default) rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-(--color-brand-primary) mt-1">
                          {dept.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-(--text-heading)">
                            {dept.title}
                          </h4>
                          <p className="text-(--color-brand-primary) text-xs mb-2 font-medium">
                            {dept.email}
                          </p>
                          <p className="text-(--text-secondary) text-xs leading-relaxed">
                            {dept.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-linear-to-br from-blue-50 to-purple-50 border border-(--border-default) rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-(--text-heading)">
                  Follow Us
                </h3>
                <p className="text-(--text-secondary) text-sm mb-4">
                  Stay connected with us on social media for updates and offers
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="inline-flex items-center justify-center w-10 h-10 bg-white border border-(--border-default) rounded-full hover:bg-(--bg-primary) hover:text-(--icon-inverse) hover:border-(--bg-primary) transition-all"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-(--border-default) rounded-xl overflow-hidden">
            <div className="aspect-video bg-(--bg-surface) flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-(--color-brand-primary) mx-auto mb-4" />
                <p className="text-(--text-secondary) font-medium">
                  Interactive Map Would Display Here
                </p>
                <p className="text-(--text-secondary) text-sm mt-2">
                  Main Street, Plaza 123, Saddiqabad, Punjab, Pakistan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="mx-4 border border-(--border-default) rounded-2xl bg-(--bg-inverse) text-(--text-inverse) py-12 md:py-16 mb-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Looking for Quick Answers?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Check out our FAQ section for instant answers to common questions about 
            orders, shipping, returns, and more.
          </p>
          <button className="bg-(--color-brand-primary) text-white px-10 py-3 rounded-full hover:bg-(--color-blue) transition-all font-medium">
            Visit FAQ
          </button>
        </div>
      </section>

    </div>
  );
};

export default Contact;