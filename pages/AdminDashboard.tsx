import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { Product, Banner } from '../types';
import { Plus, Edit2, Trash2, Package, Search, Image as ImageIcon, ExternalLink, Loader2, Camera, Upload, Link as LinkIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import ProductModal from '../components/ProductModal';

const AdminDashboard: React.FC = () => {
  // Product State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Banner State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerInputType, setBannerInputType] = useState<'url' | 'file' | 'camera'>('url');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  // Status State (Replaces alerts)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Camera State for Banner
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper: Clear status after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Fetch Data
  useEffect(() => {
    // Products Listener
    const productsRef = db.ref('products');
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

    // Banners Listener
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
      stopCamera(); // Cleanup camera on unmount
    };
  }, []);

  // --- Camera Logic: Attach Stream to Video Element ---
  // This useEffect ensures videoRef is populated (after render) before assigning srcObject
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.error("Video play error:", e));
    }
  }, [isCameraOpen, cameraStream]);

  // --- Camera Helper Functions ---
  const startCamera = async () => {
    setCapturedImage(null);
    setIsCameraOpen(true); // Open UI first

    try {
      let stream: MediaStream;
      try {
        // 1. Try Back Camera (Environment)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          },
          audio: false
        });
      } catch (err) {
        console.warn("Back camera unavailable, trying fallback...", err);
        // 2. Fallback to any available video source
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
      }
      
      setCameraStream(stream);
      // Note: srcObject assignment is handled by the useEffect above
    } catch (err) {
      console.error("Camera permissions denied or device not found:", err);
      setIsCameraOpen(false);
      setStatusMessage({ type: 'error', text: 'Kameraya icazə verilmədi və ya kamera tapılmadı.' });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Ensure video has data
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setStatusMessage({ type: 'error', text: 'Video yüklənməyib, yenidən cəhd edin.' });
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to Base64 (JPEG 0.6 quality for optimization)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- Product Handlers ---
  const handleDeleteProduct = async (id: string) => {
    try {
      await db.ref(`products/${id}`).remove();
      setStatusMessage({ type: 'success', text: 'Məhsul silindi.' });
    } catch (error) {
      console.error("Error deleting product:", error);
      setStatusMessage({ type: 'error', text: 'Xəta baş verdi.' });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // --- Banner Handlers ---
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBannerUploading(true);

    try {
      let finalImageUrl = '';

      if (bannerInputType === 'url') {
        if (!bannerUrl.trim()) {
          setStatusMessage({ type: 'error', text: 'URL daxil edin.' });
          setIsBannerUploading(false);
          return;
        }
        finalImageUrl = bannerUrl.trim();

      } else if (bannerInputType === 'file') {
        if (!bannerFile) {
          setStatusMessage({ type: 'error', text: 'Fayl seçilməyib.' });
          setIsBannerUploading(false);
          return;
        }
        finalImageUrl = await convertFileToBase64(bannerFile);

      } else if (bannerInputType === 'camera') {
        if (!capturedImage) {
          setStatusMessage({ type: 'error', text: 'Şəkil çəkilməyib.' });
          setIsBannerUploading(false);
          return;
        }
        finalImageUrl = capturedImage;
      }

      // Save Base64 directly to Realtime DB
      await db.ref('banners').push({
        imageUrl: finalImageUrl
      });

      // Reset Form
      setBannerUrl('');
      setBannerFile(null);
      setCapturedImage(null);
      setStatusMessage({ type: 'success', text: 'Uğurla yükləndi' });

    } catch (error) {
      console.error("Error adding banner:", error);
      setStatusMessage({ type: 'error', text: 'Xəta baş verdi.' });
    } finally {
      setIsBannerUploading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await db.ref(`banners/${id}`).remove();
      setStatusMessage({ type: 'success', text: 'Banner silindi.' });
    } catch (error) {
      console.error("Error deleting banner:", error);
      setStatusMessage({ type: 'error', text: 'Silinmə zamanı xəta.' });
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in relative">
      
      {/* Status Toast */}
      {statusMessage && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up border ${
          statusMessage.type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-500" />
          )}
          <span className={`font-medium ${
            statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {statusMessage.text}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8 animate-slide-up">
          <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <Package className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ümumi məhsul sayı</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <ImageIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Aktiv Bannerlər</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">{banners.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Advanced Banner Management Section --- */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 mb-8 animate-slide-up delay-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600" />
            Banner İdarəetmə
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Banner Form */}
            <div className="lg:col-span-1">
              <form onSubmit={handleAddBanner} className="space-y-4">
                
                {/* Input Type Toggles */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setBannerInputType('url')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                      bannerInputType === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerInputType('file')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                      bannerInputType === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-1" /> Fayl
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerInputType('camera')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                      bannerInputType === 'camera' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Camera className="w-4 h-4 mr-1" /> Kamera
                  </button>
                </div>

                {/* URL Input */}
                {bannerInputType === 'url' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil Linki</label>
                    <input 
                      type="url" 
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="block w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                )}

                {/* File Input */}
                {bannerInputType === 'file' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cihazdan Yüklə</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-400 mt-2">Maksimum ölçü: 500KB tövsiyə edilir.</p>
                  </div>
                )}

                {/* Camera Input */}
                {bannerInputType === 'camera' && (
                  <div className="animate-fade-in space-y-3">
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-200">
                      {capturedImage ? (
                        <div className="relative w-full h-full">
                          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setCapturedImage(null); startCamera(); }}
                            className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-600 hover:bg-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : isCameraOpen ? (
                        <div className="relative w-full h-full bg-black">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-4 border-gray-200 flex items-center justify-center hover:scale-110 transition-transform z-10"
                          >
                            <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white"></div>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Camera className="w-10 h-10 mb-2" />
                          <button
                            type="button"
                            onClick={startCamera}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            Kameranı aç
                          </button>
                        </div>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBannerUploading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 mt-4"
                >
                  {isBannerUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Banner Əlavə et
                </button>
              </form>
            </div>

            {/* Existing Banners List */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Mövcud Bannerlər ({banners.length})</h3>
              {banners.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Hələ banner yoxdur</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {banners.map((banner) => (
                    <div key={banner.id} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        src={banner.imageUrl} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          href={banner.imageUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 backdrop-blur-sm transition-colors"
                          title="Böyüt"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 backdrop-blur-sm transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Product Management Section --- */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6 animate-slide-up delay-200">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">Məhsul İdarəetməsi</h2>
          <div className="mt-4 sm:mt-0 flex gap-4">
             <div className="relative flex-grow sm:flex-grow-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Məhsul axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full sm:w-64 pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-sm"
                />
            </div>
            <button
              onClick={handleAddProduct}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Yeni məhsul
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden animate-slide-up delay-300">
          {loading ? (
             <div className="p-12 text-center">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
               <p className="mt-2 text-gray-500 font-medium">Yüklənir...</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Məhsul
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Qiymət
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Təsvir
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Əməliyyatlar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-green-50/50 transition-colors duration-150 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                            <img className="h-full w-full object-contain" src={product.imageUrl || 'https://picsum.photos/40/40'} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 font-mono">ID: {product.id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                          {product.price} ₼
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditProduct(product)} 
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors mr-2"
                          title="Düzəliş et"
                        >
                           <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Sil"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package className="w-12 h-12 text-gray-300 mb-2" />
                          <p>Məhsul tapılmadı.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <button
        onClick={handleAddProduct}
        className="sm:hidden fixed bottom-6 right-6 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform active:scale-95 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <ProductModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          productToEdit={editingProduct} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;