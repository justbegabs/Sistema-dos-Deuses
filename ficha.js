// Função para obter o ID da ficha da URL
function obterIdFicha(idParam) {
    if (idParam) return idParam;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Função para salvar a ficha
function salvarFicha(idParam) {
    try {
        const fichaId = obterIdFicha(idParam);

        if (!fichaId) {
            console.error('ID da ficha não encontrado');
            return;
        }

        // Recupera a ficha existente ou cria uma nova
        let fichaData = JSON.parse(localStorage.getItem(`ficha_${fichaId}`)) || {};

        // Atualiza apenas os dados vitais
        fichaData = {
            ...fichaData,
            id: fichaId,
            nome: document.querySelector('#nome').value || 'Nova Ficha',
            vida: {
                atual: document.querySelector('#vida_atual').value,
                max: document.querySelector('#vida_max').value,
            },
            sanidade: {
                atual: document.querySelector('#sanidade_atual').value,
                max: document.querySelector('#sanidade_max').value,
            },
            mana: {
                atual: document.querySelector('#mana_atual').value,
                max: document.querySelector('#mana_max').value,
            },
            alma: {
                atual: document.querySelector('#alma_atual').value,
                max: document.querySelector('#alma_max').value,
            }
        };

        // Salva a ficha no localStorage
        localStorage.setItem(`ficha_${fichaId}`, JSON.stringify(fichaData));

        // Atualiza o array de personagens
        let personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
        if (!Array.isArray(personagens)) {
            personagens = [];
        }

        // Garante que o array tenha o tamanho necessário
        while (personagens.length <= fichaId) {
            personagens.push(null);
        }

        personagens[fichaId] = fichaData;
        localStorage.setItem('personagens', JSON.stringify(personagens));

        console.log('Ficha salva com sucesso:', fichaData);

    } catch (error) {
        console.error('Erro ao salvar ficha:', error);
    }
}

// Função para carregar a ficha
function carregarFicha(idParam) {
    try {
        const fichaId = obterIdFicha(idParam);

        if (!fichaId) {
            console.error('ID da ficha não encontrado');
            return;
        }

        let fichaData = JSON.parse(localStorage.getItem(`ficha_${fichaId}`));
        if (!fichaData) {
            const personagens = JSON.parse(localStorage.getItem('personagens') || '[]');
            fichaData = personagens[fichaId];
        }

        if (!fichaData) {
            console.error('Ficha não encontrada');
            return;
        }

        // Preenche os dados vitais
        document.querySelector('#nome').value = fichaData.nome || 'Nova Ficha';
        document.querySelector('#vida_atual').value = fichaData.vida?.atual || '20';
        document.querySelector('#vida_max').value = fichaData.vida?.max || '20';
        document.querySelector('#sanidade_atual').value = fichaData.sanidade?.atual || '10';
        document.querySelector('#sanidade_max').value = fichaData.sanidade?.max || '10';
        document.querySelector('#mana_atual').value = fichaData.mana?.atual || '15';
        document.querySelector('#mana_max').value = fichaData.mana?.max || '15';
        document.querySelector('#alma_atual').value = fichaData.alma?.atual || '15';
        document.querySelector('#alma_max').value = fichaData.alma?.max || '15';

        // Atualiza as barras de progresso
        atualizarBarraVida();
        atualizarBarraSanidade();
        atualizarBarraMana();
        atualizarBarraAlma();

    } catch (error) {
        console.error('Erro ao carregar ficha:', error);
    }
}

// Inicializa os event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    // Adiciona evento de clique ao botão de salvar
    const btnSalvar = document.querySelector('.btn-primary');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Botão de salvar clicado');
            salvarFicha();
        });
    }

    // Carrega a ficha se houver um ID na URL
    const urlParams = new URLSearchParams(window.location.search);
    const fichaId = urlParams.get('id');
    if (fichaId) {
        carregarFicha();
    }
}); 