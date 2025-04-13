// obs.js - Conectar e atualizar OBS WebSocket

let obsWebSocket = null;
let obsConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

async function abrirOBS() {
    const fichaId = obterIdDaUrl();
    if (!fichaId) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Salve a ficha primeiro para gerar o link do OBS'
        });
        return;
    }

    try {
        // Verifica se a ficha existe na API
        await apiService.getPersonagem(fichaId);

        const url = `http://localhost:3000/stream.html?id=${fichaId}`;

        Swal.fire({
            title: 'Configurar OBS',
            html: `
                <p>Para configurar no OBS:</p>
                <ol style="text-align: left">
                    <li>Adicione uma nova fonte do tipo <strong>Navegador</strong></li>
                    <li>Cole o link abaixo na URL</li>
                    <li>Defina largura como <strong>300</strong> e altura como <strong>200</strong></li>
                    <li>Marque a opção "Atualizar navegador quando a cena fica ativa"</li>
                </ol>
                <div class="input-group">
                    <input type="text" id="obsUrl" class="form-control" value="${url}" readonly>
                    <button class="btn btn-outline-secondary" onclick="copiarUrlOBS()">Copiar</button>
                </div>
            `,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Erro ao verificar ficha:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível encontrar a ficha. Por favor, salve a ficha primeiro.'
        });
    }
}

function copiarUrlOBS() {
    const input = document.getElementById('obsUrl');
    input.select();
    document.execCommand('copy');
    Swal.fire({
        icon: 'success',
        title: 'Link copiado!',
        text: 'Cole no OBS como fonte do tipo navegador.',
        timer: 1500,
        showConfirmButton: false
    });
}

function conectarOBSWebSocket(address = 'ws://localhost:5174') {
    if (obsWebSocket) {
        obsWebSocket.close();
        obsWebSocket = null;
    }

    try {
        obsWebSocket = new WebSocket(address);

        obsWebSocket.onopen = () => {
            console.log('Conectado ao OBS WebSocket');
            obsConnected = true;
            reconnectAttempts = 0;
        };

        obsWebSocket.onerror = (error) => {
            console.error('Erro na conexão com OBS:', error);
            obsConnected = false;
            tentarReconectar();
        };

        obsWebSocket.onclose = () => {
            console.log('Desconectado do OBS');
            obsConnected = false;
            tentarReconectar();
        };
    } catch (error) {
        console.error('Erro ao criar conexão WebSocket:', error);
        obsConnected = false;
        tentarReconectar();
    }
}

function tentarReconectar() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log('Número máximo de tentativas de reconexão atingido');
        return;
    }

    reconnectAttempts++;
    console.log(`Tentando reconectar... Tentativa ${reconnectAttempts}`);

    setTimeout(() => {
        conectarOBSWebSocket();
    }, RECONNECT_DELAY);
}

function validarValor(valor) {
    const num = parseInt(valor);
    return isNaN(num) ? 0 : Math.max(0, num);
}

function atualizarOBS(texto) {
    if (!obsConnected || !obsWebSocket) return;

    try {
        const request = {
            "op": 6,
            "d": {
                "requestType": "SetInputSettings",
                "requestId": "rpg-status",
                "inputName": "Rpg stats",
                "inputSettings": {
                    "text": texto
                }
            }
        };

        obsWebSocket.send(JSON.stringify(request));
    } catch (error) {
        console.error('Erro ao enviar dados para o OBS:', error);
    }
}

async function atualizarTextoOBS() {
    const vidaAtual = validarValor(document.querySelector('#vida')?.value);
    const vidaMax = validarValor(document.querySelector('#vida')?.max);
    const sanAtual = validarValor(document.querySelector('#sanidade')?.value);
    const sanMax = validarValor(document.querySelector('#sanidade')?.max);
    const manaAtual = validarValor(document.querySelector('#mana')?.value);
    const manaMax = validarValor(document.querySelector('#mana')?.max);
    const almaAtual = validarValor(document.querySelector('#alma')?.value);
    const almaMax = validarValor(document.querySelector('#alma')?.max);

    const texto = `Vida: ${vidaAtual}/${vidaMax}\nSanidade: ${sanAtual}/${sanMax}\nMana: ${manaAtual}/${manaMax}\nAlma: ${almaAtual}/${almaMax}`;
    atualizarOBS(texto);
}

document.addEventListener('DOMContentLoaded', () => {
    conectarOBSWebSocket();

    const campos = ['vida', 'sanidade', 'mana', 'alma'];

    campos.forEach(campo => {
        const elemento = document.querySelector(`#${campo}`);
        if (elemento) {
            elemento.addEventListener('input', atualizarTextoOBS);
        }
    });
});
