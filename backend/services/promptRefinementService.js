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

export async function refinePrompt(client, manifestContext, platformType = 'anthropic') {
  console.log(`[PromptRefinementService] Refining Master UI Prompt with ${platformType}...`);

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
    contentSource,
    contentSummary // NEW: Cached summary
  } = manifestContext;

  const hasSections = clientResourcesSections && clientResourcesSections.length > 0;
  const hasReference = (referenceUrl && referenceUrl.trim() !== '') || (multipleReferences && multipleReferences.length > 0);
  const hasContent = contentSource && contentSource.trim() !== '';

  let priorityDirective = '';
  if (hasSections && hasReference && hasContent) {
    priorityDirective = `### LOGIC RULE: [Sections + Reference + Content]
Incorporate the provided content effectively. The UI must be built around the specific data points and value propositions.`;
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

### CONTENT INTEGRATION RULE:
1. DESIGN AROUND CONTENT: Use the provided "CONTENT SUMMARY" to structure the UI architecture.
2. REFERENCE THE VERBATIM BLOCK: Your instructions must explicitly tell the downstream AI to pull all specific copy, text, and data from the "[VERBATIM CONTENT REPOSITORY]" block at the end of the prompt.
3. NO SUMMARIZATION IN OUTPUT: When describing sections, specify EXACTLY which parts of the verbatim content go where.

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
- Output ONLY the final Master Prompt text. No conversational preamble.
- BE EXHAUSTIVE.
- Your primary failure mode is being too generic. BE SPECIFIC.`;

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

  const userMessage = `Refine this design context into an exhaustive Master UI Prompt.

MANIFEST INPUTS:
- Business Name: ${businessName || 'N/A'}
- Ordered Sections: ${sectionOrder ? sectionOrder.join(' → ') : 'N/A'}
${customSectionsText}
${multipleReferencesText}

CONTENT SUMMARY (FOR ARCHITECTURE):
${contentSummary || 'No specific content provided. Generate realistic professional dummy copy.'}

INSTRUCTIONS:
1. Design a UI that perfectly accommodates the content described in the summary.
2. Apply the reference style to the layout.
3. MAXIMIZE OUTPUT CAPACITY: Provide an exhaustive, line-by-line breakdown of every UI component, animation, and responsive behavior.
4. DO NOT TRUNCATE.`;

  let finalPrompt = '';
  
  // Use a single attempt for speed, as we will manually append content at the end for fidelity
  console.log(`[Refinement] Generating prompt (${platformType})...`);
  
  if (platformType === 'openai') {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: refinementSystemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.4,
      max_tokens: 4000,
    });
    finalPrompt = completion.choices[0].message.content.trim();
  } else {
    const completion = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4000,
      temperature: 0.4,
      system: refinementSystemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });
    finalPrompt = completion.content[0].text.trim();
  }

  // ENSURE VERBATIM FIDELITY: Manually append the full content repository at the end.
  // This is much faster than asking the AI to repeat 3000 words.
  if (contentSource && contentSource.trim().length > 0) {
    finalPrompt += `\n\n---
[VERBATIM CONTENT REPOSITORY]
${contentSource}
---
*Note: The architectural breakdown above specifies how to integrate this verbatim text.*`;
  }

  return finalPrompt;
}
