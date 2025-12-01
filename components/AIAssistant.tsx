
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Merhaba! Ben DentaAI Asistanı. Size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    const newHistory: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);

    const response = await chatWithAssistant(newHistory, userMsg);
    
    setMessages([...newHistory, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden border border-gray-200 flex flex-col h-[500px] animate-fade-in">
          {/* Header */}
          <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
               <span className="text-2xl">🤖</span>
               <div>
                  <h3 className="font-bold text-sm">DentaAI Asistan</h3>
                  <p className="text-xs text-primary-200">Çevrimiçi</p>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded p-1">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-gray-200 rounded-2xl p-3 rounded-bl-none shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="Bir soru sorun..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-700 transition"
              disabled={loading}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-xl transition transform hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? (
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
        ) : (
           <span className="text-3xl">💬</span>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
