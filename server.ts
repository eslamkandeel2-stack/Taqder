import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI lazy/safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// AI Certificate Generation Endpoint
app.post("/api/generate-certificate-content", async (req, res) => {
  try {
    const { studentName, subject, achievement, grade, tone, schoolName, teacherName } = req.body;

    const ai = getGenAI();
    const prompt = `أنت خبير في كتابة شهادات التقدير والجوائز التعليمية باللغة العربية الفصحى الراقية.
قم بصياغة نص شهادة تقدير مخصصة ومبهرة باللغة العربية بناءً على البيانات التالية:
- اسم الطالب/الطالبة: ${studentName || "الطالب المتميز"}
- المادة / المجال: ${subject || "التفوق العام"}
- سبب التكريم / الإنجاز: ${achievement || "الاجتهاد والسلوك المتميز والتفوق الدراسي"}
- الصف / المرحلة: ${grade || "المرحلة الدراسية"}
- النبرة والأسلوب المطلوب: ${tone || "حماسي وراقي ورسمي"}
- اسم المدرسة / الجهة: ${schoolName || "مدرسة التميز والإبداع"}
- اسم المعلم / المدير: ${teacherName || "إدارة المدرسة"}

المطلوب إرجاع كائن JSON حصراً بالهيكل التالي:
1. title: عنوان الشهادة (مثال: "شهادة تقدير وتفوق راقٍ", "وسام التميز الأكاديمي", "شهادة شكر وتقدير")
2. recipientIntro: عبارة تقديم الطالب (مثال: "تتقدم إدارة المدرسة بوافر الشكر والتقدير للطالب المبدع:")
3. appreciationText: نص التكريم والشكر التفصيلي (فقرة مشجعة وجميلة من 2-4 أسطر تبرز جهوده وتتمنى له مستقبلاً باهراً)
4. poemOrQuote: بيت شعر أو حكمة ملهمة قصيرة باللغة العربية تناسب المناسبة.
5. badgeTitle: اسم الشارة أو الوسام المقترح (مثال: "نجم الأسبوع", "فارس الرياضيات", "صانع الأمل", "عبقري العلوم").
6. primaryColorHex: لون رئيسي مقترح بصيغة Hex (مثال: "#0f172a" أو "#065f46" أو "#1e1b4b" أو "#854d0e").
7. secondaryColorHex: لون ثانوي مقترح بصيغة Hex (مثال: "#d97706" أو "#059669" أو "#4f46e5" أو "#ca8a04").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            recipientIntro: { type: Type.STRING },
            appreciationText: { type: Type.STRING },
            poemOrQuote: { type: Type.STRING },
            badgeTitle: { type: Type.STRING },
            primaryColorHex: { type: Type.STRING },
            secondaryColorHex: { type: Type.STRING },
          },
          required: ["title", "recipientIntro", "appreciationText", "badgeTitle"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json({ success: true, result: data });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "تعذر توليد نص الشهادة بالذكاء الاصطناعي",
    });
  }
});

// AI Assistant for Certificate Suggestions & Batch Help
app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { prompt: userPrompt, category } = req.body;
    const ai = getGenAI();

    const systemInstruction = `أنت مساعد ذكي متخصص في تصاميم وعبارات شهادات التقدير والشكر للطلاب والأنشطة المدرسية باللغة العربية.
قدم إجابات واضحة ومقترحات جذابة، أفكار شهادات، عبارات تحفيزية، أو حلول سريعة. الإجابة باللغة العربية وبنسق عصري ومنسق.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "فشل الاتصال بالمساعد الذكي",
    });
  }
});

// AI Auto-Tune Layout, Colors, & Phrases for Uploaded Background
app.post("/api/ai-tune-background", async (req, res) => {
  try {
    const { imageDataUrl, currentData } = req.body;
    const ai = getGenAI();

    let contents: any[] = [];

    // If image data URL (base64) provided, send as inline image for Gemini Vision multimodal analysis
    if (imageDataUrl && typeof imageDataUrl === "string" && imageDataUrl.startsWith("data:image/")) {
      const mimeMatch = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const base64Data = imageDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const promptText = `أنت خبير تصاميم الشهادات الرسمية باللغة العربية ومصمم جرافيك محترف.
قم بتحليل صورة خلفية الشهادة المرفقة (أو وصفها) وضبط ألوان وعبارات التكريم تلقائياً لتكون متناسقة تماماً مع ألوان وخلفية هذه الصورة وبأعلى درجات المقروئية والجمال.

البيانات الحالية للشهادة:
- العنوان: ${currentData?.title || "شهادة شكر وتقدير"}
- تقديم المكرم: ${currentData?.recipientIntro || "تتقدم إدارة المدرسة بوافر الشكر والتقدير للطالب/ـة:"}
- نص الشكر: ${currentData?.appreciationText || "تقديراً لجهوده المتميزة وتفوقه الدراسي..."}
- بيت الشعر: ${currentData?.poemOrQuote || "من يعملِ المثقالَ خيراً يجدهُ"}

المطلوب:
1. صياغة وتوزيع عبارات الشهادة (title, recipientIntro, appreciationText, poemOrQuote) في أسطر قصيرة متوازنة وجميلة جداً تناسب هذه الخلفية المحددة.
2. اختيار ألوان ذكية عالية المقروئية والتباين:
   - textColor: لون النص الأساسي (مثلاً #0f172a أو #18181b للخلفيات الفاتحة، أو #ffffff / #fef08a للخلفيات الغامقة)
   - primaryColor: اللون الرئيسي للعنوان والشارات
   - secondaryColor: اللون الثانوي للزخارف والأختام
   - borderColor: لون الإطار المفضل
   - bgCardBacking: هل نوصي بوضع حاوية خلفية خفيفة شفافة خلف النص لزيادة وضوح العبارات فوق زخارف الصورة؟ (true/false)
   - bgCardOpacity: درجة شفافية الحاوية (مثلاً 0.80 أو 0.65)

أرجع النتيجة كـ JSON حصراً.`;

    contents.push(promptText);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            recipientIntro: { type: Type.STRING },
            appreciationText: { type: Type.STRING },
            poemOrQuote: { type: Type.STRING },
            textColor: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            borderColor: { type: Type.STRING },
            bgCardBacking: { type: Type.BOOLEAN },
            bgCardOpacity: { type: Type.NUMBER },
          },
          required: ["title", "recipientIntro", "appreciationText", "textColor", "primaryColor"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json({ success: true, result: data });
  } catch (error: any) {
    console.error("AI Tune Background Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "تعذر ضبط العبارات والألوان على الصورة المرفوعة",
    });
  }
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function startServer() {
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
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
