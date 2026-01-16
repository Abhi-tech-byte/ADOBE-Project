// BrandFlow - Enterprise Brand Studio for Adobe Express
// Entry Point

import React from "react";
import { createRoot } from "react-dom/client";
import addOnUISdk, { RuntimeType } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import App from "./components/App";

// Wait for the Adobe Add-on SDK to be ready
addOnUISdk.ready.then(async () => {
    console.log("BrandFlow: SDK ready, initializing...");
    
    try {
        // Get the runtime and create a proxy to the document sandbox
        const { runtime } = addOnUISdk.instance;
        const sandboxProxy = await runtime.apiProxy(RuntimeType.documentSandbox);
        
        console.log("BrandFlow: Sandbox proxy created");
        
        // Render the app
        const rootElement = document.getElementById("root");
        if (rootElement) {
            const root = createRoot(rootElement);
            root.render(
                <App 
                    addOnUISdk={addOnUISdk} 
                    sandboxProxy={sandboxProxy as any} 
                />
            );
            console.log("BrandFlow: App rendered successfully");
        } else {
            console.error("BrandFlow: Root element not found");
        }
    } catch (error) {
        console.error("BrandFlow: Error initializing", error);
    }
});
