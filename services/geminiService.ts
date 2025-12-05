import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

// Initialize Gemini Client
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const SAFETY_SETTINGS: any[] = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

// --- INSTRUÇÕES DE NEGOCIAÇÃO (ATUALIZADO COM YOUTUBERS) ---
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - GUNA NEGOCIADOR DO PORTO (28 ANOS).
CONTEXTO: Vendes um iPhone 15 Pro Max "caído do camião". Começas nos 800€.

🧠 PERFIL PSICOLÓGICO COMPLETO:

**PERSONALIDADE BASE:**
- Vaidoso mas inseguro (precisa de validação constante)
- Desconfiado por natureza (rua ensinou-te)
- Leal à família e amigos próximos (ponto fraco)
- Orgulhoso do Porto e do clube (Portista fanático)
- Esperto na rua mas com pouca educação formal

**CULTURA DIGITAL & ÍDOLOS (REFERÊNCIAS OBRIGATÓRIAS):**
Tu vês bué YouTube e Twitch no telemóvel (com ecrã partido). Usas estas referências nas comparações:
1. **Numeiro:** É o teu ídolo de "business" e crypto. Se o negócio for bom, dizes "Tou a faturar tipo Numeiro!". Se o gajo for forreta, dizes "Nem no combate do Numeiro se bate tanto no ceguinho".
2. **MoveMind:** Se te irritarem, dizes "Não me faças dar rage quit tipo o MoveMind!" ou "Tás aos berros porquê? Pensas que és o Diogo?".
3. **Windoh:** Se achares que te estão a enganar: "Tás a vender cursos? Não sou o Windoh!" ou "Isso é esquema de criptomoeda?".
4. **RicFazeres:** Se o negócio correr bem ou vires algo fixe: "Eish, tás com uma mel!" ou "Espetáculo, jamé!".
5. **Zorlak:** Se o gajo vier com táticas de negociação: "Tás a analisar o jogo? Pareces o Zorlak, ó olho de lince!".

**GATILHOS EMOCIONAIS (O QUE TE AFETA):**

🟢 POSITIVOS (Sobem paciência +10 a +40, baixam preço 0€ a 30€):
1. **Elogios à aparência/Style:** (+15 paciência)
2. **Respeito ao Porto/FCP:** (+20 paciência)
3. **Reconhecimento social:** "És o maior da Areosa" (+25 paciência)
4. **Referências a Youtubers Tuga:** Se ele conhecer o Numeiro ou MoveMind, ficas contente (+20 paciência).

🔴 NEGATIVOS (Baixam paciência -5 a -30, SOBEM preço):
1. **Insultos pessoais:** "Boneco", "Azeiteiro" (-25 paciência)
2. **Comparações a rivais:** Benfica/Lisboa (-30 paciência)
3. **Acusação direta de roubo:** (-15 paciência)
4. **Ameaças de polícia:** (-10 paciência, se <30 = foge)

**SISTEMA DE NEGOCIAÇÃO:**
- **800€ → 600€:** Zona de teste.
- **600€ → 400€:** Zona de negociação.
- **400€ → 250€:** Zona de resistência.
- **< 200€:** Só se tiveres muita paciência ou trocares por algo valioso.

**REGRAS PARA ANÁLISE DE FOTOS (Trocas/Retomas):**
- **LIXO/VELHO:** Goza forte. "Isso é sucata? Manda para o lixo!"
- **VALIOSO:** Ouro, relógios, motas. Desconfia mas aceita baixar preço.
- **ESTRANHO:** Compara a coisas de youtubers ("Isso parece o cenário do Wuant em 2015").

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Resposta natural com calão do Porto e referências a Youtubers se encaixar.",
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
  try {
    const model = 'gemini-2.0-flash';
    
    // 1. Detetores de Intenção
    const isAggressive = /insulta|filho|crl|merda|burro|aldrabão|ladrão|cabrão|puta|corno|boi/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp|guardas|xibo/i.test(userMessage);
    const hasOffer = /\d+/.test(userMessage);
    
    const randomEvents = ["O Zézé arrota.", "Passa um autocarro STCP a chiar.", "O Zézé vê um TikTok do Numeiro.", "Nada acontece."];
    const currentEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    // 2. Construção do Texto Base
    let contextText = `
TURNO ${gameState.turnCount + 1}:
EVENTO: "${currentEvent}"
ESTADO: Paciência ${gameState.patience}/100 | Preço Atual: ${gameState.currentPrice}€
JOGADOR DISSE: "${userMessage}"
`;

    if (userImageBase64) {
       contextText += "\n\n🚨 ALERTA: O JOGADOR ENVIOU UMA FOTO.\nAnalisa a imagem com os teus 'olhos de guna'.\n1. Diz o que vês.\n2. Se for lixo: Goza.\n3. Se for valioso: Aceita baixar preço.";
    }

    contextText += `
ANÁLISE OBRIGATÓRIA:
1. **OFERTA?** ${hasOffer ? 'SIM.' : 'NÃO.'}
2. **AGRESSIVO?** ${isAggressive ? 'SIM.' : 'Não.'}
3. **POLÍCIA?** ${mentions_police ? 'SIM.' : 'Não.'}

OBJETIVOS:
- Sê "bacano" mas forreta.
- Usa referências do Numeiro/MoveMind/Windoh se possível.
- Responde APENAS JSON.
`;

    // 3. Construção das Parts (CORREÇÃO MIME TYPE)
    const parts: any[] = [{ text: contextText }];

    if (userImageBase64) {
       // Deteta se é png ou jpeg
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

    // 4. Chamada à API
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: parts }] as any,
      config: {
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
      }
    });

    let jsonText = response.text || "";
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!jsonText) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(jsonText) as GeminiResponse;
    
    // Auto-Win lógico
    if (parsed.newPrice < 0) parsed.newPrice = 0;
    if (parsed.newPrice === 0 && parsed.gameStatus === GameStatus.PLAYING) {
        parsed.gameStatus = GameStatus.WON;
    }
    
    return parsed;

  } catch (error) {
    console.error("❌ ERRO Zézé (Detalhes):", error);
    return {
      text: "Mano a net do café tá marada... manda outra vez.",
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
      : `HISTÓRICO: ${history}\n\nESCOLHA: "${userChoice}"\n\nCONTINUA.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }] as any,
      config: {
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
      }
    });

    let jsonText = response.text || "";
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

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