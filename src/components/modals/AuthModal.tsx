import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from '../../config/api';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useTranslation('common');
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return t('auth.validation.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('auth.validation.emailInvalid');
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return t('auth.validation.passwordRequired');
    if (password.length < 6) return t('auth.validation.passwordMinLength');
    return '';
  };

  const validateName = (name: string, fieldName: string): string => {
    if (!name) return t('auth.validation.fieldRequired', { field: fieldName });
    if (name.length < 2) return t('auth.validation.nameMinLength', { field: fieldName });
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return t('auth.validation.phoneRequired');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) return t('auth.validation.phoneLength');
    if (!cleanPhone.startsWith('5')) return t('auth.validation.phoneStartsWith5');
    return '';
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);

    if (!isLogin) {
      newErrors.firstName = validateName(userData.firstName, t('auth.fields.firstName'));
      newErrors.lastName = validateName(userData.lastName, t('auth.fields.lastName'));
      newErrors.phone = validatePhone(userData.phone);
    }

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      if (response.user) {
        onLoginSuccess(response.user);
        smartToast.frontend.success(t('auth.messages.loginSuccess'));
      } else {
        throw new Error(t('auth.messages.userDataNotReturned'));
      }
      
    } catch (error: any) {
      let errorMessage = t('auth.messages.loginFailed');
      
      if (error.message) {
        if (error.message.includes('HTTP 404')) {
          errorMessage = t('auth.messages.emailNotRegistered');
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = t('auth.messages.incorrectPassword');
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = t('auth.messages.invalidData');
        } else if (error.message.includes('HTTP 5')) {
          errorMessage = t('auth.messages.serverError');
        } else {
          errorMessage = error.message;
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
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
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
      
      if (response.user) {
        onLoginSuccess(response.user);
        smartToast.frontend.success(t('auth.messages.registerSuccess'));
      } else {
        throw new Error(t('auth.messages.userDataNotReturned'));
      }
      
    } catch (error: any) {
      let errorMessage = t('auth.messages.registerFailed');
      
      if (error.message) {
        if (error.message.includes('HTTP 409')) {
          errorMessage = t('auth.messages.emailAlreadyExists');
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = t('auth.messages.invalidData');
        } else if (error.message.includes('HTTP 5')) {
          errorMessage = t('auth.messages.serverError');
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
      
      smartToast.frontend.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format Saudi phone number
  const formatSaudiPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      {/* Modal */}
      <div className="relative bg-[#292929] rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-xs md:max-w-md mx-auto overflow-hidden transform transition-all duration-500 border border-[#18b5d8]/30 hover:border-[#18b5d8]/50 hover:shadow-[0_0_20px_rgba(24,181,216,0.5)]">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8] via-transparent to-[#16a2c7]"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #18b5d8 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #16a2c7 0%, transparent 50%)`,
            backgroundSize: '100px 100px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              33% { transform: translateY(-10px) rotate(1deg); }
              66% { transform: translateY(5px) rotate(-1deg); }
            }
            @keyframes glow {
              0%, 100% { filter: drop-shadow(0 0 5px rgba(24, 181, 216, 0.3)); transform: scale(1); }
              50% { filter: drop-shadow(0 0 10px rgba(24, 181, 216, 0.7)); transform: scale(1.05); }
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .animate-shimmer {
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
              background-size: 200% 100%;
              animation: shimmer 2s infinite;
            }
          `}
        </style>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] p-4 md:p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-2 md:top-4 left-2 md:left-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4">
            <div className="absolute -inset-2 bg-gradient-to-br from-[#18b5d8]/30 to-[#16a2c7]/30 blur-sm transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/20 to-[#16a2c7]/10 backdrop-blur-md border border-[#18b5d8]/30 transition-all duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#18b5d8]/15 to-transparent transition-all duration-700" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
            <User className="absolute inset-0 m-auto w-6 h-6 md:w-8 md:h-8 text-white animate-[glow_3.5s_ease-in-out_infinite]" />
          </div>
          
          <h2 className="text-lg md:text-2xl font-black text-white mb-1 md:mb-2">
            {isLogin ? t('auth.login') : t('auth.createNewAccount')}
          </h2>
          
          <p className="text-white/90 text-xs md:text-sm max-w-xs mx-auto">
            {isLogin ? t('auth.enterAccountData') : t('auth.completeDataForNewAccount')}
          </p>
        </div>

        {/* Content */}
        <div className="p-3 md:p-6 space-y-3 md:space-y-6 relative z-10">
          {/* Login Form */}
          {isLogin && (
            <div className="space-y-3 md:space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                  {t('auth.fields.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className={`w-full pr-8 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                      errors.email ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                  {t('auth.fields.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className={`w-full pr-8 md:pr-12 pl-8 md:pl-12 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                      errors.password ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder={t('auth.placeholders.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg md:rounded-xl p-2 md:p-4">
                  <p className="text-red-400 text-xs md:text-sm flex items-center gap-1 md:gap-2">
                    <AlertCircle className="w-3 h-3 md:w-5 md:h-5" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:from-[#16a2c7] hover:to-[#18b5d8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-1 md:gap-2"
                aria-label={t('auth.login')}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span>{t('auth.messages.loggingIn')}</span>
                  </>
                ) : (
                  <span>{t('auth.login')}</span>
                )}
              </button>
            </div>
          )}

          {/* Registration Form */}
          {!isLogin && (
            <div className="space-y-3 md:space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                  {t('auth.fields.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className={`w-full pr-8 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                      errors.email ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                  {t('auth.fields.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className={`w-full pr-8 md:pr-12 pl-8 md:pl-12 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                      errors.password ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder={t('auth.placeholders.passwordMinLength')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                    {t('auth.fields.firstName')}
                  </label>
                  <div className="relative">
                    <User className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                      className={`w-full pr-8 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                        errors.firstName ? 'border-red-500' : 'border-[#18b5d8]/30'
                      }`}
                      placeholder={t('auth.placeholders.firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                    {t('auth.fields.lastName')}
                  </label>
                  <div className="relative">
                    <User className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                      className={`w-full pr-8 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                        errors.lastName ? 'border-red-500' : 'border-[#18b5d8]/30'
                      }`}
                      placeholder={t('auth.placeholders.lastName')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-300 mb-1 md:mb-2">
                  {t('auth.fields.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="tel"
                    value={formatSaudiPhone(userData.phone)}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className={`w-full pr-8 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 bg-white/5 backdrop-blur-md border rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm md:text-base ${
                      errors.phone ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg md:rounded-xl p-2 md:p-4">
                  <p className="text-red-400 text-xs md:text-sm flex items-center gap-1 md:gap-2">
                    <AlertCircle className="w-3 h-3 md:w-5 md:h-5" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Register Button */}
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:from-[#16a2c7] hover:to-[#18b5d8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-1 md:gap-2"
                aria-label={t('auth.createNewAccount')}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span>{t('auth.messages.creatingAccount')}</span>
                  </>
                ) : (
                  <span>{t('auth.createNewAccount')}</span>
                )}
              </button>
            </div>
          )}

          {/* Toggle between Login/Register */}
          <div className="mt-4 md:mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setUserData({
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  phone: ''
                });
              }}
              className="text-[#18b5d8] hover:text-[#16a2c7] font-bold transition-colors text-sm md:text-base"
              disabled={loading}
            >
              {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
            </button>
          </div>
        </div>        
      </div>
    </div>
  );
};

export default AuthModal;