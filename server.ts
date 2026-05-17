import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { imageData } = req.body;

      if (!imageData) {
        return res.status(400).json({ error: "Image data is required" });
      }

      // Base64 cleaning
      const base64Data = imageData.split(",")[1] || imageData;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              {
                text: `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘.

출력 형식은 반드시 아래 JSON 형식으로만 답변해줘. 마크다운, 설명 문장, 코드블록은 사용하지 마.

{
  "disclaimer": "사진 기반 분석은 조명, 화장, 필터, 카메라 색감에 따라 달라질 수 있으며 참고용 결과입니다.",
  "summary": "한 줄 요약",
  "tone_direction": "warm | cool | neutral",
  "season_type": "봄 웜톤 | 여름 쿨톤 | 가을 웜톤 | 겨울 쿨톤 | 중립톤",
  "sub_type": "세부 타입",
  "confidence": 0,
  "analysis": {
    "skin_tone": "피부 톤 분석",
    "brightness": "명도 분석",
    "saturation": "채도 분석",
    "contrast": "대비감 분석",
    "overall_impression": "전체 인상 분석"
  },
  "recommended_colors": [
    {
      "name": "색상명",
      "hex": "#FFFFFF",
      "reason": "추천 이유"
    }
  ],
  "avoid_colors": [
    {
      "name": "색상명",
      "hex": "#FFFFFF",
      "reason": "피하면 좋은 이유"
    }
  ],
  "makeup_recommendations": {
    "lip": ["추천 립 컬러"],
    "blush": ["추천 블러셔 컬러"],
    "eyeshadow": ["추천 아이섀도우 컬러"]
  },
  "hair_recommendations": ["추천 헤어 컬러"],
  "fashion_recommendations": ["추천 의류 컬러"],
  "style_tip": "스타일링 팁",
  "photo_quality_note": "사진 품질에 따른 분석 한계"
}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const resultText = response.text;
      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
