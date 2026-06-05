// ==========================================
// 1. VARIÁVEIS GLOBAIS E LÓGICA DE CARRINHO
// ==========================================
let carrinhoItens = [];

function atualizarInterfaceCarrinho() {
    const listaCarrinhoUI = document.getElementById('cart-items-container');
    if (!listaCarrinhoUI) return;
    listaCarrinhoUI.innerHTML = '';
    let totalGeral = 0;

    carrinhoItens.forEach((item, index) => {
        totalGeral += parseFloat(item.preco);
        listaCarrinhoUI.innerHTML += `
            <div class="cart-item-row">
                <img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: contain; margin-right: 10px;">
                <div style="flex-grow: 1;">
                    <strong style="display:block; font-size: 14px;">${item.nome}</strong>
                    <span style="color: #00f2ff;">R$ ${item.preco}</span>
                </div>
                <button onclick="removerDoCarrinho(${index})" style="background:none; border:none; color: #ff4b2b; cursor:pointer;">🗑️</button>
            </div>
        `;
    });
    const totalUI = document.getElementById('total-price');
    if (totalUI) totalUI.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

function atualizarContadorCarrinho() {
    const contadorUI = document.getElementById('cart-count');
    if (contadorUI) contadorUI.innerText = carrinhoItens.length;
}

window.removerDoCarrinho = (index) => {
    carrinhoItens.splice(index, 1);
    atualizarInterfaceCarrinho();
    atualizarContadorCarrinho();
};

// ==========================================
// 2. FUNÇÕES DE FILTRAGEM
// ==========================================
function filtrar(marca) {
    document.querySelectorAll('.product-card').forEach(produto => {
        if (marca === 'todos' || produto.classList.contains(marca)) {
            produto.classList.remove('esconder-animado');
            produto.style.display = 'block';
        } else {
            produto.classList.add('esconder-animado');
            produto.style.display = 'none';
        }
    });
}

function filtrarSubCategoria(generoSelecionado) {
    document.querySelectorAll('.product-card').forEach(produto => {
        const categoriaCard = produto.getAttribute('data-categoria');
        if (produto.classList.contains('jogo')) {
            if (categoriaCard === generoSelecionado) {
                produto.classList.remove('esconder-animado');
                produto.style.display = 'block';
            } else {
                produto.classList.add('esconder-animado');
                produto.style.display = 'none';
            }
        }
    });
}

// ==========================================
// 3. INICIALIZAÇÃO ÚNICA (EVENTOS)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
    // Configurações do Carrinho
    const cartBtn = document.querySelector('.cart-link');
    const closeBtn = document.getElementById('close-cart');
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (sidebar) sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.classList.add('cart-open');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.classList.remove('cart-open');
        });
    }

    // Botões "Adicionar ao Carrinho" - APENAS ESTE BLOCO
    document.querySelectorAll('.add-to-cart-btn').forEach(botao => {
        botao.addEventListener('click', function() {
            const nome = this.getAttribute('data-name');
            const preco = this.getAttribute('data-price');
            const imagem = this.getAttribute('data-image');
            
            if (nome && preco) {
                carrinhoItens.push({ nome, preco, imagem });
                atualizarInterfaceCarrinho();
                atualizarContadorCarrinho();
                
                if (sidebar) sidebar.classList.add('open');
                document.body.classList.add('cart-open');
            }
        });
    });

    // Filtros
    document.querySelectorAll('.radio-marca').forEach(radio => {
        radio.addEventListener('click', function() {
            if (this.checked) filtrar(this.value);
        });
    });

    document.querySelectorAll('.radio-categoria').forEach(radio => {
        radio.addEventListener('click', function() {
            if (this.checked) filtrarSubCategoria(this.value);
        });
    });
});

function filtrarSeçãoPrincipal(categoriaSelecionada) {
    // 1. Seleciona todos os produtos
    const produtos = document.querySelectorAll('.product-card');

    // 2. Loop para aplicar o filtro
    produtos.forEach(produto => {
        // Se a categoria for 'todos', removemos a classe que esconde
        if (categoriaSelecionada === 'todos') {
            produto.classList.remove('esconder-animado');
            produto.style.display = 'block'; 
        } 
        // Verifica se o card tem a classe exata (mouse, teclado, etc)
        else if (produto.classList.contains(categoriaSelecionada)) {
            produto.classList.remove('esconder-animado');
            produto.style.display = 'block';
        } 
        // Caso contrário, esconde
        else {
            produto.classList.add('esconder-animado');
            produto.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const cardsMenu = document.querySelectorAll('.cat-card');
    const filtroJogos = document.getElementById('filtro-jogos');
    const btnJogos = document.getElementById('btn-jogos');

    cardsMenu.forEach(card => {
        // Limpa eventos anteriores para evitar o disparo triplo (a causa do seu problema)
        const novoCard = card.cloneNode(true);
        card.parentNode.replaceChild(novoCard, card);

        novoCard.addEventListener('click', function() {
            // 1. Remove classe 'ativo' de todos
            document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('ativo'));
            
            // 2. Adiciona no clicado
            this.classList.add('ativo');

            // 3. Lógica do menu de jogos
            if (this.id === 'btn-jogos') {
                filtroJogos.classList.toggle('escondido');
            } else {
                filtroJogos.classList.add('escondido');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const inputBusca = document.getElementById('barra-busca');
    const containerProdutos = document.getElementById('grid-produtos'); // Use o ID do seu grid

    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.toLowerCase();
        const cards = containerProdutos.querySelectorAll('.product-card');

        cards.forEach(card => {
            // Pega o texto dentro do <h3> que está no seu product-info
            const nomeProduto = card.querySelector('h3').innerText.toLowerCase();

            // Mostra se contiver o termo, esconde se não
            if (nomeProduto.includes(termo)) {
                card.style.display = "block"; 
            } else {
                card.style.display = "none";
            }
        });
    });
});