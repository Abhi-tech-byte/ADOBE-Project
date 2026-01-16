// BrandFlow Types

export interface BrandColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface BrandKit {
    id: string;
    name: string;
    colors: BrandColors;
    logoUrl?: string;
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
    createdAt: string;
}

// Color utility type
export interface RGBAColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
