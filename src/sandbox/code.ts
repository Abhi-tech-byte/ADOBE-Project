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
            
            // Detect orientation
            const isPortrait = height > width;
            const isSquare = width === height;
            
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
            
            // Adjust header/footer sizes based on orientation
            // Portrait: use smaller percentages, Landscape/Square: standard
            const headerPercent = isPortrait ? 0.06 : 0.12;
            const footerPercent = isPortrait ? 0.05 : 0.08;
            
            // Create top header bar
            const headerHeight = Math.round(height * headerPercent);
            const header = editor.createRectangle();
            header.width = width;
            header.height = headerHeight;
            header.translation = { x: 0, y: 0 };
            header.fill = editor.makeColorFill(accentColor);
            insertionParent.children.append(header);
            
            // Create bottom footer bar
            const footerHeight = Math.round(height * footerPercent);
            const footer = editor.createRectangle();
            footer.width = width;
            footer.height = footerHeight;
            footer.translation = { x: 0, y: height - footerHeight };
            footer.fill = editor.makeColorFill(accentColor);
            insertionParent.children.append(footer);
            
            // Create side accent bar (left side)
            const sideBarWidth = Math.round(width * 0.02);
            const sideBar = editor.createRectangle();
            sideBar.width = sideBarWidth;
            sideBar.height = height - headerHeight - footerHeight;
            sideBar.translation = { x: 0, y: headerHeight };
            sideBar.fill = editor.makeColorFill(secondaryColor);
            insertionParent.children.append(sideBar);
            
            // Create center content placeholder area
            const contentWidthPercent = isPortrait ? 0.8 : 0.6;
            const contentHeightPercent = isPortrait ? 0.3 : 0.4;
            const contentWidth = Math.round(width * contentWidthPercent);
            const contentHeight = Math.round(height * contentHeightPercent);
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
            
            // Create logo placeholder - sized based on width for consistency
            const logoSize = isPortrait 
                ? Math.round(width * 0.12)  // Portrait: 12% of width
                : Math.round(headerHeight * 0.7); // Landscape: 70% of header height
            
            const logoPlaceholder = editor.createRectangle();
            logoPlaceholder.width = logoSize;
            logoPlaceholder.height = logoSize;
            logoPlaceholder.translation = { 
                x: Math.round(width * 0.03), // 3% from left edge
                y: Math.round((headerHeight - logoSize) / 2)
            };
            logoPlaceholder.fill = editor.makeColorFill({
                red: 1, green: 1, blue: 1, alpha: 0.3
            });
            insertionParent.children.append(logoPlaceholder);
            
            console.log(`Created ${platformName} page: ${width}x${height} (${isPortrait ? 'portrait' : isSquare ? 'square' : 'landscape'})`);
        },
        
        // Resize current page to social media dimensions
        resizeCurrentPage(width: number, height: number) {
            const currentPage = editor.context.currentPage;
            currentPage.width = width;
            currentPage.height = height;
            console.log(`Resized current page to: ${width}x${height}`);
        },
        
        // Apply color to currently selected element (including text)
        applyColorToSelection(color: RGBAColor) {
            const selection = editor.context.selection;
            if (selection && selection.length > 0) {
                let appliedCount = 0;
                for (const node of selection) {
                    // Handle Text nodes differently - use character styles
                    if (node.type === 'Text') {
                        try {
                            const textNode = node as any;
                            textNode.fullContent.applyCharacterStyles({ color });
                            appliedCount++;
                            console.log("Applied color to text");
                        } catch (e) {
                            console.log("Could not apply color to text:", e);
                        }
                    }
                    // Handle fillable nodes (rectangles, ellipses, etc.)
                    else if ('fill' in node && typeof (node as any).fill !== 'undefined') {
                        (node as any).fill = editor.makeColorFill(color);
                        appliedCount++;
                    }
                }
                console.log(`Applied color to ${appliedCount} element(s)`);
                return { success: appliedCount > 0, count: appliedCount };
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
            
            // Detect orientation for footer sizing
            const isPortrait = pageHeight > pageWidth;
            const footerPercent = isPortrait ? 0.05 : 0.08;
            const footerHeight = Math.round(pageHeight * footerPercent);
            
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
            
            // Add to artboard first so bounds are calculated
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(textNode);
            
            // Position in footer bar (vertically centered in footer area)
            const footerTop = pageHeight - footerHeight;
            const yPos = footerTop + (footerHeight / 2);
            textNode.setPositionInParent(
                { x: pageWidth / 2, y: yPos },
                { x: textNode.boundsLocal.width / 2, y: textNode.boundsLocal.height / 2 }
            );
            
            // Apply text color
            textNode.fullContent.applyCharacterStyles({ color: textColor });
            
            return { success: true, text: contactText };
        },
        
        // Capture all elements on the current page/artboard
        captureCanvasElements() {
            const currentPage = editor.context.currentPage;
            const artboard = currentPage.artboards.first;
            
            if (!artboard) {
                return {
                    pageWidth: currentPage.width,
                    pageHeight: currentPage.height,
                    elements: [],
                    imageCount: 0
                };
            }
            
            const elements: any[] = [];
            let imageCount = 0;
            
            // Use artboard.children to get the direct children
            const children = artboard.children.toArray();
            console.log(`Capturing ${children.length} children from artboard`);
            
            for (const node of children) {
                try {
                    const nodeType = node.type;
                    console.log(`Processing node type: ${nodeType}`);
                    
                    // Skip media/image types - these are tracked separately via URLs
                    if (nodeType === 'MediaContainer' || nodeType === 'ImageRectangle' || 
                        nodeType === 'GridCell' || nodeType === 'GridLayout' ||
                        nodeType === 'UnknownMediaRectangle') {
                        imageCount++;
                        continue;
                    }
                    
                    const elementData: any = {
                        type: nodeType
                    };
                    
                    // Get translation (position)
                    if ('translation' in node) {
                        const t = (node as any).translation;
                        elementData.x = t.x;
                        elementData.y = t.y;
                    }
                    
                    // Get rotation
                    if ('rotation' in node) {
                        elementData.rotation = (node as any).rotation;
                    }
                    
                    // Get opacity
                    if ('opacity' in node) {
                        elementData.opacity = (node as any).opacity;
                    }
                    
                    // Rectangle specific
                    if (nodeType === 'Rectangle') {
                        const rect = node as any;
                        elementData.width = rect.width;
                        elementData.height = rect.height;
                        elementData.topLeftRadius = rect.topLeftRadius;
                        elementData.topRightRadius = rect.topRightRadius;
                        elementData.bottomLeftRadius = rect.bottomLeftRadius;
                        elementData.bottomRightRadius = rect.bottomRightRadius;
                    }
                    
                    // Ellipse specific
                    if (nodeType === 'Ellipse') {
                        const ellipse = node as any;
                        elementData.rx = ellipse.rx;
                        elementData.ry = ellipse.ry;
                    }
                    
                    // Line specific
                    if (nodeType === 'Line') {
                        const line = node as any;
                        elementData.startX = line.startX;
                        elementData.startY = line.startY;
                        elementData.endX = line.endX;
                        elementData.endY = line.endY;
                    }
                    
                    // Text specific
                    if (nodeType === 'Text') {
                        try {
                            const textNode = node as any;
                            elementData.text = textNode.fullContent.text;
                            elementData.textAlignment = textNode.textAlignment;
                            
                            // Get the visual position using boundsInParent (not translation)
                            const boundsInParent = textNode.boundsInParent;
                            elementData.visualX = boundsInParent.x;
                            elementData.visualY = boundsInParent.y;
                            elementData.visualWidth = boundsInParent.width;
                            elementData.visualHeight = boundsInParent.height;
                            
                            // Also capture topLeftLocal for offset calculation
                            const topLeft = textNode.topLeftLocal;
                            elementData.topLeftX = topLeft.x;
                            elementData.topLeftY = topLeft.y;
                        } catch (e) {
                            console.log("Could not get text content:", e);
                        }
                    }
                    
                    // Path specific
                    if (nodeType === 'Path') {
                        try {
                            const pathNode = node as any;
                            elementData.path = pathNode.path;
                            elementData.fillRule = pathNode.fillRule;
                            const bounds = pathNode.boundsLocal;
                            elementData.boundsWidth = bounds.width;
                            elementData.boundsHeight = bounds.height;
                        } catch (e) {
                            console.log("Could not get path data:", e);
                        }
                    }
                    
                    // Get fill (for fillable nodes)
                    if ('fill' in node) {
                        const fill = (node as any).fill;
                        if (fill && fill.type === 'Color' && fill.color) {
                            elementData.fill = {
                                red: fill.color.red,
                                green: fill.color.green,
                                blue: fill.color.blue,
                                alpha: fill.color.alpha !== undefined ? fill.color.alpha : 1
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
                                alpha: stroke.color.alpha !== undefined ? stroke.color.alpha : 1,
                                width: stroke.width || 1
                            };
                        }
                    }
                    
                    elements.push(elementData);
                    console.log(`Captured: ${nodeType}`, elementData);
                    
                } catch (e) {
                    console.log("Could not capture element:", node.type, e);
                }
            }
            
            console.log(`Captured ${elements.length} elements, ${imageCount} images skipped`);
            
            return {
                pageWidth: currentPage.width,
                pageHeight: currentPage.height,
                elements,
                imageCount
            };
        },
        
        // Recreate elements from saved data
        recreateCanvasElements(data: { pageWidth: number; pageHeight: number; elements: any[] }) {
            const { pageWidth, pageHeight, elements } = data;
            
            // Create a new page with saved dimensions
            const newPage = editor.documentRoot.pages.addPage({ width: pageWidth, height: pageHeight });
            const artboard = newPage.artboards.first;
            
            if (!artboard) {
                return { success: false, recreatedCount: 0, total: elements.length, error: "No artboard" };
            }
            
            let recreatedCount = 0;
            
            console.log(`Recreating ${elements.length} elements on new page ${pageWidth}x${pageHeight}`);
            
            for (const elem of elements) {
                try {
                    console.log(`Recreating: ${elem.type}`, elem);
                    
                    if (elem.type === 'Rectangle') {
                        const rect = editor.createRectangle();
                        rect.width = elem.width || 100;
                        rect.height = elem.height || 100;
                        rect.translation = { x: elem.x || 0, y: elem.y || 0 };
                        
                        // Apply corner radii
                        if (elem.topLeftRadius !== undefined) rect.topLeftRadius = elem.topLeftRadius;
                        if (elem.topRightRadius !== undefined) rect.topRightRadius = elem.topRightRadius;
                        if (elem.bottomLeftRadius !== undefined) rect.bottomLeftRadius = elem.bottomLeftRadius;
                        if (elem.bottomRightRadius !== undefined) rect.bottomRightRadius = elem.bottomRightRadius;
                        
                        if (elem.fill) {
                            rect.fill = editor.makeColorFill(elem.fill);
                        }
                        
                        if (elem.stroke) {
                            rect.stroke = editor.makeStroke({ 
                                color: elem.stroke, 
                                width: elem.stroke.width 
                            });
                        }
                        
                        if (elem.rotation) {
                            rect.setRotationInParent(elem.rotation, rect.centerPointLocal);
                        }
                        
                        if (elem.opacity !== undefined) {
                            rect.opacity = elem.opacity;
                        }
                        
                        artboard.children.append(rect);
                        recreatedCount++;
                        
                    } else if (elem.type === 'Ellipse') {
                        const ellipse = editor.createEllipse();
                        ellipse.rx = elem.rx || 50;
                        ellipse.ry = elem.ry || 50;
                        ellipse.translation = { x: elem.x || 0, y: elem.y || 0 };
                        
                        if (elem.fill) {
                            ellipse.fill = editor.makeColorFill(elem.fill);
                        }
                        
                        if (elem.stroke) {
                            ellipse.stroke = editor.makeStroke({ 
                                color: elem.stroke, 
                                width: elem.stroke.width 
                            });
                        }
                        
                        if (elem.opacity !== undefined) {
                            ellipse.opacity = elem.opacity;
                        }
                        
                        artboard.children.append(ellipse);
                        recreatedCount++;
                        
                    } else if (elem.type === 'Line') {
                        const line = editor.createLine();
                        line.setEndPoints(
                            elem.startX || 0,
                            elem.startY || 0,
                            elem.endX || 100,
                            elem.endY || 100
                        );
                        
                        if (elem.stroke) {
                            line.stroke = editor.makeStroke({ 
                                color: elem.stroke, 
                                width: elem.stroke.width 
                            });
                        }
                        
                        artboard.children.append(line);
                        recreatedCount++;
                        
                    } else if (elem.type === 'Text' && elem.text) {
                        const textNode = editor.createText(elem.text);
                        
                        // Apply text color first (before positioning, as it may affect bounds)
                        if (elem.fill) {
                            textNode.fullContent.applyCharacterStyles({ color: elem.fill });
                        }
                        
                        // Apply alignment
                        if (elem.textAlignment !== undefined) {
                            textNode.textAlignment = elem.textAlignment;
                        }
                        
                        // Add to artboard first so positioning works correctly
                        artboard.children.append(textNode);
                        
                        // Position text using the visual position we captured
                        // Use the text's own topLeftLocal as the registration point
                        if (elem.visualX !== undefined && elem.visualY !== undefined) {
                            textNode.setPositionInParent(
                                { x: elem.visualX, y: elem.visualY },
                                textNode.topLeftLocal
                            );
                        } else {
                            // Fallback to old method
                            textNode.setPositionInParent(
                                { x: elem.x || 0, y: elem.y || 0 },
                                { x: 0, y: 0 }
                            );
                        }
                        
                        if (elem.opacity !== undefined) {
                            textNode.opacity = elem.opacity;
                        }
                        
                        recreatedCount++;
                        
                    } else if (elem.type === 'Path' && elem.path) {
                        try {
                            const pathNode = editor.createPath(elem.path);
                            
                            pathNode.translation = { x: elem.x || 0, y: elem.y || 0 };
                            
                            if (elem.fill) {
                                pathNode.fill = editor.makeColorFill(elem.fill);
                            }
                            
                            if (elem.stroke) {
                                pathNode.stroke = editor.makeStroke({ 
                                    color: elem.stroke, 
                                    width: elem.stroke.width 
                                });
                            }
                            
                            if (elem.fillRule !== undefined) {
                                pathNode.fillRule = elem.fillRule;
                            }
                            
                            if (elem.opacity !== undefined) {
                                pathNode.opacity = elem.opacity;
                            }
                            
                            artboard.children.append(pathNode);
                            recreatedCount++;
                        } catch (e) {
                            console.log("Could not recreate path:", e);
                        }
                        
                    } else {
                        console.log("Skipping unsupported element type:", elem.type);
                    }
                } catch (e) {
                    console.log("Could not recreate element:", elem.type, e);
                }
            }
            
            console.log(`Recreated ${recreatedCount}/${elements.length} elements`);
            
            return { success: true, recreatedCount, total: elements.length };
        }
    });
}

start();
