import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SERVICES_DATA = {
  en: [
    { 
      id: 'hajj', 
      title: 'Hajj Packages', 
      description: 'Exclusive VIP programs with luxury accommodations and expert scholars.', 
      image: 'https://images.unsplash.com/photo-1513072064285-240f87fa81e8?w=1200&auto=format&fit=crop&q=85', 
      link: '/packages' 
    },
    { 
      id: 'umrah', 
      title: 'Omra Retreats', 
      description: 'Bespoke 5-star spiritual getaways steps away from the Holy Harams.', 
      image: 'https://images.unsplash.com/photo-1604655983671-9d03650f604c?w=1200&auto=format&fit=crop&q=85', 
      link: '/packages' 
    },
    { 
      id: 'hotels', 
      title: 'Luxury Hotels', 
      description: 'Handpicked five-star partner hotels offering direct views of the sanctuary.', 
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85', 
      link: '/hotels' 
    },
    { 
      id: 'apply', 
      title: 'Apply Now', 
      description: 'Submit your application easily and start your spiritual journey with us.', 
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=85', 
      link: '/apply' 
    }
  ],
  fr: [
    { 
      id: 'hajj', 
      title: 'Forfaits Hajj', 
      description: 'Programmes VIP exclusifs avec hébergements de luxe et oulémas experts.', 
      image: 'https://images.unsplash.com/photo-1513072064285-240f87fa81e8?w=1200&auto=format&fit=crop&q=85', 
      link: '/packages' 
    },
    { 
      id: 'umrah', 
      title: 'Retraites Omra', 
      description: 'Séjours spirituels 5 étoiles sur mesure à quelques pas des Saintes Mosquées.', 
      image: 'https://images.unsplash.com/photo-1604655983671-9d03650f604c?w=1200&auto=format&fit=crop&q=85', 
      link: '/packages' 
    },
    { 
      id: 'hotels', 
      title: 'Hôtels de Luxe', 
      description: 'Hôtels partenaires cinq étoiles sélectionnés avec vue directe sur le sanctuaire.', 
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85', 
      link: '/hotels' 
    },
    { 
      id: 'apply', 
      title: 'Postuler', 
      description: 'Soumettez votre candidature facilement et commencez votre voyage spirituel avec nous.', 
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=85', 
      link: '/apply' 
    }
  ],
  ar: [
    { 
      id: 'hajj', 
      title: 'برامج الحج', 
      description: 'برامج كبار الشخصيات الحصرية مع الإقامة الفاخرة والعلماء المتخصصين.', 
      image: 'https://images.unsplash.com/photo-1513072064285-240f87fa81e8?w=1200&auto=format&fit=crop&q=85', 
      link: '/packages' 
    },
    { 
      id: 'umrah', 
      title: 'رحلات العمرة', 
      description: 'رحلات روحية فاخرة من فئة 5 نجوم على خطى الحرمين الشريفين.', 
      image: 'https://images.unsplash.com/photo-1604655983671-9d03650f604c?w=1200&auto=format&fit=crop&q=85', 
      link: '/packages' 
    },
    { 
      id: 'hotels', 
      title: 'فنادق فاخرة', 
      description: 'فنادق شريكة مختارة من فئة خمس نجوم توفر إطلالات مباشرة على الحرم.', 
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85', 
      link: '/hotels' 
    },
    { 
      id: 'apply', 
      title: 'تقديم طلب', 
      description: 'قدم طلبك بسهولة وابدأ رحلتك الروحية معنا.', 
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=85', 
      link: '/apply' 
    }
  ]
};

const PAGE_TEXTS = {
  en: {
    heroTitle: 'Transcendent Spiritual Journeys',
    heroDesc: 'Welcome to Taifi Travel. Explore our specialized services below and click any category to view full itineraries, partner hotels, and exclusive booking options.',
    exploreButton: 'Explore Packages'
  },
  fr: {
    heroTitle: 'Voyages Spirituels Transcendants',
    heroDesc: 'Bienvenue chez Taifi Travel. Découvrez nos services spécialisés ci-dessous et cliquez sur une catégorie pour afficher les itinéraires complets et options de réservation.',
    exploreButton: 'Explorer Les Forfaits'
  },
  ar: {
    heroTitle: 'رحلات روحية استثنائية',
    heroDesc: 'مرحباً بكم في طايفي ترافل. استكشف خدماتنا المتخصصة أدناه وانقر على أي فئة لعرض برامج الرحلات الكاملة والفنادق الشريكة وخيارات الحجز الحصرية.',
    exploreButton: 'استكشف الباقات'
  }
};

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop';

export default function Home() {
  const { lang, setLang } = useLanguage();

  const services = SERVICES_DATA[lang] || SERVICES_DATA.en;
  const t = PAGE_TEXTS[lang] || PAGE_TEXTS.en;

  return (
    <div className="relative flex flex-col min-h-full">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={DEFAULT_BACKGROUND}
          alt="Home background"
          className="w-full h-full object-cover object-center filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-taifi-primary/70 via-black/40 to-taifi-primary/80"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-12 max-w-7xl mx-auto w-full flex-grow">
        
        {/* Hero Section */}
        <div className="text-center mb-16 opacity-0 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg">
            {t.heroTitle}
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-base md:text-xl leading-relaxed drop-shadow-md font-medium">
            {t.heroDesc}
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto opacity-0 animate-fade-in-up-delay">
          {services.map(({ id, title, description, image, link }) => (
            <Link 
              to={link} 
              key={id}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/40 group transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl flex flex-col justify-between"
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <h3 className="absolute bottom-6 left-6 text-2xl font-serif font-bold text-white text-left drop-shadow-lg">{title}</h3>
              </div>
              <div className="p-8 flex flex-col justify-between flex-grow text-left">
                <p className="text-base text-gray-700 mb-6 leading-relaxed font-medium">{description}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-taifi-primary uppercase tracking-widest group-hover:text-taifi-gold transition-colors">
                  {t.exploreButton} 
                  <span className="transform transition-transform duration-300 group-hover:translate-x-2">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}