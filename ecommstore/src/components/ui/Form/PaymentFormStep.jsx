import { CreditCard, Truck } from "lucide-react";

const PaymentFormStep = () => {
  return (
    <div>
      {/* Payment Information */}
      {step === 2 && (
        <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-(--bg-primary) rounded-full flex items-center justify-center">
              <CreditCard size={24} className="text-(--icon-inverse)" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-(--text-heading)">
                Payment Method
              </h2>
              <p className="text-sm text-(--text-secondary)">
                Choose how you want to pay
              </p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4 mb-6">
            {/* Cash on Delivery */}
            <label
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === "cod"
                  ? "border-(--color-brand-primary) bg-blue-50"
                  : "border-(--border-default) hover:border-(--color-brand-primary)"
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-(--color-brand-primary)"
                />
                <div>
                  <p className="font-semibold text-(--text-heading)">
                    Cash on Delivery
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    Pay when you receive your order
                  </p>
                </div>
              </div>
              <Truck size={24} className="text-(--color-brand-primary)" />
            </label>

            {/* Credit/Debit Card */}
            <label
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === "card"
                  ? "border-(--color-brand-primary) bg-blue-50"
                  : "border-(--border-default) hover:border-(--color-brand-primary)"
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-(--color-brand-primary)"
                />
                <div>
                  <p className="font-semibold text-(--text-heading)">
                    Credit / Debit Card
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    Visa, Mastercard, or other cards
                  </p>
                </div>
              </div>
              <CreditCard size={24} className="text-(--color-brand-primary)" />
            </label>
          </div>

          {/* Card Details (if card payment selected) */}
          {paymentMethod === "card" && (
            <div className="border-t border-(--border-default) pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-(--text-heading) mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <CreditCard
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                  />
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
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-secondary)"
                    />
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

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-(--border-default) rounded-xl p-6 sticky top-6">
          <h3 className="text-xl font-bold mb-4 text-(--text-heading)">
            Order Summary
          </h3>

          {/* Items */}
          <div className="space-y-4 mb-6 pb-6 border-b border-(--border-default)">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-(--bg-surface) rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={`${item.thumbnail}` || "/placeholder.png"}
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
              <span className="font-medium">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-(--text-secondary)">
              <span>Shipping</span>
              <span className="font-medium">
                Rs. {shipping.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-(--text-secondary)">
              <span>Tax (17%)</span>
              <span className="font-medium">
                Rs. {Math.round(tax).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-(--border-default) pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-(--text-heading)">
                  Total
                </span>
                <span className="font-bold text-(--text-heading) text-xl">
                  Rs. {Math.round(total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFormStep;
