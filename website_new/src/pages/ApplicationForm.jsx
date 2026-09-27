import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosClient';
import { useLanguage } from '../context/LanguageContext';
import { FaCheckCircle, FaChevronRight, FaChevronLeft, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const TRANSLATIONS = {
  en: {
    title: 'Start Your Spiritual Journey',
    desc: 'Fill out this application form to reserve your spot. Our agents will review your request and contact you.',
    step1: 'Personal Details',
    step2: 'Contact Info',
    step3: 'Travel Campaign',
    step4: 'Hotel Options',
    step5: 'Required Documents',
    firstName: 'First Name',
    lastName: 'Last Name',
    cin: 'CIN Number',
    dob: 'Date of Birth',
    sex: 'Gender',
    male: 'Male',
    female: 'Female',
    email: 'Email Address',
    phone: 'Phone Number',
    campaign: 'Select Campaign (Optional)',
    noCampaign: 'No Campaign (Skip)',
    notes: 'Additional Notes / Medical Info',
    docInfo: 'Document Submission Information',
    docDesc: 'Please acknowledge that you will need to physically submit the following documents to our agency to finalize your registration:',
    ackPassport: 'I will provide my physical Passport (Valid for at least 6 months)',
    ackPhoto: 'I will provide Visa Photos (4x6 white background)',
    ackCert: 'I will provide a Certificate of Good Conduct (if required)',
    submit: 'Submit Application',
    success: 'Application Submitted Successfully!',
    successEdit: 'Application Updated Successfully!',
    successDesc: 'Thank you. Your application has been sent to our dashboard. We will contact you shortly.',
    error: 'Failed to submit application. Please check the fields and try again.',
    loading: 'Loading...',
    loginRequired: 'Authentication Required',
    loginDesc: 'You must be logged in to submit an application.',
    loginBtn: 'Go to Login',
    existingAppTitle: 'Existing Application Found',
    existingAppDesc: 'You already have an active application. You can review and update your details below.'
  },
  fr: {
    title: 'Commencez Votre Voyage Spirituel',
    desc: 'Remplissez ce formulaire pour réserver votre place. Nos agents examineront votre demande et vous contacteront.',
    step1: 'Détails Personnels',
    step2: 'Coordonnées',
    step3: 'Campagne de Voyage',
    step4: 'Options d\'Hôtel',
    step5: 'Documents Requis',
    firstName: 'Prénom',
    lastName: 'Nom de Famille',
    cin: 'Numéro de CIN',
    dob: 'Date de Naissance',
    sex: 'Sexe',
    male: 'Homme',
    female: 'Femme',
    email: 'Adresse E-mail',
    phone: 'Numéro de Téléphone',
    campaign: 'Sélectionner une Campagne (Optionnel)',
    noCampaign: 'Aucune Campagne (Ignorer)',
    notes: 'Notes Supplémentaires / Info Médicale',
    docInfo: 'Informations sur la Soumission des Documents',
    docDesc: 'Veuillez confirmer que vous devrez soumettre physiquement les documents suivants à notre agence pour finaliser votre inscription :',
    ackPassport: 'Je fournirai mon passeport physique (Valide au moins 6 mois)',
    ackPhoto: 'Je fournirai des photos de visa (4x6 fond blanc)',
    ackCert: 'Je fournirai un Certificat de Bonne Conduite (si requis)',
    submit: 'Soumettre la Demande',
    success: 'Demande Soumise avec Succès !',
    successEdit: 'Demande mise à jour avec succès !',
    successDesc: 'Merci. Votre demande a été envoyée à notre tableau de bord. Nous vous contacterons sous peu.',
    error: 'Échec de la soumission de la candidature. Veuillez vérifier les champs et réessayer.',
    loading: 'Chargement...',
    loginRequired: 'Authentification requise',
    loginDesc: 'Vous devez être connecté pour soumettre une candidature.',
    loginBtn: 'Aller à la connexion',
    existingAppTitle: 'Candidature existante trouvée',
    existingAppDesc: 'Vous avez déjà une candidature active. Vous pouvez revoir et mettre à jour vos informations ci-dessous.'
  },
  ar: {
    title: 'ابدأ رحلتك الروحانية',
    desc: 'املأ هذا النموذج لحجز مقعدك. سيقوم وكلاؤنا بمراجعة طلبك والاتصال بك.',
    step1: 'البيانات الشخصية',
    step2: 'معلومات الاتصال',
    step3: 'حملات السفر',
    step4: 'خيارات الفنادق',
    step5: 'المستندات المطلوبة',
    firstName: 'الاسم الأول',
    lastName: 'الاسم العائلي',
    cin: 'رقم البطاقة الوطنية',
    dob: 'تاريخ الميلاد',
    sex: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    campaign: 'اختر حملة (اختياري)',
    noCampaign: 'بدون حملة (تخطي)',
    notes: 'ملاحظات إضافية / معلومات طبية',
    docInfo: 'معلومات تقديم المستندات',
    docDesc: 'يرجى الإقرار بأنه سيتعين عليك تقديم المستندات التالية فعلياً إلى وكالتنا لإتمام تسجيلك:',
    ackPassport: 'سأقدم جواز سفري الأصلي (صالح لمدة 6 أشهر على الأقل)',
    ackPhoto: 'سأقدم صور شمسية للتأشيرة (خلفية بيضاء 4x6)',
    ackCert: 'سأقدم شهادة حسن السيرة (إذا لزم الأمر)',
    submit: 'تقديم الطلب',
    success: 'تم تقديم الطلب بنجاح!',
    successEdit: 'تم تحديث الطلب بنجاح!',
    successDesc: 'شكراً لك. تم إرسال طلبك إلى لوحة التحكم الخاصة بنا. سنتصل بك قريباً.',
    error: 'فشل في تقديم الطلب. يرجى التحقق من الحقول والمحاولة مرة أخرى.',
    loading: 'جاري التحميل...',
    loginRequired: 'مطلوب تسجيل الدخول',
    loginDesc: 'يجب تسجيل الدخول لتقديم طلب.',
    loginBtn: 'الذهاب لتسجيل الدخول',
    existingAppTitle: 'تم العثور على طلب سابق',
    existingAppDesc: 'لديك طلب نشط بالفعل. يمكنك مراجعة وتحديث بياناتك أدناه.'
  }
};

export default function ApplicationForm() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem('appFormStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [hotels, setHotels] = useState([]);
  
  const [formData, setFormData] = useState(() => {
    const user = authService.getCurrentUser();
    
    const savedData = localStorage.getItem('appFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Pre-fill with user info if it's missing in savedData
        if (user) {
           parsed.firstName = parsed.firstName || user.firstName || '';
           parsed.lastName = parsed.lastName || user.lastName || '';
           parsed.cinNumber = parsed.cinNumber || user.cinNumber || '';
           parsed.dateOfBirth = parsed.dateOfBirth || (user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
           parsed.sex = parsed.sex || user.sex || '';
           parsed.email = parsed.email || user.email || '';
           parsed.phoneNumber = parsed.phoneNumber || user.phoneNumber || '';
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    // Default structure prefilled with user data if available
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      cinNumber: user?.cinNumber || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      sex: user?.sex || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      tripId: '',
      hotelOptionId: null,
      passportDeposited: false,
      photoDeposited: false,
      certificateDeposited: false,
      applicationType: 'Omra' // Default
    };
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [existingAppId, setExistingAppId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const tripScrollRef = useRef(null);
  const hotelScrollRef = useRef(null);
  const [expandedHotel, setExpandedHotel] = useState(null);

  useEffect(() => {
    if (user) {
      authService.getMyTracking().then(data => {
        if (data && (data.pendingApplication || (data.approvedApplications && data.approvedApplications.length > 0))) {
          setTrackingData(data);
          setShowDashboard(true);
          
          if (data.pendingApplication) {
            setExistingAppId(data.pendingApplication.id);
            setIsEditMode(true);
            if (data.pendingApplication.payloadJson) {
              try {
                const payload = JSON.parse(data.pendingApplication.payloadJson);
                setFormData(prev => ({
                  ...prev,
                  ...payload
                }));
              } catch (e) {
                console.error('Failed to parse existing application payload', e);
              }
            }
          }
        }
      }).catch(console.error);
    }
  }, []); // Run once on mount

  useEffect(() => {
    localStorage.setItem('appFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('appFormStep', step.toString());
  }, [step]);

  useEffect(() => {
    // Fetch active trips
    api.get('/trips?activeOnly=true')
      .then(res => {
        let trips = res.data.filter(c => !c.isExpired);
        // Sort by departure day most close one first
        trips.sort((a, b) => {
          if (!a.departureDate) return 1;
          if (!b.departureDate) return -1;
          return new Date(a.departureDate) - new Date(b.departureDate);
        });
        setActiveCampaigns(trips);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.tripId) {
      api.get(`/trips/${formData.tripId}`)
        .then(res => {
          const offers = res.data.hotelOffers || [];
          const hotelMap = {};
          offers.forEach(offer => {
            if (!hotelMap[offer.hotelId]) {
              hotelMap[offer.hotelId] = {
                id: offer.hotelId,
                name: offer.hotelName,
                city: offer.hotelCity,
                imagesBase64: offer.imagesBase64,
                offers: []
              };
            }
            hotelMap[offer.hotelId].offers.push({
              id: offer.id,
              capacity: offer.capacity,
              price: offer.price
            });
          });
          setHotels(Object.values(hotelMap));
        })
        .catch(err => console.error(err));
    } else {
      setHotels([]);
    }
  }, [formData.tripId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleTripChange = (tripId) => {
    const selectedTrip = activeCampaigns.find(c => c.id.toString() === tripId?.toString());
    setFormData(prev => ({
      ...prev,
      tripId: tripId,
      applicationType: selectedTrip ? selectedTrip.type : 'Omra',
      hotelOptionId: null // Reset hotel option if trip changes
    }));
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 3 && !formData.tripId) {
      setErrorMsg(lang === 'ar' ? 'يرجى اختيار رحلة للمتابعة.' : (lang === 'fr' ? 'Veuillez sélectionner un voyage pour continuer.' : 'Please select a campaign to continue.'));
      return;
    }
    setStep(s => Math.min(s + 1, 5));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 5) {
      nextStep();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    if (formData.applicationType === 'Hajj') {
      if (formData.sex === 'Female') {
        setErrorMsg(lang === 'ar' ? 'شروط الحج: غير مسموح للإناث في الوقت الحالي.' : (lang === 'fr' ? 'Règles du Hajj: Les femmes ne sont pas autorisées pour le moment.' : 'Hajj rules: Females are not allowed currently.'));
        setLoading(false);
        return;
      }
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 25 || age > 48) {
          setErrorMsg(lang === 'ar' ? 'شروط الحج: يجب أن يكون العمر بين 25 و 48 عاماً.' : (lang === 'fr' ? 'Règles du Hajj: L\'âge doit être compris entre 25 et 48 ans.' : 'Hajj rules: Age must be between 25 and 48.'));
          setLoading(false);
          return;
        }
      }
    }

    try {
      const payload = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        sex: formData.sex || null,
        dateOfBirth: formData.dateOfBirth || null,
        cinNumber: formData.cinNumber || null,
        tripId: formData.tripId ? formData.tripId.toString() : null,
        applicationType: formData.applicationType || 'Omra',
        workerRole: null,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
        hotelOptionId: formData.hotelOptionId ? formData.hotelOptionId.toString() : null,
        notes: null,
        passportDeposited: false,
        photoDeposited: false,
        certificateDeposited: false,
        amountPaid: 0
      };

      if (existingAppId) {
        await api.put(`/pending-applications/${existingAppId}`, payload);
      } else {
        await api.post('/public/submit-application', payload);
      }
      setSubmitted(true);
      localStorage.removeItem('appFormData');
      localStorage.removeItem('appFormStep');
    } catch (err) {
      console.error(err);
      let backendError = '';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') backendError = err.response.data;
        else if (err.response.data.message) backendError = err.response.data.message;
        else if (err.response.data.title) backendError = err.response.data.title;
        else backendError = JSON.stringify(err.response.data.errors || err.response.data);
      }
      setErrorMsg(backendError ? `Error: ${backendError}` : t.error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-taifi-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-taifi-primary">
            <FaExclamationCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.loginRequired}</h2>
          <p className="text-gray-600 mb-8">{t.loginDesc}</p>
          <button 
            onClick={() => navigate('/login', { state: { from: { pathname: '/apply' } } })}
            className="w-full bg-taifi-primary text-white py-3 rounded-lg font-semibold hover:bg-taifi-primary/90 transition-colors"
          >
            {t.loginBtn}
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-taifi-beige py-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-taifi-primary mb-4">
            {isEditMode ? t.successEdit : t.success}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{t.successDesc}</p>
          <Link to="/" className="inline-block bg-taifi-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-taifi-gold hover:text-taifi-primary transition shadow-md">
            {TRANSLATIONS[lang].submit === 'إرسال الطلب' ? 'العودة للرئيسية' : (lang === 'fr' ? 'Retour à l\'accueil' : 'Return Home')}
          </Link>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <div className="hidden md:flex w-full md:w-1/3 bg-taifi-primary p-6 md:p-8 pt-6 text-white flex-col justify-center relative overflow-hidden shrink-0">
      {/* Decorative bg elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-taifi-gold rounded-full opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-taifi-gold rounded-full opacity-20 blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-taifi-gold">{t.title}</h1>
        <p className="text-white/80 text-sm mb-12 leading-relaxed">{t.desc}</p>
        
        <div className="flex flex-col gap-6">
          {[
            { num: 1, label: t.step1 },
            { num: 2, label: t.step2 },
            { num: 3, label: t.step3 },
            { num: 4, label: t.step4 },
            { num: 5, label: t.step5 }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-4 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-all duration-300 shadow-md ${
                 step === s.num ? 'bg-taifi-gold text-taifi-primary scale-110' : 
                 step > s.num ? 'bg-taifi-gold/20 text-taifi-gold border border-taifi-gold' : 
                 'bg-white/10 text-white/50 border border-white/20 group-hover:bg-white/20'
              }`}>
                {step > s.num ? <FaCheckCircle size={16} /> : s.num}
              </div>
              <div className="flex flex-col transition-all duration-300">
                <span className={`text-xs uppercase tracking-wider font-semibold ${step >= s.num ? 'text-taifi-gold' : 'text-white/50 group-hover:text-white/70'}`}>Step {s.num}</span>
                <span className={`text-sm font-medium ${step >= s.num ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const renderDashboard = () => {
    if (!trackingData) return null;
    
    const pending = trackingData.pendingApplication;
    const approved = trackingData.approvedApplications || [];
    
    return (
      <div className="min-h-screen bg-taifi-beige py-12 px-4 flex justify-center">
        <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-8 md:p-12">
           <h1 className="text-3xl font-serif font-bold text-taifi-primary mb-8 border-b pb-4">My Application Dashboard</h1>
           
           {pending && (
             <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                 <h2 className="text-xl font-bold text-orange-800 flex items-center gap-2">
                   <FaClock /> Pending Review
                 </h2>
                 <p className="text-orange-700 mt-2 font-medium">Your application is currently being reviewed by our agents.</p>
                 <p className="text-sm text-orange-600 mt-1">Submitted on: {new Date(pending.createdAt).toLocaleDateString()}</p>
               </div>
               <button 
                 onClick={() => setShowDashboard(false)}
                 className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-md whitespace-nowrap"
               >
                 Edit Application
               </button>
             </div>
           )}

           {approved.map(app => (
             <div key={app.id} className="bg-white border-2 border-gray-100 shadow-sm rounded-2xl p-6 mb-8 hover:border-taifi-gold/30 transition">
               <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4 gap-4">
                 <div>
                   <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-sm">Approved</span>
                   <h2 className="text-2xl font-bold text-taifi-primary">{app.trip ? app.trip.title : app.applicationType}</h2>
                 </div>
                 <div className="text-left md:text-right">
                   <div className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Application ID</div>
                   <div className="font-mono font-bold text-gray-800 text-xl">#{app.id.toString().padStart(5, '0')}</div>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                   <h3 className="font-bold text-taifi-primary mb-4 border-b pb-2">Financial Summary</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-600">Trip Price</span>
                       <span className="font-bold">{app.trip ? app.trip.price.toLocaleString() + ' MAD' : '-'}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-gray-600">Hotel Price</span>
                       <span className="font-bold">{app.hotelOffer ? app.hotelOffer.price.toLocaleString() + ' MAD' : '-'}</span>
                     </div>
                     <div className="flex justify-between text-sm pt-3 mt-3 border-t border-gray-200">
                       <span className="font-bold text-gray-800">Total Paid</span>
                       <span className="font-bold text-green-600 text-base">{(app.totalPaid + app.totalHotelPaid).toLocaleString()} MAD</span>
                     </div>
                   </div>
                 </div>

                 <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                   <h3 className="font-bold text-taifi-primary mb-4 border-b pb-2">Status & Documents</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-600 font-medium">Passport</span>
                       {app.passportDeposited ? <FaCheckCircle className="text-green-500 text-lg" /> : <FaClock className="text-orange-400 text-lg" />}
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-600 font-medium">Photos</span>
                       {app.photoDeposited ? <FaCheckCircle className="text-green-500 text-lg" /> : <FaClock className="text-orange-400 text-lg" />}
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-600 font-medium">Certificate</span>
                       {app.certificateDeposited ? <FaCheckCircle className="text-green-500 text-lg" /> : <FaClock className="text-orange-400 text-lg" />}
                     </div>
                     {app.hajjDetails && (
                       <div className="flex justify-between items-center text-sm pt-3 mt-3 border-t border-gray-200">
                         <span className="text-gray-800 font-bold">Medical Test</span>
                         <span className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider ${app.hajjDetails.testStatus === 'Passed' ? 'bg-green-100 text-green-700' : app.hajjDetails.testStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                           {app.hajjDetails.testStatus || 'Pending'}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
               
             </div>
           ))}
           
           {!pending && approved.length === 0 && (
             <div className="text-center py-12 text-gray-500">
               No applications found.
             </div>
           )}
        </div>
      </div>
    );
  };

  if (showDashboard) {
    return renderDashboard();
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
      
      <div className="w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[850px]">
        
        {/* Left Side: Header and Steps (Sidebar) */}
        {renderSidebar()}

        {/* Right Side: The Form */}
        <div className="w-full md:w-2/3 h-full relative flex flex-col bg-white">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden bg-taifi-primary text-white p-6 text-center relative overflow-hidden shrink-0">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-taifi-gold rounded-full opacity-20 blur-2xl pointer-events-none"></div>
             <h1 className="text-2xl font-serif font-bold text-taifi-gold mb-2 relative z-10">{t.title}</h1>
             <p className="text-white/80 text-xs relative z-10">{t.desc}</p>
             
             {/* Mobile Step Indicator */}
             <div className="flex justify-center gap-2 mt-4 relative z-10">
               {[1,2,3,4,5].map(s => (
                 <div key={s} className={`h-2 rounded-full transition-all ${step === s ? 'w-8 bg-taifi-gold' : step > s ? 'w-2 bg-taifi-gold/50' : 'w-2 bg-white/20'}`} />
               ))}
             </div>
          </div>

          <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="flex-1 flex flex-col h-full overflow-hidden">
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 relative flex flex-col">
            {isEditMode && (
              <div className="mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-4 border border-blue-200 shadow-sm animate-fadeIn">
                <FaExclamationCircle className="mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-bold">{t.existingAppTitle}</h4>
                  <p className="text-sm mt-1">{t.existingAppDesc}</p>
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
                <FaExclamationCircle size={20} />
                {errorMsg}
              </div>
            )}

            {/* Step 1: Personal Details */}
            {step === 1 && (
            <div className="flex-1 flex flex-col h-full animate-fadeIn">
              <h2 className="text-2xl font-serif font-bold text-taifi-primary mb-6 border-b pb-4 shrink-0">{t.step1}</h2>
              <div className="flex-1 flex flex-col pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto my-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.firstName} *</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.lastName} *</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.cin} *</label>
                  <input required type="text" name="cinNumber" value={formData.cinNumber} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.dob} *</label>
                  <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">{t.sex} *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sex" value="Male" required checked={formData.sex === 'Male'} onChange={handleChange} className="w-5 h-5 text-taifi-primary focus:ring-taifi-gold" />
                      <span className="font-medium text-gray-700">{t.male}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sex" value="Female" required checked={formData.sex === 'Female'} onChange={handleChange} className="w-5 h-5 text-taifi-primary focus:ring-taifi-gold" />
                      <span className="font-medium text-gray-700">{t.female}</span>
                    </label>
                  </div>
                </div>
                </div>
              </div>
            </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
            <div className="flex-1 flex flex-col h-full animate-fadeIn">
              <h2 className="text-2xl font-serif font-bold text-taifi-primary mb-6 border-b pb-4 shrink-0">{t.step2}</h2>
              <div className="flex-1 flex flex-col pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto my-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.email} *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.phone} *</label>
                  <input required type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition" />
                </div>
                </div>
              </div>
            </div>
            )}

            {/* Step 3: Travel Campaign */}
            {step === 3 && (() => {
              const selectedTripObj = activeCampaigns.find(c => c.id.toString() === formData.tripId?.toString());
              return (
              <div className="flex-1 flex flex-col h-full animate-fadeIn">
                <div className="flex justify-between items-center mb-6 border-b pb-4 shrink-0">
                  <h2 className="text-2xl font-serif font-bold text-taifi-primary">{t.step3}</h2>
                  <div className="px-4 py-2 rounded-xl text-sm font-bold bg-taifi-gold/10 text-taifi-primary border border-taifi-gold/30">
                    {selectedTripObj ? `Selected: ${selectedTripObj.title}` : 'Please select a campaign'}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col pb-8 relative group">
                  <div className="w-full my-auto">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); tripScrollRef.current.scrollLeft -= 320; }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-5 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center border border-gray-100 text-taifi-primary hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); tripScrollRef.current.scrollLeft += 320; }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-5 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center border border-gray-100 text-taifi-primary hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaChevronRight />
                  </button>

                  <div 
                    ref={tripScrollRef} 
                    className="flex flex-row gap-4 p-1 overflow-x-auto scroll-smooth" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <style>{`
                      .flex.flex-row.gap-4::-webkit-scrollbar { display: none; }
                    `}</style>
                    {activeCampaigns.map(trip => {
                      const isSelected = formData.tripId?.toString() === trip.id?.toString();
                      const mainImage = trip.imagesBase64 && trip.imagesBase64.length > 0 
                                          ? (trip.imagesBase64[0].startsWith('data') || trip.imagesBase64[0].startsWith('http') ? trip.imagesBase64[0] : `data:image/jpeg;base64,${trip.imagesBase64[0]}`) 
                                          : 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=800&q=80';
                      
                      return (
                        <div 
                          key={trip.id}
                          onClick={() => handleTripChange(trip.id)}
                          className={`min-w-[300px] sm:min-w-[350px] md:min-w-[400px] max-w-[400px] shrink-0 relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 flex flex-col ${isSelected ? 'border-taifi-gold shadow-lg transform scale-[1.02]' : 'border-gray-100 hover:border-taifi-primary/30 hover:shadow-md'}`}
                        >
                        <div className="h-48 overflow-hidden shrink-0">
                          <img src={mainImage} alt={trip.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-taifi-primary text-xs font-bold px-3 py-1.5 rounded shadow-sm uppercase tracking-wide">
                            {trip.type}
                          </div>
                        </div>
                        <div className="p-5 bg-white flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-taifi-primary line-clamp-2 mb-3">{trip.title}</h3>
                          
                          {trip.departureDate && (
                            <div className="text-sm text-gray-600 mb-5 flex items-center gap-2">
                              <span className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Departure:</span>
                              <span className="font-medium">{new Date(trip.departureDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <Link 
                              to={`/package/${trip.id}`} 
                              state={{ fromApply: true }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-xl transition"
                            >
                              View Details
                            </Link>
                            {isSelected && (
                              <div className="w-8 h-8 bg-taifi-gold text-white rounded-full flex items-center justify-center shadow-md">
                                <FaCheckCircle size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activeCampaigns.length === 0 && (
                    <div className="w-full text-center py-8 text-gray-500">No campaigns available currently.</div>
                  )}
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

            {/* Step 4: Hotel Options */}
            {step === 4 && (
            <div className="flex-1 flex flex-col h-full animate-fadeIn">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-serif font-bold text-taifi-primary">{t.step4}</h2>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({...prev, hotelOptionId: null}))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition ${!formData.hotelOptionId ? 'bg-taifi-gold text-taifi-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Skip Hotel
                </button>
              </div>

              <div className="flex-1 flex flex-col pb-8 relative group">
                <div className="w-full my-auto">
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); hotelScrollRef.current.scrollLeft -= 320; }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-5 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center border border-gray-100 text-taifi-primary hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); hotelScrollRef.current.scrollLeft += 320; }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-5 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center border border-gray-100 text-taifi-primary hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaChevronRight />
                </button>

                <div 
                  ref={hotelScrollRef}
                  className="flex flex-row gap-4 p-1 overflow-x-auto scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>{`
                    .flex.flex-row.gap-4::-webkit-scrollbar { display: none; }
                  `}</style>
                  {hotels.map(hotel => {
                    const mainImage = hotel.imagesBase64 && hotel.imagesBase64.length > 0 
                                        ? (hotel.imagesBase64[0].startsWith('data') || hotel.imagesBase64[0].startsWith('http') ? hotel.imagesBase64[0] : `data:image/jpeg;base64,${hotel.imagesBase64[0]}`) 
                                        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
                    
                    const isHotelSelected = hotel.offers && hotel.offers.some(o => o.id === formData.hotelOptionId);

                    return (
                      <div 
                        key={hotel.id} 
                        className={`min-w-[300px] sm:min-w-[350px] md:min-w-[400px] max-w-[400px] shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 flex flex-col ${isHotelSelected ? 'border-taifi-gold shadow-md' : 'border-gray-100'}`}
                      >
                        <div className="h-48 overflow-hidden shrink-0 relative">
                          <img src={mainImage} alt={hotel.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-taifi-primary text-xs font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1">
                            📍 {hotel.city}
                          </div>
                        </div>
                        <div className="p-5 bg-white flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-taifi-primary mb-3 line-clamp-1">{hotel.name}</h3>
                          
                          <div className="mt-auto flex flex-col gap-4">
                            {isHotelSelected ? (() => {
                              const selectedOffer = hotel.offers.find(o => o.id === formData.hotelOptionId);
                              return (
                                <div className="p-3 bg-taifi-gold/10 border border-taifi-gold rounded-xl flex justify-between items-center">
                                  <div>
                                    <div className="text-xs text-taifi-gold font-bold uppercase mb-1">Selected Room</div>
                                    <div className="font-bold text-sm text-taifi-primary">{selectedOffer?.capacity} Person(s)</div>
                                  </div>
                                  <div className="font-bold text-taifi-primary">{selectedOffer?.price?.toLocaleString()} MAD</div>
                                </div>
                              );
                            })() : (() => {
                              const startingPrice = hotel.offers && hotel.offers.length > 0 
                                ? Math.min(...hotel.offers.map(o => o.price)) 
                                : null;
                              return startingPrice ? (
                                <div className="flex items-center gap-2 text-taifi-gold font-bold">
                                  <span className="text-xs text-gray-400 uppercase tracking-wider">Starting from</span>
                                  <span className="text-lg">{startingPrice.toLocaleString()} MAD</span>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400">No room options available.</div>
                              );
                            })()}

                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                            <Link 
                              to={`/hotel/${hotel.id}`} 
                              state={{ fromApply: true }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-bold text-taifi-primary hover:text-taifi-gold transition"
                            >
                              View Details
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedHotel(hotel); }}
                              className="text-sm font-bold bg-taifi-primary text-white hover:bg-taifi-gold px-5 py-2.5 rounded-xl transition"
                            >
                              {isHotelSelected ? 'Change Room' : 'Select Room'}
                            </button>
                          </div>
                        </div>
                        </div>
                      </div>
                    );
                  })}
                  {hotels.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No hotels available currently.</div>
                  )}
                </div>
                </div>
              </div>

              {/* Hotel Offers Modal */}
              {expandedHotel && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setExpandedHotel(null)}>
                  <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-xl font-bold text-taifi-primary">Select Room - {expandedHotel.name}</h3>
                      <button onClick={() => setExpandedHotel(null)} className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                      <div className="flex flex-col gap-4">
                        {expandedHotel.offers && expandedHotel.offers.map(offer => {
                          const isOfferSelected = formData.hotelOptionId === offer.id;
                          return (
                            <div 
                              key={offer.id}
                              onClick={() => {
                                setFormData(prev => ({...prev, hotelOptionId: offer.id}));
                                setExpandedHotel(null);
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all duration-300 hover:shadow-md ${isOfferSelected ? 'bg-taifi-gold/10 border-taifi-gold' : 'bg-white border-gray-100 hover:border-taifi-gold/50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isOfferSelected ? 'border-taifi-gold bg-taifi-gold' : 'border-gray-300'}`}>
                                  {isOfferSelected && <FaCheckCircle className="text-white text-xs" />}
                                </div>
                                <span className="font-bold text-taifi-primary">{offer.capacity} Person(s)</span>
                              </div>
                              <div className="font-bold text-lg text-taifi-gold">{offer.price?.toLocaleString()} MAD</div>
                            </div>
                          );
                        })}
                        {(!expandedHotel.offers || expandedHotel.offers.length === 0) && (
                          <div className="text-center py-8 text-gray-500">No rooms available for this hotel.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
            )}

            {/* Step 5: Required Documents */}
            {step === 5 && (
            <div className="flex-1 flex flex-col h-full animate-fadeIn">
              <h2 className="text-2xl font-serif font-bold text-taifi-primary mb-6 border-b pb-4 shrink-0">{t.step5}</h2>
              <div className="flex-1 flex flex-col pb-8">
                <div className="w-full max-w-2xl mx-auto my-auto space-y-6">
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
                <h3 className="font-bold text-blue-900 mb-4 text-xl">{lang === 'ar' ? 'الخطوة التالية: المستندات المطلوبة' : (lang === 'fr' ? 'Prochaine étape : Documents Requis' : 'Next Step: Required Documents')}</h3>
                <div className="text-blue-900 space-y-4 leading-relaxed">
                  <p className="text-lg">{lang === 'ar' ? 'لإتمام تسجيلك بنجاح، يرجى زيارة وكالتنا لإحضار المستندات التالية:' : (lang === 'fr' ? 'Pour finaliser votre inscription, veuillez visiter notre agence pour déposer les documents suivants :' : 'To finalize your registration, please visit our agency to submit the following documents:')}</p>
                  
                  <ul className="list-none space-y-3 font-medium bg-white p-4 rounded-xl border border-blue-100">
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-taifi-gold rounded-full"></span>
                      {lang === 'ar' ? 'جواز السفر الأصلي (صالح لمدة 6 أشهر على الأقل)' : (lang === 'fr' ? 'Passeport original (Valide au moins 6 mois)' : 'Original Passport (Valid for at least 6 months)')}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-taifi-gold rounded-full"></span>
                      {lang === 'ar' ? 'صور شمسية للتأشيرة (خلفية بيضاء)' : (lang === 'fr' ? 'Photos de visa (Fond blanc)' : 'Visa Photos (White background)')}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-taifi-gold rounded-full"></span>
                      {lang === 'ar' ? 'شهادة حسن السيرة' : (lang === 'fr' ? 'Certificat de bonne conduite' : 'Certificate of Good Conduct')}
                    </li>
                  </ul>

                  <div className="mt-6 p-5 bg-white rounded-xl shadow-sm border border-blue-100">
                    <div className="font-bold mb-2 flex items-center gap-2 text-taifi-primary text-lg">
                       📍 {lang === 'ar' ? 'عنوان الوكالة' : (lang === 'fr' ? 'Adresse de l\'agence' : 'Agency Address')}
                    </div>
                    <p className="text-gray-700 font-medium">Taifi Travel Agency<br/>Boulevard Hassan II, Centre Ville<br/>Casablanca, Morocco</p>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
            )}
            
            </div>

            {/* Navigation Buttons */}
            <div className="shrink-0 px-6 py-4 md:px-12 md:py-6 border-t border-gray-100 flex items-center justify-between bg-white z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-taifi-primary hover:bg-gray-50 transition">
                  <FaChevronLeft size={20} /> {lang === 'ar' ? 'السابق' : 'Back'}
                </button>
              ) : <div></div>}
              
              {step < 5 ? (
                <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-taifi-primary text-white hover:bg-taifi-gold hover:text-taifi-primary transition shadow-md">
                  {lang === 'ar' ? 'التالي' : 'Next'} <FaChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-taifi-gold text-taifi-primary hover:bg-taifi-primary hover:text-white transition shadow-md disabled:opacity-70">
                  {loading ? t.loading : t.submit} <FaCheckCircle size={20} />
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
