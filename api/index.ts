import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// إعداد خيارات CORS
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key, x-gemini-model'
  );
}

// استخراج البيانات والمفاتيح
function extractAiCredentials(req: VercelRequest) {
  const headerKey = req.headers['x-gemini-api-key'] as string | undefined;
  const bodyKey = req.body?.apiKey as string | undefined;
  const apiKey = (headerKey || bodyKey || process.env.GEMINI_API_KEY || '').trim();

  const headerModel = req.headers['x-gemini-model'] as string | undefined;
  const bodyModel = req.body?.model as string | undefined;
  const model = (headerModel || bodyModel || 'gemini-2.5-flash').trim();

  return { apiKey, model };
}

function getGenAI(customApiKey?: string) {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('لم يتم العثور على مفتاح GEMINI_API_KEY.');
  }
  return new GoogleGenAI({ apiKey });
}

// الدالة الرئيسية المتوافقة مع Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // معرفة المسار المطلوب من رابط الـ API
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = url.pathname.replace('/api', '');

  try {
    // 1. Endpoint: /test-ai-connection
    if (pathname === '/test-ai-connection' || pathname === '/test-ai-connection/') {
      const { apiKey, model } = extractAiCredentials(req);
      const ai = getGenAI(apiKey);
      const targetModel = model || 'gemini-2.5-flash';

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: "اختبار اتصال سريع: قل 'متصل بنجاح' فقط.",
      });

      return res.status(200).json({
        success: true,
        modelUsed: targetModel,
        sampleResponse: response.text?.trim() || 'متصل بنجاح',
        message: `تم الاتصال بنموذج الذكاء الاصطناعي بنجاح! 🟢`,
      });
    }

    // 2. Endpoint: /generate-certificate-content
    if (pathname === '/generate-certificate-content') {
      const { apiKey, model } = extractAiCredentials(req);
      const { studentName, subject, achievement, recipientGender } = req.body || {};
      const isFemale = recipientGender === 'female';
      const ai = getGenAI(apiKey);

      const prompt = `أنت خبير صياغة شهادات تقدير. أرجِع JSON يحتوي على: title, recipientIntro, appreciationText, poemOrQuote, badgeTitle لتكريم ${isFemale ? 'طالبة' : 'طالب'} اسمه/ا ${studentName || ''} في مادة ${subject || 'التفوق العام'}.`;

      const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return res.status(200).json({ success: true, result: JSON.parse(response.text || '{}') });
    }

    // مسار افتراضي لحالة عدم العثور على Endpoint
    return res.status(404).json({ error: 'Endpoint Not Found', pathname });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'حدث خطأ في السيرفر' });
  }
}

