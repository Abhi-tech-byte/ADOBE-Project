import { BrandKit, SocialTemplate } from "./types";

// Default Brand Kits
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
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png"
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
        }
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
        }
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
