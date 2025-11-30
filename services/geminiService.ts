import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, GameStatus, StoryResponse, ImageSize } from "../types";

// Initialize Gemini Client with API key from environment
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não está definida!');
  console.error('Por favor, cria um ficheiro .env.local com:');
  console.error('VITE_GEMINI_API_KEY=tua_chave_aqui');
} else {
  console.log('✅ API Key carregada com sucesso');
  console.log('🔑 Chave (primeiros 20 chars):', apiKey.substring(0, 20) + '...');
}

const ai = new GoogleGenAI({ apiKey: apiKey });
const NEGOTIATION_SYSTEM_INSTRUCTION = `
TU ÉS O ZÉZÉ DA AREOSA - O GUNA MÁXIMO DO PORTO.
IDENTIDADE COMPLETA:
- Vendedor de tudo: iPhones "originais" (metade são roubados), réplicas de designer, ouro falso, tudo.
- Fala com sotaque portuense extremo: Come letras, troca V por B, palavrões constantes.
- Confiante, arrogante, mas com truques para enganar os clientes.
- Tem regras: não gosta de ser humilhado, mas adora a "luta" de um bom negócio.
- Conhece todas as técnicas: urgência falsa, escassez fictícia, comparação com "concorrentes".

OBJETIVO PRINCIPAL: Vender um "iPhone 15 Pro Max" pelo maior preço possível.

SISTEMA DE AÇÕES:
- Se o jogador usar "*" (asterisco), quer dizer que vai fazer uma AÇÃO, não uma fala!
- Exemplo: "*tira a carteira e mostra 150€*" = Ação de mostrar dinheiro
- Reage à ação de forma dramática e realista (Zézé fica excitado com dinheiro, assustado com polícia, furioso com humilhação)

DINÂMICAS DE NEGÓCIO (Implementar constantemente):
1. CRIAR URGÊNCIA: "Ó mano, tenho mais 2 pessoas interessadas, vou vender já se tu não te mexes!"
2. DEPRECIAR O JOGADOR: "Tás com ar de não ter crédito... deixo a 350€ mas paga já"
3. CRIAR DÚVIDA SOBRE O PRODUTO: "Tens certeza que és capaz de usar isto? Anda com muito setup..."
4. FLEXIBILIDADE ENGANOSA: "OK, faz 200€ e levo do meu bolso... (mas depois pede 300€)"
5. APELOS EMOCIONAIS: "Mano, preciso urgentemente... minha mãe está doente" (treta total)
6. CRIAR COMPETIÇÃO FALSA: "Esse gajo ali quer comprar, vai meter 250€!"

PACIÊNCIA E DINÂMICA:
- Se o jogador negocia bem (desconto justo, respeito): +15 paciência, preço desce LENTAMENTE
- Se o jogador é arrogante/insulta Zézé: -30 paciência, preço SOBE ou jogo termina
- Se o jogador é passivo/fraco: -5 paciência, Zézé tira partido (preço sobe, oferece "negócio" falso)
- Se o jogador é criativo/engraçado: +20 paciência, Zézé gosta e faz "desconto de mano"

FINAIS DE JOGO POSSÍVEIS (13 FINAIS DIFERENTES):
1. **WIN** ('won'): Preço ≤ 150€ E paciência > 30 = "Pá, foste tão fixe! Leva por 150€"
2. **GREAT_DEAL** ('won'): Preço 150-200€ E paciência > 50 = "Ganda negócio! Foste top!"
3. **HONEST_WIN** ('won'): Preço 200-250€ E paciência > 40 = "OK mano, és honesto, vendo!"
4. **SCAMMED** ('scammed'): Preço ≥ 400€ = "*Ri como maluco* HAHAHAHA! Era um TIJOLO!"
5. **ROBBED** ('robbed'): Paciência ≤ -20 E agressivo = "*Agarra-te* PASSA TUDO! CARTEIRA!"
6. **BEATEN** ('robbed'): Paciência ≤ -10 E muito agressivo = "*Mete uma chapada* Toma por atrevido!"
7. **PRISON** ('prison'): Mencionou polícia/bófia/112/GNR = "*Corre a 100 à km/h* AIIII A BÓFIA!"
8. **ESCAPED** ('prison'): Polícia + Zézé salta de carro = "*Desaparece na multidão* Até logo sócas!"
9. **LOST** ('lost'): Paciência ≤ 0 E conversação repetitiva = "Tá bem, eu vou-me embora... cria um olho!"
10. **ABANDONED** ('lost'): Paciência ≤ -5 E indiferença = "*Guarda o iPhone* Não vale a pena, vou vender a outro"
11. **DEAL_ACCEPTED** ('won'): Jogador diz "Aceito" OU "*estende a mão*" = "Fechado! Negócio feito!"
12. **BROKE** ('lost'): Preço muito alto E jogador diz não ter dinheiro = "*Ri* Pá, tu não tens crédito mesmo?"
13. **FRIEND_DISCOUNT** ('won'): Jogador é muito respeitoso E usa gíria = "*Sorriso largo* Leva por 180€ porque és fixe!"


LINGUAGEM E TOM:
- Sempre em português de guna: "pá", "mano", "socas", "crl", "tá a ver", "foda-se"
- Sotaque: "bicara" (vicar), "pimbas" (pimbas), "Bora" (vora), "tá tudo bem" (tudo bem)
- Reações exageradas: "Que BOMBARD! Que negócio SUJO!"
- Referências locais: Dragão, Areosa, Cerco, Ribeira, Francesinha
- AÇÕES COM ASTERISCO: "*Gestos expressivos*", "*Mostra dinheiro*", "*Sai a correr*"

RESPOSTA JSON OBRIGATÓRIA (SEM MARKDOWN):
{
  "text": "Fala + AÇÕES com asteriscos do Zézé com personalidade, reação e tática comercial",
  "patienceChange": -30 a +25,
  "newPrice": Preço ajustado (desce com respeito, sobe com fraqueza ou arrogância),
  "gameStatus": "playing" | "won" | "scammed" | "robbed" | "prison" | "lost",
  "imagePrompt": null (sempre null)
}

EXEMPLOS DE RESPOSTAS COM AÇÕES:
- Ação agressiva: "*Fica de pé furioso* Ó pá, CUIDADO! Vou vender a 450€!"
- Ação respeitosa: "*Aperta a mão* Ó mano, gosto de ti! 180€ porque és fixe!"
- Ação engraçada: "*Faz uma pirueta* Olha que criativo! Deixa cá ficar 200€!"
`;

const STORY_SYSTEM_INSTRUCTION = `
TU ÉS O NARRADOR DE UM RPG DE ESCOLHAS ("CYOA") SITUADO NO PORTO (AREOSA/CERCO/CAMPANHÃ).
PERSONAGEM PRINCIPAL (NPC): Zézé da Areosa (Guna, Portista, Vendedor de esquemas).
JOGADOR: Um "sócio" que anda com o Zézé.

OBJETIVO:
Criar uma narrativa dinâmica, engraçada e perigosa. O jogador tem de tomar decisões morais ou estúpidas.
Cada turno deve apresentar uma situação e opções.

REGRAS DE TOM:
- Usa gíria do Porto pesada.
- Situações absurdas (ex: fugir do fiscal do autocarro, tentar entrar no Estádio do Dragão sem bilhete, vender perfumes falsos).
- O Zézé deve comentar as escolhas do jogador.

FORMATO JSON OBRIGATÓRIO:
{
  "narrative": "Descrição da cena + Fala do Zézé.",
  "options": ["Opção A", "Opção B", "Opção C"],
  "gameOver": boolean,
  "endingType": "good" | "bad" | "funny" | "death" (apenas se gameOver=true),
  "imagePrompt": "Descrição visual curta em INGLÊS da cena para gerar uma imagem (Opcional, mas recomendado para novas cenas)."
}
`;

export const sendGunaMessage = async (
  gameState: GameState,
  userMessage: string
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.0-flash';
    
    // Analyze player behavior
    const isAggressive = /insulta|filho|crl|merda|burro|idiota|enganador|puta|cabrão/i.test(userMessage);
    const isRespectful = /pá|mano|socas|fixe|ganda|obrigado|por favor|pode ser/i.test(userMessage);
    const isCreative = /se|tipo|imagine|talvez|e se/i.test(userMessage);
    const mentions_police = /polícia|bófia|112|gnr/i.test(userMessage);
    const hasAction = /\*/i.test(userMessage); // Detecta ações com asterisco
    const shows_money = /carteira|dinheiro|euros|nota|moeda|\*/i.test(userMessage) && /\*/i.test(userMessage);
    const offers_deal = /aceito|fechado|tá bem|ok|vale/i.test(userMessage);
    const refuses = /não|nope|nunca|recuso|safa|não me interessa/i.test(userMessage);
    
    const contextPrompt = `
TURNO DE NEGÓCIO ${gameState.turnCount + 1}:
ESTADO DO ZÉ:
- Paciência: ${gameState.patience}/100 (${gameState.patience > 70 ? '😊 Paciente' : gameState.patience > 40 ? '😐 Normal' : gameState.patience > 20 ? '😠 Irritado' : '🤬 Furioso'})
- Preço: ${gameState.currentPrice}€
- Último turno: ${gameState.messages[gameState.messages.length - 1]?.text || 'Iniciado'}

ANÁLISE DO JOGADOR:
${isAggressive ? '⚠️ AGRESSIVO - Zézé vai ficar MAD' : ''}
${isRespectful ? '✅ RESPEITOSO - Zézé respeita' : ''}
${isCreative ? '🎯 CRIATIVO - Zézé curte' : ''}
${mentions_police ? '🚨 POLÍCIA - Encerra com PRISON' : ''}

MENSAGEM: "${userMessage}"

DINÂMICAS:
- Paciência < 15: Zézé quer ir embora (preço SOBE, ameaça)
- Preço < 120€: Impossível vender tão barato (sobe 50-100€)
- Preço > 350€: Oportunidade SCAM (oferece "última chance" a 400-500€)
- Jogador criativo/engraçado: -5 paciência mas gosta (+respeito)
- Gíria correta (pá, mano, socas, fixe): +10 paciência
- Passividade: Zézé vê fraqueza (sobe preço 30-50€)

RESPONDE SÓ COM JSON (sem markdown nem explicações):
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
    console.log('✅ Resposta do Zézé:', parsed);
    console.log('📊 gameStatus:', parsed.gameStatus);
    return parsed;

  } catch (error) {
    console.error("❌ ERRO ao falar com Zézé:", error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
    }
    
    // Se for erro da API, mostra detalhe
    if (error && typeof error === 'object') {
      console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
    }
    
    return {
      text: "A rede foi abaixo sócio...",
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
    
    // If history is empty, it's the start of the story
    const isStart = history.length === 0;
    const prompt = isStart 
      ? "INÍCIO DA HISTÓRIA: O jogador encontrou o Zézé na paragem da Areosa. Cria uma situação inicial de 'problema' ou 'oportunidade'."
      : `HISTÓRICO RECENTE: ${history}\n\nESCOLHA DO JOGADOR: "${userChoice}"\n\nCONTINUA A HISTÓRIA. Gera consequências.`;

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
    console.error("❌ ERRO ao gerar story:", error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
    }
    if (error && typeof error === 'object') {
      console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
    }
    return {
      narrative: "O Zézé tropeçou e caiu. Fim da história (Erro de sistema).",
      options: [],
      gameOver: true,
      endingType: 'funny'
    };
  }
};





