
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = 'px-6 py-3 font-bold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700/50 ${className}`}>
      {children}
    </div>
  );
};

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  return <img src={src} alt={alt} className={`rounded-full object-cover border-2 border-gray-600 ${sizeClasses[size]} ${className || ''}`} />;
};

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 text-yellow-400 ${className}`}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21z" clipRule="evenodd" />
  </svg>
);

export const CarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M3.28 9.22a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l1.5-1.5a.75.75 0 0 0-1.06-1.06L6 11.94l-2.72-2.72zM3 3.75A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75v10.5A2.25 2.25 0 0 1 18.75 16.5h-2.51a3.755 3.755 0 0 1-6.48 0H5.25A2.25 2.25 0 0 1 3 14.25V3.75zM8.25 15a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0zM15 9.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5z" clipRule="evenodd" />
    <path d="M5.25 3a.75.75 0 0 0-.75.75v10.5c0 .414.336.75.75.75h1.312a5.25 5.25 0 0 0 9.876 0h1.312a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75H5.25z" />
  </svg>
);

export const CashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414-.336.75-.75.75h-1.5a.75.75 0 0 1-.75-.75V5.25m0 0h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-3.375M3 12.75h18" />
    </svg>
);

export const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3.375" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    </svg>
);

export const PayPalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={`w-8 h-8 ${className}`}>
        <path d="M3.344 19.438h3.665c.578 0 .688-.281.828-1.016l.125-.75c.109-.703.25-1.297 1.25-1.297h1.938c3.156 0 4.75-1.781 4.75-4.625 0-2.281-1.328-3.64-3.64-3.64-1.688 0-2.828 1-3.266 2.766-.172.687-.672 2.39-1.281 2.39H4.172c-.547 0-.625.281-.766.953l-.125.828c-.125.547-.203.813-.234.953-.063.453.188.984.344.984zm14.156-8.203c.516 0 .906.188.906.656 0 .422-.328.656-.938.656h-.687c.219-1.078.625-1.312.719-1.312zm-3.156 5.828c.672-.031 1.094-.438 1.25-1.25.109-.641.016-1.141-.344-1.578-.375-.438-.969-.64-1.703-.64h-.656c-.531 0-.969.344-1.141 1.156-.156.812.219 1.281.719 1.312h1.875z"></path>
    </svg>
);

export const ApplePayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={`w-8 h-8 ${className}`}>
        <path d="M10.125 1.438c-1.313 0-2.453.797-3.047 1.953-.61-.062-1.281-.14-2.031-.14-2.063 0-3.953.953-5.047 2.453-1.422 1.969-.828 5.125.828 6.781 1.094 1.078 2.375 1.703 3.75 1.703 1.188 0 2.156-.531 3.125-1.406.969-.891 1.531-2.125 1.625-2.156.094-.031.281-.094 1.563-.094.75 0 1.938.094 2.875.938s1.422 2.219 1.422 2.219c-.047.031-.813.484-1.625.953-.688.406-1.375.844-1.375 1.844 0 1.234 1.031 1.797 2.219 1.797 1.25 0 2.156-.547 2.813-1.188s1.141-1.641 1.141-1.641c-.047-.016-2.281-1-2.281-3.625 0-2.016 1.688-3.125 1.844-3.25-1.172-1.656-2.953-1.89-3.484-1.922-2.313-.125-3.938 1.438-4.875 1.438-.969 0-2.313-1.359-4.219-1.328zM9.547 3.25c.531-.859 1.453-1.359 2.391-1.359.14 0 .281.016.406.031-.766.578-1.5 1.484-1.89 2.562-.485 1.282-1.063 2.922-2.11 2.89-1.125 0-1.672-1.078-2.14-2.344-.454-1.234-.36-2.437.343-3.156.406-.39 1.015-.656 1.625-.656.625 0 1.187.312 1.375.515.203.219.453.532.375.5z"></path>
    </svg>
);
export const GooglePayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={`w-8 h-8 ${className}`}>
        <path d="M21.5 8.583H2.5v6.834h19V8.583zm-7.65 4.659h-2.19v2.19h-1.32v-2.19H8.25v-1.32h2.09v-2.09h1.32v2.09h2.19v1.32zM15.17 3H8.83C7.17 3 5.86 4.31 5.86 6l.01 1.583h12.26V6c0-1.69-1.31-3-2.96-3zm3.96 18H4.88c-1.66 0-3-1.34-3-3v-2.583h20.24V18c0 1.66-1.34 3-3 3z"></path>
    </svg>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
