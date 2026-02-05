import React from 'react';
import { Product } from '../types';
import { Tag, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div 
      onClick={() => onViewDetails && onViewDetails(product)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Container: responsive height (h-36 on mobile, h-56 on desktop) */}
      <div className="relative h-36 sm:h-56 w-full bg-gray-50 overflow-hidden">
        <img
          src={product.imageUrl || 'https://picsum.photos/400/300'}
          alt={product.name}
          className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500 ease-in-out"
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm border border-green-100 z-10">
          <span className="text-green-700 font-bold text-xs sm:text-sm">{product.price.toFixed(2)} ₼</span>
        </div>
        
        {/* Quick Add Button on Image Hover (Desktop Only) */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 p-2 bg-green-600 text-white rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 hover:bg-green-700 hover:scale-110 hidden sm:block"
          title="Səbətə əlavə et"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
      
      {/* Content: responsive padding (p-3 on mobile, p-5 on desktop) */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow relative">
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1 group-hover:text-green-600 transition-colors" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-grow leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto flex gap-2">
            <button 
              className="flex-grow bg-green-50 text-green-700 hover:bg-green-600 hover:text-white py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 group/btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) onViewDetails(product);
              }}
            >
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Ətraflı</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-200" />
            </button>
            
            <button 
              onClick={handleAddToCart}
              className="px-2 sm:px-3 bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center"
              title="Səbətə əlavə et"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;