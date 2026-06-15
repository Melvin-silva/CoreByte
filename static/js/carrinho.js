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

function getHomeUrl() {
    const isStaticPreview = window.location.protocol === 'file:' || window.location.pathname.toLowerCase().includes('/templates/');

    return isStaticPreview
        ? 'index.html'
        : '/';
}

function renderizarCarrinho() {
    const container = document.getElementById('cart-page-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    const summaryCount = document.getElementById('summary-count');
    const summaryTotal = document.getElementById('summary-total');
    const itens = carregarCarrinho();

    container.innerHTML = '';

    if (!itens.length) {
        emptyMessage.hidden = false;
        summaryCount.textContent = '0';
        summaryTotal.textContent = formatarPrecoBR(0);
        return;
    }

    emptyMessage.hidden = true;

    const total = itens.reduce((soma, item) => soma + converterPrecoParaNumero(item.preco), 0);
    summaryCount.textContent = String(itens.length);
    summaryTotal.textContent = formatarPrecoBR(total);

    itens.forEach((item, index) => {
        const row = document.createElement('article');
        row.className = 'cart-page-item';
        row.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">
            <div class="cart-item-info">
                <h3>${item.nome}</h3>
                <span>${formatarPrecoBR(converterPrecoParaNumero(item.preco))}</span>
            </div>
            <button class="remove-cart-item" type="button" data-index="${index}">REMOVER</button>
        `;
        container.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const homeUrl = getHomeUrl();
    document.getElementById('cart-home-link').href = homeUrl;
    document.getElementById('continue-shopping').addEventListener('click', () => {
        window.location.href = homeUrl;
    });

    document.getElementById('cart-page-items').addEventListener('click', (event) => {
        const button = event.target.closest('.remove-cart-item');
        if (!button) return;

        const itens = carregarCarrinho();
        itens.splice(Number(button.dataset.index), 1);
        salvarCarrinho(itens);
        renderizarCarrinho();
    });

    document.getElementById('clear-cart').addEventListener('click', () => {
        salvarCarrinho([]);
        renderizarCarrinho();
    });

    document.getElementById('finish-order').addEventListener('click', (event) => {
        if (!carregarCarrinho().length) {
            alert('Seu carrinho esta vazio.');
            return;
        }

        window.location.href = event.currentTarget.dataset.checkoutUrl || '/checkout/';
    });

    renderizarCarrinho();
});
