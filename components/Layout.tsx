
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AIAssistant from './AIAssistant';

interface MobileLinkProps {
  to: string;
  children: React.ReactNode;
  special?: boolean;
  onClose: () => void;
  currentPath: string;
}

const MobileLink: React.FC<MobileLinkProps> = ({ to, children, special = false, onClose, currentPath }) => (
  <Link 
    to={to} 
    onClick={onClose}
    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
      special 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 text-center mt-4' 
        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
    } ${currentPath === to && !special ? 'bg-primary-50 text-primary-700 font-bold border-l-4 border-primary-600' : ''}`}
  >
    {children}
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Sayfa değiştiğinde menüyü kapat
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path ? 'text-primary-600 font-bold' : 'text-gray-600 hover:text-primary-600 transition';

  const handleLogout = () => {
    localStorage.removeItem('dentaai_admin');
    navigate('/');
  };

  const isAdmin = localStorage.getItem('dentaai_admin') === 'true';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary-600 text-white p-2 rounded-lg transition-transform group-hover:scale-110 duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                  DentaAI
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className={isActive('/')}>Ana Sayfa</Link>
              <Link to="/ai-checkup" className={isActive('/ai-checkup')}>AI Ön Muayene</Link>
              <Link to="/pricing" className={isActive('/pricing')}>Fiyatlar</Link>
              <Link to="/blog" className={isActive('/blog')}>Blog</Link>
              
              {isAdmin ? (
                 <div className="flex items-center gap-4 border-l pl-4 ml-2">
                   <Link to="/admin" className="text-red-600 font-semibold hover:text-red-700 border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition">Yönetim Paneli</Link>
                   <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 transition">Çıkış</button>
                 </div>
              ) : (
                 <div className="flex items-center gap-4 ml-2 pl-2">
                    <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-primary-600 transition px-2">
                      Personel Girişi
                    </Link>
                    <Link to="/appointment" className="bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 transform hover:-translate-y-0.5 font-medium">
                      Randevu Al
                    </Link>
                 </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-500 hover:text-primary-600 transition p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-40">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            
            {/* Menu Content */}
            <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-xl rounded-b-2xl p-4 animate-slide-down">
              <div className="space-y-1">
                <MobileLink to="/" onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>Ana Sayfa</MobileLink>
                <MobileLink to="/ai-checkup" onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>AI Ön Muayene</MobileLink>
                <MobileLink to="/pricing" onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>Fiyatlar</MobileLink>
                <MobileLink to="/blog" onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>Blog</MobileLink>
                
                {isAdmin ? (
                  <>
                    <MobileLink to="/admin" onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>Yönetim Paneli</MobileLink>
                    <button 
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                     <MobileLink to="/login" onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>Personel Girişi</MobileLink>
                     <MobileLink to="/appointment" special onClose={() => setIsMenuOpen(false)} currentPath={location.pathname}>📅 Randevu Al</MobileLink>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow relative z-0">
        {children}
      </main>

      {/* Global AI Assistant */}
      <AIAssistant />

      <footer className="bg-slate-900 text-slate-300 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">DentaAI Klinik</h3>
            <p className="mb-4 text-sm leading-relaxed">Yapay zeka teknolojisi ile modern diş hekimliğini birleştiriyoruz. Gülüşünüz bizim için değerli.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/ai-checkup" className="hover:text-primary-400 transition">Ücretsiz AI Analizi</Link></li>
              <li><Link to="/appointment" className="hover:text-primary-400 transition">Randevu Al</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition">Tedavi Ücretleri</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition">Personel Girişi</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center"><span className="mr-3 text-lg">📍</span> İstanbul, Şişli Merkez Mah.</li>
              <li className="flex items-center"><span className="mr-3 text-lg">📞</span> +90 (212) 555 00 00</li>
              <li className="flex items-center"><span className="mr-3 text-lg">📧</span> info@dentaai.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} DentaAI Diş Polikliniği. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
