import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import logoImage from '../assets/logo.png';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';

const NAV_LINKS = {
  en: [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Hajj & Omra', path: '/packages' },
    { name: 'Hotels', path: '/hotels' },

    { name: 'Apply', path: '/apply' },
    { name: 'Contact', path: '/contact' },
  ],
  fr: [
    { name: 'Accueil', path: '/' },
    { name: 'À Propos', path: '/about' },
    { name: 'Hajj & Omra', path: '/packages' },
    { name: 'Hôtels', path: '/hotels' },

    { name: 'Postuler', path: '/apply' },
    { name: 'Contact', path: '/contact' },
  ],
  ar: [
    { name: 'الرئيسية', path: '/' },
    { name: 'من نحن', path: '/about' },
    { name: 'الحج والعمرة', path: '/packages' },
    { name: 'الفنادق', path: '/hotels' },

    { name: 'تقديم طلب', path: '/apply' },
    { name: 'اتصل بنا', path: '/contact' },
  ]
};

const AUTH_TEXTS = {
  en: { loggedOut: 'Login', profile: 'My Account' },
  fr: { loggedOut: 'Connexion', profile: 'Mon Compte' },
  ar: { loggedOut: 'تسجيل الدخول', profile: 'حسابي' }
};

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const links = NAV_LINKS[lang] || NAV_LINKS.en;
  const t = AUTH_TEXTS[lang] || AUTH_TEXTS.en;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentUser = authService.getCurrentUser();
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-taifi-primary/95 backdrop-blur-lg shadow-xl border-b border-taifi-gold/20' : 'bg-taifi-primary/90 backdrop-blur-md border-b border-taifi-gold/10'}`}>
      <div className="w-full px-6 md:px-16 h-16 md:h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="transform group-hover:scale-105 transition">
            <img 
              src={logoImage} 
              alt="Taifi Travel Logo" 
              className="h-12 md:h-14 w-auto object-contain py-1" 
            />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-serif font-bold text-2xl md:text-3xl text-white tracking-wide leading-tight group-hover:text-taifi-gold transition-colors">Taifi Travel</span>
            <span className="text-xs md:text-sm text-taifi-gold font-bold uppercase tracking-[0.2em]">Agency</span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-2 bg-black/20 p-2.5 rounded-[1.5rem] border border-white/10 shadow-inner">
          {links.map(({ name, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`px-5 py-2 rounded-xl text-base md:text-lg font-bold transition-all duration-300 whitespace-nowrap ${
                  isActive 
                    ? 'bg-taifi-gold text-taifi-primary shadow-md scale-105' 
                    : 'text-white hover:bg-taifi-gold/20 hover:text-taifi-gold'
                }`}
              >
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Action Button & Controls */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="inline-flex rounded-xl bg-white/10 backdrop-blur-sm p-1 border border-white/20 hidden md:inline-flex">
            <button
              type="button"
              onClick={() => setLang('fr')}
              className={`px-4 py-1.5 rounded-xl text-base font-bold transition ${
                lang === 'fr' ? 'bg-taifi-gold text-taifi-primary shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-4 py-1.5 rounded-xl text-base font-bold transition ${
                lang === 'ar' ? 'bg-taifi-gold text-taifi-primary shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              AR
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-xl text-base font-bold transition ${
                lang === 'en' ? 'bg-taifi-gold text-taifi-primary shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              EN
            </button>
          </div>

          {currentUser ? (
            <Link
              to="/my-account"
              className={`px-5 py-2.5 rounded-xl text-base md:text-lg font-bold shadow-md transition bg-taifi-gold text-taifi-primary hover:bg-white`}
            >
              {t.profile}
            </Link>
          ) : (
            <Link
              to="/login"
              className={`px-5 py-2.5 rounded-xl text-base md:text-lg font-bold shadow-md transition bg-taifi-gold text-taifi-primary hover:bg-white`}
            >
              {t.loggedOut}
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="xl:hidden bg-taifi-primary border-t border-taifi-gold/20 px-4 pt-4 pb-6 space-y-2 shadow-2xl animate-fadeIn text-left">
          {links.map(({ name, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-taifi-gold text-taifi-primary shadow' 
                    : 'text-gray-200 hover:bg-white/10 hover:text-taifi-gold'
                }`}
              >
                {name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
