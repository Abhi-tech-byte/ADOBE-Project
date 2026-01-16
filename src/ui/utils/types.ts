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

export interface BrandAsset {
    id: string;
    name: string;
    type: 'image' | 'icon' | 'pattern';
    url: string;
}

export interface BrandKit {
    id: string;
    name: string;
    colors: BrandColors;
    logoUrl?: string;
    contactInfo?: ContactInfo;
    socialLinks?: SocialLinks;
    assets?: BrandAsset[];
}

export interface SocialTemplate {
    id: string;
    platform: string;
    name: string;
    width: number;
    height: number;
    icon: string;
}

// Serialized element data for saving canvas state
export interface SerializedElement {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill?: { red: number; green: number; blue: number; alpha: number };
    stroke?: { red: number; green: number; blue: number; alpha: number; width: number };
    opacity?: number;
    // For text elements
    text?: string;
    // For images (base64 or URL reference)
    imageRef?: string;
}

// Image reference for reloading
export interface SavedImageRef {
    url: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SavedTemplate {
    id: string;
    name: string;
    brandKitId: string;
    platform: string;
    createdAt: string;
    // Canvas data
    pageWidth?: number;
    pageHeight?: number;
    elements?: SerializedElement[];
    // Images that need to be reloaded from URLs
    images?: SavedImageRef[];
    // Brand logo URL if used
    logoUrl?: string;
    // Canvas snapshot as base64 PNG (for full canvas save)
    snapshot?: string;
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
