import React, { useState, useRef, useEffect } from 'react';
import { X, Scissors, RotateCcw, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';

interface LogoCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export const LogoCropModal: React.FC<LogoCropModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onSave,
}) => {
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '4:3'>('free');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 });

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      generateCropPreview();
    };
  }, [imageUrl]);

  useEffect(() => {
    generateCropPreview();
  }, [cropBox, rotation, zoom]);

  const handleAspectRatioChange = (ratio: 'free' | '1:1' | '4:3') => {
    setAspectRatio(ratio);
    if (ratio === '1:1') {
      setCropBox(prev => ({ ...prev, height: prev.width }));
    } else if (ratio === '4:3') {
      setCropBox(prev => ({ ...prev, height: Math.min(90, Math.round(prev.width * 0.75)) }));
    }
  };

  const generateCropPreview = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropPixelX = (cropBox.x / 100) * img.naturalWidth;
    const cropPixelY = (cropBox.y / 100) * img.naturalHeight;
    const cropPixelW = (cropBox.width / 100) * img.naturalWidth;
    const cropPixelH = (cropBox.height / 100) * img.naturalHeight;

    canvas.width = Math.max(30, Math.round(cropPixelW));
    canvas.height = Math.max(30, Math.round(cropPixelH));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      img,
      cropPixelX,
      cropPixelY,
      cropPixelW,
      cropPixelH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    try {
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch {
      // ignore cors error
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100 - cropBox.width, dragStartRef.current.boxX + dx));
    const newY = Math.max(0, Math.min(100 - cropBox.height, dragStartRef.current.boxY + dy));

    setCropBox(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleApplyCrop = () => {
    if (previewUrl) {
      onSave(previewUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-sm">اقتطاع واقتصاص الشعار</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full h-56 bg-slate-900/90 rounded-xl overflow-hidden flex items-center justify-center select-none cursor-move border border-slate-700"
          >
            <img
              src={imageUrl}
              alt="Logo to crop"
              className="max-h-full max-w-full object-contain pointer-events-none opacity-80"
              style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
            />

            <div
              onMouseDown={handleMouseDown}
              className="absolute border-2 border-amber-400 bg-amber-400/20 shadow-lg cursor-move flex items-center justify-center"
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
            >
              <span className="text-[10px] font-bold text-amber-950 bg-amber-300/90 px-1 rounded">
                {cropBox.width}% × {cropBox.height}%
              </span>
            </div>
          </div>

          <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">نسبة العرض للارتفاع:</span>
              <div className="flex gap-1">
                {[
                  { id: 'free', label: 'حر' },
                  { id: '1:1', label: '1:1 مربع' },
                  { id: '4:3', label: '4:3' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleAspectRatioChange(r.id as any)}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      aspectRatio === r.id ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-600 block mb-1">العرض: {cropBox.width}%</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={cropBox.width}
                  onChange={(e) => setCropBox(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
              <div>
                <span className="font-bold text-slate-600 block mb-1">الارتفاع: {cropBox.height}%</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={cropBox.height}
                  onChange={(e) => setCropBox(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>90°-</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 font-bold flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>90°+</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-600">التكبير:</span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
                  className="p-1 bg-white border border-slate-300 rounded"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3.0, Math.round((z + 0.1) * 10) / 10))}
                  className="p-1 bg-white border border-slate-300 rounded"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {previewUrl && (
            <div className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-12 h-12 bg-white rounded p-1 border flex items-center justify-center shrink-0">
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-amber-950">معاينة الشعار المقتطع</h4>
                <p className="text-amber-800 text-[11px]">اضغط "تطبيق الاقتصاص" لاعتماد الشعار بالشهادة.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs bg-white text-slate-700">
            إلغاء
          </button>
          <button
            onClick={handleApplyCrop}
            disabled={!previewUrl}
            className="px-4 py-1.5 rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>تطبيق الاقتصاص</span>
          </button>
        </div>
      </div>
    </div>
  );
};
