import React, { useState } from 'react';
import { CertificateData } from '../types';
import { TEMPLATE_PRESETS } from '../data/templates';
import { applyDefaultsToCertificate, getSavedDefaultSettings, getFormattedTodayDate } from '../utils/defaultSettings';
import { CertificateCanvas } from './CertificateCanvas';
import { Users, Sparkles, Download, CheckCircle, FileSpreadsheet, Trash2, Calendar, Building2 } from 'lucide-react';

interface Props {
  baseCertificate: CertificateData;
  onApplySingleToEditor: (cert: CertificateData) => void;
  onExportAllPDF: () => void;
}

export const BatchCertificateGenerator: React.FC<Props> = ({
  baseCertificate,
  onApplySingleToEditor,
}) => {
  const savedDefaults = getSavedDefaultSettings();
  const [studentInput, setStudentInput] = useState<string>(
    'أحمد بن محمد العتيبي\nسارة بنت خالد الغامدي\nعمر بن فيصل الشمري\nريما بنت ناصر الدوسري\nياسر بن عبد الله الشهري'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('academic-gold');
  const [subject, setSubject] = useState(baseCertificate.subject || 'التفوق الدراسي والتميز العام');
  const [grade, setGrade] = useState(baseCertificate.grade || 'الصف الأول الثانوي');
  const [generatedList, setGeneratedList] = useState<CertificateData[]>([]);

  const handleGenerateBatch = () => {
    const names = studentInput
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (names.length === 0) return;

    const preset = TEMPLATE_PRESETS.find(p => p.id === selectedTemplateId);
    const templateDefaults = preset ? preset.defaultData : {};

    const newList: CertificateData[] = names.map((name, idx) => {
      const rawCert: CertificateData = {
        ...baseCertificate,
        ...templateDefaults,
        id: `batch-${Date.now()}-${idx}`,
        studentName: name,
        grade,
        subject,
        verificationCode: `TAQDEER-${new Date().getFullYear()}-B${Math.floor(1000 + Math.random() * 9000)}`,
        qrCodeData: `https://taqdeer.app/cert/batch-${Date.now()}-${idx + 100}`,
        updatedAt: new Date().toISOString()
      };

      // Merge saved school/principal/teacher default settings & auto today date
      return applyDefaultsToCertificate(rawCert, savedDefaults);
    });

    setGeneratedList(newList);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-right">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <Users className="w-6 h-6" />
            </span>
            <h2 className="text-xl font-black">مولد الشهادات الجماعية للدفعة بالفصل</h2>
          </div>
          <p className="text-xs text-amber-200/80 mt-1 max-w-xl leading-relaxed">
            قم بلصق أسماء طلاب الفصل كاملاً، وحدد القالب والمادة لتوليد جميع الشهادات دفعة واحدة خلال ثوانٍ معدودة.
          </p>
        </div>

        {generatedList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
              تم توليد {generatedList.length} شهادة
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              طباعة / تصدير الدفعة
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b pb-3">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            بيانات دفعة الطلاب
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">قائمة أسماء الطلاب (اسم في كل سطر):</label>
            <textarea
              rows={8}
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder="مثال:&#10;أحمد محمد&#10;سارة خالد&#10;عمر الشمري"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono leading-relaxed focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              عدد الطلاب المدخلين: {studentInput.split('\n').filter(s => s.trim().length > 0).length} طالب
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي / الشعبة</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="مثال: الصف الثاني المتوسط"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المادة / مجال المكافأة</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: التفوق الدراسي العام"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">القالب المعتمد للدفعة:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-bold"
            >
              {TEMPLATE_PRESETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateBatch}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            توليد شهادات الدفعة الآن
          </button>
        </div>

        {/* Generated Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          {generatedList.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                🎓
              </div>
              <h4 className="font-extrabold text-base text-slate-800">لم يتم توليد أي شهادات بعد</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                أدخل أسماء الطلاب في القائمة على اليمين وانقر على زر "توليد شهادات الدفعة الآن" للمعاينة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedList.map((cert, index) => (
                <div
                  key={cert.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative hover:border-amber-400 transition"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                      شهادة #{index + 1}
                    </span>
                    <button
                      onClick={() => onApplySingleToEditor(cert)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      تعديل في المحرر ✏️
                    </button>
                  </div>

                  <div className="text-center space-y-1 py-2">
                    <h5 className="font-black text-sm text-slate-900">{cert.studentName}</h5>
                    <p className="text-xs text-slate-500">{cert.grade} • {cert.subject}</p>
                    <p className="text-[11px] text-amber-800 italic line-clamp-2 mt-1">"{cert.appreciationText}"</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t">
                    <span>{cert.schoolName}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle className="w-3 h-3" /> جاهزة للطباعة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
