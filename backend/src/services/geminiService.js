const { GoogleGenAI } = require('@google/genai');

/**
 * Helper to initialize Google Gen AI SDK
 */
function getGenAIClient(overrideApiKey) {
  const apiKey = overrideApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

/**
 * Mock fallback generator when API key is not configured
 */
function generateFallbackAnalysis(filename = 'uploaded_image.png') {
  return {
    isMock: true,
    message: 'Displaying sample analysis preview.',
    primaryIdentification: `Visual analysis of ${filename}.`,
    title: `Scene Analysis: ${filename}`,
    summary: `We analyzed the uploaded file '${filename}'. Although the Gemini API is currently unavailable (e.g. key missing or rate-limited), this local model mockup represents how PixelAgent processes image structures, outputs classification tags, and generates confidence lists.`,
    tags: ['Uploaded Image', 'Local Preview', 'Vision Analysis', 'Mock Mode'],
    detectedObjects: [
      { label: 'Uploaded Media', confidence: '100%', description: `File named '${filename}'` },
      { label: 'AI Scanner', confidence: '95%', description: 'Visual scanner overlay engine' }
    ]
  };
}

const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Executes a content generation request using a fallback list of models
 */
async function generateContentWithFallback({ ai, contents, fallbackModels = FALLBACK_MODELS }) {
  let lastError = null;
  for (const model of fallbackModels) {
    try {
      console.log(`🤖 Attempting Gemini content generation with model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: contents
      });
      console.log(`✅ Gemini content generation succeeded using model: ${model}`);
      return { response, modelUsed: model };
    } catch (err) {
      console.warn(`⚠️ Gemini model ${model} failed:`, err.message || err);
      lastError = err;
      // Continue to next model
    }
  }
  throw lastError || new Error('All Gemini models in fallback chain failed');
}

/**
 * Primary function to analyze an image using Gemini models with fallback
 */
async function analyzeImage({ imageBuffer, mimeType, apiKey = '', filename = 'uploaded_image.png' }) {
  const ai = getGenAIClient(apiKey);
  
  if (!ai) {
    console.warn('⚠️ GEMINI_API_KEY missing. Returning fallback sample analysis.');
    return generateFallbackAnalysis(filename);
  }

  const base64Image = imageBuffer.toString('base64');

  const systemPrompt = `
You are an expert computer vision and multimodal AI agent. Analyze the provided image in detail and return a strictly valid JSON object (no markdown surrounding ticks, ONLY raw JSON).

Required JSON format:
{
  "primaryIdentification": "Direct precise 1-sentence identification of who/what is in the image",
  "title": "A concise title summarizing the image",
  "summary": "Detailed narrative description of the image content and key features (3-4 sentences)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "detectedObjects": [
    { "label": "Object Name", "confidence": "95%", "description": "Short description of location and appearance" }
  ]
}
`;

  try {
    const { response, modelUsed } = await generateContentWithFallback({
      ai,
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: base64Image
          }
        },
        systemPrompt
      ]
    });

    const responseText = response.text ? response.text.trim() : '';

    // Sanitize json formatting if model included code blocks
    let cleanJsonString = responseText;
    if (cleanJsonString.startsWith('```json')) {
      cleanJsonString = cleanJsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJsonString.startsWith('```')) {
      cleanJsonString = cleanJsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedResult = JSON.parse(cleanJsonString);
    parsedResult.isMock = false;
    parsedResult.modelUsed = modelUsed;
    return parsedResult;

  } catch (error) {
    console.error('All Gemini models failed to analyze image:', error);
    const mockResult = generateFallbackAnalysis(filename);
    mockResult.message = `Gemini API quota exceeded or key invalid. Displaying local fallback analysis so the app doesn't crash. (Error: ${error.message})`;
    return mockResult;
  }
}

/**
 * Chat with the analyzed image using fallback models
 */
async function chatWithImage({ imageBuffer, mimeType, chatHistory = [], userQuestion }) {
  const ai = getGenAIClient();

  if (!ai) {
    return {
      reply: 'GEMINI_API_KEY is not configured in backend/.env. Please add your key to converse live with your image!'
    };
  }

  const base64Image = imageBuffer.toString('base64');
  
  const contents = [
    {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: base64Image
      }
    },
    `Context: You are answering a question about this image. Answer directly, concisely, and accurately based on visual facts in the image.\n\nUser Question: ${userQuestion}`
  ];

  try {
    const { response, modelUsed } = await generateContentWithFallback({
      ai,
      contents: contents
    });

    return {
      reply: response.text || 'I analyzed the image but could not generate a textual response.',
      modelUsed: modelUsed
    };
  } catch (err) {
    console.error('Error in chatWithImage across all fallback models:', err);
    throw new Error(`Chat processing failed: ${err.message}`);
  }
}

module.exports = {
  analyzeImage,
  chatWithImage,
  getGenAIClient
};
