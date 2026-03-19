import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { generateChatResponse, analyzeAndGeneratePlan } from '../services/ai';
import { Message } from '../App';

interface Props {
  history: Message[];
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  onAnalyze: () => void;
  setPlan: (plan: any) => void;
}

export default function ChatInterface({ history, setHistory, onAnalyze, setPlan }: Props) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    // Trigger initial AI response if history only has the user's first idea
    if (history.length === 1 && history[0].role === 'user') {
      handleInitialResponse();
    }
  }, []);

  const handleInitialResponse = async () => {
    setIsLoading(true);
    try {
      const response = await generateChatResponse(history);
      setHistory(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'assistant', text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory: Message[] = [...history, { role: 'user', text: userMsg }];
    setHistory(newHistory);

    setIsLoading(true);
    try {
      const response = await generateChatResponse(newHistory);
      setHistory(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'عذراً، حدث خطأ في الاتصال.';
      if (error.message?.includes('429') || JSON.stringify(error).includes('429')) {
        errorMsg = 'تم تجاوز حد الاستخدام المسموح به (Quota Exceeded). يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
      }
      setHistory(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (currentHistory: Message[]) => {
    setIsAnalyzing(true);
    try {
      const conversation = currentHistory.map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.text}`).join('\n');
      const plan = await analyzeAndGeneratePlan(conversation);
      setPlan(plan);
      onAnalyze();
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'عذراً، حدث خطأ أثناء تحليل الفكرة. يرجى المحاولة مرة أخرى.';
      if (error.message?.includes('429') || JSON.stringify(error).includes('429')) {
        errorMsg = 'تم تجاوز حد الاستخدام المسموح به (Quota Exceeded). يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.';
      }
      setHistory(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {history.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[75%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              <span className="text-slate-500">يكتب...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="relative flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  // Allow default behavior (new line)
                } else if (e.key === 'Enter' && e.shiftKey) {
                  // Optional: Shift+Enter to send
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب ردك هنا... (Shift+Enter للإرسال)"
              className="flex-1 min-h-[56px] max-h-32 p-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm resize-none"
              disabled={isLoading || isAnalyzing}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isAnalyzing}
              className="h-14 px-8 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التحليل...</span>
                </>
              ) : (
                <>
                  <span>إرسال</span>
                  <Send className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <div className="text-xs text-slate-400">
              Enter للسطر الجديد | Shift+Enter للإرسال
            </div>
            <button 
              onClick={() => handleAnalyze(history)}
              disabled={isLoading || isAnalyzing}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>اكتفيت بالأسئلة، قم بتحليل الفكرة الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
