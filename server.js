const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Armazenamento em memória (pode ser substituído por um banco de dados)
let personagens = [];

// Função para enviar resposta JSON
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

// Função para ler o corpo da requisição
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Criar servidor HTTP
const server = http.createServer(async (req, res) => {
  // Configurar CORS para todas as respostas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder imediatamente às requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Analisar a URL da requisição
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Rotas da API
  try {
    // GET - Obter todos os personagens
    if (pathname === '/api/personagens' && req.method === 'GET') {
      sendJSON(res, personagens);
      return;
    }

    // GET - Obter personagem específico
    if (pathname.match(/^\/api\/personagens\/[\w-]+$/) && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const personagem = personagens.find(p => p.id === id);

      if (personagem) {
        sendJSON(res, personagem);
      } else {
        sendJSON(res, { message: 'Personagem não encontrado' }, 404);
      }
      return;
    }

    // POST - Criar novo personagem
    if (pathname === '/api/personagens' && req.method === 'POST') {
      const novoPersonagem = await readRequestBody(req);
      novoPersonagem.id = Date.now().toString();
      personagens.push(novoPersonagem);
      sendJSON(res, novoPersonagem, 201);
      return;
    }

    // PUT - Atualizar personagem
    if (pathname.match(/^\/api\/personagens\/[\w-]+$/) && req.method === 'PUT') {
      const id = pathname.split('/')[3];
      const personagemAtualizado = await readRequestBody(req);

      const index = personagens.findIndex(p => p.id === id);
      if (index !== -1) {
        personagemAtualizado.id = id; // Garantir que o ID não seja alterado
        personagens[index] = personagemAtualizado;
        sendJSON(res, personagemAtualizado);
      } else {
        sendJSON(res, { message: 'Personagem não encontrado' }, 404);
      }
      return;
    }

    // DELETE - Remover personagem
    if (pathname.match(/^\/api\/personagens\/[\w-]+$/) && req.method === 'DELETE') {
      const id = pathname.split('/')[3];

      const index = personagens.findIndex(p => p.id === id);
      if (index !== -1) {
        personagens.splice(index, 1);
        res.writeHead(204);
        res.end();
      } else {
        sendJSON(res, { message: 'Personagem não encontrado' }, 404);
      }
      return;
    }

    // Rota não encontrada
    sendJSON(res, { message: 'Rota não encontrada' }, 404);
  } catch (error) {
    console.error('Erro no servidor:', error);
    sendJSON(res, { message: 'Erro interno do servidor' }, 500);
  }
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor API rodando na porta ${PORT}`);
});