"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { width: 320, height: 240 });
function loadFont(fontName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield figma.loadFontAsync({ family: fontName, style: 'Regular' });
            yield figma.loadFontAsync({ family: fontName, style: 'Bold' });
        }
        catch (e) {
            console.log(`Could not load font ${fontName}, falling back to Inter`);
            yield figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            yield figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
        }
    });
}
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
}
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'generate-design') {
        const data = msg.data;
        // Load fonts before creating text
        yield loadFont(data.manifest.headingFont || 'Inter');
        yield loadFont(data.manifest.bodyFont || 'Inter');
        // Create main frame
        const pageFrame = figma.createFrame();
        pageFrame.name = `${data.manifest.businessName || 'Generated'} - ${data.manifest.websiteLayout || 'Homepage'}`;
        pageFrame.resize(1440, 1080); // Base desktop size, will grow
        // Layout direction
        pageFrame.layoutMode = 'VERTICAL';
        pageFrame.primaryAxisSizingMode = 'AUTO';
        pageFrame.counterAxisSizingMode = 'FIXED';
        // Set background color
        const isDark = data.manifest.themeMode === 'Dark';
        pageFrame.fills = [{ type: 'SOLID', color: isDark ? { r: 0.05, g: 0.05, b: 0.06 } : { r: 0.98, g: 0.98, b: 0.99 } }];
        const textColor = isDark ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 };
        const primaryColor = hexToRgb(data.manifest.primaryColor || '#3368F7');
        const secondaryColor = hexToRgb(data.manifest.secondaryColor || '#FF6B6B');
        // Create sections
        const sectionsToCreate = data.manifest.sectionOrder || data.manifest.sectionType || [];
        let yOffset = 0;
        for (const sectionName of sectionsToCreate) {
            const sectionFrame = figma.createFrame();
            sectionFrame.name = sectionName;
            sectionFrame.resize(1440, 600); // Default section height
            sectionFrame.layoutMode = 'VERTICAL';
            sectionFrame.paddingTop = 80;
            sectionFrame.paddingBottom = 80;
            sectionFrame.paddingLeft = 120;
            sectionFrame.paddingRight = 120;
            sectionFrame.itemSpacing = 24;
            sectionFrame.primaryAxisSizingMode = 'AUTO';
            sectionFrame.counterAxisSizingMode = 'FIXED';
            // Alternate section backgrounds
            const isAlt = sectionsToCreate.indexOf(sectionName) % 2 === 1;
            let sectionBgColor = isDark
                ? (isAlt ? { r: 0.08, g: 0.08, b: 0.09 } : { r: 0.05, g: 0.05, b: 0.06 })
                : (isAlt ? { r: 0.95, g: 0.95, b: 0.96 } : { r: 0.98, g: 0.98, b: 0.99 });
            // Use primary color for Hero sometimes
            if (sectionName === 'Hero Section' && !isDark) {
                sectionBgColor = primaryColor;
            }
            sectionFrame.fills = [{ type: 'SOLID', color: sectionBgColor }];
            // Section Heading
            const heading = figma.createText();
            heading.fontName = { family: data.manifest.headingFont || 'Inter', style: 'Bold' };
            heading.characters = sectionName;
            heading.fontSize = sectionName === 'Hero Section' ? 64 : 48;
            // Adjust text color if background is primary
            let currentTextColor = textColor;
            if (sectionName === 'Hero Section' && !isDark) {
                currentTextColor = { r: 1, g: 1, b: 1 }; // White text on primary bg
            }
            heading.fills = [{ type: 'SOLID', color: currentTextColor }];
            sectionFrame.appendChild(heading);
            // Look for specific content for this section from structured data if available
            let sectionContent = `Placeholder content for ${sectionName}. Automatically populated based on AI generated design schema and provided source materials.`;
            if (data.structuredPrompt && data.structuredPrompt.sections) {
                // Try to find matching section data
                const matchedSection = data.structuredPrompt.sections.find((s) => s === sectionName || (s.type && s.type === sectionName));
                if (matchedSection && typeof matchedSection === 'object' && matchedSection.description) {
                    sectionContent = matchedSection.description;
                }
            }
            const body = figma.createText();
            body.fontName = { family: data.manifest.bodyFont || 'Inter', style: 'Regular' };
            body.characters = sectionContent;
            body.fontSize = 18;
            body.fills = [{ type: 'SOLID', color: currentTextColor }];
            body.layoutAlign = 'STRETCH'; // Fill width
            sectionFrame.appendChild(body);
            // Add a placeholder block for image/interactive element
            const block = figma.createRectangle();
            block.resize(1200, 400);
            block.cornerRadius = 12;
            block.fills = [{ type: 'SOLID', color: secondaryColor, opacity: 0.2 }];
            block.strokes = [{ type: 'SOLID', color: secondaryColor }];
            block.strokeWeight = 2;
            block.dashPattern = [10, 10];
            sectionFrame.appendChild(block);
            pageFrame.appendChild(sectionFrame);
        }
        // Zoom to fit
        figma.viewport.scrollAndZoomIntoView([pageFrame]);
        figma.ui.postMessage({ type: 'done' });
    }
});
