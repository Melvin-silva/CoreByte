let cupomAplicado = null;

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

function carregarCompras() {
    try {
        return JSON.parse(localStorage.getItem('corebyte_compras')) || [];
    } catch {
        return [];
    }
}

function salvarCompraFinalizada(itens) {
    const subtotal = calcularSubtotal(itens);
    const desconto = calcularDesconto(subtotal);
    const total = Math.max(subtotal - desconto, 0);
    const compras = carregarCompras();

    compras.unshift({
        id: Date.now(),
        data: new Date().toISOString(),
        itens,
        subtotal,
        desconto,
        total,
        cupom: cupomAplicado ? cupomAplicado.codigo : ''
    });

    localStorage.setItem('corebyte_compras', JSON.stringify(compras.slice(0, 20)));
}

function getCsrfToken() {
    const input = document.querySelector('[name=csrfmiddlewaretoken]');
    return input ? input.value : '';
}

function getCupomSalvo() {
    return localStorage.getItem('corebyte_cupom_checkout') || '';
}

function salvarCupomAplicado(codigo) {
    if (codigo) {
        localStorage.setItem('corebyte_cupom_checkout', codigo);
        return;
    }

    localStorage.removeItem('corebyte_cupom_checkout');
}

function calcularSubtotal(itens) {
    return itens.reduce((soma, item) => soma + converterPrecoParaNumero(item.preco), 0);
}

function calcularDesconto(subtotal) {
    if (!cupomAplicado) return 0;

    if (Number(cupomAplicado.subtotal_base) === Number(subtotal)) {
        return Math.min(subtotal, Number(cupomAplicado.valor_desconto) || 0);
    }

    const percentual = Number(cupomAplicado.desconto_percentual) || 0;
    return Math.min(subtotal, subtotal * (percentual / 100));
}

function mostrarStatusCupom(mensagem, tipo) {
    const status = document.getElementById('coupon-status');
    if (!status) return;

    status.textContent = mensagem || '';
    status.classList.remove('success', 'error');

    if (tipo) {
        status.classList.add(tipo);
    }
}

function renderizarResumoCheckout() {
    const itens = carregarCarrinho();
    const container = document.getElementById('checkout-items');
    const empty = document.getElementById('checkout-empty');
    const count = document.getElementById('checkout-count');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const total = document.getElementById('checkout-total');
    const discountLine = document.getElementById('checkout-discount-line');
    const discountElement = document.getElementById('checkout-discount');
    const couponLabel = document.getElementById('checkout-coupon-label');
    const removeCoupon = document.getElementById('remove-coupon');

    container.innerHTML = '';

    if (!itens.length) {
        empty.hidden = false;
        count.textContent = '0';
        subtotalElement.textContent = formatarPrecoBR(0);
        total.textContent = formatarPrecoBR(0);
        discountLine.hidden = true;
        if (removeCoupon) removeCoupon.hidden = true;
        return;
    }

    empty.hidden = true;

    const subtotal = calcularSubtotal(itens);
    const desconto = calcularDesconto(subtotal);
    const totalFinal = Math.max(subtotal - desconto, 0);

    count.textContent = String(itens.length);
    subtotalElement.textContent = formatarPrecoBR(subtotal);
    total.textContent = formatarPrecoBR(totalFinal);

    if (cupomAplicado && desconto > 0) {
        discountLine.hidden = false;
        discountElement.textContent = `-${formatarPrecoBR(desconto)}`;
        couponLabel.textContent = `(${cupomAplicado.codigo})`;
        if (removeCoupon) removeCoupon.hidden = false;
    } else {
        discountLine.hidden = true;
        couponLabel.textContent = '';
        if (removeCoupon) removeCoupon.hidden = true;
    }

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

async function validarCupom(codigo, subtotal) {
    const resposta = await fetch('/checkout/validar-cupom/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ codigo, subtotal })
    });

    let dados;

    try {
        dados = await resposta.json();
    } catch {
        throw new Error('Entre na sua conta novamente para aplicar o cupom.');
    }

    if (!resposta.ok || !dados.ok) {
        throw new Error(dados.message || 'Cupom invalido.');
    }

    return dados;
}

async function aplicarCupom(codigo, mensagemCarregando = 'Validando cupom...') {
    const itens = carregarCarrinho();
    const subtotal = calcularSubtotal(itens);

    if (!itens.length) {
        mostrarStatusCupom('Adicione produtos ao carrinho antes de aplicar um cupom.', 'error');
        return;
    }

    mostrarStatusCupom(mensagemCarregando);

    try {
        const dados = await validarCupom(codigo, subtotal);
        cupomAplicado = {
            codigo: dados.codigo,
            desconto_percentual: dados.desconto_percentual,
            valor_desconto: dados.valor_desconto,
            total_com_desconto: dados.total_com_desconto,
            subtotal_base: subtotal
        };
        salvarCupomAplicado(dados.codigo);
        document.getElementById('coupon-code').value = dados.codigo;
        mostrarStatusCupom(dados.message, 'success');
        renderizarResumoCheckout();
    } catch (erro) {
        cupomAplicado = null;
        salvarCupomAplicado('');
        mostrarStatusCupom(erro.message, 'error');
        renderizarResumoCheckout();
    }
}

function removerCupom() {
    cupomAplicado = null;
    salvarCupomAplicado('');
    document.getElementById('coupon-code').value = '';
    mostrarStatusCupom('Cupom removido.');
    renderizarResumoCheckout();
}

function preencherEnderecoPorCep(dadosCep) {
    document.getElementById('checkout-rua').value = dadosCep.rua || dadosCep.logradouro || '';
    document.getElementById('checkout-bairro').value = dadosCep.bairro || '';
    document.getElementById('checkout-cidade').value = dadosCep.cidade || dadosCep.localidade || '';
    document.getElementById('checkout-uf').value = dadosCep.uf || '';
}

function mostrarPopupPedidoConfirmado() {
    const popup = document.getElementById('checkout-success-popup');

    if (popup) {
        popup.hidden = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('checkout-cep');
    const cepStatus = document.getElementById('cep-status');
    const buscarCepButton = document.getElementById('buscar-cep');
    const checkoutForm = document.getElementById('checkout-form');
    const couponForm = document.getElementById('coupon-form');
    const couponInput = document.getElementById('coupon-code');
    const removeCoupon = document.getElementById('remove-coupon');
    const confirmOrder = document.getElementById('confirm-order');

    renderizarResumoCheckout();

    const cupomSalvo = getCupomSalvo();
    if (cupomSalvo) {
        couponInput.value = cupomSalvo;
        aplicarCupom(cupomSalvo, 'Revalidando cupom...');
    }

    couponForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const codigo = couponInput.value.trim().toUpperCase();

        if (!codigo) {
            mostrarStatusCupom('Informe um codigo de cupom.', 'error');
            return;
        }

        aplicarCupom(codigo);
    });

    removeCoupon.addEventListener('click', removerCupom);

    buscarCepButton.addEventListener('click', async () => {
        const cep = cepInput.value.replace(/\D/g, '');

        if (cep.length !== 8) {
            cepStatus.textContent = 'Informe um CEP com 8 numeros.';
            return;
        }

        cepStatus.textContent = 'Buscando endereco...';

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resposta.json();

            if (dados.erro) {
                cepStatus.textContent = 'CEP nao encontrado.';
                return;
            }

            preencherEnderecoPorCep(dados);
            cepStatus.textContent = 'Endereco preenchido automaticamente.';
        } catch (erro) {
            console.error(erro);
            cepStatus.textContent = 'Erro ao consultar o CEP.';
        }
    });

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const itens = carregarCarrinho();

        if (!itens.length) {
            alert('Seu carrinho esta vazio.');
            return;
        }

        if (confirmOrder) {
            confirmOrder.disabled = true;
            confirmOrder.textContent = 'PEDIDO CONFIRMADO';
        }

        salvarCompraFinalizada(itens);
        salvarCarrinho([]);
        salvarCupomAplicado('');
        renderizarResumoCheckout();
        mostrarPopupPedidoConfirmado();

        setTimeout(() => {
            window.location.href = '/perfil/';
        }, 2500);
    });
});
