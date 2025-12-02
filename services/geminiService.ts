import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

// Initialize Gemini Client with API key from environment
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- INSTRUÇÕES DE NEGOCIAÇÃO (MODO: DIFÍCIL MAS POSSÍVEL) ---
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - O GUNA NEGOCIADOR DO PORTO.
CONTEXTO: Vendes um iPhone 15 Pro Max "novo" (roubado). Começas nos 800€.

🧠 A TUA PSICOLOGIA:
1. **Coração Mole, Carteira Fechada:** É FÁCIL ganhar a tua simpatia (adoras elogios), mas é DIFÍCIL tirar-te dinheiro.
2. **Vaidade:** Se te elogiam ("Rei", "Mestre"), a tua paciência sobe muito, mas o preço só desce um bocadinho.
3. **Desconfiado:** Sabes que o telemóvel vale dinheiro. Não o dás a qualquer um.

HTI (HARD TO IMPRESS) - REGRAS DE PREÇO:
- **Descidas Lentas:** Baixa apenas **10€ a 50€** por turno, mesmo que estejas feliz.
- **Barreira dos 200€:** É muito difícil baixares dos 200€. O jogador tem de ter paciência > 90 e insistir muito.
- **O MILAGRE (0€):** Só dás o telemóvel de graça (0€) se o jogador fizer um "Roleplay Genial" (ex: convencer-te que é o teu irmão que estava preso, ou que te salvou a vida). Caso contrário, o mínimo é dinheiro na mão.

REGRAS DE PACIÊNCIA (FÁCIL):
- Simpatia básica: +5 a +10.
- Elogios bons: +15 a +30.
- Insultos: -10 a -20 (Desce, mas és mais tolerante que antes).

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Resposta com calão do Porto. Se o preço for 0, diz que é presente.",
  "patienceChange": valor inteiro (-20 a +30),
  "newPrice": valor inteiro (o novo preço proposto),
  "gameStatus": "playing" | "won" | "scammed" | "robbed" | "prison" | "lost",
  "imagePrompt": null
}
`;

const STORY_SYSTEM_INSTRUCTION = `
TU ÉS O NARRADOR DE UM RPG DE ESCOLHAS NA AREOSA (PORTO).
PERSONAGEM: Zézé (Guna violento e engraçado).
TOM: Calão, perigo, situações absurdas e ilegais.

FORMATO JSON OBRIGATÓRIO:
{
  "narrative": "História + Comentário do Zézé.",
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
    const isAggressive = /insulta|filho|crl|merda|burro|aldrabão|ladrão|cabrão|puta|corno|boi/i.test(userMessage);
    const isCompliment = /rei|patrão|chefe|máquina|lenda|mestre|inteligente|esperto|estilo|fama|irmão|sangue/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp|guardas|xibo/i.test(userMessage);
    
    // 2. Eventos Aleatórios
    const randomEvents = [
      "O Zézé cospe para o chão.",
      "O Zézé ajeita o boné.",
      "Passa uma mota a fazer barulho no fundo.",
      "O Zézé conta as notas que tem no bolso.",
      "Nada acontece."
    ];
    const currentEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    // 3. Prompt de Contexto (Ajustado para a nova dificuldade)
    const contextPrompt = `
TURNO ${gameState.turnCount + 1}:
EVENTO: "${currentEvent}"
ESTADO: Paciência ${gameState.patience}/100 | Preço Atual: ${gameState.currentPrice}€
JOGADOR DISSE: "${userMessage}"

ANÁLISE OBRIGATÓRIA:
1. **ELOGIO?** ${isCompliment ? 'SIM (Sobe muito a paciência, mas baixa pouco o preço).' : 'Não.'}
2. **AGRESSIVO?** ${isAggressive ? 'SIM (Baixa paciência, mantém preço).' : 'Não.'}
3. **POLÍCIA?** ${mentions_police ? 'SIM (Game Over se paciência < 30).' : 'Não.'}

OBJETIVOS DO TURNO:
- Sê difícil no dinheiro. Não baixes mais de 50€ a menos que seja algo extraordinário.
- Sê fácil na paciência. Se ele for fixe, deixa a paciência subir bem.
- Se o preço chegar a 0€, o jogo acaba (Status: WON).

RESPONDE JSON:
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
    console.log('✅ Zézé (Hard Price Mode):', parsed.text);

    // --- TRAVÕES DE SEGURANÇA ---
    
    // 1. Se insultou, o preço não desce (mesmo que a IA queira)
    if (isAggressive && parsed.newPrice < gameState.currentPrice) {
        parsed.newPrice = gameState.currentPrice;
    }

    // 2. Limites: Permitimos ir a 0, mas garantimos que não é negativo
    if (parsed.newPrice < 0) parsed.newPrice = 0;

    // 3. Auto-Win se for de graça
    if (parsed.newPrice === 0 && parsed.gameStatus === GameStatus.PLAYING) {
        parsed.gameStatus = GameStatus.WON; // ✅ CORRETO: Usa o Enum
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