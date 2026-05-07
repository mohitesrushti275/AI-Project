import { generateHash, getContentSummaryFromCache, setContentSummaryToCache } from './cacheService.js';

/**
 * Summarizes large content for context-only AI processing.
 */
export async function summarizeContent(client, content, platformType = 'anthropic') {
  if (!content || content.trim().length < 200) return content;

  const contentHash = generateHash(content);
  const cached = getContentSummaryFromCache(contentHash);
  if (cached) {
    console.log('[OptimizationService] Using cached content summary.');
    return cached;
  }

  console.log('[OptimizationService] Summarizing large content source...');
  
  const systemPrompt = "You are an expert content analyzer. Summarize the following text into a structured, technical design brief. Capture all key entities, value propositions, features, and specific data points, but remove fluff. Keep it under 500 words. Focus on what is needed to build a UI around this content.";
  
  let summary = '';
  if (platformType === 'openai') {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Use faster/cheaper model for summarization
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please summarize this content for a UI designer:\n\n${content}` }
      ],
      max_tokens: 1000,
    });
    summary = completion.choices[0].message.content;
  } else {
    const completion = await client.messages.create({
      model: 'claude-3-haiku-20240307', // Use faster/cheaper model for summarization
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Please summarize this content for a UI designer:\n\n${content}` }]
    });
    summary = completion.content[0].text;
  }

  setContentSummaryToCache(contentHash, summary);
  return summary;
}

/**
 * Cleans and optimizes the payload for the final prompt generation.
 */
export function optimizePayload(data) {
  // Remove binary data or large base64 strings if present in the main context
  // but ensure we keep the necessary metadata.
  const optimized = {
    businessName: data.businessName,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    headingFont: data.headingFont,
    bodyFont: data.bodyFont,
    websiteLayout: data.websiteLayout,
    themeMode: data.themeMode,
    sections: data.sections || [],
    sectionOrder: data.sectionOrder || [],
    referenceUrl: data.referenceUrl,
    // Add multiple references style summaries if available
    multipleReferences: (data.multipleAnalyses || []).map(ref => ({
      url: ref.url,
      style: ref.style,
      layout: ref.layout,
      description: ref.description
    })),
    // Add custom sections notes
    customSections: (data.clientResourcesSections || []).map(sec => ({
      type: sec.type,
      description: sec.description
    }))
  };

  return optimized;
}
