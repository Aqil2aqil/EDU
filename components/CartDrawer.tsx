import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, Phone, User, Info } from 'lucide-react';
import emailjs from '@emailjs/browser';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Ensure name and phone are filled
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Zəhmət olmasa adınızı və əlaqə nömrənizi qeyd edin.");
      return;
    }

    setIsSending(true);

    // Format the list of products for the email
    const productList = cart.map(item => 
      `${item.name} | Say: ${item.quantity} | Qiymət: ${(item.price * item.quantity).toFixed(2)} AZN`
    ).join('\n');

    // Mapped parameters to match EmailJS template keys exactly
    const templateParams = {
      user_name: customerName,
      user_phone: customerPhone,
      order_details: productList,
      total_price: `${cartTotal.toFixed(2)} AZN`,
      email: 'eduaptek33@gmail.com'
    };

    try {
      // EmailJS Credentials
      const SERVICE_ID = 'service_zccf6ir'; 
      const TEMPLATE_ID = 'template_t3qpcjf'; 
      const PUBLIC_KEY = 'Qbo9PZw29e-3pHZoj'; 

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

      // On success, show an alert and clear the cart
      alert("Sifariş eduaptek33@gmail.com ünvanına göndərildi!");
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      toggleCart();

    } catch (error) {
      console.error('FAILED...', error);
      alert('Sifariş göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity animate-fade-in" 
          onClick={toggleCart}
          aria-hidden="true"
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md animate-slide-up sm:animate-none transform transition ease-in-out duration-500 sm:translate-x-0" style={{ animation: 'slideInRight 0.3s ease-out forwards' }}>
             {/* Slide-in Animation Style Injection */}
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            
            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
              
              {/* Header */}
              <div className="flex items-start justify-between px-4 py-6 sm:px-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="slide-over-title">
                  Səbətiniz
                </h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none focus:ring-2 focus:ring-green-500"
                    onClick={toggleCart}
                  >
                    <span className="sr-only">Paneli bağla</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 relative">
                
                {/* Instruction Block */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex gap-3 items-start animate-fade-in">
                  <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 leading-relaxed font-medium">
                    Səbətə məhsulları əlavə edin, ad-soyad və telefon nömrənizi qeyd edərək istədiyiniz məhsulları əvvəlcədən sifariş edin. 
                    Daha sonra növbə gözləmədən aptekimizə yaxınlaşıb sifarişinizi təhvil ala bilərsiniz.
                  </p>
                </div>

                <div className="flow-root">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-80 text-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                           <ShoppingBag className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Səbətiniz boşdur</h3>
                        <p className="mt-1 text-sm text-gray-500">Məhsulları nəzərdən keçirin və səbətə əlavə edin.</p>
                        <button 
                          onClick={toggleCart}
                          className="mt-6 text-green-600 font-medium hover:text-green-800 flex items-center gap-1"
                        >
                          Alış-verişə davam et <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cart.map((product) => (
                          <li key={product.id} className="flex py-6 animate-fade-in">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
                              <img
                                src={product.imageUrl || 'https://picsum.photos/100/100'}
                                alt={product.name}
                                className="h-full w-full object-contain object-center"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3 className="line-clamp-2 pr-4">
                                    {product.name}
                                  </h3>
                                  <p className="ml-4 whitespace-nowrap text-green-600 font-bold">
                                    {(product.price * product.quantity).toFixed(2)} ₼
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.description}</p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button 
                                      onClick={() => updateQuantity(product.id, -1)}
                                      className="p-1.5 hover:bg-gray-100 transition-colors text-gray-600"
                                      disabled={product.quantity <= 1}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="px-3 py-1 font-medium text-gray-900 min-w-[2rem] text-center border-l border-r border-gray-300 bg-gray-50">
                                        {product.quantity}
                                    </span>
                                    <button 
                                      onClick={() => updateQuantity(product.id, 1)}
                                      className="p-1.5 hover:bg-gray-100 transition-colors text-gray-600"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(product.id)}
                                  className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="sr-only sm:not-sr-only sm:text-xs">Sil</span>
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>

              {/* Footer Section with Checkout Form */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50/50">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-6">
                    <p>Cəmi məbləğ</p>
                    <p className="text-xl font-bold text-green-700">{cartTotal.toFixed(2)} ₼</p>
                  </div>
                  
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                        Ad və Soyadınız
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="customerName"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Məs: Əli Vəliyev"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                        Əlaqə nömrəsi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="customerPhone"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Məs: 050 123 45 67"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={isSending}
                        className="flex w-full items-center justify-center rounded-xl border border-transparent bg-green-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-green-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Göndərilir...
                          </>
                        ) : (
                          'Sifariş et'
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={isSending}
                        className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                        onClick={clearCart}
                      >
                        Səbəti təmizlə
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;