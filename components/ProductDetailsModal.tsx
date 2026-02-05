import React from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    // Optional: Close modal after adding, or just show feedback. 
    // For now, keeping modal open to allow multiple additions or continued reading.
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background Overlay */}
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Content */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full animate-scale-in border border-gray-100 relative">
            
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={onClose}
                type="button"
                className="bg-white/80 backdrop-blur-md rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-sm group"
              >
                <span className="sr-only">Bağla</span>
                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* Image Section */}
                <div className="relative bg-gray-50 h-72 md:h-auto flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100">
                    <img 
                        src={product.imageUrl || 'https://picsum.photos/400/300'} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Details Section */}
                <div className="p-8 flex flex-col h-full bg-white">
                    <div className="mb-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Stokda var
                            </span>
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">
                            {product.name}
                        </h2>
                        
                        <div className="flex items-baseline gap-2 mb-8 border-b border-gray-100 pb-6">
                            <span className="text-4xl font-extrabold text-green-600">
                                {product.price.toFixed(2)} ₼
                            </span>
                            <span className="text-gray-400 text-sm font-medium">/ ədəd</span>
                        </div>

                        <div className="prose prose-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold uppercase tracking-wide text-xs mb-3">
                                <Info className="w-4 h-4 text-green-500" />
                                Təsir edici maddələr və Təsvir
                            </div>
                            <p className="leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-2">
                        <button 
                            className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all shadow-lg shadow-green-200 transform active:scale-95 flex items-center justify-center gap-3"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Səbətə əlavə et
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;