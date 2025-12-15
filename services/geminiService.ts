
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// We won't crash if no key, just return empty.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const suggestHabits = async (focusArea: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return [
      "API Anahtarı eksik.",
      "Lütfen env dosyasına API_KEY ekleyin.",
      "Sadece manuel giriş."
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `"${focusArea}" konusuna odaklanan bir kullanıcı için 3 adet basit, RPG tarzı alışkanlık ismi öner (Türkçe). 
      Kısa tut (5 kelimenin altında). 
      Örnek çıktı: ["Kadim Parşömenleri Oku", "Kılıç Talimi Yap", "Meditasyon"].`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Öneriler alınamadı."];
  }
};
