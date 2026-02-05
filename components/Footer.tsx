import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 mt-auto animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              EDU Aptek
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sizin sağlamlığınız, bizim prioritetimizdir. <br/>
              Keyfiyyətli dərmanlar və peşəkar xidmət.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Əlaqə</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:0705802426" className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  070 580 24 26
                </a>
              </li>
              <li className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Hər gün: 09:00 - 22:00
              </li>
              <li>
                <a href="mailto:eduaptek33@gmail.com" className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  eduaptek33@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Ünvan</h4>
            <p className="text-gray-600 mb-3 text-sm">Kürdəmir Rayonu Sığırlı kəndi Edu Ticarət Mərkəzinin yanında  y</p>
            <a 
              href="https://maps.google.com/?q=Edu+Aptek" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium border border-green-100"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Xəritədə Bax
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} EDU Aptek. Bütün hüquqlar qorunur.
        </div>
      </div>
    </footer>
  );
};

export default Footer;