import React from 'react';

export interface LogoProps {
  variant?: 'icon' | 'full' | 'wordmark' | 'combo';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  badge?: string;
  glow?: boolean;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'combo',
  size = 'md',
  className = '',
  showSubtitle = false,
  subtitleText = 'Every voice. Every expression.',
  badge,
  glow = false,
  alt = 'SAMNYA Logo'
}) => {
  // Size mappings for icon
  const getIconDimensions = () => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
    switch (size) {
      case 'xs':
        return { width: 24, height: 24, imgClass: 'w-6 h-6' };
      case 'sm':
        return { width: 32, height: 32, imgClass: 'w-8 h-8' };
      case 'md':
        return { width: 40, height: 40, imgClass: 'w-10 h-10' };
      case 'lg':
        return { width: 48, height: 48, imgClass: 'w-12 h-12' };
      case 'xl':
        return { width: 64, height: 64, imgClass: 'w-16 h-16' };
      case 'hero':
        return { width: 96, height: 96, imgClass: 'w-24 h-24 sm:w-28 sm:h-28' };
      default:
        return { width: 40, height: 40, imgClass: 'w-10 h-10' };
    }
  };

  const dim = getIconDimensions();

  // 1. Icon Only
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        {glow && (
          <div className="absolute inset-0 bg-blue-500/30 dark:bg-teal-400/25 rounded-2xl blur-md scale-110 pointer-events-none" />
        )}
        <img
          src="/samnya-icon.png"
          alt={alt}
          width={dim.width}
          height={dim.height}
          className={`relative z-10 object-contain drop-shadow-sm select-none transition-transform ${dim.imgClass || ''}`}
        />
      </div>
    );
  }

  // 2. Full official graphic logo (stacked symbol + SAMNYA wordmark with accent dots)
  if (variant === 'full') {
    return (
      <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl scale-110 pointer-events-none" />
        )}
        {/* Light mode version */}
        <img
          src="/samnya-logo.png"
          alt={alt}
          className="relative z-10 object-contain drop-shadow-sm dark:hidden select-none"
          style={{ maxHeight: typeof size === 'number' ? size : size === 'hero' ? 140 : size === 'xl' ? 90 : size === 'lg' ? 70 : 54 }}
        />
        {/* Dark mode version */}
        <img
          src="/samnya-logo-dark.png"
          alt={alt}
          className="relative z-10 object-contain drop-shadow-sm hidden dark:block select-none"
          style={{ maxHeight: typeof size === 'number' ? size : size === 'hero' ? 140 : size === 'xl' ? 90 : size === 'lg' ? 70 : 54 }}
        />
      </div>
    );
  }

  // 3. Wordmark Only
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
          SAMNYA
        </span>
        {badge && (
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            {badge}
          </span>
        )}
      </div>
    );
  }

  // 4. Combo: Icon + SAMNYA Text (+ optional Subtitle and Badge)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {glow && (
          <div className="absolute inset-0 bg-blue-500/30 dark:bg-teal-400/25 rounded-2xl blur-md scale-110 pointer-events-none" />
        )}
        <img
          src="/samnya-icon.png"
          alt={alt}
          width={dim.width}
          height={dim.height}
          className={`relative z-10 object-contain drop-shadow-sm select-none ${dim.imgClass || ''}`}
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${
            size === 'sm' || size === 'xs' ? 'text-lg' : size === 'lg' || size === 'xl' || size === 'hero' ? 'text-2xl sm:text-3xl' : 'text-xl'
          }`}>
            SAMNYA
          </span>
          {badge && (
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              {badge}
            </span>
          )}
        </div>
        {showSubtitle && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  );
};
