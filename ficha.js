// ficha.js - Gerenciamento de ficha com API

// Importa o serviço de API
const apiService = window.ApiService;

// Constantes
const CONSTANTES = {
  IDS: {
    NIVEL: 'nivel',
    VIDA: 'vida',
    SANIDADE: 'sanidade',
    MANA: 'mana',
    ALMA: 'alma',
    DEFESA: 'defesa',
    ESQUIVA: 'esquiva',
    BLOQUEIO: 'bloqueio'
  },
  CLASSES: {
    BARRA_NIVEL: 'nivel-barra',
    BARRA_NIVEL_PROGRESSO: 'nivel-progresso',
    BARRA_VIDA: 'barra-vida',
    BARRA_SANIDADE: 'barra-sanidade',
    BARRA_MANA: 'barra-mana',
    BARRA_ALMA: 'barra-alma',
    BARRA_PROGRESSO: 'barra-progresso',
    STATUS_GRUPO: 'status-grupo',
    STATUS_VALORES: 'status-valores',
    STATUS_INPUT: 'status-input'
  }
};

// Valores base para os status
const STATUS_BASE = {
  VIDA: {
    BASE: 20,
    POR_NIVEL: 5
  },
  SANIDADE: {
    BASE: 10,
    POR_NIVEL: 3
  },
  MANA: {
    BASE: 15,
    POR_NIVEL: 4
  },
  ALMA: {
    BASE: 15,
    POR_NIVEL: 3
  },
  DEFESA: {
    BASE: 10,
    POR_NIVEL: 2
  },
  ESQUIVA: {
    BASE: 0,
    POR_NIVEL: 1.5
  },
  BLOQUEIO: {
    BASE: 0,
    POR_NIVEL: 1
  }
};

// Valores padrão para nova ficha
const VALORES_PADRAO = {
  NIVEL: 0,
  VIDA: {
    ATUAL: 20,
    MAX: 20
  },
  SANIDADE: {
    ATUAL: 10,
    MAX: 10
  },
  MANA: {
    ATUAL: 15,
    MAX: 15
  },
  ALMA: {
    ATUAL: 15,
    MAX: 15
  },
  DEFESA: 10,
  ESQUIVA: 0,
  BLOQUEIO: 0
};

// Funções de inicialização e carregamento
window.obterIdDaUrl = function () {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function gerarNovoId() {
  try {
    const personagens = await apiService.getPersonagens();
    if (!Array.isArray(personagens) || personagens.length === 0) {
      return '0';
    }
    // Encontra o maior ID e adiciona 1
    const maiorId = Math.max(...personagens.map(p => parseInt(p.id)));
    return (maiorId + 1).toString();
  } catch (error) {
    console.error('Erro ao gerar novo ID:', error);
    return '0';
  }
}

// Funções de validação
function validarCampoNumerico(valor, min = 0, max = 999) {
  const num = parseInt(valor);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

// Função principal de inicialização
function inicializarFicha() {
  console.log('Iniciando configuração da ficha...');

  // Primeiro, verifica se todos os elementos necessários existem
  const elementosNecessarios = [
    'vida', 'vidaMaxima',
    'sanidade', 'sanidadeMaxima',
    'mana', 'manaMaxima',
    'alma', 'almaMaxima',
    'resiliencia', 'intelecto',
    'carisma', 'magia', 'nivel'
  ];

  const elementosEncontrados = elementosNecessarios.every(id => {
    const elemento = document.getElementById(id);
    if (!elemento) {
      console.log(`Elemento ${id} não encontrado`);
      return false;
    }
    return true;
  });

  if (!elementosEncontrados) {
    console.error('Nem todos os elementos necessários foram encontrados');
    return;
  }

  console.log('Todos os elementos necessários foram encontrados');

  // Configurar event listeners para os campos de status
  ['vida', 'sanidade', 'mana', 'alma'].forEach(status => {
    const input = document.getElementById(status);
    const maxInput = document.getElementById(status + 'Maxima');

    if (input) {
      input.addEventListener('change', () => {
        console.log(`Atualizando barra de ${status}`);
        atualizarTodasBarras();
      });
      input.addEventListener('input', () => {
        console.log(`Atualizando barra de ${status}`);
        atualizarTodasBarras();
      });
    }
  });

  // Configurar event listeners para os atributos
  ['resiliencia', 'intelecto', 'carisma', 'magia', 'nivel'].forEach(atributo => {
    const input = document.getElementById(atributo);
    if (input) {
      input.addEventListener('change', () => {
        console.log(`Atualizando valores por mudança em ${atributo}`);
        atualizarValoresPorAtributos();
      });
      input.addEventListener('input', () => {
        console.log(`Atualizando valores por input em ${atributo}`);
        atualizarValoresPorAtributos();
      });
    }
  });

  // Carregar dados iniciais
  const fichaId = obterIdDaUrl();
  if (fichaId) {
    carregarFicha();
  } else {
    // Inicializa com valores padrão e força atualização
    inicializarValoresPadrao();
    setTimeout(() => {
      console.log('Forçando atualização inicial dos valores...');
      atualizarValoresPorAtributos();
    }, 0);
  }

  // Forçar atualização das barras após um pequeno delay
  setTimeout(() => {
    console.log('Forçando atualização inicial das barras...');
    atualizarTodasBarras();
  }, 100);
}

// Função para atualizar todas as barras
function atualizarTodasBarras() {
  console.log('Atualizando todas as barras...');

  const barras = {
    vida: { atual: 'vida', max: 'vidaMaxima', classe: 'barra-vida' },
    sanidade: { atual: 'sanidade', max: 'sanidadeMaxima', classe: 'barra-sanidade' },
    mana: { atual: 'mana', max: 'manaMaxima', classe: 'barra-mana' },
    alma: { atual: 'alma', max: 'almaMaxima', classe: 'barra-alma' }
  };

  Object.entries(barras).forEach(([nome, config]) => {
    const atualElement = document.getElementById(config.atual);
    const maxElement = document.getElementById(config.max);
    const barra = document.querySelector(`.${config.classe}`);

    if (atualElement && maxElement && barra) {
      const atual = parseInt(atualElement.value) || 0;
      const max = parseInt(maxElement.value) || 1; // Evita divisão por zero

      // Garante que o valor atual não exceda o máximo
      if (atual > max) {
        atualElement.value = max;
      }

      // Calcula a proporção (entre 0 e 1)
      const proporcao = Math.max(0, Math.min(1, atual / max));

      console.log(`${nome}: ${atual}/${max} = ${proporcao * 100}%`);

      // Atualiza a barra usando transform scale
      barra.style.width = `${proporcao * 100}%`;
    } else {
      console.warn(`Elementos não encontrados para ${nome}`);
    }
  });
}

// Adiciona event listeners para os campos máximos
document.addEventListener('DOMContentLoaded', function () {
  const maxFields = ['vidaMaxima', 'sanidadeMaxima', 'manaMaxima', 'almaMaxima'];
  maxFields.forEach(field => {
    const element = document.getElementById(field);
    if (element) {
      element.addEventListener('change', atualizarTodasBarras);
      element.addEventListener('input', atualizarTodasBarras);
    }
  });
});

// Modificar o DOMContentLoaded para usar a nova função de inicialização
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM carregado, iniciando configuração...');

  // Usar requestAnimationFrame para garantir que o DOM está pronto
  window.requestAnimationFrame(() => {
    inicializarFicha();
  });
});

async function salvarFicha() {
  console.log('Função salvarFicha iniciada');

  // Mostrar loading inicial
  Swal.fire({
    title: 'Salvando...',
    text: 'Enviando dados para o servidor',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Verificar se o apiService está disponível
    if (!apiService) {
      throw new Error('Serviço de API não disponível');
    }

    // Obter ID da ficha atual ou gerar um novo
    let fichaId = obterIdDaUrl();
    if (!fichaId) {
      fichaId = await gerarNovoId();
    }

    // Função auxiliar para obter valor do elemento com validação
    const getElementValue = (id, defaultValue = '') => {
      const element = document.getElementById(id);
      return element ? element.value || defaultValue : defaultValue;
    };

    // Coletando todos os dados da ficha
    const dadosFicha = {
      id: fichaId,
      nome: getElementValue('nome', ''),
      // Informações básicas
      idade: getElementValue('idade', ''),
      data_nascimento: getElementValue('data_nascimento', ''),
      altura: getElementValue('altura', ''),
      tipo_sanguineo: getElementValue('tipo_sanguineo', ''),
      sexualidade: getElementValue('sexualidade', ''),
      // Status principais
      nivel: validarCampoNumerico(getElementValue('nivel', '0')),
      vida: validarCampoNumerico(getElementValue('vida', '0')),
      vidaMaxima: validarCampoNumerico(getElementValue('vidaMaxima', '20')),
      sanidade: validarCampoNumerico(getElementValue('sanidade', '0')),
      sanidadeMaxima: validarCampoNumerico(getElementValue('sanidadeMaxima', '10')),
      mana: validarCampoNumerico(getElementValue('mana', '0')),
      manaMaxima: validarCampoNumerico(getElementValue('manaMaxima', '15')),
      alma: validarCampoNumerico(getElementValue('alma', '0')),
      almaMaxima: validarCampoNumerico(getElementValue('almaMaxima', '15')),
      // Status de combate
      defesa: validarCampoNumerico(getElementValue('defesa', '0')),
      esquiva: validarCampoNumerico(getElementValue('esquiva', '0')),
      bloqueio: validarCampoNumerico(getElementValue('bloqueio', '0')),
      iniciativa: validarCampoNumerico(getElementValue('iniciativa', '0')),
      deslocamento: validarCampoNumerico(getElementValue('deslocamento', '0')),
      // Informações do personagem
      raca: getElementValue('raca', ''),
      origem: getElementValue('origem', ''),
      classe: getElementValue('classe', ''),
      // Atributos
      forca: validarCampoNumerico(getElementValue('forca', '0')),
      destreza: validarCampoNumerico(getElementValue('destreza', '0')),
      constituicao: validarCampoNumerico(getElementValue('constituicao', '0')),
      intelecto: validarCampoNumerico(getElementValue('intelecto', '0')),
      sabedoria: validarCampoNumerico(getElementValue('sabedoria', '0')),
      carisma: validarCampoNumerico(getElementValue('carisma', '0')),
      resiliencia: validarCampoNumerico(getElementValue('resiliencia', '0')),
      magia: validarCampoNumerico(getElementValue('magia', '0')),
      pericias: {}
    };

    // Coletando dados das perícias
    document.querySelectorAll('input[data-pericia]').forEach(input => {
      dadosFicha.pericias[input.dataset.pericia] = input.value;
    });

    console.log('Dados coletados, tentando salvar...');

    // Tentativa de salvar com retry
    let tentativas = 0;
    const maxTentativas = 3;
    let salvou = false;

    while (tentativas < maxTentativas && !salvou) {
      try {
        // Salvando na API
        if (fichaId) {
          await apiService.atualizarPersonagem(fichaId, dadosFicha);
        } else {
          await apiService.criarPersonagem(dadosFicha);
        }
        salvou = true;
      } catch (error) {
        tentativas++;
        console.error(`Tentativa ${tentativas}/${maxTentativas} falhou:`, error);

        if (tentativas >= maxTentativas) {
          throw error;
        }

        // Atualiza mensagem do loading
        Swal.update({
          text: `Tentativa ${tentativas}/${maxTentativas} falhou. Tentando novamente...`
        });

        // Aguarda 2 segundos antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('Ficha salva com sucesso!');

    Swal.fire({
      title: 'Sucesso!',
      text: 'Ficha salva com sucesso!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error('Erro ao salvar ficha:', error);

    let mensagemErro = 'Não foi possível salvar a ficha. ';

    if (error.message.includes('Failed to fetch') || error.message.includes('conectar ao servidor')) {
      mensagemErro += 'Verifique sua conexão com a internet e se o servidor está online.';
    } else if (error.name === 'AbortError') {
      mensagemErro += 'O servidor está demorando muito para responder. Por favor, tente novamente em alguns minutos.';
    } else {
      mensagemErro += error.message || 'Erro desconhecido.';
    }

    Swal.fire({
      title: 'Erro ao Salvar',
      text: mensagemErro,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

function calcularVida() {
  const resiliencia = parseInt(document.getElementById('resiliencia')?.value) || 0;
  const nivel = parseInt(document.getElementById('nivel')?.value) || 0;
  return (resiliencia * 3) + 20 + (nivel * 5);
}

function calcularSanidade() {
  const intelecto = parseInt(document.getElementById('intelecto')?.value) || 0;
  const carisma = parseInt(document.getElementById('carisma')?.value) || 0;
  return (intelecto * 5) + (carisma * 3) + 10;
}

function calcularMana() {
  return 15; // Valor fixo
}

function calcularAlma() {
  const magia = parseInt(document.getElementById('magia')?.value) || 0;
  const resiliencia = parseInt(document.getElementById('resiliencia')?.value) || 0;
  const intelecto = parseInt(document.getElementById('intelecto')?.value) || 0;
  return (magia * 5) + (resiliencia * 3) + (intelecto * 2) + 15;
}

function inicializarValoresPadrao() {
  console.log('Inicializando valores padrão...');

  // Primeiro inicializa os atributos base
  const atributos = {
    nivel: 0,
    resiliencia: 0,
    intelecto: 0,
    carisma: 0,
    magia: 0
  };

  // Atualiza os atributos
  Object.entries(atributos).forEach(([campo, valor]) => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.value = valor;
      console.log(`Inicializando atributo ${campo} com valor ${valor}`);
    }
  });

  // Calcula os valores máximos
  const vidaMax = calcularVida();
  const sanidadeMax = calcularSanidade();
  const manaMax = calcularMana();
  const almaMax = calcularAlma();

  console.log('Valores máximos calculados:', {
    vidaMax,
    sanidadeMax,
    manaMax,
    almaMax
  });

  // Define os valores iniciais
  const valores = {
    vida: vidaMax,
    vidaMaxima: vidaMax,
    sanidade: sanidadeMax,
    sanidadeMaxima: sanidadeMax,
    mana: manaMax,
    manaMaxima: manaMax,
    alma: almaMax,
    almaMaxima: almaMax,
    defesa: STATUS_BASE.DEFESA.BASE,
    esquiva: STATUS_BASE.ESQUIVA.BASE,
    bloqueio: STATUS_BASE.BLOQUEIO.BASE
  };

  // Atualiza os campos com os valores calculados
  Object.entries(valores).forEach(([campo, valor]) => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.value = valor;
      console.log(`Inicializando status ${campo} com valor ${valor}`);
    }
  });

  // Força atualização das barras
  setTimeout(() => {
    console.log('Atualizando barras após inicialização dos valores padrão...');
    atualizarTodasBarras();
  }, 100);
}

async function carregarFicha() {
  try {
    const fichaId = obterIdDaUrl();
    if (!fichaId) {
      inicializarValoresPadrao();
      return;
    }

    const ficha = await apiService.getPersonagem(fichaId);
    if (!ficha) {
      throw new Error('Ficha não encontrada');
    }

    // Preencher dados básicos
    document.getElementById('nome').value = ficha.nome || '';
    document.getElementById('nivel').value = ficha.nivel || '0';

    // Preencher atributos primeiro
    const atributos = ['forca', 'destreza', 'constituicao', 'intelecto', 'sabedoria', 'carisma', 'resiliencia', 'magia'];
    atributos.forEach(atributo => {
      const input = document.getElementById(atributo);
      if (input) {
        input.value = ficha[atributo] || '0';
      }
    });

    // Calcular valores máximos
    const vidaMaxima = calcularVidaMaxima();
    const sanidadeMaxima = calcularSanidadeMaxima();
    const manaMaxima = 15; // Valor fixo
    const almaMaxima = calcularAlmaMaxima();

    // Preencher status vitais com os valores calculados
    document.getElementById('vidaMaxima').value = vidaMaxima;
    document.getElementById('sanidadeMaxima').value = sanidadeMaxima;
    document.getElementById('manaMaxima').value = manaMaxima;
    document.getElementById('almaMaxima').value = almaMaxima;

    // Preencher valores atuais (usando valores máximos se não houver valor salvo)
    document.getElementById('vida').value = ficha.vida !== undefined ? Math.min(ficha.vida, vidaMaxima) : vidaMaxima;
    document.getElementById('sanidade').value = ficha.sanidade !== undefined ? Math.min(ficha.sanidade, sanidadeMaxima) : sanidadeMaxima;
    document.getElementById('mana').value = ficha.mana !== undefined ? Math.min(ficha.mana, manaMaxima) : manaMaxima;
    document.getElementById('alma').value = ficha.alma !== undefined ? Math.min(ficha.alma, almaMaxima) : almaMaxima;

    // Forçar atualização das barras
    setTimeout(() => {
      console.log('Atualizando barras após carregar ficha...');
      atualizarTodasBarras();
    }, 100);

  } catch (error) {
    console.error('Erro ao carregar ficha:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro ao Carregar Ficha',
      text: 'Não foi possível carregar os dados. Verifique sua conexão.',
      confirmButtonText: 'OK'
    });
    inicializarValoresPadrao();
  }
}

function calcularVidaMaxima() {
  const resiliencia = parseInt(document.getElementById('resiliencia').value) || 0;
  const nivel = parseInt(document.getElementById('nivel').value) || 0;
  return (resiliencia * 3) + 20 + (nivel * 5);
}

function calcularSanidadeMaxima() {
  const intelecto = parseInt(document.getElementById('intelecto').value) || 0;
  const carisma = parseInt(document.getElementById('carisma').value) || 0;
  return (intelecto * 5) + (carisma * 3) + 10;
}

function calcularAlmaMaxima() {
  const magia = parseInt(document.getElementById('magia').value) || 0;
  const resiliencia = parseInt(document.getElementById('resiliencia').value) || 0;
  const intelecto = parseInt(document.getElementById('intelecto').value) || 0;
  return (magia * 5) + (resiliencia * 3) + (intelecto * 2) + 15;
}

function atualizarValoresPorAtributos() {
  console.log('Atualizando valores por atributos...');

  // Calcula os novos valores máximos
  const vidaMax = calcularVida();
  const sanidadeMax = calcularSanidade();
  const manaMax = calcularMana();
  const almaMax = calcularAlma();

  console.log('Valores máximos calculados:', {
    vidaMax,
    sanidadeMax,
    manaMax,
    almaMax
  });

  // Obtém os elementos dos valores atuais
  const vidaAtual = document.getElementById('vida');
  const sanidadeAtual = document.getElementById('sanidade');
  const manaAtual = document.getElementById('mana');
  const almaAtual = document.getElementById('alma');

  // Obtém os elementos dos valores máximos
  const vidaMaxElement = document.getElementById('vidaMaxima');
  const sanidadeMaxElement = document.getElementById('sanidadeMaxima');
  const manaMaxElement = document.getElementById('manaMaxima');
  const almaMaxElement = document.getElementById('almaMaxima');

  // Atualiza os valores máximos
  if (vidaMaxElement) vidaMaxElement.value = vidaMax;
  if (sanidadeMaxElement) sanidadeMaxElement.value = sanidadeMax;
  if (manaMaxElement) manaMaxElement.value = manaMax;
  if (almaMaxElement) almaMaxElement.value = almaMax;

  // Se os valores atuais forem 0 ou undefined, usa os valores máximos
  if (vidaAtual && (parseInt(vidaAtual.value) === 0 || !vidaAtual.value)) {
    vidaAtual.value = vidaMax;
  }
  if (sanidadeAtual && (parseInt(sanidadeAtual.value) === 0 || !sanidadeAtual.value)) {
    sanidadeAtual.value = sanidadeMax;
  }
  if (manaAtual && (parseInt(manaAtual.value) === 0 || !manaAtual.value)) {
    manaAtual.value = manaMax;
  }
  if (almaAtual && (parseInt(almaAtual.value) === 0 || !almaAtual.value)) {
    almaAtual.value = almaMax;
  }

  // Atualiza as barras de progresso
  console.log('Atualizando barras de progresso...');
  atualizarTodasBarras();
}

// Funções de seleção de raça, classe e origem
function abrirSeletorRacas() {
  const racas = [
    'Alien', 'Anão', 'Anjo', 'Anjo Caído', 'Banshee', 'Bruxa', 'Ciborgue',
    'Demônio', 'Elfo', 'Esqueleto', 'Fae', 'Fauno/Sátiro', 'Humano',
    'Kanima', 'Kitsune', 'Lobisomem', 'Metamorfo', 'Neko', 'Nogitsune',
    'Semideus', 'Sereia/Tritão', 'Siren', 'Súcubo', 'Vampiro'
  ];

  Swal.fire({
    title: 'Selecione a Raça',
    html: `
      <div class="raca-list">
        ${racas.map(raca => `
          <div class="raca-item" onclick="selecionarRaca('${raca}')">
            ${raca}
          </div>
        `).join('')}
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true
  });
}

function abrirSeletorClasses() {
  const classes = [
    'Armadilheiro', 'Atirador', 'Carteado', 'Clérigo', 'Combatente',
    'Curandeiro', 'Demonologista', 'Domador', 'Espião', 'Investigador',
    'Mago', 'Suporte', 'Tecnológico'
  ];

  Swal.fire({
    title: 'Selecione a Classe',
    html: `
      <div class="classe-list">
        ${classes.map(classe => `
          <div class="classe-item" onclick="selecionarClasse('${classe}')">
            ${classe}
          </div>
        `).join('')}
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true
  });
}

function abrirSeletorOrigens() {
  const origens = [
    'Amnésico', 'Artista', 'Conspiracionista', 'Criança Perdida',
    'Eremita', 'Escolhido', 'Exilado', 'Experimento', 'Forasteiro',
    'Ginasta', 'Herdeiro', 'Inventor', 'Jornalista', 'Militar',
    'Motorista', 'Profeta', 'Programador', 'Psicólogo', 'Religioso',
    'Servente', 'Universitário', 'Vingativo'
  ];

  Swal.fire({
    title: 'Selecione a Origem',
    html: `
      <div class="origem-list">
        ${origens.map(origem => `
          <div class="origem-item" onclick="selecionarOrigem('${origem}')">
            ${origem}
          </div>
        `).join('')}
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true
  });
}

function selecionarRaca(raca) {
  document.querySelector('#raca').value = raca;
  Swal.close();
}

function selecionarClasse(classe) {
  document.querySelector('#classe').value = classe;
  Swal.close();
}

function selecionarOrigem(origem) {
  document.querySelector('#origem').value = origem;
  Swal.close();
}

// Funções de seleção
function selecionarItem(elemento, lista, tipo) {
  const items = lista.querySelectorAll(`.${tipo}-item`);
  items.forEach(item => item.classList.remove(CONSTANTES.CLASSES.ACTIVE));
  elemento.classList.add(CONSTANTES.CLASSES.ACTIVE);
  salvarDados();
}

// Funções de atualização de status
function atualizarBarraStatus(input) {
  const valor = parseInt(input.value) || 0;
  const max = parseInt(input.max) || 100;
  const porcentagem = (valor / max) * 100;

  const barra = input.parentElement.querySelector(`.barra-${input.id}`);
  if (barra) {
    barra.style.width = `${porcentagem}%`;
  }
}

// Funções de perícias
function toggleSubPericias(pericia) {
  const subPericias = pericia.nextElementSibling;
  if (subPericias && subPericias.classList.contains(CONSTANTES.CLASSES.SUB_PERICIAS)) {
    subPericias.classList.toggle(CONSTANTES.CLASSES.VISIBLE);
    pericia.classList.toggle(CONSTANTES.CLASSES.ACTIVE);
  }
}

// Função para salvar dados (redirecionando para salvarFicha para evitar duplicação)
async function salvarDados() {
  // Redireciona para a função principal de salvar
  await salvarFicha();
}

// Função para atualizar a barra de progresso
function atualizarBarraProgresso(id, valor, valorMaximo) {
  const barra = document.querySelector(`.barra-${id}`);
  if (barra && valorMaximo > 0) {
    const porcentagem = (valor / valorMaximo) * 100;
    barra.style.setProperty('--porcentagem', `${porcentagem}%`);
  }
}

// Função para atualizar todos os status
function atualizarStatus() {
  const nivel = parseInt(document.getElementById('nivel').value) || 0;
  const resiliencia = parseInt(document.querySelector('[data-attribute="resiliencia"]').nextElementSibling.value) || 0;
  const intelecto = parseInt(document.querySelector('[data-attribute="intelecto"]').nextElementSibling.value) || 0;
  const carisma = parseInt(document.querySelector('[data-attribute="carisma"]').nextElementSibling.value) || 0;
  const magia = parseInt(document.querySelector('[data-attribute="magia"]').nextElementSibling.value) || 0;

  // Calcular valores máximos
  const vidaMaxima = (resiliencia * 3) + 20 + (nivel * 5);
  const sanidadeMaxima = (intelecto * 5) + (carisma * 3) + 10;
  const manaMaxima = 15;
  const almaMaxima = (magia * 5) + (resiliencia * 3) + (intelecto * 2) + 15;

  // Atualizar campos máximos
  document.getElementById('vidaMaxima').value = vidaMaxima;
  document.getElementById('sanidadeMaxima').value = sanidadeMaxima;
  document.getElementById('manaMaxima').value = manaMaxima;
  document.getElementById('almaMaxima').value = almaMaxima;

  // Limitar valores atuais aos máximos
  const vida = document.getElementById('vida');
  const sanidade = document.getElementById('sanidade');
  const mana = document.getElementById('mana');
  const alma = document.getElementById('alma');

  vida.value = Math.min(parseInt(vida.value) || 0, vidaMaxima);
  sanidade.value = Math.min(parseInt(sanidade.value) || 0, sanidadeMaxima);
  mana.value = Math.min(parseInt(mana.value) || 0, manaMaxima);
  alma.value = Math.min(parseInt(alma.value) || 0, almaMaxima);

  // Atualizar barras de progresso
  atualizarBarraProgresso('vida', vida.value, vidaMaxima);
  atualizarBarraProgresso('sanidade', sanidade.value, sanidadeMaxima);
  atualizarBarraProgresso('mana', mana.value, manaMaxima);
  atualizarBarraProgresso('alma', alma.value, almaMaxima);
}

// Adicionar event listeners para os campos que afetam os status
document.addEventListener('DOMContentLoaded', function () {
  const camposStatus = ['nivel', 'vida', 'sanidade', 'mana', 'alma'];
  const camposAtributos = ['resiliencia', 'intelecto', 'carisma', 'magia'];

  // Adicionar listeners para campos de status
  camposStatus.forEach(campo => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.addEventListener('input', atualizarStatus);
    }
  });

  // Adicionar listeners para atributos que afetam os status
  camposAtributos.forEach(atributo => {
    const elemento = document.querySelector(`[data-attribute="${atributo}"]`).nextElementSibling;
    if (elemento) {
      elemento.addEventListener('input', atualizarStatus);
    }
  });

  // Atualizar status inicialmente
  atualizarStatus();
});

// Modificar a função carregarDados para incluir os valores máximos
async function carregarDados(id) {
  try {
    const personagem = await apiService.getPersonagem(id);
    if (personagem) {
      // ... código existente para carregar dados ...

      // Atualizar status após carregar os dados
      atualizarStatus();
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro ao carregar dados',
      text: error.message
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Adiciona listeners para os atributos que afetam os cálculos
  const atributos = ['resiliencia', 'intelecto', 'carisma', 'magia', 'nivel'];
  atributos.forEach(atributo => {
    const elemento = document.getElementById(atributo);
    if (elemento) {
      elemento.addEventListener('input', atualizarValoresPorAtributos);
    }
  });

  // Adiciona event listener para o botão de salvar
  const btnSalvar = document.getElementById('btnSalvarFicha');
  if (btnSalvar) {
    console.log('Configurando botão de salvar...');
    btnSalvar.addEventListener('click', salvarFicha);
  } else {
    console.error('Botão de salvar não encontrado!');
  }

  // Calcula os valores iniciais
  atualizarValoresPorAtributos();
});

