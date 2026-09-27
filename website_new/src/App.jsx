import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import ApplicationForm from './pages/ApplicationForm';
import MyAccount from './pages/MyAccount';
import Contact from './pages/Contact';

const Placeholder = ({ title }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-taifi-primary">{title} (Coming Soon)</h1>
    </div>
  );
};

const AppContent = () => {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  return (
    <div className="min-h-screen flex flex-col justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/flights" element={<Placeholder title="Flights" />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/apply" element={<ApplicationForm />} />

          <Route path="/custom-travel" element={<Placeholder title="Custom Travel" />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-account" element={<MyAccount />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Router>
  );
}
