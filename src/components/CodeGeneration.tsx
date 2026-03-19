import React, { useState, useMemo } from 'react';
import { FileCode2, Database, Rocket, Copy, CheckCircle2, ChevronDown, ChevronUp, Eye, Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

interface Props {
  generatedCode: any;
}

export default function CodeGeneration({ generatedCode }: Props) {
  const [activeTab, setActiveTab] = useState<'files' | 'supabase' | 'deploy' | 'preview'>('preview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedFile, setExpandedFile] = useState<number | null>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!generatedCode) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      
      // Add all generated files to the zip
      generatedCode.files.forEach((file: any) => {
        zip.file(file.filename, file.content);
      });

      // Add SQL instructions as a separate file
      zip.file('supabase_setup.sql', generatedCode.supabase.sql);
      zip.file('README_INSTRUCTIONS.txt', `
SUPABASE INSTRUCTIONS:
${generatedCode.supabase.instructions}

DEPLOYMENT INSTRUCTIONS:
GITHUB: ${generatedCode.deployment.github}
GITHUB PAGES: ${generatedCode.deployment.githubPages}
PWA BUILDER: ${generatedCode.deployment.pwaBuilder}
      `);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'web-app-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('حدث خطأ أثناء تحميل المشروع.');
    } finally {
      setIsDownloading(false);
    }
  };

  const previewContent = useMemo(() => {
    const indexFile = generatedCode.files.find((f: any) => f.filename === 'index.html');
    if (!indexFile) return null;

    // We need to inject the CSS and JS into the HTML for the preview
    // This is a simple implementation, it might not work perfectly for all cases
    let content = indexFile.content;
    
    const styleFile = generatedCode.files.find((f: any) => f.filename === 'style.css');
    if (styleFile) {
      content = content.replace('</head>', `<style>${styleFile.content}</style></head>`);
    }

    const jsFile = generatedCode.files.find((f: any) => f.filename === 'app.js');
    if (jsFile) {
      // Mock Supabase if it's used, or just inject the JS
      content = content.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }

    return content;
  }, [generatedCode]);

  return (
    <div className="max-w-6xl mx-auto p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">تم بناء التطبيق بنجاح! 🎉</h1>
            <p className="text-slate-500 mt-1">إليك جميع الملفات والتعليمات اللازمة لإطلاق تطبيقك.</p>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>تحميل المشروع كاملاً (ZIP)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-200/50 p-1.5 rounded-xl w-fit">
        <TabButton 
          active={activeTab === 'preview'} 
          onClick={() => setActiveTab('preview')} 
          icon={<Eye className="w-4 h-4" />} 
          label="معاينة الواجهة" 
        />
        <TabButton 
          active={activeTab === 'files'} 
          onClick={() => setActiveTab('files')} 
          icon={<FileCode2 className="w-4 h-4" />} 
          label="ملفات المشروع" 
        />
        <TabButton 
          active={activeTab === 'supabase'} 
          onClick={() => setActiveTab('supabase')} 
          icon={<Database className="w-4 h-4" />} 
          label="قاعدة البيانات" 
        />
        <TabButton 
          active={activeTab === 'deploy'} 
          onClick={() => setActiveTab('deploy')} 
          icon={<Rocket className="w-4 h-4" />} 
          label="النشر" 
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        {activeTab === 'preview' && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">معاينة حية (تجريبية)</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              {previewContent ? (
                <iframe 
                  srcDoc={previewContent}
                  title="Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-modals"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  لا يمكن عرض المعاينة لعدم وجود ملف index.html
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {generatedCode.files.map((file: any, idx: number) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpandedFile(expandedFile === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileCode2 className="w-5 h-5 text-indigo-500" />
                    <span className="font-mono font-bold text-slate-700" dir="ltr">{file.filename}</span>
                  </div>
                  {expandedFile === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                
                {expandedFile === idx && (
                  <div className="relative border-t border-slate-200">
                    <button 
                      onClick={() => handleCopy(file.content, idx)}
                      className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg backdrop-blur-sm transition-colors"
                      title="نسخ الكود"
                    >
                      {copiedIndex === idx ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="p-6 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed" dir="ltr">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'supabase' && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-500" />
                <span>كود SQL لإنشاء الجداول</span>
              </h3>
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <button 
                  onClick={() => handleCopy(generatedCode.supabase.sql, 999)}
                  className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg backdrop-blur-sm transition-colors"
                >
                  {copiedIndex === 999 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="p-6 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed" dir="ltr">
                  <code>{generatedCode.supabase.sql}</code>
                </pre>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-4">تعليمات الربط مع Supabase</h3>
              <div className="prose prose-blue max-w-none whitespace-pre-wrap text-blue-900 leading-relaxed">
                {generatedCode.supabase.instructions}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <DeployStep 
              number={1} 
              title="الرفع على GitHub" 
              content={generatedCode.deployment.github} 
            />
            <DeployStep 
              number={2} 
              title="تفعيل GitHub Pages" 
              content={generatedCode.deployment.githubPages} 
            />
            <DeployStep 
              number={3} 
              title="تغليف التطبيق (PWABuilder)" 
              content={generatedCode.deployment.pwaBuilder} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
        active 
          ? 'bg-white text-indigo-700 shadow-sm' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DeployStep({ number, title, content }: { number: number, title: string, content: string }) {
  return (
    <div className="flex gap-6">
      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
        {number}
      </div>
      <div className="flex-1 pt-2">
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap text-slate-700 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
