# 🔧 Setup Guia - Guna Simulator

## ⚙️ Configuração Inicial

### 1️⃣ **Clonar o Repositório**
```bash
git clone <repo-url>
cd Guna-simulator--main
```

### 2️⃣ **Instalar Dependências**
```bash
npm install
```

### 3️⃣ **Configurar Variáveis de Ambiente** ⭐ IMPORTANTE

Cria um ficheiro `.env.local` na raiz do projeto:

```bash
# .env.local
VITE_GEMINI_API_KEY=AIzaSyBf6es9LWm9ui2aPsX7wgTCYm6o75SVdRs
```

⚠️ **NÃO committes este ficheiro!** (Está em `.gitignore`)

### 4️⃣ **Iniciar o Servidor**
```bash
npm run dev
```

O jogo estará disponível em: `http://localhost:3000`

---

## 🔑 Obter a API Key do Google Gemini

Se a chave expirar ou precisares de uma nova:

1. **Vai a** https://aistudio.google.com/app/apikey
2. **Clica em** "Create API Key"
3. **Seleciona o projeto** (ou cria um novo)
4. **Copia a chave**
5. **Cola em** `.env.local`

---

## 🐛 Resolução de Problemas

### ❌ Erro: "API key not valid"

**Causa:** A chave está expirada ou incorreta

**Solução:**
```bash
1. Verifica que .env.local existe
2. Verifica que VITE_GEMINI_API_KEY tem o valor correto
3. Vai a https://aistudio.google.com/app/apikey e cria uma nova
4. Tira o servidor (Ctrl+C)
5. Executa: npm run dev
```

### ❌ Erro: "WebSocket connection failed"

**Causa:** Vite HMR não consegue conectar

**Solução:**
- Já foi corrigida no `vite.config.ts`
- Se persistir, tenta:
```bash
taskkill /F /IM node.exe
npm run dev
```

### ❌ Nada funciona

**Solução nuclear:**
```bash
# Remove node_modules e package-lock
rm -r node_modules package-lock.json

# Reinstala tudo
npm install

# Verifica .env.local existe
# Reinicia dev server
npm run dev
```

---

## 📦 Build para Produção

### Gerar Bundle
```bash
npm run build
```

Outputs para pasta `dist/`

### Pré-requisitos para Produção
1. ✅ API Key válida em `.env.local`
2. ✅ Sem erros de build
3. ✅ Service Worker funciona
4. ✅ HTTPS habilitado (PWA requer)

### Deploy (Exemplo: Vercel)
```bash
npm install -g vercel
vercel
```

---

## 🚀 Quick Start

```bash
# 1. Clone e instale
git clone <repo>
cd Guna-simulator--main
npm install

# 2. Configure .env.local
echo "VITE_GEMINI_API_KEY=AIzaSyBf6es9LWm9ui2aPsX7wgTCYm6o75SVdRs" > .env.local

# 3. Inicie dev
npm run dev

# 4. Abra browser
# http://localhost:3000
```

---

## ✨ Scripts Disponíveis

```bash
npm run dev       # Dev server com HMR
npm run build     # Build produção
npm run preview   # Preview do build local
```

---

## 🔒 Segurança

⚠️ **NUNCA** committes a API key!

- `.env.local` está em `.gitignore`
- Usa environment variables em produção
- Vercel/Netlify têm UI para secrets

---

## 📞 Suporte

Se tiveres problemas:

1. Verifica `MOBILE_OPTIMIZATION.md`
2. Verifica `MOBILE_CHECKLIST.md`
3. Tira screenshots de erros
4. Cola aqui os erros da console

---

**Pronto! 🎉 Começa a brincar com o Guna Simulator!**
