// api-service.js - Serviço para gerenciar chamadas à API

// URL base da API - Usando exclusivamente a API do Render
const API_URL = 'https://sistema-dos-deuses.onrender.com/api';

// URL de fallback (mesma que a principal para manter compatibilidade com o código existente)
const FALLBACK_API_URL = 'https://sistema-dos-deuses.onrender.com/api';

// Configurações
const CONFIG = {
  TIMEOUT: 30000, // Aumentado para 30 segundos
  RETRY_ATTEMPTS: 5, // Aumentado para 5 tentativas
  RETRY_DELAY: 3000, // Aumentado para 3 segundos
  CONNECTION_CHECK_INTERVAL: 60000,
  INTERNET_CHECK_TIMEOUT: 5000 // Aumentado para 5 segundos
};

// Estado da conexão
let isConnected = false;
let connectionCheckInterval = null;
let lastError = null;

// Função para aguardar um tempo específico
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Função para verificar conexão com a internet
async function checkInternetConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.INTERNET_CHECK_TIMEOUT);

    // Tenta múltiplos endpoints para maior confiabilidade
    const endpoints = [
      'https://www.google.com/favicon.ico',
      'https://www.cloudflare.com/favicon.ico',
      'https://www.microsoft.com/favicon.ico'
    ];

    // Usa Promise.any para retornar assim que qualquer um dos endpoints responder
    await Promise.any(endpoints.map(url =>
      fetch(url, {
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store'
      })
    ));

    clearTimeout(timeoutId);
    console.log('Conexão com internet detectada');
    return true;
  } catch (error) {
    console.warn('Falha na verificação de internet:', error.message || error);
    return false;
  }
}

// Função para processar respostas da API
async function handleApiResponse(response, errorMessage) {
  if (!response.ok) {
    const statusText = {
      404: 'Recurso não encontrado',
      500: 'Erro interno do servidor',
      503: 'Servidor em manutenção',
      504: 'Tempo limite excedido'
    };

    try {
      const error = await response.json();
      throw new Error(error.message || statusText[response.status] || errorMessage || 'Erro na requisição');
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(statusText[response.status] || errorMessage || 'Erro na requisição');
      }
      throw e;
    }
  }

  if (response.status === 204) {
    return null;
  }

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Erro ao processar resposta JSON:', e);
    throw new Error('Erro ao processar resposta do servidor');
  }
}

// Função para tentar uma operação várias vezes
async function retryOperation(operation, attempts = CONFIG.RETRY_ATTEMPTS) {
  let currentDelay = CONFIG.RETRY_DELAY;

  for (let i = 0; i < attempts; i++) {
    try {
      // Verifica conexão com a internet primeiro
      const hasInternet = await checkInternetConnection();
      if (!hasInternet) {
        throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      }

      const result = await operation();
      isConnected = true;
      lastError = null;
      return result;
    } catch (error) {
      console.warn(`Tentativa ${i + 1} falhou:`, error);
      lastError = error;

      // Se for erro de conexão com a internet, não tenta novamente
      if (error.message.includes('Sem conexão com a internet')) {
        throw error;
      }

      // Se for o último retry, lança o erro
      if (i === attempts - 1) {
        isConnected = false;
        throw error;
      }

      // Aguarda antes de tentar novamente
      await delay(currentDelay);
      currentDelay *= 2; // Backoff exponencial
    }
  }
}

// Função para verificar se a API está disponível
async function verificarConexaoAPI() {
  try {
    // Verifica conexão com a internet primeiro
    const hasInternet = await checkInternetConnection();
    if (!hasInternet) {
      throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    // Tenta conectar à API do Render
    console.log(`Tentando conectar a: ${API_URL}/personagens`);
    const response = await fetch(`${API_URL}/personagens`, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'HEAD',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      mode: 'cors',
      credentials: 'include',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Servidor retornou status ${response.status}`);
    }

    console.log('Conexão com o servidor estabelecida com sucesso!');
    isConnected = true;
    lastError = null;
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    throw error;
  }
}

// Função para fazer requisições à API
async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Origin': window.location.origin,
      'Access-Control-Request-Method': options.method || 'GET',
      'Access-Control-Request-Headers': 'Content-Type'
    },
    mode: 'cors',
    credentials: 'include'
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  // Garante que o endpoint comece com /
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Constrói a URL da requisição
  const url = `${API_URL}${formattedEndpoint}`;
  console.log(`Fazendo requisição para: ${url}`, requestOptions);

  return retryOperation(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      // Adiciona timestamp para evitar cache
      const urlWithTimestamp = options.method === 'GET' || !options.method ?
        `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : url;

      const response = await fetch(urlWithTimestamp, {
        ...requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error(`Erro na requisição para ${url}:`, error);

      if (error.name === 'AbortError') {
        throw new Error('Tempo de resposta excedido. Tente novamente.');
      }
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      }
      throw error;
    }
  });
}

// Função para iniciar verificação periódica de conexão
function iniciarVerificacaoConexao() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }

  // Verifica imediatamente
  verificarConexaoAPI()
    .then(() => {
      console.log('Verificação inicial de conexão bem-sucedida');
    })
    .catch(error => {
      console.warn('Falha na verificação inicial de conexão:', error.message || error);
    });

  connectionCheckInterval = setInterval(async () => {
    try {
      await verificarConexaoAPI();
      // Se a conexão foi restaurada após falha anterior, podemos notificar
      if (lastError) {
        console.log('Conexão restaurada após falha anterior');
        // Aqui poderia disparar um evento ou notificação de reconexão
      }
    } catch (error) {
      console.warn('Falha na verificação periódica de conexão:', error.message || error);
    }
  }, CONFIG.CONNECTION_CHECK_INTERVAL);

  console.log(`Verificação periódica de conexão iniciada (intervalo: ${CONFIG.CONNECTION_CHECK_INTERVAL / 1000}s)`);
}

// Função para parar verificação periódica de conexão
function pararVerificacaoConexao() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
}

// Exporta o serviço para uso global
window.ApiService = {
  verificarConexaoAPI,
  iniciarVerificacaoConexao,
  pararVerificacaoConexao,
  isConnected: () => isConnected,
  getLastError: () => lastError,

  // Obter todos os personagens
  async getPersonagens() {
    const response = await apiRequest('/personagens');
    return handleApiResponse(response, 'Erro ao buscar personagens');
  },

  // Obter um personagem específico
  async getPersonagem(id) {
    if (!id) throw new Error('ID não fornecido');
    const response = await apiRequest(`/personagens/${id}`);
    return handleApiResponse(response, 'Personagem não encontrado');
  },

  // Criar novo personagem
  async criarPersonagem(personagem) {
    if (!personagem) throw new Error('Dados do personagem não fornecidos');
    const response = await apiRequest('/personagens', {
      method: 'POST',
      body: JSON.stringify(personagem)
    });
    return handleApiResponse(response, 'Erro ao criar personagem');
  },

  // Atualizar personagem existente
  async atualizarPersonagem(id, personagem) {
    if (!id) throw new Error('ID não fornecido');
    if (!personagem) throw new Error('Dados do personagem não fornecidos');

    // Garantir que o ID esteja incluído no corpo da requisição
    personagem.id = id;

    try {
      const response = await apiRequest(`/personagens/${id}`, {
        method: 'PUT',
        body: JSON.stringify(personagem)
      });

      if (response.status === 404) {
        throw new Error('Recurso não encontrado. Verifique se o ID da ficha existe no servidor.');
      }

      return handleApiResponse(response, 'Erro ao atualizar personagem');
    } catch (error) {
      console.error('Erro ao atualizar personagem:', error);
      throw error;
    }
  },

  // Excluir personagem
  async excluirPersonagem(id) {
    if (!id) throw new Error('ID não fornecido');
    const response = await apiRequest(`/personagens/${id}`, {
      method: 'DELETE'
    });
    return handleApiResponse(response, 'Erro ao excluir personagem');
  }
};