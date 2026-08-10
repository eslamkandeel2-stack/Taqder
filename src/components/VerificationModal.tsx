import React, { useState, useEffect } from 'react';
import { CertificateData } from '../types';
import { generateQRCodeDataUrl, generateVerificationCode } from '../utils/qrUtils';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Printer,
  Download,
  Share2,
  Award,
  Calendar,
  Building2,
  User,
  BookOpen,
  QrCode,
  Copy,
  Check,
  Cloud,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCertificate: CertificateData;
  onOpenGoogleDriveModal?: () => void;
}

export const VerificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentCertificate,
  onOpenGoogleDriveModal
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchedCert, setSearchedCert] = useState<CertificateData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const verificationCode = currentCertificate.verificationCode || generateVerificationCode(currentCertificate.id);

  useEffect(() => {
    if (isOpen) {
      setSearchCode(verificationCode);
      setSearchedCert(currentCertificate);
      setNotFound(false);
      
      const targetUrl = currentCertificate.driveFileWebViewLink || currentCertificate.driveFileUrl || `${window.location.origin}/verify?code=${verificationCode}`;
      generateQRCodeDataUrl(targetUrl).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [isOpen, currentCertificate, verificationCode]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    setTimeout(() => {
      const query = searchCode.trim().toLowerCase();
      const certCode = verificationCode.toLowerCase();
      const certName = currentCertificate.studentName.toLowerCase();
      const certId = currentCertificate.id.toLowerCase();

      if (query === certCode || query === certId || certName.includes(query) || certCode.includes(query)) {
        setSearchedCert(currentCertificate);
        setNotFound(false);
      } else {
        // Search in saved certificates from localStorage if any
        try {
          const savedStr = localStorage.getItem('taqdeer_cloud_certs');
          if (savedStr) {
            const savedList: CertificateData[] = JSON.parse(savedStr);
            const found = savedList.find(
              c =>
                (c.verificationCode && c.verificationCode.toLowerCase().includes(query)) ||
                c.id.toLowerCase() === query ||
                c.studentName.toLowerCase().includes(query)
            );

            if (found) {
              setSearchedCert(found);
              setNotFound(false);
              const foundCode = found.verificationCode || generateVerificationCode(found.id);
              generateQRCodeDataUrl(`${window.location.origin}/verify?code=${foundCode}`).then(url => setQrDataUrl(url));
              setIsSearching(false);
              return;
            }
          }
        } catch (err) {
          console.error(err);
        }

        setSearchedCert(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }, 400);
  };

  const handleCopyLink = () => {
    const link = searchedCert?.driveFileWebViewLink || searchedCert?.driveFileUrl || `${window.location.origin}/verify?code=${searchedCert?.verificationCode || verificationCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 font-['Cairo']">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 relative border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-base sm:text-xl font-black">منصة التحقق والتوثيق الرقمي</h3>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  نظام التوثيق المعتمد
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                تأكد من صحة الشهادة ومصدرها الرسمي بإدخال الرقم التسلسلي أو مسح الباركود
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar & Instructions - Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              أدخل رقم الباركود / كود التوثيق أو اسم الطالب:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="مثال: TAQDEER-2026-X89F2A"
                  className="w-full pl-4 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white uppercase tracking-wider"
                  dir="ltr"
                />
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute right-3 top-3 sm:top-3.5" />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? 'جاري التحقق...' : 'فحص الشهادة'}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-500 px-1">
              <span>كود هذه الشهادة الحالية: <strong className="font-mono text-indigo-700">{verificationCode}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setSearchCode(verificationCode);
                  setSearchedCert(currentCertificate);
                  setNotFound(false);
                }}
                className="text-indigo-600 hover:underline font-bold cursor-pointer"
              >
                استرجاع شهادة المحرر
              </button>
            </div>
          </form>

          {/* Search Result Display */}
          {notFound ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h4 className="text-base font-bold text-red-900">لم يتم العثور على شهادة بهذا الكود!</h4>
              <p className="text-xs text-red-700 max-w-md mx-auto">
                يرجى التأكد من كتابة الرقم التسلسلي للباربود بشكل صحيح كما هو مطبوع أسفل كود QR على الشهادة.
              </p>
            </div>
          ) : searchedCert ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
              
              {/* Verified Header Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                      <span>شهادة موثوقة ومسجلة رسمياً</span>
                      {searchedCert.driveFileWebViewLink && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Cloud className="w-3 h-3" />
                          <span>Google Drive</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {searchedCert.driveFileWebViewLink
                        ? 'تم توثيق وحفظ نسخة عالية الدقة من الشهادة في Google Drive'
                        : 'تم التحقق من مطابقة البيانات مع سجلات المنصة الإلكترونية المعتمَدة'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                    الحالة: موثقة ✅
                  </span>
                  {searchedCert.driveFileWebViewLink && (
                    <a
                      href={searchedCert.driveFileWebViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة بـ Drive</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <User className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">اسم الحاصل على الشهادة</span>
                    <span className="font-extrabold text-slate-900 text-sm">{searchedCert.studentName}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">الجهة / المدرسة المانحة</span>
                    <span className="font-bold text-slate-900">{searchedCert.schoolName || 'جهة معتمدة'}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">عنوان وموضوع التكريم</span>
                    <span className="font-bold text-slate-900">{searchedCert.title} - {searchedCert.subject}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">تاريخ الإصدار والمكان</span>
                    <span className="font-bold text-slate-900">{searchedCert.issueDate} ({searchedCert.issuePlace})</span>
                  </div>
                </div>

              </div>

              {/* Barcode & Verification Visual */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="Verification QR" className="w-20 h-20 border p-1 rounded-lg bg-white shadow-xs" />
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                      الرقم التسلسلي الفريد (Serial Code)
                    </span>
                    <div className="font-mono text-base font-black text-slate-900 tracking-widest bg-slate-100 px-3 py-1 rounded-md border text-center">
                      {searchedCert.verificationCode || verificationCode}
                    </div>
                    {/* Visual Barcode Graphic */}
                    <div className="flex items-center gap-0.5 h-6 pt-1">
                      {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,4,2,1,3,1,2,3,1].map((w, i) => (
                        <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    {copied ? 'تم نسخ الرابط!' : 'نسخ رابط التوثيق'}
                  </button>

                  {searchedCert.driveFileWebViewLink ? (
                    <a
                      href={searchedCert.driveFileWebViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>فتح الشهادة بـ Drive</span>
                    </a>
                  ) : onOpenGoogleDriveModal ? (
                    <button
                      onClick={onOpenGoogleDriveModal}
                      className="w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>رفع لـ Google Drive</span>
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">منصة تقدير للشهادات الموثوقة رقمياً</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
