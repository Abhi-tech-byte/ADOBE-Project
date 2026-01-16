import { BrandKit, SocialTemplate } from "./types";

// Default Brand Kits with full info
export const DEFAULT_BRAND_KITS: BrandKit[] = [
    {
        id: "adobe",
        name: "Adobe",
        colors: {
            primary: "#FF0000",
            secondary: "#2C2C2C",
            accent: "#FFD700",
            background: "#FFFFFF",
            text: "#323232"
        },
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.png/200px-Adobe_Corporate_Logo.png",
        contactInfo: {
            email: "contact@adobe.com",
            website: "https://www.adobe.com",
            phone: "+1 (408) 536-6000",
            address: "345 Park Avenue, San Jose, CA 95110"
        },
        socialLinks: {
            instagram: "@adobe",
            twitter: "@Adobe",
            linkedin: "adobe",
            facebook: "Adobe",
            youtube: "Adobe"
        },
        assets: [
            { id: "adobe-logo-white", name: "Logo", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.png/200px-Adobe_Corporate_Logo.png" },
            { id: "adobe-icon", name: "PDF Icon", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/337/337946.png" },
            { id: "adobe-creative", name: "Creative Cloud", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/5968/5968428.png" },
            { id: "adobe-copyright", name: "© Copyright", type: "icon", url: "TEXT:© Adobe Inc." }
        ]
    },
    {
        id: "google",
        name: "Google",
        colors: {
            primary: "#4285F4",
            secondary: "#34A853",
            accent: "#FBBC05",
            background: "#FFFFFF",
            text: "#202124"
        },
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png",
        contactInfo: {
            email: "press@google.com",
            website: "https://www.google.com",
            address: "1600 Amphitheatre Parkway, Mountain View, CA"
        },
        socialLinks: {
            instagram: "@google",
            twitter: "@Google",
            linkedin: "google",
            facebook: "Google",
            youtube: "Google"
        },
        assets: [
            { id: "google-g", name: "G Logo", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/2991/2991148.png" },
            { id: "google-drive", name: "Drive Icon", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/5968/5968523.png" },
            { id: "google-maps", name: "Maps Icon", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/2991/2991110.png" },
            { id: "google-copyright", name: "© Copyright", type: "icon", url: "TEXT:© Google LLC" }
        ]
    },
    {
        id: "microsoft",
        name: "Microsoft",
        colors: {
            primary: "#00A4EF",
            secondary: "#7FBA00",
            accent: "#FFB900",
            background: "#FFFFFF",
            text: "#2B2B2B"
        },
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png",
        contactInfo: {
            email: "contact@microsoft.com",
            website: "https://www.microsoft.com",
            phone: "+1 (425) 882-8080",
            address: "One Microsoft Way, Redmond, WA 98052"
        },
        socialLinks: {
            instagram: "@microsoft",
            twitter: "@Microsoft",
            linkedin: "microsoft",
            facebook: "Microsoft",
            youtube: "Microsoft"
        },
        assets: [
            { id: "ms-windows", name: "Windows Logo", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/732/732225.png" },
            { id: "ms-office", name: "Office Icon", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/732/732221.png" },
            { id: "ms-teams", name: "Teams Icon", type: "icon", url: "https://cdn-icons-png.flaticon.com/128/906/906349.png" },
            { id: "ms-copyright", name: "© Copyright", type: "icon", url: "TEXT:© Microsoft Corp." }
        ]
    }
];

// Social Media Templates
export const SOCIAL_TEMPLATES: SocialTemplate[] = [
    {
        id: "ig-post",
        platform: "Instagram",
        name: "Instagram Post",
        width: 1080,
        height: 1080,
        icon: "📸"
    },
    {
        id: "ig-story",
        platform: "Instagram",
        name: "Instagram Story",
        width: 1080,
        height: 1920,
        icon: "📱"
    },
    {
        id: "twitter",
        platform: "X",
        name: "X Post",
        width: 1200,
        height: 675,
        icon: "🐦"
    },
    {
        id: "linkedin",
        platform: "LinkedIn",
        name: "LinkedIn Post",
        width: 1200,
        height: 627,
        icon: "💼"
    },
    {
        id: "facebook",
        platform: "Facebook",
        name: "Facebook Post",
        width: 1200,
        height: 630,
        icon: "📘"
    },
    {
        id: "youtube",
        platform: "YouTube",
        name: "YouTube Thumbnail",
        width: 1280,
        height: 720,
        icon: "▶️"
    }
];

// Brand guidelines for compliance checking
export const BRAND_GUIDELINES = {
    minLogoSize: 50, // minimum logo size in pixels
    maxLogoSize: 300, // maximum logo size in pixels
    minContrastRatio: 4.5, // WCAG AA standard
    requiredElements: ['logo', 'brandColor'],
    forbiddenColors: [] as string[], // Colors that should never be used
};
