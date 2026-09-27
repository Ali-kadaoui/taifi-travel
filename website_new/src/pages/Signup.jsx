import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const TRANSLATIONS = {
  en: {
    welcome: 'Create Account',
    desc: 'Join Taifi Travel for exclusive bookings',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password',
    submit: 'Create Account',
    haveAccount: 'Already have an account?',
    login: 'Log in',
    error: 'Failed to create an account. Please try again.',
    validationError: 'Please provide either an email or phone number.'
  },
  fr: {
    welcome: 'Créer un compte',
    desc: 'Rejoignez Taifi Travel pour des réservations exclusives',
    email: 'Adresse E-mail',
    phone: 'Numéro de Téléphone',
    password: 'Mot de passe',
    submit: 'Créer le compte',
    haveAccount: 'Vous avez déjà un compte ?',
    login: 'Se connecter',
    error: 'Échec de la création du compte. Veuillez réessayer.',
    validationError: 'Veuillez fournir soit un e-mail, soit un numéro de téléphone.'
  },
  ar: {
    welcome: 'إنشاء حساب',
    desc: 'انضم إلى طايفي ترافل لحجوزات حصرية',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    submit: 'إنشاء الحساب',
    haveAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    error: 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    validationError: 'يرجى تقديم إما بريد إلكتروني أو رقم هاتف.'
  }
};

const Signup = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email && !phoneNumber) {
      setError(texts.validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authService.signup(email, phoneNumber, password);
      // Auto-login or redirect to login
      await authService.login(email || phoneNumber, password);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data || texts.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-taifi-beige min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-card max-w-md w-full border border-taifi-gold/20 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-taifi-primary">{texts.welcome}</h2>
          <p className="text-sm text-gray-600">{texts.desc}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{texts.email} (Optional)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold text-sm transition"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{texts.phone} (Optional)</label>
            <input 
              type="tel" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold text-sm transition"
              placeholder="+212 6..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{texts.password}</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold text-sm transition"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-taifi-primary text-white py-3 rounded-xl font-bold hover:bg-taifi-gold hover:text-taifi-primary transition duration-300 shadow-md disabled:opacity-70"
          >
            {isLoading ? '...' : texts.submit}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          {texts.haveAccount} <Link to="/login" className="text-taifi-gold font-bold hover:underline">{texts.login}</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
