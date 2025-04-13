// Função para rolar dados de atributos
function rolarDadosAtributo(elemento) {
    // Obtém o atributo do elemento clicado
    const atributo = elemento.dataset.attribute;
    
    // Encontra o input correspondente ao atributo
    const input = elemento.closest('.atributo-item').querySelector('.atributo-input');
    
    // Obtém o valor do input (quantidade de dados)
    const quantidadeDados = parseInt(input.value) || 0;
    
    if (quantidadeDados <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: 'O valor do atributo deve ser maior que zero para rolar dados.'
        });
        return;
    }
    
    // Array para armazenar os resultados
    const resultados = [];
    let sucessos = 0;
    
    // Rola a quantidade de d20s correspondente ao valor do atributo
    for (let i = 0; i < quantidadeDados; i++) {
        const resultado = Math.floor(Math.random() * 20) + 1;
        resultados.push(resultado);
        if (resultado >= 12) { // Sucesso em 12 ou mais
            sucessos++;
        }
    }
    
    // Encontra o maior valor obtido
    const maiorValor = Math.max(...resultados);

    // Formata a mensagem com os resultados
    const mensagem = `
        <p>Atributo: ${atributo}</p>
        <p>Dados rolados: ${quantidadeDados}d20</p>
        <p>Resultados: ${resultados.join(', ')}</p>
        <p>Maior valor: ${maiorValor}</p>
    `;
    
    // Exibe o resultado usando SweetAlert2
    Swal.fire({
        title: 'Resultado da Rolagem',
        html: mensagem,
        icon: 'info'
    });
}

// Adiciona event listeners aos elementos de rolagem de dados
document.addEventListener('DOMContentLoaded', function() {
    const diceRolls = document.querySelectorAll('.dice-roll');
    diceRolls.forEach(roll => {
        roll.addEventListener('click', function() {
            rolarDadosAtributo(this);
        });
    });
});