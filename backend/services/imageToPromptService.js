import sharp from 'sharp';

const UI_ANALYSIS_SYSTEM_PROMPT = `You are an elite Digital Architect and Visual Intelligence Engine.
Your task is to analyze a provided full-page website screenshot and extract its exact design system, component hierarchy, and layout structure. 

Return ONLY a single valid JSON object — no markdown fences, no explanation, no extra text.

{
  "style": "<describe overall visual style, e.g. 'Modern minimal SaaS, dark mode, glassmorphism'>",
  "layout": "<describe the global layout structure, e.g. 'Centered content, full-width hero, 3-column features'>",
  "typography": "<describe the font styles, weights, and hierarchy detected>",
  "colors": ["<hex shadow color>", "<hex primary>", "<hex accent>"],
  "sections_detected": ["<Hero>", "<Features>", "<Waitlist CTA>"],
  "uiPatterns": ["<Cards with glowing borders>", "<Sticky Nav>", "<Pill buttons>"],
  "spacing": "<describe the spacing rhythm and whitespace density, e.g. 'Generous whitespace, 64px section padding'>",
  "visualHierarchy": "<describe how focus is directed, e.g. 'Size-based hierarchy, high contrast CTA buttons'>",
  "human_readable_prompt": "<A highly detailed, 400+ word technical master prompt describing how to reconstruct this UI identically, describing all colors, spacing, structure, and aesthetic choices >"
}

RULES:
- Be precise, not poetic.
- Focus completely on frontend design, architecture, and styling.
- Analyze from top to bottom.
- Ensure the prompt is suitable for prompting AI UI code generators.
`;

export async function optimizeScreenshot(base64Image) {
  console.log('[ImageToPromptService] Optimizing screenshot for Anthropic...');
  const buffer = Buffer.from(base64Image, 'base64');
  
  // Resize to acceptable dimensions for Claude to process quickly
  const optimizedBuffer = await sharp(buffer)
    .resize(1920, 4000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
    
  return optimizedBuffer.toString('base64');
}

export async function analyzeUI_Image(anthropicClient, optimizedBase64Image, userContext = '') {
  console.log('[ImageToPromptService] Requesting UI structural analysis from Anthropic...');
  
  const userMessageContent = userContext 
    ? `Analyze this complete website screenshot and output the structured JSON intel required to rebuild its frontend design system.

CRITICAL OVERRIDES:
The user has specified the following brand and design constraints which MUST be used in your output (JSON and human_readable_prompt) instead of what is detected in the image:
${userContext}

INSTRUCTIONS: 
- Use the provided screenshot for LAYOUT, SPACING, and UI PATTERNS.
- Use the CRITICAL OVERRIDES for COLORS, TYPOGRAPHY, and BRAND IDENTITY.`
    : 'Analyze this complete website screenshot and output the structured JSON intel required to rebuild its frontend design system.';

  const completion = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.2,
    system: UI_ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessageContent
          },
          {
             type: 'image',
             source: {
               type: 'base64',
               media_type: 'image/jpeg',
               data: optimizedBase64Image,
             }
          }
        ]
      }
    ]
  });

  const rawContent = completion.content[0].text.trim();
  
  // JSON Extraction Strategies
  let jsonStr = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const lastBrace = jsonStr.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace < jsonStr.length - 1) {
    jsonStr = jsonStr.slice(0, lastBrace + 1);
  }
  if (!jsonStr.startsWith('{')) {
    const match = rawContent.match(/\{[\s\S]*\}/);
    if (match) {
      jsonStr = match[0];
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    console.error("[ImageToPromptService] Failed to parse JSON:", jsonStr);
    throw new Error('AI returned malformed JSON.');
  }

  return parsed;
}
