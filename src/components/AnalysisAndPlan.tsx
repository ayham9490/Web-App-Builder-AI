import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, Database, Layout, Code2, ArrowLeft, Loader2 } from 'lucide-react';
import { generateCode } from '../services/ai';

interface Props {
  plan: any;
  onConfirm: () => void;
  onModify: () => void;
  setGeneratedCode: (code: any) => void;
}

export default function AnalysisAndPlan({ plan, onConfirm, onModify, setGeneratedCode }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!plan) return null;

  const handleConfirm = async () => {
    setIsGenerating(true);
    try {
      const code = await generateCode(plan);
      setGeneratedCode(code);
      onConfirm();
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'حدث خطأ أثناء توليد الكود. يرجى المحاولة مرة أخرى.';
      if (error.message?.includes('429') || JSON.stringify(error).includes('429')) {
        errorMsg = 'تم تجاوز حد الاستخدام المسموح به (Quota Exceeded). يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.';
      }
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Analysis Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">تحليل الفكرة</h2>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-2">الملخص</h3>
            <p className="text-slate-600 leading-relaxed">{plan.analysis.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>نواقص تم اكتشافها</span>
              </h3>
              <ul className="space-y-2">
                {(plan.analysis.missingParts || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
                {(!plan.analysis.missingParts || plan.analysis.missingParts.length === 0) && (
                  <li className="text-amber-700">لم يتم اكتشاف نواقص جوهرية.</li>
                )}
              </ul>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>اقتراحات ذكية</span>
              </h3>
              <ul className="space-y-2">
                {(plan.analysis.suggestions || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
                {(!plan.analysis.suggestions || plan.analysis.suggestions.length === 0) && (
                  <li className="text-emerald-700">لا توجد اقتراحات إضافية حالياً.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Layout className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">خطة التنفيذ</h2>
        </div>

        <div className="space-y-8">
          {/* Tech Stack */}
          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
              <Code2 className="w-5 h-5 text-slate-400" />
              <span>البنية التقنية</span>
            </h3>
            <div className="flex gap-4">
              <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 flex-1">
                <span className="text-sm text-slate-500 block mb-1">Frontend</span>
                <span className="font-bold text-slate-800">{plan.plan.techStack.frontend}</span>
              </div>
              <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 flex-1">
                <span className="text-sm text-slate-500 block mb-1">Backend</span>
                <span className="font-bold text-slate-800">{plan.plan.techStack.backend}</span>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
              <Layout className="w-5 h-5 text-slate-400" />
              <span>الصفحات</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plan.plan.pages.map((page: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-indigo-600 mb-1">{page.name}</h4>
                  <p className="text-sm text-slate-600">{page.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database */}
          <div>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
              <Database className="w-5 h-5 text-slate-400" />
              <span>قاعدة البيانات</span>
            </h3>
            <div className="space-y-4">
              {plan.plan.database.map((table: any, idx: number) => (
                <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700">
                    {table.tableName}
                  </div>
                  <div className="p-4">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-200">
                          <th className="pb-2 font-medium">الحقل</th>
                          <th className="pb-2 font-medium">النوع</th>
                          <th className="pb-2 font-medium">الوصف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.fields.map((field: any, fIdx: number) => (
                          <tr key={fIdx} className="border-b border-slate-100 last:border-0">
                            <td className="py-2 font-mono text-indigo-600" dir="ltr">{field.name}</td>
                            <td className="py-2 text-slate-600">{field.type}</td>
                            <td className="py-2 text-slate-500">{field.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky bottom-8">
        <div>
          <h3 className="font-bold text-slate-800">هل توافق على هذه الخطة؟</h3>
          <p className="text-sm text-slate-500">يمكنك تعديل المتطلبات أو المضي قدماً لتوليد الكود.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onModify}
            disabled={isGenerating}
            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            تعديل المتطلبات
          </button>
          <button
            onClick={handleConfirm}
            disabled={isGenerating}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري توليد الكود...</span>
              </>
            ) : (
              <>
                <span>موافق، ابدأ البناء</span>
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
