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
            { id: "adobe-logo-white", name: "Logo (White)", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/200px-Adobe_Systems_logo_and_wordmark.svg.png" },
            { id: "adobe-icon", name: "Icon", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Adobe_PDF_icon.svg/100px-Adobe_PDF_icon.svg.png" },
            { id: "adobe-creative", name: "Creative Cloud", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/100px-Adobe_Creative_Cloud_rainbow_icon.svg.png" }
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
            { id: "google-g", name: "G Logo", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/100px-Google_%22G%22_logo.svg.png" },
            { id: "google-drive", name: "Drive Icon", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/100px-Google_Drive_icon_%282020%29.svg.png" },
            { id: "google-maps", name: "Maps Icon", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Google_Maps_icon.svg/100px-Google_Maps_icon.svg.png" }
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
            { id: "ms-windows", name: "Windows Logo", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Windows_logo_-_2021.svg/100px-Windows_logo_-_2021.svg.png" },
            { id: "ms-office", name: "Office Icon", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Microsoft_Office_logo_%282013%E2%80%932019%29.svg/100px-Microsoft_Office_logo_%282013%E2%80%932019%29.svg.png" },
            { id: "ms-teams", name: "Teams Icon", type: "icon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/100px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png" }
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
        platform: "Twitter/X",
        name: "Twitter Post",
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
