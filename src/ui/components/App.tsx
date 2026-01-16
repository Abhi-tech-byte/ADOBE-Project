// BrandFlow - Enterprise Brand Studio for Adobe Express
// Main App Component with all features

import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useEffect } from "react";
import { BrandKit, SocialTemplate, SavedTemplate, ComplianceResult, ComplianceIssue, BrandAsset, SavedImageRef } from "../utils/types";
import { SOCIAL_TEMPLATES } from "../utils/brandData";
import {
    getAllBrandKits,
    getActiveBrandKit,
    setActiveBrandKit,
    hexToRgba,
    getSavedTemplates,
    saveTemplate,
    deleteTemplate,
    clearAllTemplates,
    rgbaToHex
} from "../utils/brandStorage";
import "./App.css";

import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

// Sandbox API interface
interface RGBAColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

interface DocumentSandboxApi {
    createBrandedPost(params: any): void;
    applyColorToSelection(color: RGBAColor): any;
    createRectangle(color: RGBAColor): any;
    resizeCurrentPage(width: number, height: number): void;
    getSelectionInfo(): any[];
    getCurrentPageDimensions(): { width: number; height: number };
    checkBrandCompliance(brandColors: RGBAColor[]): any[];
    createContactText(text: string, color: RGBAColor, positionY: number): any;
    createFooterText(contactInfo: { email?: string; phone?: string; website?: string }, textColor: RGBAColor): any;
    captureCanvasElements(): { pageWidth: number; pageHeight: number; elements: any[]; imageCount?: number };
    recreateCanvasElements(data: { pageWidth: number; pageHeight: number; elements: any[] }): any;
}

type TabType = "brand" | "social" | "templates" | "compliance";

interface AppProps {
    addOnUISdk: typeof addOnUISdk;
    sandboxProxy: DocumentSandboxApi;
}

const App = ({ addOnUISdk, sandboxProxy }: AppProps) => {
    // State
    const [activeTab, setActiveTab] = useState<TabType>("brand");
    const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
    const [activeBrand, setActiveBrand] = useState<BrandKit | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);
    const [lastCreatedPlatform, setLastCreatedPlatform] = useState<string | null>(null);
    const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [templateNameInput, setTemplateNameInput] = useState("");
    const [addedImages, setAddedImages] = useState<SavedImageRef[]>([]);

    // Load data on mount
    useEffect(() => {
        const kits = getAllBrandKits();
        setBrandKits(kits);
        const active = getActiveBrandKit();
        setActiveBrand(active);
        setSavedTemplates(getSavedTemplates());
    }, []);

    // Show status message temporarily
    const showStatus = (type: "success" | "info" | "error", text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    // Handle brand kit change
    const handleBrandChange = (brandId: string) => {
        const brand = brandKits.find(b => b.id === brandId);
        if (brand) {
            setActiveBrand(brand);
            setActiveBrandKit(brandId);
            showStatus("success", `Switched to ${brand.name} brand`);
        }
    };

    // Handle color click - select
    const handleColorClick = (colorKey: string, colorHex: string) => {
        setSelectedColor(colorKey);
        showStatus("info", `${colorKey}: ${colorHex}`);
    };

    // Apply selected color to selection
    const handleApplyColor = async () => {
        if (selectedColor && activeBrand) {
            const colorHex = activeBrand.colors[selectedColor as keyof typeof activeBrand.colors];
            const rgba = hexToRgba(colorHex);
            const result = await sandboxProxy.applyColorToSelection(rgba);
            if (result?.success) {
                showStatus("success", `Applied ${selectedColor} to ${result.count} element(s)`);
            } else {
                showStatus("error", "Select an element first!");
            }
        }
    };

    // Create social post with NEW PAGE
    const handleCreatePost = async (template: SocialTemplate) => {
        if (!activeBrand) return;

        // Reset tracked images for new design
        setAddedImages([]);

        const params = {
            width: template.width,
            height: template.height,
            backgroundColor: hexToRgba(activeBrand.colors.background),
            accentColor: hexToRgba(activeBrand.colors.primary),
            secondaryColor: hexToRgba(activeBrand.colors.secondary),
            platformName: template.name
        };

        await sandboxProxy.createBrandedPost(params);
        setLastCreatedPlatform(template.name);
        showStatus("success", `Created ${template.name} (${template.width}×${template.height})!`);

        // Add logo if available and track it
        if (activeBrand.logoUrl) {
            try {
                const response = await fetch(activeBrand.logoUrl);
                const logoBlob = await response.blob();
                await addOnUISdk.app.document.addImage(logoBlob, {
                    title: `${activeBrand.name} Logo`
                });
                
                // Track the logo for saving
                setAddedImages(prev => [...prev, {
                    url: activeBrand.logoUrl!,
                    name: `${activeBrand.name} Logo`,
                    x: 20,
                    y: 20,
                    width: 100,
                    height: 100
                }]);
                
                showStatus("success", `Created ${template.name} with ${activeBrand.name} logo!`);
            } catch (e) {
                console.log("Could not load logo, continuing without it");
            }
        }
    };

    // Open save template modal
    const handleOpenSaveModal = () => {
        if (!activeBrand) {
            showStatus("error", "Select a brand kit first!");
            return;
        }
        // Generate a default name based on current state
        const defaultName = lastCreatedPlatform 
            ? `${activeBrand.name} - ${lastCreatedPlatform}`
            : `${activeBrand.name} - Custom Design`;
        setTemplateNameInput(defaultName);
        setShowSaveModal(true);
    };

    // Actually save the template with editable canvas elements
    const handleSaveTemplate = async () => {
        if (!activeBrand || !templateNameInput.trim()) {
            showStatus("error", "Please enter a template name!");
            return;
        }

        try {
            showStatus("info", "Capturing canvas elements...");
            
            // Capture all elements on the current canvas
            const canvasData = await sandboxProxy.captureCanvasElements();

        const newTemplate: SavedTemplate = {
                id: `template_${Date.now()}`,
                name: templateNameInput.trim(),
            brandKitId: activeBrand.id,
                platform: lastCreatedPlatform || "Custom Design",
                createdAt: new Date().toISOString(),
                // Store the actual canvas data
                pageWidth: canvasData.pageWidth,
                pageHeight: canvasData.pageHeight,
                elements: canvasData.elements,
                // Store tracked images for reloading
                images: addedImages.length > 0 ? [...addedImages] : undefined,
                // Store brand logo URL
                logoUrl: activeBrand.logoUrl
            };
            
        saveTemplate(newTemplate);
            
            // Refresh the templates list
            const updatedTemplates = getSavedTemplates();
            setSavedTemplates(updatedTemplates);
            
            // Close modal and show success
            setShowSaveModal(false);
            setTemplateNameInput("");
            
            // Build success message
            let msg = `Saved "${newTemplate.name}" with ${canvasData.elements.length} elements`;
            if (addedImages.length > 0) {
                msg += ` and ${addedImages.length} images`;
            }
            msg += "!";
            
            showStatus("success", msg);
            
            // Auto-switch to Saved tab to show it worked
            setActiveTab("templates");
        } catch (error) {
            console.error("Error saving template:", error);
            showStatus("error", "Failed to save template");
        }
    };

    // Cancel save modal
    const handleCancelSave = () => {
        setShowSaveModal(false);
        setTemplateNameInput("");
    };

    // Helper to add delay for context sync
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper to load images onto canvas from URLs
    const loadImagesToCanvas = async (images: SavedImageRef[], logoUrl?: string) => {
        let loadedImages = 0;
        const newTrackedImages: SavedImageRef[] = [];
        
        // Load saved images
        if (images && images.length > 0) {
            for (const imgRef of images) {
                try {
                    const response = await fetch(imgRef.url);
                    const blob = await response.blob();
                    await addOnUISdk.app.document.addImage(blob, {
                        title: imgRef.name
                    });
                    loadedImages++;
                    newTrackedImages.push(imgRef);
                    // Small delay between images to ensure proper context
                    await delay(100);
                } catch (e) {
                    console.log(`Could not load image: ${imgRef.name}`, e);
                }
            }
        }
        
        // Load logo if no other images and logo URL exists
        if (loadedImages === 0 && logoUrl) {
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                await addOnUISdk.app.document.addImage(blob, {
                    title: "Brand Logo"
                });
                loadedImages++;
                newTrackedImages.push({
                    url: logoUrl,
                    name: "Brand Logo",
                    x: 20, y: 20, width: 100, height: 100
                });
            } catch (e) {
                console.log("Could not load logo", e);
            }
        }
        
        return { loadedImages, newTrackedImages };
    };

    // Load a saved template onto canvas - recreates all saved elements AND images
    const handleLoadTemplate = async (savedTemplate: SavedTemplate) => {
        // Reset tracked images
        setAddedImages([]);
        
        // Check if template has saved canvas data
        if (savedTemplate.elements && savedTemplate.elements.length > 0 && savedTemplate.pageWidth && savedTemplate.pageHeight) {
            // Recreate from saved canvas data
            showStatus("info", "Loading template elements...");
            
            try {
                const result = await sandboxProxy.recreateCanvasElements({
                    pageWidth: savedTemplate.pageWidth,
                    pageHeight: savedTemplate.pageHeight,
                    elements: savedTemplate.elements
                });
                
                setLastCreatedPlatform(savedTemplate.platform);
                
                // Wait for the new page to be ready before adding images
                await delay(300);
                
                // Load URL-tracked images (from brand assets)
                showStatus("info", "Loading images...");
                const { loadedImages, newTrackedImages } = await loadImagesToCanvas(
                    savedTemplate.images || [],
                    savedTemplate.logoUrl
                );
                
                setAddedImages(newTrackedImages);
                
                const msg = loadedImages > 0
                    ? `Loaded "${savedTemplate.name}" with ${result.recreatedCount} elements and ${loadedImages} images!`
                    : `Loaded "${savedTemplate.name}" with ${result.recreatedCount} elements!`;
                showStatus("success", msg);
                
            } catch (error) {
                console.error("Error loading template:", error);
                showStatus("error", "Failed to load template");
            }
        } else {
            // Fallback: Old templates without canvas data - recreate basic template
            const socialTemplate = SOCIAL_TEMPLATES.find(t => t.name === savedTemplate.platform);
            
            // Find the brand kit used for this template
            const templateBrand = brandKits.find(b => b.id === savedTemplate.brandKitId);
            const brandToUse = templateBrand || activeBrand;
            
            if (!brandToUse) {
                showStatus("error", "No brand kit available");
                return;
            }

            if (socialTemplate) {
                // Create the post with the template's settings
                const params = {
                    width: socialTemplate.width,
                    height: socialTemplate.height,
                    backgroundColor: hexToRgba(brandToUse.colors.background),
                    accentColor: hexToRgba(brandToUse.colors.primary),
                    secondaryColor: hexToRgba(brandToUse.colors.secondary),
                    platformName: socialTemplate.name
                };

                await sandboxProxy.createBrandedPost(params);
                setLastCreatedPlatform(socialTemplate.name);
                
                // Wait for page to be ready
                await delay(300);

                // Load images
                const logoUrl = savedTemplate.logoUrl || brandToUse.logoUrl;
                const { loadedImages, newTrackedImages } = await loadImagesToCanvas(
                    savedTemplate.images || [],
                    logoUrl
                );
                
                setAddedImages(newTrackedImages);
                
                if (loadedImages > 0) {
                    showStatus("success", `Loaded "${savedTemplate.name}" with ${loadedImages} images!`);
                } else {
                    showStatus("success", `Loaded "${savedTemplate.name}" (basic template)`);
                }
            } else {
                showStatus("error", "This template has no saved canvas data");
            }
        }
    };

    // Delete saved template
    const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteTemplate(id);
        setSavedTemplates(getSavedTemplates());
        showStatus("info", "Template removed");
    };

    // Clear all saved templates
    const handleClearAllTemplates = () => {
        if (savedTemplates.length === 0) {
            showStatus("info", "No templates to clear");
            return;
        }
        clearAllTemplates();
        setSavedTemplates([]);
        showStatus("success", "All templates cleared!");
    };

    // Quick action: Create rectangle with primary color
    const handleQuickRectangle = () => {
        if (!activeBrand) return;
        sandboxProxy.createRectangle(hexToRgba(activeBrand.colors.primary));
        showStatus("success", "Created branded rectangle");
    };

    // Run brand compliance check
    const handleComplianceCheck = async () => {
        if (!activeBrand) {
            showStatus("error", "Select a brand kit first!");
            return;
        }

        setIsChecking(true);
        setComplianceResult(null);

        try {
            // Get all brand colors as RGBA
            const brandColors = Object.values(activeBrand.colors).map(hex => hexToRgba(hex));
            
            // Check compliance via sandbox
            const results = await sandboxProxy.checkBrandCompliance(brandColors);
            
            // Build compliance result
            const issues: ComplianceIssue[] = [];
            let onBrandCount = 0;
            let offBrandCount = 0;

            for (const result of results) {
                if (result.isOnBrand) {
                    onBrandCount++;
                } else {
                    offBrandCount++;
                    issues.push({
                        type: 'color',
                        severity: 'warning',
                        message: `Element uses off-brand color: ${rgbaToHex(result.color)}`,
                        suggestion: `Consider using one of your brand colors`
                    });
                }
            }

            // Check if logo might be missing
            if (results.length === 0) {
                issues.push({
                    type: 'logo',
                    severity: 'warning',
                    message: 'No elements selected to check',
                    suggestion: 'Select elements on the canvas to check compliance'
                });
            }

            const totalElements = onBrandCount + offBrandCount;
            const score = totalElements > 0 ? Math.round((onBrandCount / totalElements) * 100) : 0;

            setComplianceResult({
                isCompliant: issues.filter(i => i.severity === 'error').length === 0 && score >= 80,
                score,
                issues
            });

        } catch (e) {
            console.error("Compliance check error:", e);
            showStatus("error", "Error checking compliance");
        } finally {
            setIsChecking(false);
        }
    };

    // Add contact info to footer
    const handleAddContactToFooter = async () => {
        if (!activeBrand || !activeBrand.contactInfo) {
            showStatus("error", "No contact info available");
            return;
        }

        try {
            const textColor = hexToRgba(activeBrand.colors.text);
            const result = await sandboxProxy.createFooterText(activeBrand.contactInfo, textColor);
            
            if (result?.success) {
                showStatus("success", "Added contact info to footer!");
            } else {
                showStatus("error", result?.message || "Could not add contact info");
            }
        } catch (e) {
            console.error("Error adding contact to footer:", e);
            showStatus("error", "Error adding contact info");
        }
    };

    // Add brand logo to canvas
    const handleAddLogo = async () => {
        if (!activeBrand || !activeBrand.logoUrl) {
            showStatus("error", "No logo available for this brand");
            return;
        }
        
        try {
            const response = await fetch(activeBrand.logoUrl);
            const blob = await response.blob();
            await addOnUISdk.app.document.addImage(blob, {
                title: `${activeBrand.name} Logo`
            });
            
            // Track the logo for saving
            setAddedImages(prev => [...prev, {
                url: activeBrand.logoUrl!,
                name: `${activeBrand.name} Logo`,
                x: 20,
                y: 20,
                width: 100,
                height: 100
            }]);
            
            showStatus("success", `Added ${activeBrand.name} logo to canvas!`);
        } catch (e) {
            console.error("Error adding logo:", e);
            showStatus("error", "Could not load logo");
        }
    };

    // Add brand asset to canvas and track it for saving
    const handleAddAsset = async (asset: BrandAsset) => {
        try {
            // Handle TEXT: prefix for copyright/text elements
            if (asset.url.startsWith("TEXT:")) {
                const textContent = asset.url.replace("TEXT:", "");
                const textColor = activeBrand ? hexToRgba(activeBrand.colors.text) : { red: 0, green: 0, blue: 0, alpha: 1 };
                await sandboxProxy.createContactText(textContent, textColor, 0);
                showStatus("success", `Added "${textContent}" to canvas!`);
                return;
            }
            
            const response = await fetch(asset.url);
            const blob = await response.blob();
            await addOnUISdk.app.document.addImage(blob, {
                title: asset.name
            });
            
            // Track the asset for saving
            setAddedImages(prev => [...prev, {
                url: asset.url,
                name: asset.name,
                x: 100,
                y: 100,
                width: 100,
                height: 100
            }]);
            
            showStatus("success", `Added "${asset.name}" to canvas!`);
        } catch (e) {
            console.error("Error adding asset:", e);
            showStatus("error", `Could not load ${asset.name}`);
        }
    };

    // Render Brand Kit Tab
    const renderBrandTab = () => (
        <div>
            {/* Brand Selector */}
            <div className="brand-selector">
                <label>Active Brand Kit</label>
                <select
                    value={activeBrand?.id || ""}
                    onChange={(e) => handleBrandChange(e.target.value)}
                >
                    {brandKits.map(brand => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Brand Info Card */}
            {activeBrand && (
                <div className="brand-info-card">
                    <div className="brand-info-header">
                        <div
                            className="brand-logo-placeholder"
                            style={{ backgroundColor: activeBrand.colors.primary }}
                        >
                            {activeBrand.logoUrl ? (
                                <img 
                                    src={activeBrand.logoUrl} 
                                    alt={activeBrand.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                activeBrand.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <div className="brand-name-display">{activeBrand.name}</div>
                            {activeBrand.logoUrl && (
                                <div style={{ fontSize: '10px', color: '#6BCB77' }}>✓ Logo loaded</div>
                            )}
                        </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="color-section">
                        <div className="section-title">Brand Colors</div>
                        <div className="color-grid">
                            {Object.entries(activeBrand.colors).map(([key, value]) => (
                                <div key={key} className="color-swatch-container">
                                    <div
                                        className={`color-swatch ${selectedColor === key ? 'selected' : ''}`}
                                        style={{ backgroundColor: value }}
                                        onClick={() => handleColorClick(key, value)}
                                        title={`${key}: ${value}`}
                                    />
                                    <span className="color-label">{key}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Apply Button */}
                    <button
                        className="apply-button"
                        onClick={handleApplyColor}
                        disabled={!selectedColor}
                    >
                        {selectedColor ? `Apply ${selectedColor} to Selection` : "Select a Color"}
                    </button>

                    {/* Contact Info */}
                    {activeBrand.contactInfo && (
                        <div className="info-section">
                            <div className="section-title">Contact Info</div>
                            <div className="info-list">
                                {activeBrand.contactInfo.email && (
                                    <div className="info-item">📧 {activeBrand.contactInfo.email}</div>
                                )}
                                {activeBrand.contactInfo.website && (
                                    <div className="info-item">🌐 {activeBrand.contactInfo.website}</div>
                                )}
                                {activeBrand.contactInfo.phone && (
                                    <div className="info-item">📞 {activeBrand.contactInfo.phone}</div>
                                )}
                            </div>
                            <button 
                                className="add-footer-btn"
                                onClick={handleAddContactToFooter}
                            >
                                📋 Add Contact to Footer
                            </button>
                        </div>
                    )}

                    {/* Brand Assets */}
                    {activeBrand.assets && activeBrand.assets.length > 0 && (
                        <div className="info-section">
                            <div className="section-title">Brand Assets</div>
                            <div className="assets-grid">
                                {activeBrand.assets.map(asset => (
                                    <div 
                                        key={asset.id} 
                                        className="asset-item"
                                        onClick={() => handleAddAsset(asset)}
                                        title={`Add ${asset.name} to canvas`}
                                    >
                                        {asset.url.startsWith("TEXT:") ? (
                                            <div className="asset-text-icon">©</div>
                                        ) : (
                                            <img 
                                                src={asset.url} 
                                                alt={asset.name}
                                                className="asset-image"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <span className="asset-name">{asset.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {activeBrand.socialLinks && (
                        <div className="info-section">
                            <div className="section-title">Social Media</div>
                            <div className="social-links-grid">
                                {activeBrand.socialLinks.instagram && (
                                    <span className="social-tag">📸 {activeBrand.socialLinks.instagram}</span>
                                )}
                                {activeBrand.socialLinks.twitter && (
                                    <span className="social-tag">🐦 {activeBrand.socialLinks.twitter}</span>
                                )}
                                {activeBrand.socialLinks.linkedin && (
                                    <span className="social-tag">💼 {activeBrand.socialLinks.linkedin}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="quick-actions" style={{ justifyContent: 'center' }}>
                        <button
                            className="quick-action-btn primary"
                            onClick={() => setActiveTab("social")}
                        >
                            📱 Create Branded Post
                        </button>
                    </div>
                    
                    {/* Add Logo Button */}
                    {activeBrand.logoUrl && (
                        <button 
                            className="add-logo-btn"
                            onClick={handleAddLogo}
                        >
                            🏷️ Add {activeBrand.name} Logo to Canvas
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    // Render Social Templates Tab
    const renderSocialTab = () => (
        <div>
            <div className="section-title">
                Create Branded Post
                {activeBrand && <span style={{ color: '#a0a0a0', fontWeight: 'normal' }}> • {activeBrand.name}</span>}
            </div>

            <div className="social-grid">
                {SOCIAL_TEMPLATES.map(template => (
                    <div
                        key={template.id}
                        className="social-card"
                        onClick={() => handleCreatePost(template)}
                    >
                        <div className="social-icon">{template.icon}</div>
                        <div className="social-name">{template.name}</div>
                        <div className="social-size">{template.width} × {template.height}</div>
                    </div>
                ))}
            </div>

            <div className="divider" />

            {/* Save Template Button */}
            <button 
                className="save-template-btn"
                onClick={handleOpenSaveModal}
            >
                💾 Save Current Canvas as Template
            </button>

            <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '8px', textAlign: 'center' }}>
                Saves editable elements - continue editing after load!
                {addedImages.length > 0 && (
                    <span style={{ color: '#6BCB77' }}> + {addedImages.length} image(s)</span>
                )}
            </div>
        </div>
    );

    // Render Templates Tab
    const renderTemplatesTab = () => (
        <div>
            <div className="section-title">Saved Templates</div>
            <p style={{ fontSize: '11px', color: '#a0a0a0', marginBottom: '16px' }}>
                Only your best designs — saved manually
            </p>

            {savedTemplates.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <div className="empty-text">
                        No saved templates yet.<br />
                        Create a post and click "Save as Template"
                    </div>
                </div>
            ) : (
                <>
                    <p style={{ fontSize: '10px', color: '#6BCB77', marginBottom: '12px', textAlign: 'center' }}>
                        👆 Click a template to load it on canvas
                    </p>
                <div className="templates-list">
                    {savedTemplates.slice().reverse().map(template => (
                            <div 
                                key={template.id} 
                                className="template-item clickable"
                                onClick={() => handleLoadTemplate(template)}
                                title="Click to load this template"
                            >
                            <div className="template-info">
                                    <span className="template-icon">
                                        {template.elements && template.elements.length > 0 ? '🎨' : '📄'}
                                    </span>
                                <div>
                                    <div className="template-name">{template.name}</div>
                                    <div className="template-date">
                                        {template.platform} • {new Date(template.createdAt).toLocaleDateString()}
                                            {template.elements && (
                                                <span className="element-count"> • {template.elements.length} elements</span>
                                            )}
                                            {template.images && template.images.length > 0 && (
                                                <span className="image-count"> • {template.images.length} 🖼️</span>
                                            )}
                                        </div>
                                </div>
                            </div>
                            <button
                                className="template-delete"
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                                    title="Delete template"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                    
                    {/* Clear All Button */}
                    <button 
                        className="clear-all-btn"
                        onClick={handleClearAllTemplates}
                    >
                        🗑️ Clear All Templates
                    </button>
                </>
            )}
        </div>
    );

    // Render Compliance Tab
    const renderComplianceTab = () => (
        <div>
            <div className="section-title">Brand Compliance Checker</div>
            <p style={{ fontSize: '11px', color: '#a0a0a0', marginBottom: '16px' }}>
                Verify your design matches brand guidelines
            </p>

            {activeBrand && (
                <div className="compliance-brand-info">
                    <span>Checking against: <strong>{activeBrand.name}</strong></span>
                </div>
            )}

            <button 
                className="check-compliance-btn"
                onClick={handleComplianceCheck}
                disabled={isChecking || !activeBrand}
            >
                {isChecking ? "⏳ Checking..." : "🔍 Check Selected Elements"}
            </button>

            <p style={{ fontSize: '10px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                Select elements on the canvas, then click Check
            </p>

            {/* Compliance Results */}
            {complianceResult && (
                <div className="compliance-results">
                    {/* Score */}
                    <div className={`compliance-score ${complianceResult.isCompliant ? 'compliant' : 'non-compliant'}`}>
                        <div className="score-number">{complianceResult.score}%</div>
                        <div className="score-label">
                            {complianceResult.isCompliant ? '✓ On Brand' : '⚠ Issues Found'}
                        </div>
                    </div>

                    {/* Issues */}
                    {complianceResult.issues.length > 0 && (
                        <div className="issues-list">
                            <div className="section-title" style={{ marginTop: '16px' }}>Issues</div>
                            {complianceResult.issues.map((issue, index) => (
                                <div key={index} className={`issue-item ${issue.severity}`}>
                                    <div className="issue-icon">
                                        {issue.severity === 'error' ? '❌' : '⚠️'}
                                    </div>
                                    <div className="issue-content">
                                        <div className="issue-message">{issue.message}</div>
                                        {issue.suggestion && (
                                            <div className="issue-suggestion">💡 {issue.suggestion}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {complianceResult.issues.length === 0 && complianceResult.score > 0 && (
                        <div className="all-good">
                            <span>🎉</span> All selected elements are on-brand!
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <Theme system="express" scale="medium" color="dark">
            <div className="brandflow-container">
                {/* Header */}
                <div className="brandflow-header">
                    <div className="brandflow-logo">⚡ BRANDFLOW</div>
                    <div className="brandflow-tagline">Brand to post in 30 seconds</div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'brand' ? 'active' : ''}`}
                        onClick={() => setActiveTab('brand')}
                    >
                        <span className="tab-icon">🎨</span>
                        Brand
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        <span className="tab-icon">📱</span>
                        Social
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        <span className="tab-icon">💾</span>
                        Saved
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'compliance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('compliance')}
                    >
                        <span className="tab-icon">✓</span>
                        Check
                    </button>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`status-message ${statusMessage.type}`}>
                        {statusMessage.type === 'success' ? '✓' : statusMessage.type === 'error' ? '✕' : 'ℹ'} {statusMessage.text}
                    </div>
                )}

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'brand' && renderBrandTab()}
                    {activeTab === 'social' && renderSocialTab()}
                    {activeTab === 'templates' && renderTemplatesTab()}
                    {activeTab === 'compliance' && renderComplianceTab()}
                </div>

                {/* Save Template Modal */}
                {showSaveModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-title">💾 Save Template</div>
                            <p className="modal-subtitle">Give your design a name to save it</p>
                            <input
                                type="text"
                                className="modal-input"
                                value={templateNameInput}
                                onChange={(e) => setTemplateNameInput(e.target.value)}
                                placeholder="Enter template name..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTemplate();
                                    if (e.key === 'Escape') handleCancelSave();
                                }}
                            />
                            {addedImages.length > 0 ? (
                                <div className="modal-info success">
                                    ✓ {addedImages.length} image(s) + all shapes/text will be saved
                                </div>
                            ) : (
                                <div className="modal-info">
                                    📋 All shapes and text will be saved as editable elements
                                </div>
                            )}
                            <div className="modal-buttons">
                                <button className="modal-btn cancel" onClick={handleCancelSave}>
                                    Cancel
                                </button>
                                <button 
                                    className="modal-btn save" 
                                    onClick={handleSaveTemplate}
                                    disabled={!templateNameInput.trim()}
                                >
                                    Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Theme>
    );
};

export default App;
