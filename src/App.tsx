import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Code2, LayoutDashboard, MessageSquare, Settings, Sparkles, CheckCircle2 } from 'lucide-react';
import IdeaInput from './components/IdeaInput';
import ChatInterface from './components/ChatInterface';
import AnalysisAndPlan from './components/AnalysisAndPlan';
import CodeGeneration from './components/CodeGeneration';

export type Step = 'idea' | 'chat' | 'plan' | 'code';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function App() {
  const [step, setStep] = useState<Step>('idea');
  const [idea, setIdea] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);

  const handleIdeaSubmit = (initialIdea: string) => {
    setIdea(initialIdea);
    setChatHistory([
      { role: 'user', text: initialIdea }
    ]);
    setStep('chat');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Web App Builder</h1>
            <p className="text-xs text-slate-500">AI Assistant</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="الفكرة الأساسية" active={step === 'idea'} />
          <NavItem icon={<MessageSquare />} label="المحادثة والتحليل" active={step === 'chat'} />
          <NavItem icon={<Bot />} label="الخطة المقترحة" active={step === 'plan'} />
          <NavItem icon={<Code2 />} label="توليد الكود" active={step === 'code'} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 w-full p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">الإعدادات</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-8 justify-between z-10">
          <h2 className="font-bold text-xl text-slate-800">
            {step === 'idea' && 'ما هي فكرتك؟'}
            {step === 'chat' && 'تحليل المتطلبات'}
            {step === 'plan' && 'خطة التطبيق'}
            {step === 'code' && 'الكود المصدري'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">الخطوة {['idea', 'chat', 'plan', 'code'].indexOf(step) + 1} من 4</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 'idea' && (
              <motion.div
                key="idea"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <IdeaInput onSubmit={handleIdeaSubmit} />
              </motion.div>
            )}
            {step === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <ChatInterface 
                  history={chatHistory} 
                  setHistory={setChatHistory} 
                  onAnalyze={() => setStep('plan')} 
                  setPlan={setPlan}
                />
              </motion.div>
            )}
            {step === 'plan' && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full overflow-y-auto"
              >
                <AnalysisAndPlan 
                  plan={plan} 
                  onConfirm={() => setStep('code')} 
                  onModify={() => setStep('chat')}
                  setGeneratedCode={setGeneratedCode}
                />
              </motion.div>
            )}
            {step === 'code' && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full overflow-y-auto"
              >
                <CodeGeneration generatedCode={generatedCode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm border border-indigo-100' 
        : 'text-slate-600 hover:bg-slate-50 font-medium'
    }`}>
      <div className={`${active ? 'text-indigo-600' : 'text-slate-400'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <span>{label}</span>
      {active && <CheckCircle2 className="w-4 h-4 mr-auto text-indigo-600" />}
    </div>
  );
}
