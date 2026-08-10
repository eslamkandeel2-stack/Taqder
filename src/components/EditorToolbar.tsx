import React, { useState } from 'react';
import { CertificateData, FontOption, AspectRatioOption, FrameStyle, BadgeIconType, SignatureItem, GradientConfig, GradientType, ElementStyles, TextElementStyle } from '../types';
import { TEMPLATE_PRESETS } from '../data/templates';
import { BACKGROUND_TEXTURES } from '../data/backgrounds';
import { getFormattedTodayDate, getTodayHijriDate, getTodayGregorianDate, normalizeDateDigits, getSavedDefaultSettings } from '../utils/defaultSettings';
import { GRADIENT_PRESETS, GRADIENT_COLOR_SWATCHES } from '../utils/gradientUtils';
import { SignaturePadModal } from './SignaturePadModal';
import { TemplateGalleryModal } from './TemplateGalleryModal';
import {
  Sparkles,
  Palette,
  Type,
  FileText,
  Award,
  Stamp,
  Maximize2,
  Share2,
  Mail,
  Download,
  Plus,
  Trash2,
  PenTool,
  Image as ImageIcon,
  Check,
  Upload,
  Layers,
  Printer,
  Undo2,
  Redo2,
  Calendar,
  Sliders,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Cloud,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

interface Props {
  certificateData: CertificateData;
  onChange: (newData: CertificateData) => void;
  onOpenAiModal: () => void;
  onExportPDF: () => void;
  onExportImage: () => void;
  onShareEmail: () => void;
  onShareWhatsApp?: () => void;
  onPrint?: () => void;
  onSaveToCloud?: () => void;
  onUpdateCloudCertificate?: () => void;
  onOpenGoogleDriveModal?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const FramePreviewThumbnail: React.FC<{
  frameStyle: FrameStyle;
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ frameStyle, primaryColor = '#d97706', secondaryColor = '#f59e0b' }) => {
  return (
    <div className="w-full h-12 bg-slate-50/90 rounded-lg border border-slate-200 p-1 relative overflow-hidden flex items-center justify-center my-1.5 transition-all group-hover:border-amber-400 select-none">
      <div className="absolute inset-1 border border-slate-200/50 bg-white/90 rounded-2xs pointer-events-none" />

      {frameStyle === 'double-gold' && (
        <div className="absolute inset-1.5 border-2 rounded-2xs pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-0.5 border pointer-events-none" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'guilloche-royal' && (
        <div className="absolute inset-1.5 border-2 border-double pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border border-dashed pointer-events-none" style={{ borderColor: secondaryColor }} />
          <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>
      )}

      {frameStyle === 'golden-vines' && (
        <div className="absolute inset-1.5 border-2 rounded-md pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border border-dotted rounded-2xs pointer-events-none" style={{ borderColor: secondaryColor }} />
          <span className="absolute -top-1 -left-1 text-[8px]" style={{ color: primaryColor }}>🌿</span>
          <span className="absolute -top-1 -right-1 text-[8px] transform -scale-x-100" style={{ color: primaryColor }}>🌿</span>
        </div>
      )}

      {frameStyle === 'andalusian-star' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border pointer-events-none" style={{ borderColor: secondaryColor }} />
          <div className="absolute top-0.5 left-0.5 w-2 h-2 rotate-45 border" style={{ backgroundColor: primaryColor, borderColor: secondaryColor }} />
          <div className="absolute top-0.5 right-0.5 w-2 h-2 rotate-45 border" style={{ backgroundColor: primaryColor, borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'floral-corners' && (
        <div className="absolute inset-1.5 border-2 rounded-md pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border border-dashed pointer-events-none" style={{ borderColor: secondaryColor }} />
          <span className="absolute -top-1 -left-1 text-[9px]">🌸</span>
          <span className="absolute -top-1 -right-1 text-[9px]">🌸</span>
        </div>
      )}

      {frameStyle === 'greek-key-meander' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-0.5 border-t border-b pointer-events-none opacity-60" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'moroccan-mosaic' && (
        <div className="absolute inset-1.5 border-2 rounded-lg pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border-2 border-dotted pointer-events-none" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'oriental-islamic' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border pointer-events-none" style={{ borderColor: secondaryColor }} />
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 text-[8px]" style={{ color: primaryColor }}>🕌</span>
        </div>
      )}

      {frameStyle === 'baroque-gold' && (
        <div className="absolute inset-1.5 border-2 rounded-2xs pointer-events-none" style={{ borderColor: primaryColor }}>
          <span className="absolute -top-1 -left-1 text-[9px]">⚜️</span>
          <span className="absolute -top-1 -right-1 text-[9px]">⚜️</span>
        </div>
      )}

      {frameStyle === 'luxurious-gradient-border' && (
        <div className="absolute inset-1.5 border-4 pointer-events-none rounded-2xs" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-0.5 border pointer-events-none" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'royal-ribbon' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute top-0 left-0 right-0 h-2.5" style={{ backgroundColor: primaryColor }}>
            <div className="w-full h-0.5 mt-1.5" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>
      )}

      {frameStyle === 'islamic-arch' && (
        <div className="absolute inset-1.5 border-2 rounded-b-md pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 rounded-b-full border-b-2" style={{ borderColor: secondaryColor, backgroundColor: primaryColor + '20' }} />
        </div>
      )}

      {frameStyle === 'victorian-crest' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">👑</span>
        </div>
      )}

      {frameStyle === 'vintage-certificate' && (
        <div className="absolute inset-1.5 border-2 border-double pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border pointer-events-none" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'classic-ornate' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-0.5 border pointer-events-none" style={{ borderColor: secondaryColor }} />
          <div className="absolute inset-1 border pointer-events-none" style={{ borderColor: primaryColor }} />
        </div>
      )}

      {frameStyle === 'double-dotted-luxury' && (
        <div className="absolute inset-1.5 border-2 pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border-2 border-dotted pointer-events-none" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'emerald-border' && (
        <div className="absolute inset-1.5 border-2 border-dashed pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rotate-45" style={{ backgroundColor: secondaryColor }} />
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rotate-45" style={{ backgroundColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'wavy-artistic' && (
        <div className="absolute inset-1.5 border-2 rounded-xl pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-1 border-2 rounded-lg pointer-events-none opacity-60" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'geometric-cyber' && (
        <div className="absolute inset-1.5 border pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: secondaryColor }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'modern-geometric' && (
        <div className="absolute inset-1.5 border pointer-events-none" style={{ borderColor: primaryColor }}>
          <div className="absolute top-0 left-0 w-3 h-3 rounded-br-full" style={{ backgroundColor: secondaryColor }} />
          <div className="absolute top-0 right-0 w-3 h-3 rounded-bl-full" style={{ backgroundColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'playful-dots' && (
        <div className="absolute inset-1.5 border-2 border-dotted rounded-lg pointer-events-none" style={{ borderColor: primaryColor }}>
          <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
        </div>
      )}

      {frameStyle === 'clean-minimal' && (
        <div className="absolute inset-1.5 border rounded-2xs pointer-events-none" style={{ borderColor: primaryColor }} />
      )}

      <span className="relative z-10 text-[9px] font-bold text-slate-700 bg-white/95 px-1.5 py-0.5 rounded shadow-2xs border border-slate-100">
        معاينة الإطار
      </span>
    </div>
  );
};

export const EditorToolbar: React.FC<Props> = ({
  certificateData,
  onChange,
  onOpenAiModal,
  onExportPDF,
  onExportImage,
  onShareEmail,
  onShareWhatsApp,
  onPrint,
  onSaveToCloud,
  onUpdateCloudCertificate,
  onOpenGoogleDriveModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'formatting' | 'templates' | 'style' | 'frame' | 'signatures' | 'elements' | 'export'>('content');
  const [selectedElementKey, setSelectedElementKey] = useState<keyof ElementStyles>('studentName');
  const [selectedFrameCategory, setSelectedFrameCategory] = useState<string>('الكل');
  const [selectedBgCategory, setSelectedBgCategory] = useState<string>('الكل');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<SignatureItem | null>(null);
  const [isAiTuningBg, setIsAiTuningBg] = useState(false);
  const [aiTuneStatus, setAiTuneStatus] = useState<string | null>(null);

  const handleAiTuneBackground = async () => {
    const currentBg = certificateData.bgImageUrl || certificateData.bgTextureUrl;
    if (!currentBg) {
      alert('الرجاء اختيار أو رفع صورة خلفية للشهادة أولاً لضبط العبارات والألوان عليها.');
      return;
    }

    setIsAiTuningBg(true);
    setAiTuneStatus('جاري تحليل ألوان وزخارف الخلفية بالذكاء الاصطناعي... ⏳');

    try {
      const response = await fetch('/api/ai-tune-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: currentBg,
          currentData: certificateData,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        const tuned = data.result;
        onChange({
          ...certificateData,
          title: tuned.title || certificateData.title,
          recipientIntro: tuned.recipientIntro || certificateData.recipientIntro,
          appreciationText: tuned.appreciationText || certificateData.appreciationText,
          poemOrQuote: tuned.poemOrQuote || certificateData.poemOrQuote,
          textColor: tuned.textColor || certificateData.textColor,
          primaryColor: tuned.primaryColor || certificateData.primaryColor,
          secondaryColor: tuned.secondaryColor || certificateData.secondaryColor,
          borderColor: tuned.borderColor || certificateData.borderColor,
          bgCardBacking: tuned.bgCardBacking ?? true,
          bgCardOpacity: tuned.bgCardOpacity ?? 0.82,
          updatedAt: new Date().toISOString(),
        });
        setAiTuneStatus('✨ تم ضبط العبارات والألوان والتباين بالذكاء الاصطناعي بنجاح!');
        setTimeout(() => setAiTuneStatus(null), 4500);
      } else {
        throw new Error(data.error || 'تعذر معالجة الصورة');
      }
    } catch (err: any) {
      console.error('AI tune error:', err);
      onChange({
        ...certificateData,
        textColor: '#0f172a',
        bgCardBacking: true,
        bgCardOpacity: 0.85,
        updatedAt: new Date().toISOString(),
      });
      setAiTuneStatus('تم تطبيق إعدادات القراءة والتباين العالية للعبارات فوق الخلفية!');
      setTimeout(() => setAiTuneStatus(null), 4500);
    } finally {
      setIsAiTuningBg(false);
    }
  };

  const updateField = <K extends keyof CertificateData>(field: K, value: CertificateData[K]) => {
    onChange({
      ...certificateData,
      [field]: value,
      updatedAt: new Date().toISOString()
    });
  };

  const updateElementStyle = (elementKey: keyof ElementStyles, styleUpdate: Partial<TextElementStyle>) => {
    const currentStyles = certificateData.elementStyles || {};
    const currentElemStyle = currentStyles[elementKey] || {};
    onChange({
      ...certificateData,
      elementStyles: {
        ...currentStyles,
        [elementKey]: {
          ...currentElemStyle,
          ...styleUpdate
        }
      },
      updatedAt: new Date().toISOString()
    });
  };

  const resetAllElementStyles = () => {
    onChange({
      ...certificateData,
      elementStyles: undefined,
      updatedAt: new Date().toISOString()
    });
  };

  const FORMATTABLE_ELEMENTS: { key: keyof ElementStyles; label: string; icon: string }[] = [
    { key: 'schoolHeader', label: 'ترويسة الوزارة / الإدارة', icon: '🏛️' },
    { key: 'schoolName', label: 'اسم المدرسة / الجهة', icon: '🏫' },
    { key: 'studentName', label: 'اسم الطالب / المكرّم', icon: '👤' },
    { key: 'title', label: 'العنوان الرئيسي', icon: '📜' },
    { key: 'subtitle', label: 'العنوان الفرعي', icon: '🔖' },
    { key: 'appreciationText', label: 'فقرة التقدير والتكريم', icon: '📝' },
    { key: 'poemOrQuote', label: 'بيت الشعر أو القول', icon: '✨' },
    { key: 'grade', label: 'الصف / الشعبة', icon: '🎓' },
    { key: 'recipientIntro', label: 'مقدمة التكريم', icon: '🎗️' },
    { key: 'dateLocation', label: 'التاريخ والمكان', icon: '📅' },
    { key: 'badgeTitle', label: 'عنوان الوسام', icon: '🏅' },
  ];

  const applyPresetTemplate = (presetId: string) => {
    const preset = TEMPLATE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Capture user's personal & customized fields
    const {
      studentName,
      grade,
      schoolName,
      subject,
      logoUrl,
      signatures,
      emojis,
      positions,
      issueDate,
      issuePlace,
      verificationCode,
      qrCodeData,
      watermarkText
    } = certificateData;

    onChange({
      ...certificateData,
      ...preset.defaultData,
      // Retain user's actual values for personal identity & customized fields
      studentName: studentName || preset.defaultData.studentName,
      grade: grade || preset.defaultData.grade,
      schoolName: schoolName || preset.defaultData.schoolName,
      subject: subject || preset.defaultData.subject,
      logoUrl: logoUrl !== undefined ? logoUrl : preset.defaultData.logoUrl,
      signatures: (signatures && signatures.length > 0) ? signatures : preset.defaultData.signatures,
      emojis: emojis ?? certificateData.emojis,
      positions: positions ?? certificateData.positions,
      issueDate: issueDate || preset.defaultData.issueDate,
      issuePlace: issuePlace || preset.defaultData.issuePlace,
      verificationCode: verificationCode || preset.defaultData.verificationCode,
      qrCodeData: qrCodeData || preset.defaultData.qrCodeData,
      watermarkText: watermarkText || preset.defaultData.watermarkText,
      id: certificateData.id,
      updatedAt: new Date().toISOString()
    });
  };

  // Color Theme Presets
  const colorPalettes = [
    {
      name: 'ذهبي أندلسي فاخر',
      primary: '#854d0e',
      secondary: '#d97706',
      accent: '#fef08a',
      bg: '#fefce8',
      text: '#1e293b'
    },
    {
      name: 'زمردي ملكي راقٍ',
      primary: '#065f46',
      secondary: '#059669',
      accent: '#fef08a',
      bg: '#f0fdf4',
      text: '#064e3b'
    },
    {
      name: 'كحلي ياقوتي رسمي',
      primary: '#1e1b4b',
      secondary: '#3730a3',
      accent: '#38bdf8',
      bg: '#f8fafc',
      text: '#0f172a'
    },
    {
      name: 'عنابي الوفاء الفاخر',
      primary: '#881337',
      secondary: '#9f1239',
      accent: '#fef08a',
      bg: '#fff1f2',
      text: '#4c0519'
    },
    {
      name: 'بنفسجي الإبداع والذكاء',
      primary: '#4c1d95',
      secondary: '#6d28d9',
      accent: '#a78bfa',
      bg: '#f5f3ff',
      text: '#2e1065'
    },
    {
      name: 'رمادي عالي البساطة',
      primary: '#334155',
      secondary: '#64748b',
      accent: '#cbd5e1',
      bg: '#ffffff',
      text: '#1e293b'
    }
  ];

  const fonts: { id: FontOption; label: string; sample: string }[] = [
    { id: 'Cairo', label: 'القاهرة (Cairo)', sample: 'خط عصري وواضح' },
    { id: 'Amiri', label: 'الأميري (Amiri)', sample: 'خط كلاسيكي ملكي' },
    { id: 'Tajawal', label: 'تجوال (Tajawal)', sample: 'خط متوازن للشهادات' },
    { id: 'Almarai', label: 'المراعي (Almarai)', sample: 'خط أنيق للتقارير' },
    { id: 'Aref Ruqaa', label: 'عارف رقعة (Ruqaa)', sample: 'خط الرقعة الأصيل' },
    { id: 'Reem Kufi', label: 'ريم كوفي (Kufi)', sample: 'خط كوفي حديث' },
    { id: 'Changa', label: 'تشانغا (Changa)', sample: 'خط مرح للأطفال' },
    { id: 'El Messiri', label: 'المسيري (El Messiri)', sample: 'خط مزخرف ناعم' },
    { id: 'Lalezar', label: 'لاليجار (Lalezar)', sample: 'خط عريض بارز للألقاب' },
    { id: 'Kufam', label: 'كوفام (Kufam)', sample: 'خط كوفي أندلسي فخم' },
    { id: 'Scheherazade New', label: 'شهرزاد (Scheherazade)', sample: 'خط نسخي ملكي فاخر' },
    { id: 'Vazirmatn', label: 'وزير (Vazirmatn)', sample: 'خط تقني متناسق' },
    { id: 'Harmattan', label: 'حرمل (Harmattan)', sample: 'خط صحراوي أنيق' },
    { id: 'Marhey', label: 'مرحي (Marhey)', sample: 'خط يدوي ديناميكي' },
  ];

  const frames: { id: FrameStyle; label: string; category: string; description: string }[] = [
    { id: 'guilloche-royal', label: 'إطار الجيلوش الفرعوني والملكي', category: 'ملكي', description: 'زخارف جيلوش هندسية مع ميداليات رقيقة' },
    { id: 'baroque-gold', label: 'الزخرفة الباروكية الذهبية', category: 'ملكي', description: 'نقوش ذهبية زاهية عند الأركان والأطراف' },
    { id: 'luxurious-gradient-border', label: 'الإطار المعدني المصقول', category: 'ملكي', description: 'إطار عريض ذو أزرار ذهبية رقيقة' },
    { id: 'royal-ribbon', label: 'التاج الكحلي الملكي', category: 'ملكي', description: 'شريط ترويسة ملكي مع إطار كحلي عريض' },
    { id: 'double-gold', label: 'الإطار الذهبي المزدوج', category: 'ملكي', description: 'خطوط مزدوجة كلاسيكية مع أركان عريضة' },
    
    { id: 'andalusian-star', label: 'النجمة الأندلسية المذهبة', category: 'إسلامي', description: 'نجوم ثمانية مذهبة وأركان إسلامية' },
    { id: 'oriental-islamic', label: 'النجمة والأركان الشرقية', category: 'إسلامي', description: 'إطار شرقي زمردي مع زخرفة النجمة' },
    { id: 'islamic-arch', label: 'المحراب الإسلامي الأصيل', category: 'إسلامي', description: 'طابع هندسي مستوحى من المحاريب' },
    { id: 'moroccan-mosaic', label: 'الفسيفساء المغربية', category: 'إسلامي', description: 'بلاطات فسيفساء زليج هندسية دقيقة' },

    { id: 'golden-vines', label: 'أغصان الزيتون والنباتات', category: 'كلاسيكي', description: 'أوراق شجر وأغصان زيتون ملفوفة' },
    { id: 'floral-corners', label: 'أركان الزهور المزخرفة', category: 'كلاسيكي', description: 'زهور باروكية دقيقة مع خطوط منقطة' },
    { id: 'victorian-crest', label: 'الفيكتوري الزخرفي تاج الملك', category: 'كلاسيكي', description: 'تاج كلاسيكي فيكتوري مع لولبيات الأركان' },
    { id: 'vintage-certificate', label: 'دبلوم الجيلوش الكلاسيكي', category: 'كلاسيكي', description: 'طابع دبلومات الجامعات العريقة' },
    { id: 'classic-ornate', label: 'الزخرفة الثلاثية الكلاسيكية', category: 'كلاسيكي', description: 'ثلاث طبقات حدية متناسقة' },
    { id: 'greek-key-meander', label: 'الإغريقي الملتف (Meander)', category: 'كلاسيكي', description: 'نقوش هندسية متصلة على الداير' },

    { id: 'double-dotted-luxury', label: 'الإطار النقاطي الفاخر', category: 'حديث', description: 'مزيج خطوط مستقيمة ونقاط دقيقة' },
    { id: 'emerald-border', label: 'الحد الأخضر الزمردي', category: 'حديث', description: 'خطوط زمردية متتقطعة مع معينات الأركان' },
    { id: 'wavy-artistic', label: 'الأمواج الفنية الملونة', category: 'حديث', description: 'حواف مموجة وألوان زاهية مبهجة' },
    { id: 'geometric-cyber', label: 'السايبر والنيون الرقمي', category: 'حديث', description: 'خطوط تقنية مستقبيلية مضاءة' },
    { id: 'modern-geometric', label: 'الهندسي العصري المتدرج', category: 'حديث', description: 'أقواس هندسية في الزوايا' },
    { id: 'playful-dots', label: 'نقاط البراعم المرحة', category: 'حديث', description: 'إطار مرح للمكافآت والأطفال' },
    { id: 'clean-minimal', label: 'الإطار الناصع البسيط', category: 'حديث', description: 'حدود ناعمة وبسيطة جداً' },
  ];

  const badgeIcons: { id: BadgeIconType; label: string }[] = [
    { id: 'award', label: 'وسام' },
    { id: 'trophy', label: 'كأس' },
    { id: 'crown', label: 'تاج' },
    { id: 'star', label: 'نجمة' },
    { id: 'shield', label: 'درع' },
    { id: 'sparkles', label: 'شرارة' },
    { id: 'book', label: 'كتاب' },
    { id: 'target', label: 'هدف' },
    { id: 'medal', label: 'ميدالية' },
  ];

  const addEmoji = (emoji: string) => {
    const currentEmojis = certificateData.emojis || [];
    const newEmoji = {
      id: `emoji-${Date.now()}`,
      emoji,
      x: 12 + (currentEmojis.length * 20) % 70,
      y: 12 + (currentEmojis.length * 16) % 65,
      size: 36
    };
    updateField('emojis', [...currentEmojis, newEmoji]);
  };

  const removeEmoji = (id: string) => {
    updateField('emojis', (certificateData.emojis || []).filter(e => e.id !== id));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateField('logoUrl', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...certificateData,
          badgeUrl: event.target?.result as string,
          badgeType: 'upload',
          showBadge: true,
          updatedAt: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...certificateData,
          stamp: {
            ...certificateData.stamp,
            shape: 'custom',
            imageUrl: event.target?.result as string,
            show: true
          },
          updatedAt: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...certificateData,
          customFrameUrl: event.target?.result as string,
          updatedAt: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateField('bgTextureUrl', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSignature = (newSig: SignatureItem) => {
    const currentSigs = [...certificateData.signatures];
    const existingIndex = currentSigs.findIndex(s => s.id === newSig.id);
    if (existingIndex >= 0) {
      currentSigs[existingIndex] = newSig;
    } else {
      currentSigs.push(newSig);
    }
    updateField('signatures', currentSigs);
  };

  const removeSignature = (id: string) => {
    updateField('signatures', certificateData.signatures.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-right">
      
      {/* Category Navigation Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth max-w-full">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>البيانات</span>
        </button>

        <button
          onClick={() => setActiveTab('formatting')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'formatting'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
          <span>تنسيق النصوص</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>القوالب</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'style'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span>الألوان والخطوط</span>
        </button>

        <button
          onClick={() => setActiveTab('signatures')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'signatures'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PenTool className="w-4 h-4 text-amber-600 shrink-0" />
          <span>التوقيعات</span>
        </button>

        <button
          onClick={() => setActiveTab('frame')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'frame'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Maximize2 className="w-4 h-4 shrink-0" />
          <span>الإطار والشعار</span>
        </button>

        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'elements'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stamp className="w-4 h-4 shrink-0" />
          <span>الأختام والرموز</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 min-w-[75px] sm:min-w-[95px] py-2.5 sm:py-3 px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold border-b-2 flex flex-col items-center gap-1 transition shrink-0 whitespace-nowrap ${
            activeTab === 'export'
              ? 'border-amber-500 text-amber-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>التصدير</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="p-5 max-h-[560px] overflow-y-auto space-y-5">
        
        {/* TAB 1: CONTENT */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            
            {/* AI Generator Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/80 p-4 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-['Cairo']">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  صياغة نصوص التكريم بالذكاء الاصطناعي
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  أدخل اسم الطالب والمجال وسيكتب لك Gemini نصاً مشجعاً وراقياً بضغطة زر!
                </p>
              </div>
              <button
                onClick={onOpenAiModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition shadow-2xs whitespace-nowrap"
              >
                توليد بـ AI
              </button>
            </div>

            {/* Top Margin & Header Customization */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-600" />
                  تخصيص الهامش العلوي والترويسة (Header)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">إظهار/إخفاء العبارات بكل حرية</span>
              </div>

              {/* Presets */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">نماذج ترويسة جاهزة وسريعة:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    {
                      label: '🇸🇦 وزارة التعليم',
                      line1: 'المملكة العربية السعودية',
                      line2: 'وزارة التعليم',
                      line3: 'إدارة التعليم بمحافظة الرياض',
                      show1: true, show2: true, show3: true, showSchool: true, showVision: true, vision: 'رؤية 2030'
                    },
                    {
                      label: '🎓 جامعة / كليّة',
                      line1: 'وزارة التعليم العالي والبحث العلمي',
                      line2: 'جامعة الملك سعود - كلية العلوم',
                      line3: 'عمادة الشؤون الأكاديمية',
                      show1: true, show2: true, show3: true, showSchool: true, showVision: false, vision: ''
                    },
                    {
                      label: '🏢 شركة / مؤسسة',
                      line1: 'قطاع الأعمال والتطوير المؤسسي',
                      line2: 'شركة الإبداع للحلول المتقدمة',
                      line3: 'إدارة الموارد البشرية والتدريب',
                      show1: true, show2: true, show3: false, showSchool: true, showVision: false, vision: ''
                    },
                    {
                      label: '🌐 مركز تدريب',
                      line1: 'المركز الدولي للتطوير والقيادة',
                      line2: 'قسم الاعتماد والشهادات المعتمدة',
                      line3: '',
                      show1: true, show2: true, show3: false, showSchool: true, showVision: false, vision: ''
                    },
                    {
                      label: '📄 ترويسة مبسطة',
                      line1: '',
                      line2: '',
                      line3: '',
                      show1: false, show2: false, show3: false, showSchool: true, showVision: false, vision: ''
                    }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...certificateData,
                          headerLine1: p.line1,
                          headerLine2: p.line2,
                          headerLine3: p.line3,
                          showHeaderLine1: p.show1,
                          showHeaderLine2: p.show2,
                          showHeaderLine3: p.show3,
                          showHeaderSchoolName: p.showSchool,
                          showHeaderVisionText: p.showVision,
                          headerVisionText: p.vision || certificateData.headerVisionText || 'رؤية 2030',
                          updatedAt: new Date().toISOString()
                        })
                      }
                      className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition shadow-2xs"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Header Lines */}
              <div className="space-y-2 pt-1">
                {/* Line 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">السطر الأول بالترويسة:</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderLine1 ?? true}
                        onChange={(e) => updateField('showHeaderLine1', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {(certificateData.showHeaderLine1 ?? true) && (
                    <input
                      type="text"
                      value={certificateData.headerLine1 ?? 'المملكة العربية السعودية'}
                      onChange={(e) => updateField('headerLine1', e.target.value)}
                      placeholder="مثال: المملكة العربية السعودية"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                {/* Line 2 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">السطر الثاني بالترويسة:</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderLine2 ?? true}
                        onChange={(e) => updateField('showHeaderLine2', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {(certificateData.showHeaderLine2 ?? true) && (
                    <input
                      type="text"
                      value={certificateData.headerLine2 ?? 'وزارة التعليم / الجهة المعتمدة'}
                      onChange={(e) => updateField('headerLine2', e.target.value)}
                      placeholder="مثال: وزارة التعليم"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                {/* Line 3 (Optional extra line) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">السطر الثالث (إدارة التعليم / الفرع):</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderLine3 ?? false}
                        onChange={(e) => updateField('showHeaderLine3', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {certificateData.showHeaderLine3 && (
                    <input
                      type="text"
                      value={certificateData.headerLine3 ?? 'إدارة التعليم بمحافظة الرياض'}
                      onChange={(e) => updateField('headerLine3', e.target.value)}
                      placeholder="مثال: إدارة التعليم بمحافظة الرياض"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                {/* Line 4 (Extra right line) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">السطر الرابع باليمين (سطر إضافي):</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderRightExtra ?? false}
                        onChange={(e) => updateField('showHeaderRightExtra', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {certificateData.showHeaderRightExtra && (
                    <input
                      type="text"
                      value={certificateData.headerRightExtra ?? 'مكتب التعليم الخاص'}
                      onChange={(e) => updateField('headerRightExtra', e.target.value)}
                      placeholder="مثال: قسم الجودة والتطوير"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                {/* School / Institution Name toggle & field */}
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">اسم المدرسة / الجهة بالترويسة:</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderSchoolName ?? true}
                        onChange={(e) => updateField('showHeaderSchoolName', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {(certificateData.showHeaderSchoolName ?? true) && (
                    <input
                      type="text"
                      value={certificateData.schoolName}
                      onChange={(e) => updateField('schoolName', e.target.value)}
                      placeholder="مثال: مدرسة التميز النموذجية"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  )}
                </div>

                {/* Header Vision Text / Extra Slogan */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">شعار الرؤية / عبارة هامش إضافية:</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderVisionText ?? false}
                        onChange={(e) => updateField('showHeaderVisionText', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {certificateData.showHeaderVisionText && (
                    <input
                      type="text"
                      value={certificateData.headerVisionText ?? 'رؤية 2030'}
                      onChange={(e) => updateField('headerVisionText', e.target.value)}
                      placeholder="مثال: رؤية 2030 / شعار الجودة"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                {/* Header Elements Typography & Formatting Controls */}
                <div className="pt-2.5 border-t border-slate-200/80 mt-2 space-y-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                      <span>✨</span>
                      <span>تنسيق خط وسَمك عناصر الترويسة</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">
                      (الوزارة والإدارة واسم المدرسة)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Font Family for Header */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 mb-0.5">نوع خط الترويسة:</span>
                      <select
                        value={certificateData.elementStyles?.schoolHeader?.fontFamily || ''}
                        onChange={(e) => updateElementStyle('schoolHeader', { fontFamily: (e.target.value || undefined) as FontOption })}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">(استخدام الخط العام للشهادة)</option>
                        <option value="Cairo">خط القاهرة المعاصر (Cairo)</option>
                        <option value="Amiri">الخط الأميري (Amiri)</option>
                        <option value="Tajawal">خط تجول (Tajawal)</option>
                        <option value="Almarai">خط المراعي (Almarai)</option>
                        <option value="Aref Ruqaa">خط الرقعة (Aref Ruqaa)</option>
                        <option value="Reem Kufi">الخط الكوفي (Reem Kufi)</option>
                        <option value="El Messiri">خط الخاطر (El Messiri)</option>
                        <option value="Changa">خط الشانغا (Changa)</option>
                        <option value="Scheherazade New">خط شهرزاد (Scheherazade)</option>
                        <option value="Vazirmatn">خط وزير (Vazirmatn)</option>
                      </select>
                    </div>

                    {/* Font Weight for Header */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 mb-0.5">سمك خط الترويسة:</span>
                      <select
                        value={certificateData.elementStyles?.schoolHeader?.fontWeight || 'bold'}
                        onChange={(e) => updateElementStyle('schoolHeader', { fontWeight: e.target.value as any })}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="light">خفيف (Light - 300)</option>
                        <option value="normal">عادي (Normal - 400)</option>
                        <option value="bold">عريض بارز (Bold - 700)</option>
                        <option value="extrabold">عريض جداً (ExtraBold - 900)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* Size scale preset */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 mb-0.5">حجم الترويسة:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { label: 'صغير', val: 80 },
                          { label: 'عادي', val: 100 },
                          { label: 'كبير', val: 120 },
                          { label: 'ضخم', val: 140 },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => updateElementStyle('schoolHeader', { fontSize: preset.val })}
                            className={`flex-1 py-1 text-[10px] font-bold rounded border transition cursor-pointer ${
                              (certificateData.elementStyles?.schoolHeader?.fontSize || 100) === preset.val
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* School Name Custom Font override */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 mb-0.5">خط مخصص لاسم المدرسة (اختياري):</span>
                      <select
                        value={certificateData.elementStyles?.schoolName?.fontFamily || ''}
                        onChange={(e) => updateElementStyle('schoolName', { fontFamily: (e.target.value || undefined) as FontOption })}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">(تلقائي: مطابق لترويسة الوزارة والجهة)</option>
                        <option value="Cairo">خط القاهرة (Cairo)</option>
                        <option value="Amiri">الخط الأميري (Amiri)</option>
                        <option value="Tajawal">خط تجول (Tajawal)</option>
                        <option value="Almarai">خط المراعي (Almarai)</option>
                        <option value="Aref Ruqaa">خط الرقعة (Aref Ruqaa)</option>
                        <option value="Reem Kufi">الخط الكوفي (Reem Kufi)</option>
                        <option value="El Messiri">خط الخاطر (El Messiri)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب / المكرّم</label>
                <input
                  type="text"
                  value={certificateData.studentName}
                  onChange={(e) => updateField('studentName', e.target.value)}
                  placeholder="مثال: عبد الله محمد الشمري"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer select-none text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={certificateData.showRecipientBox !== false}
                    onChange={(e) => updateField('showRecipientBox', e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>إظهار المربع الذهبي خلف اسم الطالب</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف / الفصل / الشعبة</label>
                <input
                  type="text"
                  value={certificateData.grade}
                  onChange={(e) => updateField('grade', e.target.value)}
                  placeholder="مثال: الصف الأول الثانوي - أ"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المادة / المجال المكرم فيه</label>
                <input
                  type="text"
                  value={certificateData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  placeholder="مثال: التفوق العلمي والابتكار"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الشهادة الرئيسي</label>
              <input
                type="text"
                value={certificateData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="مثال: شهادة شكر وتقدير"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي</label>
              <input
                type="text"
                value={certificateData.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="مثال: وسام التميز للعام الدراسي 1447 هـ"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عبارة التقدير والشكر التفصيلية</label>
              <textarea
                rows={3}
                value={certificateData.appreciationText}
                onChange={(e) => updateField('appreciationText', e.target.value)}
                placeholder="نص التكريم المشجع..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  ✨ بيت شعر أو مقولة ملهمة
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors">
                  <input
                    type="checkbox"
                    checked={certificateData.showPoemOrQuote ?? true}
                    onChange={(e) => updateField('showPoemOrQuote', e.target.checked)}
                    className="accent-amber-600 rounded cursor-pointer w-3.5 h-3.5"
                  />
                  <span>إظهار في الشهادة</span>
                </label>
              </div>
              {(certificateData.showPoemOrQuote ?? true) && (
                <textarea
                  value={certificateData.poemOrQuote}
                  onChange={(e) => updateField('poemOrQuote', e.target.value)}
                  placeholder="«من خطا نحو العلا خطوةً... جنى من الثمار أحلى النعم»"
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 italic bg-white resize-y mt-1.5"
                />
              )}
            </div>

            {/* Date & Location Section with Numeral Customization */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                تخصيص التاريخ والمكان وضبط خطوط الأرقام
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Date customization */}
                <div className="space-y-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      خيارات صيغة ونظام التاريخ
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderDate ?? true}
                        onChange={(e) => updateField('showHeaderDate', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>

                  {(certificateData.showHeaderDate ?? true) && (
                    <div className="space-y-2.5">
                      {/* Date Format Mode Selector Tabs */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">حدد نظام التاريخ المطلوب في الشهادة:</label>
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          {[
                            { id: 'hijri', label: '🌙 الهجري فقط' },
                            { id: 'gregorian', label: '📅 الميلادي فقط' },
                            { id: 'both', label: '🌙📅 كلاهما' },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                const mode = tab.id as 'hijri' | 'gregorian' | 'both';
                                onChange({
                                  ...certificateData,
                                  dateFormatMode: mode,
                                  issueDateHijri: certificateData.issueDateHijri || getTodayHijriDate(),
                                  issueDateGregorian: certificateData.issueDateGregorian || getTodayGregorianDate(),
                                  updatedAt: new Date().toISOString(),
                                });
                              }}
                              className={`py-1.5 text-[11px] font-bold rounded-md transition ${
                                (certificateData.dateFormatMode || 'both') === tab.id
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display Layout choice when mode is 'both' */}
                      {(certificateData.dateFormatMode || 'both') === 'both' && (
                        <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 p-2 rounded-lg">
                          <span className="text-[10px] font-bold text-amber-950">تنسيق العرض:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateField('dateDisplayLayout', 'single-line')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                (certificateData.dateDisplayLayout || 'single-line') === 'single-line'
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-700'
                              }`}
                            >
                              سطر واحد
                            </button>
                            <button
                              type="button"
                              onClick={() => updateField('dateDisplayLayout', 'stacked')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                certificateData.dateDisplayLayout === 'stacked'
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-700'
                              }`}
                            >
                              سطران (عمودي)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Input fields based on selected mode */}
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={certificateData.dateLabel || 'التاريخ'}
                            onChange={(e) => updateField('dateLabel', e.target.value)}
                            placeholder="تسمية"
                            className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 font-bold text-slate-700"
                            title="تسمية الحقل (مثلاً: التاريخ)"
                          />

                          {certificateData.dateFormatMode === 'hijri' && (
                            <input
                              type="text"
                              value={certificateData.issueDateHijri || getTodayHijriDate()}
                              onChange={(e) => {
                                updateField('issueDateHijri', e.target.value);
                                updateField('issueDate', e.target.value);
                              }}
                              placeholder="1447/02/25 هـ"
                              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                            />
                          )}

                          {certificateData.dateFormatMode === 'gregorian' && (
                            <input
                              type="text"
                              value={certificateData.issueDateGregorian || certificateData.issueDate || getTodayGregorianDate()}
                              onChange={(e) => {
                                updateField('issueDateGregorian', e.target.value);
                                updateField('issueDate', e.target.value);
                              }}
                              placeholder="2026/08/08 م"
                              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                            />
                          )}

                          {(certificateData.dateFormatMode || 'both') === 'both' && (
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500 w-10">هجري:</span>
                                <input
                                  type="text"
                                  value={certificateData.issueDateHijri || getTodayHijriDate()}
                                  onChange={(e) => updateField('issueDateHijri', e.target.value)}
                                  placeholder="1447/02/25 هـ"
                                  className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500 w-10">ميلادي:</span>
                                <input
                                  type="text"
                                  value={certificateData.issueDateGregorian || getTodayGregorianDate()}
                                  onChange={(e) => updateField('issueDateGregorian', e.target.value)}
                                  placeholder="2026/08/08 م"
                                  className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Formatting buttons */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const h = getTodayHijriDate('latin');
                              const g = getTodayGregorianDate('latin');
                              onChange({
                                ...certificateData,
                                issueDateHijri: h,
                                issueDateGregorian: g,
                                issueDate: `${h} - ${g}`,
                                updatedAt: new Date().toISOString(),
                              });
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 transition flex items-center gap-1"
                          >
                            📅 اليوم تلقائياً
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const h = normalizeDateDigits(certificateData.issueDateHijri || getTodayHijriDate(), 'latin');
                              const g = normalizeDateDigits(certificateData.issueDateGregorian || getTodayGregorianDate(), 'latin');
                              onChange({
                                ...certificateData,
                                issueDateHijri: h,
                                issueDateGregorian: g,
                                issueDate: `${h} - ${g}`,
                                updatedAt: new Date().toISOString(),
                              });
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 transition"
                            title="توحيد الأرقام بالصيغة اللاتينية المعيارية (0, 1, 2...)"
                          >
                            🔢 أرقام (0, 1, 2)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const h = normalizeDateDigits(certificateData.issueDateHijri || getTodayHijriDate(), 'arabic');
                              const g = normalizeDateDigits(certificateData.issueDateGregorian || getTodayGregorianDate(), 'arabic');
                              onChange({
                                ...certificateData,
                                issueDateHijri: h,
                                issueDateGregorian: g,
                                issueDate: `${h} - ${g}`,
                                updatedAt: new Date().toISOString(),
                              });
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 transition"
                            title="توحيد الأرقام بالصيغة العربية الشرقية (٠، ١، ٢...)"
                          >
                            🔣 أرقام (٠, ١, ٢)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location customization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">مكان الإصدار:</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderPlace ?? true}
                        onChange={(e) => updateField('showHeaderPlace', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>

                  {(certificateData.showHeaderPlace ?? true) && (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={certificateData.placeLabel || 'المكان'}
                        onChange={(e) => updateField('placeLabel', e.target.value)}
                        placeholder="تسمية (المكان)"
                        className="w-24 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        value={certificateData.issuePlace}
                        onChange={(e) => updateField('issuePlace', e.target.value)}
                        placeholder="الرياض"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Serial / Certificate Reference Number */}
                <div className="space-y-2 col-span-1 md:col-span-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">رقم الشهادة / القيد (المرجع باليسار):</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderCertNumber ?? false}
                        onChange={(e) => updateField('showHeaderCertNumber', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {certificateData.showHeaderCertNumber && (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={certificateData.certNumberLabel || 'الرقم'}
                        onChange={(e) => updateField('certNumberLabel', e.target.value)}
                        placeholder="التسمية (الرقم)"
                        className="w-24 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        value={certificateData.certNumber ?? 'REF-1447/0892'}
                        onChange={(e) => updateField('certNumber', e.target.value)}
                        placeholder="مثال: REF-1447/0892"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Extra Left Lines */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">سطر إضافي باليسار (1):</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderLeftExtra1 ?? false}
                        onChange={(e) => updateField('showHeaderLeftExtra1', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {certificateData.showHeaderLeftExtra1 && (
                    <input
                      type="text"
                      value={certificateData.headerLeftExtra1 ?? 'نوع الشهادة: معتمدة'}
                      onChange={(e) => updateField('headerLeftExtra1', e.target.value)}
                      placeholder="مثال: نوع الشهادة: معتمدة"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">سطر إضافي باليسار (2):</label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showHeaderLeftExtra2 ?? false}
                        onChange={(e) => updateField('showHeaderLeftExtra2', e.target.checked)}
                        className="accent-amber-500 rounded w-3.5 h-3.5"
                      />
                      إظهار
                    </label>
                  </div>
                  {certificateData.showHeaderLeftExtra2 && (
                    <input
                      type="text"
                      value={certificateData.headerLeftExtra2 ?? 'الكود: AC-2026'}
                      onChange={(e) => updateField('headerLeftExtra2', e.target.value)}
                      placeholder="مثال: كود المراجعة: AC-2026"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                {/* Digital Verification Phrase Control */}
                <div className="space-y-2 col-span-1 md:col-span-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      عبارة "شهادة موثقة رقمياً" بالهيدر:
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={certificateData.showVerificationBadge ?? true}
                        onChange={(e) => updateField('showVerificationBadge', e.target.checked)}
                        className="accent-emerald-600 rounded w-3.5 h-3.5"
                      />
                      إظهار العبارة
                    </label>
                  </div>
                  {(certificateData.showVerificationBadge ?? true) && (
                    <input
                      type="text"
                      value={certificateData.verificationBadgeText ?? 'شهادة موثقة رقمياً'}
                      onChange={(e) => updateField('verificationBadgeText', e.target.value)}
                      placeholder="مثال: شهادة موثقة رقمياً / شهادة معتمدة ورسمية"
                      className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50/50 text-emerald-900 font-medium"
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB: FORMATTING (Per-element formatting & customization) */}
        {activeTab === 'formatting' && (
          <div className="space-y-5">
            {/* Header banner */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold font-['Cairo']">تخصيص تنسيق كل عنصر كتابي على حدة</h4>
                  <p className="text-[10px] text-slate-300">اختر أياً من النصوص لتعديل حجمه، محاذاته، نوع خطه وهامشه</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onSaveToCloud && (
                  <button
                    onClick={onSaveToCloud}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>حفظ سحابي</span>
                  </button>
                )}
                <button
                  onClick={resetAllElementStyles}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] rounded-lg transition flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="إعادة ضبط جميع التنسيقات للوضع الافتراضي"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              </div>
            </div>

            {/* Element Selector Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">اختر النص المراد تنسيقه:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FORMATTABLE_ELEMENTS.map((item) => {
                  const isSelected = selectedElementKey === item.key;
                  const hasCustomStyles = !!certificateData.elementStyles?.[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedElementKey(item.key)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-1.5 border transition cursor-pointer text-right ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                          : hasCustomStyles
                          ? 'bg-amber-50/70 border-amber-300 text-amber-900 hover:bg-amber-100/50'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1">
                        <span className="text-sm">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      {hasCustomStyles && (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-slate-950' : 'bg-amber-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Element Formatting Panel */}
            {selectedElementKey && (() => {
              const currentStyle: TextElementStyle = certificateData.elementStyles?.[selectedElementKey] || {};
              const currentElemObj = FORMATTABLE_ELEMENTS.find(e => e.key === selectedElementKey);

              return (
                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                    <h5 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <span className="text-base">{currentElemObj?.icon}</span>
                      تنسيق: <span className="text-amber-700 font-extrabold">{currentElemObj?.label}</span>
                    </h5>
                    {certificateData.elementStyles?.[selectedElementKey] && (
                      <button
                        onClick={() => updateElementStyle(selectedElementKey, {
                          fontSize: undefined,
                          align: undefined,
                          fontFamily: undefined,
                          fontWeight: undefined,
                          marginTop: undefined,
                          marginBottom: undefined,
                          letterSpacing: undefined,
                          color: undefined
                        })}
                        className="text-[10px] text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
                      >
                        مسح تنسيق هذا العنصر
                      </button>
                    )}
                  </div>

                  {/* Font Size Selector */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label className="font-bold text-slate-800">حجم النص:</label>
                      <span className="font-mono text-amber-700 font-extrabold bg-white px-2 py-0.5 rounded border border-amber-200">
                        {currentStyle.fontSize || 100}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={220}
                      step={5}
                      value={currentStyle.fontSize || 100}
                      onChange={(e) => updateElementStyle(selectedElementKey, { fontSize: Number(e.target.value) })}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 mt-1.5">
                      {[
                        { label: 'صغير', val: 80 },
                        { label: 'عادي', val: 100 },
                        { label: 'كبير', val: 130 },
                        { label: 'ضخم', val: 160 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          onClick={() => updateElementStyle(selectedElementKey, { fontSize: preset.val })}
                          className={`flex-1 py-1 text-[10px] font-bold rounded border transition cursor-pointer ${
                            (currentStyle.fontSize || 100) === preset.val
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Alignment & Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Alignment */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">محاذاة النص:</label>
                      <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateElementStyle(selectedElementKey, { align: 'right' })}
                          className={`p-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                            (currentStyle.align || 'right') === 'right' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="محاذاة لليمين"
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateElementStyle(selectedElementKey, { align: 'center' })}
                          className={`p-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                            currentStyle.align === 'center' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="محاذاة للوسط"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateElementStyle(selectedElementKey, { align: 'left' })}
                          className={`p-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                            currentStyle.align === 'left' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="محاذاة لليسار"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateElementStyle(selectedElementKey, { align: 'justify' })}
                          className={`p-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                            currentStyle.align === 'justify' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          title="ضبط كامل"
                        >
                          <AlignJustify className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Font Weight */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">سمك الخط:</label>
                      <select
                        value={currentStyle.fontWeight || 'normal'}
                        onChange={(e) => updateElementStyle(selectedElementKey, { fontWeight: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="light">خفيف (Light - 300)</option>
                        <option value="normal">عادي (Normal - 400)</option>
                        <option value="bold">عريض (Bold - 700)</option>
                        <option value="extrabold">عريض جداً (Extra Bold - 900)</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Calligraphy Font for this Element */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">خط الخط العربي الخاص بهذا النص:</label>
                    <select
                      value={currentStyle.fontFamily || ''}
                      onChange={(e) => updateElementStyle(selectedElementKey, { fontFamily: (e.target.value || undefined) as FontOption })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">(استخدام الخط العام للشهادة)</option>
                      <option value="Cairo">خط القاهرة المعاصر (Cairo)</option>
                      <option value="Amiri">الخط الأميري الكلاسيكي (Amiri)</option>
                      <option value="Tajawal">خط تجول الحديث (Tajawal)</option>
                      <option value="Almarai">خط المراعي النقي (Almarai)</option>
                      <option value="Aref Ruqaa">خط الرقعة الأصيل (Aref Ruqaa)</option>
                      <option value="Reem Kufi">الخط الكوفي الهندسي (Reem Kufi)</option>
                      <option value="Changa">خط الشانغا العصري (Changa)</option>
                      <option value="El Messiri">خط الخاطر الفني (El Messiri)</option>
                      <option value="Lalezar">خط لاله‌زار البارز (Lalezar)</option>
                      <option value="Kufam">خط كوفام المزخرف (Kufam)</option>
                      <option value="Scheherazade New">خط شهرزاد النسخي (Scheherazade New)</option>
                      <option value="Vazirmatn">خط وزير متقن (Vazirmatn)</option>
                      <option value="Harmattan">خط هرمتان البسيط (Harmattan)</option>
                      <option value="Marhey">خط مرحي المرح (Marhey)</option>
                    </select>
                  </div>

                  {/* Margins & Spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>الهامش العلوي:</span>
                        <span className="text-amber-700">{currentStyle.marginTop || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        step={2}
                        value={currentStyle.marginTop || 0}
                        onChange={(e) => updateElementStyle(selectedElementKey, { marginTop: Number(e.target.value) })}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>الهامش السفلي:</span>
                        <span className="text-amber-700">{currentStyle.marginBottom || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        step={2}
                        value={currentStyle.marginBottom || 0}
                        onChange={(e) => updateElementStyle(selectedElementKey, { marginBottom: Number(e.target.value) })}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Specific options for Student Name */}
                  {selectedElementKey === 'studentName' && (
                    <div className="pt-2 border-t border-amber-200/80">
                      <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 cursor-pointer select-none">
                        <span className="text-xs font-bold text-slate-800">إظهار المربع الذهبي / إطار خلفية اسم الطالب</span>
                        <input
                          type="checkbox"
                          checked={certificateData.showRecipientBox !== false}
                          onChange={(e) => updateField('showRecipientBox', e.target.checked)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                      </label>
                    </div>
                  )}

                  {/* Custom Text Color for this Element */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">لون النص الخاص لهذا العنصر:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentStyle.color || '#000000'}
                        onChange={(e) => updateElementStyle(selectedElementKey, { color: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentStyle.color || ''}
                        onChange={(e) => updateElementStyle(selectedElementKey, { color: e.target.value })}
                        placeholder="تلقائي حسب الثيم"
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700"
                      />
                      {currentStyle.color && (
                        <button
                          onClick={() => updateElementStyle(selectedElementKey, { color: undefined })}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          إلغاء اللون
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 2: PRESET TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            
            {/* Gallery Banner Button */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-amber-400 font-['Cairo']">
                    معرض شبكة القوالب التفاعلية (Full Grid Gallery)
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    استعرض القوالب الـ 20 في شبكة تكبير متكاملة مع تصنيف الفئات والمعاينة الحية
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                فتح المعرض الشامل
              </button>
            </div>

            <p className="text-xs font-bold text-slate-700">اختر القالب من المعاينة المصغرة للشهادات:</p>

            {/* Grid of Mini Certificate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {TEMPLATE_PRESETS.map((tmpl) => {
                const d = tmpl.defaultData;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => applyPresetTemplate(tmpl.id)}
                    className="p-2.5 rounded-2xl border border-slate-200 hover:border-amber-500 cursor-pointer transition-all shadow-2xs hover:shadow-md group relative bg-white flex flex-col justify-between"
                  >
                    {/* Mini Certificate Box */}
                    <div
                      className="w-full aspect-[1.5] rounded-xl shadow-2xs relative overflow-hidden flex flex-col justify-between p-2.5 border transition-transform group-hover:scale-[1.01]"
                      style={{
                        backgroundColor: d.backgroundColor || '#ffffff',
                        color: d.textColor || '#0f172a',
                        borderColor: d.primaryColor,
                        borderWidth: '2px',
                        borderStyle: 'double',
                      }}
                    >
                      <div className="text-center space-y-0.5">
                        <span className="text-[8px] font-bold block opacity-75" style={{ color: d.secondaryColor || d.primaryColor }}>
                          {d.schoolName}
                        </span>
                        <h6 className="text-[10px] font-black leading-tight line-clamp-1" style={{ color: d.primaryColor }}>
                          {d.title}
                        </h6>
                      </div>

                      <div className="my-1 text-center py-1 px-1.5 bg-white/80 rounded border border-black/5">
                        <span className="text-[7px] block opacity-70">طالب التكريم:</span>
                        <span className="text-[10px] font-black block line-clamp-1" style={{ color: d.primaryColor }}>
                          {d.studentName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[7px] opacity-80 pt-1 border-t border-black/10">
                        <span className="font-bold" style={{ color: d.primaryColor }}>{d.badgeTitle || 'وسام التميز'}</span>
                        <span>{tmpl.category}</span>
                      </div>
                    </div>

                    {/* Card Title & Desc */}
                    <div className="mt-2.5 px-1 flex items-center justify-between">
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-800 group-hover:text-amber-700 transition">
                          {tmpl.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{tmpl.description}</p>
                      </div>

                      <span className="text-[10px] bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-900 font-bold px-2 py-1 rounded-lg shrink-0 transition">
                        تطبيق
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STYLE, PALETTES & FONTS */}
        {activeTab === 'style' && (
          <div className="space-y-5">
            
            {/* Curated Color Palettes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">لوحات الألوان المجهزة بنقرة واحدة (Curated Palettes)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {colorPalettes.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange({
                        ...certificateData,
                        primaryColor: p.primary,
                        secondaryColor: p.secondary,
                        accentColor: p.accent,
                        backgroundColor: p.bg,
                        textColor: p.text,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 bg-white text-right transition flex flex-col gap-1.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: p.primary }} />
                      <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: p.secondary }} />
                      <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: p.accent }} />
                      <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: p.bg }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">اللون الرئيسي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificateData.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <span className="text-[10px] font-mono">{certificateData.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">اللون الثانوي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificateData.secondaryColor}
                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <span className="text-[10px] font-mono">{certificateData.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">لون الخلفية</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificateData.backgroundColor}
                    onChange={(e) => updateField('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <span className="text-[10px] font-mono">{certificateData.backgroundColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">لون النص</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={certificateData.textColor}
                    onChange={(e) => updateField('textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <span className="text-[10px] font-mono">{certificateData.textColor}</span>
                </div>
              </div>
            </div>

            {/* Luxury Background Gradients Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <label className="text-xs font-bold text-slate-800">التدرجات اللونية الفاخرة للخلفية (Luxury Gradients)</label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentEnabled = certificateData.bgGradient?.enabled;
                    updateField('bgGradient', {
                      ...(certificateData.bgGradient || GRADIENT_PRESETS[0].config),
                      enabled: !currentEnabled
                    });
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition ${
                    certificateData.bgGradient?.enabled
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {certificateData.bgGradient?.enabled ? 'التدرج مفعل ✓' : 'تفعيل التدرج'}
                </button>
              </div>

              {certificateData.bgGradient?.enabled && (
                <div className="space-y-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  {/* Presets Grid */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-2">اختر نمط التدرج الفاخر (Gradient Preset):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GRADIENT_PRESETS.map((preset) => {
                        const isSelected = certificateData.bgGradient?.type === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              updateField('bgGradient', {
                                ...preset.config,
                                enabled: true
                              });
                            }}
                            className={`p-2 rounded-xl border text-right transition flex flex-col gap-1.5 shadow-2xs ${
                              isSelected
                                ? 'border-amber-500 bg-white ring-2 ring-amber-500/30'
                                : 'border-slate-200 hover:border-amber-300 bg-white'
                            }`}
                          >
                            <div
                              className="w-full h-8 rounded-lg border border-slate-300/60 shadow-inner"
                              style={{ background: preset.previewCss }}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-800 truncate">{preset.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Gradient Fine-Tuning */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      <span>تخصيص ألوان وزاوية التدرج:</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">اللون الأول</label>
                        <input
                          type="color"
                          value={certificateData.bgGradient?.color1 || '#ffffff'}
                          onChange={(e) => {
                            updateField('bgGradient', {
                              ...(certificateData.bgGradient || GRADIENT_PRESETS[0].config),
                              color1: e.target.value,
                              enabled: true
                            });
                          }}
                          className="w-full h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">اللون الثاني</label>
                        <input
                          type="color"
                          value={certificateData.bgGradient?.color2 || '#fef3c7'}
                          onChange={(e) => {
                            updateField('bgGradient', {
                              ...(certificateData.bgGradient || GRADIENT_PRESETS[0].config),
                              color2: e.target.value,
                              enabled: true
                            });
                          }}
                          className="w-full h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">اللون الثالث (اختياري)</label>
                        <input
                          type="color"
                          value={certificateData.bgGradient?.color3 || '#fde68a'}
                          onChange={(e) => {
                            updateField('bgGradient', {
                              ...(certificateData.bgGradient || GRADIENT_PRESETS[0].config),
                              color3: e.target.value,
                              enabled: true
                            });
                          }}
                          className="w-full h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                        />
                      </div>
                    </div>

                    {/* Gradient Angle Slider */}
                    {certificateData.bgGradient?.type !== 'radial-center' && certificateData.bgGradient?.type !== 'royal-mesh' && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-700">زاوية التدرج (Angle):</label>
                          <span className="text-[10px] font-mono font-bold text-amber-700">
                            {certificateData.bgGradient?.angle ?? 135}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={certificateData.bgGradient?.angle ?? 135}
                          onChange={(e) => {
                            updateField('bgGradient', {
                              ...(certificateData.bgGradient || GRADIENT_PRESETS[0].config),
                              angle: parseInt(e.target.value, 10),
                              enabled: true
                            });
                          }}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Background Textures, Custom Image Upload, & AI Auto-Tune */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <label className="text-xs font-bold text-slate-800">خلفية الشهادة والصور المخصصة</label>
                </div>
                {(certificateData.bgImageUrl || certificateData.bgTextureUrl) && (
                  <button
                    type="button"
                    onClick={() => onChange({
                      ...certificateData,
                      bgImageUrl: undefined,
                      bgTextureUrl: undefined,
                      updatedAt: new Date().toISOString()
                    })}
                    className="text-[11px] px-2 py-0.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> إزالة خلفية الصورة
                  </button>
                )}
              </div>

              {/* Custom Image Upload & AI Tuning Banner */}
              <div className="p-3 bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-100/40 border border-amber-200/90 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-600" />
                      رفع صورة خلفية مخصصة من جهازك
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">يمكنك رفع صورة شهادة فارغة أو خلفية خاصة بمؤسستك/مدرستك</p>
                  </div>
                  <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs shrink-0">
                    <span>اختر صورة...</span>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const url = ev.target?.result as string;
                          onChange({
                            ...certificateData,
                            bgImageUrl: url,
                            bgTextureUrl: url,
                            bgOpacity: 1.0,
                            updatedAt: new Date().toISOString()
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} className="hidden" />
                  </label>
                </div>

                {/* Active Background Preview & AI Auto-Tune Trigger */}
                {(certificateData.bgImageUrl || certificateData.bgTextureUrl) && (
                  <div className="pt-2 border-t border-amber-200/60 space-y-2.5">
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-amber-200">
                      <div className="w-14 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={certificateData.bgImageUrl || certificateData.bgTextureUrl}
                          alt="خلفية الشهادة"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">الصورة المرفوعة نشطة</span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          جاهزة للضبط التلقائي بالذكاء الاصطناعي
                        </span>
                      </div>
                    </div>

                    {/* ✨ AI Auto-Tune Button */}
                    <button
                      type="button"
                      disabled={isAiTuningBg}
                      onClick={handleAiTuneBackground}
                      className="w-full p-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className={`w-4 h-4 text-yellow-200 ${isAiTuningBg ? 'animate-spin' : 'animate-bounce'}`} />
                      <span>
                        {isAiTuningBg
                          ? 'جاري ضبط ألوان وعبارات الشهادة بالذكاء الاصطناعي...'
                          : '✨ ضبط العبارات والألوان بالذكاء الاصطناعي على الصورة المرفوعة'}
                      </span>
                    </button>

                    {aiTuneStatus && (
                      <div className="p-2 bg-amber-100 text-amber-950 text-[11px] font-bold rounded-lg border border-amber-300 text-center animate-pulse">
                        {aiTuneStatus}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Background Preset Textures Library */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-800">✨ اختر من مكتبة الخلفيات والنقوش الفاخرة:</label>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                    {BACKGROUND_TEXTURES.length} نقش وتصميم
                  </span>
                </div>

                {/* Categories Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  {['الكل', 'زخارف إسلامية', 'كلاسيكي وورق', 'ملكي وفاخر', 'رخام وذهب', 'حديث وأمني'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedBgCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] whitespace-nowrap transition-all shadow-2xs ${
                        selectedBgCategory === cat
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid of Background Textures */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 max-h-[280px] overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                  {BACKGROUND_TEXTURES.filter(t => selectedBgCategory === 'الكل' || t.category === selectedBgCategory).map((tex) => {
                    const isSelected = certificateData.bgTextureUrl === tex.url || certificateData.bgImageUrl === tex.url;
                    return (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => onChange({
                          ...certificateData,
                          bgTextureUrl: tex.url,
                          bgImageUrl: tex.url,
                          updatedAt: new Date().toISOString()
                        })}
                        className={`p-2 rounded-xl border text-right transition flex flex-col gap-1 shadow-2xs group relative ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-500/30'
                            : 'border-slate-200 hover:border-amber-400 bg-white'
                        }`}
                      >
                        <div
                          className={`w-full h-12 rounded-lg bg-gradient-to-r ${tex.previewGradient} border border-slate-200/80 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-[1.02]`}
                        >
                          <div
                            className="absolute inset-0 opacity-50 bg-repeat"
                            style={{ backgroundImage: `url("${tex.url}")` }}
                          />
                          {isSelected && (
                            <div className="bg-amber-600 text-white p-1 rounded-full shadow-md relative z-10">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-800 truncate block">{tex.name}</span>
                          <span className="text-[8px] text-slate-500 font-semibold truncate block">{tex.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Adjustments (Opacity, Blur, Card Backing) */}
              {(certificateData.bgImageUrl || certificateData.bgTextureUrl) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="text-[11px] font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    ضبط الشفافية والوضوح لخلفية الصورة
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>شفافية الصورة</span>
                        <span>{Math.round((certificateData.bgOpacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={certificateData.bgOpacity ?? 1}
                        onChange={(e) => updateField('bgOpacity', parseFloat(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>نعومة الصورة (Blur)</span>
                        <span>{certificateData.bgBlur ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="1"
                        value={certificateData.bgBlur ?? 0}
                        onChange={(e) => updateField('bgBlur', parseInt(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>
                  </div>

                  {/* Card Backing toggle */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                        <input
                          type="checkbox"
                          checked={certificateData.bgCardBacking ?? false}
                          onChange={(e) => updateField('bgCardBacking', e.target.checked)}
                          className="accent-amber-600 rounded w-4 h-4"
                        />
                        إضافة حاوية شفافة خلف النصوص لزيادة وضوح الخط
                      </label>
                      <p className="text-[10px] text-slate-500 mr-5">يضمن مقروئية العبارات إذا كانت خلفية الصورة مزدحمة بالتفاصيل</p>
                    </div>

                    {certificateData.bgCardBacking && (
                      <div className="w-full sm:w-28 shrink-0">
                        <span className="text-[10px] font-bold text-slate-600 block text-left">
                          الشفافية: {Math.round((certificateData.bgCardOpacity ?? 0.82) * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0.2"
                          max="0.95"
                          step="0.05"
                          value={certificateData.bgCardOpacity ?? 0.82}
                          onChange={(e) => updateField('bgCardOpacity', parseFloat(e.target.value))}
                          className="w-full accent-amber-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Font Family Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">نوع الخط العربي (Calligraphy Fonts)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateField('fontFamily', f.id)}
                    className={`p-2.5 rounded-xl border text-right transition flex flex-col justify-between ${
                      certificateData.fontFamily === f.id
                        ? 'border-amber-500 bg-amber-50/80 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900">{f.label}</span>
                    <span className="text-sm mt-1 text-amber-900 font-medium" style={{ fontFamily: f.id }}>
                      {f.sample}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Scale */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">مقياس حجم الخط كلياً</label>
                <span className="text-xs font-mono text-slate-500">{Math.round(certificateData.fontSizeScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={certificateData.fontSizeScale}
                onChange={(e) => updateField('fontSizeScale', parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

          </div>
        )}

        {/* TAB 4: DIGITAL SIGNATURES */}
        {activeTab === 'signatures' && (
          <div className="space-y-4">
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-['Cairo']">
                  <PenTool className="w-4 h-4 text-amber-600" />
                  التوقيعات الرقمية المعتمدة
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  يمكن للمسؤولين والتنفيذيين توقيع الشهادات إلكترونياً (رسم، خط، أو صورة رسمية).
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingSignature(null);
                  setIsSignatureModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition shadow-2xs flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة توقيع جديد
              </button>
            </div>

            {/* Current Signatures List */}
            <div className="space-y-2">
              {certificateData.signatures && certificateData.signatures.map((sig) => (
                <div key={sig.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-xs">
                      {sig.type === 'draw' ? 'رسم' : sig.type === 'upload' ? 'صورة' : 'خط'}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">{sig.name}</h5>
                      <p className="text-[11px] text-slate-500">{sig.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSignature(sig);
                        setIsSignatureModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-lg transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => removeSignature(sig.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="حذف التوقيع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: FRAME, LOGO & BACKGROUND */}
        {activeTab === 'frame' && (
          <div className="space-y-4">
            
            {/* Custom Logo Upload & Customization */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">شعار المؤسسة / المدرسة (Logo)</span>
                {certificateData.logoUrl && (
                  <button
                    onClick={() => updateField('logoUrl', undefined)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف الشعار
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {certificateData.logoUrl ? (
                  <div className="relative">
                    <img src={certificateData.logoUrl} alt="Logo" className="w-14 h-14 object-contain bg-white rounded-lg p-1 border shadow-xs" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-amber-50 border border-dashed border-amber-300 flex items-center justify-center text-amber-700 text-[10px] font-bold text-center p-1">
                    لا يوجد شعار
                  </div>
                )}

                <label className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer text-center flex items-center justify-center gap-2 shadow-xs transition">
                  <Upload className="w-4 h-4" />
                  رفع الشعار من الجهاز
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>

              {/* Logo Size & Shape */}
              {certificateData.logoUrl && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">حجم الشعار:</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'sm', label: 'صغير' },
                        { id: 'md', label: 'متوسط' },
                        { id: 'lg', label: 'كبير' },
                        { id: 'xl', label: 'ضخم' }
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          onClick={() => updateField('logoSize', sz.id as any)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            (certificateData.logoSize || 'md') === sz.id
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">شكل الإطار:</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'circle', label: 'دائري' },
                        { id: 'square', label: 'مربع' },
                        { id: 'none', label: 'شفاف' }
                      ].map((sh) => (
                        <button
                          key={sh.id}
                          onClick={() => updateField('logoShape', sh.id as any)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            (certificateData.logoShape || 'circle') === sh.id
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Uploaded Frame Section */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-slate-50 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-950">إطار مخصص من الجهاز (Custom Frame)</span>
                </div>
                {certificateData.customFrameUrl && (
                  <button
                    onClick={() => updateField('customFrameUrl', undefined)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    إلغاء الإطار المخصص
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {certificateData.customFrameUrl ? (
                  <div className="relative w-16 h-12 rounded-lg border-2 border-amber-500 overflow-hidden bg-white shadow-xs">
                    <img src={certificateData.customFrameUrl} alt="Custom Frame" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-amber-50/50 border border-dashed border-amber-300 flex items-center justify-center text-amber-700 text-[9px] font-bold text-center p-1">
                    لا يوجد إطار مرفوع
                  </div>
                )}

                <label className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer text-center flex items-center justify-center gap-2 shadow-xs transition">
                  <Upload className="w-4 h-4" />
                  رفع صورة إطار (PNG / SVG)
                  <input type="file" accept="image/*" onChange={handleCustomFrameUpload} className="hidden" />
                </label>
              </div>

              {certificateData.customFrameUrl && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">شفافية الإطار المخصص:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={certificateData.customFrameOpacity ?? 1}
                      onChange={(e) => updateField('customFrameOpacity', parseFloat(e.target.value))}
                      className="w-28 accent-amber-600 cursor-pointer"
                    />
                    <span className="font-mono text-[11px] font-bold text-slate-600 w-8 text-left">
                      {Math.round((certificateData.customFrameOpacity ?? 1) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Frame Styles & Border Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">مكتبة الإطارات المزخرفة (Border Presets)</label>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                    {frames.length} نمط متوفر
                  </span>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                  {['الكل', 'ملكي', 'إسلامي', 'كلاسيكي', 'حديث'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFrameCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedFrameCategory === cat
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Presets Grid with Mini Visual Frame Thumbnails */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                  {frames
                    .filter((fr) => selectedFrameCategory === 'الكل' || fr.category === selectedFrameCategory)
                    .map((fr) => {
                      const isSelected = certificateData.frameStyle === fr.id && !certificateData.customFrameUrl;
                      return (
                        <button
                          key={fr.id}
                          onClick={() => {
                            onChange({
                              ...certificateData,
                              frameStyle: fr.id,
                              customFrameUrl: undefined, // Switch back to preset frame
                              updatedAt: new Date().toISOString()
                            });
                          }}
                          className={`p-2 rounded-xl border text-right transition flex flex-col justify-between relative group cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-600">
                                {fr.category}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                              )}
                            </div>

                            {/* Mini Frame Preview Thumbnail */}
                            <FramePreviewThumbnail
                              frameStyle={fr.id}
                              primaryColor={certificateData.borderColor || certificateData.primaryColor || '#d97706'}
                              secondaryColor={certificateData.borderSecondaryColor || certificateData.secondaryColor || '#f59e0b'}
                            />

                            <div className="text-xs font-bold leading-tight mb-0.5">{fr.label}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{fr.description}</div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Independent Border Controls */}
              <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-600" />
                    التحكم المستقل بألوان وسمك الإطار
                  </span>
                  <button
                    onClick={() => onChange({
                      ...certificateData,
                      borderColor: undefined,
                      borderSecondaryColor: undefined,
                      borderWidth: 2,
                      borderPadding: 12,
                      updatedAt: new Date().toISOString()
                    })}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
                  >
                    إعادة ضبط الإطار
                  </button>
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      لون الإطار الأساسي
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={certificateData.borderColor || certificateData.primaryColor || '#d97706'}
                        onChange={(e) => updateField('borderColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={certificateData.borderColor || certificateData.primaryColor || '#d97706'}
                        onChange={(e) => updateField('borderColor', e.target.value)}
                        className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-700 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      لون الزخرفة الثانوية
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={certificateData.borderSecondaryColor || certificateData.secondaryColor || '#f59e0b'}
                        onChange={(e) => updateField('borderSecondaryColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={certificateData.borderSecondaryColor || certificateData.secondaryColor || '#f59e0b'}
                        onChange={(e) => updateField('borderSecondaryColor', e.target.value)}
                        className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-700 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Color Presets */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">نماذج ألوان جاهزة للإطار:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'ذهبي ملوكي', p: '#d97706', s: '#f59e0b' },
                      { name: 'كحلي فاخر', p: '#1e3a8a', s: '#3b82f6' },
                      { name: 'زمردي ملكي', p: '#047857', s: '#10b981' },
                      { name: 'عنابي أندلسي', p: '#831843', s: '#f43f5e' },
                      { name: 'أسود وفضي', p: '#18181b', s: '#9ca3af' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => onChange({
                          ...certificateData,
                          borderColor: preset.p,
                          borderSecondaryColor: preset.s,
                          updatedAt: new Date().toISOString()
                        })}
                        className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-amber-400 flex items-center gap-1 shadow-2xs"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.p }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Thickness & Inset */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-700">سمك الإطار</label>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {certificateData.borderWidth ?? 2}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={certificateData.borderWidth ?? 2}
                      onChange={(e) => updateField('borderWidth', parseInt(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-700">مسافة الإطار عن الحافة</label>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {certificateData.borderPadding ?? 12}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="28"
                      step="2"
                      value={certificateData.borderPadding ?? 12}
                      onChange={(e) => updateField('borderPadding', parseInt(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">أبعاد الشهادة (Aspect Ratio)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateField('aspectRatio', 'A4-landscape')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                    certificateData.aspectRatio === 'A4-landscape'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-slate-200'
                  }`}
                >
                  أفقي (Landscape)
                </button>
                <button
                  onClick={() => updateField('aspectRatio', 'A4-portrait')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                    certificateData.aspectRatio === 'A4-portrait'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-slate-200'
                  }`}
                >
                  عمودي (Portrait)
                </button>
                <button
                  onClick={() => updateField('aspectRatio', 'square')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                    certificateData.aspectRatio === 'square'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-slate-200'
                  }`}
                >
                  مربع (Square)
                </button>
              </div>
            </div>

            {/* Watermark Section */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  تخصيص العلامة المائية (Watermark)
                </label>
                <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-bold">
                  <button
                    onClick={() => updateField('watermarkType', 'text')}
                    className={`px-2 py-1 rounded-md transition ${
                      (certificateData.watermarkType || 'text') === 'text'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    نص
                  </button>
                  <button
                    onClick={() => updateField('watermarkType', 'image')}
                    className={`px-2 py-1 rounded-md transition ${
                      certificateData.watermarkType === 'image'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    صورة
                  </button>
                  <button
                    onClick={() => updateField('watermarkType', 'none')}
                    className={`px-2 py-1 rounded-md transition ${
                      certificateData.watermarkType === 'none'
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    إيقاف
                  </button>
                </div>
              </div>

              {certificateData.watermarkType !== 'none' && (
                <div className="space-y-3 pt-1 border-t border-slate-200/80">
                  
                  {/* Text Input */}
                  {(certificateData.watermarkType || 'text') === 'text' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">نص العلامة المائية:</label>
                      <input
                        type="text"
                        value={certificateData.watermarkText ?? ''}
                        onChange={(e) => updateField('watermarkText', e.target.value)}
                        placeholder="مثال: مدرسة التميز / وزارة التعليم"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  )}

                  {/* Image Input */}
                  {certificateData.watermarkType === 'image' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">صورة العلامة المائية الخفيفة:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={certificateData.watermarkImageUrl || ''}
                          onChange={(e) => updateField('watermarkImageUrl', e.target.value)}
                          placeholder="رابط الصورة (URL)..."
                          className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                        <label className="px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          رفع
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    updateField('watermarkImageUrl', event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Pattern / Wrap Layout */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">طريقة التوزيع / الالتفاف:</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
                      <button
                        onClick={() => updateField('watermarkPattern', 'center')}
                        className={`py-1.5 rounded-lg transition text-center ${
                          (certificateData.watermarkPattern || 'center') === 'center'
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        بالمنتصف
                      </button>
                      <button
                        onClick={() => updateField('watermarkPattern', 'repeat')}
                        className={`py-1.5 rounded-lg transition text-center ${
                          certificateData.watermarkPattern === 'repeat'
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        تكرار شبكي
                      </button>
                      <button
                        onClick={() => updateField('watermarkPattern', 'diagonal-strip')}
                        className={`py-1.5 rounded-lg transition text-center ${
                          certificateData.watermarkPattern === 'diagonal-strip'
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        أشرطة مائلة
                      </button>
                    </div>
                  </div>

                  {/* Rotation Angle Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 mb-1">
                      <span>زاوية الدوران:</span>
                      <span className="text-amber-700">{certificateData.watermarkRotation ?? -12}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="1"
                        value={certificateData.watermarkRotation ?? -12}
                        onChange={(e) => updateField('watermarkRotation', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex gap-1 shrink-0">
                        {[-45, -12, 0, 45].map((deg) => (
                          <button
                            key={deg}
                            onClick={() => updateField('watermarkRotation', deg)}
                            className="px-1.5 py-0.5 text-[9px] bg-slate-200 hover:bg-slate-300 rounded font-mono font-bold"
                          >
                            {deg}°
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Opacity & Size Sliders */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 mb-1">
                        <span>الشفافية:</span>
                        <span className="text-amber-700">{Math.round((certificateData.watermarkOpacity ?? 0.05) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.40"
                        step="0.01"
                        value={certificateData.watermarkOpacity ?? 0.05}
                        onChange={(e) => updateField('watermarkOpacity', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 mb-1">
                        <span>الحجم / النسبة:</span>
                        <span className="text-amber-700">{certificateData.watermarkSize ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="5"
                        value={certificateData.watermarkSize ?? 100}
                        onChange={(e) => updateField('watermarkSize', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 6: STAMPS, BADGES & CELEBRATORY EMOJIS */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            
            {/* Badge / Medal Settings */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">تخصيص الوسام / الشارة / الميدالية</span>
                <input
                  type="checkbox"
                  checked={certificateData.showBadge}
                  onChange={(e) => updateField('showBadge', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              {certificateData.showBadge && (
                <div className="space-y-3 pt-1">
                  {/* Badge Source Selector */}
                  <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold">
                    <button
                      onClick={() => updateField('badgeType', 'icon')}
                      className={`flex-1 py-1.5 text-center rounded-md transition ${
                        (certificateData.badgeType || 'icon') === 'icon'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏅 أيقونة ورمز
                    </button>
                    <button
                      onClick={() => updateField('badgeType', 'upload')}
                      className={`flex-1 py-1.5 text-center rounded-md transition ${
                        certificateData.badgeType === 'upload'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🖼️ رفع من الجهاز
                    </button>
                  </div>

                  {/* Device Upload for Badge */}
                  {certificateData.badgeType === 'upload' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {certificateData.badgeUrl ? (
                          <div className="relative">
                            <img
                              src={certificateData.badgeUrl}
                              alt="Badge"
                              className="w-12 h-12 object-contain bg-white rounded-lg p-1 border shadow-xs"
                            />
                            <button
                              onClick={() => onChange({ ...certificateData, badgeUrl: undefined, updatedAt: new Date().toISOString() })}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-dashed border-amber-300 flex items-center justify-center text-amber-700 text-[10px] font-bold text-center">
                            لا يوجد
                          </div>
                        )}

                        <label className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer text-center flex items-center justify-center gap-2 shadow-xs transition">
                          <Upload className="w-4 h-4" />
                          رفع صورة الوسام من الجهاز
                          <input type="file" accept="image/*" onChange={handleBadgeUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* Built-in Icons */
                    <div className="flex flex-wrap gap-1.5">
                      {badgeIcons.map((bi) => (
                        <button
                          key={bi.id}
                          onClick={() => updateField('badgeIcon', bi.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            certificateData.badgeIcon === bi.id && certificateData.badgeType !== 'upload'
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {bi.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Badge Title Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">عنوان الوسام:</label>
                    <input
                      type="text"
                      value={certificateData.badgeTitle}
                      onChange={(e) => updateField('badgeTitle', e.target.value)}
                      placeholder="عنوان الشارة (مثال: وسام التميز الأول)"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  {/* Badge Size */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-slate-700">حجم الوسام:</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'sm', label: 'صغير' },
                        { id: 'md', label: 'متوسط' },
                        { id: 'lg', label: 'كبير' }
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          onClick={() => updateField('badgeSize', sz.id as any)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            (certificateData.badgeSize || 'md') === sz.id
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stamp / Seal Settings */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">تخصيص الختم الرسمي / الشمعي</span>
                <input
                  type="checkbox"
                  checked={certificateData.stamp?.show ?? true}
                  onChange={(e) =>
                    updateField('stamp', { ...certificateData.stamp, show: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>

              {certificateData.stamp?.show && (
                <div className="space-y-3 pt-1">
                  {/* Stamp Source Selector */}
                  <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold">
                    <button
                      onClick={() =>
                        updateField('stamp', { ...certificateData.stamp, shape: 'wax' })
                      }
                      className={`flex-1 py-1.5 text-center rounded-md transition ${
                        certificateData.stamp.shape !== 'custom'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏵️ ختم مصمم
                    </button>
                    <button
                      onClick={() =>
                        updateField('stamp', { ...certificateData.stamp, shape: 'custom' })
                      }
                      className={`flex-1 py-1.5 text-center rounded-md transition ${
                        certificateData.stamp.shape === 'custom'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🖼️ رفع ختم من الجهاز
                    </button>
                  </div>

                  {/* Custom Stamp Upload */}
                  {certificateData.stamp.shape === 'custom' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {certificateData.stamp.imageUrl ? (
                          <div className="relative">
                            <img
                              src={certificateData.stamp.imageUrl}
                              alt="Stamp"
                              className="w-12 h-12 object-contain bg-white rounded-lg p-1 border shadow-xs"
                            />
                            <button
                              onClick={() =>
                                updateField('stamp', { ...certificateData.stamp, imageUrl: undefined })
                              }
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-dashed border-amber-300 flex items-center justify-center text-amber-700 text-[10px] font-bold text-center">
                            لا يوجد
                          </div>
                        )}

                        <label className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer text-center flex items-center justify-center gap-2 shadow-xs transition">
                          <Upload className="w-4 h-4" />
                          رفع صورة الختم الرسمي من الجهاز
                          <input type="file" accept="image/*" onChange={handleStampUpload} className="hidden" />
                        </label>
                      </div>

                      <input
                        type="text"
                        value={certificateData.stamp.title}
                        onChange={(e) =>
                          updateField('stamp', { ...certificateData.stamp, title: e.target.value })
                        }
                        placeholder="اسم الختم (اختياري أسفل الصورة)"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  ) : (
                    /* Designed Stamp Shapes & Text */
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                        {[
                          { id: 'circle', label: 'دائري' },
                          { id: 'square', label: 'مربع دائري' },
                          { id: 'rectangle', label: 'مستطيل' },
                          { id: 'wax', label: 'شمعي' },
                          { id: 'ribbon', label: 'ملكي' }
                        ].map((sh) => (
                          <button
                            key={sh.id}
                            onClick={() =>
                              updateField('stamp', { ...certificateData.stamp, shape: sh.id as any })
                            }
                            className={`py-1.5 px-1 text-[11px] font-bold rounded-lg border transition-all text-center ${
                              certificateData.stamp.shape === sh.id
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {sh.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={certificateData.stamp.title}
                          onChange={(e) =>
                            updateField('stamp', { ...certificateData.stamp, title: e.target.value })
                          }
                          placeholder="نص الختم الرئيسية"
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                        <input
                          type="text"
                          value={certificateData.stamp.subtext}
                          onChange={(e) =>
                            updateField('stamp', { ...certificateData.stamp, subtext: e.target.value })
                          }
                          placeholder="النص الفرعي"
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>

                      {/* Color Picker for Stamp */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-slate-700">لون الختم:</span>
                        <div className="flex gap-1.5">
                          {['#b45309', '#1e3a8a', '#15803d', '#b91c1c', '#431407', '#000000'].map((c) => (
                            <button
                              key={c}
                              onClick={() =>
                                updateField('stamp', { ...certificateData.stamp, color: c })
                              }
                              className={`w-5 h-5 rounded-full border border-slate-300 ${
                                certificateData.stamp.color === c ? 'ring-2 ring-amber-500 ring-offset-1' : ''
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stamp Size */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700">حجم الختم:</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'sm', label: 'صغير' },
                        { id: 'md', label: 'متوسط' },
                        { id: 'lg', label: 'كبير' }
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          onClick={() =>
                            updateField('stamp', {
                              ...certificateData.stamp,
                              size: sz.id as any
                            })
                          }
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            (certificateData.stamp.size || 'md') === sz.id
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stamp Opacity Slider */}
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">درجة الشفافية (Opacity):</span>
                      <span className="text-[11px] font-bold text-amber-700">
                        {Math.round((certificateData.stamp.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={certificateData.stamp.opacity ?? 1}
                      onChange={(e) =>
                        updateField('stamp', {
                          ...certificateData.stamp,
                          opacity: parseFloat(e.target.value)
                        })
                      }
                      className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800">إظهار كود التوثيق (QR Code)</span>
              <input
                type="checkbox"
                checked={certificateData.showQrCode}
                onChange={(e) => updateField('showQrCode', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>

            {/* Celebratory Emojis */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">إضافة رموز الاحتفال (Celebratory Emojis)</span>
              <div className="flex flex-wrap gap-2">
                {['⭐', '🏆', '🎉', '🥇', '📚', '🚀', '🎨', '💡', '🎓', '❤️', '🌟', '📜', '🎖️', '👑', '✨'].map((em) => (
                  <button
                    key={em}
                    onClick={() => addEmoji(em)}
                    className="p-2 text-lg bg-white border border-slate-200 rounded-lg hover:bg-amber-100 hover:scale-110 transition"
                  >
                    {em}
                  </button>
                ))}
              </div>
              {certificateData.emojis && certificateData.emojis.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500">الرموز المضافة حالياً:</span>
                  {certificateData.emojis.map((e) => (
                    <span
                      key={e.id}
                      onClick={() => removeEmoji(e.id)}
                      className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded cursor-pointer hover:bg-red-100 hover:text-red-800 transition"
                      title="انقر للحذف"
                    >
                      {e.emoji} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 7: EXPORT & SHARE */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                خيارات التصدير والطباعة فائقة الدقة
              </h4>
              <p className="text-[11px] text-emerald-800 mt-1">
                احصل على النسخة جاهزة للطباعة الفورية أو المشاركة المباشرة عبر البريد والواتساب.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificateData.isSavedCloud && onUpdateCloudCertificate ? (
                <>
                  <button
                    onClick={onUpdateCloudCertificate}
                    className="flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md transition sm:col-span-2 cursor-pointer"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>حفظ التعديلات الحالية على الشهادة بالسحابة ☁️✅</span>
                  </button>

                  {onSaveToCloud && (
                    <button
                      onClick={onSaveToCloud}
                      className="flex items-center justify-center gap-2 p-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-2xs transition sm:col-span-2 cursor-pointer"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>حفظ كنسخة جديدة في المكتبة السحابية ➕</span>
                    </button>
                  )}
                </>
              ) : onSaveToCloud ? (
                <button
                  onClick={onSaveToCloud}
                  className="flex items-center justify-center gap-2 p-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-xs shadow-md transition sm:col-span-2 cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>حفظ الشهادة في المكتبة السحابية ☁️</span>
                </button>
              ) : null}

              {onOpenGoogleDriveModal && (
                <button
                  onClick={onOpenGoogleDriveModal}
                  className="flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs shadow-md transition sm:col-span-2 cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>حفظ الشهادة وتفعيل التوثيق على Google Drive ☁️</span>
                </button>
              )}

              {onPrint && (
                <button
                  onClick={onPrint}
                  className="flex items-center justify-center gap-2 p-3 bg-amber-100 hover:bg-amber-200 text-slate-900 rounded-xl font-extrabold text-xs shadow-2xs transition sm:col-span-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-700" />
                  معاينة للطباعة المباشرة (نافذة المتصفح)
                </button>
              )}

              <button
                onClick={onExportPDF}
                className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-2xs transition"
              >
                <Download className="w-4 h-4" />
                تصدير بصيغة PDF عالية الدقة
              </button>

              <button
                onClick={onExportImage}
                className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-2xs transition"
              >
                <ImageIcon className="w-4 h-4" />
                حفظ كصورة PNG فائقة الجودة
              </button>

              <button
                onClick={onShareEmail}
                className="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-2xs transition"
              >
                <Mail className="w-4 h-4" />
                إرسال بالبريد الإلكتروني مباشر
              </button>

              <button
                onClick={onShareWhatsApp || onShareEmail}
                className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                مشاركة عبر WhatsApp
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
        existingSignature={editingSignature}
      />

      {/* Template Gallery Grid Modal */}
      <TemplateGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSelectTemplate={(template) => applyPresetTemplate(template.id)}
        currentTemplateId={certificateData.templateId}
      />

    </div>
  );
};
