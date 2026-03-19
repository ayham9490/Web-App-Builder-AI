import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface Props {
  onSubmit: (idea: string) => void;
}

export default function IdeaInput({ onSubmit }: Props) {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-3xl mb-4">
            <Sparkles className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">أخبرني بفكرة تطبيقك</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            سأقوم بمساعدتك في بناء تطبيق ويب متكامل (PWA) خطوة بخطوة. ابدأ بوصف فكرتك وسأطرح عليك بعض الأسئلة لفهم المتطلبات.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="مثال: أريد تطبيقاً لإدارة المهام اليومية مع إمكانية مشاركتها مع فريق العمل..."
            className="w-full h-40 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 resize-none transition-all text-lg"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={!idea.trim()}
            className="absolute bottom-6 left-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
          >
            <span>ابدأ الآن</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <SuggestionBadge text="تطبيق لإدارة المصروفات الشخصية" onClick={() => setIdea("تطبيق لإدارة المصروفات الشخصية")} />
          <SuggestionBadge text="منصة تعليمية للكورسات" onClick={() => setIdea("منصة تعليمية للكورسات")} />
          <SuggestionBadge text="تطبيق حجز مواعيد للعيادات" onClick={() => setIdea("تطبيق حجز مواعيد للعيادات")} />
        </div>
      </div>
    </div>
  );
}

function SuggestionBadge({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
    >
      {text}
    </button>
  );
}
