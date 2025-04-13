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

// Funções de salvamento e carregamento
// Adiciona event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
  const btnSalvar = document.getElementById('btnSalvarFicha');
  const btnOBS = document.getElementById('btnOBS');

  if (btnSalvar) {
    btnSalvar.addEventListener('click', salvarFicha);
  }

  if (btnOBS) {
    btnOBS.addEventListener('click', window.abrirOBS);
  }
});

async function salvarFicha() {
  try {
    // Verificar se o serviço de API está disponível
    if (!window.ApiService) {
      console.error('Serviço de API não encontrado');
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Serviço de API não disponível. Recarregue a página e tente novamente.'
      });
      return;
    }

    let fichaId = obterIdDaUrl();
    if (!fichaId) {
      // Se não houver ID na URL, gerar um novo ID
      fichaId = await gerarNovoId();
    }

    // Função auxiliar para obter valor do elemento com validação
    const getElementValue = (id, defaultValue = '') => {
      const element = document.getElementById(id);
      return element ? element.value || defaultValue : defaultValue;
    };

    const getElementMax = (id, defaultValue = '') => {
      const element = document.getElementById(id);
      return element ? element.max || defaultValue : defaultValue;
    };

    // Coleta todos os dados da ficha com validação
    const dadosFicha = {
      id: fichaId,
      nome: getElementValue('nome', ''),
      nivel: validarCampoNumerico(getElementValue('nivel', '0')),
      vida: validarCampoNumerico(getElementValue('vida', '0')),
      vidaMaxima: validarCampoNumerico(getElementMax('vida', '20')),
      sanidade: validarCampoNumerico(getElementValue('sanidade', '0')),
      sanidadeMaxima: validarCampoNumerico(getElementMax('sanidade', '10')),
      mana: validarCampoNumerico(getElementValue('mana', '0')),
      manaMaxima: validarCampoNumerico(getElementMax('mana', '15')),
      alma: validarCampoNumerico(getElementValue('alma', '0')),
      almaMaxima: validarCampoNumerico(getElementMax('alma', '15')),
      defesa: validarCampoNumerico(getElementValue('defesa', '0')),
      esquiva: validarCampoNumerico(getElementValue('esquiva', '0')),
      bloqueio: validarCampoNumerico(getElementValue('bloqueio', '0'))
    };

    // Validação básica dos dados
    if (!dadosFicha.nome) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Por favor, preencha o nome do personagem'
      });
      return;
    }

    try {
      // Verificar conexão com a API antes de tentar salvar
      try {
        await fetch(`${API_URL}/personagens`, { method: 'HEAD' });
      } catch (connectionError) {
        console.error('Erro de conexão com a API:', connectionError);
        Swal.fire({
          icon: 'error',
          title: 'Erro de Conexão',
          text: 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando e tente novamente.'
        });
        return;
      }

      if (fichaId) {
        // Atualiza ficha existente
        await apiService.atualizarPersonagem(fichaId, dadosFicha);
      } else {
        // Cria nova ficha
        await apiService.criarPersonagem(dadosFicha);
      }

      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Ficha salva com sucesso!',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Erro ao acessar API:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: `Erro ao salvar na API: ${error.message || 'Verifique sua conexão com o servidor'}`
      });
    }

  } catch (error) {
    console.error('Erro ao salvar ficha:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Ocorreu um erro ao salvar a ficha. Por favor, verifique os dados e tente novamente.'
    });
  }
}

function inicializarValoresPadrao() {
  // Define nível
  document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value = VALORES_PADRAO.NIVEL;

  // Define valores de vida
  document.querySelector(`#${CONSTANTES.IDS.VIDA}`).value = VALORES_PADRAO.VIDA.ATUAL;
  document.querySelector(`#${CONSTANTES.IDS.VIDA_MAX}`).value = VALORES_PADRAO.VIDA.MAX;

  // Define valores de sanidade
  document.querySelector(`#${CONSTANTES.IDS.SANIDADE}`).value = VALORES_PADRAO.SANIDADE.ATUAL;
  document.querySelector(`#${CONSTANTES.IDS.SANIDADE_MAX}`).value = VALORES_PADRAO.SANIDADE.MAX;

  // Define valores de mana
  document.querySelector(`#${CONSTANTES.IDS.MANA}`).value = VALORES_PADRAO.MANA.ATUAL;
  document.querySelector(`#${CONSTANTES.IDS.MANA_MAX}`).value = VALORES_PADRAO.MANA.MAX;

  // Define valores de alma
  document.querySelector(`#${CONSTANTES.IDS.ALMA}`).value = VALORES_PADRAO.ALMA.ATUAL;
  document.querySelector(`#${CONSTANTES.IDS.ALMA_MAX}`).value = VALORES_PADRAO.ALMA.MAX;

  // Define valores de combate
  document.querySelector(`#${CONSTANTES.IDS.DEFESA}`).value = VALORES_PADRAO.DEFESA;
  document.querySelector(`#${CONSTANTES.IDS.ESQUIVA}`).value = VALORES_PADRAO.ESQUIVA;
  document.querySelector(`#${CONSTANTES.IDS.BLOQUEIO}`).value = VALORES_PADRAO.BLOQUEIO;

  // Atualiza todas as barras
  atualizarBarraNivel();
  atualizarBarraVida();
  atualizarBarraSanidade();
  atualizarBarraMana();
  atualizarBarraAlma();
  calcularDefesaTotal();
}

async function carregarFicha() {
  try {
    const fichaId = obterIdDaUrl();
    if (!fichaId) {
      inicializarValoresPadrao();
      return;
    }

    // Usa a API para obter a ficha pelo ID
    try {
      const ficha = await apiService.getPersonagem(fichaId);
      
      if (!ficha) {
        inicializarValoresPadrao();
        return;
      }

      // Preenche os campos com os dados da ficha
      document.getElementById('nome').value = ficha.nome || '';
      document.getElementById('nivel').value = ficha.nivel || '0';

      // Atualiza barras de status
      const statusBars = ['vida', 'sanidade', 'mana', 'alma'];
      statusBars.forEach(status => {
        const input = document.getElementById(status);
        const maxValue = ficha[status + 'Maxima'];
        const value = ficha[status];

        if (input) {
          input.max = maxValue;
          input.value = value;
          atualizarBarraStatus(input);
        }
      });

      // Atualiza valores de combate
      document.getElementById('defesa').value = ficha.defesa || '10';
      document.getElementById('esquiva').value = ficha.esquiva || '0';
      document.getElementById('bloqueio').value = ficha.bloqueio || '0';

      // Atualiza barra de nível
      atualizarBarraStatus('nivel', ficha.nivel || '0', 100);
    } catch (error) {
      console.error('Erro ao buscar ficha da API:', error);
      inicializarValoresPadrao();
    }

  } catch (error) {
    console.error('Erro ao carregar ficha:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Ocorreu um erro ao carregar a ficha. Verifique sua conexão com o servidor.'
    });
    inicializarValoresPadrao();
  }
}

// Funções de atualização da interface
function atualizarBarraVida() {
  const nivel = parseInt(document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value) || 1;
  const vidaMax = STATUS_BASE.VIDA.BASE + (STATUS_BASE.VIDA.POR_NIVEL * (nivel - 1));
  const vidaAtual = parseInt(document.querySelector(`#${CONSTANTES.IDS.VIDA}`).value) || 0;

  document.querySelector(`#${CONSTANTES.IDS.VIDA_MAX}`).value = vidaMax;
  const porcentagem = Math.min(100, Math.max(0, (vidaAtual / vidaMax) * 100));

  const barra = document.querySelector(`.${CONSTANTES.CLASSES.BARRA_VIDA}`);
  if (barra) {
    barra.style.width = `${porcentagem}%`;
    atualizarCorBarra(barra, porcentagem);
  }
}

function atualizarBarraSanidade() {
  const nivel = parseInt(document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value) || 1;
  const sanidadeMax = STATUS_BASE.SANIDADE.BASE + (STATUS_BASE.SANIDADE.POR_NIVEL * (nivel - 1));
  const sanidadeAtual = parseInt(document.querySelector(`#${CONSTANTES.IDS.SANIDADE}`).value) || 0;

  document.querySelector(`#${CONSTANTES.IDS.SANIDADE_MAX}`).value = sanidadeMax;
  const porcentagem = Math.min(100, Math.max(0, (sanidadeAtual / sanidadeMax) * 100));

  const barra = document.querySelector(`.${CONSTANTES.CLASSES.BARRA_SANIDADE}`);
  if (barra) {
    barra.style.width = `${porcentagem}%`;
    atualizarCorBarra(barra, porcentagem);
  }
}

function atualizarBarraMana() {
  const nivel = parseInt(document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value) || 1;
  const manaMax = STATUS_BASE.MANA.BASE + (STATUS_BASE.MANA.POR_NIVEL * (nivel - 1));
  const manaAtual = parseInt(document.querySelector(`#${CONSTANTES.IDS.MANA}`).value) || 0;

  document.querySelector(`#${CONSTANTES.IDS.MANA_MAX}`).value = manaMax;
  const porcentagem = Math.min(100, Math.max(0, (manaAtual / manaMax) * 100));

  const barra = document.querySelector(`.${CONSTANTES.CLASSES.BARRA_MANA}`);
  if (barra) {
    barra.style.width = `${porcentagem}%`;
    atualizarCorBarra(barra, porcentagem);
  }
}

function atualizarBarraAlma() {
  const nivel = parseInt(document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value) || 1;
  const almaMax = STATUS_BASE.ALMA.BASE + (STATUS_BASE.ALMA.POR_NIVEL * (nivel - 1));
  const almaAtual = parseInt(document.querySelector(`#${CONSTANTES.IDS.ALMA}`).value) || 0;

  document.querySelector(`#${CONSTANTES.IDS.ALMA_MAX}`).value = almaMax;
  const porcentagem = Math.min(100, Math.max(0, (almaAtual / almaMax) * 100));

  const barra = document.querySelector(`.${CONSTANTES.CLASSES.BARRA_ALMA}`);
  if (barra) {
    barra.style.width = `${porcentagem}%`;
    atualizarCorBarra(barra, porcentagem);
  }
}

function atualizarCorBarra(barra, porcentagem) {
  if (porcentagem <= 25) {
    barra.style.backgroundColor = 'var(--danger-color, #ff4444)';
  } else if (porcentagem <= 50) {
    barra.style.backgroundColor = 'var(--warning-color, #ffbb33)';
  } else {
    barra.style.backgroundColor = 'var(--success-color, #00C851)';
  }
}

function atualizarBarraNivel() {
  const nivel = parseInt(document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value) || 1;
  const nivelMax = 100;
  const porcentagem = Math.min(100, Math.max(0, (nivel / nivelMax) * 100));

  const barra = document.querySelector(`.${CONSTANTES.CLASSES.BARRA_NIVEL_PROGRESSO}`);
  if (barra) {
    barra.style.width = `${porcentagem}%`;
  }

  // Atualiza todos os status quando o nível muda
  atualizarBarraVida();
  atualizarBarraSanidade();
  atualizarBarraMana();
  atualizarBarraAlma();
  calcularDefesaTotal();
}

function calcularDefesaTotal() {
  const nivel = parseInt(document.querySelector(`#${CONSTANTES.IDS.NIVEL}`).value) || 1;

  // Calcula os valores base com bônus por nível
  const defesaBase = STATUS_BASE.DEFESA.BASE + Math.floor(nivel * STATUS_BASE.DEFESA.POR_NIVEL);
  const esquivaBase = STATUS_BASE.ESQUIVA.BASE + Math.floor(nivel * STATUS_BASE.ESQUIVA.POR_NIVEL);
  const bloqueioBase = STATUS_BASE.BLOQUEIO.BASE + Math.floor(nivel * STATUS_BASE.BLOQUEIO.POR_NIVEL);

  // Atualiza os campos com os valores calculados
  document.querySelector(`#${CONSTANTES.IDS.DEFESA}`).value = defesaBase;
  document.querySelector(`#${CONSTANTES.IDS.ESQUIVA}`).value = esquivaBase;
  document.querySelector(`#${CONSTANTES.IDS.BLOQUEIO}`).value = bloqueioBase;

  // Calcula a defesa total
  const defesaTotal = defesaBase + esquivaBase + bloqueioBase;
  const defesaTotalElement = document.querySelector(`#${CONSTANTES.IDS.DEFESA_TOTAL}`);
  if (defesaTotalElement) {
    defesaTotalElement.textContent = defesaTotal;
  }
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

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  inicializarPagina();

  // Event listeners para botões
  document.getElementById('btnSalvarFicha')?.addEventListener('click', () => {
    salvarFicha();
  });

  document.getElementById('btnOBS')?.addEventListener('click', () => {
    if (typeof abrirOBS === 'function') {
      abrirOBS();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Função OBS não encontrada. Por favor, recarregue a página.'
      });
    }
  });

  // Event listeners para status vitais
  document.querySelectorAll('.status-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.id;
      switch (id) {
        case CONSTANTES.IDS.VIDA:
          atualizarBarraVida();
          break;
        case CONSTANTES.IDS.SANIDADE:
          atualizarBarraSanidade();
          break;
        case CONSTANTES.IDS.MANA:
          atualizarBarraMana();
          break;
        case CONSTANTES.IDS.ALMA:
          atualizarBarraAlma();
          break;
      }
    });
  });

  // Listener para nível
  const nivelInput = document.querySelector(`#${CONSTANTES.IDS.NIVEL}`);
  if (nivelInput) {
    nivelInput.addEventListener('input', () => {
      atualizarBarraNivel();
      // Atualiza todos os status quando o nível muda
      atualizarBarraVida();
      atualizarBarraSanidade();
      atualizarBarraMana();
      atualizarBarraAlma();
      calcularDefesaTotal();
    });
  }

  // Listeners para defesa, esquiva e bloqueio
  ['defesa', 'esquiva', 'bloqueio'].forEach(id => {
    const input = document.querySelector(`#${id}`);
    if (input) {
      input.addEventListener('input', calcularDefesaTotal);
    }
  });
});

function inicializarPagina() {
  inicializarValoresPadrao();
  inicializarBarrasStatus();
  carregarFicha();
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

// Funções de persistência
async function salvarDados() {
  try {
    // Verificar se o serviço de API está disponível
    if (!window.ApiService) {
      console.error('Serviço de API não encontrado');
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Serviço de API não disponível. Recarregue a página e tente novamente.'
      });
      return;
    }

    // Obter ID da ficha atual ou gerar um novo
    let fichaId = obterIdDaUrl();
    if (!fichaId) {
      fichaId = await gerarNovoId();
    }

    const dados = {
      id: fichaId,
      raca: document.querySelector(`.${CONSTANTES.IDS.RACA}-item.${CONSTANTES.CLASSES.ACTIVE}`)?.textContent,
      classe: document.querySelector(`.${CONSTANTES.IDS.CLASSE}-item.${CONSTANTES.CLASSES.ACTIVE}`)?.textContent,
      origem: document.querySelector(`.${CONSTANTES.IDS.ORIGEM}-item.${CONSTANTES.CLASSES.ACTIVE}`)?.textContent,
      nivel: document.getElementById(CONSTANTES.IDS.NIVEL)?.value,
      vida: document.getElementById(CONSTANTES.IDS.VIDA)?.value,
      sanidade: document.getElementById(CONSTANTES.IDS.SANIDADE)?.value,
      mana: document.getElementById(CONSTANTES.IDS.MANA)?.value,
      alma: document.getElementById(CONSTANTES.IDS.ALMA)?.value
    };

    // Verificar conexão com a API antes de tentar salvar
    try {
      // Tenta fazer uma requisição simples para verificar se a API está acessível
      const testConnection = await fetch('http://localhost:3000/api/personagens', { 
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!testConnection.ok) {
        throw new Error('Servidor indisponível');
      }
    } catch (connectionError) {
      console.error('Erro de conexão com a API:', connectionError);
      Swal.fire({
        icon: 'error',
        title: 'Erro de Conexão',
        text: 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando e tente novamente.'
      });
      return;
    }

    // Usar o serviço de API
    if (fichaId) {
      await apiService.atualizarPersonagem(fichaId, dados);
    } else {
      await apiService.criarPersonagem(dados);
    }

    // Notificar sucesso
    Swal.fire({
      icon: 'success',
      title: 'Sucesso',
      text: 'Dados salvos com sucesso!',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: `Erro ao salvar os dados: ${error.message || 'Verifique sua conexão com o servidor'}`
    });
  }
}

async function carregarDados() {
  try {
    const fichaId = obterIdDaUrl();
    if (!fichaId) return;

    // Usar o serviço de API para obter os dados
    const dados = await apiService.getPersonagem(fichaId);
    if (!dados) return;

    Object.entries(dados).forEach(([key, value]) => {
      if (key === 'raca' || key === 'classe' || key === 'origem') {
        const items = document.querySelectorAll(`.${key}-item`);
        items.forEach(item => {
          if (item.textContent === value) {
            item.classList.add(CONSTANTES.CLASSES.ACTIVE);
          }
        });
      } else if (key !== 'id') { // Ignorar o campo id
        const input = document.getElementById(key);
        if (input && value) {
          input.value = value;
          atualizarBarraStatus(input);
        }
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Ocorreu um erro ao carregar os dados da ficha.'
    });
  }
}

