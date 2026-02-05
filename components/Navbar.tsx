import React from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase';
import { LogOut, Pill, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  user: firebase.User;
  isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isAdmin }) => {
  const { toggleCart, cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 text-green-600 group cursor-default">
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                <Pill className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-gray-800">EDU Aptek</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <span className="inline-flex items-center px-1 pt-1 border-b-2 border-green-500 text-sm font-medium text-gray-900 h-full">
                {isAdmin ? 'Admin Paneli' : 'Məhsullar'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Cart Button (Visible for non-admins usually, but enabling for all for now) */}
            {!isAdmin && (
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group mr-2"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            <span className="text-sm text-gray-500 hidden sm:block font-medium border-r border-gray-200 pr-4 mr-2">{user.email}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Çıxış</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;