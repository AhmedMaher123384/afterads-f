import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Position {
  x: number;
  y: number;
}

const CustomCursor = () => {
  const location = useLocation();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // Hide custom cursor in dashboard pages
  const hideCursorPaths = ['/admin', '/login'];
  const shouldHideCursor = hideCursorPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  // Hide custom cursor on mobile and tablet - show only on desktop
  const [isMobile, setIsMobile] = useState(true); // Default to true for SSR

  useEffect(() => {
    // Check if we're on mobile/tablet after component mounts
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        // Only hide on actual mobile devices (768px and below)
        setIsMobile(window.innerWidth <= 768);
      }
    };
    
    checkMobile();
    
    // Add resize listener to update mobile state
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  useEffect(() => {
    // Don't add event listeners if cursor should be hidden or if document is not available
    if (shouldHideCursor || isMobile || typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleClick = (e: MouseEvent) => {
      setIsClicking(true);
      
      // Create ripple effect
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 300);
      
      setTimeout(() => setIsClicking(false), 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      setIsClicking(true);
      
      const touch = e.touches[0];
      if (touch) {
        // Create ripple effect
        const newRipple = {
          id: Date.now(),
          x: touch.clientX,
          y: touch.clientY
        };
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 300);
      }
      
      setTimeout(() => setIsClicking(false), 100);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    try {
      // More sensitive event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick);
      document.addEventListener('mousedown', handleClick); // Extra sensitivity
      document.addEventListener('touchstart', handleTouchStart); // Touch support
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
    } catch (error) {
      console.warn('CustomCursor: Failed to add event listeners', error);
    }

    return () => {
      try {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseenter', handleMouseEnter);
      } catch (error) {
        console.warn('CustomCursor: Failed to remove event listeners', error);
      }
    };
  }, [shouldHideCursor, location.pathname]);

  // Return null after all hooks have been called
  if (shouldHideCursor || isMobile) {
    return null;
  }

  return (
    <>
      {isVisible && (
        <>
          {/* Main cursor */}
          <div
            className={`fixed pointer-events-none z-[9999] ${
                 isClicking ? 'animate-professionalPulse' : ''
               }`}
            style={{
              left: position.x - 20,
              top: position.y - 20,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #18b5d5, #0ea5e9, #06b6d4)',
              boxShadow: '0 0 20px rgba(24, 181, 213, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)',
              transform: isClicking ? 'scale(1.5)' : 'scale(1)',
               opacity: isClicking ? '0.9' : '0.7',
            }}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
              }}
            />
            
            {/* Center dot */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
              }}
            />
          </div>
          
          {/* Outer ring */}
          <div
            className="fixed pointer-events-none z-[9998]"
            style={{
              left: position.x - 30,
              top: position.y - 30,
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '1px solid rgba(24, 181, 213, 0.3)',
              transform: isClicking ? 'scale(2)' : 'scale(1)',
               opacity: isClicking ? '0.3' : '0.6',
            }}
          />
        </>
      )}
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9997] animate-ripple"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid #18b5d5',
            opacity: '0.6',
          }}
        />
      ))}
    </>
  );
};

export default CustomCursor;