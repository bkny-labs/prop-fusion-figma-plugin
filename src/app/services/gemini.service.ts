import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const MODEL_NAME = "gemini-pro"; 

export class GeminiService {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model: GenerativeModel; 

  constructor() {
    this.model = this.genAI.getGenerativeModel({ model: MODEL_NAME }); 
  }

  async sendPromptToGemini(promptText: string): Promise<string> {
    try {
      const requestData = {
        contents: [{ 
          parts: [{ text: promptText }] 
        }]
      };

      const response = await fetch(GEMINI_API_ENDPOINT + '?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY 
        },
        body: JSON.stringify(requestData)
      });

      const text = await response.text();
      console.log('🍇🍇 Gemini response:', text);
      return text;

    } catch (error) {
      console.error('Failed to send prompt to Gemini:', error);
      throw error; 
    }
  }
}

export const geminiService = new GeminiService();