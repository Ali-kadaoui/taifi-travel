import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { lang, setLang } = useLanguage();

  const content = {
    en: {
      tagline: 'About Us',
      title: 'About Taifi Travel',
      subtitle: 'Your dedicated partner for sacred spiritual journeys, guiding you to the holy cities of Makkah and Madinah with exceptional care and devotion.',
      whoWeAre: 'Who We Are',
      whoWeAreTitle: 'Your Trusted Hajj & Omra Agency',
      whoWeAreDesc: 'Taifi Travel is a premier Moroccan travel agency specializing exclusively in spiritual pilgrimages. We curate personalized Hajj and Omra experiences, offering luxury accommodations near the holy sanctuaries, expert spiritual guidance, and seamless logistics to ensure your journey of a lifetime is perfect.',
      ourMission: 'Our Mission',
      ourPurposeTitle: 'Our Purpose & Vision',
      ourPurposeDesc: 'Our core purpose is to eliminate the stress of travel planning so you can focus entirely on your spiritual experience. We strive to provide unparalleled service and comfort, ensuring every pilgrim feels supported, valued, and inspired from the moment they book until they safely return home.',
      ourApproach: 'Our Approach',
      howWeTravelTitle: 'How We Travel',
      howWeTravelDesc: 'We travel with devotion, comfort, and safety at the forefront. Every spiritual itinerary is meticulously planned—from hand-selecting 5-star hotels steps away from the Haram to partnering with reliable airlines and providing dedicated scholars throughout your sacred adventure.',
      coreValuesSubtitle: 'What Drives Us',
      coreValues: 'Our Core Values',
      val1Title: 'Devotion',
      val1Desc: 'We provide authentic spiritual guidance to help you focus on your worship and connection with Allah.',
      val2Title: 'Reliability',
      val2Desc: 'From verified luxury hotel bookings to seamless flights, your comfort and peace of mind are guaranteed.',
      val3Title: 'Support',
      val3Desc: 'Our dedicated team and expert scholars are always ready to assist you at every step of your sacred journey.',
      ctaTitle: 'Ready to Start Your Spiritual Journey?',
      ctaDesc: 'Explore our curated Hajj and Omra packages and book your next sacred pilgrimage with Taifi Travel today.',
      ctaButton: 'Explore Packages'
    },
    fr: {
      tagline: 'À Propos',
      title: 'À Propos de Taifi Travel',
      subtitle: 'Votre partenaire dévoué pour les voyages spirituels sacrés, vous guidant vers les villes saintes de La Mecque et Médine avec un soin et une dévotion exceptionnels.',
      whoWeAre: 'Qui Sommes-Nous',
      whoWeAreTitle: 'Votre Agence Hajj & Omra de Confiance',
      whoWeAreDesc: 'Taifi Travel est une agence de voyage marocaine de premier plan spécialisée exclusivement dans les pèlerinages spirituels. Nous concevons des expériences Hajj et Omra personnalisées, offrant des hébergements de luxe près des sanctuaires sacrés, des conseils spirituels d\'experts et une logistique fluide.',
      ourMission: 'Notre Mission',
      ourPurposeTitle: 'Notre Objectif et Vision',
      ourPurposeDesc: 'Notre objectif principal est d\'éliminer le stress de la planification afin que vous puissiez vous concentrer entièrement sur votre expérience spirituelle. Nous nous efforçons de fournir un service et un confort inégalés, en veillant à ce que chaque pèlerin se sente soutenu et valorisé.',
      ourApproach: 'Notre Approche',
      howWeTravelTitle: 'Comment Nous Voyageons',
      howWeTravelDesc: 'Nous voyageons avec dévotion, confort et sécurité au premier plan. Chaque itinéraire spirituel est planifié méticuleusement, du choix d\'hôtels 5 étoiles à quelques pas du Haram au partenariat avec des compagnies aériennes fiables et des guides religieux dévoués.',
      coreValuesSubtitle: 'Ce Qui Nous Anime',
      coreValues: 'Nos Valeurs Fondamentales',
      val1Title: 'Dévotion',
      val1Desc: 'Nous offrons des conseils spirituels authentiques pour vous aider à vous concentrer sur votre adoration.',
      val2Title: 'Fiabilité',
      val2Desc: 'Des réservations d\'hôtels de luxe vérifiées aux vols fluides, votre confort et tranquillité d\'esprit sont garantis.',
      val3Title: 'Support',
      val3Desc: 'Notre équipe dévouée et nos experts sont toujours prêts à vous accompagner à chaque étape de votre voyage sacré.',
      ctaTitle: 'Prêt à Commencer Votre Voyage Spirituel ?',
      ctaDesc: 'Explorez nos forfaits Hajj et Omra sélectionnés et réservez votre prochain pèlerinage sacré dès aujourd\'hui.',
      ctaButton: 'Explorer les Forfaits'
    },
    ar: {
      tagline: 'من نحن',
      title: 'عن طايفي ترافل',
      subtitle: 'شريكك المخلص في رحلاتك الروحانية المقدسة، نرشدك إلى مدينتي مكة المكرمة والمدينة المنورة بعناية وتفانٍ استثنائيين.',
      whoWeAre: 'من نحن',
      whoWeAreTitle: 'وكالتك الموثوقة للحج والعمرة',
      whoWeAreDesc: 'طايفي ترافل هي وكالة سفر مغربية رائدة متخصصة حصرياً في الرحلات الدينية. نحن نصمم تجارب حج وعمرة مخصصة، ونقدم إقامات فاخرة بالقرب من الحرمين الشريفين، وتوجيهات روحانية من الخبراء، وخدمات لوجستية سلسة لضمان رحلة عمر مثالية.',
      ourMission: 'مهمتنا',
      ourPurposeTitle: 'هدفنا ورؤيتنا',
      ourPurposeDesc: 'هدفنا الرئيسي هو إزالة ضغوط التخطيط للسفر حتى تتمكن من التركيز كلياً على تجربتك الروحانية. نحن نسعى لتقديم خدمة وراحة لا مثيل لها، لضمان شعور كل معتمر أو حاج بالدعم والتقدير منذ لحظة الحجز وحتى عودته سالماً.',
      ourApproach: 'نهجنا',
      howWeTravelTitle: 'كيف نسافر',
      howWeTravelDesc: 'نسافر واضعين التفاني والراحة والأمان في المقام الأول. يتم التخطيط لكل خط سير روحاني بدقة - بدءاً من اختيار فنادق 5 نجوم على بعد خطوات من الحرم إلى الشراكة مع شركات طيران موثوقة وتوفير مرشدين دينيين طوال رحلتك المقدسة.',
      coreValuesSubtitle: 'ما يدفعنا للأمام',
      coreValues: 'قيمنا الأساسية',
      val1Title: 'التفاني',
      val1Desc: 'نقدم لك توجيهاً روحانياً حقيقياً لمساعدتك على التركيز على عبادتك وتقربك من الله.',
      val2Title: 'الموثوقية',
      val2Desc: 'من حجوزات الفنادق الفاخرة المعتمدة إلى الرحلات الجوية السلسة، راحتك وطمأنينتك مضمونة تماماً.',
      val3Title: 'الدعم المستمر',
      val3Desc: 'فريقنا المتفاني والعلماء الخبراء مستعدون دائماً لمساعدتك في كل خطوة من خطوات رحلتك المقدسة.',
      ctaTitle: 'هل أنت مستعد لبدء رحلتك الروحانية؟',
      ctaDesc: 'استكشف باقات الحج والعمرة المميزة لدينا واحجز رحلتك المقدسة القادمة مع طايفي ترافل اليوم.',
      ctaButton: 'استكشف الباقات'
    }
  };

  const t = content[lang] || content.en;

  return (
    <div className="bg-gradient-to-b from-taifi-primary/5 via-gray-50 to-taifi-gold/10 min-h-screen py-12 px-4 md:px-12 space-y-16">
      
      <div className="max-w-7xl mx-auto">


                {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-taifi-gold font-semibold uppercase tracking-widest text-xs">{t.tagline}</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-taifi-primary mt-2 mb-4">
            {t.title}
          </h1>
          <p className="text-taifi-darkGray max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Section 1: Who We Are */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 md:grid-cols-2 items-center group">
          <div className="h-64 md:h-[320px] relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?w=900&auto=format&fit=crop&q=80" 
              alt="Makkah" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="p-8 text-left">
            <span className="text-taifi-gold font-semibold uppercase tracking-widest text-xs">{t.whoWeAre}</span>
            <h3 className="text-2xl font-serif font-bold text-taifi-primary mt-2 mb-3">{t.whoWeAreTitle}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{t.whoWeAreDesc}</p>
          </div>
        </div>

        {/* Section 2: Our Purpose */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 md:grid-cols-2 items-center group">
          <div className="p-8 order-2 md:order-1 text-left">
            <span className="text-taifi-gold font-semibold uppercase tracking-widest text-xs">{t.ourMission}</span>
            <h3 className="text-2xl font-serif font-bold text-taifi-primary mt-2 mb-3">{t.ourPurposeTitle}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{t.ourPurposeDesc}</p>
          </div>
          <div className="h-64 md:h-[320px] relative overflow-hidden order-1 md:order-2">
            <img 
              src="https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=900&auto=format&fit=crop&q=80" 
              alt="Masjid an-Nabawi" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
        </div>

        {/* Section 3: How We Travel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 md:grid-cols-2 items-center group">
          <div className="h-64 md:h-[320px] relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1604655983671-9d03650f604c?w=900&auto=format&fit=crop&q=80" 
              alt="Spiritual Journey" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="p-8 text-left">
            <span className="text-taifi-gold font-semibold uppercase tracking-widest text-xs">{t.ourApproach}</span>
            <h3 className="text-2xl font-serif font-bold text-taifi-primary mt-2 mb-3">{t.howWeTravelTitle}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{t.howWeTravelDesc}</p>
          </div>
        </div>

      </div>

      {/* Core Values Section */}
      <div className="max-w-5xl mx-auto pt-4">
        <div className="text-center mb-8">
          <span className="text-taifi-gold font-semibold uppercase tracking-widest text-xs">{t.coreValuesSubtitle}</span>
          <h2 className="text-3xl font-serif font-bold text-taifi-primary mt-1">{t.coreValues}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-2 text-left">
            <div className="w-10 h-10 bg-taifi-gold/20 rounded-xl flex items-center justify-center text-taifi-primary font-bold text-lg">01</div>
            <h3 className="text-lg font-bold text-taifi-primary">{t.val1Title}</h3>
            <p className="text-gray-600 text-xs leading-relaxed">{t.val1Desc}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-2 text-left">
            <div className="w-10 h-10 bg-taifi-gold/20 rounded-xl flex items-center justify-center text-taifi-primary font-bold text-lg">02</div>
            <h3 className="text-lg font-bold text-taifi-primary">{t.val2Title}</h3>
            <p className="text-gray-600 text-xs leading-relaxed">{t.val2Desc}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-2 text-left">
            <div className="w-10 h-10 bg-taifi-gold/20 rounded-xl flex items-center justify-center text-taifi-primary font-bold text-lg">03</div>
            <h3 className="text-lg font-bold text-taifi-primary">{t.val3Title}</h3>
            <p className="text-gray-600 text-xs leading-relaxed">{t.val3Desc}</p>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 text-center shadow-xl border border-gray-100 space-y-4">
        <h3 className="text-2xl font-serif font-bold text-taifi-primary">{t.ctaTitle}</h3>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          {t.ctaDesc}
        </p>
        <div className="pt-2">
          <Link 
            to="/packages" 
            className="inline-block px-8 py-3 rounded-xl bg-taifi-primary text-taifi-gold font-bold text-sm shadow hover:bg-opacity-90 transition"
          >
            {t.ctaButton}
          </Link>
        </div>
      </div>

    </div>
  );
}