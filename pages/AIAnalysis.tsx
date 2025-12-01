import React, { useState, useRef } from 'react';
import { analyzeSymptom, AnalysisResult } from '../services/geminiService';
import { db } from '../services/db';
import { Link } from 'react-router-dom';
import { UrgencyLevel } from '../types';

const AIAnalysisPage: React.FC = () => {
  const [symptom, setSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!symptom && !image) return;

    setLoading(true);
    setResult(null);

    const aiResult = await analyzeSymptom(symptom, image || undefined);

    // Save to Log
    db.addAILog({
      id: Date.now().toString(),
      userComplaint: symptom,
      aiResponse: JSON.stringify(aiResult),
      urgency: aiResult.urgency,
      timestamp: Date.now(),
      hasImage: !!image,
      imageBase64: image || undefined
    });

    setResult(aiResult);
    setLoading(false);
  };

  const urgencyColor = (level: UrgencyLevel) => {
    switch(level) {
      case UrgencyLevel.LOW: return 'bg-green-100 text-green-800 border-green-200';
      case UrgencyLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case UrgencyLevel.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case UrgencyLevel.EMERGENCY: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">AI</span> Ön Muayene Asistanı
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Şikayetinizi yazın ve mümkünse ağrıyan bölgenin fotoğrafını yükleyin. Yapay zeka, görseli ve metni birlikte analiz ederek daha doğru bir ön değerlendirme sunar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-fit border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">Şikayetiniz Nedir?</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 min-h-[120px] mb-4"
            placeholder="Örn: Sağ alt azı dişimde siyah bir leke var ve soğuk içince sızlıyor..."
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          ></textarea>

          <label className="block text-sm font-bold text-gray-700 mb-2">Fotoğraf Yükle (Önerilen)</label>
          <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition relative overflow-hidden group ${image ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <div className="relative">
                 <img src={image} alt="Uploaded" className="max-h-56 mx-auto rounded-lg shadow-md object-contain" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <p className="text-white font-bold">Fotoğrafı Değiştir</p>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 z-10"
                  >
                    ✕
                  </button>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="text-5xl mb-2">📸</div>
                <p className="text-gray-700 font-medium">Dişinizin fotoğrafını buraya sürükleyin</p>
                <p className="text-gray-400 text-xs">veya seçmek için tıklayın (JPG, PNG)</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading || (!symptom && !image)}
            className="mt-6 w-full bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Analiz Ediyor...
              </>
            ) : 'Analizi Başlat ✨'}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 flex flex-col justify-center min-h-[400px] relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

          {!result && !loading && (
             <div className="text-center text-gray-400 relative z-10">
               <div className="text-7xl mb-6 opacity-30">🧬</div>
               <h3 className="text-xl font-bold text-gray-500 mb-2">Henüz Analiz Yapılmadı</h3>
               <p className="max-w-xs mx-auto">Sol taraftan şikayetinizi girip analiz butonuna basın.</p>
             </div>
          )}

          {loading && (
             <div className="text-center space-y-6 relative z-10">
                <div className="relative w-24 h-24 mx-auto">
                   <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-t-primary-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">🦷</div>
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">Görüntü ve Veriler İşleniyor</h3>
                   <p className="text-gray-500 text-sm mt-1">Bu işlem birkaç saniye sürebilir...</p>
                </div>
             </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in relative z-10">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                 <h2 className="text-xl font-bold text-slate-900">Analiz Raporu</h2>
                 <span className={`px-4 py-1 rounded-full text-sm font-bold border ${urgencyColor(result.urgency)}`}>
                   {result.urgency} Düzeyinde
                 </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Tespit / Teşhis</h3>
                  <p className="text-lg text-slate-800 font-semibold leading-relaxed">{result.diagnosis}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="text-xs uppercase tracking-wider text-blue-500 font-bold mb-1">Tedavi Önerisi</h3>
                  <p className="text-blue-900 leading-relaxed">{result.treatmentSuggestion}</p>
                </div>

                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="bg-primary-100 p-2 rounded-lg mr-3">👨‍⚕️</div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Önerilen Uzmanlık</p>
                    <p className="text-primary-700 font-bold text-lg">{result.recommendedSpecialist}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/appointment" className="block w-full text-center bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform active:scale-95">
                  Uzman İçin Randevu Al
                </Link>
                <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-wide">
                  *Yapay zeka tavsiyesidir, kesin tıbbi tanı değildir.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIAnalysisPage;