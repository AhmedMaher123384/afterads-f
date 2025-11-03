import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../contexts/LoadingContext';
import { isDesktopDevice } from '../../utils/deviceDetection';
import logo from '../../assets/logo.webp';

const LoadingScreen: React.FC = () => {
  const { isLoading } = useLoading();
  const isDesktop = isDesktopDevice();

  return (
    <AnimatePresence>
      {isLoading && isDesktop && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center bg-[#292929] overflow-hidden"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 0.98,
          }}
          transition={{ 
            duration: 1, 
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {/* Logo with enhanced animation */}
          <motion.div
            className="relative px-4 sm:px-6 md:px-8"
            initial={{ scale: 2.5, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: 0
            }}
            exit={{
              scale: 0.5,
              opacity: 0,
              y: -30
            }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <motion.img
              src={logo}
              alt="Logo"
              className="w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-80 xl:h-80 object-contain"
            />
            
            {/* Subtle glow effect - responsive blur */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(24, 181, 216, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Extra glow ring - responsive blur */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(24, 181, 216, 0.2) 0%, transparent 80%)',
                filter: 'blur(30px)',
              }}
              animate={{
                scale: [1.2, 1.5, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;