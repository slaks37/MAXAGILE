/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckSquare, User, Lock, IdCard, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export function LoginView() {
  const { t } = useLanguage();
  const { login, register, needsSetup } = useAuth();

  const isSetup = needsSetup;

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const u = username.trim();
    if (!u) {
      setError(tr(t, 'authNeedUsername', 'Isi nama pengguna dulu ya.'));
      return;
    }
    if (!password) {
      setError(tr(t, 'authNeedPassword', 'Kata sandi belum diisi.'));
      return;
    }
    if (isSetup && !name.trim()) {
      setError(tr(t, 'authNeedName', 'Isi nama lengkap Anda.'));
      return;
    }

    setError(null);
    setSubmitting(true);
    const message = isSetup
      ? await register(u, name.trim(), password)
      : await login(u, password);
    setSubmitting(false);

    if (message) {
      setError(message);
      // never keep the password around after a failed attempt
      setPassword('');
      return;
    }
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full bg-brand-bg dark:bg-gray-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* soft background glow */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-brand-blue/50 dark:bg-brand-orange/10 rounded-full blur-[110px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-brand-orange/10 rounded-full blur-[110px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm animate-in fade-in duration-300">
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckSquare className="w-7 h-7 text-brand-orange" />
          <span className="text-2xl font-extrabold tracking-tight text-brand-text dark:text-white">MaxAgile</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-100 dark:border-gray-700 border-b-4 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-text dark:text-white tracking-tight leading-snug">
            {isSetup
              ? tr(t, 'authSetupTitle', 'Buat akun pemilik')
              : tr(t, 'authLoginTitle', 'Selamat datang kembali')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            {isSetup
              ? tr(t, 'authSetupSubtitle', 'Ini akun pertama di aplikasi ini, jadi otomatis jadi akun pemilik. Simpan kata sandinya baik-baik.')
              : tr(t, 'authLoginSubtitle', 'Masuk untuk melanjutkan pekerjaan Anda.')}
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 bg-rose-50 dark:bg-rose-900/30 border-2 border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl px-4 py-3 animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed break-words">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field
              id="maxagile-username"
              label={tr(t, 'authUsername', 'Nama pengguna')}
              icon={<User size={16} />}
            >
              <input
                id="maxagile-username"
                type="text"
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                placeholder={tr(t, 'authUsernamePlaceholder', 'misal: stefen')}
                className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-brand-text dark:text-white placeholder:text-gray-400 placeholder:font-medium outline-none transition-all"
              />
            </Field>

            {isSetup && (
              <Field
                id="maxagile-name"
                label={tr(t, 'authName', 'Nama lengkap')}
                icon={<IdCard size={16} />}
              >
                <input
                  id="maxagile-name"
                  type="text"
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder={tr(t, 'authNamePlaceholder', 'Nama yang dilihat rekan tim')}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-brand-text dark:text-white placeholder:text-gray-400 placeholder:font-medium outline-none transition-all"
                />
              </Field>
            )}

            <Field
              id="maxagile-password"
              label={tr(t, 'authPassword', 'Kata sandi')}
              icon={<Lock size={16} />}
            >
              <input
                id="maxagile-password"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                autoComplete={isSetup ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 focus:border-brand-orange focus:bg-white dark:focus:bg-gray-700 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-brand-text dark:text-white placeholder:text-gray-400 outline-none transition-all"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-orange text-white rounded-2xl font-extrabold text-sm border-2 border-orange-600 border-b-4 active:translate-y-[2px] active:border-b-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {tr(t, 'authWorking', 'Sebentar ya...')}
                </>
              ) : (
                <>
                  {isSetup
                    ? tr(t, 'authCreateAccountCta', 'Buat akun pemilik')
                    : tr(t, 'authLoginCta', 'Masuk')}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-5 leading-relaxed">
          {isSetup
            ? tr(t, 'authSetupFootnote', 'Data Anda disimpan di komputer ini saja.')
            : tr(t, 'authLoginFootnote', 'Belum punya akun? Minta pemilik untuk membuatkannya.')}
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, icon, children }: { id: string; label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
