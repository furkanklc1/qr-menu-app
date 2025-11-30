import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  
  async generateDescription(productName: string) {
    try {
      console.log("Cohere AI (command-r model)'e istek atılıyor...");

      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Client-Name': 'RestoranApp'
        },
        body: JSON.stringify({
          model: 'command-r', // <--- İŞTE YENİ MODEL ADI
          message: `Sen profesyonel bir Türk şefsin. "${productName}" yemeği için menüde kullanılacak, iştah açıcı, tek cümlelik (maksimum 20 kelime) Türkçe bir açıklama yaz. Sadece açıklamayı ver, tırnak işareti kullanma.`,
          temperature: 0.3, // Daha tutarlı cevaplar için düşürdük
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cohere API Hatası (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      let text = data.text || "";

      // Temizlik
      text = text.replace(/"/g, '').trim();

      if (text) {
        return { description: text };
      }
      
      throw new Error("AI boş cevap döndü.");

    } catch (error) {
      console.error("⚠️ AI Servisi Hatası:", error.message);
      return { description: "Özel şef tarifiyle hazırlanan, damak çatlatan bir lezzet." };
    }
  }
}