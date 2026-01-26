'use client';
import { useState } from 'react';
import { CreditCard, Truck, MapPin, User, Mail, Phone, Home, Building2, Lock, ShoppingBag, CheckCircle, ArrowLeft, X, Key, Eye, EyeClosed } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { Country, State, City }  from 'country-state-city';
import useCartStore from '@/store/useCartStore';
import Select from 'react-select';
import { getStatesOfCountry } from 'country-state-city/lib/state';
import { baseUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const Checkout = () => {
  const [step, setStep] = useState(1); // 1: shipping, 2: payment, 3: confirmation
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [hasAccount, setHasAccount] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const { getCartItems, getCartSummary, updateCartItem, removeCartItem, isLoading } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { totalQuantity, subtotal } = getCartSummary();
  const orderItems = getCartItems();
  const countryOptions = Country.getAllCountries().map((country) => ({ value: country.isoCode, label: country.name }));
  const states = stateOptions.map((state) => ({ value: state.isoCode, label: state.name }));
  const cities = cityOptions.map((city) => ({ value: city.name, label: city.name }));
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    province: '',
    postalCode: ''
  });
  
  console.log(user)
  const [billingInfo, setBillingInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Calculate totals
  const shipping = 299;
  const tax = subtotal * 0.17;
  const total = parseInt(subtotal) + shipping + tax;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setStep(3);
    window.scrollTo(0, 0);
  };

  // Confirmation Screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <section className="mx-4 my-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-(--border-default) rounded-xl p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-(--text-heading)">
                Order Placed Successfully!
              </h1>
              
              <p className="text-(--text-secondary) text-lg mb-2">
                Thank you for your purchase!
              </p>
              
              <p className="text-(--text-secondary) mb-8">
                Order #<span className="font-semibold text-(--text-heading)">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </p>

              <div className="bg-(--bg-surface) rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-4 text-(--text-heading)">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Total Amount:</span>
                    <span className="font-semibold">Rs. {Math.round(total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Payment Method:</span>
                    <span className="font-semibold">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-secondary)">Delivery to:</span>
                    <span className="font-semibold">{shippingInfo.city}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-(--text-secondary)">
                  A confirmation email has been sent to <span className="font-semibold text-(--text-heading)">{shippingInfo.email}</span>
                </p>
                <p className="text-sm text-(--text-secondary)">
                  Estimated delivery: <span className="font-semibold text-(--text-heading)">3-5 business days</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button className="bg-(--btn-bg-primary) text-(--btn-text-primary) px-8 py-3 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium">
                  Track Order
                </button>
                <button className="border-2 border-(--border-inverse) text-(--text-primary) px-8 py-3 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      
      {/* Header */}
      <section className="bg-linear-to-br from-blue-50 to-purple-50 mx-4 rounded-xl px-6 py-12 md:py-16 mb-6">
        <div className="max-w-7xl mx-auto">
          <Link href={'/cart'} className="text-(--text-secondary) hover:text-(--text-hover) font-medium flex items-center gap-2 mb-4">
            <ArrowLeft size={18} />
            <span>Back to Cart</span>
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-(--color-brand-primary) text-sm border-2 border-(--border-primary) rounded-full px-4 py-1.5 font-medium mb-3">
                SECURE CHECKOUT
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--text-heading)">
                Complete Your Order
              </h1>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-(--bg-primary) text-(--text-inverse)' : 'bg-white text-(--text-secondary) border border-(--border-default)'
              }`}>
                1
              </div>
              <span className={`hidden sm:inline font-medium ${step >= 1 ? 'text-(--text-heading)' : 'text-(--text-secondary)'}`}>
                Shipping
              </span>
            </div>
            
            <div className="w-12 h-0.5 bg-(--border-default)"></div>
            
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-(--bg-primary) text-(--text-inverse)' : 'bg-white text-(--text-secondary) border border-(--border-default)'
              }`}>
                2
              </div>
              <span className={`hidden sm:inline font-medium ${step >= 2 ? 'text-(--text-heading)' : 'text-(--text-secondary)'}`}>
                Payment
              </span>
            </div>
            
            <div className="w-12 h-0.5 bg-(--border-default)"></div>
            
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 3 ? 'bg-(--bg-primary) text-(--text-inverse)' : 'bg-white text-(--text-secondary) border border-(--border-default)'
              }`}>
                3
              </div>
              <span className={`hidden sm:inline font-medium ${step >= 3 ? 'text-(--text-heading)' : 'text-(--text-secondary)'}`}>
                Confirm
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Shipping Information */}
              {step === 1 && (
                <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-(--bg-primary) rounded-full flex items-center justify-center">
                      <Truck size={24} className="text-(--icon-inverse)" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-(--text-heading)">Shipping Information</h2>
                      <p className="text-sm text-(--text-secondary)">Where should we deliver your order?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    {hasAccount ? null : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          First Name *
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <input
                            type="text"
                            name="firstName"
                            value={shippingInfo.firstName}
                            onChange={handleShippingChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="John"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Last Name *
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <input
                            type="text"
                            name="lastName"
                            value={shippingInfo.lastName}
                            onChange={handleShippingChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      {/* Toggle between "Have an account?" and "Create an account" */}
                      <span onClick={() => setHasAccount(prev => !prev)} className='text-(--text-hover) font-semibold cursor-pointer hover:text-(--text-primary)'>Already have an account?</span>
                    </div>
                    )}

                    {/* Contact */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <input
                            type="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleShippingChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Key size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          {showPassword ? <Eye role='button' aria-label='Show Password' onClick={() => setShowPassword(prev => !prev)} size={18} className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"/> : <EyeClosed role ='button' aria-label='Hide Password' onClick={() => setShowPassword(prev => !prev)} size={18} className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"/> }
                          
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={shippingInfo.password}
                            onChange={handleShippingChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="12345678"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <input
                            type="tel"
                            name="phone"
                            value={shippingInfo.phone}
                            onChange={handleShippingChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="+92 300 1234567"
                          />
                        </div>
                      </div>
                      {!hasAccount ? null : (
                        <button onClick={() => setHasAccount(prev => !prev)} className='text-(--text-hover) font-semibold hover:text-(--text-primary)'>Don't have an account?</button>
                      )}

                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-(--text-heading) mb-2">
                        Street Address *
                      </label>
                      <div className="relative">
                        <Home size={18} className="absolute left-3 top-3.5 text-(--text-secondary)" />
                        <textarea
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleShippingChange}
                          required
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors resize-none"
                          placeholder="House/Flat No., Street Name, Area"
                        />
                      </div>
                    </div>
              
                    {/* City & Province */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          City *
                        </label>
                        <div className="relative">
                          <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <Select
                            name="city"
                            isClearable={true}
                            isSearchable={true}
                            options={cities}
                            onChange={option => setShippingInfo(prev => ({ ...prev, city: option?.value }))}
                            required
                            className="basic-single"
                            placeholder="Lahore"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Country *
                        </label>
                        <div className="relative">
                          <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <Select
                            name="country"
                            isClearable={true}
                            isSearchable={true}
                            options={countryOptions}
                            onChange={option => 
                              {
                                setShippingInfo(prev => ({ ...prev, country: option?.value || '' }));
                                setStateOptions(State.getStatesOfCountry(option?.value || ''));
                                setCityOptions(City.getCitiesOfCountry(option?.value || ''));
                              }}
                            styles={''}
                            required
                            className="basic-single"
                            classNamePrefix='select'
                            placeholder="PK"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          State / Province *
                        </label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <Select
                            name="province"
                            isClearable={true}
                            isSearchable={true}
                            options={states}
                            onChange={option => setShippingInfo(prev => ({ ...prev, province: option?.value }))}
                            required
                            className="basic-single"
                          />
                        </div>
                      </div>
                    {/* Postal Code */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-(--text-heading) mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-1.5 border border-(--border-default) rounded focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                        placeholder="54000"
                      />
                    </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    className="w-full mt-6 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Payment Information */}
              {step === 2 && (
                <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-(--bg-primary) rounded-full flex items-center justify-center">
                      <CreditCard size={24} className="text-(--icon-inverse)" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-(--text-heading)">Payment Method</h2>
                      <p className="text-sm text-(--text-secondary)">Choose how you want to pay</p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    {/* Cash on Delivery */}
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-(--color-brand-primary) bg-blue-50' : 'border-(--border-default) hover:border-(--color-brand-primary)'
                    }`}>
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-(--color-brand-primary)"
                        />
                        <div>
                          <p className="font-semibold text-(--text-heading)">Cash on Delivery</p>
                          <p className="text-sm text-(--text-secondary)">Pay when you receive your order</p>
                        </div>
                      </div>
                      <Truck size={24} className="text-(--color-brand-primary)" />
                    </label>

                    {/* Credit/Debit Card */}
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-(--color-brand-primary) bg-blue-50' : 'border-(--border-default) hover:border-(--color-brand-primary)'
                    }`}>
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-(--color-brand-primary)"
                        />
                        <div>
                          <p className="font-semibold text-(--text-heading)">Credit / Debit Card</p>
                          <p className="text-sm text-(--text-secondary)">Visa, Mastercard, or other cards</p>
                        </div>
                      </div>
                      <CreditCard size={24} className="text-(--color-brand-primary)" />
                    </label>
                  </div>

                  {/* Card Details (if card payment selected) */}
                  {paymentMethod === 'card' && (
                    <div className="border-t border-(--border-default) pt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                          <input
                            type="text"
                            name="cardNumber"
                            value={billingInfo.cardNumber}
                            onChange={handleBillingChange}
                            required
                            maxLength={19}
                            className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-heading) mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={billingInfo.cardName}
                          onChange={handleBillingChange}
                          required
                          className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={billingInfo.expiryDate}
                            onChange={handleBillingChange}
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-(--text-heading) mb-2">
                            CVV *
                          </label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)" />
                            <input
                              type="text"
                              name="cvv"
                              value={billingInfo.cvv}
                              onChange={handleBillingChange}
                              required
                              maxLength={4}
                              className="w-full pl-10 pr-4 py-3 border border-(--border-default) rounded-lg focus:outline-none focus:border-(--color-brand-primary) transition-colors"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border-2 border-(--border-inverse) text-(--text-primary) px-6 py-4 rounded-full hover:bg-(--bg-inverse) hover:text-(--text-inverse) transition-all font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-(--btn-bg-primary) text-(--btn-text-primary) px-6 py-4 rounded-full hover:bg-(--btn-bg-hover) transition-all font-medium text-lg"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-(--border-default) rounded-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold mb-4 text-(--text-heading)">Order Summary</h3>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-(--border-default)">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-(--bg-surface) rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={`${item.thumbnail}` || '/placeholder.png'}
                          width={100}
                          height={100}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-(--text-heading) line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-(--text-secondary) mt-1">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-(--text-heading) mt-1">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Shipping</span>
                    <span className="font-medium">Rs. {shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-(--text-secondary)">
                    <span>Tax (17%)</span>
                    <span className="font-medium">Rs. {Math.round(tax).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-(--border-default) pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-(--text-heading)">Total</span>
                      <span className="font-bold text-(--text-heading) text-xl">
                        Rs. {Math.round(total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-(--bg-surface) rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock size={20} className="text-(--color-brand-primary)" />
                    <h4 className="font-semibold text-sm text-(--text-heading)">Secure Checkout</h4>
                  </div>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="mx-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-linear-to-br from-blue-50 to-purple-50 border border-(--border-default) rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                  <Lock size={24} className="text-(--color-brand-primary)" />
                </div>
                <h4 className="font-semibold mb-1 text-(--text-heading)">Secure Payment</h4>
                <p className="text-sm text-(--text-secondary)">SSL encrypted transactions</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                  <Truck size={24} className="text-(--color-brand-primary)" />
                </div>
                <h4 className="font-semibold mb-1 text-(--text-heading)">Fast Delivery</h4>
                <p className="text-sm text-(--text-secondary)">3-5 business days</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                  <CheckCircle size={24} className="text-(--color-brand-primary)" />
                </div>
                <h4 className="font-semibold mb-1 text-(--text-heading)">Easy Returns</h4>
                <p className="text-sm text-(--text-secondary)">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Checkout;