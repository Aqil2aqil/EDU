import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { Product } from '../types';
import { X, Upload, Loader2, Camera, Repeat, Aperture } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [shutterEffect, setShutterEffect] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price.toString());
      setImageUrl(productToEdit.imageUrl);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    }
  }, [productToEdit]);

  // Cleanup stream on unmount or when modal closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Attach stream to video element when camera is open
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setImageUrl(''); // Clear existing image if any
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Kameraya icazə verilmədi. Zəhmət olmasa cihazınızın ayarlarını yoxlayın.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      // Shutter animation
      setShutterEffect(true);
      setTimeout(() => setShutterEffect(false), 200);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Compress to JPEG with 0.7 quality to keep size manageable for Realtime DB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImageUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validation: Check if file size is > 1MB
      if (file.size > 1048576) {
        alert("Şəkilin ölçüsü 1MB-dan çox ola bilməz. Zəhmət olmasa daha kiçik bir şəkil seçin.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl,
        createdAt: productToEdit ? productToEdit.createdAt : Date.now()
      };

      if (productToEdit) {
        await db.ref(`products/${productToEdit.id}`).update(productData);
      } else {
        await db.ref('products').push(productData);
      }

      // Ensure camera is stopped if user submits while it's open (rare case)
      stopCamera();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity animate-fade-in" 
          aria-hidden="true"
          onClick={handleClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-8 animate-scale-in border border-gray-100">
          <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
            <button
              onClick={handleClose}
              type="button"
              className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <span className="sr-only">Bağla</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start w-full">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6" id="modal-title">
                {productToEdit ? 'Məhsulu Dəyiş' : 'Yeni Məhsul Əlavə Et'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Area (Upload or Camera) */}
                <div className="w-full group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Məhsul şəkli</label>
                  
                  <div className="relative w-full h-64 border-2 border-gray-300 border-dashed rounded-xl overflow-hidden bg-gray-50 transition-all hover:border-green-400">
                    
                    {/* Camera View */}
                    {isCameraOpen ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {/* Shutter Effect Overlay */}
                        <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${shutterEffect ? 'opacity-100' : 'opacity-0'}`}></div>

                        <div className="absolute bottom-4 flex gap-4 z-10">
                           <button
                             type="button"
                             onClick={capturePhoto}
                             className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 active:scale-95 transition-transform"
                             title="Şəkil çək"
                           >
                             <div className="w-6 h-6 rounded-full border-2 border-gray-800 bg-red-500"></div>
                           </button>
                           <button
                             type="button"
                             onClick={stopCamera}
                             className="p-3 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 backdrop-blur-sm"
                             title="Ləğv et"
                           >
                             <X className="w-6 h-6" />
                           </button>
                        </div>
                        {/* Hidden Canvas for Capture */}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    ) : (
                      /* Upload / Preview View */
                      <div className="w-full h-full">
                         {imageUrl ? (
                           <div className="relative w-full h-full group/image">
                              <img src={imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity gap-3">
                                 <button 
                                   type="button" 
                                   onClick={() => { setImageUrl(''); }}
                                   className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                                 >
                                   Şəkli sil
                                 </button>
                                 <button 
                                   type="button" 
                                   onClick={startCamera}
                                   className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                                 >
                                   <Camera className="w-4 h-4" />
                                   Yenidən çək
                                 </button>
                              </div>
                           </div>
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center">
                              {/* File Input Label Wrapper */}
                              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full pt-5 pb-6 hover:bg-green-50/50 transition-colors z-0">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                  <Upload className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-green-600">Fayl seçin</span></p>
                                <p className="text-xs text-gray-400 mb-4">PNG, JPG (MAX. 1MB)</p>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                              </label>

                              {/* Camera Button (Positioned absolutely or relatively within container, but clickable independently) */}
                              <div className="absolute bottom-4 z-10">
                                <span className="text-xs text-gray-400 block text-center mb-2">- VƏ YA -</span>
                                <button
                                  type="button"
                                  onClick={startCamera}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                  <Camera className="mr-2 h-4 w-4 text-gray-500" />
                                  Kamera ilə çək
                                </button>
                              </div>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ad</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
                    placeholder="Məhsulun adı"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Qiymət (₼)</label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">AZN</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Təsvir</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow resize-none"
                    placeholder="Məhsul haqqında qısa məlumat..."
                  />
                </div>

                <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={loading || isCameraOpen}
                    className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-md px-4 py-2.5 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {loading ? 'Yüklənir...' : 'Yadda saxla'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;