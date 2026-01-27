import { CheckCircle } from 'lucide-react';

const ThankYou = () => {        
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
}

export default ThankYou;