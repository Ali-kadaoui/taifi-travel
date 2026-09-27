import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { contactService } from '../services/contactService';
import { FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const CONTACT_TEXTS = {
  en: {
    title: "Contact Us",
    subtitle: "We're here to help and answer any question you might have. We look forward to hearing from you.",
    loginRequired: "Authentication Required",
    loginDesc: "You must be logged in to send a message to our agency.",
    loginBtn: "Go to Login",
    form: {
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "Your Message",
      send: "Send Message",
      sending: "Sending...",
      success: "Your message has been sent successfully! We will get back to you soon.",
      error: "Failed to send message. Please try again."
    }
  },
  fr: {
    title: "Contactez-nous",
    subtitle: "Nous sommes là pour vous aider et répondre à toutes vos questions. Nous avons hâte d'avoir de vos nouvelles.",
    loginRequired: "Authentification requise",
    loginDesc: "Vous devez être connecté pour envoyer un message à notre agence.",
    loginBtn: "Aller à la connexion",
    form: {
      name: "Nom complet",
      email: "Adresse e-mail",
      phone: "Numéro de téléphone",
      message: "Votre message",
      send: "Envoyer le message",
      sending: "Envoi en cours...",
      success: "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
      error: "Échec de l'envoi du message. Veuillez réessayer."
    }
  },
  ar: {
    title: "اتصل بنا",
    subtitle: "نحن هنا للمساعدة والإجابة على أي سؤال قد يكون لديك. نتطلع إلى الاستماع منك.",
    loginRequired: "مطلوب تسجيل الدخول",
    loginDesc: "يجب تسجيل الدخول لإرسال رسالة إلى وكالتنا.",
    loginBtn: "الذهاب لتسجيل الدخول",
    form: {
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      message: "رسالتك",
      send: "إرسال الرسالة",
      sending: "جاري الإرسال...",
      success: "تم إرسال رسالتك بنجاح! سنرد عليك قريباً.",
      error: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى."
    }
  }
};

export default function Contact() {
  const { lang } = useLanguage();
  const texts = CONTACT_TEXTS[lang];
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  useEffect(() => {
    // Check if logged in and fetch user details
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Auto-fill from local user state, but let's try to get fresh data too
      const fullName = currentUser.firstName && currentUser.lastName 
        ? `${currentUser.firstName} ${currentUser.lastName}` 
        : currentUser.firstName || '';
        
      setFormData(prev => ({
        ...prev,
        name: fullName,
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || ''
      }));

      // Fetch fresh data in background
      authService.getMe().then(freshUser => {
        setUser(freshUser);
        const freshFullName = freshUser.firstName && freshUser.lastName 
          ? `${freshUser.firstName} ${freshUser.lastName}` 
          : freshUser.firstName || '';
          
        setFormData(prev => ({
          ...prev,
          name: freshFullName || prev.name,
          email: freshUser.email || prev.email,
          phone: freshUser.phoneNumber || prev.phone
        }));
      }).catch(console.error);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      await contactService.submitMessage({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        messageContent: formData.message
      });
      setStatus('success');
      setFormData(prev => ({ ...prev, message: '' })); // Clear message after send
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show auth prompt
  if (user === null) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-taifi-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-taifi-primary">
            <FaExclamationCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{texts.loginRequired}</h2>
          <p className="text-gray-600 mb-8">{texts.loginDesc}</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-taifi-primary text-white py-3 rounded-lg font-semibold hover:bg-taifi-primary/90 transition-colors"
          >
            {texts.loginBtn}
          </button>
        </div>
      </div>
    );
  }

  // Logged in: Show Contact Form
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-taifi-primary mb-4">{texts.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{texts.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            
            {status === 'success' && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                <FaCheckCircle size={24} className="flex-shrink-0" />
                <p className="font-medium">{texts.form.success}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <FaExclamationCircle size={24} className="flex-shrink-0" />
                <p className="font-medium">{texts.form.error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{texts.form.name}</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{texts.form.phone}</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{texts.form.email}</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition-all bg-gray-50"
                  readOnly={!!user?.email} // Optional: make readonly if they logged in with email
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{texts.form.message}</label>
                <textarea 
                  name="message"
                  required
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taifi-gold focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-taifi-gold text-white py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <span>{texts.form.sending}</span>
                ) : (
                  <>
                    <span>{texts.form.send}</span>
                    <FaPaperPlane size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
