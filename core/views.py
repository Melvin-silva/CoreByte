from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.utils.text import slugify

from .forms import CadastroForm, LoginForm
from .models import Produto


def formatar_preco_br(valor):
    return f"{valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def normalizar_slug(valor):
    slug = slugify(valor)
    equivalencias = {
        "headseats": "headset",
        "headsets": "headset",
        "jogos": "jogo",
        "mouses": "mouse",
        "teclados": "teclado",
        "controles": "controle",
        "acao-aventura": "acao",
    }
    return equivalencias.get(slug, slug)


def index(request):
    produtos = []

    for produto in Produto.objects.select_related("categoria").all():
        categoria_slug = normalizar_slug(produto.categoria.nome)
        tipo_slug = normalizar_slug(produto.tipo)
        classes = " ".join(filter(None, [
            tipo_slug,
            "show",
            categoria_slug,
            "promo" if produto.em_promocao else "",
        ]))
        imagem_url = ""
        if produto.imagem and produto.imagem.storage.exists(produto.imagem.name):
            imagem_url = produto.imagem.url
        valor_antigo = formatar_preco_br(produto.valor_antigo) if produto.valor_antigo else ""
        badge = ""
        if produto.em_promocao and produto.valor_antigo and produto.valor_antigo > produto.valor:
            desconto = round((1 - (produto.valor / produto.valor_antigo)) * 100)
            badge = f"-{desconto}%"

        produtos.append({
            "nome": produto.nome,
            "imagem_url": imagem_url,
            "preco": formatar_preco_br(produto.valor),
            "valor_antigo": valor_antigo,
            "badge": badge,
            "categoria_slug": categoria_slug,
            "tipo_slug": tipo_slug,
            "classes": classes,
        })

    return render(request, 'index.html', {"produtos": produtos})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)

        if form.is_valid():
            email = form.cleaned_data['email'].strip().lower()
            senha = form.cleaned_data['senha']
            usuario = authenticate(request, username=email, password=senha)

            if usuario is not None:
                login(request, usuario)
                messages.success(request, 'Login realizado com sucesso.')
                return redirect('index')

            messages.error(request, 'E-mail ou senha invalidos.')
        else:
            messages.error(request, 'Informe um e-mail e senha validos.')

    return render(request, 'Login.html')

def cadastro_view(request):
    if request.method == 'POST':
        form = CadastroForm(request.POST)

        if form.is_valid():
            nome = form.cleaned_data['nome'].strip()
            email = form.cleaned_data['email']
            senha = form.cleaned_data['senha']

            User.objects.create_user(
                username=email,
                email=email,
                password=senha,
                first_name=nome,
            )
            messages.success(request, 'Cadastro realizado com sucesso. Entre com sua conta.')
            return redirect('login')

        for erros in form.errors.values():
            for erro in erros:
                messages.error(request, erro)

    return render(request, 'cadastro.html')

def carrinho_view(request):
    return render(request, 'carrinho.html')

def checkout_view(request):
    return render(request, 'checkout.html')

def logout_view(request):
    logout(request)
    messages.success(request, 'Voce saiu da sua conta.')
    return redirect('index')

def page_not_found_view(request, exception):
    return render(request, '404.html', status=404)

def internal_server_error_view(request):
    return render(request, '500.html', status=500)

def test_500(request):
    raise Exception("Erro forçado para teste!")

def forcar_erro(request):
    
    return HttpResponse(1 / 0)
