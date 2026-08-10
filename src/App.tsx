import React, { useState, useRef, useEffect } from 'react';
import { CertificateData } from './types';
import { TEMPLATE_PRESETS } from './data/templates';
import { applyDefaultsToCertificate, getSavedDefaultSettings, getFormattedTodayDate } from './utils/defaultSettings';
import { Navbar } from './components/Navbar';
import { CertificateCanvas } from './components/CertificateCanvas';
import { EditorToolbar } from './components/EditorToolbar';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { BatchCertificateGenerator } from './components/BatchCertificateGenerator';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { CloudLibrary } from './components/CloudLibrary';
import { AIAssistantChat } from './components/AIAssistantChat';
import { AppSettingsModal } from './components/AppSettingsModal';
import { VerificationModal } from './components/VerificationModal';
import { GoogleDriveSaveModal } from './components/GoogleDriveSaveModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { DirectShareModal } from './components/DirectShareModal';
import { sanitizeOklchInDoc } from './utils/exportUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Download,
  Printer,
  Sparkles,
  Share2,
  Mail,
  X,
  CheckCircle,
  HelpCircle,
  Undo2,
  Redo2,
  Cloud
} from 'lucide-react';

const RAW_INITIAL_CERTIFICATE_DATA: CertificateData = {
  id: `cert-${Date.now()}`,
  recipientGender: 'male',
  ...TEMPLATE_PRESETS[0].defaultData,
  studentName: 'عبد الله بن محمد العتيبي',
  grade: 'الصف الأول الثانوي - أ',
  schoolName: 'مدرسة التميز النموذجية',
  headerLine1: 'المملكة العربية السعودية',
  showHeaderLine1: true,
  headerLine2: 'وزارة التعليم / الجهة المعتمدة',
  showHeaderLine2: true,
  headerLine3: 'إدارة التعليم بمحافظة الرياض',
  showHeaderLine3: false,
  headerRightExtra: 'مكتب التعليم الخاص',
  showHeaderRightExtra: false,
  showHeaderSchoolName: true,
  headerVisionText: 'رؤية 2030',
  showHeaderVisionText: false,
  showHeaderDate: true,
  showHeaderPlace: true,
  dateLabel: 'التاريخ',
  placeLabel: 'المكان',
  certNumber: 'REF-1447/0892',
  certNumberLabel: 'الرقم',
  showHeaderCertNumber: false,
  headerLeftExtra1: 'نوع الشهادة: معتمدة',
  showHeaderLeftExtra1: false,
  headerLeftExtra2: 'الكود: AC-2026',
  showHeaderLeftExtra2: false,
  showVerificationBadge: true,
  verificationBadgeText: 'شهادة موثقة رقمياً',
  subject: 'التفوق العلمي العام والابتكار',
  title: 'شهادة تقدير وتفوق راقٍ',
  subtitle: 'وسام التميز الأكاديمي للعام الدراسي 1447 هـ',
  appreciationText: 'تقديراً لجهوده العلمية المتميزة وحصوله على الدرجات العالية بروح من الانضباط، واجتهاده في دعم زملائه والتحلي بمكارم الأخلاق.',
  poemOrQuote: '«مَن خَطا نَحوَ العُلا خُطوَةً... جَنى مِنَ الثِمارِ أحلى النِعَم»',
  showPoemOrQuote: true,
  issueDate: getFormattedTodayDate(),
  issuePlace: 'الرياض، المملكة العربية السعودية',
  badgeTitle: 'وسام التميز الأول',
  badgeIcon: 'trophy',
  showBadge: true,
  frameStyle: 'double-gold',
  primaryColor: '#854d0e',
  secondaryColor: '#d97706',
  accentColor: '#fef08a',
  backgroundColor: '#fefce8',
  textColor: '#1e293b',
  fontFamily: 'Amiri',
  fontSizeScale: 1.0,
  aspectRatio: 'A4-landscape',
  showQrCode: true,
  verificationCode: 'TAQDEER-2026-X89F2A',
  qrCodeData: 'https://taqdeer.app/verify/TAQDEER-2026-X89F2A',
  watermarkType: 'text',
  watermarkText: 'مدرسة التميز النموذجية',
  watermarkImageUrl: '',
  watermarkRotation: -12,
  watermarkOpacity: 0.05,
  watermarkPattern: 'center',
  watermarkSize: 100,
  isSavedCloud: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stamp: {
    id: 'stamp-1',
    title: 'الختم الرسمي',
    subtext: 'معتمد رسمياً',
    color: '#b45309',
    shape: 'wax',
    show: true
  },
  signatures: [
    { id: '1', name: 'أ. عبد الرحمن السعيد', title: 'معلم المادة', type: 'type', signatureText: 'عبد الرحمن السعيد', show: true },
    { id: '2', name: 'د. خالد العصيمي', title: 'مدير المدرسة', type: 'type', signatureText: 'د. خالد العصيمي', show: true }
  ],
  emojis: []
} as CertificateData;

const INITIAL_CERTIFICATE_DATA: CertificateData = applyDefaultsToCertificate(RAW_INITIAL_CERTIFICATE_DATA);

const getAutosavedInitialData = (): CertificateData => {
  try {
    const saved = localStorage.getItem('taqdeer_autosave_certificate');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.title && parsed.studentName) {
        return applyDefaultsToCertificate(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading autosaved draft:', e);
  }
  return INITIAL_CERTIFICATE_DATA;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'batch' | 'dashboard' | 'cloud' | 'ai' | 'settings'>('editor');
  
  // History State for Undo / Redo - initialized with LocalStorage autosaved draft if present
  const [history, setHistory] = useState<CertificateData[]>(() => [getAutosavedInitialData()]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);

  const certificateData = history[historyIndex] || INITIAL_CERTIFICATE_DATA;

  // Auto-save effect to LocalStorage
  useEffect(() => {
    if (certificateData) {
      try {
        localStorage.setItem('taqdeer_autosave_certificate', JSON.stringify(certificateData));
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        setLastAutosavedTime(timeStr);
      } catch (e) {
        console.error('Auto-save to localStorage failed:', e);
      }
    }
  }, [certificateData]);

  const updateCertificateData = (
    newData: Partial<CertificateData> | CertificateData | ((prev: CertificateData) => CertificateData)
  ) => {
    setHistory((prevHistory) => {
      const current = prevHistory[historyIndex] || INITIAL_CERTIFICATE_DATA;
      let nextData: CertificateData;

      if (typeof newData === 'function') {
        nextData = newData(current);
      } else if ('id' in newData && 'title' in newData) {
        nextData = newData as CertificateData;
      } else {
        nextData = { ...current, ...newData, updatedAt: new Date().toISOString() };
      }

      if (JSON.stringify(current) === JSON.stringify(nextData)) {
        return prevHistory;
      }

      const slicedHistory = prevHistory.slice(0, historyIndex + 1);
      if (slicedHistory.length >= 40) {
        slicedHistory.shift();
      }
      const updatedHistory = [...slicedHistory, nextData];
      setHistoryIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      showToast('تم التراجع عن الخطوة السابقة ↩️');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      showToast('تمت إعادة الخطوة ↪️');
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (historyIndex < history.length - 1) {
            e.preventDefault();
            handleRedo();
          }
        } else {
          if (historyIndex > 0) {
            e.preventDefault();
            handleUndo();
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        if (historyIndex < history.length - 1) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length]);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareInitialMode, setShareInitialMode] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Export Certificate to PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    showToast('جاري تحضير ملف PDF عالي الدقة للطباعة...');

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Wait for React re-render so scale transform & UI controls are removed
      await new Promise((resolve) => setTimeout(resolve, 250));

      const element = canvasRef.current || document.getElementById('certificate-print-area');
      if (!element) {
        throw new Error('تعذر العثور على عنصر الشهادة للتصدير');
      }

      const canvas = await html2canvas(element, {
        scale: 2.5, // High DPI (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        backgroundColor: certificateData.backgroundColor || '#ffffff',
        logging: false,
        windowWidth: 1200,
        windowHeight: 900,
        onclone: (clonedDoc) => {
          sanitizeOklchInDoc(clonedDoc);
          const clonedCert = clonedDoc.getElementById('certificate-print-area');
          if (clonedCert) {
            clonedCert.style.transform = 'none';
            clonedCert.style.margin = '0';
            clonedCert.style.position = 'relative';
            clonedCert.style.boxShadow = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const isLandscape = certificateData.aspectRatio === 'A4-landscape';
      const isSquare = certificateData.aspectRatio === 'square';
      
      let pdf: jsPDF;
      if (isSquare) {
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [210, 210]
        });
      } else {
        pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
      }

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const cleanName = (certificateData.studentName || 'طالب').replace(/[^\w\s\u0600-\u06FF-]/gi, '').trim();
      pdf.save(`شهادة_تقدير_${cleanName || 'طالب'}.pdf`);

      showToast('تم تحميل شهادة PDF بنجاح! ✨');
    } catch (err) {
      console.error('PDF Export Error:', err);
      showToast('تعذر إنشاء ملف PDF تلقائياً، جاري فتح الطباعة المباشرة...');
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Export Certificate to PNG Image
  const handleExportImage = async () => {
    setIsExporting(true);
    showToast('جاري توليد صورة PNG فائقة الجودة...');

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Wait for React re-render so scale transform & UI controls are removed
      await new Promise((resolve) => setTimeout(resolve, 250));

      const element = canvasRef.current || document.getElementById('certificate-print-area');
      if (!element) {
        throw new Error('تعذر العثور على عنصر الشهادة للتصدير');
      }

      const canvas = await html2canvas(element, {
        scale: 3, // Ultra-HD 3x Resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: certificateData.backgroundColor || '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeOklchInDoc(clonedDoc);
          const clonedCert = clonedDoc.getElementById('certificate-print-area');
          if (clonedCert) {
            clonedCert.style.transform = 'none';
            clonedCert.style.margin = '0';
            clonedCert.style.position = 'relative';
            clonedCert.style.boxShadow = 'none';
          }
        }
      });

      const cleanName = (certificateData.studentName || 'طالب').replace(/[^\w\s\u0600-\u06FF-]/gi, '').trim();
      const link = document.createElement('a');
      link.download = `شهادة_${cleanName || 'طالب'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      showToast('تمت حفظ صورة الشهادة بنجاح! 🖼️');
    } catch (err) {
      console.error('Image Export Error:', err);
      showToast('حدث خطأ أثناء حفظ صورة الشهادة');
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyAiContent = (data: Partial<CertificateData>) => {
    updateCertificateData(data);
    showToast('تم تطبيق العبارات المولدة بالذكاء الاصطناعي! 🚀');
  };

  const handleOpenWhatsAppShare = () => {
    setShareInitialMode('whatsapp');
    setIsShareModalOpen(true);
  };

  const handleOpenEmailShare = () => {
    setShareInitialMode('email');
    setIsShareModalOpen(true);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleUpdateCloudCertificate = () => {
    try {
      const local = localStorage.getItem('taqdeer_saved_certs');
      let saved: CertificateData[] = [];
      if (local) {
        try {
          saved = JSON.parse(local);
        } catch (e) {
          console.error(e);
        }
      }

      const updatedCert: CertificateData = {
        ...certificateData,
        isSavedCloud: true,
        updatedAt: new Date().toISOString()
      };

      const index = saved.findIndex(c => c.id === updatedCert.id);
      let updatedList: CertificateData[];
      if (index >= 0) {
        updatedList = [...saved];
        updatedList[index] = updatedCert;
      } else {
        updatedList = [updatedCert, ...saved];
      }

      localStorage.setItem('taqdeer_saved_certs', JSON.stringify(updatedList));
      updateCertificateData(updatedCert);
      showToast('تم حفظ التعديلات على الشهادة بالسحابة بنجاح! ☁️✅');
    } catch (err) {
      console.error('Update Cloud Error:', err);
      showToast('حدث خطأ أثناء تحديث الشهادة بالسحابة.');
    }
  };

  const handleSaveNewToCloud = () => {
    try {
      const local = localStorage.getItem('taqdeer_saved_certs');
      let saved: CertificateData[] = [];
      if (local) {
        try {
          saved = JSON.parse(local);
        } catch (e) {
          console.error(e);
        }
      }
      const newId = `cloud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newVerificationCode = `TQ-${Math.floor(100000 + Math.random() * 900000)}`;

      const certToSave: CertificateData = {
        ...certificateData,
        id: newId,
        verificationCode: certificateData.verificationCode || newVerificationCode,
        isSavedCloud: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedList = [certToSave, ...saved];
      localStorage.setItem('taqdeer_saved_certs', JSON.stringify(updatedList));
      updateCertificateData(certToSave);
      showToast('تم حفظ الشهادة كنسخة جديدة في المكتبة السحابية بنجاح! ☁️✨');
    } catch (err) {
      console.error('Cloud Save Error:', err);
      showToast('حدث خطأ أثناء الحفظ بالسحابة.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-['Cairo',sans-serif] flex flex-col pb-12">
      
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* Main App Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPDF={handleExportPDF}
        onQuickGenerateAI={() => setIsAiModalOpen(true)}
        onPrint={handlePrint}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        onOpenGoogleDriveModal={() => setIsDriveModalOpen(true)}
        certificateData={certificateData}
        onUpdateCloudCertificate={handleUpdateCloudCertificate}
        onSaveNewToCloud={handleSaveNewToCloud}
        lastAutosavedTime={lastAutosavedTime}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: MAIN CERTIFICATE EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            
            {/* Quick Action Top Bar */}
            <div className="bg-white p-3 sm:p-3.5 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-right overflow-hidden">
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    معاينة: <span className="text-amber-700 font-extrabold">{certificateData.studentName}</span>
                  </span>
                </div>

                {/* Undo / Redo Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      canUndo
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-2xs cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title="تراجع خطوة للخلف (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">تراجع</span>
                  </button>

                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      canRedo
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-2xs cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title="إعادة خطوة للأمام (Ctrl+Y)"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">إعادة</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0 py-0.5">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-2xs hover:brightness-105 transition flex items-center justify-center gap-1 text-center truncate"
                  title="صياغة العبارات بالذكاء الاصطناعي"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">صياغة AI</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1 text-center truncate"
                  title="معاينة للطباعة المباشرة"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">طباعة</span>
                </button>

                {certificateData.isSavedCloud ? (
                  <>
                    <button
                      onClick={handleUpdateCloudCertificate}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1 text-center truncate cursor-pointer animate-pulse"
                      title="حفظ التعديلات على الشهادة الحالية بالسحابة"
                    >
                      <Cloud className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">حفظ التعديلات</span>
                    </button>

                    <button
                      onClick={handleSaveNewToCloud}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1 text-center truncate cursor-pointer"
                      title="حفظ كشهادة جديدة منفصلة بالسحابة"
                    >
                      <Cloud className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">نسخة جديدة</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSaveNewToCloud}
                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1 text-center truncate cursor-pointer"
                    title="حفظ الشهادة بالسحابة للعودة إليها وتعديلها لاحقاً"
                  >
                    <Cloud className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">حفظ بالسحابة</span>
                  </button>
                )}

                <button
                  onClick={handleExportPDF}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1 text-center truncate"
                  title="تصدير الشهادة صيغة PDF"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">تصدير PDF</span>
                </button>

                <button
                  onClick={handleOpenWhatsAppShare}
                  className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                  title="مشاركة عبر WhatsApp"
                >
                  <Share2 className="w-4 h-4 text-emerald-700" />
                </button>

                <button
                  onClick={handleOpenEmailShare}
                  className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                  title="مشاركة عبر البريد الإلكتروني"
                >
                  <Mail className="w-4 h-4 text-indigo-700" />
                </button>
              </div>
            </div>

            {/* Split Screen Layout: Canvas Left/Top, Toolbar Right/Bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Certificate Canvas Area (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-200/60 p-3 sm:p-4 rounded-2xl border border-slate-300 shadow-inner flex flex-col items-center justify-center min-h-[450px] w-full overflow-hidden">
                <CertificateCanvas
                  data={certificateData}
                  canvasRef={canvasRef}
                  isExporting={isExporting}
                  onUpdateData={updateCertificateData}
                  onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />
              </div>

              {/* Certificate Controls Toolbar (5 Cols) */}
              <div className="lg:col-span-5">
                <EditorToolbar
                  certificateData={certificateData}
                  onChange={updateCertificateData}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                  onExportPDF={handleExportPDF}
                  onExportImage={handleExportImage}
                  onShareEmail={handleOpenEmailShare}
                  onShareWhatsApp={handleOpenWhatsAppShare}
                  onPrint={handlePrint}
                  onSaveToCloud={handleSaveNewToCloud}
                  onUpdateCloudCertificate={handleUpdateCloudCertificate}
                  onOpenGoogleDriveModal={() => setIsDriveModalOpen(true)}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: BATCH GENERATION */}
        {activeTab === 'batch' && (
          <BatchCertificateGenerator
            baseCertificate={certificateData}
            onApplySingleToEditor={(cert) => {
              updateCertificateData(cert);
              setActiveTab('editor');
              showToast(`تم فتح شهادة الطالب: ${cert.studentName} بالمحرر`);
            }}
            onExportAllPDF={handleExportPDF}
          />
        )}

        {/* TAB 3: DASHBOARD & ANALYTICS */}
        {activeTab === 'dashboard' && <DashboardAnalytics />}

        {/* TAB 4: CLOUD LIBRARY */}
        {activeTab === 'cloud' && (
          <CloudLibrary
            currentCertificate={certificateData}
            onLoadCertificate={(cert) => {
              updateCertificateData(cert);
              setActiveTab('editor');
              showToast('تم تحميل الشهادة المحفوظة بنجاح!');
            }}
            onOpenGoogleDriveModal={(cert) => {
              updateCertificateData(cert);
              setIsDriveModalOpen(true);
            }}
            onVerifyCertificate={(cert) => {
              updateCertificateData(cert);
              setIsVerificationModalOpen(true);
            }}
          />
        )}

        {/* TAB 5: AI ASSISTANT CHAT */}
        {activeTab === 'ai' && <AIAssistantChat />}

        {/* TAB 6: SETTINGS & SUPPORT */}
        {activeTab === 'settings' && (
          <AppSettingsModal
            currentCertificate={certificateData}
            onUpdateCurrentCertificate={updateCertificateData}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyGeneratedContent={handleApplyAiContent}
        currentData={certificateData}
      />

      {/* Verification Platform Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        currentCertificate={certificateData}
        onOpenGoogleDriveModal={() => {
          setIsVerificationModalOpen(false);
          setIsDriveModalOpen(true);
        }}
      />

      {/* Google Drive Save & Verification Modal */}
      <GoogleDriveSaveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        certificateData={certificateData}
        onUpdateCertificateData={updateCertificateData}
        canvasRef={canvasRef}
        onSetExporting={setIsExporting}
      />

      {/* Direct Share Modal (WhatsApp & Direct Email) */}
      <DirectShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialMode={shareInitialMode}
        certificateData={certificateData}
        canvasRef={canvasRef}
        onShowToast={showToast}
      />

      {/* Print Preview & Page Settings Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        certificateData={certificateData}
      />

    </div>
  );
}
