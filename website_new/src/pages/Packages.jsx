import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { tripService } from '../services/tripService';
import { Link } from 'react-router-dom';

const TRANSLATIONS = {
  en: {
    title: 'Hajj & Umrah Packages',
    desc: 'Discover our exclusive spiritual journeys meticulously crafted for your peace of mind and devotion.',
    loading: 'Loading packages...',
    error: 'Failed to load packages. Please try again later.',
    noTrips: 'No active packages found at this moment.',
    price: 'MAD',
    viewDetails: 'View Details',
    departure: 'Departure',
    return: 'Return',
    typeHajj: 'Hajj',
    typeUmrah: 'Umrah',
    full: 'FULL'
  },
  fr: {
    title: 'Forfaits Hajj & Omra',
    desc: 'Découvrez nos voyages spirituels exclusifs méticuleusement conçus pour votre tranquillité d\'esprit et votre dévotion.',
    loading: 'Chargement des forfaits...',
    error: 'Échec du chargement des forfaits. Veuillez réessayer plus tard.',
    noTrips: 'Aucun forfait actif trouvé pour le moment.',
    price: 'MAD',
    viewDetails: 'Voir les détails',
    departure: 'Départ',
    return: 'Retour',
    typeHajj: 'Hajj',
    typeUmrah: 'Omra',
    full: 'COMPLET'
  },
  ar: {
    title: 'باقات الحج والعمرة',
    desc: 'اكتشف رحلاتنا الروحية الحصرية المصممة بدقة من أجل راحة بالك وتفانيك.',
    loading: 'جاري تحميل الباقات...',
    error: 'فشل تحميل الباقات. يرجى المحاولة مرة أخرى لاحقاً.',
    noTrips: 'لم يتم العثور على باقات نشطة في هذا الوقت.',
    price: 'درهم',
    viewDetails: 'عرض التفاصيل',
    departure: 'المغادرة',
    return: 'العودة',
    typeHajj: 'حج',
    typeUmrah: 'عمرة',
    full: 'مكتمل'
  }
};

const DEFAULT_HAJJ_IMAGE = 'https://images.unsplash.com/photo-1513072064285-240f87fa81e8?w=1200&auto=format&fit=crop&q=85';
const DEFAULT_UMRAH_IMAGE = 'https://images.unsplash.com/photo-1604655983671-9d03650f604c?w=1200&auto=format&fit=crop&q=85';

const Packages = () => {
  const { lang } = useLanguage();
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getActiveTrips();
        // Filter out only Hajj and Umrah if there are other types, but based on the request, all trips are either Hajj or Umrah
        setTrips(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTripTypeName = (type) => {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t.includes('hajj')) return texts.typeHajj;
    if (t.includes('umrah')) return texts.typeUmrah;
    return type;
  };

  return (
    <div className="bg-taifi-beige min-h-screen py-16 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-taifi-primary mb-4 drop-shadow-sm">
            {texts.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {texts.desc}
          </p>
        </div>

        {/* States */}
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taifi-gold"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 max-w-lg mx-auto">
            {texts.error}
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="text-center text-gray-500 bg-white p-12 rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
            {texts.noTrips}
          </div>
        )}

        {/* Trips Grid */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {trips.map((trip) => {
              const mainImage = trip.imagesBase64 && trip.imagesBase64.length > 0 
                                  ? trip.imagesBase64[0] 
                                  : (trip.type?.toLowerCase().includes('umrah') || trip.type?.toLowerCase().includes('omra') ? DEFAULT_UMRAH_IMAGE : DEFAULT_HAJJ_IMAGE);
              
              // Validate base64 header if it doesn't have one
              const imgSrc = mainImage.startsWith('data:image') || mainImage.startsWith('http') 
                                ? mainImage 
                                : `data:image/jpeg;base64,${mainImage}`;

              return (
                <Link 
                  to={`/package/${trip.id}`}
                  key={trip.id}
                  className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100 group transform transition duration-300 hover:-translate-y-2 hover:shadow-card-hover flex flex-col cursor-pointer block"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={imgSrc} 
                      alt={trip.title} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      {trip.isFull && (
                        <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wide">
                          {texts.full}
                        </div>
                      )}
                      <div className="bg-taifi-gold text-taifi-primary text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wide">
                        {getTripTypeName(trip.type)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow text-left">
                    <h3 className="text-xl font-serif font-bold text-taifi-primary mb-2 line-clamp-2">
                      {trip.title}
                    </h3>
                    
                    <div className="space-y-2 mb-6 text-sm text-gray-600">
                      {trip.departureDate && (
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="font-semibold text-gray-400 uppercase text-xs tracking-wider">{texts.departure}</span>
                          <span className="font-medium">{formatDate(trip.departureDate)}</span>
                        </div>
                      )}
                      {trip.returnDate && (
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="font-semibold text-gray-400 uppercase text-xs tracking-wider">{texts.return}</span>
                          <span className="font-medium">{formatDate(trip.returnDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="text-taifi-primary font-bold text-lg flex items-baseline gap-1">
                        {trip.price.toLocaleString()} <span className="text-xs text-gray-400">{texts.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Packages;
