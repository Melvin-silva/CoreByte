// ==========================================
// 1. VARIÁVEIS GLOBAIS E LÓGICA DE CARRINHO
// ==========================================
let carrinhoItens = [];

function isStaticPreview() {
    return window.location.protocol === 'file:' || window.location.pathname.toLowerCase().includes('/templates/');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const authStatus = document.getElementById('auth-status');
        const usuarioNome = localStorage.getItem('corebyte_usuario_nome');

        if (authStatus && isStaticPreview() && !usuarioNome) {
            authStatus.innerHTML = 'Ola, <a href="Login.html" class="auth-link">Entre</a> ou <a href="cadastro.html" class="auth-link">Cadastre-se</a>';
        }
    }, 0);
});

function carregarCarrinhoSalvo() {
    try {
        carrinhoItens = JSON.parse(localStorage.getItem('corebyte_carrinho')) || [];
    } catch {
        carrinhoItens = [];
    }
}

function salvarCarrinho() {
    localStorage.setItem('corebyte_carrinho', JSON.stringify(carrinhoItens));
}

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

function atualizarInterfaceCarrinho() {
    const listaCarrinhoUI = document.getElementById('cart-items-container');
    if (!listaCarrinhoUI) return;
    listaCarrinhoUI.innerHTML = '';
    let totalGeral = 0;

    carrinhoItens.forEach((item, index) => {
        totalGeral += converterPrecoParaNumero(item.preco);
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
    if (totalUI) totalUI.innerText = formatarPrecoBR(totalGeral);
}

function atualizarContadorCarrinho() {
    const contadorUI = document.getElementById('cart-count');
    if (contadorUI) contadorUI.innerText = carrinhoItens.length;
}

window.removerDoCarrinho = (index) => {
    carrinhoItens.splice(index, 1);
    salvarCarrinho();
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
    carregarCarrinhoSalvo();
    atualizarInterfaceCarrinho();
    atualizarContadorCarrinho();
    
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
            const imagemDoCard = this.closest('.product-card')?.querySelector('.product-img')?.src;
            const imagem = imagemDoCard || this.getAttribute('data-image');
            
            if (nome && preco) {
                carrinhoItens.push({ nome, preco, imagem });
                salvarCarrinho();
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

    if (!inputBusca || !containerProdutos) return;

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

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const destino = isStaticPreview()
                ? 'carrinho.html'
                : '/carrinho/';

            window.location.href = destino;
        });
    }
});

// ==========================================
// 4. CHATBOT COM IA SIMBOLICA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.getElementById('chatbot-help-button');
    const panel = document.getElementById('chatbot-panel');
    const closeButton = document.getElementById('chatbot-close');
    const messages = document.getElementById('chatbot-messages');
    const options = document.getElementById('chatbot-options');

    if (!helpButton || !panel || !closeButton || !messages || !options) return;

    const decisionTree = {
        inicio: {
            bot: 'Ola! Sou o assistente simbolico da CoreByte. Como posso ajudar?',
            options: [
                { label: 'Escolher produto', next: 'produto_tipo' },
                { label: 'Encontrar promocao', next: 'promocao_tipo' },
                { label: 'Ajuda com carrinho', next: 'carrinho_inicio' }
            ]
        },
        produto_tipo: {
            bot: 'Qual tipo de produto voce procura?',
            options: [
                { label: 'Mouse', next: 'mouse_uso', action: () => aplicarFiltroChatbot('mouse') },
                { label: 'Teclado', next: 'teclado_uso', action: () => aplicarFiltroChatbot('teclado') },
                { label: 'Headset', next: 'headset_uso', action: () => aplicarFiltroChatbot('headset') },
                { label: 'Jogo', next: 'jogo_genero', action: () => aplicarFiltroChatbot('jogo') }
            ]
        },
        mouse_uso: {
            bot: 'Para qual perfil de mouse?',
            options: [
                { label: 'Competitivo', next: 'mouse_competitivo' },
                { label: 'Custo-beneficio', next: 'mouse_custo' },
                { label: 'Sem fio', next: 'mouse_sem_fio' }
            ]
        },
        mouse_competitivo: {
            bot: 'Sugestao: veja modelos Razer ou Logitech. Eles combinam com foco em precisao e desempenho.',
            options: [
                { label: 'Filtrar Razer', next: 'final', action: () => filtrar('razer') },
                { label: 'Filtrar Logitech', next: 'final', action: () => filtrar('logitech') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        mouse_custo: {
            bot: 'Sugestao: procure Redragon, Havit ou HyperX para equilibrar preco e qualidade.',
            options: [
                { label: 'Filtrar Redragon', next: 'final', action: () => filtrar('redragon') },
                { label: 'Filtrar Havit', next: 'final', action: () => filtrar('havit') },
                { label: 'Filtrar HyperX', next: 'final', action: () => filtrar('hyperx') }
            ]
        },
        mouse_sem_fio: {
            bot: 'Sugestao: pesquise por "sem fio" na barra de busca para ver os modelos wireless.',
            options: [
                { label: 'Buscar sem fio', next: 'final', action: () => buscarProdutoChatbot('sem fio') },
                { label: 'Ver mouses', next: 'final', action: () => aplicarFiltroChatbot('mouse') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        teclado_uso: {
            bot: 'Que tipo de teclado voce quer?',
            options: [
                { label: 'Mecanico gamer', next: 'teclado_mecanico' },
                { label: 'RGB', next: 'teclado_rgb' },
                { label: 'Marca especifica', next: 'teclado_marca' }
            ]
        },
        teclado_mecanico: {
            bot: 'Sugestao: escolha teclados Razer, Redragon, HyperX ou Havit com foco gamer.',
            options: [
                { label: 'Ver teclados', next: 'final', action: () => aplicarFiltroChatbot('teclado') },
                { label: 'Filtrar Redragon', next: 'final', action: () => filtrar('redragon') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        teclado_rgb: {
            bot: 'Sugestao: use a busca por RGB para encontrar produtos com iluminacao.',
            options: [
                { label: 'Buscar RGB', next: 'final', action: () => buscarProdutoChatbot('rgb') },
                { label: 'Ver teclados', next: 'final', action: () => aplicarFiltroChatbot('teclado') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        teclado_marca: {
            bot: 'Escolha uma marca para filtrar.',
            options: [
                { label: 'Razer', next: 'final', action: () => filtrar('razer') },
                { label: 'Logitech', next: 'final', action: () => filtrar('logitech') },
                { label: 'HyperX', next: 'final', action: () => filtrar('hyperx') }
            ]
        },
        headset_uso: {
            bot: 'O que e mais importante no headset?',
            options: [
                { label: 'Sem fio', next: 'headset_sem_fio' },
                { label: 'Preco menor', next: 'headset_preco' },
                { label: 'Marca gamer', next: 'headset_marca' }
            ]
        },
        headset_sem_fio: {
            bot: 'Sugestao: busque por "sem fio" e compare Logitech, Redragon e Razer.',
            options: [
                { label: 'Buscar sem fio', next: 'final', action: () => buscarProdutoChatbot('sem fio') },
                { label: 'Ver headsets', next: 'final', action: () => aplicarFiltroChatbot('headset') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        headset_preco: {
            bot: 'Sugestao: veja Havit, Redragon e SuperFrame para opcoes mais acessiveis.',
            options: [
                { label: 'Filtrar Havit', next: 'final', action: () => filtrar('havit') },
                { label: 'Filtrar Redragon', next: 'final', action: () => filtrar('redragon') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        headset_marca: {
            bot: 'Marcas fortes para headset gamer: Razer, Logitech, HyperX e Redragon.',
            options: [
                { label: 'Razer', next: 'final', action: () => filtrar('razer') },
                { label: 'Logitech', next: 'final', action: () => filtrar('logitech') },
                { label: 'HyperX', next: 'final', action: () => filtrar('hyperx') }
            ]
        },
        jogo_genero: {
            bot: 'Qual genero voce prefere?',
            options: [
                { label: 'RPG', next: 'jogo_rpg', action: () => aplicarGeneroJogo('rpg') },
                { label: 'Acao / aventura', next: 'jogo_acao', action: () => aplicarGeneroJogo('acao') },
                { label: 'Terror', next: 'jogo_terror', action: () => aplicarGeneroJogo('terror') }
            ]
        },
        jogo_rpg: {
            bot: 'Sugestao: Elden Ring, Sekiro ou Black Myth combinam com quem gosta de desafio e progressao.',
            options: [
                { label: 'Buscar Elden Ring', next: 'final', action: () => buscarProdutoChatbot('elden ring') },
                { label: 'Buscar Sekiro', next: 'final', action: () => buscarProdutoChatbot('sekiro') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        jogo_acao: {
            bot: 'Sugestao: God of War, Spider-Man, Detroit ou Death Stranding para aventura e narrativa.',
            options: [
                { label: 'Buscar God of War', next: 'final', action: () => buscarProdutoChatbot('god of war') },
                { label: 'Buscar Spider-Man', next: 'final', action: () => buscarProdutoChatbot('spider') },
                { label: 'Ver acao', next: 'final', action: () => aplicarGeneroJogo('acao') }
            ]
        },
        jogo_terror: {
            bot: 'Sugestao: Resident Evil Requiem aparece como opcao de terror.',
            options: [
                { label: 'Buscar Resident Evil', next: 'final', action: () => buscarProdutoChatbot('resident evil') },
                { label: 'Ver terror', next: 'final', action: () => aplicarGeneroJogo('terror') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        promocao_tipo: {
            bot: 'Que promocao voce quer encontrar?',
            options: [
                { label: 'Todas as promocoes', next: 'promocao_todas', action: () => filtrar('promo') },
                { label: 'Promocao de perifericos', next: 'promocao_perifericos' },
                { label: 'Promocao de jogos', next: 'promocao_jogos' }
            ]
        },
        promocao_todas: {
            bot: 'Filtrei os produtos em promocao. Eles aparecem com etiqueta de desconto ou novidade.',
            options: [
                { label: 'Ver todos de novo', next: 'final', action: () => aplicarFiltroChatbot('todos') },
                { label: 'Escolher por categoria', next: 'produto_tipo' },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        promocao_perifericos: {
            bot: 'Primeiro escolha o tipo de periferico, depois olhe os cards com etiqueta de desconto.',
            options: [
                { label: 'Mouse em promocao', next: 'final', action: () => aplicarFiltroChatbot('mouse') },
                { label: 'Teclado em promocao', next: 'final', action: () => aplicarFiltroChatbot('teclado') },
                { label: 'Headset em promocao', next: 'final', action: () => aplicarFiltroChatbot('headset') }
            ]
        },
        promocao_jogos: {
            bot: 'Filtrei jogos. Procure os cards com etiqueta de desconto ou NEW.',
            options: [
                { label: 'Ver jogos', next: 'final', action: () => aplicarFiltroChatbot('jogo') },
                { label: 'Ver jogos de acao', next: 'final', action: () => aplicarGeneroJogo('acao') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        carrinho_inicio: {
            bot: 'O que voce precisa fazer no carrinho?',
            options: [
                { label: 'Adicionar produto', next: 'carrinho_adicionar' },
                { label: 'Ver carrinho', next: 'carrinho_ver' },
                { label: 'Remover produto', next: 'carrinho_remover' }
            ]
        },
        carrinho_adicionar: {
            bot: 'Escolha um produto e clique em ADICIONAR. O carrinho abre automaticamente.',
            options: [
                { label: 'Ver produtos', next: 'final', action: () => aplicarFiltroChatbot('todos') },
                { label: 'Buscar produto', next: 'produto_tipo' },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        carrinho_ver: {
            bot: 'Clique no icone de carrinho no topo. Ele mostra quantidade, itens e total.',
            options: [
                { label: 'Abrir carrinho', next: 'final', action: abrirCarrinhoChatbot },
                { label: 'Continuar comprando', next: 'produto_tipo' },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        carrinho_remover: {
            bot: 'Dentro do carrinho, use o botao de lixeira ao lado do item que deseja remover.',
            options: [
                { label: 'Abrir carrinho', next: 'final', action: abrirCarrinhoChatbot },
                { label: 'Ver produtos', next: 'final', action: () => aplicarFiltroChatbot('todos') },
                { label: 'Voltar ao inicio', next: 'inicio' }
            ]
        },
        final: {
            bot: 'Pronto! Apliquei a acao indicada. Posso ajudar com outra coisa?',
            options: [
                { label: 'Escolher produto', next: 'produto_tipo' },
                { label: 'Ver promocoes', next: 'promocao_tipo' },
                { label: 'Ajuda com carrinho', next: 'carrinho_inicio' }
            ]
        }
    };

    function addMessage(text, type) {
        const message = document.createElement('div');
        message.className = `chatbot-message ${type}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function renderNode(nodeKey) {
        const node = decisionTree[nodeKey];
        if (!node) return;

        addMessage(node.bot, 'bot');
        options.innerHTML = '';

        node.options.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'chatbot-option';
            button.textContent = option.label;
            button.addEventListener('click', () => {
                addMessage(option.label, 'user');
                if (option.action) option.action();
                renderNode(option.next);
            });
            options.appendChild(button);
        });
    }

    function openChatbot() {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');

        if (!messages.children.length) {
            renderNode('inicio');
        }
    }

    helpButton.addEventListener('click', openChatbot);
    closeButton.addEventListener('click', () => {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
    });
});

function aplicarFiltroChatbot(categoria) {
    const produtos = document.querySelectorAll('.product-card');

    produtos.forEach(produto => {
        if (categoria === 'todos' || produto.classList.contains(categoria)) {
            produto.classList.remove('esconder-animado');
            produto.style.display = 'block';
        } else {
            produto.classList.add('esconder-animado');
            produto.style.display = 'none';
        }
    });
}

function aplicarGeneroJogo(genero) {
    aplicarFiltroChatbot('jogo');

    if (typeof filtrarSubCategoria === 'function') {
        filtrarSubCategoria(genero);
    }
}

function buscarProdutoChatbot(termo) {
    const inputBusca = document.getElementById('barra-busca');
    if (!inputBusca) return;

    inputBusca.value = termo;
    inputBusca.dispatchEvent(new Event('input'));
    inputBusca.focus();
}

function abrirCarrinhoChatbot() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.add('open');
    document.body.classList.add('cart-open');
}

// ==========================================
// 5. CARROSSEL DO HERO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const track = carousel.querySelector('.hero-carousel-track');
    const prevButton = carousel.querySelector('.hero-carousel-btn.prev');
    const nextButton = carousel.querySelector('.hero-carousel-btn.next');
    const dotsContainer = carousel.querySelector('.hero-carousel-dots');
    const usarTransicaoLateral = slides.every((slide) => slide.classList.contains('banner-image-slide'));
    let currentSlide = 0;
    let intervalId;

    function normalizarTexto(texto) {
        return String(texto)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    slides.forEach((slide) => {
        const termo = normalizarTexto(slide.dataset.match || '');
        if (!termo) return;

        const produto = Array.from(document.querySelectorAll('.product-card')).find((card) => {
            const nome = normalizarTexto(card.querySelector('h3')?.textContent || '');
            return nome.includes(termo);
        });

        const precoReal = produto?.querySelector('.current-price')?.textContent.trim();
        const precoSlide = slide.querySelector('p');
        if (precoReal && precoSlide) {
            precoSlide.textContent = precoReal;
        }
    });

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        if (usarTransicaoLateral && track) {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        dotsContainer?.querySelectorAll('.hero-carousel-dot').forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startAutoplay() {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 4500);
    }

    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-carousel-dot';
        dot.setAttribute('aria-label', `Produto ${index + 1}`);
        dot.addEventListener('click', () => {
            showSlide(index);
            startAutoplay();
        });
        dotsContainer?.appendChild(dot);
    });

    prevButton?.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        startAutoplay();
    });

    nextButton?.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        startAutoplay();
    });

    showSlide(0);
    startAutoplay();
});

// ==========================================
// 6. LOGIN VISUAL NA HOME
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('corebyte_tema');

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('corebyte_tema', theme);
        });
    }

    const homeLogoLink = document.getElementById('home-logo-link');
    if (homeLogoLink) {
        homeLogoLink.addEventListener('click', (event) => {
            event.preventDefault();

            if (isStaticPreview()) {
                window.location.href = 'index.html';
            } else {
                window.location.href = '/';
            }
        });
    }

    const authStatus = document.getElementById('auth-status');
    if (!authStatus) return;

    const liveServerMode = isStaticPreview();
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key) acc[key] = decodeURIComponent(value || '');
        return acc;
    }, {});

    const usuarioNome = localStorage.getItem('corebyte_usuario_nome') || cookies.corebyte_usuario_nome;

    if (usuarioNome) {
        authStatus.innerHTML = `
            <span class="logged-user">
                <span class="logged-greeting">Olá, <strong>${usuarioNome}</strong></span>
                <a href="#" class="logout-link" id="logout-link">Sair</a>
            </span>
        `;

        document.getElementById('logout-link').addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('corebyte_usuario_logado');
            localStorage.removeItem('corebyte_usuario_nome');

            if (liveServerMode) {
                window.location.reload();
            } else {
                window.location.href = '/logout/';
            }
        });

        return;
    }

    if (liveServerMode) {
        authStatus.innerHTML = 'Ola, <a href="Login.html" class="auth-link">Entre</a> ou <a href="cadastro.html" class="auth-link">Cadastre-se</a>';
    }
});
