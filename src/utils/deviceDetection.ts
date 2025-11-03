/**
 * Device detection utilities
 */

export const isMobileDevice = (): boolean => {
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile', 'tablet',
    'samsung', 'nokia', 'opera mini', 'fennec', 'mobi'
  ];
  
  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // Check screen width (mobile typically < 768px, tablet < 1024px)
  const isMobileScreen = window.innerWidth < 768;
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  // Check if device has touch capability
  const isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;
  
  // Check for mobile-specific features
  const hasMobileFeatures = 'orientation' in window || 
    'DeviceMotionEvent' in window;
  
  // Return true if mobile user agent OR (small screen AND touch) OR (tablet screen AND touch AND mobile features)
  return isMobileUserAgent || 
         (isMobileScreen && isTouchDevice) || 
         (isTabletScreen && isTouchDevice && hasMobileFeatures);
};

export const isDesktopDevice = (): boolean => {
  return !isMobileDevice();
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  
  if (isMobileDevice()) {
    return width < 768 ? 'mobile' : 'tablet';
  }
  
  return 'desktop';
};