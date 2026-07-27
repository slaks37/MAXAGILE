import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES, LanguageCode } from '../i18n/translations';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/80 text-brand-text dark:text-gray-200 transition-all text-xs font-bold shadow-sm cursor-pointer ${
          compact ? 'px-2.5 py-1.5' : ''
        }`}
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        {!compact && <span className="hidden sm:inline font-bold">{currentLang.name}</span>}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 flex items-center gap-1.5">
            <Globe size={12} /> Select Language / Pilih Bahasa
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as LanguageCode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors text-left cursor-pointer ${
                  language === lang.code
                    ? 'bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div>
                    <div className="font-bold leading-tight">{lang.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{lang.nativeName}</div>
                  </div>
                </div>
                {language === lang.code && (
                  <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
