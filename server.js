const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware para permitir CORS e parsing de JSON
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta www
app.use(express.static(path.join(__dirname, 'www')));

// Armazenamento em memória (pode ser substituído por um banco de dados)
let personagens = [];

// Definir rotas da API diretamente no app

// GET - Obter todos os personagens
app.get('/api/personagens', (req, res) => {
  res.json(personagens);
});

// GET - Obter personagem específico
app.get('/api/personagens/:id', (req, res) => {
  const id = req.params.id;
  const personagem = personagens.find(p => p.id === id);

  if (personagem) {
    res.json(personagem);
  } else {
    res.status(404).json({ message: 'Personagem não encontrado' });
  }
});

// POST - Criar novo personagem
app.post('/api/personagens', (req, res) => {
  const novoPersonagem = req.body;
  // Adicionar ID único ao personagem
  novoPersonagem.id = Date.now().toString();
  personagens.push(novoPersonagem);
  res.status(201).json(novoPersonagem);
});

// PUT - Atualizar personagem
app.put('/api/personagens/:id', (req, res) => {
  const id = req.params.id;
  const personagemAtualizado = req.body;

  const index = personagens.findIndex(p => p.id === id);
  if (index !== -1) {
    personagens[index] = personagemAtualizado;
    res.json(personagemAtualizado);
  } else {
    res.status(404).json({ message: 'Personagem não encontrado' });
  }
});

// DELETE - Remover personagem
app.delete('/api/personagens/:id', (req, res) => {
  const id = req.params.id;

  const index = personagens.findIndex(p => p.id === id);
  if (index !== -1) {
    personagens.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Personagem não encontrado' });
  }
});

// Rota para todas as outras requisições - retorna index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});