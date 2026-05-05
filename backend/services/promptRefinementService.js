/**
 * Service to refine a base design analysis into a final Master UI Prompt.
 */

/**
 * Helper to check if the generated prompt preserves the core of the input content.
 * We check if the start, middle, and end of the content are present to detect summarization/truncation.
 */
function validateContentFidelity(inputContent, generatedPrompt) {
  if (!inputContent || inputContent.trim().length < 50) return true;
  
  const cleanInput = inputContent.trim().toLowerCase().replace(/\s+/g, ' ');
  const cleanOutput = generatedPrompt.trim().toLowerCase().replace(/\s+/g, ' ');

  // Sampling 3 points for a robust check
  const startMarker = cleanInput.substring(0, 40);
  const midMarker = cleanInput.substring(Math.floor(cleanInput.length / 2), Math.floor(cleanInput.length / 2) + 40);
  const endMarker = cleanInput.substring(cleanInput.length - 40);

  const hasStart = cleanOutput.includes(startMarker);
  const hasMid = cleanOutput.includes(midMarker);
  const hasEnd = cleanOutput.includes(endMarker);

  if (!hasStart || !hasMid || !hasEnd) {
    console.warn(`[Refinement Check] Failed markers: Start=${hasStart}, Mid=${hasMid}, End=${hasEnd}`);
    console.warn(`[Refinement Check] Output Length: ${generatedPrompt.length} vs Input Length: ${inputContent.length}`);
  }

  return hasStart && hasMid && hasEnd;
}

export async function refinePrompt(anthropicClient, manifestContext) {
  console.log('[PromptRefinementService] Refining Master UI Prompt with Claude (Logic v2026 - Integrity Mode)...');

  const {
    businessName,
    primaryColor,
    secondaryColor,
    headingFont,
    bodyFont,
    websiteLayout,
    sections,
    sectionOrder,
    themeMode,
    structuredPrompt, // from AI analysis
    referenceUrl,
    multipleReferences,
    clientResourcesSections,
    contentSource
  } = manifestContext;

  // ── Determine Active Logic Rule ───────────────────────────────────────────
  const hasSections = clientResourcesSections && clientResourcesSections.length > 0;
  const hasReference = (referenceUrl && referenceUrl.trim() !== '') || (multipleReferences && multipleReferences.length > 0);
  const hasContent = contentSource && contentSource.trim() !== '';

  let priorityDirective = '';
  if (hasSections && hasReference && hasContent) {
    priorityDirective = `### LOGIC RULE: [Sections + Reference + Content]
Incorporate the COMPLETE uploaded content VERBATIM. The UI must be built around the full, unedited text.`;
  } else if (hasSections && hasReference) {
    priorityDirective = `### LOGIC RULE: [Sections + Reference]
Apply the style and structure of the reference website while embedding ALL Added Sections and their specific notes.`;
  } else if (hasSections && !hasReference) {
    priorityDirective = `### LOGIC RULE: [Sections Only]
Base the prompt entirely on the sections. Use every note and description word-for-word.`;
  } else if (!hasSections && hasReference) {
    priorityDirective = `### LOGIC RULE: [Reference Only]
Use the style, structure, and design of the reference website as the absolute foundation.`;
  }

  const refinementSystemPrompt = `You are a Senior Design Director and Expert UI Prompt Engineer.
Your goal is to generate a massive, technical, and ABSOLUTE Master UI Prompt.
You are tasked with providing HYPER-DETAILED, EXHAUSTIVE, and MICROSCOPIC technical specifications.
The output capacity must be maximized: do not be concise, be voluminous and precise.
Every pixel, interaction, and content piece must be described in elaborate detail.

### VERBATIM CONTENT RULE (ABSOLUTE PRIORITY):
1. ZERO TOLERANCE FOR SUMMARIZATION: You are strictly forbidden from summarizing, condensing, or rephrasing any part of the "ATTACHED CONTENT REFERENCE".
2. VERBATIM INJECTION: You MUST copy and paste the entire provided text exactly as it is. If the text is 3000 words, your prompt must contain those 3000 words.
3. PRESERVE ALL DETAILS: Every feature, benefit, price, and description must be present.
4. STRUCTURAL INTEGRITY: You may distribute the content across different UI sections, but every single character must be accounted for in the final output.
5. NO TRUNCATION: If you feel the prompt is included, DO NOT STOP. Continue until every word is included.
6. FALLBACK LOGIC: If "ATTACHED CONTENT REFERENCE" is MISSING or EMPTY, you MUST generate highly realistic, professional, and detailed dummy content that fits the "${businessName}" brand and "${websiteLayout}" layout perfectly. Do not use generic "Lorem Ipsum".

### ZERO-TOLERANCE RULES:
1. 100% INPUT COVERAGE: Include every single section, note, image intelligence, and reference URL requirement.
2. NO TRUNCATION: Generate the FULL prompt from start to finish. Do not stop halfway.
3. STYLE FUSION: Strictly apply the design direction from the Reference Website while embedding the full content.

### TOP PRIORITY DIRECTIVES (IMMUTABLE):
- Business Name: "${businessName || 'A Modern Brand'}"
- Brand Colors: Primary (${primaryColor}), Secondary (${secondaryColor})
- Typography: Headings (${headingFont}), Body (${bodyFont})
- Theme Mode: ${themeMode || 'Dark'} Mode

${priorityDirective}

RULES:
- RESPONSE STRUCTURE: You MUST start your response with a block titled "[VERBATIM CONTENT REPOSITORY]" containing the entire uploaded text. Only then should you proceed to the Master UI Prompt breakdown. This ensures 100% data integrity.
- Output ONLY the final Master Prompt text. No conversational preamble.
- BE EXHAUSTIVE. BE VERBATIM.
- Your primary failure mode is summarizing. DO NOT SUMMARIZE.
- If generating dummy content, make it indistinguishable from real professional copy.`;

  let multipleReferencesText = '';
  if (multipleReferences && multipleReferences.length > 0) {
    multipleReferencesText = '\nMULTIPLE REFERENCE SOURCES:\n';
    multipleReferences.forEach((ref, index) => {
      multipleReferencesText += `--- Source ${index + 1}: ${ref.url} ---\nExtracted Style: ${ref.style}\n`;
    });
  }

  let customSectionsText = '';
  if (clientResourcesSections && clientResourcesSections.length > 0) {
    customSectionsText = '\nCUSTOM SECTIONS & NOTES:\n';
    clientResourcesSections.forEach((sec) => {
      customSectionsText += `- ${sec.type}: "${sec.description || 'N/A'}"\n`;
    });
  }

  const userMessage = `Refine this design context into an exhaustive, VERBATIM Master UI Prompt.

MANIFEST INPUTS:
- Business Name: ${businessName || 'N/A'}
- Ordered Sections: ${sectionOrder ? sectionOrder.join(' → ') : 'N/A'}
${customSectionsText}
${multipleReferencesText}

INSTRUCTIONS:
1. Embed the provided content VERBATIM into the breakdown.
2. Apply the reference style to the layout.
3. MAXIMIZE OUTPUT CAPACITY: Provide an exhaustive, line-by-line breakdown of every UI component, animation, and responsive behavior.
4. DO NOT SUMMARIZE. DO NOT TRUNCATE.`;

  let contentSourceText = '';
  if (contentSource) {
    contentSourceText = `\n\n### ATTACHED CONTENT REFERENCE (MUST USE VERBATIM)\n${contentSource}\n\nCRITICAL: You are required to include every word of the text above in the final prompt. NO EXCEPTIONS.`;
  }

  const finalUserMessage = userMessage + contentSourceText;

  let finalPrompt = '';
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    console.log(`[Refinement] AI Attempt ${retryCount + 1}/${maxRetries + 1}...`);
    
    const completion = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      temperature: retryCount > 0 ? 0.2 : 0.4,
      system: refinementSystemPrompt + (retryCount > 0 ? "\n\nCRITICAL ERROR: Your previous attempt failed because you summarized or omitted the content. You MUST include every single word VERBATIM this time. DO NOT SUMMARIZE." : ""),
      messages: [{ role: 'user', content: finalUserMessage }]
    });

    finalPrompt = completion.content[0].text.trim();

    if (validateContentFidelity(contentSource, finalPrompt)) {
      console.log('[Refinement] Integrity check PASSED.');
      break;
    } else {
      console.warn('[Refinement] Integrity check FAILED. Content was summarized or truncated. Retrying with higher pressure...');
      retryCount++;
    }
  }

  // Final Safety Net: If even after retries the content is missing, manually append it
  // This ensures the user NEVER gets a truncated prompt for their credits.
  if (contentSource && contentSource.trim().length > 50 && !validateContentFidelity(contentSource, finalPrompt)) {
    console.warn('[Refinement] Safety Net Triggered: Manually appending verbatim content to ensure zero truncation.');
    finalPrompt += `\n\n### FULL VERBATIM CONTENT REFERENCE (GUARANTEED COMPLETENESS)\n${contentSource}\n\n*Note: The AI provided an optimized integration above, but this block contains the 100% verbatim source material as requested.*`;
  }

  return finalPrompt;
}




