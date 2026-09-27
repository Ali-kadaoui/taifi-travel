import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { hotelService } from '../services/hotelService';
import { FaMapMarkerAlt, FaArrowLeft, FaArrowRight, FaBed, FaUsers } from 'react-icons/fa';

const TRANSLATIONS = {
  en: {
    back: 'Back to Hotels',
    price: 'MAD',
    bookNow: 'Book Now',
    loading: 'Loading hotel details...',
    error: 'Failed to load hotel details.',
    capacity: 'Room Capacity',
    perNight: 'per night',
    person: 'Person',
    persons: 'Persons',
    comingSoon: 'Booking portal coming soon!',
    offersTitle: 'Available Room Options'
  },
  fr: {
    back: 'Retour aux Hôtels',
    price: 'MAD',
    bookNow: 'Réserver',
    loading: 'Chargement des détails...',
    error: 'Échec du chargement des détails.',
    capacity: 'Capacité de la chambre',
    perNight: 'par nuit',
    person: 'Personne',
    persons: 'Personnes',
    comingSoon: 'Portail de réservation bientôt disponible !',
    offersTitle: 'Options de Chambres Disponibles'
  },
  ar: {
    back: 'العودة إلى الفنادق',
    price: 'درهم',
    bookNow: 'احجز الآن',
    loading: 'جاري تحميل التفاصيل...',
    error: 'فشل تحميل التفاصيل.',
    capacity: 'سعة الغرفة',
    perNight: 'في الليلة',
    person: 'شخص',
    persons: 'أشخاص',
    comingSoon: 'بوابة الحجز قريباً!',
    offersTitle: 'خيارات الغرف المتاحة'
  }
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85';

const HotelDetails = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mainImage, setMainImage] = useState(DEFAULT_IMAGE);
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  const [isOffersOpen, setIsOffersOpen] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await hotelService.getHotelById(id);
        setHotel(data);
        if (data.imagesBase64 && data.imagesBase64.length > 0) {
          const img = data.imagesBase64[0];
          setMainImage(img.startsWith('data:image') || img.startsWith('http') ? img : `data:image/jpeg;base64,${img}`);
        }
        if (data.offers && data.offers.length > 0) {
          setSelectedOfferId(data.offers[0].id);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleBookNow = () => {
    if (!selectedOfferId) return;
    
    const existing = localStorage.getItem('appFormData');
    let formData = null;
    if (existing) {
      try {
        formData = JSON.parse(existing);
      } catch (e) {}
    }
    
    if (!formData) {
      formData = {
        firstName: '', lastName: '', cinNumber: '', dateOfBirth: '', sex: '',
        email: '', phoneNumber: '', tripId: '', hotelOptionId: null,
        passportDeposited: false, photoDeposited: false, certificateDeposited: false,
        applicationType: 'Omra'
      };
    }
    
    formData.hotelOptionId = selectedOfferId;
    
    localStorage.setItem('appFormData', JSON.stringify(formData));
    
    const currentStep = localStorage.getItem('appFormStep');
    if (!currentStep) {
      localStorage.setItem('appFormStep', '1');
    }
    
    navigate('/apply');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taifi-gold"></div>
          <p className="text-gray-500 font-medium">{texts.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center px-4">
        <div className="text-center text-red-600 bg-red-50 p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg mx-auto w-full">
          <h2 className="text-xl font-bold mb-4">{texts.error}</h2>
          <Link to="/hotels" className="inline-flex items-center gap-2 text-taifi-primary font-medium hover:underline">
            {isRtl ? <FaArrowRight size={18} /> : <FaArrowLeft size={18} />}
            {texts.back}
          </Link>
        </div>
      </div>
    );
  }

  const selectedOffer = hotel.offers?.find(o => o.id === selectedOfferId) || (hotel.offers?.[0] || { price: 0 });

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        
        {/* Top Navigation */}
        <button 
          onClick={() => navigate(location.state?.fromApply ? '/apply' : '/hotels')}
          className="inline-flex items-center gap-2 text-taifi-primary font-medium mb-8 hover:underline transition-all"
        >
          {isRtl ? <FaArrowRight size={16} /> : <FaArrowLeft size={16} />}
          {location.state?.fromApply ? (isRtl ? 'العودة إلى التقديم' : (lang === 'fr' ? 'Retour à la candidature' : 'Back to Apply')) : texts.back}
        </button>

        {/* Top Section: Two Columns (Image on Left, Details on Right) */}
        <div className="flex flex-col lg:flex-row gap-12 items-stretch mb-16">
          
          {/* Left Column: Main Image */}
          <div className="w-full lg:w-5/12">
            <div className="rounded-[2.5rem] overflow-hidden shadow-xl bg-white aspect-[4/5] border border-gray-100 p-2 relative">
              <img 
                src={mainImage} 
                alt={hotel.name} 
                className="w-full h-full object-cover object-center rounded-[2rem]"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-taifi-primary text-sm font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 uppercase tracking-wide">
                <FaMapMarkerAlt size={16} className="text-taifi-gold" />
                {hotel.city}
              </div>
            </div>
            
            {/* Gallery (if more than 1 image) */}
            {hotel.imagesBase64 && hotel.imagesBase64.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {hotel.imagesBase64.map((img, index) => {
                  const src = img.startsWith('data:image') || img.startsWith('http') ? img : `data:image/jpeg;base64,${img}`;
                  return (
                    <div key={index} className="aspect-square rounded-[1.5rem] overflow-hidden cursor-pointer shadow-sm border border-gray-100 p-1 bg-white" onClick={() => setMainImage(src)}>
                      <img src={src} alt={`${hotel.name} ${index + 1}`} className="w-full h-full object-cover rounded-[1.25rem] hover:scale-110 transition duration-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details & Booking */}
          <div className="w-full lg:w-7/12 flex flex-col">
            
            {/* Title */}
            <div className="mb-10 mt-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-taifi-primary leading-tight mb-2">
                {hotel.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="bg-white p-8 rounded-[2rem] shadow-card border border-gray-100 mb-8">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">{texts.price}</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-taifi-primary leading-none">
                  {(selectedOffer.price || 0).toLocaleString()}
                </span>
                <span className="text-gray-400 font-medium pb-1">{texts.perNight}</span>
              </div>
              
              <button 
                onClick={handleBookNow}
                className="w-full bg-taifi-gold text-taifi-primary text-lg font-bold py-4 rounded-xl hover:bg-taifi-primary hover:text-white transition duration-300 shadow-md"
              >
                {texts.bookNow}
              </button>
            </div>

            {/* Room Offers */}
            <div className="flex-1">
              <h3 className="text-xl font-serif font-bold text-taifi-primary mb-6 flex items-center gap-3">
                <FaBed className="text-taifi-gold" />
                {texts.offersTitle}
              </h3>
              
              <div className="relative">
                {/* Selected Item (Dropdown Header) */}
                <div 
                  onClick={() => setIsOffersOpen(!isOffersOpen)}
                  className="p-4 rounded-[1.5rem] border-2 border-taifi-gold bg-amber-50/50 shadow-sm cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-taifi-gold text-white">
                      <FaUsers size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {selectedOffer.capacity} {Number(selectedOffer.capacity) === 1 ? texts.person : texts.persons}
                      </p>
                      <p className="text-sm text-gray-500">Premium Room</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-taifi-primary">
                        {selectedOffer.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">{texts.price}</span>
                      </p>
                    </div>
                    <div className={`transform transition-transform duration-200 text-gray-400 ${isOffersOpen ? 'rotate-90' : 'rotate-0'}`}>
                      <FaArrowRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Dropdown Options */}
                {isOffersOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[1.5rem] shadow-xl border border-gray-100 overflow-hidden z-10 flex flex-col">
                    {hotel.offers && hotel.offers.length > 0 ? (
                      hotel.offers.map(offer => (
                        <div 
                          key={offer.id} 
                          onClick={() => {
                            setSelectedOfferId(offer.id);
                            setIsOffersOpen(false);
                          }}
                          className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gray-100 text-gray-400">
                              <FaUsers size={16} />
                            </div>
                            <p className="font-bold text-gray-700">
                              {offer.capacity} {Number(offer.capacity) === 1 ? texts.person : texts.persons}
                            </p>
                          </div>
                          <p className="font-bold text-taifi-primary">
                            {offer.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">{texts.price}</span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 text-gray-500">
                        No active room offers for this hotel.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default HotelDetails;
