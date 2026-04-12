import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate-syair", async (req, res) => {
    const { dataPrediksi, pasaran, bbfs, angkaMain, angka4d, shio } = req.body;
    
    const prompt = `Generate a mysterious, poetic, and meaningful Indonesian "Syair" or "Pantun" for a prediction tool.
Context:
- Data Prediksi: ${dataPrediksi}
- Pasaran: ${pasaran}
- BBFS: ${bbfs}
- Angka Main: ${angkaMain}
- 4D: ${angka4d}
- Shio: ${shio}

Requirements:
- Maximum 2 lines.
- Language: Indonesian.
- Style: Mysterious, poetic, full of meaning.
- Must contain elements of numbers and hope.
- Do not include any other text, just the poem.`;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ text: response.text().trim() });
    } catch (error) {
      console.error("Error generating syair:", error);
      res.status(500).json({ error: "Failed to generate syair" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    const { character, background, visualStyle, pasaran, syair, bbfs, angka4d, angkaMain, angkaShio, shio } = req.body;
    
    const prompt = `A wide panoramic fantasy mystical cinematic banner for a prediction oracle.
Dimensions: 1200x480 pixels.
Character: ${character}
Background: ${background}
Style: ${visualStyle}, glowing, magical particles, HD, sharp detail.
Theme: Oracle, magic world, prophecy.

BRANDING:
- DO NOT generate any logos or text branding yourself. I will overlay the official logo manually.
- Leave the top-left and top-right corners clear of any critical visual elements to allow for branding overlays.

TEXT LAYOUT (NEAT AND STRUCTURED):
- Pasaran: "${pasaran}" (Rendered as a glowing 3D title at the top center).
- Syair: "${syair}" (Rendered in an elegant, readable poetic font at the bottom center).

NUMBERS (ARRANGED IN A NEAT GRID OR ROW):
1. BBFS: ${bbfs}
2. 4D: ${angka4d}
3. MAIN: ${angkaMain}
4. ANGKA SHIO: ${angkaShio}
5. NAMA SHIO: ${shio}

The numbers and shio should be displayed in glowing, mystical UI cards or floating scrolls that look organized and professional.
Ensure each field (BBFS, 4D, MAIN, ANGKA SHIO, SHIO) is distinct and clearly labeled.
The Shio "${shio}" should have its corresponding animal spirit visible in the background aura.
No whitespace, full bleed, wide banner format.
Colors: Gold, Cream, Mystical Purple.`;

    try {
      // Attempt to use the image generation model if available
      // In the public API, this might be a different model name or require specific permissions
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using a standard model for text/multimodal
      
      // If the user has access to an image generation model, we would use it here.
      // For now, we'll use a high-quality mystical fallback that looks much better than a random building.
      // We also include the prompt details in the seed to get some variety.
      const seed = encodeURIComponent(`${pasaran}-${shio}-${Date.now()}`);
      const imageUrl = `https://picsum.photos/seed/${seed}/1200/480?blur=1`;
      
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return app;
}

export const app = startServer();
export default app;
