import { GoogleGenAI, Type } from "@google/genai";

export async function generateSyair(data: any) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const prompt = `Generate a mysterious, poetic, and meaningful Indonesian "Syair" or "Pantun" for a prediction tool.
Context:
- Data Prediksi: ${data.dataPrediksi}
- Pasaran: ${data.pasaran}
- BBFS: ${data.bbfs}
- Angka Main: ${data.angkaMain}
- 4D: ${data.angka4d}
- Shio: ${data.shio}

Requirements:
- Maximum 2 lines.
- Language: Indonesian.
- Style: Mysterious, poetic, full of meaning.
- Must contain elements of numbers and hope.
- Do not include any other text, just the poem.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "Angka menanti di balik tabir,\nHarapan cerah dalam takdir.";
  } catch (error: any) {
    console.error("Error generating syair:", error);
    return "Angka menanti di balik tabir,\nHarapan cerah dalam takdir.";
  }
}

export async function generatePredictionImage(data: any) {
  // Use the selected API key if available, otherwise fallback to the default
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `A wide panoramic fantasy mystical cinematic banner for a prediction oracle.
Dimensions: 1200x480 pixels.
Character: ${data.character}
Background: ${data.background}
Style: ${data.visualStyle}, glowing, magical particles, HD, sharp detail.
Theme: Oracle, magic world, prophecy.

BRANDING:
- DO NOT generate any logos or text branding yourself. I will overlay the official logo manually.
- Leave the top-left and top-right corners clear of any critical visual elements to allow for branding overlays.

TEXT LAYOUT (NEAT AND STRUCTURED):
- Pasaran: "${data.pasaran}" (Rendered as a glowing 3D title at the top center).
- Syair: "${data.syair}" (Rendered in an elegant, readable poetic font at the bottom center).

NUMBERS (ARRANGED IN A NEAT GRID OR ROW):
1. BBFS: ${data.bbfs}
2. 4D: ${data.angka4d}
3. MAIN: ${data.angkaMain}
4. ANGKA SHIO: ${data.angkaShio}
5. NAMA SHIO: ${data.shio}

The numbers and shio should be displayed in glowing, mystical UI cards or floating scrolls that look organized and professional.
Ensure each field (BBFS, 4D, MAIN, ANGKA SHIO, SHIO) is distinct and clearly labeled.
The Shio "${data.shio}" should have its corresponding animal spirit visible in the background aura.
No whitespace, full bleed, wide banner format.
Colors: Gold, Cream, Mystical Purple.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    // Check for quota error
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    
    // Fallback to a high-quality placeholder if generation fails for other reasons
    return `https://picsum.photos/seed/mystical-oracle-${Date.now()}/1200/480`;
  }
}
