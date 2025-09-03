

import { GoogleGenAI, Type } from "@google/genai";
import { Faq } from "../types";

// This check is to prevent crashing in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : "";

if (!apiKey) {
  console.warn("API_KEY environment variable not set. Gemini API will not be available.");
}

const ai = new GoogleGenAI({ apiKey });

export const getSuggestedFaqs = async (userQuestion: string, faqs: Faq[], categoryContext?: string, lang: 'en' | 'ar' = 'en'): Promise<number[]> => {
  if (!apiKey) {
    return [];
  }

  const simplifiedFaqs = faqs.map(faq => ({ 
    id: faq.id, 
    question: lang === 'ar' ? faq.question_ar : faq.question 
  }));

  const contextPrompt = categoryContext
    ? `For extra context, here is some general information about the selected category: "${categoryContext}"`
    : '';

  const prompt = `
    Based on the user's question, identify the most relevant FAQs from the provided list.
    User Question: "${userQuestion}"
    
    ${contextPrompt}

    List of available FAQs:
    ${JSON.stringify(simplifiedFaqs)}
    
    Consider the general category context when making your decision.
    Return a JSON object containing an array of the IDs of the most relevant FAQs.
    If no FAQs are relevant, return an empty array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedFaqIds: {
              type: Type.ARRAY,
              items: {
                type: Type.NUMBER,
              }
            }
          }
        }
      }
    });

    const jsonText = response.text.trim();
    if (jsonText) {
      const result = JSON.parse(jsonText);
      return result.suggestedFaqIds || [];
    }
    return [];

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    return [];
  }
};