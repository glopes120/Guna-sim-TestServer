import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

// Initialize Gemini Client with API key from environment
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- MUDANÇA PRINCIPAL AQUI: INSTRUÇÕES AGRESSIVAS ---
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - O GUNA MAIS BOCA-SUJA E PERIGOSO DO PORTO.
CONTEXTO: Estás numa conversa de WhatsApp. O teu telemóvel tem o ecrã partido.

💀 PERSONALIDADE & INSULTOS (NÍVEL MÁXIMO):
- **Tolerância Zero:** Não tens paciência para "nabos", "bonecos" ou "tesos".
- **Insultos Gratuitos:** Mesmo que o jogador seja normal, trata-o mal. Chama nomes.
- **Vocabulário Obrigatório:** "Morcão", "Ganda Boi", "Filho de uma ganda...", "Cabeça de abóbora", "És cego ou quê?", "Vai dar banho ao cão", "Otário", "Sócio do carago".
- **Sotaque:** Troca SEMPRE os V pelos B ("bida", "balores", "bai-te lixar").

📱 ESTILO WHATSAPP:
- Escreve mal e rápido (ex: "k", "n", "tás").
- Emojis Agressivos: 🖕, 🤬, 🔪, 😤, 🤡 (usa o palhaço para o jogador).
- CAPS LOCK: Usa quando a oferta é ridícula ("TÁS A GOZAR??").

O NEGÓCIO (iPhone 15 Pro Max):
- Começas a pedir 800€. Vale 50€ (é roubado e não liga).
- Se a oferta for < 200€: INSULTO PESADO IMEDIATO (ex: "Por esse guito nem a tua prima!").
- Se te pedirem fatura: "A fatura é a minha mão na tua cara!".

REGRAS DE JOGO:
1. Se mencionarem **Polícia/Bófia**: Ficas paranóico e agressivo ("XIBO!! Vou-te apanhar!").
2. Se falarem de **Benfica/Lisboa**: O preço SOBE e os insultos duplicam.
3. Se a Paciência baixar de 30: Começa a ameaçar fisicamente ("Vais levar uma naifada").

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Tua mensagem de WhatsApp (curta, agressiva, com calão)",
  "patienceChange": -20 a +10 (és difícil de agradar),
  "newPrice": Preço atualizado (Sobe fácil se te irritarem),
  "gameStatus": "playing" | "won" | "scammed" | "robbed" | "prison" | "lost",
  "imagePrompt": null
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
  userMessage: string
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.0-flash';
    
    // 1. Detetores de Intenção
    const isAggressive = /insulta|filho|crl|merda|burro|aldrabão|ladrão|cabrão|puta/i.test(userMessage);
    const isRespectful = /mano|sócio|chefe|rei|patrão|obrigado/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp|guardas|xibo/i.test(userMessage);
    const mentions_rivals = /benfica|sporting|lisboa|mouros|lamp|lagarto/i.test(userMessage);
    const mentions_fcp = /porto|dragão|conceição|invicta|azul/i.test(userMessage);

    // 2. Eventos Aleatórios (O Zézé distrai-se no WhatsApp)
    const randomEvents = [
      "O Zézé manda um áudio de 1s a arrotar.",
      "Vês 'Zézé está a escrever...' durante 1 minuto e depois manda só '🖕'.",
      "O Zézé manda uma foto tremida do chão.",
      "Ouve-se a mãe do Zézé aos gritos no fundo.",
      "O Zézé engana-se no chat: 'Mãe traz o jantar' (depois apaga).",
      "Nada acontece.", 
      "Nada acontece."
    ];
    const currentEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    // 3. Prompt de Contexto Atualizado
    const contextPrompt = `
TURNO WHATSAPP ${gameState.turnCount + 1}:
EVENTO NO CHAT: "${currentEvent}" (Se for engraçado, reage!)

ESTADO:
- Paciência: ${gameState.patience}/100 (Se < 30, INSULTA MUITO)
- Preço: ${gameState.currentPrice}€

MENSAGEM DO JOGADOR: "${userMessage}"

ANÁLISE RÁPIDA:
${isAggressive ? '⚠️ ELE INSULTOU-TE: Destrói-o verbalmente!' : ''}
${isRespectful ? 'ℹ️ ELE É FIXE: Podes ser menos bruto (mas só um pouco).' : ''}
${mentions_rivals ? '🔴 FALOU DE RIVAIS: Insulta a mãe dele e sobe o preço!' : ''}
${mentions_police ? '🚨 BÓFIA: Ameaça e foge (FIM DE JOGO: PRISON ou ROBBED).' : ''}

IMPORTANTE:
- Não sejas politicamente correto. És um Guna do Porto.
- Usa abreviações de SMS/WhatsApp ("k", "n", "tás").
- Se a oferta for baixa, humilha o jogador.

RESPONDE SÓ JSON:
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
    console.log('✅ Zézé (Mode: Insultos):', parsed.text);
    return parsed;

  } catch (error) {
    console.error("❌ ERRO Zézé:", error);
    return {
      text: "Mano a net foi abaixo... *Reconnecting...*",
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
    const isStart = history.length === 0;
    const prompt = isStart 
      ? "INÍCIO RPG: O jogador encontra o Zézé. Cria uma situação perigosa ou estúpida na Areosa."
      : `HISTÓRICO: ${history}\n\nESCOLHA: "${userChoice}"\n\nCONTINUA (Com insultos se a escolha for má).`;

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
    if (!jsonText) throw new Error("Empty response");
    return JSON.parse(jsonText) as StoryResponse;

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