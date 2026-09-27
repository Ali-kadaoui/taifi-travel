import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const FOOTER_TEXTS = {
  en: {
    desc: 'Crafting transcendent spiritual journeys and high-end luxury travel experiences with unmatched Moroccan hospitality and devotion.',
    quickLinks: 'Quick Links',
    customerCare: 'Customer Care',
    headquarters: 'Headquarters',
    phone: 'Phone',
    email: 'Email',
    rights: 'Taifi Travel. All rights reserved.',
    packages: 'Hajj & Umrah',
    flights: 'Flights',
    hotels: 'Hotels',
    contact: 'Contact Support',
    destinations: 'Destinations',
    custom: 'Custom Trip',
    about: 'About Us'
  },
  fr: {
    desc: 'Créer des voyages spirituels transcendants et des expériences de voyage de luxe haut de gamme avec une hospitalité et un dévouement marocains inégalés.',
    quickLinks: 'Liens Rapides',
    customerCare: 'Service Client',
    headquarters: 'Siège Social',
    phone: 'Téléphone',
    email: 'E-mail',
    rights: 'Taifi Travel. Tous droits réservés.',
    packages: 'Hajj & Omra',
    flights: 'Vols',
    hotels: 'Hôtels',
    contact: 'Contacter le Support',
    destinations: 'Destinations',
    custom: 'Sur Mesure',
    about: 'À Propos'
  },
  ar: {
    desc: 'صياغة رحلات روحانية متسامية وتجارب سفر فاخرة راقية مع ضيافة وتفاني مغربي لا مثيل له.',
    quickLinks: 'روابط سريعة',
    customerCare: 'خدمة العملاء',
    headquarters: 'المقر الرئيسي',
    phone: 'هاتف',
    email: 'بريد إلكتروني',
    rights: 'طايفي ترافل. جميع الحقوق محفوظة.',
    packages: 'الحج والعمرة',
    flights: 'الطيران',
    hotels: 'الفنادق',
    contact: 'اتصل بالدعم',
    destinations: 'الوجهات',
    custom: 'طلب خاص',
    about: 'من نحن'
  }
};

const Footer = () => {
  const { lang } = useLanguage();
  const t = FOOTER_TEXTS[lang] || FOOTER_TEXTS.en;

  return (
    <footer className="bg-taifi-primary text-white pt-8 pb-4 px-4 md:px-12 border-t border-taifi-gold/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:pr-8 flex flex-col h-full">
          <div>
            <h3 className="text-xl font-serif font-bold text-taifi-gold tracking-wider mb-3">TAIFI TRAVEL</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {t.desc}
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          <div>
            <h4 className="text-base font-semibold text-taifi-gold uppercase tracking-wider mb-3">{t.quickLinks}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/packages" className="hover:text-taifi-gold transition">{t.packages}</Link></li>
              <li><Link to="/hotels" className="hover:text-taifi-gold transition">{t.hotels}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold text-taifi-gold uppercase tracking-wider mb-3">{t.customerCare}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-taifi-gold transition">{t.contact}</Link></li>
              <li><Link to="/destinations" className="hover:text-taifi-gold transition">{t.destinations}</Link></li>
              <li><Link to="/about" className="hover:text-taifi-gold transition">{t.about}</Link></li>
            </ul>
          </div>
        </div>

        {/* Headquarters */}
        <div className="flex flex-col h-full">
          <div>
            <h4 className="text-base font-semibold text-taifi-gold uppercase tracking-wider mb-3">{t.headquarters}</h4>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            Rue El Nassim, Marrakech 40140, Morocco
          </p>
          <p className="text-sm text-gray-300 mb-2">
            <strong className="text-white">{t.phone}:</strong>{' '}
            <a 
              href="tel:+212662160658" 
              className="hover:text-taifi-gold transition underline underline-offset-2"
            >
              +212 662-160658
            </a>
          </p>
          <p className="text-sm text-gray-300">
            <strong className="text-white">{t.email}:</strong>{' '}
            <a 
              href="mailto:Samlaksohaib@gmail.com" 
              className="hover:text-taifi-gold transition underline underline-offset-2"
            >
              Samlaksohaib@gmail.com
            </a>
          </p>
          
          </div>
        </div>
      </div>
      
      {/* Footer Bottom Line, Social Icons & Copyright */}
      <div className="max-w-7xl mx-auto mt-0 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="col-span-1 md:col-span-2">
          <div className="border-t border-taifi-gold/20 mr-12"></div>
          <div className="mt-2 text-center mr-12">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Taifi Travel. All rights reserved.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <a 
            href="https://www.instagram.com/taifiitravel/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-taifi-gold hover:text-taifi-primary flex items-center justify-center transition duration-300 text-white" 
            aria-label="Instagram"
          >
            <FaInstagram className="text-base" />
          </a>
          <a 
            href="https://www.facebook.com/taifitravel/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-taifi-gold hover:text-taifi-primary flex items-center justify-center transition duration-300 text-white" 
            aria-label="Facebook"
          >
            <FaFacebookF className="text-base" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
