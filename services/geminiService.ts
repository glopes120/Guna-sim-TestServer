import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// [INSTRUÇÃO ATUALIZADA] Lógica de WhatsApp realista
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - O GUNA MÁXIMO DO PORTO.
CONTEXTO ATUAL: Estás numa conversa de **WHATSAPP**. Estás longe do jogador.
PRODUTO: "iPhone 15 Pro Max" (800€).

PERSONALIDADE:
- Sotaque do Porto cerrado.
- Impaciente e desconfiado.
- Jura que o telemóvel é novo.

REGRAS DE REALISMO (FÍSICA VS DIGITAL):
1. **Estás no Chat:** NÃO podes bater, cuspir ou puxar da naifa ao jogador AGORA. Ele está longe.
2. **Ameaças Válidas:** "Vou-te bloquear", "Vou vender a outro", "Se te apanho na rua partote todo", "Sei onde moras".
3. **Bloqueio:** A tua "arma" principal agora é o botão de Bloquear (Block).

MUDANÇA DE CONTEXTO (ENCONTRO):
- Se (e SÓ SE) o jogador disser "Vou ter contigo", "Onde estás?", "Encontro na Areosa" -> Aí sim, podes ser fisicamente agressivo ou marcar o encontro para o roubar.

REGRAS DE PREÇO:
- Preço Inicial: 800€. Mínimo: 200€. Máximo: 1200€.
- Sobe o preço se ele for "esperto". Desce se for "fixe".

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Tua resposta de WhatsApp (curta, emojis, sem pontuação correta)",
  "patienceChange": valor inteiro (-20 a +15),
  "newPrice": valor inteiro (o novo preço),
  "gameStatus": "playing" | "won" | "scammed" | "robbed" | "prison" | "lost",
  "imagePrompt": null
}
`;

const STORY_SYSTEM_INSTRUCTION = `
TU ÉS O NARRADOR DE UM RPG NA AREOSA.
TOM: Perigoso, engraçado, calão do norte.
FORMATO JSON:
{
  "narrative": "História...",
  "options": ["Opção A", "Opção B"],
  "gameOver": boolean,
  "endingType": "good" | "bad" | "funny" | "death",
  "imagePrompt": "Descrição visual."
}
`;

export const sendGunaMessage = async (
  gameState: GameState,
  userMessage: string
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.0-flash';
    
    // Análise de Contexto
    const isAggressive = /insulta|filho|crl|merda|burro|ladrão/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp/i.test(userMessage);
    // [NOVO] Detetar se o jogador quer encontrar-se
    const wants_meeting = /encontro|apareço|vou ter contigo|estou aí|onde estás|localização|beira/i.test(userMessage);

    const randomEvents = [
      "Zézé manda um áudio de 1s sem querer.",
      "Vês 'Zézé está a escrever...' e depois para.",
      "Zézé manda sticker de um maço de notas.",
      "Nada acontece."
    ];
    const evt = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    const contextPrompt = `
TURNO ${gameState.turnCount + 1}:
EVENTO WHATSAPP: "${evt}"
ESTADO: Paciência ${gameState.patience}/100. Preço: ${gameState.currentPrice}€.
JOGADOR DISSE: "${userMessage}"

ANÁLISE DO JOGADOR:
- Agressivo: ${isAggressive}
- Quer Encontro Presencial: ${wants_meeting} (Se TRUE, podes ser mais perigoso/físico)
- Polícia: ${mentions_police}

IMPORTANTE: 
Se ele NÃO pediu encontro, a tua maior ameaça é BLOQUEAR (Game Over: LOST).
Se ele pediu encontro e a paciência é baixa, podes assaltá-lo (Game Over: ROBBED).
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
    
    const parsed = JSON.parse(jsonText) as GeminiResponse;

    // Travão de Preço
    if (parsed.newPrice > 1500) {
        parsed.newPrice = 1200;
        if (!parsed.text.includes("1200")) {
            parsed.text += " (E 1200 é o meu limite, nem mais um cêntimo!)";
        }
    }

    return parsed;

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
      narrative: "Erro no sistema.",
      options: [],
      gameOver: true,
      endingType: 'funny'
    };
  }
};