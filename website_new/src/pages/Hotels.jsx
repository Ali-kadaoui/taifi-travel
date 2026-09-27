import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { hotelService } from '../services/hotelService';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

const TRANSLATIONS = {
  en: {
    title: 'Premium Accommodations',
    desc: 'Experience comfort and peace in our carefully selected partner hotels in Mecca and Medina.',
    loading: 'Loading hotels...',
    error: 'Failed to load hotels. Please try again later.',
    noHotels: 'No active hotels found at this moment.',
    price: 'MAD',
    startingFrom: 'Starting from',
    viewDetails: 'View Details',
  },
  fr: {
    title: 'Hébergements Premium',
    desc: 'Découvrez le confort et la tranquillité dans nos hôtels partenaires soigneusement sélectionnés à La Mecque et Médine.',
    loading: 'Chargement des hôtels...',
    error: 'Échec du chargement des hôtels. Veuillez réessayer plus tard.',
    noHotels: 'Aucun hôtel actif trouvé pour le moment.',
    price: 'MAD',
    startingFrom: 'À partir de',
    viewDetails: 'Voir les détails',
  },
  ar: {
    title: 'أماكن إقامة فاخرة',
    desc: 'استمتع بالراحة والسلام في فنادقنا الشريكة المختارة بعناية في مكة المكرمة والمدينة المنورة.',
    loading: 'جاري تحميل الفنادق...',
    error: 'فشل تحميل الفنادق. يرجى المحاولة مرة أخرى لاحقاً.',
    noHotels: 'لم يتم العثور على فنادق نشطة في هذا الوقت.',
    price: 'درهم',
    startingFrom: 'ابتداءً من',
    viewDetails: 'عرض التفاصيل',
  }
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85';

const Hotels = () => {
  const { lang } = useLanguage();
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await hotelService.getHotels();
        setHotels(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

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

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center text-gray-500 bg-white p-12 rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
            {texts.noHotels}
          </div>
        )}

        {/* Hotels Grid */}
        {!loading && !error && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {hotels.map((hotel) => {
              const mainImage = hotel.imagesBase64 && hotel.imagesBase64.length > 0 
                                  ? hotel.imagesBase64[0] 
                                  : DEFAULT_IMAGE;
              
              // Validate base64 header if it doesn't have one
              const imgSrc = mainImage.startsWith('data:image') || mainImage.startsWith('http') 
                                ? mainImage 
                                : `data:image/jpeg;base64,${mainImage}`;
                                
              const lowestPrice = hotel.offers && hotel.offers.length > 0 
                                    ? Math.min(...hotel.offers.map(o => o.price))
                                    : 0;

              return (
                <Link 
                  to={`/hotel/${hotel.id}`}
                  key={hotel.id}
                  className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100 group transform transition duration-300 hover:-translate-y-2 hover:shadow-card-hover flex flex-col cursor-pointer block"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={imgSrc} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-taifi-primary text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 uppercase tracking-wide">
                      <FaMapMarkerAlt size={12} className="text-taifi-gold" />
                      {hotel.city}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow text-left">
                    <h3 className="text-2xl font-serif font-bold text-taifi-primary mb-4 line-clamp-2">
                      {hotel.name}
                    </h3>
                    
                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{texts.startingFrom}</p>
                        <div className="text-taifi-primary font-bold text-xl flex items-baseline gap-1">
                          {lowestPrice.toLocaleString()} <span className="text-sm font-normal text-gray-400">{texts.price}</span>
                        </div>
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

export default Hotels;
