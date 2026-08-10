import React, { useState, useEffect } from 'react';
import { CertificateData } from '../types';
import {
  Cloud,
  Search,
  Trash2,
  Edit3,
  Copy,
  Download,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Props {
  onLoadCertificate: (cert: CertificateData) => void;
  currentCertificate: CertificateData;
  onOpenGoogleDriveModal?: (cert: CertificateData) => void;
  onVerifyCertificate?: (cert: CertificateData) => void;
}

export const CloudLibrary: React.FC<Props> = ({
  onLoadCertificate,
  currentCertificate,
  onOpenGoogleDriveModal,
  onVerifyCertificate
}) => {
  const [savedCertificates, setSavedCertificates] = useState<CertificateData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'متزامن' | 'جاري الحفظ...'>('متزامن');
  const [certToDelete, setCertToDelete] = useState<CertificateData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const loadSaved = () => {
      const local = localStorage.getItem('taqdeer_saved_certs');
      if (local) {
        try {
          setSavedCertificates(JSON.parse(local));
        } catch (e) {
          console.error(e);
        }
      } else {
        setSavedCertificates([currentCertificate]);
      }
    };
    loadSaved();
  }, [currentCertificate]);

  const handleCopyText = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateCurrentInCloud = () => {
    setSyncStatus('جاري الحفظ...');
    const updatedCert: CertificateData = {
      ...currentCertificate,
      isSavedCloud: true,
      updatedAt: new Date().toISOString()
    };

    const index = savedCertificates.findIndex(c => c.id === updatedCert.id);
    let updatedList: CertificateData[];
    if (index >= 0) {
      updatedList = [...savedCertificates];
      updatedList[index] = updatedCert;
    } else {
      updatedList = [updatedCert, ...savedCertificates];
    }

    setSavedCertificates(updatedList);
    localStorage.setItem('taqdeer_saved_certs', JSON.stringify(updatedList));
    onLoadCertificate(updatedCert);
    setTimeout(() => setSyncStatus('متزامن'), 400);
  };

  const saveCurrentToCloud = () => {
    setSyncStatus('جاري الحفظ...');
    const newId = `cloud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newVerificationCode = `TQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const certToSave: CertificateData = {
      ...currentCertificate,
      id: newId,
      verificationCode: currentCertificate.verificationCode || newVerificationCode,
      isSavedCloud: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [certToSave, ...savedCertificates];
    setSavedCertificates(updated);
    localStorage.setItem('taqdeer_saved_certs', JSON.stringify(updated));
    onLoadCertificate(certToSave);
    setTimeout(() => setSyncStatus('متزامن'), 400);
  };

  const deleteCertificate = (id: string) => {
    const filtered = savedCertificates.filter(c => c.id !== id);
    setSavedCertificates(filtered);
    localStorage.setItem('taqdeer_saved_certs', JSON.stringify(filtered));
  };

  const exportBackupJSON = () => {
    const blob = new Blob([JSON.stringify(savedCertificates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taqdeer-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const filtered = savedCertificates.filter(c =>
    (c.studentName && c.studentName.includes(searchQuery)) ||
    (c.title && c.title.includes(searchQuery)) ||
    (c.subject && c.subject.includes(searchQuery)) ||
    (c.schoolName && c.schoolName.includes(searchQuery)) ||
    (c.verificationCode && c.verificationCode.includes(searchQuery)) ||
    (c.driveFileId && c.driveFileId.includes(searchQuery))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-right">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-black">المكتبة السحابية للتصاميم والشهادات الموثقة</h2>
          </div>
          <p className="text-xs text-indigo-200/80 mt-1">
            حفظ واسترجاع كافة تصاميم شهاداتك الموثقة على Google Drive في أي وقت ومن أي جهاز.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> حالة المزامنة: {syncStatus}
          </span>
          {currentCertificate.isSavedCloud ? (
            <>
              <button
                onClick={updateCurrentInCloud}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>حفظ التعديلات على هذه الشهادة</span>
              </button>
              <button
                onClick={saveCurrentToCloud}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                حفظ كجديدة
              </button>
            </>
          ) : (
            <button
              onClick={saveCurrentToCloud}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              حفظ الشهادة الحالية بالسحابة
            </button>
          )}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، المدرسة، أومعرف التوثيق..."
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <button
          onClick={exportBackupJSON}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <HardDrive className="w-4 h-4" /> تصدير نسخة احتياطية (JSON)
        </button>
      </div>

      {/* Grid of Saved Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 space-y-2">
          <Cloud className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-700">لا توجد تصاميم محفوظة تطابق البحث</h4>
          <p className="text-xs text-slate-500">قم بحفظ تصاميمك الحالية لتظهر في هذه القائمة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cert) => {
            const driveLink = cert.driveFileWebViewLink || cert.driveFileUrl || (cert.driveFileId ? `https://drive.google.com/file/d/${cert.driveFileId}/view` : '');
            const verifyCode = cert.verificationCode || `TQ-${cert.id.slice(-6).toUpperCase()}`;
            const verifyLink = driveLink || `${window.location.origin}/verify?code=${verifyCode}`;

            return (
              <div
                key={cert.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition space-y-3.5 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                      {cert.fontFamily} • {cert.frameStyle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(cert.updatedAt || cert.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  {/* Cert Main Info */}
                  <div>
                    <h4 className="font-black text-base text-slate-900">{cert.studentName || 'طالب متميز'}</h4>
                    <p className="text-xs font-bold text-amber-800 mt-0.5">{cert.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cert.schoolName} {cert.subject ? `• ${cert.subject}` : ''}</p>
                  </div>

                  {/* Google Drive Section */}
                  {driveLink ? (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                        <span className="flex items-center gap-1.5 text-amber-900">
                          <Cloud className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>موثقة ومحفوظة على Drive</span>
                        </span>
                        {cert.driveUploadedAt && (
                          <span className="text-[10px] text-amber-800/80 font-mono font-normal">
                            {new Date(cert.driveUploadedAt).toLocaleDateString('ar-SA')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <a
                          href={driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>عرض في Drive</span>
                        </a>

                        <button
                          onClick={() => handleCopyText(driveLink, `drive-${cert.id}`)}
                          className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="نسخ رابط Google Drive"
                        >
                          {copiedKey === `drive-${cert.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-800" />
                              <span>نسخ الرابط</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                        <Cloud className="w-3.5 h-3.5 text-slate-400" />
                        غير مرفوعة على Drive
                      </span>
                      {onOpenGoogleDriveModal && (
                        <button
                          onClick={() => onOpenGoogleDriveModal(cert)}
                          className="px-2.5 py-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Cloud className="w-3 h-3 text-amber-600" />
                          <span>حفظ وتوثيق على Drive</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Verification Section */}
                  <div className="bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>كود التوثيق:</span>
                      </span>
                      <span className="font-mono font-bold text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] shadow-2xs">
                        {verifyCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => handleCopyText(verifyLink, `verify-${cert.id}`)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copiedKey === `verify-${cert.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">تم نسخ رابط التوثيق</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-indigo-700" />
                            <span>نسخ رابط التوثيق</span>
                          </>
                        )}
                      </button>

                      {onVerifyCertificate && (
                        <button
                          onClick={() => onVerifyCertificate(cert)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="عرض سجل وفحص التوثيق"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>فحص التوثيق</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => onLoadCertificate(cert)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> فتح بالمحرر
                  </button>

                  <button
                    onClick={() => setCertToDelete(cert)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="حذف الشهادة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {certToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 dir-rtl">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-right border border-slate-200 relative">
            <button
              onClick={() => setCertToDelete(null)}
              className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">تأكيد حذف الشهادة من السحابة</h3>
                <p className="text-xs text-slate-500 font-medium">إجراء غير قابل للتراجع</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              هل أنت أصلًا متأكد من رغبتك في حذف شهادة <span className="font-extrabold text-slate-900">«{certToDelete.studentName || 'طالب متميز'}»</span> ({certToDelete.title}) من المكتبة السحابية؟
            </p>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200/60 text-xs text-red-700 font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>تنبيه: سيتم حذف هذه الشهادة نهائياً من المكتبة السحابية ولن تستطيع استرجاعها لاحقاً.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setCertToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  deleteCertificate(certToDelete.id);
                  setCertToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
