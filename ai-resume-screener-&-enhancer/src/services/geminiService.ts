import { GoogleGenAI, Type } from "@google/genai";

export interface ResumeAnalysis {
  id: string;
  name: string;
  score: number;
  summary: string;
  highlights: {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
    reason: string;
  }[];
  fullText: string;
  pdfBuffer?: ArrayBuffer;
}

export async function analyzeResume(
  jd: string,
  resumeText: string,
  resumeName: string
): Promise<ResumeAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const prompt = `
    Analyze the following resume against the job description provided.
    
    Job Description:
    ${jd}
    
    Resume Content:
    ${resumeText}
    
    Tasks:
    1. Provide a match score from 0 to 100.
    2. Provide a brief summary of the candidate's suitability.
    3. Identify key parts of the resume that are highly relevant (positive) or missing/weak (negative) compared to the JD.
    4. Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The exact text from the resume to highlight" },
                type: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
                reason: { type: Type.STRING }
              },
              required: ["text", "type", "reason"]
            }
          }
        },
        required: ["score", "summary", "highlights"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: resumeName,
    score: result.score || 0,
    summary: result.summary || "",
    highlights: result.highlights || [],
    fullText: resumeText
  };
}
