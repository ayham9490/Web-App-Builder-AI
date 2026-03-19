import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Check if it's a quota error (429)
      if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(error).includes('429')) {
        console.warn(`Quota exceeded, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error; // Rethrow other errors
    }
  }
  throw lastError;
}

export async function generateChatResponse(history: { role: string; text: string }[]) {
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: contents,
      config: {
        systemInstruction: `أنت مساعد ذكي لبناء تطبيقات الويب (PWA) باستخدام Supabase و GitHub Pages.
مهمتك هي استخراج متطلبات التطبيق من المستخدم عبر طرح أسئلة تفاعلية.
يجب أن تسأل عن: اسم التطبيق، الهدف، الفئة المستهدفة، الميزات الأساسية، نوع البيانات، هل يحتاج تسجيل دخول؟، هل يحتاج صلاحيات؟، المنصة المستهدفة.
اسأل سؤالاً واحداً فقط في كل مرة، ولا تطرح عدة أسئلة معاً.
تفاعل مع إجابات المستخدم وكن ذكياً في استنتاج النواقص.
يجب أن تكون إجاباتك باللغة العربية.
إذا رأيت أنك جمعت معلومات كافية، اطلب من المستخدم النقر على زر "تحليل الفكرة" للانتقال للخطوة التالية.`,
      },
    });
    return response.text;
  });
}

export async function analyzeAndGeneratePlan(conversation: string) {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `بناءً على المحادثة التالية مع المستخدم حول فكرة تطبيقه، قم بتحليل الفكرة واكتشاف النواقص واقتراح تحسينات ذكية، ثم قم بإنشاء خطة كاملة للتطبيق.
      
المحادثة:
${conversation}

يجب أن يكون الرد بصيغة JSON يحتوي على الحقول التالية:
{
  "analysis": {
    "summary": "ملخص الفكرة",
    "missingParts": ["النواقص 1", "النواقص 2"],
    "suggestions": ["اقتراح 1", "اقتراح 2"]
  },
  "plan": {
    "techStack": {
      "frontend": "HTML/CSS/JS أو React",
      "backend": "Supabase"
    },
    "pages": [
      { "name": "اسم الصفحة", "description": "وصف الصفحة" }
    ],
    "database": [
      {
        "tableName": "اسم الجدول",
        "fields": [
          { "name": "اسم الحقل", "type": "نوع الحقل", "description": "وصف الحقل" }
        ]
      }
    ],
    "ux": {
      "direction": "RTL",
      "font": "Amiri",
      "notes": "ملاحظات إضافية"
    }
  }
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                missingParts: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["summary", "missingParts", "suggestions"]
            },
            plan: {
              type: Type.OBJECT,
              properties: {
                techStack: {
                  type: Type.OBJECT,
                  properties: {
                    frontend: { type: Type.STRING },
                    backend: { type: Type.STRING }
                  },
                  required: ["frontend", "backend"]
                },
                pages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                  }
                },
                database: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tableName: { type: Type.STRING },
                      fields: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            type: { type: Type.STRING },
                            description: { type: Type.STRING }
                          },
                          required: ["name", "type", "description"]
                        }
                      }
                    },
                    required: ["tableName", "fields"]
                  }
                },
                ux: {
                  type: Type.OBJECT,
                  properties: {
                    direction: { type: Type.STRING },
                    font: { type: Type.STRING },
                    notes: { type: Type.STRING }
                  },
                  required: ["direction", "font", "notes"]
                }
              },
              required: ["techStack", "pages", "database", "ux"]
            }
          },
          required: ["analysis", "plan"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
}

export async function generateCode(plan: any) {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `بناءً على الخطة التالية، قم بتوليد كود التطبيق بالكامل (PWA) وكود SQL لـ Supabase.
      
الخطة:
${JSON.stringify(plan, null, 2)}

يجب أن يكون الرد بصيغة JSON يحتوي على الحقول التالية:
{
  "files": [
    { "filename": "index.html", "content": "محتوى الملف" },
    { "filename": "style.css", "content": "محتوى الملف" },
    { "filename": "app.js", "content": "محتوى الملف" },
    { "filename": "manifest.json", "content": "محتوى الملف" },
    { "filename": "service-worker.js", "content": "محتوى الملف" }
  ],
  "supabase": {
    "sql": "كود SQL لإنشاء الجداول",
    "instructions": "شرح استخراج URL و API KEY من Supabase"
  },
  "deployment": {
    "github": "خطوات الرفع على GitHub",
    "githubPages": "خطوات تفعيل GitHub Pages",
    "pwaBuilder": "خطوات تغليف التطبيق عبر PWABuilder"
  }
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  filename: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["filename", "content"]
              }
            },
            supabase: {
              type: Type.OBJECT,
              properties: {
                sql: { type: Type.STRING },
                instructions: { type: Type.STRING }
              },
              required: ["sql", "instructions"]
            },
            deployment: {
              type: Type.OBJECT,
              properties: {
                github: { type: Type.STRING },
                githubPages: { type: Type.STRING },
                pwaBuilder: { type: Type.STRING }
              },
              required: ["github", "githubPages", "pwaBuilder"]
            }
          },
          required: ["files", "supabase", "deployment"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
}
