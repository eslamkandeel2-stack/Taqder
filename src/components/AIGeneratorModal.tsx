import React, { useState } from 'react';
import { Sparkles, X, Bot, Check, RefreshCw } from 'lucide-react';
import { CertificateData } from '../types';
import { RecipientGender, detectGenderFromName, generateLocalCertificateFallback } from '../utils/genderConverter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedContent: (data: Partial<CertificateData>) => void;
  currentData: CertificateData;
}

export const AIGeneratorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplyGeneratedContent,
  currentData,
}) => {
  const [studentName, setStudentName] = useState(currentData.studentName || '');
  const [recipientGender, setRecipientGender] = useState<RecipientGender>(
    currentData.recipientGender || (detectGenderFromName(currentData.studentName) === 'female' ? 'female' : 'male')
  );
  const [subject, setSubject] = useState(currentData.subject || '');
  const [achievement, setAchievement] = useState('');
  const [grade, setGrade] = useState(currentData.grade || '');
  const [tone, setTone] = useState<'حماسي ورائع' | 'رسمي وفخم' | 'لطيف للأطفال' | 'شاعري وأدبي'>('حماسي ورائع');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStudentNameChange = (val: string) => {
    setStudentName(val);
    if (val.trim().length >= 3) {
      const detected = detectGenderFromName(val);
      setRecipientGender(detected);
    }
  };

  const quickPresets = [
    { title: 'عبقري الرياضيات', achievement: 'حصوله على المركز الأول في الأولمبياد وسرعة حل المسائل المعقدة' },
    { title: 'حفظ جزء من القرآن', achievement: 'حفظ جزء عم وجزء تبارك وإتقان الترتيل والتجويد بأعلى درجة' },
    { title: 'الانضباط والمواظبة', achievement: 'حضور يومي بنسبة 100% دون أي غياب والتزام بالأنظمة المدرسية' },
    { title: 'الفنان المبدع', achievement: 'التميز في الرسم والأنشطة الفنية وتنسيق المعرض المدرسي' },
    { title: 'القيادة والروح الرياضية', achievement: 'قيادة فريق الفصل في الدوري الرياضي والتحلي بأخلاق الفرسان' },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let resultData: any = null;

      try {
        const response = await fetch('/api/generate-certificate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: studentName || (recipientGender === 'female' ? 'الطالبة المتميزة' : 'الطالب المتميز'),
            recipientGender,
            subject: subject || 'التميز العام',
            achievement: achievement || 'الاجتهاد والتفوق المتميز',
            grade: grade || 'المرحلة الدراسية',
            tone,
            schoolName: currentData.schoolName,
            teacherName: currentData.signatures?.[0]?.name,
          }),
        });

        const text = await response.text();
        if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
          const json = JSON.parse(text);
          if (json && json.success && json.result) {
            resultData = json.result;
          }
        }
      } catch (networkOrParseError) {
        console.warn('Network or AI parse error, using intelligent fallback:', networkOrParseError);
      }

      // If server or network returned non-JSON/error, use local high-quality generator
      if (!resultData) {
        resultData = generateLocalCertificateFallback({
          studentName: studentName || (recipientGender === 'female' ? 'الطالبة المتميزة' : 'الطالب المتميز'),
          recipientGender,
          subject: subject || 'التميز العام',
          achievement: achievement || 'الاجتهاد والتفوق المتميز',
          grade: grade || 'المرحلة الدراسية',
          tone,
          schoolName: currentData.schoolName,
          teacherName: currentData.signatures?.[0]?.name,
        });
      }

      onApplyGeneratedContent({
        recipientGender,
        studentName: studentName || currentData.studentName,
        grade: grade || currentData.grade,
        subject: subject || currentData.subject,
        title: resultData.title || currentData.title,
        recipientIntro: resultData.recipientIntro || currentData.recipientIntro,
        appreciationText: resultData.appreciationText || currentData.appreciationText,
        poemOrQuote: resultData.poemOrQuote || currentData.poemOrQuote,
        badgeTitle: resultData.badgeTitle || currentData.badgeTitle,
        primaryColor: resultData.primaryColorHex || currentData.primaryColor,
        secondaryColor: resultData.secondaryColorHex || currentData.secondaryColor,
      });

      onClose();
    } catch (err: any) {
      console.error('Final generator error:', err);
      setErrorMessage('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 text-right">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">مولد عبارات التكريم بالذكاء الاصطناعي</h3>
              <p className="text-xs text-amber-200/80">مدعوم بنماذج Gemini 3.6 الفائقة للصياغة العربية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">مقترحات سريعة بنقرة واحدة:</label>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSubject(preset.title);
                    setAchievement(preset.achievement);
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition"
                >
                  ⚡ {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Gender Selector */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <span>🎓</span>
              <span>نوع المكرّم (تحديد نوع الشهادة للذكاء الاصطناعي):</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-amber-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => setRecipientGender('male')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  recipientGender === 'male'
                    ? 'bg-amber-600 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👨‍🎓</span>
                <span>طالب (مذكر)</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientGender('female')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  recipientGender === 'female'
                    ? 'bg-pink-600 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👩‍🎓</span>
                <span>طالبة (مؤنث)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب / الطالبة</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => handleStudentNameChange(e.target.value)}
                placeholder={recipientGender === 'female' ? 'سارة بنت أحمد الغامدي' : 'أحمد بن علي العتيبي'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الصف / الفصل</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="الصف الخامس - أ"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المادة / المجال المكرم فيه</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: الرياضيات، حفظ القرآن، الابتكار الرقمي"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الإنجاز / سبب الشكر</label>
            <textarea
              rows={2}
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="مثال: حصل على الدرجة الكاملة في الاختبار النهائي وساعد زملائه باجتهاد"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">أسلوب ونبرة النص:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'حماسي ورائع', label: '🚀 حماسي ومحفز' },
                { id: 'رسمي وفخم', label: '👑 رسمي وفخم' },
                { id: 'لطيف للأطفال', label: '🎈 مرح ولطيف للأطفال' },
                { id: 'شاعري وأدبي', label: '📜 شاعري وأدبي فاخر' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    tone === t.id
                      ? 'border-amber-500 bg-amber-50 text-amber-950'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
          >
            إلغاء
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري الصياغة بالذكاء الاصطناعي...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                صياغة وتطبيق الشهادة
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
