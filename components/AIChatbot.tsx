import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { Product } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Salam! Mən EDU Aptek-in virtual əczaçısıyam. Sizə necə kömək edə bilərəm? Səhhətinizlə bağlı sual verə və ya məhsullarımız haqqında soruşa bilərsiniz.',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 1. Fetch Products for AI Context
  useEffect(() => {
    const productsRef = db.ref('products');
    const handleData = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const productList: Product[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setProducts(productList);
      }
    };
    productsRef.once('value', handleData);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 2. Prepare Context
      const productContext = products.map(p => 
        `- Məhsul: ${p.name}\n  Qiymət: ${p.price} AZN\n  Təsvir: ${p.description}`
      ).join('\n\n');

      // 3. System Instruction embedded in prompt
      const systemInstruction = `
        Sən EDU Aptek-in "Ağıllı Əczaçı" köməkçisisən (AI Chatbot).
        
        MƏQSƏDİN:
        İstifadəçilərin sağlamlıqla bağlı suallarını cavablandırmaq və aşağıdakı siyahıda olan müvafiq məhsulları tövsiyə etməkdir.

        MƏHSUL BAZASI (Yalnız bu məhsulları tövsiyə et):
        ${productContext}

        QAYDALAR:
        1. Çox nəzakətli, peşəkar və empatik ol.
        2. Əgər istifadəçinin problemi ilə bağlı anbarda (yuxarıdakı siyahıda) məhsul varsa, mütləq adını və qiymətini qeyd et.
        3. Əgər istifadəçinin istədiyi məhsul siyahıda yoxdursa, bunu nəzakətlə bildir.
        4. TİBBİ XƏBƏRDARLIQ: Hər məsləhətin sonunda qeyd et ki, "Bu məsləhət həkim rəyini əvəz etmir. Zəhmət olmasa həkimlə məsləhətləşin."
        5. Cavabların qısa, lakonik və Azərbaycan dilində olsun.
      `;

      // Initialize Google GenAI
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputText,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      const botText = response.text;

      if (!botText) {
        throw new Error("Boş cavab gəldi.");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorText = "Texniki xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.";
      
      // Error handling logic
      if (error.message) {
         if (error.message.includes("404") || error.message.includes("not found")) {
            errorText = "Sistem xətası: Seçilmiş AI modeli tapılmadı.";
         } else if (error.message.includes("403") || error.message.includes("API Key")) {
            errorText = "Sistem xətası: API açarı yanlışdır və ya icazə yoxdur.";
         } else if (error.message.includes("503")) {
            errorText = "Sistem xətası: AI servisi müvəqqəti olaraq məşğuldur.";
         }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errorText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-8 h-8 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-green-100 z-40 overflow-hidden flex flex-col animate-slide-up h-[500px] max-h-[80vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                EDU Aptek AI
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-green-50 text-xs opacity-90">Virtual Əczaçı (Online)</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gray-200' 
                    : 'bg-green-100'
                }`}>
                  {msg.sender === 'user' ? (
                    <User className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-green-600" />
                  )}
                </div>
                
                <div className={`flex flex-col max-w-[80%] ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-green-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-2.5">
                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-green-600" />
                 </div>
                 <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                    <span className="text-xs text-gray-500">Yazır...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Sualınızı bura yazın..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50 text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-center text-gray-400 mt-2">
              AI səhvlər edə bilər. Həkimlə məsləhətləşin.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;