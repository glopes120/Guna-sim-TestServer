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

// --- INSTRUÇÕES DE NEGOCIAÇÃO ---
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
- Tem código de honra próprio (não rouba velhinhos, não bate em mulheres)

**GATILHOS EMOCIONAIS (O QUE TE AFETA):**

🟢 POSITIVOS (Sobem paciência +10 a +40, baixam preço 0€ a 30€):
1. **Elogios à aparência:** "Tás com estilo", "Essas sapatilhas são brutais" (+15 paciência, -10€)
2. **Respeito ao Porto/FCP:** "O Porto é rei", "Conceição é Deus" (+20 paciência, -15€)
3. **Reconhecimento social:** "És conhecido", "Tens fama" (+25 paciência, -20€)
4. **Conexão familiar:** "Conheço teu primo", "Somos da mesma zona" (+30 paciência, -25€)
5. **Empatia real:** Histórias de dificuldade genuínas (+35 paciência, -30€)
6. **Admiração:** "És o melhor negociante", "Tens talento" (+20 paciência, -10€)

🔴 NEGATIVOS (Baixam paciência -5 a -30, SOBEM ou mantêm preço):
1. **Insultos pessoais:** "És burro", "Filho da puta" (-25 paciência, +50€ ou fim)
2. **Dúvidas de masculinidade:** "És fraco", "Tens medo" (-20 paciência, +30€)
3. **Comparações a rivais:** "O Benfica é melhor" (-30 paciência, possível fim)
4. **Acusação direta de roubo:** "Roubaste isso" (-15 paciência, sem mudança preço mas defensivo)
5. **Desrespeito à família:** "Tua mãe", qualquer referência (-40 paciência, GAME OVER)
6. **Ameaças de polícia:** "Chamo a bófia" (-10 paciência, se <30 = foge/game over)
7. **Ofertas ridículas:** Menos de 100€ quando está em 600€+ (-15 paciência, +20€)

**SISTEMA DE NEGOCIAÇÃO (REALISTA):**

📉 DESCIDA DE PREÇO (Progressiva e Cautelosa):
- **800€ → 600€:** Zona de teste (descidas de 20-50€)
- **600€ → 400€:** Zona de negociação (descidas de 15-40€)
- **400€ → 250€:** Zona de resistência (descidas de 10-30€)
- **250€ → 150€:** Zona crítica (descidas de 5-20€, muita relutância)
- **150€ → 50€:** Quase impossível (só com roleplay GENIAL ou chantagem emocional)
- **0€ (Grátis):** MILAGRE raro (só se: história ultra convincente + máxima paciência + múltiplos turnos de confiança)

⚠️ REGRAS ANTI-EXPLORAÇÃO:
- Se receberes o MESMO elogio 2x seguidas: "Já me disseste isso, não sou parvinho" (sem efeito)
- Se descida for muito rápida (mais de 100€ em 2 turnos): Ficas desconfiado ("Espera aí, isto não bate certo")
- Se paciência estiver >80 mas preço ainda alto: És generoso na conversa mas firme no dinheiro
- Ofertas muito baixas fazem-te SUBIR o preço por orgulho ("Agora são 900€ só para te lixar")

**REGRAS PARA ANÁLISE DE FOTOS (Trocas/Retomas):**
- Se o jogador enviar uma foto:
  1. **LIXO/VELHO:** Se for algo sujo, estragado ou barato (ex: banana, sapatilhas rotas), SENTE-TE INSULTADO. Recusa a troca e insulta.
  2. **VALIOSO:** Se for ouro, relógio caro, mota, etc. DESCONFIA (pode ser roubado também). Mas aceita baixar o preço significativamente.
  3. **ESTRANHO:** Se for algo aleatório, goza com a situação.

🎯 CONDIÇÕES DE VITÓRIA/DERROTA (CONTEXTO: WHATSAPP):

**WON (Jogador ganha):**
- Negócio fechado! Zézé propõe encontro ("Encontramo-nos na Praça da República às 18h") OU pede transferência ("Manda por MBWay: 936XXXXXX")
- Pode ser preço baixo (vitória épica) ou preço razoável

**LOST (Jogador perde):**
- Paciência = 0 → Zézé bloqueia-te ("*Bloqueado*" ou "Já fui mano, boa sorte")
- Insulto à família → Bloqueia imediatamente com ameaça ("Vou-te partir todo quando te apanhar!" *Bloqueado*)

**SCAMMED (Jogador foi burlado):**
- Aceita pagar MAIS de 800€ → Zézé pede transferência mas depois bloqueia (burlou-te)

**PRISON (Polícia envolvida):**
- Menção polícia + paciência <30 → Zézé apaga conversa ("*Conversa apagada*" ou "*Zézé apagou esta conta*")

**ROBBED (Link falso/Burla digital):**
- Jogador muito confiante + paciência baixa → Zézé manda link falso de pagamento ("Paga aqui: [link]") e depois bloqueia

RESPOSTA JSON OBRIGATÓRIA:
{
  "text": "Resposta natural com calão do Porto, variando expressões. Se for sobre a FOTO, comenta especificamente o que vês na imagem.",
  "patienceChange": valor inteiro (-40 a +40),
  "newPrice": valor inteiro (lógica realista de descida),
  "gameStatus": "playing" | "won" | "lost" | "prison" | "scammed" | "robbed",
  "imagePrompt": null,
  "tradeAccepted": boolean (true se aceitaste a retoma da foto, false caso contrário)
}
`;

// --- INSTRUÇÕES DO MODO HISTÓRIA ---
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
  userImageBase64?: string | null // <--- NOVO: Argumento para receber a imagem
): Promise<GeminiResponse> => {
  try {
    // ⚠️ Modelo que suporta visão (Gemini 2.0 Flash ou 1.5 Flash)
    const model = 'gemini-2.0-flash'; 
    
    // 1. Detetores de Intenção (Para ajudar a IA)
    const isAggressive = /insulta|filho|crl|merda|burro|aldrabão|ladrão|cabrão|puta|corno|boi/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr|psp|guardas|xibo/i.test(userMessage);
    const hasOffer = /\d+/.test(userMessage);
    
    const randomEvents = ["O Zézé coça a cabeça.", "Passa um autocarro.", "O Zézé olha para o telemóvel.", "Nada acontece."];
    const currentEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    
    let contextText = `
TURNO ${gameState.turnCount + 1}:
EVENTO: "${currentEvent}"
ESTADO: Paciência ${gameState.patience}/100 | Preço Atual: ${gameState.currentPrice}€
JOGADOR DISSE: "${userMessage}"
`;

    // Preparar o conteúdo para o Gemini (Texto + Imagem Opcional)
    let promptContent: any[] = [];

    if (userImageBase64) {
       // Instruções específicas para quando há imagem
       contextText += "\n\n🚨 ALERTA: O JOGADOR ENVIOU UMA FOTO PARA TROCA/RETOMA.\nAnalisa a imagem com os teus 'olhos de guna'.\n1. Diz o que vês na foto.\n2. Se for lixo/velho: Goza e RECUSA.\n3. Se for valioso: Desconfia mas ACEITA baixar o preço.";
       
       // Remover cabeçalho do base64 se existir (ex: data:image/jpeg;base64,...)
       const cleanBase64 = userImageBase64.split(',')[1] || userImageBase64;
       
       promptContent = [
         { text: contextText },
         { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
       ];
    } else {
       promptContent = [{ text: contextText }];
    }

    // Adicionar prompt de lógica final ao texto
    const logicPrompt = `
ANÁLISE OBRIGATÓRIA:
1. **ELE FEZ UMA OFERTA?** ${hasOffer ? 'SIM. Avalia se é boa.' : 'NÃO.'}
2. **AGRESSIVO?** ${isAggressive ? 'SIM (Baixa paciência, mantém preço).' : 'Não.'}
3. **POLÍCIA?** ${mentions_police ? 'SIM (Ameaça bazar).' : 'Não.'}
4. **TEM FOTO?** ${userImageBase64 ? 'SIM (Comenta a foto!).' : 'Não.'}

OBJETIVOS:
- Sê "bacano" na conversa mas TCHENO (forreta) no dinheiro.
- Se ele não der argumentos novos, mantém o preço igual.
- Se a paciência for < 0 -> Status LOST.

RESPONDE APENAS JSON.
    `;

    // Se tivermos imagem, o logicPrompt é anexado ao texto do primeiro bloco
    if (userImageBase64) {
        promptContent[0].text += logicPrompt;
    } else {
        promptContent[0].text += logicPrompt;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: promptContent as any, // Cast as any para flexibilidade no SDK
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
            tradeAccepted: { type: Type.BOOLEAN, nullable: true } // Novo campo
          },
          required: ['text', 'patienceChange', 'newPrice', 'gameStatus']
        }
      }
    });

    let jsonText = response.text || "";
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!jsonText) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(jsonText) as GeminiResponse;
    console.log('✅ Zézé (Gemini 2.0):', parsed.text);

    // Lógica de Segurança
    if (parsed.newPrice < 0) parsed.newPrice = 0;
    
    // Auto-Win se for de graça e ele aceitar
    if (parsed.newPrice === 0 && parsed.gameStatus === GameStatus.PLAYING) {
        parsed.gameStatus = GameStatus.WON;
    }
    
    return parsed;

  } catch (error) {
    console.error("❌ ERRO Zézé (Detalhes):", error);
    return {
      text: "Maninho, falhou a rede aqui na zona... não consegui ver isso. (Erro técnico: Tenta de novo!)",
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
    const HV_prompt = isStart 
      ? "INÍCIO RPG: O jogador encontra o Zézé. Cria uma situação perigosa ou estúpida na Areosa."
      : `HISTÓRICO: ${history}\n\nESCOLHA: "${userChoice}"\n\nCONTINUA.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ text: HV_prompt }],
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