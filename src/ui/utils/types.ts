// BrandFlow Types

export interface BrandColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface ContactInfo {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
}

export interface SocialLinks {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
}

export interface BrandKit {
    id: string;
    name: string;
    colors: BrandColors;
    logoUrl?: string;
    contactInfo?: ContactInfo;
    socialLinks?: SocialLinks;
}

export interface SocialTemplate {
    id: string;
    platform: string;
    name: string;
    width: number;
    height: number;
    icon: string;
}

export interface SavedTemplate {
    id: string;
    name: string;
    brandKitId: string;
    platform: string;
    createdAt: string;
}

// Color utility type
export interface RGBAColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

// Compliance check result
export interface ComplianceIssue {
    type: 'color' | 'logo' | 'text' | 'size';
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
}

export interface ComplianceResult {
    isCompliant: boolean;
    score: number; // 0-100
    issues: ComplianceIssue[];
}
