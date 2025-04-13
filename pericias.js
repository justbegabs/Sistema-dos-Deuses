// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    inicializarPericias();
    inicializarAtributos();
    inicializarBarras();
});

// Gerenciamento de Perícias
function inicializarPericias() {
    // Adiciona listeners para as perícias principais
    document.querySelectorAll('.pericia-principal').forEach(pericia => {
        pericia.addEventListener('click', () => {
            const subPericias = pericia.nextElementSibling;
            if (subPericias && subPericias.classList.contains('sub-pericias')) {
                subPericias.classList.toggle('mostrar');
                pericia.classList.toggle('expandida');
            }
        });
    });
}

// Gerenciamento de Atributos
function inicializarAtributos() {
    // Adiciona listeners para inputs de atributos
    const atributosInputs = document.querySelectorAll('.atributo-input');
    atributosInputs.forEach(input => {
        input.addEventListener('change', () => {
            atualizarContadorAtributos();
            atualizarStatusCombate();
            atualizarStatusMaximos();
        });
        input.addEventListener('input', () => {
            atualizarContadorAtributos();
            atualizarStatusCombate();
            atualizarStatusMaximos();
        });
    });

    // Adiciona listeners para perícias que afetam status de combate
    const periciasRelevantes = document.querySelectorAll('.sub-pericia-valor[data-attribute="reflexos"], .sub-pericia-valor[data-attribute="fortitude"]');
    periciasRelevantes.forEach(input => {
        input.addEventListener('change', atualizarStatusCombate);
        input.addEventListener('input', atualizarStatusCombate);
    });

    // Inicializa os valores
    atualizarStatusCombate();
    atualizarStatusMaximos();
}

function atualizarContadorAtributos() {
    let totalTestes = 0;
    let totalSorte = 0;

    // Soma atributos de teste
    document.querySelectorAll('.atributo-input[data-grupo="teste"]').forEach(input => {
        totalTestes += parseInt(input.value) || 0;
    });

    // Soma atributos de sorte
    document.querySelectorAll('.atributo-input[data-grupo="sorte"]').forEach(input => {
        totalSorte += parseInt(input.value) || 0;
    });

    // Calcula o total geral
    const totalGeral = totalTestes + totalSorte;

    // Atualiza os contadores com o total geral
    document.getElementById('contador-testes').textContent = `${totalGeral}/12`;
    document.getElementById('contador-sorte').textContent = `${totalGeral}/12`;

    // Aplica classe de excedido se passar do limite
    const excedido = totalGeral > 12;
    document.getElementById('contador-testes').classList.toggle('excedido', excedido);
    document.getElementById('contador-sorte').classList.toggle('excedido', excedido);
}

// Gerenciamento de Barras de Status
function inicializarBarras() {
    // Vida
    const vidaAtual = document.getElementById('vida_atual');
    const vidaMax = document.getElementById('vida_max');
    if (vidaAtual) vidaAtual.addEventListener('input', atualizarBarraVida);
    if (vidaMax) vidaMax.addEventListener('input', atualizarBarraVida);

    // Sanidade
    const sanidadeAtual = document.getElementById('sanidade_atual');
    const sanidadeMax = document.getElementById('sanidade_max');
    if (sanidadeAtual) sanidadeAtual.addEventListener('input', atualizarBarraSanidade);
    if (sanidadeMax) sanidadeMax.addEventListener('input', atualizarBarraSanidade);

    // Mana
    const manaAtual = document.getElementById('mana_atual');
    const manaMax = document.getElementById('mana_max');
    if (manaAtual) manaAtual.addEventListener('input', atualizarBarraMana);
    if (manaMax) manaMax.addEventListener('input', atualizarBarraMana);

    // Alma
    const almaAtual = document.getElementById('alma_atual');
    const almaMax = document.getElementById('alma_max');
    if (almaAtual) almaAtual.addEventListener('input', atualizarBarraAlma);
    if (almaMax) almaMax.addEventListener('input', atualizarBarraAlma);

    // Nível
    const nivelInput = document.getElementById('nivel');
    if (nivelInput) nivelInput.addEventListener('input', atualizarBarraNivel);

    // Inicializa todas as barras
    atualizarBarraVida();
    atualizarBarraSanidade();
    atualizarBarraMana();
    atualizarBarraAlma();
    atualizarBarraNivel();
}

function atualizarBarraVida() {
    const atual = parseInt(document.getElementById('vida_atual').value) || 0;
    const max = parseInt(document.getElementById('vida_max').value) || 100;
    const porcentagem = Math.min(100, Math.max(0, (atual / max) * 100));
    const barra = document.querySelector('.barra-vida');
    if (barra) {
        barra.style.width = `${porcentagem}%`;
        atualizarCorBarra(barra, porcentagem);
    }
}

function atualizarBarraSanidade() {
    const atual = parseInt(document.getElementById('sanidade_atual').value) || 0;
    const max = parseInt(document.getElementById('sanidade_max').value) || 100;
    const porcentagem = Math.min(100, Math.max(0, (atual / max) * 100));
    const barra = document.querySelector('.barra-sanidade');
    if (barra) {
        barra.style.width = `${porcentagem}%`;
        atualizarCorBarra(barra, porcentagem);
    }
}

function atualizarBarraMana() {
    const atual = parseInt(document.getElementById('mana_atual').value) || 0;
    const max = parseInt(document.getElementById('mana_max').value) || 100;
    const porcentagem = Math.min(100, Math.max(0, (atual / max) * 100));
    const barra = document.querySelector('.barra-mana');
    if (barra) {
        barra.style.width = `${porcentagem}%`;
        atualizarCorBarra(barra, porcentagem);
    }
}

function atualizarBarraAlma() {
    const atual = parseInt(document.getElementById('alma_atual').value) || 0;
    const max = parseInt(document.getElementById('alma_max').value) || 100;
    const porcentagem = Math.min(100, Math.max(0, (atual / max) * 100));
    const barra = document.querySelector('.barra-alma');
    if (barra) {
        barra.style.width = `${porcentagem}%`;
        atualizarCorBarra(barra, porcentagem);
    }
}

function atualizarBarraNivel() {
    const nivel = parseInt(document.getElementById('nivel').value) || 0;
    const nivelMax = 100; // Alterado para 100
    const porcentagem = Math.min(100, Math.max(0, (nivel / nivelMax) * 100));
    const barra = document.querySelector('.nivel-progresso');
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

// Rolagem de dados para perícias
function rolarD10ParaPericia(elemento) {
    const resultado = Math.floor(Math.random() * 10) + 1;
    const bonus = parseInt(elemento.getAttribute('data-bonus')) || 0;
    const total = resultado + bonus;

    const nomePericia = elemento.closest('.sub-pericia').querySelector('.pericia-nome').textContent;

    Swal.fire({
        title: `Rolagem de ${nomePericia}`,
        html: `
            <div class="rolagem-resultado">
                <p>Dado (d10): ${resultado}</p>
                <p>Bônus: ${bonus}</p>
                <p>Total: ${total}</p>
            </div>
        `,
        icon: 'info'
    });
}

// Funções para cálculo de defesa, esquiva e bloqueio
function calcularDefesa() {
    const span = document.querySelector('[data-attribute="constituicao"]');
    const input = span?.closest('.atributo-item')?.querySelector('.atributo-input');
    const constituicao = parseInt(input?.value) || 0;

    const defesa = 10 + constituicao;
    document.getElementById('defesa').value = defesa;
    return defesa;
}

function calcularEsquiva() {
    const defesa = parseInt(document.getElementById('defesa')?.value) || 0;

    const span = document.querySelector('[data-attribute="reflexos"]');
    const input = span?.closest('.sub-pericia-item')?.querySelector('.sub-pericia-valor');
    const reflexos = parseInt(input?.value) || 0;

    const esquiva = defesa + reflexos;
    document.getElementById('esquiva').value = esquiva;
}

function calcularBloqueio() {
    const spanCon = document.querySelector('[data-attribute="constituicao"]');
    const inputCon = spanCon?.closest('.atributo-item')?.querySelector('.atributo-input');
    const constituicao = parseInt(inputCon?.value) || 0;

    const spanFort = document.querySelector('[data-attribute="fortitude"]');
    const inputFort = spanFort?.closest('.sub-pericia-item')?.querySelector('.sub-pericia-valor');
    const fortitude = parseInt(inputFort?.value) || 0;

    const bloqueio = (constituicao * 2) + Math.floor(fortitude / 2);
    document.getElementById('bloqueio').value = bloqueio;
}

function atualizarStatusCombate() {
    calcularDefesa();
    calcularEsquiva();
    calcularBloqueio();
}


function atualizarStatusMaximos() {
    // Função auxiliar para pegar o valor do atributo baseado no data-attribute do span
    const getAtributoValor = (nome) => {
        const span = document.querySelector(`[data-attribute="${nome}"]`);
        const input = span?.closest('.atributo-item')?.querySelector('.atributo-input');
        return parseInt(input?.value) || 0;
    };

    // Obtém os valores dos atributos
    const resiliencia = getAtributoValor('resiliencia');
    const intelecto = getAtributoValor('intelecto');
    const carisma = getAtributoValor('carisma');
    const magia = getAtributoValor('magia');

    // Calcula os valores máximos
    const vidaMax = (resiliencia * 3) + 20;
    const sanidadeMax = (intelecto * 5) + (carisma * 3) + 10;
    const manaMax = (magia * 5) + 15;
    const almaMax = (magia * 5) + (resiliencia * 3) + (intelecto * 2) + 15;

    // Atualiza os campos máximos
    document.getElementById('vida_max').value = vidaMax;
    document.getElementById('sanidade_max').value = sanidadeMax;
    document.getElementById('mana_max').value = manaMax;
    document.getElementById('alma_max').value = almaMax;

    // Atualiza as barras
    atualizarBarraVida();
    atualizarBarraSanidade();
    atualizarBarraMana();
    atualizarBarraAlma();
}
