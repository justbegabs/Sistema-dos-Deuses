// api-service.js - Serviço para gerenciar chamadas à API

// URL base da API - Dinâmica baseada no ambiente
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://sua-api.herokuapp.com/api'; // Substitua pela URL do seu servidor em produção

// Função para processar respostas da API
async function handleApiResponse(response, errorMessage) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || errorMessage || 'Erro na requisição');
  }

  // Para respostas 204 (No Content), retorna null
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Função para verificar se a API está disponível
async function verificarConexaoAPI() {
  try {
    const response = await fetch(`${API_URL}/personagens`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar conexão com a API:', error);
    return false;
  }
}

// Função para verificar se a API está disponível
async function verificarConexaoAPI() {
  try {
    const response = await fetch(`${API_URL}/personagens`, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar conexão com a API:', error);
    return false;
  }
}

// Exporta o serviço para uso global
window.ApiService = {
  // Verificar se a API está disponível
  verificarConexao: verificarConexaoAPI,
  // Obter todos os personagens
  async getPersonagens() {
    try {
      const response = await fetch(`${API_URL}/personagens`);
      return handleApiResponse(response, 'Erro ao buscar personagens');
    } catch (error) {
      console.error('Erro ao buscar personagens:', error);
      throw new Error('Erro ao conectar com o servidor. Verifique sua conexão.');
    }
  },

  // Obter um personagem específico
  async getPersonagem(id) {
    if (!id) throw new Error('ID não fornecido');
    try {
      const response = await fetch(`${API_URL}/personagens/${id}`);
      return handleApiResponse(response, 'Personagem não encontrado');
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  },

  // Criar novo personagem
  async criarPersonagem(personagem) {
    if (!personagem) throw new Error('Dados do personagem não fornecidos');
    try {
      const response = await fetch(`${API_URL}/personagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personagem)
      });
      return handleApiResponse(response, 'Erro ao criar personagem');
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  },

  // Atualizar personagem existente
  async atualizarPersonagem(id, personagem) {
    if (!id) throw new Error('ID não fornecido');
    if (!personagem) throw new Error('Dados do personagem não fornecidos');
    try {
      const response = await fetch(`${API_URL}/personagens/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personagem)
      });
      return handleApiResponse(response, 'Erro ao atualizar personagem');
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  },

  // Excluir personagem
  async excluirPersonagem(id) {
    if (!id) throw new Error('ID não fornecido');
    try {
      const response = await fetch(`${API_URL}/personagens/${id}`, {
        method: 'DELETE'
      });
      return handleApiResponse(response, 'Erro ao excluir personagem');
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }
};