import type { VercelRequest, VercelResponse } from '@vercel/node';

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

// استخراج بيانات الطلب
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

// دالة الاتصال المباشر بـ REST API بدون استخدام SDK
async function callGeminiDirectly(apiKey: string, model: string, prompt: string, isJson: boolean = false) {
  // يوضع المفتاح كـ Parameter في نهاية الرابط حصراً لضمان عدم إرسال Authorization: Bearer
  const cleanModel = model.startsWith('gemini-') ? model : 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (isJson) {
    payload.generationConfig = { responseMimeType: 'application/json' };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'فشل الاتصال بـ Gemini API');
  }

  const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return outputText;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace('/api', '');

  try {
    const { apiKey, model, bodyData } = extractAiCredentials(req);

    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال مفتاح API Key صالح' });
    }

    // 1. اختبار وفحص الاتصال
    if (pathname === '/test-ai-connection' || pathname === '/test-ai-connection/' || pathname === '/check') {
      const resultText = await callGeminiDirectly(
        apiKey,
        model,
        "اختبار اتصال سريع: قل 'متصل بنجاح' فقط."
      );

      return res.status(200).json({
        success: true,
        modelUsed: model || 'gemini-2.0-flash',
        sampleResponse: resultText.trim(),
        message: `تم الاتصال بنموذج الذكاء الاصطناعي بنجاح! 🟢`,
      });
    }

    // 2. توليد محتوى الشهادات
    if (pathname === '/generate-certificate-content') {
      const { studentName, subject, recipientGender } = bodyData || {};
      const isFemale = recipientGender === 'female';

      const prompt = `أنت خبير صياغة شهادات تقدير. أرجِع JSON فقط يحتوي على الحقول: title, recipientIntro, appreciationText, poemOrQuote, badgeTitle لتكريم ${isFemale ? 'طالبة' : 'طالب'} اسمه/ا ${studentName || ''} في مادة ${subject || 'التفوق العام'}.`;

      const resultText = await callGeminiDirectly(apiKey, model, prompt, true);

      return res.status(200).json({ success: true, result: JSON.parse(resultText || '{}') });
    }

    if (pathname === '' || pathname === '/') {
      return res.status(200).json({ status: 'ok', message: 'Vercel Serverless API is active' });
    }

    return res.status(404).json({ error: 'Endpoint Not Found', pathname });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'حدث خطأ في الخادم' });
  }
}
