
import { GoogleGenAI } from "@google/genai";
import { UrgencyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Flash for speed and image capability
const MODEL_NAME = 'gemini-2.5-flash';

export interface AnalysisResult {
  diagnosis: string;
  urgency: UrgencyLevel;
  treatmentSuggestion: string;
  recommendedSpecialist: string;
}

export const analyzeSymptom = async (symptomText: string, imageBase64?: string): Promise<AnalysisResult> => {
  try {
    let promptText = `
      Sen uzman bir diş hekimi asistanı yapay zekasın. 
      Aşağıdaki hasta şikayetini analiz et.
      
      Eğer bir görüntü sağlandıysa, lütfen görseldeki renk değişimlerini, şişliği, diş eti durumunu veya çürük belirtilerini DİKKATLE incele ve teşhisine dahil et.
      Görüntü yoksa sadece metne odaklan.
      
      Lütfen yanıtı SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
      {
        "diagnosis": "Olası durum veya teşhis (kısa ve net açıklama, görsel bulguları içer)",
        "urgency": "Düşük" | "Orta" | "Yüksek" | "Acil",
        "treatmentSuggestion": "Evde yapılabilecekler veya klinik tedavi önerisi",
        "recommendedSpecialist": "Örnek: Ortodontist, Periodontist, Çene Cerrahı vb."
      }
      
      Şikayet: ${symptomText}
    `;

    const parts: any[] = [{ text: promptText }];
    
    if (imageBase64) {
      // Remove data URL header if present (e.g., "data:image/jpeg;base64,")
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    return {
      diagnosis: json.diagnosis || "Belirsiz Durum",
      urgency: (json.urgency as UrgencyLevel) || UrgencyLevel.MEDIUM,
      treatmentSuggestion: json.treatmentSuggestion || "Lütfen kliniğimizi ziyaret edin.",
      recommendedSpecialist: json.recommendedSpecialist || "Genel Diş Hekimi"
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      diagnosis: "Analiz sırasında teknik bir hata oluştu.",
      urgency: UrgencyLevel.LOW,
      treatmentSuggestion: "Lütfen doğrudan doktorumuzla iletişime geçin.",
      recommendedSpecialist: "Genel Diş Hekimi"
    };
  }
};

export const generateBlogArticle = async (topic: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `
                Bir diş kliniği blogu için "${topic}" hakkında bilgilendirici, 
                samimi ve SEO uyumlu 300 kelimelik Türkçe bir makale yaz. 
                Markdown formatında başlıklar kullan.
            `
        });
        return response.text || "İçerik oluşturulamadı.";
    } catch (e) {
        console.error(e);
        return "İçerik şu an oluşturulamıyor.";
    }
}

export const chatWithAssistant = async (history: {role: 'user' | 'model', text: string}[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: "Sen DentaAI diş kliniğinin yardımsever ve profesyonel sanal asistanısın. Kullanıcıların randevu, fiyatlar ve genel diş sağlığı sorularını yanıtla. Tıbbi teşhis koyma, sadece genel bilgi ver ve gerekirse randevuya yönlendir. Türkçe konuş."
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Üzgünüm, şu anda bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.";
  }
};
