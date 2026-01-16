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
    platformName: string;
}

function start() {
    runtime.exposeApi({
        // Create a complete branded social post template
        createBrandedPost(params: SocialTemplateParams) {
            const { width, height, backgroundColor, accentColor, platformName } = params;
            const insertionParent = editor.context.insertionParent;
            
            // Scale down for canvas display (use 1/4 of actual size for visibility)
            const scale = 0.25;
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            
            // Create background
            const bg = editor.createRectangle();
            bg.width = scaledWidth;
            bg.height = scaledHeight;
            bg.translation = { x: 50, y: 50 };
            bg.fill = editor.makeColorFill(backgroundColor);
            insertionParent.children.append(bg);
            
            // Create top accent bar (header)
            const headerHeight = scaledHeight * 0.12;
            const header = editor.createRectangle();
            header.width = scaledWidth;
            header.height = headerHeight;
            header.translation = { x: 50, y: 50 };
            header.fill = editor.makeColorFill(accentColor);
            insertionParent.children.append(header);
            
            // Create bottom accent bar (footer)
            const footerHeight = scaledHeight * 0.08;
            const footer = editor.createRectangle();
            footer.width = scaledWidth;
            footer.height = footerHeight;
            footer.translation = { x: 50, y: 50 + scaledHeight - footerHeight };
            footer.fill = editor.makeColorFill(accentColor);
            insertionParent.children.append(footer);
            
            // Create center content area indicator
            const centerRect = editor.createRectangle();
            const centerSize = Math.min(scaledWidth, scaledHeight) * 0.3;
            centerRect.width = centerSize;
            centerRect.height = centerSize;
            centerRect.translation = { 
                x: 50 + (scaledWidth - centerSize) / 2, 
                y: 50 + (scaledHeight - centerSize) / 2 
            };
            // Use a lighter version of accent color for center
            const lightAccent = {
                red: Math.min(1, accentColor.red + 0.3),
                green: Math.min(1, accentColor.green + 0.3),
                blue: Math.min(1, accentColor.blue + 0.3),
                alpha: 0.3
            };
            centerRect.fill = editor.makeColorFill(lightAccent);
            insertionParent.children.append(centerRect);
            
            console.log(`Created ${platformName} template: ${width}x${height} (scaled to ${scaledWidth}x${scaledHeight})`);
        },
        
        // Apply color to currently selected element
        applyColorToSelection(color: RGBAColor) {
            const selection = editor.context.selection;
            if (selection && selection.length > 0) {
                for (const node of selection) {
                    // Check if node has a fill property (is fillable)
                    if ('fill' in node && typeof (node as any).fill !== 'undefined') {
                        (node as any).fill = editor.makeColorFill(color);
                    }
                }
                console.log(`Applied color to ${selection.length} element(s)`);
            } else {
                console.log("No elements selected");
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
        },
        
        // Create a header bar
        createHeaderBar(width: number, color: RGBAColor) {
            const header = editor.createRectangle();
            header.width = width;
            header.height = 60;
            header.translation = { x: 50, y: 50 };
            header.fill = editor.makeColorFill(color);
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(header);
        },
        
        // Create a footer bar
        createFooterBar(width: number, height: number, color: RGBAColor) {
            const footer = editor.createRectangle();
            footer.width = width;
            footer.height = 40;
            footer.translation = { x: 50, y: height - 40 };
            footer.fill = editor.makeColorFill(color);
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(footer);
        },
        
        // Create a color swatch preview
        createColorSwatch(color: RGBAColor, x: number, y: number) {
            const swatch = editor.createRectangle();
            swatch.width = 50;
            swatch.height = 50;
            swatch.translation = { x, y };
            swatch.fill = editor.makeColorFill(color);
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(swatch);
        }
    });
}

start();
