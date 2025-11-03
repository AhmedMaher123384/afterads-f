import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink, Users, Headphones, UserCheck, Shield, RotateCcw } from 'lucide-react';

const ContactSection = () => {
  const openGoogleMaps = () => {
    window.open(
      "https://www.google.com/maps/place/24%C2%B045'04.5%22N+46%C2%B043'12.1%22E/@24.7512609,46.7200274,17z",
      "_blank"
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-transparent to-rose-400/10" />
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-pink-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-rose-400/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 via-transparent to-gray-900/5" />



      {/* Premium Footer */}
      <footer className="relative py-6 sm:py-8 mt-12 sm:mt-16 border-t border-gray-300/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-100/30 to-transparent" />
        <div className="relative">
          {/* Policy Links Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center text-gray-600 text-xs sm:text-sm font-medium hover:text-gray-800 transition-all duration-300 bg-white/60 backdrop-blur-xl border border-gray-300/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-white/80 transform hover:scale-105"
            >
              <Shield className="w-4 h-4 ml-2 text-blue-600" />
              <span>سياسة الاستخدام والخصوصية</span>
            </Link>
            <Link
              to="/return-policy"
              className="inline-flex items-center text-gray-600 text-xs sm:text-sm font-medium hover:text-gray-800 transition-all duration-300 bg-white/60 backdrop-blur-xl border border-gray-300/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-white/80 transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4 ml-2 text-green-600" />
              <span>سياسة الاسترجاع والاستبدال</span>
            </Link>
            <Link
              to="/terms-and-conditions"
              className="inline-flex items-center text-gray-600 text-xs sm:text-sm font-medium hover:text-gray-800 transition-all duration-300 bg-white/60 backdrop-blur-xl border border-gray-300/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-white/80 transform hover:scale-105"
            >
              <Shield className="w-4 h-4 ml-2 text-purple-600" />
              <span>الشروط والأحكام</span>
            </Link>
          </div>

          {/* Copyright Section */}
          <div className="text-center">
            <div className="inline-flex items-center text-gray-600 text-xs sm:text-sm font-medium bg-white/60 backdrop-blur-xl border border-gray-300/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
              <span className="text-gray-800 font-bold">© 2025 افتر ادز -  AfterAds</span>
              <span className="mx-2">|</span>
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent font-bold">تم التطوير بواسطة ArtCode</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactSection;