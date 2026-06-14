from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Avg
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.text import slugify

from .forms import CadastroForm, LoginForm
from .models import Comentario, Produto


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


def preparar_blocos_descricao(descricao):
    partes = [
        parte.strip()
        for parte in descricao.replace("\r\n", "\n").split("\n\n")
        if parte.strip()
    ]
    blocos = []

    for indice, parte in enumerate(partes):
        linhas = [linha.strip() for linha in parte.split("\n") if linha.strip()]
        if not linhas:
            continue

        if len(linhas) == 1:
            blocos.append({
                "titulo": linhas[0] if indice == 0 else "",
                "texto": "" if indice == 0 else linhas[0],
            })
            continue

        blocos.append({
            "titulo": linhas[0],
            "texto": "\n".join(linhas[1:]),
        })

    return blocos


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
            "id": produto.id,
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

def produto_detalhe(request, produto_id):
    produto = get_object_or_404(
        Produto.objects.select_related("categoria"),
        id=produto_id,
    )

    if request.method == "POST":
        if not request.user.is_authenticated:
            messages.error(request, "Entre na sua conta para avaliar o produto.")
            return redirect("login")

        texto = request.POST.get("texto", "").strip()
        avaliacao_raw = request.POST.get("avaliacao", "0")

        try:
            avaliacao = int(avaliacao_raw)
        except ValueError:
            avaliacao = 0

        if not texto:
            messages.error(request, "Escreva um comentario para enviar sua avaliacao.")
            return redirect("produto_detalhe", produto_id=produto.id)

        if avaliacao < 1 or avaliacao > 5:
            messages.error(request, "Escolha uma nota de 1 a 5 estrelas.")
            return redirect("produto_detalhe", produto_id=produto.id)

        Comentario.objects.create(
            produto=produto,
            usuario=request.user,
            texto=texto,
            avaliacao=avaliacao,
        )
        messages.success(request, "Avaliacao enviada com sucesso.")
        return redirect("produto_detalhe", produto_id=produto.id)

    comentarios = Comentario.objects.select_related("usuario").filter(
        produto=produto,
        aprovado=True,
    )
    total_avaliacoes = comentarios.count()
    media_avaliacao = comentarios.aggregate(media=Avg("avaliacao"))["media"] or 0
    media_avaliacao_arredondada = round(media_avaliacao)
    imagem_url = ""
    if produto.imagem and produto.imagem.storage.exists(produto.imagem.name):
        imagem_url = produto.imagem.url

    valor_antigo = formatar_preco_br(produto.valor_antigo) if produto.valor_antigo else ""
    badge = ""
    if produto.em_promocao and produto.valor_antigo and produto.valor_antigo > produto.valor:
        desconto = round((1 - (produto.valor / produto.valor_antigo)) * 100)
        badge = f"-{desconto}%"

    return render(request, "produto_detalhe.html", {
        "produto": produto,
        "descricao_blocos": preparar_blocos_descricao(produto.descricao),
        "imagem_url": imagem_url,
        "preco": formatar_preco_br(produto.valor),
        "valor_antigo": valor_antigo,
        "badge": badge,
        "comentarios": comentarios,
        "total_avaliacoes": total_avaliacoes,
        "media_avaliacao": media_avaliacao,
        "media_avaliacao_arredondada": media_avaliacao_arredondada,
    })

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

@login_required(login_url='/login/')
def carrinho_view(request):
    return render(request, 'carrinho.html')

@login_required(login_url='/login/')
def checkout_view(request):
    return render(request, 'checkout.html')

@login_required(login_url='/login/')
def logout_view(request):
    logout(request)
    messages.success(request, 'Voce saiu da sua conta.')
    return redirect('index')

def page_not_found_view(request, exception):
    return render(request, '404.html', status=404)

def preview_404_view(request):
    return render(request, '404.html', status=404)

def internal_server_error_view(request):
    return render(request, '500.html', status=500)

def test_500(request):
    raise Exception("Erro forçado para teste!")

def forcar_erro(request):
    
    return HttpResponse(1 / 0)
