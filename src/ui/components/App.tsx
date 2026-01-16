// BrandFlow - Enterprise Brand Studio for Adobe Express
// Main App Component

import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useEffect } from "react";
import { BrandKit, SocialTemplate, SavedTemplate } from "../utils/types";
import { SOCIAL_TEMPLATES } from "../utils/brandData";
import {
    getAllBrandKits,
    getActiveBrandKit,
    setActiveBrandKit,
    hexToRgba,
    getSavedTemplates,
    saveTemplate,
    deleteTemplate
} from "../utils/brandStorage";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

// Sandbox API interface
interface RGBAColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

interface SocialTemplateParams {
    width: number;
    height: number;
    backgroundColor: RGBAColor;
    accentColor: RGBAColor;
    platformName: string;
}

interface DocumentSandboxApi {
    createBrandedPost(params: SocialTemplateParams): void;
    applyColorToSelection(color: RGBAColor): void;
    createRectangle(color: RGBAColor): void;
}

type TabType = "brand" | "social" | "templates";

interface AppProps {
    addOnUISdk: AddOnSDKAPI;
    sandboxProxy: DocumentSandboxApi;
}

const App = ({ addOnUISdk, sandboxProxy }: AppProps) => {
    // State
    const [activeTab, setActiveTab] = useState<TabType>("brand");
    const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
    const [activeBrand, setActiveBrand] = useState<BrandKit | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "info"; text: string } | null>(null);

    // Load data on mount
    useEffect(() => {
        const kits = getAllBrandKits();
        setBrandKits(kits);
        const active = getActiveBrandKit();
        setActiveBrand(active);
        setSavedTemplates(getSavedTemplates());
    }, []);

    // Show status message temporarily
    const showStatus = (type: "success" | "info", text: string) => {
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

    // Handle color click - select or apply
    const handleColorClick = (colorKey: string, colorHex: string) => {
        setSelectedColor(colorKey);
        showStatus("info", `${colorKey} color selected: ${colorHex}`);
    };

    // Apply selected color to selection
    const handleApplyColor = () => {
        if (selectedColor && activeBrand) {
            const colorHex = activeBrand.colors[selectedColor as keyof typeof activeBrand.colors];
            const rgba = hexToRgba(colorHex);
            sandboxProxy.applyColorToSelection(rgba);
            showStatus("success", `Applied ${selectedColor} color to selection`);
        }
    };

    // Create social post
    const handleCreatePost = (template: SocialTemplate) => {
        if (!activeBrand) return;

        const params = {
            width: template.width,
            height: template.height,
            backgroundColor: hexToRgba(activeBrand.colors.background),
            accentColor: hexToRgba(activeBrand.colors.primary),
            platformName: template.name
        };

        sandboxProxy.createBrandedPost(params);
        showStatus("success", `Created ${template.name} with ${activeBrand.name} branding!`);

        // Save as recent template
        const newTemplate: SavedTemplate = {
            id: `${Date.now()}`,
            name: `${activeBrand.name} - ${template.name}`,
            brandKitId: activeBrand.id,
            createdAt: new Date().toISOString()
        };
        saveTemplate(newTemplate);
        setSavedTemplates(getSavedTemplates());
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
                            {activeBrand.name.charAt(0)}
                        </div>
                        <div className="brand-name-display">{activeBrand.name}</div>
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

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <button className="quick-action-btn" onClick={handleQuickRectangle}>
                            + Rectangle
                        </button>
                        <button
                            className="quick-action-btn"
                            onClick={() => setActiveTab("social")}
                        >
                            📱 Social Post
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

            <div className="section-title">How it works</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: 1.6 }}>
                1. Select your brand kit in the Brand tab<br />
                2. Click any template above<br />
                3. A branded post is created instantly!
            </div>
        </div>
    );

    // Render Templates Tab
    const renderTemplatesTab = () => (
        <div>
            <div className="section-title">Recent Creations</div>

            {savedTemplates.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <div className="empty-text">
                        No templates yet.<br />
                        Create a social post to see it here!
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
                                        {new Date(template.createdAt).toLocaleDateString()}
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
                        Brand Kit
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
                        <span className="tab-icon">📁</span>
                        History
                    </button>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`status-message ${statusMessage.type}`}>
                        {statusMessage.type === 'success' ? '✓' : 'ℹ'} {statusMessage.text}
                    </div>
                )}

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'brand' && renderBrandTab()}
                    {activeTab === 'social' && renderSocialTab()}
                    {activeTab === 'templates' && renderTemplatesTab()}
                </div>
            </div>
        </Theme>
    );
};

export default App;
