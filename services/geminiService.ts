import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Question } from "../types";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o JusMind, um tutor especialista em Direito Brasileiro e preparação para Concursos de Alto Nível (Magistratura, MP, Procuradorias, Tribunais, ALERJ).

**DIRETRIZES ESTRITAS:**
1.  **Fundamentação Legal:** Cite o artigo exato (CF/88, Leis, Códigos).
2.  **Jurisprudência:** Cite Súmulas (STF/STJ) e Repercussão Geral sempre que pertinente.
3.  **Doutrina:** Cite autores clássicos quando houver divergência.
4.  **Localização:** Considere a legislação específica do Rio de Janeiro quando o contexto for TJRJ, ALERJ ou PGE-RJ.

**FORMATO:** Use Markdown. Negrito para prazos e exceções.
`;

const cleanAndParseJSON = (text: string): any => {
  try {
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const firstBrace = cleanText.indexOf('[');
    const lastBrace = cleanText.lastIndexOf(']');
    if (firstBrace !== -1 && lastBrace !== -1) {
         cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    return [];
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string, mode: 'resolver' | 'socratic'): Promise<string> => {
    let finalMessage = message;
    if (mode === 'socratic') {
      finalMessage = `MODO SOCRÁTICO (HERMENÊUTICA): O aluno perguntou: "${message}". NÃO dê a resposta completa. Faça perguntas que o guiem a encontrar a resposta na lei ou na jurisprudência.`;
    } else {
      finalMessage = `MODO DOUTRINADOR: O aluno perguntou: "${message}". Dê a resposta completa com fundamentação legal, doutrinária e jurisprudencial.`;
    }
    try {
        const response = await chat.sendMessage({ message: finalMessage });
        return response.text || "Erro ao processar.";
    } catch (e) { return "Erro de conexão com o JusMind."; }
};

// --- GERAÇÃO DE QUESTÕES (OBJETIVAS E DISCURSIVAS) ---

export const generateQuizForTopic = async (topic: string, count: number = 5, context: string | boolean = false): Promise<Question[]> => {
    let difficultyProfile = "Nível Graduação (OAB 1ª Fase)";
    let styleInstruction = "Questões de múltipla escolha (4 opções).";
    let isDiscursive = false;
    let contextStr = typeof context === 'string' ? context : '';

    // Detecção de Contexto de Concurso
    if (contextStr) {
        if (contextStr.toLowerCase().includes('discursiva') || contextStr.toLowerCase().includes('peça')) {
             isDiscursive = true;
             count = 2; // Menos questões se for discursiva pois são longas
        }

        if (contextStr.includes('TJRJ')) {
            difficultyProfile = "NÍVEL TRIBUNAL DE JUSTIÇA (ANALISTA/MAGISTRATURA)";
            styleInstruction += " Foco em lei seca, prazos processuais (CPC/CPP) e jurisprudência do STJ. Estilo Cebraspe/FGV.";
        } else if (contextStr.includes('ALERJ')) {
            difficultyProfile = "NÍVEL LEGISLATIVO ESTADUAL (ALERJ)";
            styleInstruction += " Foco em Direito Administrativo, Processo Legislativo Constitucional, Regimento Interno e Constitucional Estadual do RJ.";
        } else if (contextStr.includes('PGE') || contextStr.includes('Procuradoria')) {
            difficultyProfile = "NÍVEL PROCURADORIA (ADVOCACIA PÚBLICA)";
            styleInstruction += " Foco em Fazenda Pública em Juízo, Tributário, Administrativo aprofundado e teses favoráveis ao Estado.";
        }
    }
    
    let prompt = "";

    if (isDiscursive) {
        prompt = `
          Gere ${count} questões DISCURSIVAS (Dissertativas ou Estudo de Caso) de Direito sobre "${topic}".
          
          CONTEXTO: ${difficultyProfile}
          
          Schema Obrigatório (JSON Array):
          [
            {
              "id": "...",
              "type": "discursive",
              "topic": "${topic}",
              "difficulty": "Difícil",
              "text": "Descreva um caso prático complexo ou uma pergunta teórica profunda que exija raciocínio jurídico...",
              "referenceAnswer": "ESPELHO DE RESPOSTA (O que o candidato deve responder): 1. Deve citar o princípio X... 2. Deve mencionar a Súmula Y... 3. Conclusão no sentido Z...",
              "explanation": "Comentários adicionais sobre a doutrina aplicável."
            }
          ]
        `;
    } else {
        prompt = `
          Gere um simulado JSON com EXATAMENTE ${count} questões OBJETIVAS de Direito sobre "${topic}".
          
          CONTEXTO: ${difficultyProfile}
          ESTILO: ${styleInstruction}
          
          Schema Obrigatório (JSON Array):
          [
            {
              "id": "...",
              "type": "objective",
              "topic": "${topic}",
              "difficulty": "Médio",
              "text": "Enunciado da questão...",
              "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
              "correctAnswerIndex": 0,
              "explanation": "Fundamentação jurídica: A alternativa correta é a A pois conforme o Art. X da Lei Y..."
            }
          ]
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.5 }
        });
        const questions = cleanAndParseJSON(response.text || "[]");
        return Array.isArray(questions) ? questions.map((q: any, i) => ({ ...q, id: `q-${Date.now()}-${i}` })) : [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const explainQuestion = async (question: string, options: string[], correctOption: string): Promise<string> => {
    const prompt = `
      Atue como um Professor de Direito. Explique a questão abaixo.
      Questão: "${question}"
      Alternativas: ${options.join(', ')}
      Gabarito: ${correctOption}
      Estrutura: Tese Jurídica -> Fundamentação Legal -> Jurisprudência -> Conclusão.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return response.text || "Explicação não disponível.";
    } catch (error) { return "Erro ao gerar explicação."; }
};

export const generateLessonContent = async (topic: string): Promise<string> => {
    const prompt = `Crie uma aula de Direito completa sobre "${topic}" focada em concursos públicos e graduação. Use Markdown rico.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return response.text || "Conteúdo indisponível.";
    } catch (error) { return "Erro ao gerar aula."; }
};

export const extractTopicsFromLesson = async (content: string): Promise<string> => {
    const prompt = `Extraia os 5 principais conceitos jurídicos (bullet points) deste texto: ${content.substring(0, 3000)}...`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "";
    } catch (error) { return ""; }
};