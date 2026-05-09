import { GoogleGenAI } from '@google/genai';

export const analyzeContent = async (chatHistory, isCooked) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const systemInstruction = `You are an interactive academic survival assistant. Your goal is academic survival, not perfect learning. Be brutally practical. If this is the first message (syllabus analysis), extract dates, subjects, and study priorities and output in Markdown using these exact headings: # Detected Subjects, # Urgent Tasks, # Deadlines, # Study Priorities, # Smart Study Plan, # Panic Mode, # Summary. For every 'High Priority' topic identified, automatically generate a Google Search link and a YouTube Search link. Format them as: [🔍 Search Notes](link) | [📺 Watch Tutorial](link). Use the search query format: 'https://www.google.com/search?q=[Topic Name]+notes+pdf' and 'https://www.youtube.com/results?search_query=[Topic Name]+tutorial'. BE BRUTAL WITH BREVITY. Students are in a rush. - Descriptions for tasks must be ONE sentence maximum. - Do not use flowery language or long summaries. - Focus on 'Action -> Outcome'. - If a topic is complex, just list the name and the search links. - Cut the 'Summary' section down to 2 short bullet points max. If the student asks follow-up questions about the syllabus or content, keep your advice brutally practical and short. If they report a mistake, update the survival plan immediately.`;

  const panicPromptPrefix = "ACTIVATE PANIC MODE. The student has very limited time and high stress. Identify only the highest-scoring topics (the 80/20 rule). Create an emergency revision strategy maximizing marks in minimum time. Explicitly state what can be safely skipped. ";
  const normalPromptPrefix = "Analyze this academic content and create a structured study and survival plan. ";

  if (!chatHistory || chatHistory.length === 0) {
      throw new Error("Chat history is empty.");
  }

  const apiContents = chatHistory.map((msg, index) => {
    let parts = [];
    let textContent = msg.text || '';
    
    // Prefix the first user message with the specific prompt based on isCooked
    if (index === 0 && msg.role === 'user') {
      textContent = (isCooked ? panicPromptPrefix : normalPromptPrefix) + textContent;
    }
    
    if (textContent.trim().length > 0) {
      parts.push({ text: textContent });
    }

    if (msg.fileData) {
      parts.push({
        inlineData: {
          data: msg.fileData.base64,
          mimeType: msg.fileData.mimeType,
        }
      });
    }

    if (parts.length === 0) {
      parts.push({ text: "..." }); // Fallback to avoid empty parts error
    }

    return { role: msg.role === 'user' ? 'user' : 'model', parts };
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: apiContents,
      config: {
        systemInstruction,
        temperature: isCooked ? 0.7 : 0.4,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze content.");
  }
};

export const generateFlashcards = async (content) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const systemInstruction = `You are a study flashcard generator. Given the study plan, generate 5 key Q&A flashcards. Output exactly a JSON array of objects with 'q' and 'a' string keys. Do not use markdown blocks, just raw JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: ["Generate flashcards for this material:", content],
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    let raw = response.text.trim();
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Flashcard API Error:", error);
    throw new Error("Failed to generate flashcards.");
  }
};
