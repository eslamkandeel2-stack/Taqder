export type FontOption = 
  | 'Cairo' 
  | 'Amiri' 
  | 'Tajawal' 
  | 'Almarai' 
  | 'Aref Ruqaa' 
  | 'Reem Kufi' 
  | 'Changa'
  | 'El Messiri'
  | 'Lalezar'
  | 'Kufam'
  | 'Scheherazade New'
  | 'Vazirmatn'
  | 'Harmattan'
  | 'Marhey';

export type AspectRatioOption = 'A4-landscape' | 'A4-portrait' | 'square';

export type BadgeIconType = 'award' | 'star' | 'trophy' | 'crown' | 'shield' | 'heart' | 'sparkles' | 'book' | 'target' | 'medal';

export type FrameStyle = 
  | 'double-gold' 
  | 'classic-ornate' 
  | 'modern-geometric' 
  | 'emerald-border' 
  | 'royal-ribbon' 
  | 'clean-minimal' 
  | 'playful-dots' 
  | 'islamic-arch'
  | 'baroque-gold'
  | 'vintage-certificate'
  | 'oriental-islamic'
  | 'luxurious-gradient-border'
  | 'wavy-artistic'
  | 'geometric-cyber'
  | 'guilloche-royal'
  | 'golden-vines'
  | 'andalusian-star'
  | 'floral-corners'
  | 'greek-key-meander'
  | 'moroccan-mosaic'
  | 'victorian-crest'
  | 'double-dotted-luxury';

export type GradientType = 
  | 'none' 
  | 'linear-to-bottom' 
  | 'linear-to-right' 
  | 'radial-center' 
  | 'diagonal-gold' 
  | 'royal-mesh' 
  | 'luxury-sunset' 
  | 'emerald-glow' 
  | 'sapphire-glow'
  | 'custom';

export interface GradientConfig {
  enabled: boolean;
  type: GradientType;
  color1: string;
  color2: string;
  color3?: string;
  angle?: number; // 0 to 360 degrees
}

export interface SignatureItem {
  id: string;
  name: string;
  title: string;
  type: 'draw' | 'type' | 'upload';
  signatureText?: string;
  signatureUrl?: string;
  fontFamily?: string; // Signature font choice e.g. 'Aref Ruqaa', 'Great Vibes', etc.
  color?: string;      // Ink color e.g. '#0f172a', '#1e3a8a', '#b45309'
  show: boolean;
}

export interface StampItem {
  id: string;
  title: string;
  subtext: string;
  color: string;
  shape: 'circle' | 'square' | 'rectangle' | 'wax' | 'ribbon' | 'custom';
  imageUrl?: string; // Custom uploaded stamp image from device
  size?: 'sm' | 'md' | 'lg';
  opacity?: number; // Stamp opacity from 0.1 to 1.0
  show: boolean;
}

export interface EmojiItem {
  id: string;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  size: number;
}

export interface TextElementStyle {
  fontSize?: number; // scale percentage e.g. 100 = 100%
  align?: 'right' | 'center' | 'left' | 'justify';
  fontFamily?: FontOption;
  fontWeight?: 'light' | 'normal' | 'bold' | 'extrabold';
  color?: string;
  marginTop?: number; // px
  marginBottom?: number; // px
  letterSpacing?: number;
}

export interface ElementStyles {
  title?: TextElementStyle;
  subtitle?: TextElementStyle;
  recipientIntro?: TextElementStyle;
  studentName?: TextElementStyle;
  grade?: TextElementStyle;
  schoolName?: TextElementStyle;
  schoolHeader?: TextElementStyle;
  subject?: TextElementStyle;
  appreciationText?: TextElementStyle;
  poemOrQuote?: TextElementStyle;
  dateLocation?: TextElementStyle;
  watermarkText?: TextElementStyle;
  badgeTitle?: TextElementStyle;
}

export interface ElementPosition {
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
}

export interface ElementPositions {
  logo?: ElementPosition;
  schoolHeader?: ElementPosition;
  dateLocation?: ElementPosition;
  titleBlock?: ElementPosition;
  recipientBlock?: ElementPosition;
  appreciationBlock?: ElementPosition;
  poemBlock?: ElementPosition;
  badge?: ElementPosition;
  stamp?: ElementPosition;
  qrCode?: ElementPosition;
  signaturesBlock?: ElementPosition;
}

export interface CertificateData {
  id: string;
  recipientGender?: 'male' | 'female'; // 'male' (طالب) | 'female' (طالبة)
  verificationCode?: string; // Unique Serial Barcode Code (e.g. TAQDEER-2026-X89F2A)
  title: string;
  subtitle: string;
  recipientIntro: string;
  studentName: string;
  grade: string;
  schoolName: string;
  headerLine1?: string;             // Top header Line 1 (e.g. "المملكة العربية السعودية")
  showHeaderLine1?: boolean;        // Default: true
  headerLine2?: string;             // Top header Line 2 (e.g. "وزارة التعليم / الجهة المعتمدة")
  showHeaderLine2?: boolean;        // Default: true
  headerLine3?: string;             // Top header Line 3 (e.g. "إدارة التعليم / الفرع الرئيسي")
  showHeaderLine3?: boolean;        // Default: false
  headerRightExtra?: string;        // Extra right line 4 (e.g. "مكتب التعليم الأهلية")
  showHeaderRightExtra?: boolean;   // Default: false
  showHeaderSchoolName?: boolean;   // Default: true
  headerVisionText?: string;        // Optional slogan / extra header phrase (e.g. "رؤية 2030")
  showHeaderVisionText?: boolean;   // Default: false
  showHeaderDate?: boolean;         // Default: true
  showHeaderPlace?: boolean;        // Default: true
  dateLabel?: string;               // Custom label for date (default: "التاريخ")
  placeLabel?: string;              // Custom label for place (default: "المكان")
  certNumber?: string;              // Certificate Reference / Serial Number
  certNumberLabel?: string;         // Custom label for serial number (default: "الرقم")
  showHeaderCertNumber?: boolean;   // Default: false
  headerLeftExtra1?: string;        // Extra Left Header Line 1
  showHeaderLeftExtra1?: boolean;   // Default: false
  headerLeftExtra2?: string;        // Extra Left Header Line 2
  showHeaderLeftExtra2?: boolean;   // Default: false
  showVerificationBadge?: boolean;  // Toggle for "شهادة موثقة رقمياً" phrase (default: true)
  verificationBadgeText?: string;   // Custom text for verification phrase (default: "شهادة موثقة رقمياً")
  subject: string;
  appreciationText: string;
  poemOrQuote: string;
  showPoemOrQuote?: boolean;        // Default: true - Toggle for poetic verse or quote
  issueDate: string;
  issuePlace: string;
  badgeTitle: string;
  badgeIcon: BadgeIconType;
  badgeUrl?: string; // Custom uploaded badge/medal image from device
  badgeType?: 'icon' | 'upload';
  badgeSize?: 'sm' | 'md' | 'lg';
  showBadge: boolean;
  signatures: SignatureItem[];
  stamp: StampItem;
  emojis: EmojiItem[];
  frameStyle: FrameStyle;
  customFrameUrl?: string;          // Custom uploaded image frame URL
  customFrameOpacity?: number;      // Custom frame opacity (0.1 to 1.0)
  borderColor?: string;          // Independent border primary color
  borderSecondaryColor?: string;  // Independent border secondary accent color
  borderWidth?: number;           // Border stroke width/thickness (1 to 10 scale, default 2)
  borderPadding?: number;         // Border inset distance from container edge (4 to 32px, default 12)
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: FontOption;
  fontSizeScale: number;
  aspectRatio: AspectRatioOption;
  qrCodeData: string;
  showQrCode: boolean;
  showRecipientBox?: boolean;
  watermarkType?: 'text' | 'image' | 'none';
  watermarkText: string;
  watermarkImageUrl?: string;
  watermarkRotation?: number; // degrees e.g. -12, 0, -45, 90
  watermarkOpacity?: number;  // 0.01 to 0.50 (default 0.05)
  watermarkPattern?: 'center' | 'repeat' | 'diagonal-strip'; // wrap/layout mode
  watermarkSize?: number;     // scale percentage e.g. 50 - 200 (default 100)
  logoUrl?: string;
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
  logoShape?: 'circle' | 'square' | 'none';
  dateFormatMode?: 'hijri' | 'gregorian' | 'both'; // Default: 'both'
  issueDateHijri?: string;                          // e.g. "1447/02/25 هـ"
  issueDateGregorian?: string;                      // e.g. "2026/08/08 م"
  dateDisplayLayout?: 'single-line' | 'stacked';    // Layout for date when mode is 'both'
  bgImageUrl?: string;                              // Uploaded or selected custom background image URL
  bgOpacity?: number;                               // Background image opacity (0.05 to 1.0, default 1.0)
  bgBlur?: number;                                  // Background image blur in px (0 to 20)
  bgOverlayColor?: string;                          // Color tint overlay over background image
  bgOverlayOpacity?: number;                        // Color tint opacity (0.0 to 0.8)
  bgCardBacking?: boolean;                          // Semi-transparent card container behind text for legibility over busy backgrounds
  bgCardOpacity?: number;                           // Card container opacity (0.1 to 0.95)
  bgTextureUrl?: string;
  bgGradient?: GradientConfig;
  isSavedCloud: boolean;
  driveFileId?: string;
  driveFileUrl?: string;
  driveFileWebViewLink?: string;
  driveUploadedAt?: string;
  createdAt: string;
  updatedAt: string;
  positions?: ElementPositions;
  elementStyles?: ElementStyles;
  isDragModeEnabled?: boolean;
}

export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnailGradient: string;
  defaultData: Partial<CertificateData>;
}

export interface StudentRecognitionRecord {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  awardTitle: string;
  date: string;
  status: 'تمت الطباعة' | 'معلق' | 'تمت المشاركة';
}

export interface ReminderTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'عالية' | 'متوسطة' | 'عادية';
  completed: boolean;
  category: 'تسليم شهادات' | 'مراجعة درجات' | 'حفل تكريم' | 'إعداد قوالب';
}

export interface AnalyticsStats {
  totalCertificates: number;
  totalStudentsHonored: number;
  activeTemplates: number;
  topSubject: string;
}
