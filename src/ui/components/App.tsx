// BrandFlow - Enterprise Brand Studio for Adobe Express
// Main App Component with all features

import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useEffect } from "react";
import { BrandKit, SocialTemplate, ComplianceResult, ComplianceIssue, BrandAsset, SavedImageRef } from "../utils/types";
import { SOCIAL_TEMPLATES } from "../utils/brandData";
import {
    getAllBrandKits,
    getActiveBrandKit,
    setActiveBrandKit,
    hexToRgba,
    rgbaToHex
} from "../utils/brandStorage";
import {
    CanvasIcon,
    CustomizeIcon,
    CheckIcon,
    InstagramIcon,
    TwitterIcon,
    XIcon,
    LinkedInIcon,
    FacebookIcon,
    YouTubeIcon,
    LogoIcon,
    AssetIcon,
    ContactIcon,
    ColorIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CopyrightIcon,
    StoryIcon
} from "./Icons";
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

type WorkflowStep = 1 | 2 | 3;

interface AppProps {
    addOnUISdk: typeof addOnUISdk;
    sandboxProxy: DocumentSandboxApi;
}

const App = ({ addOnUISdk, sandboxProxy }: AppProps) => {
    // Workflow State
    const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
    const [selectedTemplate, setSelectedTemplate] = useState<SocialTemplate | null>(null);
    
    // Brand State
    const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
    const [activeBrand, setActiveBrand] = useState<BrandKit | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [addedImages, setAddedImages] = useState<SavedImageRef[]>([]);
    
    // Compliance State
    const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    
    // UI State
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

    // Load data on mount
    useEffect(() => {
        const kits = getAllBrandKits();
        setBrandKits(kits);
        const active = getActiveBrandKit();
        setActiveBrand(active);
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

    // Step 1: Select canvas dimensions and create post
    const handleSelectTemplate = async (template: SocialTemplate) => {
        if (!activeBrand) {
            showStatus("error", "Please select a brand kit first!");
            return;
        }

        setSelectedTemplate(template);
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
        showStatus("success", `Created ${template.name} canvas (${template.width}×${template.height})!`);
        
        // Move to step 2
        setCurrentStep(2);
    };

    // Step Navigation
    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep((currentStep + 1) as WorkflowStep);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as WorkflowStep);
        }
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

    // Step 1: Select Canvas Dimensions
    const renderStep1 = () => (
        <div>
            <div className="section-title">Step 1: Select Canvas Resolution</div>
            <p style={{ fontSize: '11px', color: '#a0a0a0', marginBottom: '16px' }}>
                Choose your canvas dimensions to get started
            </p>

            {/* Brand Selector */}
            <div className="brand-selector" style={{ marginBottom: '16px' }}>
                <label>Select Brand Kit</label>
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

            {/* Canvas Templates Grid */}
            <div className="social-grid">
                {SOCIAL_TEMPLATES.map(template => {
                    const getIcon = () => {
                        switch (template.id) {
                            case 'ig-post':
                            case 'ig-story':
                                return <InstagramIcon size={32} color="#E4405F" />;
                            case 'twitter':
                                return <XIcon size={32} color="#000000" />;
                            case 'linkedin':
                                return <LinkedInIcon size={32} color="#0077B5" />;
                            case 'facebook':
                                return <FacebookIcon size={32} color="#1877F2" />;
                            case 'youtube':
                                return <YouTubeIcon size={32} color="#FF0000" />;
                            default:
                                return <CanvasIcon size={32} color="currentColor" />;
                        }
                    };
                    
                    return (
                        <div
                            key={template.id}
                            className={`social-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <div className="social-icon-wrapper">
                                {getIcon()}
                            </div>
                            <div className="social-name">{template.name}</div>
                            <div className="social-size">{template.width} × {template.height}</div>
                        </div>
                    );
                })}
            </div>

            {selectedTemplate && (
                <div className="selected-template-indicator">
                    <CheckCircleIcon size={18} color="#6BCB77" />
                    <div>
                        <div style={{ fontSize: '12px', color: '#6BCB77', fontWeight: 600 }}>
                            Selected: {selectedTemplate.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '2px' }}>
                            {selectedTemplate.width} × {selectedTemplate.height} pixels
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Step 2: Brand Assets, Contact Info, Colors
    const renderStep2 = () => (
        <div>
            <div className="section-title">Step 2: Customize Your Design</div>
            <p style={{ fontSize: '11px', color: '#a0a0a0', marginBottom: '16px' }}>
                Add brand assets, contact info, and apply brand colors
            </p>

            {!activeBrand ? (
                <div className="empty-state">
                    <div className="empty-text">Please select a brand kit in Step 1</div>
                </div>
            ) : (
                <>
                    {/* Brand Info */}
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
                            </div>
                        </div>

                        {/* Brand Assets */}
                        {activeBrand.assets && activeBrand.assets.length > 0 && (
                            <div className="info-section">
                                <div className="section-title">
                                    <AssetIcon size={16} color="currentColor" />
                                    <span>Brand Assets</span>
                                </div>
                                <div className="assets-grid">
                                    {activeBrand.assets.map(asset => (
                                        <div 
                                            key={asset.id} 
                                            className="asset-item"
                                            onClick={() => handleAddAsset(asset)}
                                            title={`Add ${asset.name} to canvas`}
                                        >
                                            {asset.url.startsWith("TEXT:") ? (
                                                <div className="asset-text-icon">
                                                    <CopyrightIcon size={24} color="white" />
                                                </div>
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

                        {/* Add Logo Button */}
                        {activeBrand.logoUrl && (
                            <button 
                                className="add-logo-btn"
                                onClick={handleAddLogo}
                                style={{ marginTop: '12px' }}
                            >
                                <LogoIcon size={18} color="white" />
                                <span>Add {activeBrand.name} Logo to Canvas</span>
                            </button>
                        )}

                        {/* Contact Info */}
                        {activeBrand.contactInfo && (
                            <div className="info-section">
                                <div className="section-title">
                                    <ContactIcon size={16} color="currentColor" />
                                    <span>Contact Info</span>
                                </div>
                                <div className="info-list">
                                    {activeBrand.contactInfo.email && (
                                        <div className="info-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px', opacity: 0.7 }}>
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none"/>
                                            </svg>
                                            {activeBrand.contactInfo.email}
                                        </div>
                                    )}
                                    {activeBrand.contactInfo.website && (
                                        <div className="info-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px', opacity: 0.7 }}>
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                                                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                            </svg>
                                            {activeBrand.contactInfo.website}
                                        </div>
                                    )}
                                    {activeBrand.contactInfo.phone && (
                                        <div className="info-item">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px', opacity: 0.7 }}>
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                            </svg>
                                            {activeBrand.contactInfo.phone}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="add-footer-btn"
                                    onClick={handleAddContactToFooter}
                                >
                                    <ContactIcon size={16} color="white" />
                                    <span>Add Contact to Footer</span>
                                </button>
                    </div>
                        )}

                        {/* Brand Colors */}
                    <div className="color-section">
                            <div className="section-title">
                                <ColorIcon size={16} color="currentColor" />
                                <span>Brand Colors</span>
                            </div>
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
                    <button
                        className="apply-button"
                        onClick={handleApplyColor}
                        disabled={!selectedColor}
                                style={{ marginTop: '12px' }}
                            >
                                <ColorIcon size={16} color="white" />
                                <span>{selectedColor ? `Apply ${selectedColor} to Selection` : "Select a Color First"}</span>
                            </button>
                        </div>
                </div>
                </>
            )}
        </div>
    );

    // Step 3: Brand Compliance Checker
    const renderStep3 = () => (
        <div>
            <div className="section-title">Step 3: Brand Compliance Check</div>
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
                {isChecking ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" strokeDashoffset="16"/>
                        </svg>
                        <span>Checking...</span>
                    </>
                ) : (
                    <>
                        <CheckIcon size={18} color="white" />
                        <span>Check Selected Elements</span>
                    </>
                )}
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
        <Theme system="express" scale="medium" color="light">
            <div className="brandflow-container">
                {/* Header */}
                <div className="brandflow-header">
                    <div className="brandflow-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#logoGradient)" stroke="url(#logoGradient)" strokeWidth="1"/>
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FF6B6B" />
                                    <stop offset="50%" stopColor="#FFD93D" />
                                    <stop offset="100%" stopColor="#6BCB77" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span>BRANDFLOW</span>
                    </div>
                    <div className="brandflow-tagline">Brand to post in 30 seconds</div>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="step-number">
                            {currentStep > 1 ? <CheckCircleIcon size={20} color="white" /> : '1'}
                        </div>
                        <div className="step-label">
                            <CanvasIcon size={14} color="currentColor" style={{ marginRight: '4px' }} />
                            <span>Canvas</span>
                        </div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                        <div className="step-number">
                            {currentStep > 2 ? <CheckCircleIcon size={20} color="white" /> : '2'}
                        </div>
                        <div className="step-label">
                            <CustomizeIcon size={14} color="currentColor" style={{ marginRight: '4px' }} />
                            <span>Customize</span>
                        </div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">
                            <CheckIcon size={14} color="currentColor" style={{ marginRight: '4px' }} />
                            <span>Check</span>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`status-message ${statusMessage.type}`}>
                        {statusMessage.type === 'success' ? '✓' : statusMessage.type === 'error' ? '✕' : 'ℹ'} {statusMessage.text}
                    </div>
                )}

                {/* Step Content */}
                <div className="tab-content">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>

                {/* Step Navigation */}
                <div className="step-navigation">
                    <button
                        className="step-nav-btn prev"
                        onClick={handlePreviousStep}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeftIcon size={16} color="currentColor" />
                        <span>Previous</span>
                    </button>
                    <button
                        className="step-nav-btn next"
                        onClick={handleNextStep}
                        disabled={currentStep === 3 || (currentStep === 1 && !selectedTemplate)}
                    >
                        <span>Next</span>
                        <ArrowRightIcon size={16} color="white" />
                    </button>
                </div>
            </div>
        </Theme>
    );
};

export default App;
