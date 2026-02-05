import React from 'react';
import { MessageCircle, MapPin } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "994705802426";
  const message = "Salam, dəstək lazımdır.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const mapUrl = "https://maps.google.com/?q=Edu+Aptek";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {/* Map Button */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 hover:scale-110 transition-all duration-300 flex items-center justify-center group border border-gray-100 relative"
        aria-label="View on Map"
      >
        <MapPin className="w-6 h-6 text-red-500" />
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-sm border border-gray-100 hidden sm:block pointer-events-none">
          Bizim Ünvan
        </span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center group relative"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-sm border border-gray-100 hidden sm:block pointer-events-none">
          Bizə yazın
        </span>
        {/* Pulse effect */}
        <span className="absolute -inset-1 rounded-full bg-green-500 opacity-30 animate-ping"></span>
      </a>
    </div>
  );
};

export default WhatsAppButton;