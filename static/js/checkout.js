function converterPrecoParaNumero(preco) {
    const precoNormalizado = String(preco)
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();

    return Number(precoNormalizado) || 0;
}

function formatarPrecoBR(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function carregarCarrinho() {
    try {
        return JSON.parse(localStorage.getItem('corebyte_carrinho')) || [];
    } catch {
        return [];
    }
}

function salvarCarrinho(itens) {
    localStorage.setItem('corebyte_carrinho', JSON.stringify(itens));
}

function renderizarResumoCheckout() {
    const itens = carregarCarrinho();
    const container = document.getElementById('checkout-items');
    const empty = document.getElementById('checkout-empty');
    const count = document.getElementById('checkout-count');
    const total = document.getElementById('checkout-total');

    container.innerHTML = '';

    if (!itens.length) {
        empty.hidden = false;
        count.textContent = '0';
        total.textContent = formatarPrecoBR(0);
        return;
    }

    empty.hidden = true;

    const totalCarrinho = itens.reduce((soma, item) => soma + converterPrecoParaNumero(item.preco), 0);
    count.textContent = String(itens.length);
    total.textContent = formatarPrecoBR(totalCarrinho);

    itens.forEach((item) => {
        const row = document.createElement('article');
        row.className = 'checkout-item';
        row.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">
            <div>
                <h3>${item.nome}</h3>
                <span>${formatarPrecoBR(converterPrecoParaNumero(item.preco))}</span>
            </div>
        `;
        container.appendChild(row);
    });
}

function preencherEnderecoPorCep(dadosCep) {
    document.getElementById('checkout-rua').value = dadosCep.rua || dadosCep.logradouro || '';
    document.getElementById('checkout-bairro').value = dadosCep.bairro || '';
    document.getElementById('checkout-cidade').value = dadosCep.cidade || dadosCep.localidade || '';
    document.getElementById('checkout-uf').value = dadosCep.uf || '';
}

document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('checkout-cep');
    const cepStatus = document.getElementById('cep-status');
    const buscarCepButton = document.getElementById('buscar-cep');
    const checkoutForm = document.getElementById('checkout-form');

    renderizarResumoCheckout();

    buscarCepButton.addEventListener('click', () => {
        const cep = cepInput.value.replace(/\D/g, '');

        if (cep.length !== 8) {
            cepStatus.textContent = 'Informe um CEP com 8 números.';
            return;
        }

        cepStatus.textContent = 'CEP pronto para consulta da API.';
        cepInput.dataset.normalizedCep = cep;
    });

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!carregarCarrinho().length) {
            alert('Seu carrinho esta vazio.');
            return;
        }

        alert('Pedido confirmado com sucesso!');
        salvarCarrinho([]);
        window.location.href = '/';
    });
});
