import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AIAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'مرحباً بك! أنا مستشارك الذكي لتصاميم وصياغة شهادات التقدير والتحفيز الطلابي. كيف يمكنني مساعدتك اليوم؟ يمكنك أن تطلب مني صياغة بيت شعر، أو اقتراح أفكار تكريم لمادة معينة.',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'اقترح عليّ 3 أبيات شعرية راقية عن العلم والاجتهاد تناسب الشهادة',
    'كيف أصيغ شهادة تقدير لطالب ممتاز في الحساب الذهني؟',
    'أفكار لمسميات جوائز تحفيزية للأطفال في الروضة',
    'عبارات شكر قصيرة ومؤثرة للمواظبة والانضباط المدرسي',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await response.json();
      const aiReply = data.text || 'عذراً، لم أستطع معالجة طلبك حالياً.';

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.',
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-right">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">المستشار التربوي واللغوي الذكي (Gemini AI)</h3>
            <p className="text-xs text-amber-200/80">استشارات بلا حدود في الصياغة، الشعر، والتحفيز الطلابي</p>
          </div>
        </div>
        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
          متصل 24/7
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-medium transition shadow-2xs"
          >
            💡 {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[420px] overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              m.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                m.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-900 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.text}
              <span className={`block text-[9px] mt-1.5 ${m.sender === 'user' ? 'text-slate-400' : 'text-slate-500'}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            جاري معالجة الطلب وكتابة الاستشارة...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب سؤالك أو اكتب مواصفات الشهادة هنا..."
          className="flex-1 px-4 py-2.5 text-xs focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" /> إرسال
        </button>
      </div>

    </div>
  );
};
