import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { tripService } from '../services/tripService';
import { FaCalendarAlt, FaPlaneDeparture, FaPlaneArrival, FaUsers, FaArrowLeft, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const TRANSLATIONS = {
  en: {
    back: 'Back to Packages',
    overview: 'Package Overview',
    itinerary: 'Description',
    price: 'MAD',
    bookNow: 'Book Now',
    departure: 'Departure',
    returnDate: 'Return',
    typeHajj: 'Hajj',
    typeUmrah: 'Umrah',
    loading: 'Loading package details...',
    error: 'Failed to load package details.',
    perPerson: 'per person',
    highlights: 'Highlights',
    comingSoon: 'Booking portal coming soon!',
    full: 'FULL',
    soldOut: 'Sold Out'
  },
  fr: {
    back: 'Retour aux Forfaits',
    overview: 'Aperçu du Forfait',
    itinerary: 'Description',
    price: 'MAD',
    bookNow: 'Réserver',
    departure: 'Départ',
    returnDate: 'Retour',
    typeHajj: 'Hajj',
    typeUmrah: 'Omra',
    loading: 'Chargement des détails...',
    error: 'Échec du chargement des détails.',
    perPerson: 'par personne',
    highlights: 'Points Forts',
    comingSoon: 'Portail de réservation bientôt disponible !',
    full: 'COMPLET',
    soldOut: 'Épuisé'
  },
  ar: {
    back: 'العودة إلى الباقات',
    overview: 'نظرة عامة على الباقة',
    itinerary: 'الوصف',
    price: 'درهم',
    bookNow: 'احجز الآن',
    departure: 'المغادرة',
    returnDate: 'العودة',
    typeHajj: 'حج',
    typeUmrah: 'عمرة',
    loading: 'جاري تحميل التفاصيل...',
    error: 'فشل تحميل التفاصيل.',
    perPerson: 'للشخص الواحد',
    highlights: 'أبرز الملامح',
    comingSoon: 'بوابة الحجز قريباً!',
    full: 'مكتمل',
    soldOut: 'مباع'
  }
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1513072064285-240f87fa81e8?w=1200&auto=format&fit=crop&q=85';

const PackageDetails = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mainImage, setMainImage] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripService.getTripById(id);
        setTrip(data);
        if (data.imagesBase64 && data.imagesBase64.length > 0) {
          const img = data.imagesBase64[0];
          setMainImage(img.startsWith('data:image') || img.startsWith('http') ? img : `data:image/jpeg;base64,${img}`);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const navigate = useNavigate();
  const location = useLocation();

  const getTripTypeName = (type) => {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t.includes('hajj')) return texts.typeHajj;
    if (t.includes('umrah')) return texts.typeUmrah;
    return type;
  };

  const handleBookNow = () => {
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
        applicationType: trip.type || 'Omra'
      };
    }
    
    formData.tripId = id;
    formData.applicationType = trip.type || 'Omra';
    
    localStorage.setItem('appFormData', JSON.stringify(formData));
    
    // Don't skip steps if they haven't started. 
    // If they were already past step 1, keep their step, otherwise start at 1.
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

  if (error || !trip) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center px-4">
        <div className="text-center text-red-600 bg-red-50 p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg mx-auto w-full">
          <h2 className="text-xl font-bold mb-4">{texts.error}</h2>
          <Link to="/packages" className="inline-flex items-center gap-2 text-taifi-primary font-medium hover:underline">
            {isRtl ? <FaArrowRight size={18} /> : <FaArrowLeft size={18} />}
            {texts.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        
        {/* Top Navigation */}
        <button 
          onClick={() => navigate(location.state?.fromApply ? '/apply' : '/packages')}
          className="inline-flex items-center gap-2 text-taifi-primary font-medium mb-8 hover:underline transition-all"
        >
          {isRtl ? <FaArrowRight size={16} /> : <FaArrowLeft size={16} />}
          {location.state?.fromApply ? (isRtl ? 'العودة إلى التقديم' : (lang === 'fr' ? 'Retour à la candidature' : 'Back to Apply')) : texts.back}
        </button>

        {/* Top Section: Two Columns (Image on Left, Details on Right) */}
        <div className="flex flex-col lg:flex-row gap-12 items-stretch mb-16">
          
          {/* Left Column: Main Image */}
          <div className="w-full lg:w-5/12">
            <div className="rounded-[2.5rem] overflow-hidden shadow-xl bg-white aspect-[4/5] border border-gray-100 p-2">
              <img 
                src={mainImage} 
                alt={trip.title} 
                className="w-full h-full object-cover object-center rounded-[2rem]"
              />
            </div>
            
            {/* Gallery (if more than 1 image) */}
            {trip.imagesBase64 && trip.imagesBase64.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {trip.imagesBase64.map((img, index) => {
                  const src = img.startsWith('data:image') || img.startsWith('http') ? img : `data:image/jpeg;base64,${img}`;
                  return (
                    <div key={index} className="aspect-square rounded-[1.5rem] overflow-hidden cursor-pointer shadow-sm border border-gray-100 p-1 bg-white" onClick={() => setMainImage(src)}>
                      <img src={src} alt={`${trip.title} ${index + 1}`} className="w-full h-full object-cover rounded-[1.25rem] hover:scale-110 transition duration-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details & Booking */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            
            {/* Badge & Title */}
            <div className="mb-10">
              <div className="flex gap-3 mb-4">
                <span className="inline-block bg-taifi-gold text-taifi-primary px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm">
                  {getTripTypeName(trip.type || trip.tripType)}
                </span>
                {trip.isFull && (
                  <span className="inline-block bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm">
                    {texts.full}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-taifi-primary leading-tight">
                {trip.title}
              </h1>
            </div>

            {/* Departure/Return & Price */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              
              {/* Depart/Return Stack */}
              <div className="flex flex-col gap-6 w-full md:w-1/2">
                {trip.departureDate && (
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 flex-1">
                    <div className="bg-taifi-beige p-4 rounded-xl text-taifi-primary">
                      <FaPlaneDeparture size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{texts.departure}</p>
                      <p className="font-bold text-gray-900 text-lg">{formatDate(trip.departureDate)}</p>
                    </div>
                  </div>
                )}
                {trip.returnDate && (
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 flex-1">
                    <div className="bg-taifi-beige p-4 rounded-xl text-taifi-primary">
                      <FaPlaneArrival size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{texts.returnDate}</p>
                      <p className="font-bold text-gray-900 text-lg">{formatDate(trip.returnDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Box */}
              <div className="bg-white p-8 rounded-[2rem] shadow-card border border-gray-100 w-full md:w-1/2 flex flex-col justify-between">
                <div>
                  <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">{texts.price}</h3>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-bold text-taifi-primary leading-none">
                      {(trip.price || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-400 font-medium pb-1">{texts.perPerson}</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-taifi-gold mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-600 text-sm font-medium">Expert spiritual guidance</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-taifi-gold mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-600 text-sm font-medium">Premium accommodations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-taifi-gold mt-1 flex-shrink-0" size={18} />
                      <span className="text-gray-600 text-sm font-medium">Dedicated ground transport</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleBookNow}
                  disabled={trip.isFull}
                  className={`w-full text-white text-lg font-bold py-4 rounded-xl transition duration-300 shadow-md ${trip.isFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-taifi-primary hover:bg-taifi-gold hover:text-taifi-primary'}`}
                >
                  {trip.isFull ? texts.soldOut : texts.bookNow}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 max-w-4xl">
          <h2 className="text-3xl font-serif font-bold text-taifi-primary mb-8 flex items-center gap-4">
            <span className="bg-taifi-gold w-8 h-1 rounded-full"></span>
            {texts.itinerary}
          </h2>
          {trip.about ? (
            <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none whitespace-pre-wrap">
              {trip.about}
            </div>
          ) : (
            <p className="text-gray-400 italic">No description available for this package.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default PackageDetails;
