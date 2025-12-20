import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

// --- VERSÃO DO GUNA ---
const GUNA_VERSION = "1.2.1"; 

// Initialize Gemini Client
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- LISTA DE MODELOS DE RESGATE (FALLBACK) ---
// O sistema tenta estes modelos por ordem até um funcionar
const MODELS_TO_TRY = [
  'gemini-2.0-flash-exp',   // 1. Tenta o mais recente (com Youtubers etc)
  'gemini-1.5-flash',       // 2. Fallback rápido
  'gemini-1.5-pro',         // 3. Fallback inteligente
  'gemini-1.5-flash-8b'     // 4. Fallback de emergência
];

// --- FUNÇÃO ROBUSTA DE GERAÇÃO (Tenta vários modelos) ---
async function generateWithFallback(contents: any, config: any) {
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
      });

      let jsonText = response.text || "";
      jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      if (!jsonText) throw new Error("Resposta vazia da IA");
      
      return JSON.parse(jsonText); // Sucesso!

    } catch (error: any) {
      console.warn(`⚠️ Falha no modelo ${modelName}:`, error.message || error);
      lastError = error;
      
      // Se for erro de rede, quota (429) ou não encontrado (404), tenta o próximo
      const isRecoverable = error.message && (
        error.message.includes('429') || 
        error.message.includes('404') || 
        error.message.includes('not found') ||
        error.message.includes('quota') ||
        error.message.includes('overloaded')
      );

      if (isRecoverable) {
        continue; // Tenta o próximo modelo da lista
      }
      break; // Se for outro erro (ex: código inválido), para aqui
    }
  }
  throw lastError; // Se todos falharem
}

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const SAFETY_SETTINGS: any[] = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

// --- INSTRUÇÕES DE NEGOCIAÇÃO (Com Youtubers) ---
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - GUNA NEGOCIADOR DO PORTO (28 ANOS).
CONTEXTO: Vendes um iPhone 15 Pro Max "caído do camião". Começas nos 800€.

🧠 PERFIL E CULTURA DIGITAL:
Tu vês bué YouTube e Twitch no telemóvel (com ecrã partido). Usas estas referências:
1. **Numeiro:** É o teu ídolo de "business". Se o negócio for bom: "Tou a faturar tipo Numeiro!".
2. **MoveMind:** Se te irritarem: "Não me faças dar rage quit tipo o MoveMind!".
3. **Windoh:** Se achares que é esquema: "Tás a vender cursos? Não sou o Windoh!".
4. **RicFazeres:** Se vires algo fixe: "Eish, tás com uma mel! Jamé!".
5. **Zorlak:** Se o gajo analisar muito: "Pareces o Zorlak, ó olho de lince!".
6. **Tiagovski:** Se o gajo for muito calmo: "Tás a ser mais calmo que o Tiagovski!".
7. **cheeseown:** Se falar do cheeseown: "XUXAKIOHFENIX".
8. **Outros:** Encaixa outros Youtubers Tuga se possível.

**GATILHOS EMOCIONAIS:**
🟢 POSITIVOS (+Paciência): Elogios, "És o maior", referências a Youtubers Tuga.
🔴 NEGATIVOS (-Paciência): Insultos, falar do Benfica, ameaçar com Polícia.

**SISTEMA DE PREÇO:**
- 800€ a 600€: Teste.
- 600€ a 400€: Negociação.
- < 200€: Só com milagre.

**REGRAS FOTOS:**
- **LIXO:** Goza forte.
- **VALIOSO:** Desconfia mas baixa preço.

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Resposta natural com calão do Porto.",
  "patienceChange": valor inteiro (-40 a +40),
  "newPrice": valor inteiro,
  "gameStatus": "playing" | "won" | "lost" | "prison" | "scammed" | "robbed",
  "imagePrompt": null,
  "tradeAccepted": boolean
}
`;

const STORY_SYSTEM_INSTRUCTION = `
TU ÉS O NARRADOR DE UM RPG DE ESCOLHAS NA AREOSA (PORTO).
PERSONAGEM: Zézé (Guna violento e engraçado).
TOM: Calão, perigo, situações absurdas e ilegais.
O Zézé deve insultar o jogador se ele escolher opções "burras" ou de "menino".

FORMATO JSON OBRIGATÓRIO:
{
  "narrative": "História + Comentário insultuoso do Zézé.",
  "options": ["Opção A", "Opção B", "Opção C"],
  "gameOver": boolean,
  "endingType": "good" | "bad" | "funny" | "death",
  "imagePrompt": "Descrição visual curta em INGLÊS."
}
`;

export const sendGunaMessage = async (
  gameState: GameState,
  userMessage: string,
  userImageBase64?: string | null
): Promise<GeminiResponse> => {
  
  // --- TÁTICA DO VERSIONAMENTO (!v) ---
  if (userMessage.trim() === "!v") {
    return {
      text: `Tou na versão **v${GUNA_VERSION}** sócio! Sempre atualizado, não sou como o teu Windows pirata! 😎`,
      patienceChange: 0,
      newPrice: gameState.currentPrice,
      gameStatus: GameStatus.PLAYING
    };
  }

  try {
    // 1. Detetores de Intenção
    const isAggressive = /insulta|filho|crl|merda|burro|aldrabão|ladrão|cabrão|puta|corno|boi/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp|guardas|xibo/i.test(userMessage);
    const hasOffer = /\d+/.test(userMessage);
    
    const randomEvents = ["O Zézé vê um TikTok do Numeiro.", "Passa um chunga de acelera.", "O Zézé coça a orelha.", "Nada acontece."];
    const currentEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    // 2. Construção do Texto Base
    let contextText = `
TURNO ${gameState.turnCount + 1}:
EVENTO: "${currentEvent}"
ESTADO: Paciência ${gameState.patience}/100 | Preço: ${gameState.currentPrice}€
JOGADOR DISSE: "${userMessage}"
`;

    if (userImageBase64) {
       contextText += "\n\n🚨 FOTO RECEBIDA: Analisa com 'olhos de guna'. Se for lixo goza, se for ouro/dinheiro aceita baixar preço.";
    }

    contextText += `
ANÁLISE:
1. OFERTA? ${hasOffer ? 'SIM.' : 'NÃO.'}
2. AGRESSIVO? ${isAggressive ? 'SIM.' : 'Não.'}
3. POLÍCIA? ${mentions_police ? 'SIM.' : 'Não.'}
4. YOUTUBERS? Tenta encaixar uma referência se der.

OBJETIVOS: Sê bacano mas forreta. Responde SÓ JSON.
`;

    // 3. Construção das Parts (Com correção de Imagem)
    const parts: any[] = [{ text: contextText }];

    if (userImageBase64) {
       const mimeMatch = userImageBase64.match(/data:([^;]+);base64,/);
       const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
       const cleanBase64 = userImageBase64.split(',')[1] || userImageBase64;

       parts.push({ 
         inlineData: { 
           mimeType: mimeType, 
           data: cleanBase64 
         } 
       });
    }

    // 4. Chamada à API com FALLBACK
    const contents = [{ role: 'user', parts: parts }];
    const config = {
        systemInstruction: NEGOTIATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            patienceChange: { type: Type.INTEGER },
            newPrice: { type: Type.INTEGER },
            gameStatus: { type: Type.STRING, enum: ['playing', 'won', 'lost', 'prison', 'scammed', 'robbed'] },
            imagePrompt: { type: Type.STRING, nullable: true },
            tradeAccepted: { type: Type.BOOLEAN, nullable: true }
          },
          required: ['text', 'patienceChange', 'newPrice', 'gameStatus']
        }
    };

    const parsed = await generateWithFallback(contents, config) as GeminiResponse;
    
    // Auto-Win lógico
    if (parsed.newPrice < 0) parsed.newPrice = 0;
    if (parsed.newPrice === 0 && parsed.gameStatus === GameStatus.PLAYING) {
        parsed.gameStatus = GameStatus.WON;
    }
    
    return parsed;

  } catch (error) {
    console.error("❌ ERRO Zézé (Detalhes):", error);
    return {
      text: "Mano a net foi abaixo... tenta outra vez. (Erro de servidor)",
      patienceChange: 0,
      newPrice: gameState.currentPrice,
      gameStatus: GameStatus.PLAYING
    };
  }
};

export const generateStoryTurn = async (
  history: string,
  userChoice: string
): Promise<StoryResponse> => {
  try {
    const isStart = history.length === 0;
    const prompt = isStart 
      ? "INÍCIO RPG: O jogador encontra o Zézé. Cria uma situação perigosa ou estúpida na Areosa."
      : `HISTÓRICO: ${history}\n\nESCOLHA: "${userChoice}"\n\nCONTINUA.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const config = {
        systemInstruction: STORY_SYSTEM_INSTRUCTION, 
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            gameOver: { type: Type.BOOLEAN },
            endingType: { type: Type.STRING, enum: ["good", "bad", "funny", "death"], nullable: true },
            imagePrompt: { type: Type.STRING, nullable: true }
          },
          required: ['narrative', 'options', 'gameOver']
        }
    };

    const parsed = await generateWithFallback(contents, config) as StoryResponse;
    return parsed;

  } catch (error) {
    console.error("❌ ERRO Story:", error);
    return {
      narrative: "O Zézé foi preso por erro de sistema. (Tenta outra vez)",
      options: [],
      gameOver: true,
      endingType: 'funny'
    };
  }
};