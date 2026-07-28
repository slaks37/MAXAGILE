import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  ThumbsUp,
  MessageCircle,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Activity, ForumPost, ForumReply } from '../types';
import { genId } from '../store';
import { useEditMode } from '../EditModeContext';
import { useLanguage } from '../../../../i18n/LanguageContext';

function tr(t: (k: string) => string, key: string, fallback: string): string {
  const v = t(key);
  return v === key ? fallback : v;
}

export interface ForumPlayerProps {
  activity: Activity;
  userPosts?: ForumPost[];
  onAddPost: (post: ForumPost) => void;
  onAddReply: (postId: string, reply: ForumReply) => void;
}

export function ForumPlayer({
  activity,
  userPosts = [],
  onAddPost,
  onAddReply,
}: ForumPlayerProps) {
  const { t } = useLanguage();
  const { editMode } = useEditMode();
  const forum = activity.forum;

  // Combine default course forum posts and learner dynamic posts
  const allPosts = [...(forum?.posts || []), ...userPosts];

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [authorName, setAuthorName] = useState(tr(t, 'lmsDefaultStudentName', 'Siswa MaxAgile'));

  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  if (!forum) {
    return (
      <div className="p-6 text-sm text-slate-500">
        {tr(t, 'lmsForumNotConfigured', 'Aktivitas forum belum dikonfigurasi.')}
      </div>
    );
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: ForumPost = {
      id: genId('post'),
      title: postTitle.trim(),
      content: postContent.trim(),
      authorName: authorName.trim() || tr(t, 'lmsDefaultUserName', 'Pengguna'),
      authorRole: editMode ? 'Pengajar' : 'Siswa',
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0,
    };

    onAddPost(newPost);
    setPostTitle('');
    setPostContent('');
    setShowNewPostForm(false);
  };

  const handleCreateReply = (postId: string) => {
    if (!replyContent.trim()) return;

    const newReply: ForumReply = {
      id: genId('reply'),
      authorName: authorName.trim() || tr(t, 'lmsDefaultUserName', 'Pengguna'),
      authorRole: editMode ? 'Pengajar' : 'Siswa',
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    onAddReply(postId, newReply);
    setReplyContent('');
    setActiveReplyPostId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <MessageSquare className="h-4 w-4" />
            <span>{tr(t, 'lmsActForum', 'Forum Diskusi')}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {allPosts.length} {tr(t, 'lmsDiscussionsUnit', 'Diskusi')}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-brand-text dark:text-slate-100">
          {activity.title}
        </h3>
        {activity.description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {activity.description}
          </p>
        )}

        {forum.prompt && (
          <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-sm text-sky-950 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
            <span className="font-extrabold block mb-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              {tr(t, 'lmsForumPromptLabel', 'Topik & Pemantik Diskusi:')}
            </span>
            {forum.prompt}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-extrabold text-brand-text dark:text-slate-100">
          {tr(t, 'lmsForumThreadList', 'Daftar Utas Diskusi')}
        </h4>
        {(forum.allowStudentPosts || editMode) && (
          <button
            type="button"
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-text bg-brand-orange px-4 py-2 text-xs font-extrabold text-brand-text shadow transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {showNewPostForm
              ? tr(t, 'lmsCancel', 'Batal')
              : tr(t, 'lmsNewDiscussionTopic', 'Buat Topik Diskusi Baru')}
          </button>
        )}
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <form
          onSubmit={handleCreatePost}
          className="rounded-2xl border-2 border-brand-orange bg-amber-50/30 p-5 space-y-4 dark:border-brand-orange/60 dark:bg-amber-950/20 animate-in fade-in"
        >
          <h4 className="text-sm font-extrabold text-brand-text dark:text-slate-100">
            {tr(t, 'lmsNewDiscussion', 'Mulai Diskusi Baru')}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tr(t, 'lmsAuthorName', 'Nama Pengirim')}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tr(t, 'lmsDiscussionTitle', 'Judul Diskusi')}
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder={tr(
                  t,
                  'lmsDiscussionTitlePlaceholder',
                  'Tulis judul topik pertanyaan / gagasan...',
                )}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {tr(t, 'lmsDiscussionBody', 'Isi Pesan / Pertanyaan')}
            </label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={tr(
                t,
                'lmsDiscussionBodyPlaceholder',
                'Jelaskan pertanyaan atau ide Anda untuk didiskusikan...',
              )}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-extrabold text-brand-text shadow transition hover:brightness-105 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            {tr(t, 'lmsSendDiscussion', 'Kirim Diskusi')}
          </button>
        </form>
      )}

      {/* Forum Threads List */}
      <div className="space-y-4">
        {allPosts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
            {tr(t, 'lmsForumEmpty', 'Belum ada diskusi pada forum ini. Mulai diskusi pertama Anda!')}
          </div>
        ) : (
          allPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Post Author & Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-extrabold dark:bg-slate-800 dark:text-slate-300">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-brand-text dark:text-slate-100">
                        {post.authorName}
                      </span>
                      {post.authorRole === 'Pengajar' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/20 px-2 py-0.5 text-[10px] font-extrabold text-brand-text">
                          <ShieldCheck className="h-3 w-3" />
                          {tr(t, 'lmsRoleTeacher', 'Pengajar')}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {tr(t, 'lmsRoleStudent', 'Siswa')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div>
                <h5 className="text-base font-extrabold text-brand-text dark:text-slate-100 mb-1">
                  {post.title}
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-extrabold text-slate-500">
                <button
                  type="button"
                  onClick={() =>
                    setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)
                  }
                  className="flex items-center gap-1.5 hover:text-brand-teal cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {tr(t, 'lmsReply', 'Balas')} ({post.replies?.length || 0})
                  </span>
                </button>
              </div>

              {/* Replies list */}
              {post.replies && post.replies.length > 0 && (
                <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 pt-2">
                  {post.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-xl bg-slate-50 p-3.5 space-y-1.5 dark:bg-slate-800/60"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {reply.authorName}
                          </span>
                          {reply.authorRole === 'Pengajar' && (
                            <span className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-[9px] font-extrabold text-brand-text">
                              {tr(t, 'lmsRoleTeacher', 'Pengajar')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(reply.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {activeReplyPostId === post.id && (
                <div className="ml-4 pt-2 space-y-2 animate-in fade-in">
                  <textarea
                    rows={2}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`${tr(t, 'lmsReplyToPrefix', 'Tulis balasan untuk')} ${post.authorName}...`}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveReplyPostId(null)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {tr(t, 'lmsCancel', 'Batal')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateReply(post.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-brand-teal px-4 py-1.5 text-xs font-extrabold text-white shadow hover:brightness-105 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {tr(t, 'lmsSendReply', 'Kirim Balasan')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
