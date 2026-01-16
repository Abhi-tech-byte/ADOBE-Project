// BrandFlow Document Sandbox API Interface
// Declares all APIs exposed by the sandbox to the UI

export interface RGBAColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface SocialTemplateParams {
    width: number;
    height: number;
    backgroundColor: RGBAColor;
    accentColor: RGBAColor;
    platformName: string;
}

export interface DocumentSandboxApi {
    // Create a branded social post template
    createBrandedPost(params: SocialTemplateParams): void;
    
    // Apply a color to the currently selected element
    applyColorToSelection(color: RGBAColor): void;
    
    // Create a simple rectangle with color
    createRectangle(color: RGBAColor): void;
    
    // Create a branded header bar
    createHeaderBar(width: number, color: RGBAColor): void;
    
    // Create a branded footer bar
    createFooterBar(width: number, height: number, color: RGBAColor): void;
    
    // Create a color swatch preview
    createColorSwatch(color: RGBAColor, x: number, y: number): void;
}
