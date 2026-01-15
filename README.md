# 🤖 Bot WhatsApp CISPN/SENASP

Bot WhatsApp para atendimento automatizado dos projetos MJSP/SENASP.

**Autor:** Daniel Lima da Paz

## 📋 Descrição

Bot desenvolvido com wppconnect para fornecer informações sobre os projetos da DIOPI/SENASP:
- CISPN (Centro Integrado de Segurança Pública Nacional)
- CISPPA (Centro Integrado de Inteligência, Segurança Pública e Proteção Ambiental)
- ESTÁDIO +SEGURO
- RESPAD (Resposta em Operações Integradas para Atuação em Situação de Desastres)
- VIPS (Vulneráveis Institucionalmente Protegidos e Seguros)

## 🚀 Deploy no Render (24/7)

### Pré-requisitos
- Conta no [Render.com](https://render.com)
- Plano pago: $7/mês (Starter)
- Repositório GitHub

### Passo a Passo

#### 1. Preparar o Repositório
✅ O código já está pronto para deploy! Os seguintes arquivos foram configurados:
- `package.json` - Com script de start e versão do Node
- `render.yaml` - Configuração do serviço Render
- `.gitignore` - Arquivos de sessão e temporários ignorados

#### 2. Fazer Push para o GitHub
```bash
git add .
git commit -m "Preparar bot para deploy no Render"
git push origin main
```

#### 3. Criar Serviço no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure o serviço:
   - **Name:** whatsapp-bot-cispn
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/mês)

5. Em **"Advanced"**, adicione um Disco Persistente:
   - **Name:** whatsapp-session-data
   - **Mount Path:** `/opt/render/project/src/tokens`
   - **Size:** 1GB

6. Clique em **"Create Web Service"**

#### 4. Conectar WhatsApp (IMPORTANTE!)

Após o deploy:

1. Vá em **"Logs"** no dashboard do Render
2. Aguarde aparecer o QR Code no log
3. **ESCANEIE o QR CODE** com seu WhatsApp:
   - Abra WhatsApp no celular
   - Toque em ⋮ (menu) → Aparelhos conectados
   - Toque em "Conectar um aparelho"
   - Escaneie o QR Code que aparece no log

4. Aguarde a mensagem: ✅ BOT CONECTADO E FUNCIONANDO!

⚠️ **ATENÇÃO:** Você tem cerca de 30-60 segundos para escanear o QR Code antes que ele expire. Se isso acontecer, o bot gerará um novo QR Code automaticamente.

#### 5. Verificar Status

O bot expõe um endpoint de health check:
```
https://seu-app.onrender.com/
```

Resposta esperada:
```json
{
  "status": "online",
  "botStatus": "inChat",
  "botConnected": true,
  "timestamp": "2026-01-15T..."
}
```

### 🔄 Reconexão Automática

O bot possui sistema de reconexão automática:
- Se houver erro, tenta reconectar após 30 segundos
- Mantém o servidor HTTP ativo mesmo durante reconexões
- Preserva a sessão usando disco persistente

### 💾 Persistência de Dados

O disco persistente no Render garante que:
- A sessão do WhatsApp seja mantida mesmo após restarts
- Não seja necessário escanear QR Code toda vez
- O bot funcione 24/7 sem interrupções

## 🛠️ Desenvolvimento Local

### Instalação
```bash
npm install
```

### Executar
```bash
npm start
```

## 📱 Funcionalidades do Bot

1. **Projetos DIOPI/SENASP** - Informações sobre todos os projetos
2. **Suporte Técnico** - Abertura de chamados
3. **Horário de Atendimento** - Horários institucionais
4. **Localização** - Endereço da sede
5. **Atendimento Humano** - Solicitação de atendimento pessoal
6. **Sobre DIOPI/SENASP** - Informações institucionais

### Comandos
- Digite **"menu"** - Voltar ao menu principal
- Digite **"oi"** ou **"olá"** - Iniciar conversa
- Digite **1-6** - Acessar opções do menu

## 🔧 Tecnologias

- Node.js 18+
- @wppconnect-team/wppconnect
- qrcode-terminal
- HTTP (servidor nativo)

## 📊 Monitoramento

Monitore o bot através do dashboard do Render:
- **Logs em tempo real**
- **Métricas de CPU e memória**
- **Status de saúde**
- **Alertas de downtime**

## 🆘 Troubleshooting

### Bot não conecta
- Verifique se escaneou o QR Code a tempo
- Verifique os logs no dashboard do Render
- Certifique-se de que o WhatsApp está ativo no celular

### Disco persistente não funciona
- Verifique se o path está correto: `/opt/render/project/src/tokens`
- Reinicie o serviço no Render

### Bot desconecta frequentemente
- Mantenha o WhatsApp ativo no celular
- Não desconecte manualmente do WhatsApp Web
- Verifique a estabilidade da internet do celular

## 📞 Contatos

**DIOPI - Diretoria de Operações Integradas e de Inteligência**
- Telefone: (61) 2025-3203
- Email: cispn@mj.gov.br
- Endereço: SPO, Quadra 03, Lt.05, Complexo Sede da PRF, Pétala H - Brasília/DF
- CEP: 70610-909

## 📄 Licença

ISC

---

**Desenvolvido para MJSP - SENASP - DIOPI**
