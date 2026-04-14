import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSyair(data: any) {
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
      model: "gemini-flash-latest",
      contents: prompt,
    });
    return response.text?.trim() || "Angka menanti di balik tabir,\nHarapan cerah dalam takdir.";
  } catch (error) {
    console.error("Error generating syair:", error);
    return "Angka menanti di balik tabir,\nHarapan cerah dalam takdir.";
  }
}

export async function generatePredictionImage(data: any) {
  const prompt = `A wide panoramic fantasy mystical cinematic banner for a prediction oracle.
Dimensions: 1200x480 pixels.
Character: ${data.character}
Background: ${data.background}
Style: ${data.visualStyle}, glowing, magical particles, HD, sharp detail.
Theme: Oracle, magic world, prophecy.

NUMBERS AND TEXT TO INCLUDE:
- Pasaran: "${data.pasaran}"
- Syair: "${data.syair}"
- BBFS: ${data.bbfs}
- 4D: ${data.angka4d}
- MAIN: ${data.angkaMain}
- SHIO: ${data.shio} (${data.angkaShio})

The numbers and shio should be displayed in glowing, mystical UI elements that look organized.
The Shio "${data.shio}" should have its corresponding animal spirit visible in the background aura.
Colors: Gold, Cream, Mystical Purple.`;

  const maxRetries = 2;
  let lastError: any = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed to generate image:`, error);
      if (i < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  console.error("All attempts to generate image failed:", lastError);
  // Fallback to a high-quality placeholder if generation fails
  return `https://picsum.photos/seed/mystical-oracle-${Date.now()}/1200/480`;
}
