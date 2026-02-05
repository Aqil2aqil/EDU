import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { Product, Banner } from '../types';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { Search, ShoppingBag, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const UserHome: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Default fallback slides in case DB is empty
  const defaultSlides = [
    {
      id: 'default-1',
      imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2d3f9e2?q=80&w=2070&auto=format&fit=crop",
      link: "#"
    },
    {
      id: 'default-2',
      imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop",
      link: "#"
    },
    {
      id: 'default-3',
      imageUrl: "https://images.unsplash.com/photo-1576091160550-217358c75ce7?q=80&w=2070&auto=format&fit=crop",
      link: "#"
    }
  ];

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Decide which slides to show
  const activeSlides = banners.length > 0 ? banners : defaultSlides;

  // Fetch Data
  useEffect(() => {
    // Fetch Products
    const productsRef = db.ref('products').orderByChild('createdAt');
    const handleProductData = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const productList: Product[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setProducts(productList.reverse());
      } else {
        setProducts([]);
      }
      setLoading(false);
    };

    // Fetch Banners
    const bannersRef = db.ref('banners');
    const handleBannerData = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const bannerList: Banner[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setBanners(bannerList);
      } else {
        setBanners([]);
      }
    };

    productsRef.on('value', handleProductData);
    bannersRef.on('value', handleBannerData);

    return () => {
      productsRef.off('value', handleProductData);
      bannersRef.off('value', handleBannerData);
    };
  }, []);

  // Slider Logic
  useEffect(() => {
    // Reset current slide if active slides change (e.g. from default to db)
    setCurrentSlide(0);
  }, [activeSlides.length]);

  useEffect(() => {
    startSlideTimer();
    return () => stopSlideTimer();
  }, [currentSlide, activeSlides.length]);

  const startSlideTimer = () => {
    stopSlideTimer();
    if (activeSlides.length > 1) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
  };

  const stopSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
    startSlideTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
    startSlideTimer();
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Advertising Slider */}
        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-lg mb-10 group bg-gray-200">
          {activeSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* STRICT: object-fit: fill to match container exactly without gaps */}
              <img
                src={slide.imageUrl}
                alt="Banner"
                className="w-full h-full object-fill"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                 {banners.length === 0 && (
                    <div className="absolute bottom-8 left-8 text-white animate-slide-up bg-black/30 p-4 rounded-xl backdrop-blur-sm">
                      <h2 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow-md">EDU Aptek</h2>
                      <p className="text-sm sm:text-lg mb-4 drop-shadow-md max-w-md">Sağlamlığınız bizim üçün dəyərlidir.</p>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow-lg pointer-events-auto">
                        İndi Sifariş Et
                      </button>
                    </div>
                 )}
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          {activeSlides.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 pointer-events-auto"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 pointer-events-auto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setCurrentSlide(index); startSlideTimer(); }}
                    className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                      currentSlide === index ? 'bg-green-600 w-6' : 'bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search Header */}
        <div className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Məhsullar</h1>
            <p className="mt-2 text-sm text-gray-500">Aptekimizin ən son məhsulları ilə tanış olun.</p>
          </div>
          <div className="mt-6 sm:mt-0 relative w-full sm:w-72 animate-slide-up delay-100">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Məhsul axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-lg focus:-translate-y-0.5"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          /* Mobile: 2 cols, Desktop: 4 cols */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 animate-pulse h-[260px] sm:h-[340px] border border-gray-100">
                <div className="h-36 sm:h-48 bg-gray-200 rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-4 sm:h-6 bg-gray-200 rounded-md w-3/4 mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded-md w-2/3 mb-3 sm:mb-4"></div>
                <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Mobile: 2 cols, Desktop: 4 cols */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard 
                  product={product} 
                  onViewDetails={(p) => setSelectedProduct(p)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto h-16 w-16 text-gray-300 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Məhsul tapılmadı</h3>
            <p className="mt-1 text-gray-500">Axtarış sorğunuzu dəyişin və ya daha sonra yoxlayın.</p>
          </div>
        )}

        {/* Visit Us / Contact Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden animate-slide-up delay-200">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aptekimizi Ziyarət Edin</h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            Bizim peşəkar əczaçılarımız sizə düzgün seçim etməkdə kömək etməyə hazırdır. 
            Ünvanımızı xəritədə asanlıqla tapa bilərsiniz.
          </p>
          <a 
            href="https://maps.google.com/?q=Edu+Aptek" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 transform hover:-translate-y-1"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Xəritədə Bax
          </a>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </div>
  );
};

export default UserHome;