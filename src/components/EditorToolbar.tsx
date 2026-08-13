import React, { useState } from 'react';
import { CertificateData, FontOption, AspectRatioOption, FrameStyle, BadgeIconType, SignatureItem, GradientConfig, GradientType, ElementStyles, TextElementStyle } from '../types';
import { TEMPLATE_PRESETS } from '../data/templates';
import { BACKGROUND_TEXTURES } from '../data/backgrounds';
import { getFormattedTodayDate, getTodayHijriDate, getTodayGregorianDate, normalizeDateDigits, getSavedDefaultSettings } from '../utils/defaultSettings';
import { GRADIENT_PRESETS, GRADIENT_COLOR_SWATCHES } from '../utils/gradientUtils';
import { generateVerificationCode, sanitizeVerificationCode } from '../utils/qrUtils';
import { adaptCertificateGender, RecipientGender } from '../utils/genderConverter';
import {
  calculateSafeMargins,
  optimizeMarginsWithAi,
  saveDefaultMargins,
  getSavedDefaultMargins,
  hasCustomSavedMargins,
  SYSTEM_DEFAULT_MARGINS
} from '../utils/marginUtils';
import { SignaturePadModal } from './SignaturePadModal';
import { TemplateGalleryModal } from './TemplateGalleryModal';
import { LogoCropModal } from './LogoCropModal';
import { removeWhiteBackgroundCanvas, removeBackgroundAi } from '../utils/imageUtils';
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  Move,
  Crop,
  X,
  ShieldAlert,
  BookmarkCheck,
  Save,
  Info,
  CheckCircle2,
  QrCode,
  ScanLine,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
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

const OffsetPad: React.FC<{
  title: string;
  subtitle?: string;
  offsetX: number;
  offsetY: number;
  onChangeX: (val: number) => void;
  onChangeY: (val: number) => void;
  onReset: () => void;
  min?: number;
  max?: number;
}> = ({
  title,
  subtitle,
  offsetX,
  offsetY,
  onChangeX,
  onChangeY,
  onReset,
  min = -100,
  max = 100
}) => {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-800 block">{title}</span>
            {subtitle && <span className="text-[10px] text-slate-500 block">{subtitle}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
          title="إعادة ضبط الموقع للوضع الافتراضي (0, 0)"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
            <span>أفقي (يمين/يسار):</span>
            <span className="font-mono text-amber-700 dir-ltr">{offsetX > 0 ? `+${offsetX}` : offsetX}px</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={offsetX}
            onChange={(e) => onChangeX(parseInt(e.target.value) || 0)}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
            <span>رأسي (أعلى/أسفل):</span>
            <span className="font-mono text-amber-700 dir-ltr">{offsetY > 0 ? `+${offsetY}` : offsetY}px</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={offsetY}
            onChange={(e) => onChangeY(parseInt(e.target.value) || 0)}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
        <span className="text-[10px] font-bold text-slate-600">تحريك دقيق بالأسهم:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeY(Math.max(min, offsetY - 2))}
            className="p-1 bg-slate-50 hover:bg-amber-100 border border-slate-200 rounded text-slate-800 transition cursor-pointer"
            title="تحريك للأعلى"
          >
            <ArrowUp className="w-3 h-3 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => onChangeY(Math.min(max, offsetY + 2))}
            className="p-1 bg-slate-50 hover:bg-amber-100 border border-slate-200 rounded text-slate-800 transition cursor-pointer"
            title="تحريك للأسفل"
          >
            <ArrowDown className="w-3 h-3 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => onChangeX(Math.max(min, offsetX - 2))}
            className="p-1 bg-slate-50 hover:bg-amber-100 border border-slate-200 rounded text-slate-800 transition cursor-pointer"
            title="تحريك لليسار"
          >
            <ArrowLeft className="w-3 h-3 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => onChangeX(Math.min(max, offsetX + 2))}
            className="p-1 bg-slate-50 hover:bg-amber-100 border border-slate-200 rounded text-slate-800 transition cursor-pointer"
            title="تحريك لليمين"
          >
            <ArrowRight className="w-3 h-3 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState<'content' | 'formatting' | 'templates' | 'style' | 'frame' | 'signatures' | 'elements' | 'verification' | 'export'>('content');
  const [selectedElementKey, setSelectedElementKey] = useState<keyof ElementStyles>('studentName');
  const [selectedFrameCategory, setSelectedFrameCategory] = useState<string>('الكل');
  const [selectedBgCategory, setSelectedBgCategory] = useState<string>('الكل');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<SignatureItem | null>(null);
  const [isAiTuningBg, setIsAiTuningBg] = useState(false);
  const [aiTuneStatus, setAiTuneStatus] = useState<string | null>(null);
  const [isAdaptingGenderAi, setIsAdaptingGenderAi] = useState(false);
  const [selectedEmojiId, setSelectedEmojiId] = useState<string | null>(null);
  const [isAiOptimizingMargins, setIsAiOptimizingMargins] = useState(false);
  const [marginNotice, setMarginNotice] = useState<string | null>(null);
  const [isLogoCropModalOpen, setIsLogoCropModalOpen] = useState(false);
  const [isAiRemovingLogoBg, setIsAiRemovingLogoBg] = useState(false);
  const [logoActionNotice, setLogoActionNotice] = useState<string | null>(null);

  const handleMakeLogoBgTransparent = async () => {
    if (!certificateData.logoUrl) return;
    try {
      setLogoActionNotice('جاري تحويل خلفية الشعار إلى شفافة...');
      const transparentUrl = await removeWhiteBackgroundCanvas(certificateData.logoUrl, 215);
      onChange({
        ...certificateData,
        logoUrl: transparentUrl,
        logoBgMode: 'transparent',
        logoShape: certificateData.logoShape === 'none' ? 'none' : (certificateData.logoShape || 'rounded'),
        updatedAt: new Date().toISOString()
      });
      setLogoActionNotice('تم تفريغ خلفية الشعار وجعلها شفافة بنجاح ✨');
      setTimeout(() => setLogoActionNotice(null), 4000);
    } catch (err) {
      setLogoActionNotice('تعذر معالجة الخلفية تلقائياً.');
      setTimeout(() => setLogoActionNotice(null), 3000);
    }
  };

  const handleRemoveLogoBgAi = async () => {
    if (!certificateData.logoUrl) return;
    setIsAiRemovingLogoBg(true);
    setLogoActionNotice('جاري تحليل الشعار وتفريغ الخلفية بالذكاء الاصطناعي...');
    try {
      const result = await removeBackgroundAi(certificateData.logoUrl);
      if (result.success && result.transparentDataUrl) {
        onChange({
          ...certificateData,
          logoUrl: result.transparentDataUrl,
          logoBgMode: 'transparent',
          updatedAt: new Date().toISOString()
        });
        setLogoActionNotice(result.explanation || 'تم حذف خلفية الشعار بالذكاء الاصطناعي بنجاح!');
      } else {
        setLogoActionNotice('تعذر إزالة الخلفية بالذكاء الاصطناعي.');
      }
    } catch (e) {
      setLogoActionNotice('حدث خطأ أثناء معالجة الشعار بالذكاء الاصطناعي.');
    } finally {
      setIsAiRemovingLogoBg(false);
      setTimeout(() => setLogoActionNotice(null), 5000);
    }
  };

  const handleAutoSafeMargins = () => {
    const { margins, explanation } = calculateSafeMargins(certificateData);
    onChange({
      ...certificateData,
      ...margins,
      updatedAt: new Date().toISOString()
    });
    setMarginNotice(explanation);
    setTimeout(() => setMarginNotice(null), 5000);
  };

  const handleAiOptimizeMargins = async () => {
    setIsAiOptimizingMargins(true);
    setMarginNotice('جاري تحليل توازن الشهادة بالذكاء الاصطناعي لحساب أفضل هوامش آمنة...');
    try {
      const { margins, explanation } = await optimizeMarginsWithAi(certificateData);
      onChange({
        ...certificateData,
        ...margins,
        updatedAt: new Date().toISOString()
      });
      setMarginNotice(explanation);
    } catch {
      setMarginNotice('تعذر الاتصال بخدمة الذكاء الاصطناعي، تم تطبيق الهوامش الآمنة الموصى بها.');
    } finally {
      setIsAiOptimizingMargins(false);
      setTimeout(() => setMarginNotice(null), 6000);
    }
  };

  const handleSaveDefaultMargins = () => {
    const currentMargins = {
      canvasMarginTop: certificateData.canvasMarginTop ?? 24,
      canvasMarginBottom: certificateData.canvasMarginBottom ?? 24,
      canvasMarginLeft: certificateData.canvasMarginLeft ?? 32,
      canvasMarginRight: certificateData.canvasMarginRight ?? 32,
    };
    saveDefaultMargins(currentMargins);
    setMarginNotice('تم حفظ الهوامش الحالية كافتراضي بنجاح! ستطبق هذه الهوامش تلقائياً عند إنشاء أو إعادة ضبط الشهادات القادمة.');
    setTimeout(() => setMarginNotice(null), 5000);
  };

  const handleRestoreDefaultMargins = () => {
    const saved = getSavedDefaultMargins();
    onChange({
      ...certificateData,
      ...saved,
      updatedAt: new Date().toISOString()
    });
    setMarginNotice('تم تطبيق الهوامش الافتراضية المحفوظة بنجاح.');
    setTimeout(() => setMarginNotice(null), 4000);
  };

  // Tab navigation ref and drag-to-scroll handlers
  const navTabsRef = React.useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleMouseDownTabs = (e: React.MouseEvent) => {
    if (!navTabsRef.current) return;
    setIsMouseDown(true);
    setDragStartX(e.pageX - navTabsRef.current.offsetLeft);
    setDragScrollLeft(navTabsRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUpTabs = () => {
    setIsMouseDown(false);
  };

  const handleMouseMoveTabs = (e: React.MouseEvent) => {
    if (!isMouseDown || !navTabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - navTabsRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    navTabsRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const scrollNavTabs = (direction: 'left' | 'right') => {
    if (navTabsRef.current) {
      navTabsRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth'
      });
    }
  };

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

  const handleGenderChange = async (gender: RecipientGender) => {
    // 1. Instant local rule-based conversion so UI updates immediately
    const updated = adaptCertificateGender(certificateData, gender, { preserveCustomStudentName: true });
    onChange(updated);

    // 2. Call AI API in background for ultra-refined AI Arabic phrasing adaptation
    try {
      setIsAdaptingGenderAi(true);
      const response = await fetch('/api/adapt-gender-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateData: updated,
          targetGender: gender,
        }),
      });

      const json = await response.json();
      if (json.success && json.result) {
        onChange({
          ...updated,
          ...json.result,
          recipientGender: gender,
        });
      }
    } catch (err) {
      console.warn('AI background gender adaptation failed, using local conversion:', err);
    } finally {
      setIsAdaptingGenderAi(false);
    }
  };

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
      watermarkText,
      recipientGender
    } = certificateData;

    const currentGender: RecipientGender = recipientGender || 'male';

    const newCertId = `cert-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newVCode = generateVerificationCode();

    let mergedData: CertificateData = {
      ...certificateData,
      ...preset.defaultData,
      // Retain user's actual values for personal identity & customized fields
      studentName: studentName || preset.defaultData.studentName || '',
      grade: grade || preset.defaultData.grade || '',
      schoolName: schoolName || preset.defaultData.schoolName || '',
      subject: subject || preset.defaultData.subject || '',
      logoUrl: logoUrl !== undefined ? logoUrl : preset.defaultData.logoUrl,
      signatures: (signatures && signatures.length > 0) ? signatures : preset.defaultData.signatures,
      emojis: emojis ?? certificateData.emojis,
      positions: positions ?? certificateData.positions,
      issueDate: issueDate || preset.defaultData.issueDate,
      issuePlace: issuePlace || preset.defaultData.issuePlace,
      verificationCode: newVCode,
      qrCodeData: `${window.location.origin}/verify?code=${newVCode}`,
      watermarkText: watermarkText || preset.defaultData.watermarkText,
      id: newCertId,
      isSavedCloud: false,
      driveFileId: undefined,
      driveFileWebViewLink: undefined,
      driveFileUrl: undefined,
      driveUploadedAt: undefined,
      updatedAt: new Date().toISOString()
    };

    // Adapt preset phrasing automatically to user's selected gender (male or female)
    mergedData = adaptCertificateGender(mergedData, currentGender, { preserveCustomStudentName: true });

    onChange(mergedData);
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
      id: `emoji-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'emoji' as const,
      emoji,
      x: 15 + (currentEmojis.length * 12) % 65,
      y: 15 + (currentEmojis.length * 10) % 60,
      size: 44,
      opacity: 1,
      rotation: 0,
      layer: 'above-text' as const,
      blendMode: 'normal' as const
    };
    updateField('emojis', [...currentEmojis, newEmoji]);
    setSelectedEmojiId(newEmoji.id);
  };

  const handleCustomEmojiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const currentEmojis = certificateData.emojis || [];
        const newEmoji = {
          id: `emoji-img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: 'image' as const,
          emoji: file.name.split('.')[0] || 'صورة مخصصة',
          imageUrl,
          x: 25 + (currentEmojis.length * 10) % 50,
          y: 25 + (currentEmojis.length * 8) % 45,
          size: 90,
          opacity: 1,
          rotation: 0,
          layer: 'above-text' as const,
          blendMode: 'normal' as const
        };
        updateField('emojis', [...currentEmojis, newEmoji]);
        setSelectedEmojiId(newEmoji.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateEmojiItem = (id: string, updates: Partial<any>) => {
    const currentEmojis = certificateData.emojis || [];
    const updated = currentEmojis.map(item => item.id === id ? { ...item, ...updates } : item);
    updateField('emojis', updated);
  };

  const duplicateEmojiItem = (id: string) => {
    const currentEmojis = certificateData.emojis || [];
    const target = currentEmojis.find(item => item.id === id);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `emoji-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: Math.min(90, target.x + 4),
      y: Math.min(90, target.y + 4)
    };
    updateField('emojis', [...currentEmojis, duplicated]);
    setSelectedEmojiId(duplicated.id);
  };

  const removeEmoji = (id: string) => {
    const currentEmojis = certificateData.emojis || [];
    const updated = currentEmojis.filter(e => e.id !== id);
    updateField('emojis', updated);
    if (selectedEmojiId === id) {
      setSelectedEmojiId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
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
      
      {/* Category Navigation Tabs Header - Desktop Responsive 2-Row Grid & Mobile Scroll Bar */}
      {/* 1. Desktop & Tablet View (sm and up): Clean 4-Column Grid, No Scrolling Required! */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-1.5 p-2 bg-slate-100/90 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'content'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">1. البيانات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('formatting')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'formatting'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">2. تنسيق النصوص</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'templates'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <Award className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">3. القوالب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'style'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">4. الألوان والخطوط</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('signatures')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'signatures'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <PenTool className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">5. التوقيعات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('frame')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'frame'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <Maximize2 className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">6. الإطار والشعار</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'elements'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <Stamp className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">7. الأختام والرموز</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none ${
            activeTab === 'export'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
              : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border-slate-200/80'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">8. التصدير والطباعة</span>
        </button>
      </div>

      {/* 2. Mobile View (<sm): Interactive Horizontal Drag & Navigation Arrows */}
      <div className="relative sm:hidden flex items-center bg-slate-50 border-b border-slate-200 py-1">
        <button
          type="button"
          onClick={() => scrollNavTabs('right')}
          className="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-slate-200 via-slate-100 to-transparent text-slate-700 hover:text-amber-700 flex items-center justify-center cursor-pointer shadow-2xs"
          title="تمرير الأزرار لليمين"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={navTabsRef}
          onMouseDown={handleMouseDownTabs}
          onMouseLeave={handleMouseLeaveOrUpTabs}
          onMouseUp={handleMouseLeaveOrUpTabs}
          onMouseMove={handleMouseMoveTabs}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth w-full px-7 py-0.5 select-none cursor-grab active:cursor-grabbing"
        >
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>البيانات</span>
          </button>

          <button
            onClick={() => setActiveTab('formatting')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'formatting'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>تنسيق النصوص</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>القوالب</span>
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'style'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span>الألوان والخطوط</span>
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'signatures'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 shrink-0" />
            <span>التوقيعات</span>
          </button>

          <button
            onClick={() => setActiveTab('frame')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'frame'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            <span>الإطار والشعار</span>
          </button>

          <button
            onClick={() => setActiveTab('elements')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'elements'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stamp className="w-3.5 h-3.5 shrink-0" />
            <span>الأختام والرموز</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'verification'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>مربع التوثيق</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-amber-500 text-amber-600 bg-white rounded-t-lg shadow-2xs font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>التصدير</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => scrollNavTabs('left')}
          className="absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-slate-200 via-slate-100 to-transparent text-slate-700 hover:text-amber-700 flex items-center justify-center cursor-pointer shadow-2xs"
          title="تمرير الأزرار لليصار"
        >
          <ChevronLeft className="w-4 h-4" />
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
                      <span className="block text-[10px] font-bold text-slate-700 mb-0.5">نوع خط الترويسة العلوية (مستقل):</span>
                      <select
                        value={certificateData.headerFontFamily || 'Cairo'}
                        onChange={(e) => updateField('headerFontFamily', e.target.value as FontOption)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                      >
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
                    {/* Size scale preset for Header */}
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="block text-[10px] font-bold text-slate-700">مقياس حجم الترويسة:</span>
                        <span className="text-[10px] font-mono text-amber-800 font-bold">{Math.round((certificateData.headerFontSizeScale ?? 1.0) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.5"
                        step="0.05"
                        value={certificateData.headerFontSizeScale ?? 1.0}
                        onChange={(e) => updateField('headerFontSizeScale', parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5"
                      />
                    </div>

                    {/* School Name Custom Font override */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-700 mb-0.5">خط مخصص لاسم المدرسة (اختياري):</span>
                      <select
                        value={certificateData.elementStyles?.schoolName?.fontFamily || ''}
                        onChange={(e) => updateElementStyle('schoolName', { fontFamily: (e.target.value || undefined) as FontOption })}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">(تلقائي: مطابق لخط الترويسة العلوية)</option>
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

                  {/* Header Offset Controls */}
                  <OffsetPad
                    title="تحريك الكتابة داخل الترويسة"
                    subtitle="تحريك سطور الترويسة أفقياً ورأسياً"
                    offsetX={certificateData.headerTextOffsetX || 0}
                    offsetY={certificateData.headerTextOffsetY || 0}
                    onChangeX={(val) => updateField('headerTextOffsetX', val)}
                    onChangeY={(val) => updateField('headerTextOffsetY', val)}
                    onReset={() => onChange({ ...certificateData, headerTextOffsetX: 0, headerTextOffsetY: 0, updatedAt: new Date().toISOString() })}
                  />
                </div>
              </div>
            </div>

            {/* Recipient Gender Selector */}
            <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border border-amber-200/90 rounded-xl p-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="text-base">🎓</span>
                      <span>نوع الشهادة والمكرّم (طالب أم طالبة):</span>
                    </span>
                    {isAdaptingGenderAi && (
                      <span className="text-[11px] text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold animate-pulse border border-amber-300/80 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        جاري ضبط الصيغ بالذكاء الاصطناعي...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تعديل كافة عبارات ونصوص الشهادة تلقائياً بين المذكر والمؤنث بدقة لغوية مدعومة بالذكاء الاصطناعي
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      (certificateData.recipientGender || 'male') === 'male'
                        ? 'bg-amber-600 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>👨‍🎓</span>
                    <span>طالب (مذكر)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      certificateData.recipientGender === 'female'
                        ? 'bg-pink-600 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>👩‍🎓</span>
                    <span>طالبة (مؤنث)</span>
                  </button>
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                />
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

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">المادة / المجال المكرم فيه</label>
                <input
                  type="text"
                  value={certificateData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  placeholder="مثال: التفوق العلمي والابتكار"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Golden Box & Recipient Spacing Customization Control Panel */}
              <div className="col-span-1 md:col-span-2 p-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-xl border border-amber-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>تنسيق المربع الذهبي وإطار الاسم والصف</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-bold text-slate-800 bg-white hover:bg-amber-100/60 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs transition">
                    <input
                      type="checkbox"
                      checked={certificateData.showRecipientBox !== false}
                      onChange={(e) => updateField('showRecipientBox', e.target.checked)}
                      className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4 accent-amber-600 cursor-pointer"
                    />
                    <span>إظهار المربع الذهبي</span>
                  </label>
                </div>

                {(certificateData.showRecipientBox !== false) && (
                  <div className="space-y-3 pt-1 border-t border-amber-200/60">
                    {/* Box Color & Quick Color Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700">لون خلفية المربع الذهبي:</label>
                        <span className="text-[11px] font-mono font-bold text-amber-800 dir-ltr">{certificateData.recipientBoxColor || '#f59e0b'}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="color"
                          value={certificateData.recipientBoxColor || '#f59e0b'}
                          onChange={(e) => updateField('recipientBoxColor', e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                        />
                        {[
                          { color: '#f59e0b', label: 'ذهبي أصفر' },
                          { color: '#d97706', label: 'ذهبي ملكي' },
                          { color: '#854d0e', label: 'برونزي كلاسيك' },
                          { color: '#9f1239', label: 'عنابي راقٍ' },
                          { color: '#1d4ed8', label: 'أزرق كحلي' },
                          { color: '#15803d', label: 'أخضر زمردي' },
                          { color: '#475569', label: 'فضي معدني' },
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => updateField('recipientBoxColor', preset.color)}
                            title={preset.label}
                            className={`w-6 h-6 rounded-full border border-black/20 shadow-2xs transition hover:scale-110 cursor-pointer ${
                              (certificateData.recipientBoxColor || '#f59e0b').toLowerCase() === preset.color.toLowerCase() ? 'ring-2 ring-amber-600 scale-110' : ''
                            }`}
                            style={{ backgroundColor: preset.color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Opacity Control Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">درجة الشفافية (Opacity):</label>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          {Math.round((certificateData.recipientBoxOpacity ?? 0.12) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="1.0"
                        step="0.02"
                        value={certificateData.recipientBoxOpacity ?? 0.12}
                        onChange={(e) => updateField('recipientBoxOpacity', parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-amber-200/80 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Spacing Between Student Name and Grade Slider */}
                <div className="pt-2 border-t border-amber-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">المسافة بين اسم الطالب والصف:</label>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                      {certificateData.recipientSpacing ?? 4}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="1"
                    value={certificateData.recipientSpacing ?? 4}
                    onChange={(e) => updateField('recipientSpacing', parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600 h-1.5 bg-amber-200/80 rounded-lg cursor-pointer"
                  />
                </div>
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

            {/* Recipient Intro (عبارة مقدمة التكريم) Directly Above Appreciation Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span>🎗️ عبارة مقدمة التكريم (التمهيدية)</span>
              </label>
              <input
                type="text"
                value={certificateData.recipientIntro || ''}
                onChange={(e) => updateField('recipientIntro', e.target.value)}
                placeholder="مثال: يسر إدارة المدرسة أن تمنح هذه الشهادة إلى الطالب المبدع:"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
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
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            const verifiedCode = certificateData.verificationCode || certificateData.certificateId || (certificateData.certNumber && certificateData.certNumber !== 'REF-1447/0892' ? certificateData.certNumber : '');
                            const autoNum = verifiedCode || `REF-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
                            onChange({
                              ...certificateData,
                              showHeaderCertNumber: true,
                              certNumber: autoNum,
                              updatedAt: new Date().toISOString()
                            });
                          } else {
                            updateField('showHeaderCertNumber', false);
                          }
                        }}
                        className="accent-amber-500 rounded w-3.5 h-3.5 cursor-pointer"
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
                        className="w-24 px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                      />
                      <input
                        type="text"
                        value={certificateData.certNumber || certificateData.verificationCode || certificateData.certificateId || ''}
                        onChange={(e) => updateField('certNumber', e.target.value)}
                        placeholder="مثال: REF-1447/0892"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono font-medium text-amber-900"
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

                  {/* Specific options for Student Name & Grade / Recipient Block */}
                  {(selectedElementKey === 'studentName' || selectedElementKey === 'grade') && (
                    <div className="p-3 bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-xl border border-amber-200/90 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>تنسيق المربع الذهبي والمسافات</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={certificateData.showRecipientBox !== false}
                          onChange={(e) => updateField('showRecipientBox', e.target.checked)}
                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4 accent-amber-600 cursor-pointer"
                        />
                      </div>

                      {(certificateData.showRecipientBox !== false) && (
                        <div className="space-y-2.5 pt-1 border-t border-amber-200/60">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-700">لون خلفية المربع الذهبي:</label>
                              <span className="text-[11px] font-mono font-bold text-amber-800 dir-ltr">{certificateData.recipientBoxColor || '#f59e0b'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <input
                                type="color"
                                value={certificateData.recipientBoxColor || '#f59e0b'}
                                onChange={(e) => updateField('recipientBoxColor', e.target.value)}
                                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                              />
                              {['#f59e0b', '#d97706', '#854d0e', '#9f1239', '#1d4ed8', '#15803d', '#475569'].map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => updateField('recipientBoxColor', col)}
                                  className={`w-5 h-5 rounded-full border border-black/20 transition hover:scale-110 cursor-pointer ${
                                    (certificateData.recipientBoxColor || '#f59e0b').toLowerCase() === col.toLowerCase() ? 'ring-2 ring-amber-600 scale-110' : ''
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-700">درجة الشفافية (Opacity):</label>
                              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                                {Math.round((certificateData.recipientBoxOpacity ?? 0.12) * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.02"
                              max="1.0"
                              step="0.02"
                              value={certificateData.recipientBoxOpacity ?? 0.12}
                              onChange={(e) => updateField('recipientBoxOpacity', parseFloat(e.target.value))}
                              className="w-full accent-amber-600 h-1.5 bg-amber-200/80 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-1.5 border-t border-amber-200/60">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">المسافة بين الاسم والصف:</label>
                          <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                            {certificateData.recipientSpacing ?? 4}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          step="1"
                          value={certificateData.recipientSpacing ?? 4}
                          onChange={(e) => updateField('recipientSpacing', parseInt(e.target.value, 10))}
                          className="w-full accent-amber-600 h-1.5 bg-amber-200/80 rounded-lg cursor-pointer"
                        />
                      </div>
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
                <div className="flex flex-wrap items-center gap-1.5 py-1 text-xs">
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

            {/* 1. Main Certificate Typography & Font Size */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📜</span>
                    <span>خط وحجم عبارات الشهادة الرئيسية</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    يتحكم بنص الشكر والتقدير، اسم الطالب/المكرم، والعناوين دون المساس بالترويسة.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  🔒 الترويسة محمية
                </span>
              </div>

              {/* Font Family Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">نوع الخط العربي للشهادة</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateField('fontFamily', f.id)}
                      className={`p-2.5 rounded-xl border text-right transition flex flex-col justify-between cursor-pointer ${
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

              {/* Main Font Size Scale */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">مقياس حجم خط عبارات الشهادة</label>
                  <span className="text-xs font-mono font-bold text-amber-700">{Math.round(certificateData.fontSizeScale * 100)}%</span>
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

            {/* 2. Top Header Typography & Font Size (Independent) */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>خط وحجم الترويسة العلوية (منفصل تماماً)</span>
                  </h4>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    يتحكم بخط وحجم ترويسة الوزارة، الإدارة، وتفاصيل المدرسة والشهادة بشكل مستقل.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✨ مستقل
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Header Font Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">نوع خط الترويسة العلوية</label>
                  <select
                    value={certificateData.headerFontFamily || 'Cairo'}
                    onChange={(e) => updateField('headerFontFamily', e.target.value as FontOption)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Cairo">خط القاهرة المعاصر (Cairo)</option>
                    <option value="Amiri">الخط الأميري الأصيل (Amiri)</option>
                    <option value="Tajawal">خط تجول الحديث (Tajawal)</option>
                    <option value="Almarai">خط المراعي (Almarai)</option>
                    <option value="Aref Ruqaa">خط الرقعة العربي (Aref Ruqaa)</option>
                    <option value="Reem Kufi">الخط الكوفي الحديث (Reem Kufi)</option>
                    <option value="El Messiri">خط الخاطر والجمال (El Messiri)</option>
                    <option value="Changa">خط الشانغا (Changa)</option>
                    <option value="Scheherazade New">خط شهرزاد النسخي (Scheherazade)</option>
                    <option value="Vazirmatn">خط وزير (Vazirmatn)</option>
                  </select>
                </div>

                {/* Header Size Scale */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-800">مقياس حجم خط الترويسة</label>
                    <span className="text-xs font-mono font-bold text-amber-800">{Math.round((certificateData.headerFontSizeScale ?? 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.05"
                    value={certificateData.headerFontSizeScale ?? 1.0}
                    onChange={(e) => updateField('headerFontSizeScale', parseFloat(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between gap-1 mt-1.5">
                    {[
                      { label: '80%', val: 0.8 },
                      { label: '100%', val: 1.0 },
                      { label: '120%', val: 1.2 },
                      { label: '140%', val: 1.4 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => updateField('headerFontSizeScale', preset.val)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                          Math.abs((certificateData.headerFontSizeScale ?? 1.0) - preset.val) < 0.02
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
            
            {/* Custom Logo Upload & Comprehensive Customization */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  شعار المؤسسة / المدرسة (Logo)
                </span>
                {certificateData.logoUrl && (
                  <button
                    onClick={() => updateField('logoUrl', undefined)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف الشعار
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {certificateData.logoUrl ? (
                  <div className="relative group">
                    <img
                      src={certificateData.logoUrl}
                      alt="Logo"
                      className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-slate-300 shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-amber-50/80 border border-dashed border-amber-300 flex items-center justify-center text-amber-800 text-[10px] font-bold text-center p-1">
                    لا يوجد شعار
                  </div>
                )}

                <label className="flex-1 px-3 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer text-center flex items-center justify-center gap-2 shadow-xs transition">
                  <Upload className="w-4 h-4" />
                  رفع الشعار من الجهاز
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>

              {/* Status / Notice Alert for Logo Actions */}
              {logoActionNotice && (
                <div className="p-2 bg-amber-50 text-amber-900 text-xs font-medium rounded-lg border border-amber-200 flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{logoActionNotice}</span>
                </div>
              )}

              {/* Advanced Logo Customization Toolbar */}
              {certificateData.logoUrl && (
                <div className="space-y-3 pt-3 border-t border-slate-200">

                  {/* 1. Quick Image Action Buttons: Crop & Remove Background */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">أدوات تعديل واستخلاص الصورة:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsLogoCropModalOpen(true)}
                        className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold border border-slate-300 flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                        title="اقتطاع واقتصاص الجزء المطلوب من الشعار"
                      >
                        <Crop className="w-3.5 h-3.5 text-amber-600" />
                        <span>اقتصاص</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleMakeLogoBgTransparent}
                        className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold border border-slate-300 flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                        title="تحويل الألوان البيضاء في خلفية الشعار لشفافة"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>خلفية شفافة</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveLogoBgAi}
                        disabled={isAiRemovingLogoBg}
                        className="px-2 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-[11px] font-bold border border-amber-600 flex items-center justify-center gap-1 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                        title="حذف خلفية الشعار بالذكاء الاصطناعي"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${isAiRemovingLogoBg ? 'animate-spin' : ''}`} />
                        <span>حذف ذكي</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Logo Size (Presets + Custom Pixel Slider) */}
                  <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">حجم الشعار:</span>
                      <div className="flex gap-1">
                        {[
                          { id: 'sm', label: 'صغير', px: 36 },
                          { id: 'md', label: 'متوسط', px: 48 },
                          { id: 'lg', label: 'كبير', px: 64 },
                          { id: 'xl', label: 'ضخم', px: 80 }
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => onChange({
                              ...certificateData,
                              logoSize: sz.id as any,
                              logoSizePx: sz.px,
                              updatedAt: new Date().toISOString()
                            })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              (certificateData.logoSize || 'md') === sz.id && (!certificateData.logoSizePx || certificateData.logoSizePx === sz.px)
                                ? 'bg-amber-500 text-slate-950 border-amber-600'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>تحكم دقيق بالحجم بالبكسل:</span>
                        <span className="font-mono text-amber-800">{certificateData.logoSizePx || 48}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={certificateData.logoSizePx || 48}
                        onChange={(e) => updateField('logoSizePx', parseInt(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 3. Logo Position & Offset Movement */}
                  <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Move className="w-3.5 h-3.5 text-amber-600" />
                        تحريك موقع الشعار:
                      </span>
                      <button
                        type="button"
                        onClick={() => onChange({
                          ...certificateData,
                          logoOffsetX: 0,
                          logoOffsetY: 0,
                          updatedAt: new Date().toISOString()
                        })}
                        className="text-[10px] text-amber-700 font-bold hover:underline"
                      >
                        إعادة ضبط الموقع
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>إزاحة أفقية:</span>
                          <span className="font-mono">{certificateData.logoOffsetX || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          value={certificateData.logoOffsetX || 0}
                          onChange={(e) => updateField('logoOffsetX', parseInt(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>إزاحة رأسية:</span>
                          <span className="font-mono">{certificateData.logoOffsetY || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={certificateData.logoOffsetY || 0}
                          onChange={(e) => updateField('logoOffsetY', parseInt(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Shape, Background Mode & Rotation */}
                  <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">شكل الإطار:</span>
                      <div className="flex gap-1">
                        {[
                          { id: 'circle', label: 'دائري' },
                          { id: 'rounded', label: 'منحني' },
                          { id: 'square', label: 'مربع' },
                          { id: 'none', label: 'شفاف' }
                        ].map((sh) => (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => updateField('logoShape', sh.id as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              (certificateData.logoShape || 'circle') === sh.id
                                ? 'bg-amber-500 text-slate-950 border-amber-600'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {sh.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700">تعبئة الخلفية:</span>
                      <div className="flex gap-1">
                        {[
                          { id: 'white', label: 'أبيض' },
                          { id: 'transparent', label: 'شفاف' },
                          { id: 'dark', label: 'داكن' }
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => updateField('logoBgMode', bg.id as any)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              (certificateData.logoBgMode || 'white') === bg.id
                                ? 'bg-amber-500 text-slate-950 border-amber-600'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>تدوير الشعار:</span>
                          <span className="font-mono">{certificateData.logoRotation || 0}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={certificateData.logoRotation || 0}
                          onChange={(e) => updateField('logoRotation', parseInt(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>الشفافية:</span>
                          <span className="font-mono">{Math.round((certificateData.logoOpacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={certificateData.logoOpacity ?? 1}
                          onChange={(e) => updateField('logoOpacity', parseFloat(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Logo Text Offset Controls */}
                    <OffsetPad
                      title="تحريك الكتابة داخل الشعار"
                      subtitle="تحريك حرف/نص الشعار أفقياً ورأسياً"
                      offsetX={certificateData.logoTextOffsetX || 0}
                      offsetY={certificateData.logoTextOffsetY || 0}
                      onChangeX={(val) => updateField('logoTextOffsetX', val)}
                      onChangeY={(val) => updateField('logoTextOffsetY', val)}
                      onReset={() => onChange({ ...certificateData, logoTextOffsetX: 0, logoTextOffsetY: 0, updatedAt: new Date().toISOString() })}
                    />
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
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
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

            {/* Page & Content Margins (التحكم بهوامش الورقة والمحتوى) */}
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-amber-600" />
                  التحكم بهوامش الصفحة ومحتوى الشهادة
                </label>
                <div className="flex items-center gap-2">
                  {hasCustomSavedMargins() && (
                    <button
                      type="button"
                      onClick={handleRestoreDefaultMargins}
                      title="استعادة الهوامش الافتراضية المحفوظة"
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition"
                    >
                      تطبيق الافتراضي
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange({
                      ...certificateData,
                      canvasMarginTop: SYSTEM_DEFAULT_MARGINS.canvasMarginTop,
                      canvasMarginBottom: SYSTEM_DEFAULT_MARGINS.canvasMarginBottom,
                      canvasMarginLeft: SYSTEM_DEFAULT_MARGINS.canvasMarginLeft,
                      canvasMarginRight: SYSTEM_DEFAULT_MARGINS.canvasMarginRight,
                      updatedAt: new Date().toISOString()
                    })}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                  >
                    إعادة ضبط
                  </button>
                </div>
              </div>

              {/* Notice Banner */}
              {marginNotice && (
                <div className="p-2.5 rounded-lg text-[11px] font-medium bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2 animate-fadeIn">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed flex-1">{marginNotice}</span>
                </div>
              )}

              {/* AI & Smart Auto-Adjust Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAutoSafeMargins}
                  className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>ضبط تلقائي للإطار</span>
                </button>

                <button
                  type="button"
                  disabled={isAiOptimizingMargins}
                  onClick={handleAiOptimizeMargins}
                  className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-70"
                >
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isAiOptimizingMargins ? 'animate-spin' : ''}`} />
                  <span>{isAiOptimizingMargins ? 'جاري الضبط...' : 'ضبط بالذكاء الاصطناعي'}</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[
                  { label: 'قياسي', top: 24, bottom: 24, left: 32, right: 32 },
                  { label: 'ضيّق', top: 12, bottom: 12, left: 16, right: 16 },
                  { label: 'واسع', top: 40, bottom: 40, left: 48, right: 48 },
                  { label: 'معدوم', top: 0, bottom: 0, left: 0, right: 0 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({
                      ...certificateData,
                      canvasMarginTop: preset.top,
                      canvasMarginBottom: preset.bottom,
                      canvasMarginLeft: preset.left,
                      canvasMarginRight: preset.right,
                      updatedAt: new Date().toISOString()
                    })}
                    className="py-1 px-2 rounded-lg text-[10px] font-bold bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Sliders for Top, Bottom, Right, Left */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-700">الهامش العلوي</label>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {certificateData.canvasMarginTop ?? 24}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="2"
                    value={certificateData.canvasMarginTop ?? 24}
                    onChange={(e) => updateField('canvasMarginTop', parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-700">الهامش السفلي</label>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {certificateData.canvasMarginBottom ?? 24}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="2"
                    value={certificateData.canvasMarginBottom ?? 24}
                    onChange={(e) => updateField('canvasMarginBottom', parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-700">الهامش الأيمن</label>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {certificateData.canvasMarginRight ?? 32}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="2"
                    value={certificateData.canvasMarginRight ?? 32}
                    onChange={(e) => updateField('canvasMarginRight', parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-700">الهامش الأيسر</label>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {certificateData.canvasMarginLeft ?? 32}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="2"
                    value={certificateData.canvasMarginLeft ?? 32}
                    onChange={(e) => updateField('canvasMarginLeft', parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Save Margins as Default Button */}
              <div className="pt-1 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={handleSaveDefaultMargins}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center justify-center gap-2 transition shadow-2xs active:scale-98"
                >
                  <Save className="w-3.5 h-3.5 text-amber-700" />
                  <span>حفظ هذه الهوامش كافتراضي للشهادات القادمة</span>
                </button>
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

                  {/* Badge Title Input & Show/Hide Toggle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">عنوان الوسام / الشارة:</label>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={certificateData.showBadgeTitle ?? true}
                          onChange={(e) => updateField('showBadgeTitle', e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                        />
                        <span>إظهار نص العنوان</span>
                      </label>
                    </div>
                    {(certificateData.showBadgeTitle ?? true) && (
                      <input
                        type="text"
                        value={certificateData.badgeTitle}
                        onChange={(e) => updateField('badgeTitle', e.target.value)}
                        placeholder="عنوان الشارة (مثال: وسام التميز الأول)"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    )}
                  </div>

                  {/* Badge Title Offset Controls */}
                  <OffsetPad
                    title="تحريك عبارة اسم الوسام"
                    subtitle="تحريك مربع عنوان الوسام أفقياً ورأسياً"
                    offsetX={certificateData.badgeTitleOffsetX || 0}
                    offsetY={certificateData.badgeTitleOffsetY || 0}
                    onChangeX={(val) => updateField('badgeTitleOffsetX', val)}
                    onChangeY={(val) => updateField('badgeTitleOffsetY', val)}
                    onReset={() => onChange({ ...certificateData, badgeTitleOffsetX: 0, badgeTitleOffsetY: 0, updatedAt: new Date().toISOString() })}
                  />

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

                  {/* Stamp Text Offset Controls */}
                  <OffsetPad
                    title="تحريك الكتابة داخل الختم"
                    subtitle="ضبط موقع نص الختم أفقياً ورأسياً"
                    offsetX={certificateData.stamp.textOffsetX || 0}
                    offsetY={certificateData.stamp.textOffsetY || 0}
                    onChangeX={(val) => updateField('stamp', { ...certificateData.stamp, textOffsetX: val })}
                    onChangeY={(val) => updateField('stamp', { ...certificateData.stamp, textOffsetY: val })}
                    onReset={() => updateField('stamp', { ...certificateData.stamp, textOffsetX: 0, textOffsetY: 0 })}
                  />
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

            {/* Rich Celebratory Emojis & Custom Image Decorator Section */}
            <div className="p-3.5 bg-gradient-to-br from-amber-50/50 via-white to-slate-50 rounded-2xl border border-amber-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-2xs">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">رموز الاحتفال والصور المخصصة</h4>
                    <p className="text-[10px] text-slate-500">حرّك، كبّر/صغّر، وعدّل الشفافية والطبقات بسهولة دون التعديل على باقي النص</p>
                  </div>
                </div>
              </div>

              {/* 1. Add Preset Emojis & Symbols */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">اختر رمزا احتفاليا لإضافته للشهادة:</span>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200 max-h-36 overflow-y-auto no-scrollbar">
                  {[
                    '🎉', '🎓', '🏆', '⭐', '🥇', '👑', '🎖️', '📜', '🌟', '🌿', '🌸', '🎈', '🏅', '🎨', '💫', '💎',
                    '⚜️', '🕌', '✨', '🔖', '💖', '🎗️', '🕯️', '💐', '🏵️', '🕊️', '🚀', '💡', '📚', '❤️', '🔥', '🛡️'
                  ].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => addEmoji(em)}
                      className="w-9 h-9 text-xl bg-slate-50 hover:bg-amber-100 border border-slate-200 hover:border-amber-400 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer"
                      title={`إضافة ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Upload Custom Image / Sticker From Device */}
              <div className="p-3 bg-amber-100/40 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-950 block">إرفاق صورة أو شعار خاص من جهازك 🖼️</span>
                  <span className="text-[10px] text-amber-800">رفع صور PNG أو SVG بدون خلفية والتحكم بها تماماً كالرموز</span>
                </div>
                <label className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomEmojiImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 3. Added Elements Selector & Customization Panel */}
              {certificateData.emojis && certificateData.emojis.length > 0 && (() => {
                const activeItem = certificateData.emojis.find(e => e.id === selectedEmojiId) || certificateData.emojis[certificateData.emojis.length - 1];

                return (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <span className="text-xs font-extrabold text-slate-900 block">العناصر المضافة حالياً (انقر للتحكم والتعديل):</span>
                    
                    {/* List of active elements as pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {certificateData.emojis.map((e) => {
                        const isCurrent = activeItem && activeItem.id === e.id;
                        return (
                          <div
                            key={e.id}
                            onClick={() => setSelectedEmojiId(e.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-extrabold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                            }`}
                          >
                            {e.type === 'image' && e.imageUrl ? (
                              <img src={e.imageUrl} alt="element" className="w-4 h-4 object-contain rounded" />
                            ) : (
                              <span>{e.emoji}</span>
                            )}
                            <span className="max-w-[80px] truncate text-[11px]">{e.emoji}</span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeEmoji(e.id);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-0.5 ml-0.5 transition"
                              title="حذف"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Controls Panel for Selected Active Element */}
                    {activeItem && (
                      <div className="p-3 bg-white rounded-xl border border-amber-300/80 shadow-xs space-y-3 mt-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-lg">
                              {activeItem.type === 'image' && activeItem.imageUrl ? (
                                <img src={activeItem.imageUrl} alt="preview" className="w-6 h-6 object-contain" />
                              ) : (
                                <span>{activeItem.emoji}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 block">{activeItem.emoji || 'العنصر المختار'}</span>
                              <span className="text-[10px] text-slate-500">
                                {activeItem.layer === 'below-text' ? 'طبقة أسفل النص (خلفية)' : 'طبقة أعلى النص'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateEmojiItem(activeItem.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title="تكرار العنصر"
                            >
                              <Copy className="w-3 h-3" />
                              <span>تكرار</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEmoji(activeItem.id)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title="حذف العنصر"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>

                        {/* Control 1: Layer Position (أسفل / أعلى عبارات الشهادة) */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-800 block">مستوى ظهور العنصر (الطبقات):</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { layer: 'above-text' })}
                              className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1 cursor-pointer ${
                                (activeItem.layer || 'above-text') === 'above-text'
                                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>✨ أعلى عبارات الشهادة</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { layer: 'below-text' })}
                              className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1 cursor-pointer ${
                                activeItem.layer === 'below-text'
                                  ? 'bg-indigo-600 text-white border-indigo-700 font-extrabold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>📜 أسفل عبارات الشهادة (خلفية)</span>
                            </button>
                          </div>
                        </div>

                        {/* Control 2: Opacity / Transparency (الشفافية وتدريج الظهور) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">درجة الشفافية (Opacity):</span>
                            <span className="font-mono text-amber-700 font-extrabold">{Math.round((activeItem.opacity ?? 1) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.05"
                            max="1"
                            step="0.05"
                            value={activeItem.opacity ?? 1}
                            onChange={(e) => updateEmojiItem(activeItem.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                          <div className="flex justify-between items-center gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { opacity: 0.15 })}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                            >
                              15% (شفاف جدا)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { opacity: 0.40 })}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                            >
                              40% (متوسط)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { opacity: 0.75 })}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                            >
                              75% (واضح)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { opacity: 1.0 })}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                            >
                              100% (كامل)
                            </button>
                          </div>
                        </div>

                        {/* Control 3: Scale / Size (تكبير وتصغير) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">حجم العنصر (التكبير والتصغير):</span>
                            <span className="font-mono text-amber-700 font-extrabold">{activeItem.size}px</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { size: Math.max(16, activeItem.size - 6) })}
                              className="w-7 h-7 bg-slate-100 hover:bg-amber-200 text-slate-800 font-bold rounded-lg flex items-center justify-center cursor-pointer shrink-0"
                              title="تصغير"
                            >
                              -
                            </button>
                            <input
                              type="range"
                              min="16"
                              max="240"
                              step="2"
                              value={activeItem.size}
                              onChange={(e) => updateEmojiItem(activeItem.id, { size: parseInt(e.target.value) })}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { size: Math.min(240, activeItem.size + 6) })}
                              className="w-7 h-7 bg-slate-100 hover:bg-amber-200 text-slate-800 font-bold rounded-lg flex items-center justify-center cursor-pointer shrink-0"
                              title="تكبير"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Control 4: Free Positioning X & Y sliders + Nudge Arrows */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-800 block">الموقع الدقيق (بدون التأثير على العناصر الأخرى):</span>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                                <span>أفقي (X):</span>
                                <span className="font-mono text-amber-700">{activeItem.x}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="95"
                                value={activeItem.x}
                                onChange={(e) => updateEmojiItem(activeItem.id, { x: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 cursor-pointer"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-0.5">
                                <span>رأسي (Y):</span>
                                <span className="font-mono text-amber-700">{activeItem.y}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="95"
                                value={activeItem.y}
                                onChange={(e) => updateEmojiItem(activeItem.id, { y: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Quick Arrow Nudge Pad */}
                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-700">تحريك دقيق بالأسهم:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateEmojiItem(activeItem.id, { y: Math.max(0, activeItem.y - 1) })}
                                className="p-1.5 bg-white hover:bg-amber-100 border border-slate-200 rounded-lg text-slate-800 transition cursor-pointer"
                                title="تحريك لأعلى"
                              >
                                ⬆️
                              </button>
                              <button
                                type="button"
                                onClick={() => updateEmojiItem(activeItem.id, { y: Math.min(95, activeItem.y + 1) })}
                                className="p-1.5 bg-white hover:bg-amber-100 border border-slate-200 rounded-lg text-slate-800 transition cursor-pointer"
                                title="تحريك لأسفل"
                              >
                                ⬇️
                              </button>
                              <button
                                type="button"
                                onClick={() => updateEmojiItem(activeItem.id, { x: Math.max(0, activeItem.x - 1) })}
                                className="p-1.5 bg-white hover:bg-amber-100 border border-slate-200 rounded-lg text-slate-800 transition cursor-pointer"
                                title="تحريك لليمين"
                              >
                                ➡️
                              </button>
                              <button
                                type="button"
                                onClick={() => updateEmojiItem(activeItem.id, { x: Math.min(95, activeItem.x + 1) })}
                                className="p-1.5 bg-white hover:bg-amber-100 border border-slate-200 rounded-lg text-slate-800 transition cursor-pointer"
                                title="تحريك لليسار"
                              >
                                ⬅️
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Control 5: Rotation Angle */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">زاوية الدوران (Rotation):</span>
                            <span className="font-mono text-amber-700 font-extrabold">{activeItem.rotation || 0}°</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={activeItem.rotation || 0}
                              onChange={(e) => updateEmojiItem(activeItem.id, { rotation: parseInt(e.target.value) })}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => updateEmojiItem(activeItem.id, { rotation: 0 })}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer shrink-0"
                            >
                              إعادة 0°
                            </button>
                          </div>
                        </div>

                        {/* Control 6: Blend Mode */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-800 block">تأثير الدمج البصري (Blend Mode):</label>
                          <select
                            value={activeItem.blendMode || 'normal'}
                            onChange={(e) => updateEmojiItem(activeItem.id, { blendMode: e.target.value as any })}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="normal">عادي (Normal)</option>
                            <option value="multiply">مضاعف (Multiply - مدمج مع الخلفية)</option>
                            <option value="screen">مضيء (Screen)</option>
                            <option value="overlay">منقوش (Overlay)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB: VERIFICATION BOX CUSTOMIZATION */}
        {activeTab === 'verification' && (
          <div className="space-y-5">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-300 font-['Cairo'] flex items-center gap-1.5">
                    تخصيص مربع التوثيق والرمز الرقمي
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    التحكم الكامل بأنماط وقوالب وألوان وإظهار/إخفاء أجزاء مربع التوثيق على الشهادة.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={(certificateData.showVerificationBox ?? certificateData.showQrCode ?? true)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange({
                      ...certificateData,
                      showVerificationBox: checked,
                      showQrCode: checked,
                      updatedAt: new Date().toISOString()
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {((certificateData.showVerificationBox ?? certificateData.showQrCode ?? true)) ? (
              <div className="space-y-5">
                {/* 1. Template Patterns Selection */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <LayoutGrid className="w-4 h-4 text-amber-500" />
                      اختر نمط وقالب مربع التوثيق (Template Patterns)
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                      7 قوالب معتمدة
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      {
                        id: 'classic',
                        title: 'البطاقة المعتمدة الكلاسيكية',
                        desc: 'النمط المعتمد الرسمي كارت أبيض مع QR وباركود معتمد',
                        badge: 'كلاسيكي'
                      },
                      {
                        id: 'modern-card',
                        title: 'كارت عصري برأسية حماية',
                        desc: 'شريط حماية ملون في الأعلى وترتيب أنيق ومقسم',
                        badge: 'عصري'
                      },
                      {
                        id: 'seal-stamp',
                        title: 'ختم التوثيق الذهبي المضلّع',
                        desc: 'إطار مضلع مميز يشبه أختام التوثيق والاعتماد الرسمية',
                        badge: 'رسمي'
                      },
                      {
                        id: 'barcode-focus',
                        title: 'تركيز الباركود الشريطي',
                        desc: 'عرض أفقي ممتد يُبرز الباركود الكودي برقم المرجع',
                        badge: 'تقني'
                      },
                      {
                        id: 'minimal-pill',
                        title: 'كبسولة مصغرة خفيفة',
                        desc: 'تصميم مدمج دائري الحواف بحجم أصغر ومظهر ناعم',
                        badge: 'مبسط'
                      },
                      {
                        id: 'glass-card',
                        title: 'بطاقة زجاجية شفافة (Glassmorphism)',
                        desc: 'تأثير زجاجي شفاف فاخر بأطراف مضيئة خفيفة',
                        badge: 'فاخر'
                      },
                      {
                        id: 'certificate-tag',
                        title: 'بطاقة تعريفية معلقة (Certificate Tag)',
                        desc: 'بطاقة معلقة مع فتحة تعليق علوية وشريط تثبيت',
                        badge: 'شارة'
                      }
                    ].map((pattern) => {
                      const isSelected = (certificateData.verificationBoxPattern || 'classic') === pattern.id;
                      return (
                        <button
                          key={pattern.id}
                          onClick={() => updateField('verificationBoxPattern', pattern.id as any)}
                          className={`p-3 rounded-xl border-2 text-right transition flex flex-col justify-between gap-2 relative ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                              {pattern.title}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold shrink-0 me-1 ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {pattern.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            {pattern.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Show/Hide Individual Components */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="border-b pb-2 border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                      إظهار أو إخفاء عناصر وأجزاء مربع التوثيق
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Toggle QR Code */}
                    <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-amber-50/40 transition">
                      <span className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-slate-600" />
                        رمز QR للتحقق الرقمي
                      </span>
                      <input
                        type="checkbox"
                        checked={certificateData.showVerificationQr ?? true}
                        onChange={(e) => updateField('showVerificationQr', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Toggle Barcode */}
                    <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-amber-50/40 transition">
                      <span className="flex items-center gap-2">
                        <ScanLine className="w-4 h-4 text-slate-600" />
                        الباركود الشريطي (Code 39)
                      </span>
                      <input
                        type="checkbox"
                        checked={certificateData.showVerificationBarcode ?? true}
                        onChange={(e) => updateField('showVerificationBarcode', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Toggle Serial Code */}
                    <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-amber-50/40 transition">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        الرقم التسلسلي / كود المرجع
                      </span>
                      <input
                        type="checkbox"
                        checked={certificateData.showVerificationSerialCode ?? true}
                        onChange={(e) => updateField('showVerificationSerialCode', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Toggle Status Text */}
                    <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-amber-50/40 transition">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        عبارة حالة التوثيق
                      </span>
                      <input
                        type="checkbox"
                        checked={certificateData.showVerificationStatusText ?? true}
                        onChange={(e) => updateField('showVerificationStatusText', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Toggle Icon */}
                    <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer hover:bg-amber-50/40 transition">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        أيقونة الحماية / الدرع
                      </span>
                      <input
                        type="checkbox"
                        checked={certificateData.showVerificationIcon ?? true}
                        onChange={(e) => updateField('showVerificationIcon', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Text & Content Control */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="border-b pb-2 border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ScanLine className="w-4 h-4 text-amber-500" />
                      تخصيص نظام وبادئة كود التوثيق
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      A-Z & 0-9 فقط
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Prefix Input & Quick Presets */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        بادئة الكود الافتراضية (Code Prefix):
                      </label>
                      <input
                        type="text"
                        value={certificateData.verificationPrefix ?? 'TAQDEER'}
                        onChange={(e) => {
                          const cleanPrefix = sanitizeVerificationCode(e.target.value).replace(/[^A-Z0-9]/g, '');
                          updateField('verificationPrefix', cleanPrefix);
                        }}
                        placeholder="مثال: TAQDEER أو CERT أو ACAD"
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white uppercase tracking-wider"
                      />
                      {/* Quick Presets Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 my-auto me-1">نماذج جاهزة:</span>
                        {['TAQDEER', 'CERT', 'ACAD', 'SCHOOL', 'TQ', 'VERIFY', 'REF'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              updateField('verificationPrefix', preset);
                              const newCode = generateVerificationCode(undefined, {
                                prefix: preset,
                                pattern: certificateData.verificationCodePattern,
                                forceNew: true
                              });
                              updateField('verificationCode', newCode);
                              updateField('certNumber', newCode);
                            }}
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border transition ${
                              (certificateData.verificationPrefix ?? 'TAQDEER') === preset
                                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pattern Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        طريقة ونظام توليد الكود (Generation Pattern):
                      </label>
                      <select
                        value={certificateData.verificationCodePattern ?? 'prefix-year-random'}
                        onChange={(e) => {
                          const pat = e.target.value as any;
                          updateField('verificationCodePattern', pat);
                          const newCode = generateVerificationCode(undefined, {
                            prefix: certificateData.verificationPrefix,
                            pattern: pat,
                            forceNew: true
                          });
                          updateField('verificationCode', newCode);
                          updateField('certNumber', newCode);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="prefix-year-random">بادئة + السنة + 6 حروف عشوائية (مثال: TAQDEER-2026-X89F2A)</option>
                        <option value="prefix-random">بادئة + 8 حروف وعشرات عشوائية (مثال: TAQDEER-8X92M14P)</option>
                        <option value="prefix-date-serial">بادئة + التاريخ كامل + 4 أرقام (مثال: TAQDEER-20260812-7821)</option>
                        <option value="numbers-only">أرقام إنجليزية فقط (مثال: 2026-8920-1492)</option>
                        <option value="prefix-seq">بادئة + 6 أرقام تسلسلية (مثال: TAQDEER-004829)</option>
                      </select>
                    </div>

                    {/* Regenerate Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = generateVerificationCode(undefined, {
                          prefix: certificateData.verificationPrefix,
                          pattern: certificateData.verificationCodePattern,
                          forceNew: true
                        });
                        updateField('verificationCode', newCode);
                        updateField('certNumber', newCode);
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      توليد كود توثيق جديد الآن (Generate New Code)
                    </button>

                    {/* Active Verification Code Input */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        كود التوثيق الحالي بالشهادة (إنجليزي وأرقام فقط):
                      </label>
                      <input
                        type="text"
                        value={certificateData.verificationCode || certificateData.certNumber || ''}
                        onChange={(e) => {
                          const sanitized = sanitizeVerificationCode(e.target.value);
                          updateField('verificationCode', sanitized);
                          updateField('certNumber', sanitized);
                        }}
                        placeholder="الكود التسلسلي (مثال: TAQDEER-2026-X89F2A)"
                        className="w-full px-3 py-1.5 text-xs font-mono font-black border border-amber-300 rounded-lg bg-amber-50/30 text-amber-950 focus:bg-white transition"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        يتم تحويل الأرقام العربية تلقائياً إلى أرقام إنجليزية (0-9) والحروف إلى (A-Z) لمنع الخطأ في أجهزة الباركود.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        نص عبارة التوثيق (Verification Phrase):
                      </label>
                      <input
                        type="text"
                        value={certificateData.verificationBadgeText ?? 'شهادة موثقة رقمياً'}
                        onChange={(e) => updateField('verificationBadgeText', e.target.value)}
                        placeholder="عبارة التوثيق (مثال: شهادة موثقة رقمياً)"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Colors, Opacity & Size Customization */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="border-b pb-2 border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-500" />
                      تنسيق الألوان والشفافية والحجم
                    </span>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {/* Size Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        حجم مربع التوثيق:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sm', label: 'صغير (Compact)' },
                          { id: 'md', label: 'متوسط (Default)' },
                          { id: 'lg', label: 'كبير (Expanded)' }
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            onClick={() => updateField('verificationBoxSize', sz.id as any)}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                              (certificateData.verificationBoxSize || 'md') === sz.id
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          لون الخلفية:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={certificateData.verificationBoxBgColor || '#ffffff'}
                            onChange={(e) => updateField('verificationBoxBgColor', e.target.value)}
                            className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                          />
                          <button
                            onClick={() => updateField('verificationBoxBgColor', undefined)}
                            className="text-[10px] text-slate-500 underline hover:text-slate-800"
                          >
                            تلقائي
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          لون الإطار:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={certificateData.verificationBoxBorderColor || '#cbd5e1'}
                            onChange={(e) => updateField('verificationBoxBorderColor', e.target.value)}
                            className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                          />
                          <button
                            onClick={() => updateField('verificationBoxBorderColor', undefined)}
                            className="text-[10px] text-slate-500 underline hover:text-slate-800"
                          >
                            تلقائي
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          لون النصوص:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={certificateData.verificationBoxTextColor || '#0f172a'}
                            onChange={(e) => updateField('verificationBoxTextColor', e.target.value)}
                            className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                          />
                          <button
                            onClick={() => updateField('verificationBoxTextColor', undefined)}
                            className="text-[10px] text-slate-500 underline hover:text-slate-800"
                          >
                            تلقائي
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>شفافية المربع:</span>
                        <span>{Math.round((certificateData.verificationBoxBgOpacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={certificateData.verificationBoxBgOpacity ?? 1}
                        onChange={(e) => updateField('verificationBoxBgOpacity', parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Verification Box Elements Offset Pad */}
                    <OffsetPad
                      title="تحريك العناصر داخل مربع التوثيق"
                      subtitle="إمكانية تحريك الكلام والعناصر لليمين واليسار ولأعلى وأسفل"
                      offsetX={certificateData.verificationTextOffsetX || 0}
                      offsetY={certificateData.verificationTextOffsetY || 0}
                      onChangeX={(val) => updateField('verificationTextOffsetX', val)}
                      onChangeY={(val) => updateField('verificationTextOffsetY', val)}
                      onReset={() => onChange({ ...certificateData, verificationTextOffsetX: 0, verificationTextOffsetY: 0, updatedAt: new Date().toISOString() })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">مربع التوثيق مخفي حالياً</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  قم بتفعيل المفتاح العلوي لإظهار وتخصيص مربع التوثيق والباركود على الشهادة.
                </p>
              </div>
            )}
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
                  <span>حفظ كشهادة جديدة في المكتبة السحابية ☁️✨</span>
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

      {/* Logo Crop & Editing Modal */}
      {certificateData.logoUrl && (
        <LogoCropModal
          isOpen={isLogoCropModalOpen}
          imageUrl={certificateData.logoUrl}
          onClose={() => setIsLogoCropModalOpen(false)}
          onSave={(croppedUrl) => {
            onChange({
              ...certificateData,
              logoUrl: croppedUrl,
              updatedAt: new Date().toISOString()
            });
            setIsLogoCropModalOpen(false);
            setLogoActionNotice('تم اقتصاص وتحديث الشعار بنجاح ✨');
            setTimeout(() => setLogoActionNotice(null), 4000);
          }}
        />
      )}

    </div>
  );
};
