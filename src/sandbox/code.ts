import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;

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
    secondaryColor: RGBAColor;
    platformName: string;
}

function start() {
    runtime.exposeApi({
        // Create a branded social post on a NEW PAGE with correct dimensions
        createBrandedPost(params: SocialTemplateParams) {
            const { width, height, backgroundColor, accentColor, secondaryColor, platformName } = params;
            
            // Create a new page with the exact social media dimensions
            const newPage = editor.documentRoot.pages.addPage({ width, height });
            
            // The new page is now active, get the insertion parent (artboard)
            const insertionParent = editor.context.insertionParent;
            
            // Create background that fills the entire canvas
            const bg = editor.createRectangle();
            bg.width = width;
            bg.height = height;
            bg.translation = { x: 0, y: 0 };
            bg.fill = editor.makeColorFill(backgroundColor);
            insertionParent.children.append(bg);
            
            // Create top header bar (12% of height)
            const headerHeight = Math.round(height * 0.12);
            const header = editor.createRectangle();
            header.width = width;
            header.height = headerHeight;
            header.translation = { x: 0, y: 0 };
            header.fill = editor.makeColorFill(accentColor);
            insertionParent.children.append(header);
            
            // Create bottom footer bar (8% of height)
            const footerHeight = Math.round(height * 0.08);
            const footer = editor.createRectangle();
            footer.width = width;
            footer.height = footerHeight;
            footer.translation = { x: 0, y: height - footerHeight };
            footer.fill = editor.makeColorFill(accentColor);
            insertionParent.children.append(footer);
            
            // Create side accent bar (left side, 3% width)
            const sideBarWidth = Math.round(width * 0.03);
            const sideBar = editor.createRectangle();
            sideBar.width = sideBarWidth;
            sideBar.height = height - headerHeight - footerHeight;
            sideBar.translation = { x: 0, y: headerHeight };
            sideBar.fill = editor.makeColorFill(secondaryColor);
            insertionParent.children.append(sideBar);
            
            // Create center content placeholder area
            const contentWidth = Math.round(width * 0.6);
            const contentHeight = Math.round(height * 0.4);
            const contentRect = editor.createRectangle();
            contentRect.width = contentWidth;
            contentRect.height = contentHeight;
            contentRect.translation = { 
                x: (width - contentWidth) / 2, 
                y: (height - contentHeight) / 2 
            };
            // Light version of accent color for content area
            const lightAccent = {
                red: Math.min(1, accentColor.red * 0.3 + 0.7),
                green: Math.min(1, accentColor.green * 0.3 + 0.7),
                blue: Math.min(1, accentColor.blue * 0.3 + 0.7),
                alpha: 0.15
            };
            contentRect.fill = editor.makeColorFill(lightAccent);
            insertionParent.children.append(contentRect);
            
            // Create logo placeholder (top-left of header)
            const logoSize = Math.round(headerHeight * 0.7);
            const logoPlaceholder = editor.createRectangle();
            logoPlaceholder.width = logoSize;
            logoPlaceholder.height = logoSize;
            logoPlaceholder.translation = { 
                x: 20, 
                y: (headerHeight - logoSize) / 2 
            };
            logoPlaceholder.fill = editor.makeColorFill({
                red: 1, green: 1, blue: 1, alpha: 0.3
            });
            insertionParent.children.append(logoPlaceholder);
            
            console.log(`Created ${platformName} page: ${width}x${height}`);
        },
        
        // Resize current page to social media dimensions
        resizeCurrentPage(width: number, height: number) {
            const currentPage = editor.context.currentPage;
            currentPage.width = width;
            currentPage.height = height;
            console.log(`Resized current page to: ${width}x${height}`);
        },
        
        // Apply color to currently selected element
        applyColorToSelection(color: RGBAColor) {
            const selection = editor.context.selection;
            if (selection && selection.length > 0) {
                for (const node of selection) {
                    if ('fill' in node && typeof (node as any).fill !== 'undefined') {
                        (node as any).fill = editor.makeColorFill(color);
                    }
                }
                console.log(`Applied color to ${selection.length} element(s)`);
                return { success: true, count: selection.length };
            } else {
                console.log("No elements selected");
                return { success: false, count: 0 };
            }
        },
        
        // Create a simple rectangle with color
        createRectangle(color: RGBAColor) {
            const rectangle = editor.createRectangle();
            rectangle.width = 200;
            rectangle.height = 150;
            rectangle.translation = { x: 100, y: 100 };
            rectangle.fill = editor.makeColorFill(color);
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
            return { success: true };
        },
        
        // Create a logo placeholder rectangle
        createLogoPlaceholder(x: number, y: number, size: number, color: RGBAColor) {
            const logo = editor.createRectangle();
            logo.width = size;
            logo.height = size;
            logo.translation = { x, y };
            logo.fill = editor.makeColorFill(color);
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(logo);
            return { success: true };
        },
        
        // Get information about current selection for compliance check
        getSelectionInfo() {
            const selection = editor.context.selection;
            const info: any[] = [];
            
            if (selection && selection.length > 0) {
                for (const node of selection) {
                    const nodeInfo: any = {
                        type: node.type,
                        id: node.id,
                    };
                    
                    if ('fill' in node) {
                        const fill = (node as any).fill;
                        if (fill && fill.color) {
                            nodeInfo.fillColor = {
                                red: fill.color.red,
                                green: fill.color.green,
                                blue: fill.color.blue,
                                alpha: fill.color.alpha
                            };
                        }
                    }
                    
                    if ('width' in node) {
                        nodeInfo.width = (node as any).width;
                    }
                    if ('height' in node) {
                        nodeInfo.height = (node as any).height;
                    }
                    
                    info.push(nodeInfo);
                }
            }
            
            return info;
        },
        
        // Get current page dimensions
        getCurrentPageDimensions() {
            const currentPage = editor.context.currentPage;
            return {
                width: currentPage.width,
                height: currentPage.height
            };
        },
        
        // Check if elements match brand colors
        checkBrandCompliance(brandColors: RGBAColor[]) {
            const selection = editor.context.selection;
            const results: any[] = [];
            
            if (selection && selection.length > 0) {
                for (const node of selection) {
                    if ('fill' in node) {
                        const fill = (node as any).fill;
                        if (fill && fill.color) {
                            const nodeColor = fill.color;
                            // Check if this color matches any brand color
                            const isOnBrand = brandColors.some(brandColor => {
                                const tolerance = 0.05; // 5% tolerance
                                return Math.abs(nodeColor.red - brandColor.red) < tolerance &&
                                       Math.abs(nodeColor.green - brandColor.green) < tolerance &&
                                       Math.abs(nodeColor.blue - brandColor.blue) < tolerance;
                            });
                            
                            results.push({
                                nodeId: node.id,
                                nodeType: node.type,
                                isOnBrand,
                                color: {
                                    red: nodeColor.red,
                                    green: nodeColor.green,
                                    blue: nodeColor.blue
                                }
                            });
                        }
                    }
                }
            }
            
            return results;
        }
    });
}

start();
