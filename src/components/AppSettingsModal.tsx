import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Wifi,
  WifiOff,
  BookOpen,
  Headset,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Calendar,
  PenTool,
  Stamp as StampIcon,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { CertificateData } from '../types';
import {
  DefaultCertificateSettings,
  getSavedDefaultSettings,
  saveDefaultSettingsToStorage,
  FALLBACK_DEFAULT_SETTINGS,
  applyDefaultsToCertificate,
  getFormattedTodayDate
} from '../utils/defaultSettings';

interface Props {
  currentCertificate?: CertificateData;
  onUpdateCurrentCertificate?: (cert: CertificateData) => void;
  onShowToast?: (msg: string) => void;
}

export const AppSettingsModal: React.FC<Props> = ({
  currentCertificate,
  onUpdateCurrentCertificate,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'default-cert' | 'app-system'>('default-cert');
  const [defaultSettings, setDefaultSettings] = useState<DefaultCertificateSettings>(getSavedDefaultSettings());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // App System settings state
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [highQualityPdf, setHighQualityPdf] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    setDefaultSettings(getSavedDefaultSettings());
  }, []);

  const handleSaveDefaults = () => {
    saveDefaultSettingsToStorage(defaultSettings);
    setSaveSuccessMsg(true);
    if (onShowToast) {
      onShowToast('تم حفظ الإعدادات الافتراضية للشهادات بنجاح! 💾');
    }
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleApplyDefaultsToEditor = () => {
    if (!currentCertificate || !onUpdateCurrentCertificate) return;
    const updated = applyDefaultsToCertificate(currentCertificate, defaultSettings);
    onUpdateCurrentCertificate(updated);
    if (onShowToast) {
      onShowToast('تم تطبيق الإعدادات الافتراضية على الشهادة الحالية بنجاح! ✨');
    }
  };

  const handleResetToFactory = () => {
    if (window.confirm('هل أنت تأكد من إعادة تعيين الإعدادات الافتراضية للقيم الأولية؟')) {
      setDefaultSettings(FALLBACK_DEFAULT_SETTINGS);
      saveDefaultSettingsToStorage(FALLBACK_DEFAULT_SETTINGS);
      if (onShowToast) {
        onShowToast('تم إعادة تعيين الإعدادات الافتراضية للقيم المصنع الأولية');
      }
    }
  };

  const faqs = [
    {
      q: 'كيف تعمل الإعدادات الافتراضية للشهادات؟',
      a: 'تتيح لك الإعدادات الافتراضية تسجيل اسم مدرستك/جهتك وتوقيع المدير والمشرف والتاريخ التلقائي. عند فتح التطبيق أو إنشاء شهادات جديدة أو دفعة طلاب، يتم تطبيق بياناتك الرسمية تلقائياً دون الحاجة لإعادتها كل مرة.'
    },
    {
      q: 'كيف أقوم بجعل تاريخ توليد الشهادة تلقائياً حسب يوم الإصدار؟',
      a: 'تأكد من تفعيل خيار "تحديث تاريخ الإصدار تلقائياً لتاريخ اليوم" في قسم الإعدادات الافتراضية، وسيقوم النظام فوراً بحساب التاريخ التاريخي والمهجري/الميلادي ليوم الإصدار تلقائياً عند توليد أو طباعة أي شهادة.'
    },
    {
      q: 'كيف يمكنني تصدير الشهادات بصيغة PDF عالية الدقة دون تشوه الجودة؟',
      a: 'تطبيق تقدير يقدم نظام تصدير مباشر بالمتجهات مع مقاسات A4 القياسية الطباعية، انقر على زر "تصدير PDF" وسيتم تجهيز ملف جاهز للطباعة المباشرة بأعلى جودة.'
    },
    {
      q: 'هل يمكن التعديل على شهادات متعددة لدفعة كاملة من الطلاب بضغطة واحدة؟',
      a: 'نعم! انتقل إلى تبويب "الشهادات الجماعية"، ولصق قائمة أسماء طلاب الفصل كاملاً وسيتم توليد شهادة مخصصة لكل طالب فوراً باستخدام إعداداتك الافتراضية.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-right">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black">إعدادات الشهادات الافتراضية والنظام</h2>
          </div>
          <p className="text-xs text-amber-200/80 mt-1">
            سجّل بيانات مدرستك، شعارك، وتوقيعاتك المعتمدة لتكون افتراضية ومسجلة تلقائياً عند توليد وتصدير الشهادات.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <ShieldCheck className="w-4 h-4" /> النسخة المعتمدة والمحدثة 2026
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-1.5 bg-slate-200 p-1.5 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveTab('default-cert')}
          className={`w-full sm:flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'default-cert'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-700 hover:bg-slate-300/60'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">الإعدادات الافتراضية للشهادات (المدرسة والتوقيعات)</span>
          <span className="sm:hidden">الإعدادات الافتراضية للشهادات</span>
        </button>

        <button
          onClick={() => setActiveTab('app-system')}
          className={`w-full sm:flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'app-system'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-300/60'
          }`}
        >
          <Wifi className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">المزامنة والوضع المحلي والدعم الفني</span>
          <span className="sm:hidden">المزامنة والدعم الفني</span>
        </button>
      </div>

      {/* TAB 1: DEFAULT CERTIFICATE SETTINGS */}
      {activeTab === 'default-cert' && (
        <div className="space-y-6">
          
          {/* Action Bar */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>هذه البيانات ستُطبق تلقائياً على أي شهادة جديدة أو دفعة شهادات تقوم بتوليدها.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToFactory}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                title="إعادة التعيين للقيم المصنعية"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط المصنع</span>
              </button>

              {currentCertificate && onUpdateCurrentCertificate && (
                <button
                  onClick={handleApplyDefaultsToEditor}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تطبيق على الشهادة الحالية</span>
                </button>
              )}

              <button
                onClick={handleSaveDefaults}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الإعدادات الافتراضية</span>
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ جميع الإعدادات الافتراضية بنجاح! ستعتمد كافتراضي لجميع الشهادات القادمة.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1: Basic Entity & Date Defaults */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                1. بيانات المدرسة والجهة والتاريخ الافتراضي
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدرسة / الجهة التعليمية الافتراضي:</label>
                <input
                  type="text"
                  value={defaultSettings.schoolName}
                  onChange={(e) => setDefaultSettings({ ...defaultSettings, schoolName: e.target.value })}
                  placeholder="مثال: مدرسة التميز النموذجية"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مكان الإصدار الافتراضي:</label>
                <input
                  type="text"
                  value={defaultSettings.issuePlace}
                  onChange={(e) => setDefaultSettings({ ...defaultSettings, issuePlace: e.target.value })}
                  placeholder="مثال: الرياض، المملكة العربية السعودية"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص العلامة المائية الافتراضي:</label>
                <input
                  type="text"
                  value={defaultSettings.watermarkText}
                  onChange={(e) => setDefaultSettings({ ...defaultSettings, watermarkText: e.target.value })}
                  placeholder="مثال: مدرسة التميز النموذجية"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              {/* Automatic Issue Date Control */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span className="font-extrabold text-xs text-amber-950">تاريخ التوليد التلقائي (حسب يوم الإصدار)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={defaultSettings.autoTodayDate}
                    onChange={(e) => setDefaultSettings({ ...defaultSettings, autoTodayDate: e.target.checked })}
                    className="w-4.5 h-4.5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  عند تفعيل هذا الخيار، سيقوم التطبيق دائماً بضبط تاريخ الشهادة تلقائياً لتاريخ اليوم الحالي (<span className="font-bold underline">{getFormattedTodayDate()}</span>) عند توليد أي شهادة جديدة أو دفعة طلاب.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط الشعار الافتراضي (اختياري):</label>
                <input
                  type="text"
                  value={defaultSettings.logoUrl}
                  onChange={(e) => setDefaultSettings({ ...defaultSettings, logoUrl: e.target.value })}
                  placeholder="رابط صورة الشعار (https://...)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800 dir-ltr text-right"
                />
              </div>

            </div>

            {/* Section 2: Default Signatures & Official Stamp */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-600" />
                2. التوقيعات والختم الرسمي الافتراضي
              </h3>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="col-span-2 text-xs font-bold text-slate-800 border-b pb-1">
                  توقيع المعلم / المشرف (التوقيع الأول):
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    value={defaultSettings.teacherTitle}
                    onChange={(e) => setDefaultSettings({ ...defaultSettings, teacherTitle: e.target.value })}
                    placeholder="معلم المادة"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    value={defaultSettings.teacherName}
                    onChange={(e) => setDefaultSettings({ ...defaultSettings, teacherName: e.target.value })}
                    placeholder="أ. عبد الرحمن السعيد"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="col-span-2 text-xs font-bold text-slate-800 border-b pb-1">
                  توقيع مدير المدرسة / الرئيس (التوقيع الثاني):
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    value={defaultSettings.principalTitle}
                    onChange={(e) => setDefaultSettings({ ...defaultSettings, principalTitle: e.target.value })}
                    placeholder="مدير المدرسة"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    value={defaultSettings.principalName}
                    onChange={(e) => setDefaultSettings({ ...defaultSettings, principalName: e.target.value })}
                    placeholder="د. خالد العصيمي"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              {/* Stamp Defaults */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-200 pb-1">
                  <StampIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>الختم الرسمي الافتراضي:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">عنوان الختم:</label>
                    <input
                      type="text"
                      value={defaultSettings.stampTitle}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, stampTitle: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">النص الفرعي:</label>
                    <input
                      type="text"
                      value={defaultSettings.stampSubtext}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, stampSubtext: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">شكل الختم:</label>
                    <select
                      value={defaultSettings.stampShape}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, stampShape: e.target.value as any })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="circle">ختم دائري</option>
                      <option value="square">مربع بحواف دائرية</option>
                      <option value="rectangle">مستطيل بحواف دائرية</option>
                      <option value="wax">ختم الشمع التراثي (الملكي)</option>
                      <option value="ribbon">وسام الشريطة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">لون الختم:</label>
                    <input
                      type="color"
                      value={defaultSettings.stampColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, stampColor: e.target.value })}
                      className="w-full h-7 border border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Section 3: Default Appearance & Formatting */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                3. ألوان وتنسيقات التصميم الافتراضية
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الخط العربي الافتراضي:</label>
                  <select
                    value={defaultSettings.fontFamily}
                    onChange={(e) => setDefaultSettings({ ...defaultSettings, fontFamily: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Cairo">القاهرة (Cairo)</option>
                    <option value="Amiri">الأميري (Amiri)</option>
                    <option value="Tajawal">تجوال (Tajawal)</option>
                    <option value="Almarai">المراعي (Almarai)</option>
                    <option value="Aref Ruqaa">عارف رقعة (Aref Ruqaa)</option>
                    <option value="Reem Kufi">ريم كوفي (Reem Kufi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللون الرئيسي:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={defaultSettings.primaryColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, primaryColor: e.target.value })}
                      className="w-9 h-9 border rounded-lg cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={defaultSettings.primaryColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, primaryColor: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border rounded-lg font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللون الثانوي:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={defaultSettings.secondaryColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, secondaryColor: e.target.value })}
                      className="w-9 h-9 border rounded-lg cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={defaultSettings.secondaryColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, secondaryColor: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border rounded-lg font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">لون الخلفية:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={defaultSettings.backgroundColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, backgroundColor: e.target.value })}
                      className="w-9 h-9 border rounded-lg cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={defaultSettings.backgroundColor}
                      onChange={(e) => setDefaultSettings({ ...defaultSettings, backgroundColor: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border rounded-lg font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveDefaults}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>حفظ الإعدادات الافتراضية المعتمدة</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: SYSTEM, LOCAL MODE & SUPPORT */}
      {activeTab === 'app-system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* System Settings Column */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 border-b pb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-600" />
              إعدادات المزامنة والوضع المحلي
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h5 className="font-bold text-xs text-slate-900">وضع العمل بدون إنترنت (Offline Mode)</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">الحفظ في التخزين المحلي فقط دون الاتصال بالسحابة</p>
              </div>
              <button
                onClick={() => setOfflineMode(!offlineMode)}
                className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                  offlineMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {offlineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                {offlineMode ? 'مفعل' : 'معطل'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h5 className="font-bold text-xs text-slate-900">المزامنة السحابية التلقائية</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">مزامنة التغييرات تلقائياً عبر الأجهزة</p>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h5 className="font-bold text-xs text-slate-900">تصدير الطباعة فائق الدقة (Vector Print PDF)</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">ضمان عدم ضبابية النصوص أو الخطوط عند الطباعة</p>
              </div>
              <input
                type="checkbox"
                checked={highQualityPdf}
                onChange={(e) => setHighQualityPdf(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Training Videos Section */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                الدورات والورش التدريبية لتطوير الكفاءة
              </h4>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                تعلم أسرار الصياغة التربوية المؤثرة والتصميم الرقمي لشهادات التكريم عبر مقاطع قصيرة ودليل الإرشادات.
              </p>
            </div>
          </div>

          {/* 24/7 Support & FAQ Column */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Headset className="w-4 h-4 text-amber-600" />
                الدعم الفني والتعليمات (24/7)
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                الدعم مباشر
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">الأسئلة الشائعة والإرشادات:</span>
              {faqs.map((f, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-right p-3 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-2"
                  >
                    <span>{f.q}</span>
                    <span className="text-amber-600">{activeFaq === idx ? '▲' : '▼'}</span>
                  </button>
                  {activeFaq === idx && (
                    <div className="p-3 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">فريق الدعم الفني المباشر</span>
                <span className="text-[11px] text-slate-400 block">نسعد بجميع استفساراتكم واقتراحاتكم 24/7</span>
              </div>
              <button
                onClick={() => alert('تم توجيه طلبك لفريق الدعم المباشر، سنتواصل معك فوراً!')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                تواصل مع الدعم
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
