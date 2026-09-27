import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome Back',
    desc: 'Access your Taifi Travel portal',
    identifier: 'Email or Phone Number',
    identifierPlaceholder: 'name@example.com or 06...',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    submit: 'Sign In',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
    error: 'Failed to log in. Please check your credentials.'
  },
  fr: {
    welcome: 'Bon retour',
    desc: 'Accédez à votre portail Taifi Travel',
    identifier: 'E-mail ou Numéro de Téléphone',
    identifierPlaceholder: 'nom@exemple.com ou 06...',
    password: 'Mot de passe',
    passwordPlaceholder: '••••••••',
    submit: 'Se Connecter',
    noAccount: "Vous n'avez pas de compte ?",
    signup: 'S\'inscrire',
    error: 'Échec de la connexion. Veuillez vérifier vos identifiants.'
  },
  ar: {
    welcome: 'مرحباً بعودتك',
    desc: 'قم بالوصول إلى بوابة طايفي ترافل الخاصة بك',
    identifier: 'البريد الإلكتروني أو رقم الهاتف',
    identifierPlaceholder: 'اسم@مثال.com أو 06...',
    password: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    submit: 'تسجيل الدخول',
    noAccount: 'ليس لديك حساب؟',
    signup: 'إنشاء حساب',
    error: 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.'
  }
};

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const { lang, t } = useLanguage();
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authService.login(identifier, password);
      navigate(from, { replace: true });
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">{texts.identifier}</label>
            <input 
              type="text" 
              required 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold text-sm transition"
              placeholder={texts.identifierPlaceholder}
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
              placeholder={texts.passwordPlaceholder}
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
          {texts.noAccount} <Link to="/signup" className="text-taifi-gold font-bold hover:underline">{texts.signup}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
