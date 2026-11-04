import React from 'react';

// Ornement d'angle Fileteado Porteño doré
export const FileteadoCorner: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({ position = 'top-left', className = 'w-6 h-6 text-amber-400/70' }) => {
  const transforms: Record<string, string> = {
    'top-left': '',
    'top-right': 'scale(-1, 1)',
    'bottom-left': 'scale(1, -1)',
    'bottom-right': 'scale(-1, -1)',
  };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: transforms[position] }}
    >
      {/* Filet d'angle principal */}
      <path
        d="M2 38V12C2 6.47715 6.47715 2 12 2H38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Filet interne fin */}
      <path
        d="M6 34V14C6 9.58172 9.58172 6 14 6H34"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
      {/* Volute baroque / feuille d'acanthe simplifiée */}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M2 18C5 18 8 16 8 12C8 8 5 6 2 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M18 2C18 5 16 8 12 8C8 8 6 5 6 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Séparateur filigrane ornemental de milonga
export const FileteadoDivider: React.FC<{ className?: string; label?: string }> = ({
  className = 'my-4',
  label,
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#d4af37]" />
      <div className="flex items-center gap-1.5 text-[#d4af37]">
        <span className="text-[10px]">❦</span>
        <span className="text-xs">◆</span>
        {label && (
          <span className="font-display font-semibold tracking-wide text-xs px-2 uppercase text-[#f5d77f]">
            {label}
          </span>
        )}
        <span className="text-xs">◆</span>
        <span className="text-[10px] scale-x-[-1] inline-block">❦</span>
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#d4af37]/60 to-[#d4af37]" />
    </div>
  );
};

// Sceau officiel "Buenos Aires 1950 - Época de Oro"
export const TangoSeal: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full border-2 border-[#d4af37] bg-gradient-to-b from-[#2a1713] to-[#120b0a] flex items-center justify-center shadow-lg shadow-black/80 flex-shrink-0 ${className}`}
    >
      <div className="absolute inset-1 rounded-full border border-dashed border-[#d4af37]/50" />
      <div className="text-center">
        <span className="text-[8px] tracking-widest block font-bold text-[#f5d77f] uppercase">
          1950
        </span>
        <span className="text-sm block">🪗</span>
        <span className="text-[7px] tracking-tighter block text-[#d4af37] font-semibold uppercase">
          ORO
        </span>
      </div>
    </div>
  );
};

// Icône de Bandoneón stylisée
export const BandoneonIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5 text-[#d4af37]',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Soufflet en losanges */}
      <rect x="2" y="5" width="5" height="14" rx="1.5" />
      <rect x="17" y="5" width="5" height="14" rx="1.5" />
      <path d="M7 6l2.5 3L7 12l2.5 3L7 18" />
      <path d="M9.5 6l2.5 3L9.5 12l2.5 3L9.5 18" />
      <path d="M12 6l2.5 3L12 12l2.5 3L12 18" />
      <path d="M14.5 6l2.5 3L14.5 12l2.5 3L14.5 18" />
    </svg>
  );
};
