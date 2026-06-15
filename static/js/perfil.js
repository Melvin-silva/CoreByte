function formatarPrecoBR(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function carregarCompras() {
    try {
        return JSON.parse(localStorage.getItem('corebyte_compras')) || [];
    } catch {
        return [];
    }
}

function escaparHtml(valor) {
    return String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatarData(dataIso) {
    const data = new Date(dataIso);

    if (Number.isNaN(data.getTime())) {
        return 'Data nao informada';
    }

    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderizarCompras() {
    const container = document.getElementById('profile-purchases');
    const empty = document.getElementById('profile-purchases-empty');

    if (!container || !empty) return;

    const compras = carregarCompras();
    container.innerHTML = '';

    if (!compras.length) {
        empty.hidden = false;
        return;
    }

    empty.hidden = true;

    compras.forEach((compra) => {
        const article = document.createElement('article');
        article.className = 'purchase-card';

        const itens = Array.isArray(compra.itens) ? compra.itens : [];
        const itensHtml = itens.map((item) => `
            <div class="purchase-item">
                <img src="${escaparHtml(item.imagem || '/static/img/Corebyte.png')}" alt="${escaparHtml(item.nome)}">
                <div>
                    <strong>${escaparHtml(item.nome)}</strong>
                    <span>${formatarPrecoBR(String(item.preco || '').replace('R$', '').replace(/\./g, '').replace(',', '.'))}</span>
                </div>
            </div>
        `).join('');

        article.innerHTML = `
            <div class="purchase-head">
                <div>
                    <span>Pedido</span>
                    <strong>${formatarData(compra.data)}</strong>
                </div>
                <div>
                    <span>Total</span>
                    <strong>${formatarPrecoBR(compra.total)}</strong>
                </div>
            </div>
            ${compra.cupom ? `<p class="purchase-coupon">Cupom aplicado: ${escaparHtml(compra.cupom)}</p>` : ''}
            <div class="purchase-items">${itensHtml}</div>
        `;

        container.appendChild(article);
    });
}

function configurarModalImagemPerfil() {
    const modal = document.getElementById('profile-image-modal');
    const openButton = document.getElementById('open-profile-image-modal');
    const closeButton = document.getElementById('close-profile-image-modal');

    if (!modal || !openButton || !closeButton) return;

    openButton.addEventListener('click', () => {
        modal.hidden = false;
    });

    closeButton.addEventListener('click', () => {
        modal.hidden = true;
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.hidden = true;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarCompras();
    configurarModalImagemPerfil();
});
