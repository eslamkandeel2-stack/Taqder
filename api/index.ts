import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// إعداد خيارات CORS للسماح بالاتصال من الواجهة الأمامية
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key, x-gemini-model'
  );
}

// استخراج مفتاح API والبيانات بأمان
function extractAiCredentials(req: VercelRequest) {
  let bodyData = req.body;
  if (typeof req.body === 'string' && req.body.trim() !== '') {
    try {
      bodyData = JSON.parse(req.body);
    } catch (e) {
      bodyData = {};
    }
  }

  const headerKey = req.headers['x-gemini-api-key'] as string | undefined;
  const bodyKey = bodyData?.apiKey as string | undefined;
  const apiKey = (headerKey || bodyKey || process.env.GEMINI_API_KEY || '').trim();

  const headerModel = req.headers['x-gemini-model'] as string | undefined;
  const bodyModel = bodyData?.model as string | undefined;
  const model = (headerModel || bodyModel || 'gemini-2.0-flash').trim();

  return { apiKey, model, bodyData };
}

// تهيئة عميل GoogleGenAI بدون httpOptions أو Headers إضافية
function getGenAI(customApiKey?: string) {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('لم يتم العثور على مفتاح GEMINI_API_KEY صالح.');
  }
  return new GoogleGenAI({ apiKey });
}

// الدالة الرئيسية المستضيفة لجميع المسارات على Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace('/api', '');

  try {
    const { apiKey, model, bodyData } = extractAiCredentials(req);

    // 1. اختبار وفحص الاتصال بالـ API
    if (pathname === '/test-ai-connection' || pathname === '/test-ai-connection/' || pathname === '/check') {
      const ai = getGenAI(apiKey);
      const targetModel = model || 'gemini-2.0-flash';

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

    // 2. توليد محتوى شهادات التقدير
    if (pathname === '/generate-certificate-content') {
      const { studentName, subject, recipientGender } = bodyData || {};
      const isFemale = recipientGender === 'female';
      const ai = getGenAI(apiKey);
      const targetModel = model || 'gemini-2.0-flash';

      const prompt = `أنت خبير صياغة شهادات تقدير. أرجِع JSON يحتوي على: title, recipientIntro, appreciationText, poemOrQuote, badgeTitle لتكريم ${isFemale ? 'طالبة' : 'طالب'} اسمه/ا ${studentName || ''} في مادة ${subject || 'التفوق العام'}.`;

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      return res.status(200).json({ success: true, result: JSON.parse(response.text || '{}') });
    }

    // المسار الرئيسي للتحقق من عمل السيرفر
    if (pathname === '' || pathname === '/') {
      return res.status(200).json({ status: 'ok', message: 'Vercel Serverless API is active' });
    }

    return res.status(404).json({ error: 'Endpoint Not Found', pathname });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'حدث خطأ في الخادم' });
  }
}
