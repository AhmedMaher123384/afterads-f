import React from 'react';

type SpinnerProps = {
  size?: number;
  overlay?: boolean;
  className?: string;
};

const Spinner: React.FC<SpinnerProps> = ({ size = 28, overlay = false, className = '' }) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-4 border-gray-300 border-t-[#203f61] ${className}`}
      style={{ width: size, height: size }}
    />
  );

  if (!overlay) return spinner;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      {spinner}
    </div>
  );
};

export default Spinner;