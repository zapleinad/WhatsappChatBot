// Autor: Daniel Lima da Paz
// Bot WhatsApp CISPN/SENASP usando wppconnect
// Esta implementação estende o bot anterior para incluir um fluxo de atendimento humano
// que verifica inatividade: após 1 minuto sem mensagens durante o atendimento humano,
// o bot pergunta se o usuário precisa de algo mais, solicita avaliação de satisfação
// (1 a 5) e instrui a finalizar a conversa digitando "encerrar".

const wppconnect = require('@wppconnect-team/wppconnect');

// =============================
// DADOS DO SISTEMA
// =============================

// Projetos MJSP/SENASP (CISPN, CISPPA, etc.)
const PROJETOS = {
  cispn: {
    nome: 'CISPN',
    nomeCompleto: 'Centro Integrado de Segurança Pública Nacional',
    area: 'Inteligência e Investigação',
    objetivo:
      'Fortalecer a capacidade de inteligência e investigação das instituições de segurança pública em âmbito nacional.',
    publicoAlvo: 'Forças de Segurança Pública Estaduais e Federais',
    status: 'Em Operação',
    coordenacao: 'DIOPI/SENASP/MJSP',
    abrangencia: 'Nacional',
    descricao:
      'O CISPN atua na integração de dados de segurança pública, produção de inteligência estratégica e apoio às operações de investigação criminal em todo território nacional.'
  },
  cisppa: {
    nome: 'CISPPA',
    nomeCompleto:
      'Centro Integrado de Inteligência, Segurança Pública e Proteção Ambiental',
    area: 'Prevenção e Policiamento',
    objetivo:
      'Coordenar ações preventivas e integradas entre os órgãos de segurança pública para redução da criminalidade.',
    publicoAlvo: 'Polícias Militares, Guardas Municipais e órgãos preventivos',
    status: 'Em Operação',
    coordenacao: 'DIOPI/SENASP/MJSP',
    abrangencia: 'Nacional',
    descricao:
      'Uma iniciativa do Ministério da Justiça e Segurança Pública (MJSP) que funciona como um "Fusion Center" brasileiro, focado na integração de dados e operações entre diversas forças de segurança (federais, estaduais e municipais).'
  },
  estadio: {
    nome: 'ESTÁDIO +SEGURO',
    nomeCompleto: 'Programa Estádio Mais Seguro',
    area: 'Segurança em Grandes Eventos',
    objetivo:
      'Garantir a segurança em eventos esportivos através de monitoramento integrado e ações coordenadas.',
    publicoAlvo: 'Órgãos de Segurança Pública e Organizadores de Eventos',
    status: 'Em Operação',
    coordenacao: 'DIOPI/SENASP/MJSP',
    abrangencia: 'Estádios de Futebol - Nacional',
    descricao:
      'Sistema integrado de segurança para grandes eventos esportivos, com videomonitoramento, reconhecimento facial, controle de acesso e coordenação de forças de segurança.'
  },
  respad: {
    nome: 'RESPAD',
    nomeCompleto:
      'Resposta em Operações Integradas para Atuação em Situação de Desastres',
    area: 'Resposta eficaz e eficiente a desastres',
    objetivo: 'Resposta rápida e coordenada em situações de desastres naturais.',
    publicoAlvo: 'Todas as Unidades dos Corpos de Bombeiros do Brasil',
    status: 'Em Implantação',
    coordenacao: 'DIOPI/SENASP/MJSP',
    abrangencia: 'Nacional',
    descricao:
      'Projeto do Ministério da Justiça e Segurança Pública (MJSP) que visa criar uma força-tarefa nacional unificada e ágil para responder a desastres naturais, integrando Corpos de Bombeiros, Defesa Civil e outras forças de segurança, oferecendo apoio logístico, financeiro e de equipamentos para uma atuação mais eficiente, rápida e coordenada em cenários como enchentes e queimadas.'
  },
  vips: {
    nome: 'VIPS',
    nomeCompleto: 'Vulneráveis Institucionalmente Protegidos e Seguros',
    area: 'Proteção de pessoas vulneráveis',
    objetivo:
      'Proteger e cuidar de pessoas vulneráveis com vistas a prevenir que sofram práticas criminosas.',
    publicoAlvo: 'Centros de Operações de Segurança Pública',
    status: 'Em Expansão',
    coordenacao: 'DIOPI/SENASP/MJSP',
    abrangencia: 'Capitais e Regiões Metropolitanas',
    descricao:
      'Programa de Proteção a pessoas vulneráveis através de monitoramento integrado e ações preventivas.'
  }
};

const HORARIOS = {
  semana: 'Segunda a Sexta: 8h às 18h',
  sabado: 'Sábado: Plantão (emergências)',
  domingo: 'Domingo: Plantão (emergências)',
  observacao: 'Sistema 24/7 para operações críticas'
};

const CONTATOS_INSTITUCIONAIS = {
  diopi: 'DIOPI - Diretoria de Operações Integradas e de Inteligência',
  cgoi: 'CGOI - Coordenação-Geral de Operações Integradas',
  senasp: 'SENASP - Secretaria Nacional de Segurança Pública',
  telefone: '(61) 2025-3203',
  email: 'cispn@mj.gov.br',
  sede: 'SPO, Quadra 03, Lt.05, Complexo Sede da PRF, Pétala H - Brasília/DF',
  cep: '70610-909'
};

// Mapa de conversas para armazenar contexto por usuário
const conversas = new Map();

// Timeout para atendimento humano (1 minuto). Após esse período de inatividade, o bot
// enviará uma mensagem perguntando se o usuário precisa de algo mais e solicitará a avaliação.
const TIMEOUT_ATENDENTE = 60 * 1000;

// Funções auxiliares para montar respostas
function montarMenuPrincipal() {
  return (
    '*🇧🇷 MJSP - SENASP - DIOPI*\n\n' +
    '═══════════════════════════\n\n' +
    '*🤖 ATENDIMENTO AUTOMÁTICO*\n\n' +
    '*1️⃣* - 📋 Projetos DIOPI/SENASP\n' +
    '*2️⃣* - 🔧 Suporte Técnico\n' +
    '*3️⃣* - 🕐 Horário de Atendimento\n' +
    '*4️⃣* - 📍 Localização\n' +
    '*5️⃣* - 👤 Falar com Atendente\n' +
    '*6️⃣* - ℹ️ Sobre DIOPI/SENASP\n\n' +
    '_Digite o número da opção_'
  );
}

function montarListaProjetos() {
  let lista = '*📋 PROJETOS DIOPI/SENASP*\n\n';
  for (const [key, proj] of Object.entries(PROJETOS)) {
    lista += `*${proj.nome}*\n`;
    lista += `${proj.nomeCompleto}\n`;
    lista += `📂 ${proj.area}\n`;
    lista += `📊 ${proj.status}\n\n`;
  }
  lista += '_Digite o nome do projeto_\n';
  lista += 'Ex: "CISPN", "RESPAD"\n\n';
  lista += 'Digite *menu* para voltar.';
  return lista;
}

function montarDetalhesProjeto(projeto) {
  return (
    `*${projeto.nome}*\n` +
    `${projeto.nomeCompleto}\n\n` +
    `*📂 Área:* ${projeto.area}\n\n` +
    `*🎯 Objetivo:*\n${projeto.objetivo}\n\n` +
    `*👥 Público:* ${projeto.publicoAlvo}\n\n` +
    `*📊 Status:* ${projeto.status}\n\n` +
    `*🏛️ Coordenação:* ${projeto.coordenacao}\n\n` +
    `*🌐 Abrangência:* ${projeto.abrangencia}\n\n` +
    `*📝 Descrição:*\n${projeto.descricao}\n\n` +
    `📞 ${CONTATOS_INSTITUCIONAIS.telefone}\n\n` +
    'Digite *menu* para voltar.'
  );
}

function montarInformacoesInstitucionais() {
  return (
    '*🇧🇷 SOBRE A DIOPI/SENASP*\n\n' +
    `${CONTATOS_INSTITUCIONAIS.diopi}\n\n` +
    '*Principais Atribuições:*\n\n' +
    '• Operações integradas\n' +
    '• Inteligência estratégica\n' +
    '• Comunicação crítica\n' +
    '• Integração de dados\n' +
    '• Videomonitoramento\n' +
    '• Grandes eventos\n\n' +
    `*Sede:* ${CONTATOS_INSTITUCIONAIS.sede}\n\n` +
    `📞 ${CONTATOS_INSTITUCIONAIS.telefone}\n` +
    `📧 ${CONTATOS_INSTITUCIONAIS.email}\n\n` +
    'Digite *menu* para voltar.'
  );
}

function gerarProtocolo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ano = new Date().getFullYear();
  return `MJSP-${ano}-${timestamp}${random}`;
}

// Função principal de processamento de mensagens
async function processarMensagem(texto, usuario) {
  // inicializar contexto
  if (!conversas.has(usuario)) {
    conversas.set(usuario, {
      etapa: 'inicial',
      dados: {},
      ultimaInteracao: Date.now()
    });
  }
  const contexto = conversas.get(usuario);
  contexto.ultimaInteracao = Date.now();

  // Saudações
  if (texto.match(/^(oi|olá|ola|hey|opa|e ai|eai|bom dia|boa tarde|boa noite)/)) {
    contexto.etapa = 'menu';
    return montarMenuPrincipal();
  }

  // Menu
  if (texto === 'menu' || texto === '0') {
    contexto.etapa = 'menu';
    return montarMenuPrincipal();
  }

  // Opções
  if (texto === '1') {
    contexto.etapa = 'projetos';
    return montarListaProjetos();
  }
  if (texto === '2') {
    contexto.etapa = 'suporte';
    contexto.dados.mensagensSuporte = [];
    contexto.dados.inicioChamado = Date.now();
    return (
      '*🔧 SUPORTE TÉCNICO*\n\n' +
      'Equipe de suporte DIOPI/SENASP\n\n' +
      'Por favor, informe:\n' +
      '• Qual projeto?\n' +
      '• Instituição/Órgão\n' +
      '• Descrição do problema\n' +
      '• Urgência (Baixo/Médio/Alto/Crítico)\n\n' +
      '_Digite sua solicitação..._\n\n' +
      '💡 Digite *"finalizar"* quando terminar.'
    );
  }
  if (texto === '3') {
    return (
      '*🕐 HORÁRIO DE ATENDIMENTO*\n\n' +
      `*${CONTATOS_INSTITUCIONAIS.diopi}*\n\n` +
      '*Administrativo:*\n' +
      `${HORARIOS.semana}\n` +
      `${HORARIOS.sabado}\n` +
      `${HORARIOS.domingo}\n\n` +
      `*${HORARIOS.observacao}*\n\n` +
      `📞 ${CONTATOS_INSTITUCIONAIS.telefone}\n` +
      `📧 ${CONTATOS_INSTITUCIONAIS.email}\n\n` +
      'Digite *menu* para voltar.'
    );
  }
  if (texto === '4') {
    return (
      '*📍 LOCALIZAÇÃO INSTITUCIONAL*\n\n' +
      `*${CONTATOS_INSTITUCIONAIS.senasp}*\n` +
      `${CONTATOS_INSTITUCIONAIS.diopi}\n\n` +
      '*Endereço:*\n' +
      `${CONTATOS_INSTITUCIONAIS.sede}\n` +
      `CEP: ${CONTATOS_INSTITUCIONAIS.cep}\n\n` +
      `📞 ${CONTATOS_INSTITUCIONAIS.telefone}\n` +
      `📧 ${CONTATOS_INSTITUCIONAIS.email}\n\n` +
      'Digite *menu* para voltar.'
    );
  }
  if (
    texto === '5' ||
    texto.includes('atendente') ||
    texto.includes('humano')
  ) {
    // Usuário solicitou falar com um atendente. Define a etapa e retorna a mensagem inicial.
    contexto.etapa = 'atendente';
    return (
      '*👤 ATENDIMENTO PESSOAL*\n\n' +
      'Solicitação registrada!\n\n' +
      `*Protocolo:* ${gerarProtocolo()}\n` +
      '⏱️ Tempo médio: 15-30min\n\n' +
      `Urgente? Ligue: ${CONTATOS_INSTITUCIONAIS.telefone}\n\n` +
      'Digite *menu* para outras opções.'
    );
  }
  if (texto === '6') {
    return montarInformacoesInstitucionais();
  }

  // Contexto: avaliação após atendimento humano
  if (contexto.etapa === 'avaliacao_atendente') {
    // Usuário deseja encerrar a conversa
    if (texto === 'encerrar') {
      contexto.etapa = 'finalizado';
      return '✅ Conversa encerrada. Agradecemos pelo contato!';
    }
    // Avaliação numérica de satisfação (1 a 5)
    const aval = parseInt(texto);
    if (!isNaN(aval) && aval >= 1 && aval <= 5) {
      contexto.dados.avaliacaoAtendente = aval;
      return (
        '*🙏 Obrigado pela sua avaliação!*\n' +
        `⭐ Você avaliou como ${aval}/5.\n\n` +
        'Se precisar de mais alguma coisa, responda; se não, digite *encerrar* para finalizar.'
      );
    }
    // Instrução caso o usuário tenha digitado algo inesperado
    return '❓ Por favor, informe um número de 1 a 5 para sua satisfação ou digite *encerrar* para finalizar.';
  }

  // Contexto: projetos
  if (contexto.etapa === 'projetos') {
    const key = texto.replace(/\s+/g, '').toLowerCase();
    const projeto = PROJETOS[key] || PROJETOS[texto.toLowerCase()];
    if (projeto) {
      return montarDetalhesProjeto(projeto);
    }
    // tentativa de busca por nome parcial
    for (const [k, proj] of Object.entries(PROJETOS)) {
      if (texto.includes(k) || texto.includes(proj.nome.toLowerCase())) {
        return montarDetalhesProjeto(proj);
      }
    }
  }

  // Contexto: suporte
  if (contexto.etapa === 'suporte') {
    if (texto === 'finalizar') {
      const protocolo = gerarProtocolo();
      contexto.dados.protocolo = protocolo;
      contexto.etapa = 'suporte_aguardando_avaliacao';
      const resumo = (contexto.dados.mensagensSuporte || []).join('\n');
      return (
        '*✅ CHAMADO REGISTRADO COM SUCESSO*\n\n' +
        `*Protocolo:* ${protocolo}\n` +
        `*Data/Hora:* ${new Date().toLocaleString('pt-BR')}\n\n` +
        '*Resumo do chamado:*\n' +
        `${resumo.substring(0, 200)}${
          resumo.length > 200 ? '...' : ''
        }\n\n` +
        'Nossa equipe responderá em breve.\n\n' +
        `📞 ${CONTATOS_INSTITUCIONAIS.telefone}\n` +
        `📧 ${CONTATOS_INSTITUCIONAIS.email}\n\n` +
        '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '*📊 AVALIAÇÃO DE ATENDIMENTO*\n\n' +
        'Como você avalia nosso atendimento?\n\n' +
        'Digite um número de 1 a 5:\n' +
        '⭐ 1 - Muito insatisfeito\n' +
        '⭐⭐ 2 - Insatisfeito\n' +
        '⭐⭐⭐ 3 - Neutro\n' +
        '⭐⭐⭐⭐ 4 - Satisfeito\n' +
        '⭐⭐⭐⭐⭐ 5 - Muito satisfeito\n\n' +
        '_Digite o número de 1 a 5..._'
      );
    }
    contexto.dados.mensagensSuporte.push(texto);
    return (
      '*✅ Mensagem registrada!*\n\n' +
      'Continue descrevendo seu problema ou digite *"finalizar"* para concluir.\n\n' +
      `💬 Mensagens registradas: ${contexto.dados.mensagensSuporte.length}`
    );
  }

  // Contexto: aguardando avaliação após suporte
  if (contexto.etapa === 'suporte_aguardando_avaliacao') {
    const aval = parseInt(texto);
    if (aval >= 1 && aval <= 5) {
      contexto.dados.avaliacao = aval;
      contexto.etapa = 'menu';
      const estrelas = '⭐'.repeat(aval);
      return (
        '*🙏 OBRIGADO PELA AVALIAÇÃO!*\n\n' +
        `${estrelas} (${aval}/5)\n\n` +
        `*Protocolo:* ${contexto.dados.protocolo}\n\n` +
        'Sua opinião é muito importante para melhorarmos nossos serviços!\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        montarMenuPrincipal()
      );
    }
    return (
      '*❌ Avaliação inválida*\n\n' +
      'Por favor, digite um número de *1 a 5*: \n\n' +
      '1 - Muito insatisfeito\n' +
      '2 - Insatisfeito\n' +
      '3 - Neutro\n' +
      '4 - Satisfeito\n' +
      '5 - Muito satisfeito'
    );
  }

  // Busca por projeto via keyword
  const lower = texto.toLowerCase();
  if (lower.includes('cispn')) return montarDetalhesProjeto(PROJETOS.cispn);
  if (lower.includes('cisppa')) return montarDetalhesProjeto(PROJETOS.cisppa);
  if (lower.includes('estadio') || lower.includes('estádio'))
    return montarDetalhesProjeto(PROJETOS.estadio);
  if (lower.includes('respad')) return montarDetalhesProjeto(PROJETOS.respad);
  if (lower.includes('vips')) return montarDetalhesProjeto(PROJETOS.vips);

  if (lower.includes('telefone') || lower.includes('contato')) {
    return (
      '*📞 CONTATOS*\n\n' +
      `${CONTATOS_INSTITUCIONAIS.cgoi}\n\n` +
      `Telefone: ${CONTATOS_INSTITUCIONAIS.telefone}\n` +
      `Email: ${CONTATOS_INSTITUCIONAIS.email}\n\n` +
      `${CONTATOS_INSTITUCIONAIS.sede}\n\n` +
      'Digite *menu* para voltar.'
    );
  }

  if (lower.match(/^(obrigad|valeu|thanks)/)) {
    return '😊 Por nada! Estamos à disposição!\n\nDigite *menu* para mais informações.';
  }

  // Resposta padrão
  return '❓ Não compreendi.\n\nDigite *menu* para ver as opções.';
}

// Função sleep auxiliar
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Iniciar bot usando wppconnect
// Execução protegida: o bot só inicia quando este arquivo é executado diretamente via `node bot.js`.
function iniciar() {
  console.log('===========================================');
  console.log('    CHATBOT CISPN/SENASP - INICIANDO...');
  console.log('    Autor: Daniel Lima da Paz');
  console.log(`===========================================
`);

  wppconnect
    .create({
      session: 'bot-session',
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log(`
📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:
`);
        console.log(asciiQR);
        console.log(`
Tentativa:`, attempts);
        console.log('Ou acesse:', urlCode);
        console.log(`
===========================================
`);
      },
      statusFind: (statusSession, session) => {
        console.log('Status:', statusSession);
        console.log('Sessão:', session);
        if (statusSession === 'inChat') {
          console.log(`
✅ BOT CONECTADO E FUNCIONANDO!
`);
          console.log(`Aguardando mensagens...
`);
        }
      },
      headless: true,
      devtools: false,
      useChrome: true,
      debug: false,
      logQR: true,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      autoClose: 60000,
      disableWelcome: true
    })
    .then((client) => iniciarBot(client))
    .catch((error) => {
      console.error('❌ Erro ao iniciar bot:', error);
      process.exit(1);
    });
}
if (require.main === module) {
  iniciar();
}

// Função que conecta eventos e inicia processamento
function iniciarBot(client) {
  console.log('✅ Bot inicializado com sucesso!\n');

  // Monitorar inatividade durante atendimento humano. A cada 30 segundos
  // verifica se o usuário está no modo atendente e não enviou mensagens há
  // pelo menos TIMEOUT_ATENDENTE. Nesse caso, envia uma mensagem solicitando
  // avaliação e altera a etapa para "avaliacao_atendente".
  setInterval(async () => {
    const agora = Date.now();
    for (const [usuario, contexto] of conversas.entries()) {
      const tempoInativo = agora - contexto.ultimaInteracao;
      if (contexto.etapa === 'atendente' && tempoInativo >= TIMEOUT_ATENDENTE) {
        try {
          await client.sendText(
            usuario,
            '❓ Deseja mais alguma coisa? Qual o seu grau de satisfação (1 a 5)? Caso não tenha mais nada, digite *encerrar* para finalizar.'
          );
          contexto.etapa = 'avaliacao_atendente';
          contexto.ultimaInteracao = agora;
        } catch (e) {
          console.error('Erro ao enviar mensagem de avaliação:', e);
        }
      }
    }
  }, 30000);

  client.onMessage(async (message) => {
    try {
      // Ignorar grupos
      if (message.isGroupMsg) return;
      // Ignorar mensagens próprias
      if (message.fromMe) return;
      const texto = (message.body || '').toLowerCase().trim();
      const usuario = message.from;
      console.log(
        `📩 [${new Date().toLocaleTimeString('pt-BR')}] ${
          message.notifyName || usuario
        }: ${texto.substring(0, 60)}`
      );
      // Processar mensagem
      const resposta = await processarMensagem(texto, usuario);
      if (resposta) {
        await client.sendSeen(message.from);
        await client.startTyping(message.from);
        await sleep(1000);
        await client.stopTyping(message.from);
        await client.sendText(message.from, resposta);
        console.log('✅ Resposta enviada!');
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      try {
        await message.reply('❌ Ocorreu um erro. Tente novamente mais tarde.');
      } catch (e) {
        console.error('Erro ao enviar mensagem de erro:', e);
      }
    }
  });
}
