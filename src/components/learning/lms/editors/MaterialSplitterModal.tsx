import React, { useEffect, useState } from 'react';
import {
  X,
  Scissors,
  Clock,
  BookOpen,
  Layers,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  MaterialChunk,
  SplitStrategy,
  splitBy1MinRead,
  splitByHeadings,
  splitByCount,
  countWords,
  estimateReadingTime,
} from '../materialSplitter';

export interface MaterialSplitterModalProps {
  initialText: string;
  onApplyChunks: (chunks: MaterialChunk[]) => void;
  onClose: () => void;
}

export function MaterialSplitterModal({
  initialText,
  onApplyChunks,
  onClose,
}: MaterialSplitterModalProps) {
  const [strategy, setStrategy] = useState<SplitStrategy>('1min');
  const [partsCount, setPartsCount] = useState(3);
  const [chunks, setChunks] = useState<MaterialChunk[]>([]);

  const totalWords = countWords(initialText);
  const totalEstTime = estimateReadingTime(totalWords);

  useEffect(() => {
    let result: MaterialChunk[] = [];
    if (strategy === '1min') {
      result = splitBy1MinRead(initialText);
    } else if (strategy === 'headings') {
      result = splitByHeadings(initialText);
    } else if (strategy === 'parts') {
      result = splitByCount(initialText, partsCount);
    }
    setChunks(result);
  }, [initialText, strategy, partsCount]);

  const handleUpdateChunkTitle = (index: number, newTitle: string) => {
    setChunks((prev) =>
      prev.map((c, i) => (i === index ? { ...c, title: newTitle } : c))
    );
  };

  const handleUpdateChunkContent = (index: number, newContent: string) => {
    const wCount = countWords(newContent);
    setChunks((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              content: newContent,
              wordCount: wCount,
              readingTimeMinutes: estimateReadingTime(wCount),
            }
          : c
      )
    );
  };

  const handleApply = () => {
    if (chunks.length === 0) return;
    onApplyChunks(chunks);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange text-brand-text shadow-sm">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
                Pemecah Teks Materi (Smart Material Splitter)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pecah materi panjang ({totalWords} kata, ~{totalEstTime} menit) menjadi kartu-kartu bacaan ringkas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Strategy Selector */}
        <div className="py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <label className="text-xs font-extrabold uppercase tracking-wide text-slate-400 block">
            Pilih Metode Pemecahan Materi:
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setStrategy('1min')}
              className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition cursor-pointer ${
                strategy === '1min'
                  ? 'border-brand-orange bg-amber-50/50 dark:border-brand-orange dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800'
              }`}
            >
              <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-brand-text dark:text-slate-100">
                  Micro-Learning 1-Menit
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Pecah tiap ~180 kata untuk durasi baca 1 menit per kartu.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStrategy('headings')}
              className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition cursor-pointer ${
                strategy === 'headings'
                  ? 'border-brand-orange bg-amber-50/50 dark:border-brand-orange dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800'
              }`}
            >
              <BookOpen className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-brand-text dark:text-slate-100">
                  Berdasarkan Bab / Heading
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Pecah otomatis mengikuti judul bab (#, ##, Bab).
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStrategy('parts')}
              className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition cursor-pointer ${
                strategy === 'parts'
                  ? 'border-brand-orange bg-amber-50/50 dark:border-brand-orange dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800'
              }`}
            >
              <Layers className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-brand-text dark:text-slate-100">
                  Berdasarkan Jumlah Bagian
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Bagi sama rata menjadi N bagian spesifik.
                </p>
              </div>
            </button>
          </div>

          {/* Parts Count Slider (If parts strategy selected) */}
          {strategy === 'parts' && (
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl dark:bg-slate-800/50">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Pecah Menjadi: <span className="text-brand-orange font-black">{partsCount} Bagian</span>
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={partsCount}
                onChange={(e) => setPartsCount(parseInt(e.target.value, 10))}
                className="flex-1 accent-brand-orange cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Chunks Live Preview */}
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wide">
            <span>Hasil Potongan Materi ({chunks.length} Kartu Bacaan)</span>
          </div>

          <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {chunks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Teks materi kosong atau tidak dapat dipecah.
              </div>
            ) : (
              chunks.map((chunk, index) => (
                <div
                  key={chunk.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-[10px] font-black text-brand-text">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={chunk.title}
                        onChange={(e) => handleUpdateChunkTitle(index, e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-brand-text dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>{chunk.wordCount} kata</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> ~{chunk.readingTimeMinutes} mnt
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={chunk.content}
                    onChange={(e) => handleUpdateChunkContent(index, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-bold">
            Total: {chunks.length} Kartu Bacaan Ringkas
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={chunks.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-6 py-2.5 text-xs font-extrabold text-brand-text shadow transition hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" /> Terapkan Pemecahan Materi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
