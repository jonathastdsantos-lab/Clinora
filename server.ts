import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/ai/transcribe", async (req, res) => {
    try {
      const { audioBase64, context } = req.body;
      if (!audioBase64) return res.status(400).json({ error: "Missing audio data" });

      const prompt = `Transcreva este áudio médico/clínico. O contexto é: ${context || 'atendimento geral'}. Transforme em um texto estruturado para prontuário se possível.`;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "audio/wav", // Adjusted as needed
            data: audioBase64
          }
        }
      ]);

      res.json({ text: result.response.text() });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { data } = req.body;
      const prompt = `Analise estes dados da clínica e forneça 3 insights estratégicos (business intelligence). Dados: ${JSON.stringify(data)}`;
      
      const result = await model.generateContent(prompt);
      res.json({ insights: result.response.text() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
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
}

startServer();
