import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth } from './firebase';
import AuthPage from './pages/AuthPage';
import UserHome from './pages/UserHome';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import { CartProvider } from './context/CartContext';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        if (currentUser && currentUser.email === 'eduaptek33@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth Error:", error);
        setGlobalError("Authentication service failed. Please refresh.");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error("Global App Error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }, []);

  if (globalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-700 mb-2">Xəta Baş Verdi</h1>
          <p className="text-red-600">{globalError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Səhifəni Yenilə
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-lg animate-fade-in">
          <div className="relative">
             <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin"></div>
          </div>
          <p className="text-green-800 font-medium animate-pulse">EDU Aptek yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-sans">
          {user && <Navbar user={user} isAdmin={isAdmin} />}
          <CartDrawer />
          <main className="flex-grow">
            <Routes>
              {/* Route logic: If not logged in -> AuthPage. If logged in -> Redirect based on role */}
              <Route path="/" element={
                !user ? <AuthPage /> : <Navigate to={isAdmin ? "/admin" : "/products"} replace />
              } />
              
              {/* Products Page: Protected. Admin shouldn't see it (redirect to admin), Users see it. */}
              <Route path="/products" element={
                user ? (isAdmin ? <Navigate to="/admin" replace /> : <UserHome />) : <Navigate to="/" replace />
              } />
              
              {/* Admin Page: Protected. Only Admin sees it. Users redirect to home/products. */}
              <Route path="/admin" element={
                user && isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />
              } />
              
              {/* Catch all -> Redirect home */}
              <Route path="*" element={
                <Navigate to="/" replace />
              } />
            </Routes>
          </main>
          
          {/* Footer and Floating Buttons for logged-in users */}
          {user && <Footer />}
          {user && <WhatsAppButton />}
        </div>
      </HashRouter>
    </CartProvider>
  );
};

export default App;