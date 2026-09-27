import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { FaUser, FaClipboardList, FaSignOutAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const TRANSLATIONS = {
  en: {
    title: 'My Account',
    profile: 'Profile Info',
    apps: 'My Applications',
    logout: 'Log Out',
    save: 'Save Changes',
    saving: 'Saving...',
    email: 'Email',
    phone: 'Phone Number',
    password: 'New Password',
    passwordPlaceholder: '••••••••',
    firstName: 'First Name',
    lastName: 'Last Name',
    cin: 'CIN Number',
    dob: 'Date of Birth',
    sex: 'Gender',
    male: 'Male',
    female: 'Female',
    success: 'Profile updated successfully!',
    error: 'Failed to update profile.',
    noApps: 'You have no applications yet.',
    status: 'Status:',
    submittedOn: 'Submitted on:',
  },
  fr: {
    title: 'Mon Compte',
    profile: 'Mon Profil',
    apps: 'Mes Demandes',
    logout: 'Déconnexion',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    email: 'E-mail',
    phone: 'Numéro de Téléphone',
    password: 'Nouveau Mot de Passe',
    passwordPlaceholder: '••••••••',
    firstName: 'Prénom',
    lastName: 'Nom de Famille',
    cin: 'Numéro de CIN',
    dob: 'Date de Naissance',
    sex: 'Sexe',
    male: 'Homme',
    female: 'Femme',
    success: 'Profil mis à jour avec succès !',
    error: 'Échec de la mise à jour du profil.',
    noApps: 'Vous n\'avez aucune demande pour le moment.',
    status: 'Statut :',
    submittedOn: 'Soumis le :',
  },
  ar: {
    title: 'حسابي',
    profile: 'الملف الشخصي',
    apps: 'طلباتي',
    logout: 'تسجيل الخروج',
    save: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة مرور جديدة',
    passwordPlaceholder: '••••••••',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    cin: 'رقم البطاقة الوطنية',
    dob: 'تاريخ الميلاد',
    sex: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    success: 'تم تحديث الملف الشخصي بنجاح!',
    error: 'فشل في تحديث الملف الشخصي.',
    noApps: 'ليس لديك أي طلبات حتى الآن.',
    status: 'الحالة:',
    submittedOn: 'تاريخ التقديم:',
  }
};

const MyAccount = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Fetch latest user data
    authService.getMe().then(data => {
      setUser(data);
      setFormData({
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        cinNumber: data.cinNumber || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        sex: data.sex || '',
        newPassword: ''
      });
    }).catch(err => {
      console.error(err);
      if (err.response?.status === 401) {
        authService.logout();
        navigate('/login');
      }
    });

    // Fetch applications
    authService.getMyApplications().then(data => {
      setApplications(data);
    }).catch(console.error);

  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Only send the password if it's filled
    const payload = { ...formData };
    if (!payload.newPassword) {
        delete payload.newPassword;
    }

    try {
      await authService.updateMe(payload);
      setMessage(t.success);
      setFormData(prev => ({ ...prev, newPassword: '' })); // clear the password field
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data || t.error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-orange-500" />;
    }
  };

  if (!user) return <div className="min-h-[60vh] flex justify-center items-center"><div className="w-8 h-8 border-4 border-taifi-gold border-t-taifi-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-taifi-beige min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-taifi-primary mb-8 text-center">{t.title}</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-2 border border-taifi-gold/20">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'profile' ? 'bg-taifi-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FaUser /> {t.profile}
              </button>
              <hr className="my-2 border-gray-100" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition"
              >
                <FaSignOutAlt /> {t.logout}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 border border-taifi-gold/20 min-h-[500px]">
              
              {activeTab === 'profile' && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-taifi-primary mb-6 border-b pb-4">{t.profile}</h2>
                  
                  {message && (
                    <div className={`p-4 rounded-xl mb-6 font-semibold ${message === t.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {message}
                    </div>
                  )}

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.firstName}</label>
                          <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.lastName}</label>
                          <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.cin}</label>
                          <input type="text" name="cinNumber" value={formData.cinNumber || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.dob}</label>
                          <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.sex}</label>
                          <select name="sex" value={formData.sex || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none bg-white">
                            <option value="">--</option>
                            <option value="Male">{t.male}</option>
                            <option value="Female">{t.female}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.email}</label>
                          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.phone}</label>
                          <input type="text" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t.password}</label>
                          <input type="password" name="newPassword" value={formData.newPassword || ''} onChange={handleChange} placeholder={t.passwordPlaceholder} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-taifi-gold focus:ring-1 focus:ring-taifi-gold outline-none" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="bg-taifi-gold text-taifi-primary px-8 py-3 rounded-xl font-bold hover:bg-taifi-primary hover:text-white transition shadow-md disabled:opacity-50">
                          {loading ? t.saving : t.save}
                        </button>
                      </div>
                    </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
