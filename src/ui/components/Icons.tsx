// SVG Icons for BrandFlow
import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const CanvasIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M3 9h18M9 3v18" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    </svg>
);

export const CustomizeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill={color}/>
    </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill={color} stroke={color} strokeWidth="0.5"/>
    </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill={color} stroke={color} strokeWidth="0.5"/>
    </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({ size = 24, color = '#0077B5', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <rect x="2" y="2" width="20" height="20" rx="4" fill={color}/>
        <path d="M8 9.5h-1.5v7H8v-7zM7.25 8.5c.48 0 .87-.39 .87-.87s-.39-.87-.87-.87-.87.39-.87.87.39.87.87.87zM17 9.5h-1.5v3.75c0 .88-.02 2-1.22 2-1.2 0-1.39-.94-1.39-1.91V9.5h-1.5v7h1.5v-.97h.02c.35.67 1.21 1.38 2.49 1.38 2.67 0 3.1-1.75 3.1-4.03V9.5z" fill="#ffffff"/>
    </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const YouTubeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill={color}/>
    </svg>
);

export const LogoIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill={color} opacity="0.8"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
);

export const AssetIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M9 9h6v6H9z" fill={color} opacity="0.3"/>
        <circle cx="8" cy="8" r="1.5" fill={color}/>
    </svg>
);

export const ContactIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
);

export const ColorIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <circle cx="12" cy="12" r="8" fill={color} opacity="0.2" stroke={color} strokeWidth="2"/>
        <path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const CopyrightIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M14 9.75a3 3 0 100 4.5M10 9.75a3 3 0 110 4.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const StoryIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
        <rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);
