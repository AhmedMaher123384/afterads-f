import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
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

  // Validation functions (Memoized)
  const validateEmail = useCallback((email: string): string => {
    if (!email) return t('auth.validation.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('auth.validation.emailInvalid');
    return '';
  }, [t]);

  const validatePassword = useCallback((password: string): string => {
    if (!password) return t('auth.validation.passwordRequired');
    if (password.length < 6) return t('auth.validation.passwordMinLength');
    return '';
  }, [t]);

  const validateName = useCallback((name: string, fieldName: string): string => {
    if (!name) return t('auth.validation.fieldRequired', { field: fieldName });
    if (name.length < 2) return t('auth.validation.nameMinLength', { field: fieldName });
    return '';
  }, [t]);

  // ✅ FIXED: Phone validation - accepts any length
  const validatePhone = useCallback((phone: string): string => {
    if (!phone) return t('auth.validation.phoneRequired');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) return 'رقم الهاتف قصير جداً (8 أرقام على الأقل)';
    return '';
  }, [t]);

  // Validate form before submission
  const validateForm = useCallback((): boolean => {
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
  }, [userData, isLogin, validateEmail, validatePassword, validateName, validatePhone, t]);

  // Handle login
  const handleLogin = useCallback(async () => {
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
        try {
          localStorage.setItem('user', JSON.stringify(response.user));
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: response.user }));
        } catch {}
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
  }, [userData, validateForm, onLoginSuccess, t]);

  // Handle registration
  const handleRegister = useCallback(async () => {
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
          phone: userData.phone.replace(/\D/g, '') // Send only digits
        })
      });
      
      if (response.user) {
        try {
          localStorage.setItem('user', JSON.stringify(response.user));
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: response.user }));
        } catch {}
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
  }, [userData, validateForm, onLoginSuccess, t]);

  const toggleAuthMode = useCallback(() => {
    setIsLogin(!isLogin);
    setErrors({});
    setUserData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
  }, [isLogin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      {/* Modal - Reduced max height */}
      <div className="relative bg-[#292929] rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all duration-500 border border-[#18b5d8]/30 hover:border-[#18b5d8]/50 max-h-[90vh] overflow-y-auto">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8] via-transparent to-[#16a2c7]"></div>
        </div>

        {/* Content - Reduced padding */}
        <div className="p-4 md:p-6 space-y-4 relative z-10">
          <button
            onClick={onClose}
            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title */}
          <div className="text-center mb-2">
            <h5 className="text-xl md:text-2xl font-bold text-white mb-1">
              {isLogin ? t('auth.login') : t('auth.createNewAccount')}
            </h5>
           
          </div>

          {/* Login Form */}
          {isLogin && (
            <div className="space-y-3">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('auth.fields.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className={`w-full pr-10 pl-3 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                      errors.email ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('auth.fields.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className={`w-full pr-10 pl-10 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                      errors.password ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder={t('auth.placeholders.password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white py-3 rounded-xl font-bold text-base hover:from-[#16a2c7] hover:to-[#18b5d8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
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
            <div className="space-y-3">
              {/* Name Fields - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('auth.fields.firstName')}
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                      className={`w-full pr-10 pl-3 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                        errors.firstName ? 'border-red-500' : 'border-[#18b5d8]/30'
                      }`}
                      placeholder={t('auth.placeholders.firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('auth.fields.lastName')}
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                      className={`w-full pr-10 pl-3 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                        errors.lastName ? 'border-red-500' : 'border-[#18b5d8]/30'
                      }`}
                      placeholder={t('auth.placeholders.lastName')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('auth.fields.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className={`w-full pr-10 pl-3 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                      errors.email ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field - FIXED: No length limit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('auth.fields.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className={`w-full pr-10 pl-3 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                      errors.phone ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder="0512345678"
                    dir="ltr"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('auth.fields.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className={`w-full pr-10 pl-10 py-2.5 bg-white/5 backdrop-blur-md border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18b5d8] transition-all text-white placeholder-gray-400 text-sm ${
                      errors.password ? 'border-red-500' : 'border-[#18b5d8]/30'
                    }`}
                    placeholder={t('auth.placeholders.passwordMinLength')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18b5d8] hover:text-[#16a2c7]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2">
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Register Button */}
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#18b5d8] to-[#16a2c7] text-white py-3 rounded-xl font-bold text-base hover:from-[#16a2c7] hover:to-[#18b5d8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{t('auth.messages.creatingAccount')}</span>
                  </>
                ) : (
                  <span>{t('auth.createNewAccount')}</span>
                )}
              </button>
            </div>
          )}

          {/* Toggle between Login/Register */}
          <div className="text-center">
            <button
              onClick={toggleAuthMode}
              className="text-[#18b5d8] hover:text-[#16a2c7] font-medium transition-colors text-sm"
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

export default AuthModal