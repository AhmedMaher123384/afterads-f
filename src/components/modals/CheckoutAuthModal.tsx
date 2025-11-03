import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, UserPlus, ArrowRight, ShoppingCart, Shield, Clock, Star } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from "../../config/api";
import { useTranslation } from 'react-i18next';

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const CheckoutAuthModal: React.FC<CheckoutAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinueAsGuest, 
  onLoginSuccess 
}) => {
  const { t } = useTranslation('common');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return t('auth.validation.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('auth.validation.emailInvalid');
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return t('auth.validation.passwordRequired');
    if (password.length < 6) return t('auth.validation.passwordMinLength');
    return '';
  };

  const validateName = (name: string, fieldName: string) => {
    if (!name) return t('auth.validation.nameRequired', { field: fieldName });
    if (name.length < 2) return t('auth.validation.nameMinLength', { field: fieldName });
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return t('auth.validation.phoneRequired');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) return t('auth.validation.phoneLength');
    if (!cleanPhone.startsWith('5')) return t('auth.validation.phoneFormat');
    return '';
  };

  // Handle login
  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      console.log('🔐 [CheckoutAuthModal] Attempting login');
      
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      console.log('✅ [CheckoutAuthModal] Login successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        smartToast.frontend.success(t('auth.messages.loginSuccess'));
      }
      
    } catch (error: any) {
      console.error('❌ [CheckoutAuthModal] Login error:', error);
      
      let errorMessage = t('auth.messages.loginFailed');
      
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = t('auth.messages.emailNotRegistered');
        } else if (status === 401) {
          errorMessage = t('auth.messages.incorrectPassword');
        }
      }
      
      setErrors({ general: errorMessage });
      smartToast.frontend.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);
    newErrors.firstName = validateName(userData.firstName, t('auth.fields.firstName'));
    newErrors.lastName = validateName(userData.lastName, t('auth.fields.lastName'));
    newErrors.phone = validatePhone(userData.phone);
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      console.log('📝 [CheckoutAuthModal] Attempting registration');
      
      const response = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
        })
      });
      
      console.log('✅ [CheckoutAuthModal] Registration successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        smartToast.frontend.success(t('auth.messages.registerSuccess'));
      }
      
    } catch (error: any) {
      console.error('❌ [CheckoutAuthModal] Registration error:', error);
      
      let errorMessage = t('auth.messages.registerFailed');
      
      if (error.response?.status === 409) {
        errorMessage = t('auth.messages.emailAlreadyExists');
      }
      
      setErrors({ general: errorMessage });
      smartToast.frontend.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset to main view
  const resetToMain = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setUserData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setErrors({});
  };

  // Format phone number
  const formatSaudiPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return cleaned;
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#292929] rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-600/50 my-auto" style={{
        maxHeight: '90vh',
        minHeight: 'auto',
        transform: 'translateY(0)',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <ShoppingCart className="w-5 h-5 text-[#18b5d5]" />
              <h2 className="text-lg font-bold text-white">{t('checkout.completeOrder')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Main Choice View */}
        {!showLoginForm && !showRegisterForm && (
          <div className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-base font-semibold text-white mb-1">
                {t('checkout.chooseMethod')}
              </h3>
              <p className="text-gray-300 text-xs">
                {t('checkout.methodDescription')}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Continue as Guest */}
              <button
                onClick={onContinueAsGuest}
                className="w-full p-3 border border-[#18b5d5]/40 hover:border-[#18b5d5] rounded-lg bg-[#18b5d5]/10 hover:bg-[#18b5d5]/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-[#18b5d5]/20 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#18b5d5]" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-white text-sm">{t('checkout.continueAsGuest')}</h4>
                <p className="text-xs text-gray-300">{t('checkout.quickMethod')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#18b5d5] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Login Option */}
              <button
                onClick={() => setShowLoginForm(true)}
                className="w-full p-3 border border-gray-600 hover:border-gray-500 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-white text-sm">{t('auth.login')}</h4>
                <p className="text-xs text-gray-300">{t('checkout.existingAccount')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Register Option */}
              <button
                onClick={() => setShowRegisterForm(true)}
                className="w-full p-3 border border-[#18b5d5]/40 hover:border-[#18b5d5] rounded-lg bg-[#18b5d5]/10 hover:bg-[#18b5d5]/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-[#18b5d5]/20 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-[#18b5d5]" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-white text-sm">{t('auth.newAccount')}</h4>
                <p className="text-xs text-gray-300">{t('checkout.additionalFeatures')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#18b5d5] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <h5 className="font-semibold text-white mb-2 text-xs">{t('checkout.accountFeatures')}:</h5>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-gray-300">
                  <Clock className="w-3 h-3 text-[#18b5d5]" />
                  <span>{t('checkout.orderTracking')}</span>
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-gray-300">
                  <Star className="w-3 h-3 text-[#18b5d5]" />
                  <span>{t('checkout.favoriteProducts')}</span>
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-gray-300">
                  <Shield className="w-3 h-3 text-[#18b5d5]" />
                  <span>{t('checkout.saveAddresses')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        {showLoginForm && (
          <div className="p-4">
            <button
              onClick={resetToMain}
              className="flex items-center space-x-1 space-x-reverse text-gray-300 hover:text-white mb-3"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              <span className="text-xs">{t('common.back')}</span>
            </button>
            <h3 className="text-base font-semibold text-white mb-3">{t('auth.login')}</h3>

            {errors.general && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs">
                {errors.general}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t('auth.fields.email')}
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                    errors.email ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder={t('auth.placeholders.enterEmail')}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t('auth.fields.password')}
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                    errors.password ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder={t('auth.placeholders.enterPassword')}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#18b5d5] hover:bg-[#18b5d5]/90 disabled:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                {loading ? t('auth.messages.loggingIn') : t('auth.login')}
              </button>
            </div>
          </div>
        )}

        {/* Register Form */}
        {showRegisterForm && (
          <div className="p-4">
            <button
              onClick={resetToMain}
              className="flex items-center space-x-1 space-x-reverse text-gray-300 hover:text-white mb-3"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              <span className="text-xs">{t('common.back')}</span>
            </button>

            <h3 className="text-base font-semibold text-white mb-3">{t('auth.createNewAccount')}</h3>

            {errors.general && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs">
                {errors.general}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    {t('auth.fields.firstName')}
                  </label>
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    className={`w-full px-2 py-2 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                      errors.firstName ? 'border-red-600' : 'border-gray-600'
                    }`}
                    placeholder={t('auth.placeholders.firstNameExample')}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    {t('auth.fields.lastName')}
                  </label>
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    className={`w-full px-2 py-2 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                      errors.lastName ? 'border-red-600' : 'border-gray-600'
                    }`}
                    placeholder={t('auth.placeholders.lastNameExample')}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t('auth.fields.email')}
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                    errors.email ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t('auth.fields.phone')}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 rounded-r-lg border border-l-0 border-gray-600 bg-gray-700 text-gray-300 text-xs">
                    +966
                  </span>
                  <input
                    type="tel"
                    value={formatSaudiPhone(userData.phone)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setUserData({ ...userData, phone: value });
                      }
                    }}
                    className={`flex-1 px-2 py-2 bg-gray-800 border text-white rounded-l-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                      errors.phone ? 'border-red-600' : 'border-gray-600'
                    }`}
                    placeholder="5XX XXX XXX"
                    dir="ltr"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t('auth.fields.password')}
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-800 border text-white rounded-lg focus:ring-2 focus:ring-[#18b5d5] focus:border-[#18b5d5] text-sm ${
                    errors.password ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder={t('auth.placeholders.strongPassword')}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#18b5d5] hover:bg-[#18b5d5]/90 disabled:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                {loading ? t('auth.messages.creatingAccount') : t('auth.createAccount')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CheckoutAuthModal;