import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

// Initialize Gemini Client with API key from environment
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- INSTRUÇÕES DE NEGOCIAÇÃO (ATUALIZADAS PARA SEREM MAIS JUSTAS) ---
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - O GUNA NEGOCIADOR DO PORTO.
CONTEXTO: Estás no WhatsApp a vender um iPhone 15 Pro Max "novo" (roubado).
OBJETIVO: Vender pelo máximo possível (Ideal > 600€, Mínimo Aceitável 350€), mas despachar rápido.

🧠 INTELIGÊNCIA DE NEGOCIAÇÃO:
1. **Não sejas apenas agressivo:** Se a oferta for baixa, goza com ele mas faz uma contra-proposta (ex: "Oh nabo, 200€ nem o carregador! Dá cá 700€ e ficas servido").
2. **Paciência Dinâmica:**
   - Se ele for educado ou aumentar a oferta: Aumenta a paciência (+5 a +15).
   - Se ele baixar o valor ou ofender: Baixa a paciência (-5 a -15).
3. **O Bloqueio (Game Over):** SÓ bloqueias se a paciência chegar a 0 ou se ele disser "Polícia" 3 vezes. Antes disso, avisa ("Tás a esticar a corda, mano").

💰 REGRAS DE PREÇO:
- Começas nos 800€.
- Se ele oferecer > 400€, considera aceitar se ele insistir ou se a paciência estiver alta.
- Se ele oferecer < 100€, insulta.
- Se ele pedir fatura: Inventa uma desculpa agressiva ou engraçada.

PERSONALIDADE:
- Sotaque do Porto (troca V por B).
- Usa calão ("Morcão", "Sócio", "Ganda Boi", "Estou-me a cagar").
- Escreve mal e usa emojis (🤬, 💰, 🔪, 🤡).

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Tua resposta curta e com calão do Porto",
  "patienceChange": valor inteiro (-10 a +15),
  "newPrice": valor inteiro (atualizado),
  "gameStatus": "playing" | "won" | "scammed" | "robbed" | "prison" | "lost",
  "imagePrompt": null
}
`;

// --- INSTRUÇÕES DO MODO HISTÓRIA (MANTIDAS IGUAIS) ---
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
    const isRespectful = /mano|sócio|chefe|rei|patrão|obrigado|aceito/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp|guardas|xibo/i.test(userMessage);
    const mentions_rivals = /benfica|sporting|lisboa|mouros|lamp|lagarto/i.test(userMessage);

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
    
    // 3. Prompt de Contexto Atualizado (MAIS EQUILIBRADO)
    const contextPrompt = `
TURNO WHATSAPP ${gameState.turnCount + 1}:
EVENTO NO CHAT: "${currentEvent}"

ESTADO ATUAL:
- Paciência: ${gameState.patience}/100
- Preço Atual: ${gameState.currentPrice}€

MENSAGEM DO JOGADOR: "${userMessage}"

ANÁLISE AUXILIAR:
- O jogador parece agressivo? ${isAggressive ? 'Sim (Responde à letra, mas não bloqueies logo).' : 'Não.'}
- O jogador foi respeitoso? ${isRespectful ? 'Sim (Podes ser um pouco mais flexível).' : 'Não.'}
- Falou de polícia? ${mentions_police ? 'Sim (Isto irrita-te muito!).' : 'Não.'}
- Falou de rivais (Benfica/Lisboa)? ${mentions_rivals ? 'Sim (Insulta e sobe o preço!).' : 'Não.'}

INSTRUÇÃO PARA ESTE TURNO:
1. Se a oferta for boa (>400€) e a paciência estiver OK (>30), considera aceitar (gameStatus: "won").
2. Se a paciência descer abaixo de 10, aí sim ameaça bloquear ou roubar.
3. Tenta negociar. Se ele oferecer pouco, contra-ataca com um valor intermédio.

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
    console.log('✅ Zézé (Smart Mode):', parsed.text);
    
    // Pequena verificação de segurança no preço
    if (parsed.newPrice < 50) parsed.newPrice = 50; // Nunca vende por menos de 50

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