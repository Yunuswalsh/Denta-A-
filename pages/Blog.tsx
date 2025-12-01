import React, { useState } from 'react';
import { generateBlogArticle } from '../services/geminiService';

const BlogPage: React.FC = () => {
  const [activeArticle, setActiveArticle] = useState<{title: string, content: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-defined topics
  const topics = [
    "Diş Eti Kanaması Neden Olur?",
    "İmplant Tedavisi Ağrılı mıdır?",
    "20'lik Diş Ne Zaman Çekilmeli?",
    "Çocuklarda Diş Fırçalama Alışkanlığı",
    "Diş Beyazlatma Zararlı mı?"
  ];

  const handleRead = async (topic: string) => {
    setLoading(true);
    setActiveArticle(null);
    const content = await generateBlogArticle(topic);
    setActiveArticle({ title: topic, content });
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Diş Sağlığı Kütüphanesi</h1>
        <p className="text-gray-600 mt-2">Yapay zeka tarafından hazırlanan güncel sağlık bilgileri.</p>
      </div>

      {!activeArticle && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <h3 className="font-bold text-lg text-slate-800 mb-3">{topic}</h3>
              <p className="text-gray-500 text-sm mb-4">Bu konu hakkında detaylı bilgi edinmek için tıklayın.</p>
              <button 
                onClick={() => handleRead(topic)}
                className="text-primary-600 font-medium hover:underline flex items-center"
              >
                Makaleyi Oku &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500">Makale yapay zeka tarafından yazılıyor...</p>
        </div>
      )}

      {activeArticle && (
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
           <button onClick={() => setActiveArticle(null)} className="mb-6 text-gray-500 hover:text-gray-800">← Listeye Dön</button>
           <h1 className="text-3xl font-bold text-slate-900 mb-6">{activeArticle.title}</h1>
           <div className="prose prose-slate max-w-none text-gray-700">
             {activeArticle.content.split('\n').map((line, i) => (
                <p key={i} className="mb-4">{line}</p>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;