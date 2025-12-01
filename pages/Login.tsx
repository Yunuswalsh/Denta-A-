
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Boşlukları temizle (Trim) - Kullanıcı yanlışlıkla boşluk bırakırsa hata vermesin
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
        setError('Lütfen kullanıcı adı ve şifre giriniz.');
        return;
    }

    setLoading(true);

    try {
      // Veritabanından kontrol et
      const isValid = await db.authenticateAdmin(cleanUser, cleanPass);
      
      if (isValid) {
        localStorage.setItem('dentaai_admin', 'true');
        navigate('/admin');
      } else {
        setError('Kullanıcı adı veya şifre hatalı.');
      }
    } catch (err) {
      console.error(err);
      setError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
             🔐
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Personel Girişi</h1>
           <p className="text-gray-500 text-sm mt-2">Yönetim paneline erişmek için giriş yapın.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
