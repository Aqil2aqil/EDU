import React, { useState } from 'react';
import firebase from '../firebase';
import { auth, db } from '../firebase';
import { Pill, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
        // Navigation is handled by onAuthStateChanged in App.tsx
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (user) {
          // Save user info to Realtime DB as requested
          await db.ref('users/' + user.uid).set({
            email: user.email,
            lastLogin: Date.now(),
            uid: user.uid
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('E-poçt və ya şifrə yanlışdır.');
      } else if (err.code === 'auth/email-already-in-use') {
         setError('Bu e-poçt artıq istifadə olunur.');
      } else if (err.code === 'auth/weak-password') {
         setError('Şifrə ən azı 6 simvol olmalıdır.');
      } else {
         setError('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Attempt to set persistence. Wrap in try/catch so it doesn't block the flow if it fails
      try {
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      } catch (pError) {
        console.warn("Persistence setting failed:", pError);
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      if (user) {
        // Sync user info to Realtime DB
        // Use update to merge data (e.g. keep existing fields if any, update login time)
        await db.ref('users/' + user.uid).update({
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          lastLogin: Date.now(),
          uid: user.uid
        });
      }
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      
      if (err.code === 'auth/operation-not-supported-in-this-environment') {
        setError('Bu mühitdə Google Girişi dəstəklənmir (Brauzer məhdudiyyəti). Zəhmət olmasa E-poçt/Şifrə ilə daxil olun.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up pəncərəsi bloklandı. Zəhmət olmasa icazə verin.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Giriş pəncərəsi bağlandı.');
      } else if (err.code === 'auth/cancelled-popup-request') {
         // Ignore if another popup is opened
      } else {
        setError('Google ilə giriş zamanı xəta baş verdi. (' + (err.message || 'Xəta') + ')');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 animate-scale-in">
            <Pill className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">EDU Aptek</h2>
          <p className="text-gray-500">
            {isLogin ? 'Xoş gəlmisiniz! Hesabınıza daxil olun' : 'Yeni hesab yaradaraq bizə qoşulun'}
          </p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">E-poçt ünvanı</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="nümunə@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Şifrə</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-green-200 text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading && !error && !isLogin ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : loading && !error && isLogin ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Daxil ol' : 'Qeydiyyatdan keç'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">və ya</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google ilə davam et
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setShowPassword(false);
              }}
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors hover:underline decoration-green-300 underline-offset-4"
            >
              {isLogin ? 'Hesabınız yoxdur? Qeydiyyatdan keçin' : 'Artıq hesabınız var? Daxil olun'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;