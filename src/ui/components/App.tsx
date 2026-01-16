// BrandFlow - Enterprise Brand Studio for Adobe Express
// Main App Component with all features

import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useEffect } from "react";
import { BrandKit, SocialTemplate, SavedTemplate, ComplianceResult, ComplianceIssue } from "../utils/types";
import { SOCIAL_TEMPLATES } from "../utils/brandData";
import {
    getAllBrandKits,
    getActiveBrandKit,
    setActiveBrandKit,
    hexToRgba,
    getSavedTemplates,
    saveTemplate,
    deleteTemplate,
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

        // Add logo if available
        if (activeBrand.logoUrl) {
            try {
                const response = await fetch(activeBrand.logoUrl);
                const logoBlob = await response.blob();
                await addOnUISdk.app.document.addImage(logoBlob, {
                    title: `${activeBrand.name} Logo`
                });
                showStatus("success", `Created ${template.name} with ${activeBrand.name} logo!`);
            } catch (e) {
                console.log("Could not load logo, continuing without it");
            }
        }
    };

    // Manual save template (only when user clicks Save)
    const handleSaveTemplate = () => {
        if (!activeBrand || !lastCreatedPlatform) {
            showStatus("error", "Create a post first, then save it!");
            return;
        }

        const templateName = prompt("Enter a name for this template:", `${activeBrand.name} - ${lastCreatedPlatform}`);
        if (!templateName) return;

        const newTemplate: SavedTemplate = {
            id: `${Date.now()}`,
            name: templateName,
            brandKitId: activeBrand.id,
            platform: lastCreatedPlatform,
            createdAt: new Date().toISOString()
        };
        saveTemplate(newTemplate);
        setSavedTemplates(getSavedTemplates());
        showStatus("success", `Saved "${templateName}" to templates!`);
    };

    // Delete saved template
    const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteTemplate(id);
        setSavedTemplates(getSavedTemplates());
        showStatus("info", "Template removed");
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
                    <div className="quick-actions">
                        <button className="quick-action-btn" onClick={handleQuickRectangle}>
                            + Rectangle
                        </button>
                        <button
                            className="quick-action-btn"
                            onClick={() => setActiveTab("social")}
                        >
                            📱 Create Post
                        </button>
                    </div>
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
                onClick={handleSaveTemplate}
                disabled={!lastCreatedPlatform}
            >
                💾 Save Current Design as Template
            </button>

            <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '8px', textAlign: 'center' }}>
                {lastCreatedPlatform 
                    ? `Last created: ${lastCreatedPlatform}` 
                    : "Create a post first, then save it"}
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
                <div className="templates-list">
                    {savedTemplates.slice().reverse().map(template => (
                        <div key={template.id} className="template-item">
                            <div className="template-info">
                                <span className="template-icon">📄</span>
                                <div>
                                    <div className="template-name">{template.name}</div>
                                    <div className="template-date">
                                        {template.platform} • {new Date(template.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="template-delete"
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
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
            </div>
        </Theme>
    );
};

export default App;
