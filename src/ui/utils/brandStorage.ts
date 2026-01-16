import { BrandKit, SavedTemplate } from "./types";
import { DEFAULT_BRAND_KITS } from "./brandData";

const BRAND_KIT_STORAGE_KEY = "brandflow_brand_kits";
const ACTIVE_BRAND_STORAGE_KEY = "brandflow_active_brand";
const TEMPLATES_STORAGE_KEY = "brandflow_saved_templates";

// Brand Kit Storage
export function getAllBrandKits(): BrandKit[] {
    try {
        const stored = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error loading brand kits:", e);
    }
    // Return defaults if nothing stored
    return [...DEFAULT_BRAND_KITS];
}

export function saveBrandKits(kits: BrandKit[]): void {
    try {
        localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(kits));
    } catch (e) {
        console.error("Error saving brand kits:", e);
    }
}

export function getActiveBrandKit(): BrandKit {
    try {
        const activeId = localStorage.getItem(ACTIVE_BRAND_STORAGE_KEY);
        const kits = getAllBrandKits();
        if (activeId) {
            const found = kits.find(k => k.id === activeId);
            if (found) return found;
        }
        return kits[0]; // Default to first kit
    } catch (e) {
        console.error("Error getting active brand:", e);
        return DEFAULT_BRAND_KITS[0];
    }
}

export function setActiveBrandKit(id: string): void {
    try {
        localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, id);
    } catch (e) {
        console.error("Error setting active brand:", e);
    }
}

export function addBrandKit(kit: BrandKit): void {
    const kits = getAllBrandKits();
    kits.push(kit);
    saveBrandKits(kits);
}

export function updateBrandKit(updatedKit: BrandKit): void {
    const kits = getAllBrandKits();
    const index = kits.findIndex(k => k.id === updatedKit.id);
    if (index >= 0) {
        kits[index] = updatedKit;
        saveBrandKits(kits);
    }
}

export function deleteBrandKit(id: string): void {
    let kits = getAllBrandKits();
    kits = kits.filter(k => k.id !== id);
    saveBrandKits(kits);
}

// Saved Templates Storage (Manual save only - not auto-save)
export function getSavedTemplates(): SavedTemplate[] {
    try {
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error loading templates:", e);
    }
    return [];
}

export function saveTemplate(template: SavedTemplate): void {
    const templates = getSavedTemplates();
    // Check if template with same name exists, update it
    const existingIndex = templates.findIndex(t => t.name === template.name);
    if (existingIndex >= 0) {
        templates[existingIndex] = template;
    } else {
        templates.push(template);
    }
    try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
        console.error("Error saving template:", e);
    }
}

export function deleteTemplate(id: string): void {
    let templates = getSavedTemplates();
    templates = templates.filter(t => t.id !== id);
    try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
        console.error("Error deleting template:", e);
    }
}

export function clearAllTemplates(): void {
    try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
        console.error("Error clearing templates:", e);
    }
}

// Color utility functions
export function hexToRgba(hex: string, alpha: number = 1): { red: number; green: number; blue: number; alpha: number } {
    // Remove # if present
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
    return { red: r, green: g, blue: b, alpha };
}

export function rgbaToHex(color: { red: number; green: number; blue: number }): string {
    const r = Math.round(color.red * 255).toString(16).padStart(2, "0");
    const g = Math.round(color.green * 255).toString(16).padStart(2, "0");
    const b = Math.round(color.blue * 255).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`.toUpperCase();
}

// Check if a color matches any brand color
export function isColorOnBrand(color: { red: number; green: number; blue: number }, brandColors: string[], tolerance: number = 0.05): boolean {
    return brandColors.some(brandHex => {
        const brandRgba = hexToRgba(brandHex);
        return Math.abs(color.red - brandRgba.red) < tolerance &&
               Math.abs(color.green - brandRgba.green) < tolerance &&
               Math.abs(color.blue - brandRgba.blue) < tolerance;
    });
}

// Get contrast ratio between two colors (for accessibility)
export function getContrastRatio(color1: { red: number; green: number; blue: number }, color2: { red: number; green: number; blue: number }): number {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: { red: number; green: number; blue: number }): number {
    const r = color.red <= 0.03928 ? color.red / 12.92 : Math.pow((color.red + 0.055) / 1.055, 2.4);
    const g = color.green <= 0.03928 ? color.green / 12.92 : Math.pow((color.green + 0.055) / 1.055, 2.4);
    const b = color.blue <= 0.03928 ? color.blue / 12.92 : Math.pow((color.blue + 0.055) / 1.055, 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
