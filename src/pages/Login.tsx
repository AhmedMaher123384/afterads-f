import { useState, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { smartToast } from '../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from '../config/api';
import { ArrowRight } from 'lucide-react'
 
const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t , i18n } = useTranslation('common');
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // إنشاء تأثير الجزيئات المتحركة في الخلفية
    const createParticles = () => {
      const container = document.querySelector('.particles-container');
      if (!container) return;

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 8 + 2;
        const posX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        container.appendChild(particle);
      }
    };

    createParticles();

    // إضافة تأثير الانعكاس عند النقر على حقول الإدخال
    const focusEffect = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      const rect = (e.target as HTMLElement).getBoundingClientRect();

      ripple.className = 'focus-ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;

      (e.target as HTMLElement).appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 1000);
    };

    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
      input.addEventListener('mousedown', focusEffect as EventListener);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('mousedown', focusEffect as EventListener);
      });
    };
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 [AdminLogin] Attempting login with:', { email });

      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });

      console.log('✅ [AdminLogin] Login successful:', response);
      console.log('🔍 [AdminLogin] Response details:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        userKeys: response.user ? Object.keys(response.user) : 'no user',
        tokenType: typeof response.token,
        fullResponse: JSON.stringify(response, null, 2)
      });

      if (response.user && response.token) { 
        // حفظ بيانات المستخدم والتوكن
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        localStorage.setItem('adminToken', response.token);

        const form = document.querySelector('.login-form');
        form?.classList.add('success-animation');

        const name = (response.user?.firstName || response.user?.name || '').toString();
    

        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        throw new Error('لم يتم إرجاع بيانات المستخدم أو التوكن');
      }

    } catch (error: any) {
      console.error('❌ [AdminLogin] Login error:', error);

      let errorMessage = 'فشل في تسجيل الدخول';

      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = 'البريد الإلكتروني غير مسجل';
        } else if (status === 401) {
          errorMessage = 'كلمة المرور غير صحيحة';
        } else if (status === 423) {
          errorMessage = 'الحساب مقفل مؤقتاً بسبب محاولات دخول خاطئة';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      const errorElement = document.querySelector('.error-message');
      errorElement?.classList.add('shake-animation');
      setTimeout(() => {
        errorElement?.classList.remove('shake-animation');
      }, 500);

      smartToast.frontend.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden relative px-3 sm:px-4 md:px-6 lg:px-8 mobile-p-3 ultra-mobile-p-2" dir="rtl">
      {/* التنسيقات المخصصة */}
      <style>
        {`
          * {
            font-family: 'PingARLT', sans-serif !important;
          }

          /* Mobile Responsive Styles */
          @media (max-width: 640px) {
            .mobile-text-xs { font-size: 0.75rem; }
            .mobile-text-sm { font-size: 0.875rem; }
            .mobile-text-base { font-size: 1rem; }
            .mobile-text-lg { font-size: 1.125rem; }
            .mobile-text-xl { font-size: 1.25rem; }
            .mobile-text-2xl { font-size: 1.5rem; }
            .mobile-p-3 { padding: 0.75rem; }
            .mobile-p-4 { padding: 1rem; }
            .mobile-p-6 { padding: 1.5rem; }
            .mobile-mb-4 { margin-bottom: 1rem; }
            .mobile-mb-6 { margin-bottom: 1.5rem; }
            .mobile-w-10 { width: 2.5rem; }
            .mobile-h-10 { height: 2.5rem; }
            .mobile-rounded-lg { border-radius: 0.5rem; }
          }

          @media (max-width: 480px) {
            .ultra-mobile-text-xs { font-size: 0.625rem; }
            .ultra-mobile-text-sm { font-size: 0.75rem; }
            .ultra-mobile-text-base { font-size: 0.875rem; }
            .ultra-mobile-text-lg { font-size: 1rem; }
            .ultra-mobile-text-xl { font-size: 1.125rem; }
            .ultra-mobile-p-2 { padding: 0.5rem; }
            .ultra-mobile-p-3 { padding: 0.75rem; }
            .ultra-mobile-p-4 { padding: 1rem; }
            .ultra-mobile-mb-3 { margin-bottom: 0.75rem; }
            .ultra-mobile-mb-4 { margin-bottom: 1rem; }
            .ultra-mobile-w-8 { width: 2rem; }
            .ultra-mobile-h-8 { height: 2rem; }
          }

          /* تأثير الخلفية المتدرجة */
          @keyframes gradientShift {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
          }
          
          .background-gradient {
            background: linear-gradient(-45deg, #0B132B, #1C2541, #3A506B, #5BC0BE, #0B132B);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
          
          /* تأثير الكارت والظل */
          .card-shadow {
            box-shadow: 0 0 50px rgba(91, 192, 190, 0.3), 0 0 100px rgba(91, 192, 190, 0.1);
          }
          
          .glass-effect {
            background: rgba(28, 37, 65, 0.7);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(91, 192, 190, 0.3);
            border-radius: 24px;
            transition: all 0.5s ease;
          }
          
          .glass-effect:hover {
            box-shadow: 0 0 80px rgba(91, 192, 190, 0.5);
            transform: translateY(-5px);
          }
          
          /* تأثير تعويم الشعار */
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          
          .logo-float {
            animation: floating 6s ease-in-out infinite;
          }
          
          /* تأثير الجزيئات المتحركة */
          .particles-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
          }
          
          .particle {
            position: absolute;
            background: rgba(91, 192, 190, 0.5);
            border-radius: 50%;
            opacity: 0.5;
            pointer-events: none;
            transform: scale(0);
            z-index: 0;
            animation: floatUp 20s linear infinite;
          }
          
          @keyframes floatUp {
            0% { 
              transform: translateY(100vh) scale(0);
              opacity: 0;
            }
            25% {
              opacity: 0.8;
            }
            50% {
              transform: translateY(50vh) scale(1);
              opacity: 0.5;
            }
            75% {
              opacity: 0.8;
            }
            100% { 
              transform: translateY(-100px) scale(0);
              opacity: 0;
            }
          }
          
          /* تأثيرات حقول الإدخال */
          .input-field {
            background: rgba(11, 19, 43, 0.5);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .input-field:focus {
            background: rgba(11, 19, 43, 0.8);
            border-color: #5BC0BE;
            box-shadow: 0 0 15px rgba(91, 192, 190, 0.5);
          }
          
          /* تأثير الانعكاس عند النقر */
          .focus-ripple {
            position: absolute;
            width: 5px;
            height: 5px;
            background: rgba(91, 192, 190, 0.8);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 1s linear;
            z-index: 0;
          }
          
          @keyframes ripple {
            0% {
              transform: scale(0);
              opacity: 0.8;
            }
            100% {
              transform: scale(200);
              opacity: 0;
            }
          }
          
          /* تأثيرات زر تسجيل الدخول */
          .login-button {
            background: linear-gradient(45deg, #5BC0BE, #3A506B);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            z-index: 1;
          }
          
          .login-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #3A506B, #5BC0BE);
            opacity: 0;
            transition: opacity 0.5s ease;
            z-index: -1;
          }
          
          .login-button:hover::before {
            opacity: 1;
          }
          
          .login-button:active {
            transform: scale(0.98);
          }
          
          .button-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
          
          /* تأثير الدوران للوودر */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .spinner {
            animation: spin 1.5s linear infinite;
          }
          
          /* تأثير الاهتزاز لرسالة الخطأ */
          .shake-animation {
            animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          /* تأثير نجاح تسجيل الدخول */
          .success-animation {
            animation: successPulse 0.8s ease;
          }
          
          @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(91, 192, 190, 0.8); }
            100% { transform: scale(0.95); opacity: 0; }
          }
          
          /* تأثير إظهار/إخفاء كلمة المرور */
          .toggle-password {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          
          .toggle-password:hover {
            color: #5BC0BE;
          }
          
          /* تنسيق تسميات الحقول */
          .input-label {
            position: relative;
            display: inline-block;
            margin-bottom: 10px;
            padding-right: 10px;
            transition: all 0.3s ease;
          }
          
          .input-label::before {
            content: '';
            position: absolute;
            height: 100%;
            width: 3px;
            background: #5BC0BE;
            right: 0;
            border-radius: 3px;
          }
        `}
      </style>

      {/* الخلفية المتدرجة المتحركة */}
      <div className="background-gradient absolute inset-0">
        <div className="particles-container"></div>
      </div>

      {/* كارت تسجيل الدخول */}
      <div className="relative z-10 glass-effect p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg card-shadow mobile-p-4 ultra-mobile-p-3 mobile-rounded-lg">
        {/* الشعار المتحرك */}
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8 mobile-mb-4 ultra-mobile-mb-3">
          <div className="logo-float bg-white bg-opacity-10 p-2 sm:p-3 md:p-4 lg:p-5 rounded-full">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-teal-400 mobile-w-10 mobile-h-10 ultra-mobile-w-8 ultra-mobile-h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white text-center mb-2 mobile-text-xl ultra-mobile-text-lg">تسجيل الدخول</h2>
        <p className="text-gray-300 text-center mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base mobile-text-sm ultra-mobile-text-xs mobile-mb-4 ultra-mobile-mb-3">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 error-message mobile-p-3 ultra-mobile-p-2 mobile-mb-4 ultra-mobile-mb-3">
            <div className="flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400 ml-1 sm:ml-2 md:ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-300 text-xs sm:text-sm font-medium mobile-text-sm ultra-mobile-text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="login-form">
          {/* حقل البريد الإلكتروني */}
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="input-label">
              <label className="text-white font-medium text-xs sm:text-sm mobile-text-sm ultra-mobile-text-xs">البريد الإلكتروني</label>
            </div>
            <div className="relative mt-1">
              <div className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-teal-400">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full p-2 sm:p-3 md:p-4 pr-8 sm:pr-10 md:pr-12 text-white rounded-lg sm:rounded-xl border border-gray-700 focus:outline-none focus:ring-0 text-xs sm:text-sm md:text-base mobile-text-sm ultra-mobile-text-xs mobile-p-3 ultra-mobile-p-2"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div className="mb-4 sm:mb-6 md:mb-8 mobile-mb-6 ultra-mobile-mb-4">
            <div className="input-label">
              <label className="text-white font-medium text-xs sm:text-sm mobile-text-sm ultra-mobile-text-xs">كلمة المرور</label>
            </div>
            <div className="relative mt-1">
              <div className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-teal-400">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full p-2 sm:p-3 md:p-4 pr-8 sm:pr-10 md:pr-12 pl-8 sm:pl-10 md:pl-12 text-white rounded-lg sm:rounded-xl border border-gray-700 focus:outline-none focus:ring-0 text-xs sm:text-sm md:text-base mobile-text-sm ultra-mobile-text-xs mobile-p-3 ultra-mobile-p-2"
                placeholder="أدخل كلمة المرور"
                required
              />
              {/* زر إظهار/إخفاء كلمة المرور */}
              <div
                className="toggle-password absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-teal-400 cursor-pointer hover:text-teal-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading}
            className="login-button w-full py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl text-white text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 mobile-text-sm ultra-mobile-text-xs mobile-p-3 ultra-mobile-p-2"
          >
            <div className="button-content gap-1">
              {loading ? (
                <svg className="spinner w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>

                  <span className="mobile-text-sm ultra-mobile-text-xs">تسجيل الدخول</span>
                   <ArrowRight className={`w-5 h-5 ${isRTL ? '' : 'rotate-180'}`} />

                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;