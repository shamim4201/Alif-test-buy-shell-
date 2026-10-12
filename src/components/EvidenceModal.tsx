import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ShieldCheck } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: string[];
  channelTitle: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  screenshots,
  channelTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !screenshots || screenshots.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                YouTube Studio Analytics Proof: {channelTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Verified Seller Screenshot {currentIndex + 1} of {screenshots.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[400px] max-h-[650px] p-4 overflow-hidden">
          <img
            src={screenshots[currentIndex]}
            alt={`Analytics screenshot ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
          />

          {screenshots.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Selector & Safety notice */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {screenshots.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-16 h-11 rounded-md overflow-hidden border-2 transition ${
                  idx === currentIndex
                    ? 'border-red-500 scale-105'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={s} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="text-right text-[11px] text-slate-400">
            Analytics screenshots are cross-referenced with channel metrics during admin moderation.
          </div>
        </div>
      </div>
    </div>
  );
};
