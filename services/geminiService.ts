import { GoogleGenAI } from "@google/genai";

// Caches the AI client instance.
let ai: GoogleGenAI | null = null;

/**
 * Gets the GoogleGenAI client instance, initializing it if necessary.
 * This function is designed to work in a browser environment where `process.env`
 * might not be available, preventing the app from crashing on load.
 * @returns The GoogleGenAI client instance.
 * @throws {Error} if the API key is not configured.
 */
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    
    // In a browser environment without a build process, `process` is not defined.
    // This check prevents a ReferenceError and allows the app to run.
    if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
        throw new Error("API Key not configured. Interactive demo is disabled.");
    }

    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
};

export const recognizeDigit = async (base64ImageData: string): Promise<string> => {
  try {
    const aiClient = getAiClient();
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: base64ImageData,
      },
    };
    
    const textPart = {
        text: "You are an expert MNIST handwritten digit recognition model. Analyze this image of a handwritten digit. Your response must be only the single digit (0-9) you recognize. Provide no other explanation, text, or formatting. Just the digit."
    };

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error recognizing digit:", error);
    // Propagate the error message to be displayed in the UI.
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};
