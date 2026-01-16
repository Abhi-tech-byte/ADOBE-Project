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
        },
        
        // Create text element with contact info
        createContactText(text: string, color: RGBAColor, positionY: number) {
            const currentPage = editor.context.currentPage;
            const pageWidth = currentPage.width;
            const pageHeight = currentPage.height;
            
            // Create text node
            const textNode = editor.createText(text);
            
            // Position in footer area (bottom of page)
            const yPos = positionY || (pageHeight - 40);
            textNode.setPositionInParent(
                { x: pageWidth / 2, y: yPos },
                { x: textNode.boundsLocal.width / 2, y: 0 }
            );
            
            // Add to artboard
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(textNode);
            
            // Apply text color
            textNode.fullContent.applyCharacterStyles({ color });
            
            return { success: true, text };
        },
        
        // Create a text box in the footer area
        createFooterText(contactInfo: { email?: string; phone?: string; website?: string }, textColor: RGBAColor) {
            const currentPage = editor.context.currentPage;
            const pageHeight = currentPage.height;
            const pageWidth = currentPage.width;
            
            // Build contact text
            const parts: string[] = [];
            if (contactInfo.email) parts.push(contactInfo.email);
            if (contactInfo.phone) parts.push(contactInfo.phone);
            if (contactInfo.website) parts.push(contactInfo.website);
            
            if (parts.length === 0) {
                return { success: false, message: "No contact info provided" };
            }
            
            const contactText = parts.join("  •  ");
            
            // Create text node
            const textNode = editor.createText(contactText);
            
            // Position in footer (bottom 5% of page, centered)
            const yPos = pageHeight - (pageHeight * 0.04);
            textNode.setPositionInParent(
                { x: pageWidth / 2, y: yPos },
                { x: textNode.boundsLocal.width / 2, y: textNode.boundsLocal.height / 2 }
            );
            
            // Add to artboard
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(textNode);
            
            // Apply text color
            textNode.fullContent.applyCharacterStyles({ color: textColor });
            
            return { success: true, text: contactText };
        },
        
        // Capture all elements on the current page/artboard
        captureCanvasElements() {
            const currentPage = editor.context.currentPage;
            const insertionParent = editor.context.insertionParent;
            const elements: any[] = [];
            const imagePositions: any[] = []; // Track image positions separately
            
            // Iterate through all children of the artboard
            for (const node of insertionParent.allChildren) {
                try {
                    // Skip media containers (images) - we handle them via tracked URLs
                    // But capture their positions for reference
                    if (node.type === 'MediaContainer' || node.type === 'ImageRectangle' || 
                        node.type === 'GridCell' || node.type === 'GridLayout') {
                        // Capture image position for reference
                        if ('translation' in node && 'boundsLocal' in node) {
                            const translation = (node as any).translation;
                            const bounds = (node as any).boundsLocal;
                            imagePositions.push({
                                type: 'image',
                                x: translation.x,
                                y: translation.y,
                                width: bounds.width,
                                height: bounds.height
                            });
                        }
                        continue; // Skip - images loaded via tracked URLs
                    }
                    
                    // Skip unknown/complex types that we can't recreate
                    const supportedTypes = ['Rectangle', 'Ellipse', 'Line', 'Text', 'Path', 'Group'];
                    if (!supportedTypes.some(t => node.type.includes(t))) {
                        console.log("Skipping unsupported type:", node.type);
                        continue;
                    }
                    
                    const elementData: any = {
                        type: node.type,
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        rotation: 0
                    };
                    
                    // Get position and bounds
                    if ('translation' in node) {
                        const translation = (node as any).translation;
                        elementData.x = translation.x;
                        elementData.y = translation.y;
                    }
                    
                    if ('boundsLocal' in node) {
                        const bounds = (node as any).boundsLocal;
                        elementData.width = bounds.width;
                        elementData.height = bounds.height;
                    }
                    
                    if ('width' in node && 'height' in node) {
                        elementData.width = (node as any).width;
                        elementData.height = (node as any).height;
                    }
                    
                    if ('rotation' in node) {
                        elementData.rotation = (node as any).rotation;
                    }
                    
                    if ('opacity' in node) {
                        elementData.opacity = (node as any).opacity;
                    }
                    
                    // Get fill color
                    if ('fill' in node) {
                        const fill = (node as any).fill;
                        if (fill && fill.color) {
                            elementData.fill = {
                                red: fill.color.red,
                                green: fill.color.green,
                                blue: fill.color.blue,
                                alpha: fill.color.alpha || 1
                            };
                        }
                    }
                    
                    // Get stroke
                    if ('stroke' in node) {
                        const stroke = (node as any).stroke;
                        if (stroke && stroke.color) {
                            elementData.stroke = {
                                red: stroke.color.red,
                                green: stroke.color.green,
                                blue: stroke.color.blue,
                                alpha: stroke.color.alpha || 1,
                                width: stroke.width || 1
                            };
                        }
                    }
                    
                    // Get text content
                    if (node.type === 'Text' && 'fullContent' in node) {
                        try {
                            elementData.text = (node as any).fullContent.text;
                        } catch (e) {
                            // Text might not be accessible
                        }
                    }
                    
                    elements.push(elementData);
                } catch (e) {
                    console.log("Could not capture element:", e);
                }
            }
            
            return {
                pageWidth: currentPage.width,
                pageHeight: currentPage.height,
                elements,
                imageCount: imagePositions.length // Report how many images we found
            };
        },
        
        // Recreate elements from saved data
        recreateCanvasElements(data: { pageWidth: number; pageHeight: number; elements: any[] }) {
            const { pageWidth, pageHeight, elements } = data;
            
            // Create a new page with saved dimensions
            const newPage = editor.documentRoot.pages.addPage({ width: pageWidth, height: pageHeight });
            const insertionParent = editor.context.insertionParent;
            
            let recreatedCount = 0;
            
            for (const elem of elements) {
                try {
                    if (elem.type === 'Rectangle' || elem.type === 'rectangle') {
                        const rect = editor.createRectangle();
                        rect.width = elem.width || 100;
                        rect.height = elem.height || 100;
                        rect.translation = { x: elem.x || 0, y: elem.y || 0 };
                        
                        if (elem.fill) {
                            rect.fill = editor.makeColorFill(elem.fill);
                        }
                        
                        if (elem.rotation) {
                            rect.setRotationInParent(elem.rotation, rect.centerPointLocal);
                        }
                        
                        if (elem.opacity !== undefined) {
                            rect.opacity = elem.opacity;
                        }
                        
                        insertionParent.children.append(rect);
                        recreatedCount++;
                    } else if (elem.type === 'Ellipse' || elem.type === 'ellipse') {
                        const ellipse = editor.createEllipse();
                        ellipse.rx = (elem.width || 100) / 2;
                        ellipse.ry = (elem.height || 100) / 2;
                        ellipse.translation = { x: elem.x || 0, y: elem.y || 0 };
                        
                        if (elem.fill) {
                            ellipse.fill = editor.makeColorFill(elem.fill);
                        }
                        
                        if (elem.opacity !== undefined) {
                            ellipse.opacity = elem.opacity;
                        }
                        
                        insertionParent.children.append(ellipse);
                        recreatedCount++;
                    } else if (elem.type === 'Line' || elem.type === 'line') {
                        const line = editor.createLine();
                        line.setEndPoints(
                            elem.x || 0, 
                            elem.y || 0, 
                            (elem.x || 0) + (elem.width || 100), 
                            (elem.y || 0) + (elem.height || 0)
                        );
                        insertionParent.children.append(line);
                        recreatedCount++;
                    } else if (elem.type === 'Text' && elem.text) {
                        const textNode = editor.createText(elem.text);
                        textNode.setPositionInParent(
                            { x: elem.x || 0, y: elem.y || 0 },
                            { x: 0, y: 0 }
                        );
                        
                        if (elem.fill) {
                            textNode.fullContent.applyCharacterStyles({ color: elem.fill });
                        }
                        
                        insertionParent.children.append(textNode);
                        recreatedCount++;
                    } else {
                        // Skip unsupported types - don't create placeholders
                        console.log("Skipping unsupported element type:", elem.type);
                    }
                } catch (e) {
                    console.log("Could not recreate element:", elem.type, e);
                }
            }
            
            return { success: true, recreatedCount, total: elements.length };
        }
    });
}

start();
