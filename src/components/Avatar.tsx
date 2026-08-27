import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | 'xl' | '2xl' | 'xs';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  className = '',
  rounded = 'full',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  }[size];

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }[size];

  const roundedClasses = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    xs: 'rounded-xs',
  }[rounded];

  const hasCustomPhoto = Boolean(src && src.trim().length > 0 && !imgError);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-[#E2E8F0] border border-slate-300/80 shadow-2xs ${sizeClasses} ${roundedClasses} ${className}`}
      title={alt}
    >
      {hasCustomPhoto ? (
        <img
          src={src!}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* WhatsApp-style neutral silhouette icon on #E2E8F0 light gray background */
        <div className="w-full h-full flex items-center justify-center bg-[#E2E8F0]">
          <svg
            className={`${iconSizes} text-slate-400 fill-slate-400/90`}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Person Head */}
            <circle cx="12" cy="7.5" r="4" />
            {/* Person Shoulders / Torso */}
            <path d="M4 19.5C4 15.3579 7.35786 12 11.5 12H12.5C16.6421 12 20 15.3579 20 19.5V20.5H4V19.5Z" />
          </svg>
        </div>
      )}
    </div>
  );
};
