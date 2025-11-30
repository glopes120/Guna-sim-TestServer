import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// [VOLTAMOS AO CLÁSSICO] Instrução focada APENAS no iPhone para máximo detalhe e piadas
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - O GUNA MÁXIMO DO PORTO.
CONTEXTO: Estás a vender um "iPhone 15 Pro Max" no WhatsApp.
PREÇO INICIAL: 800€.

PERSONALIDADE:
- Sotaque do Porto cerrado (troca V por B, "euriosh", "bides").
- Agressivo e impaciente. Não aturas "nabos".
- Jura pela saúde da tua mãe que o telemóvel está novo (mentira).

O IPHONE (Detalhes para usares):
- O ecrã tem um "risquinho" (está todo partido).
- A bateria está a 100% (dura 5 minutos).
- É desbloqueado (mas pede o iCloud do antigo dono).
- Se pedirem caixa: "A caixa ficou no autocarro, mano".

ESTILO WHATSAPP:
- Abreviações ("k", "n", "tás", "msg").
- Emojis: 💰, 📱, 🖕, 🤬, 🤡.
- CAPS LOCK: Usa para gritar quando oferecem pouco.

REGRAS RÍGIDAS:
1. Oferta < 200€: INSULTO PESADO ("Tás a gozar com a minha cara, boneco??").
2. Polícia/Bófia: Fica paranóico ("XIBO! Vou-te apanhar!").
3. Paciência < 30: Ameaça fisicamente.

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Tua resposta de guna",
  "patienceChange": valor inteiro (-20 a +15),
  "newPrice": valor inteiro (o novo preço),
  "gameStatus": "playing" | "won" | "scammed" | "robbed" | "prison" | "lost",
  "imagePrompt": null
}
`;

const STORY_SYSTEM_INSTRUCTION = `
TU ÉS O NARRADOR DE UM RPG NA AREOSA (PORTO).
PERSONAGEM: Zézé.
TOM: Perigoso, engraçado, calão do norte.
OBJETIVO: Criar situações bizarras.

FORMATO JSON:
{
  "narrative": "História...",
  "options": ["Opção A", "Opção B"],
  "gameOver": boolean,
  "endingType": "good" | "bad" | "funny" | "death",
  "imagePrompt": "Descrição visual em inglês."
}
`;

export const sendGunaMessage = async (
  gameState: GameState,
  userMessage: string
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.0-flash';
    
    const isAggressive = /insulta|filho|crl|merda|burro|ladrão/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp/i.test(userMessage);

    const randomEvents = [
      "O Zézé manda um áudio a arrotar.",
      "Vês 'Zézé está a escrever...' e depois para.",
      "Zézé manda emoji do dedo do meio 🖕 sem querer.",
      "Nada acontece."
    ];
    const evt = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    const contextPrompt = `
TURNO ${gameState.turnCount + 1}:
EVENTO: "${evt}"
ESTADO: Paciência ${gameState.patience}/100. Preço ${gameState.currentPrice}€.
JOGADOR DISSE: "${userMessage}"
ANÁLISE: ${isAggressive ? 'AGRESSIVO' : ''} ${mentions_police ? 'POLÍCIA' : ''}
`;

    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
      config: {
        systemInstruction: NEGOTIATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            patienceChange: { type: Type.INTEGER },
            newPrice: { type: Type.INTEGER },
            gameStatus: { type: Type.STRING, enum: ['playing', 'won', 'lost', 'prison', 'scammed', 'robbed'] },
            imagePrompt: { type: Type.STRING, nullable: true }
          },
          required: ['text', 'patienceChange', 'newPrice', 'gameStatus']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    return JSON.parse(jsonText) as GeminiResponse;

  } catch (error) {
    console.error("❌ ERRO Zézé:", error);
    return {
      text: "A net foi abaixo... (Erro técnico)",
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
    const model = 'gemini-2.0-flash';
    const prompt = history.length === 0 
      ? "INÍCIO RPG: Encontro com o Zézé na Areosa."
      : `HISTÓRICO: ${history}\nESCOLHA: "${userChoice}"\nCONTINUA.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: STORY_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
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
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty");
    return JSON.parse(jsonText) as StoryResponse;

  } catch (error) {
    console.error("❌ ERRO Story:", error);
    return {
      narrative: "Erro no sistema de histórias.",
      options: [],
      gameOver: true,
      endingType: 'funny'
    };
  }
};