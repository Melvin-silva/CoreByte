import json
from decimal import Decimal, InvalidOperation
from functools import wraps
from urllib.parse import quote

from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import DatabaseError
from django.db.models import Avg, Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.utils.text import slugify
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from .forms import CadastroForm, CupomForm, LoginForm, PerfilUsuarioForm
from .models import Comentario, Cupom, PerfilUsuario, Produto


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


def usuario_gerente(user):
    return user.is_authenticated and user.is_staff


def gerente_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, "Entre com uma conta de gerente para acessar esta area.")
            return redirect(f"/login/?next={quote(request.get_full_path())}")

        if not request.user.is_staff:
            messages.error(request, "Esta area e restrita para gerente ou administrador.")
            return redirect("index")

        return view_func(request, *args, **kwargs)

    return wrapper


def autenticar_por_identificador(request, identificador, senha):
    identificador = identificador.strip()

    if not identificador or not senha:
        return None

    usuario = (
        User.objects
        .filter(Q(username__iexact=identificador) | Q(email__iexact=identificador))
        .only("id", "username", "email", "password", "is_active", "first_name")
        .first()
    )

    if usuario is None or not usuario.is_active or not usuario.check_password(senha):
        return None

    usuario.backend = "django.contrib.auth.backends.ModelBackend"
    return usuario


def montar_produtos_catalogo(busca=""):
    produtos = []
    queryset = Produto.objects.select_related("categoria").all()

    if busca:
        queryset = queryset.filter(
            Q(nome__icontains=busca)
            | Q(tipo__icontains=busca)
            | Q(categoria__nome__icontains=busca)
        )

    for produto in queryset:
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

    return produtos


def obter_foto_perfil_url(user):
    if not user.is_authenticated:
        return ""

    try:
        perfil = user.perfil
    except PerfilUsuario.DoesNotExist:
        return ""

    if perfil.imagem and perfil.imagem.storage.exists(perfil.imagem.name):
        return perfil.imagem.url

    return ""


def index(request):
    produtos = montar_produtos_catalogo(request.GET.get("q", "").strip())

    return render(request, 'index.html', {
        "produtos": produtos,
        "foto_perfil_url": obter_foto_perfil_url(request.user),
    })


def produtos_view(request):
    produtos = montar_produtos_catalogo(request.GET.get("q", "").strip())

    return render(request, "produtos.html", {"produtos": produtos})


@login_required(login_url='/login/')
def perfil_view(request):
    perfil, _ = PerfilUsuario.objects.get_or_create(usuario=request.user)
    total_comentarios = Comentario.objects.filter(usuario=request.user).count()
    nome_perfil = (
        request.user.get_full_name()
        or request.user.first_name
        or request.user.username
        or request.user.email
    )
    form = PerfilUsuarioForm(instance=perfil)

    if request.method == "POST":
        form = PerfilUsuarioForm(request.POST, request.FILES, instance=perfil)

        if form.is_valid():
            form.save()
            messages.success(request, "Imagem de perfil atualizada com sucesso.")
            return redirect("perfil")

        messages.error(request, "Nao foi possivel atualizar a imagem de perfil.")

    return render(request, "perfil.html", {
        "nome_perfil": nome_perfil,
        "perfil_form": form,
        "foto_perfil_url": obter_foto_perfil_url(request.user),
        "total_comentarios": total_comentarios,
    })

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
            aprovado=True,
        )
        messages.success(request, "Avaliacao publicada com sucesso.")
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


@login_required(login_url='/login/')
def cupom_lista(request):
    cupons = Cupom.objects.all()
    total_cupons = cupons.count()
    cupons_ativos = cupons.filter(ativo=True).count()

    return render(request, "cupom_lista.html", {
        "cupons": cupons,
        "total_cupons": total_cupons,
        "cupons_ativos": cupons_ativos,
    })


@gerente_required
def cupom_criar(request):
    if request.method == "POST":
        form = CupomForm(request.POST)

        if form.is_valid():
            form.save()
            messages.success(request, "Cupom cadastrado com sucesso.")
            return redirect("cupom_lista")
    else:
        form = CupomForm()

    return render(request, "cupom_form.html", {
        "form": form,
        "titulo": "Cadastrar cupom",
        "subtitulo": "Crie um novo desconto para campanhas da CoreByte.",
        "botao": "Cadastrar cupom",
    })


@gerente_required
def cupom_editar(request, cupom_id):
    cupom = get_object_or_404(Cupom, id=cupom_id)

    if request.method == "POST":
        form = CupomForm(request.POST, instance=cupom)

        if form.is_valid():
            form.save()
            messages.success(request, "Cupom atualizado com sucesso.")
            return redirect("cupom_lista")
    else:
        form = CupomForm(instance=cupom)

    return render(request, "cupom_form.html", {
        "form": form,
        "cupom": cupom,
        "titulo": "Editar cupom",
        "subtitulo": "Atualize o codigo, desconto, validade ou status do cupom.",
        "botao": "Salvar alteracoes",
    })


@gerente_required
def cupom_excluir(request, cupom_id):
    cupom = get_object_or_404(Cupom, id=cupom_id)

    if request.method == "POST":
        cupom.delete()
        messages.success(request, "Cupom excluido com sucesso.")
        return redirect("cupom_lista")

    return render(request, "cupom_confirm_delete.html", {"cupom": cupom})

def login_view(request):
    next_url = request.POST.get("next") or request.GET.get("next") or ""
    safe_next_url = ""

    if next_url and url_has_allowed_host_and_scheme(
        next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        safe_next_url = next_url

    if request.user.is_authenticated and request.method == "GET":
        return redirect(safe_next_url or "index")

    context = {"next": safe_next_url}

    if request.method == 'POST':
        form = LoginForm(request.POST)

        if form.is_valid():
            email = form.cleaned_data['email'].strip()
            senha = form.cleaned_data['senha']

            try:
                usuario = autenticar_por_identificador(request, email, senha)
            except DatabaseError:
                messages.error(request, 'Nao foi possivel conectar ao banco de dados. Confira a conexao com o Supabase.')
                return render(request, 'Login.html', context)

            if usuario is not None:
                login(request, usuario)
                messages.success(request, 'Login realizado com sucesso.')
                return redirect(safe_next_url or 'index')

            messages.error(request, 'E-mail ou senha invalidos.')
        else:
            messages.error(request, 'Informe e-mail e senha para entrar.')

    return render(request, 'Login.html', context)

def cadastro_view(request):
    if request.method == 'POST':
        senha_digitada = request.POST.get('senha')
        confirmar_senha_digitada = request.POST.get('confirmar_senha')

        if senha_digitada and confirmar_senha_digitada and senha_digitada != confirmar_senha_digitada:
            messages.error(request, 'As senhas nao coincidem.')
            return render(request, 'cadastro.html')

        form = CadastroForm(request.POST)

        try:
            form_valido = form.is_valid()
        except DatabaseError:
            messages.error(request, 'Nao foi possivel validar o cadastro agora. Confira a conexao com o banco de dados.')
            return render(request, 'cadastro.html')

        if form_valido:
            nome = form.cleaned_data['nome'].strip()
            email = form.cleaned_data['email']
            senha = form.cleaned_data['senha']

            try:
                User.objects.create_user(
                    username=email,
                    email=email,
                    password=senha,
                    first_name=nome,
                )
            except DatabaseError:
                messages.error(request, 'Nao foi possivel concluir o cadastro agora. Confira a conexao com o banco de dados.')
                return render(request, 'cadastro.html')

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
@require_POST
def validar_cupom_checkout(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({
            "ok": False,
            "message": "Nao foi possivel ler o cupom informado.",
        }, status=400)

    codigo = str(payload.get("codigo", "")).strip().upper()
    subtotal = Decimal("0")

    if not codigo:
        return JsonResponse({
            "ok": False,
            "message": "Informe um codigo de cupom.",
        }, status=400)

    try:
        subtotal = Decimal(str(payload.get("subtotal", "0"))).quantize(Decimal("0.01"))
    except (InvalidOperation, TypeError, ValueError):
        return JsonResponse({
            "ok": False,
            "message": "Subtotal invalido para aplicar o cupom.",
        }, status=400)

    if subtotal <= 0:
        return JsonResponse({
            "ok": False,
            "message": "Adicione produtos ao carrinho antes de aplicar um cupom.",
        }, status=400)

    try:
        cupom = Cupom.objects.only(
            "codigo",
            "desconto_percentual",
            "ativo",
            "validade",
        ).get(codigo__iexact=codigo)
    except Cupom.DoesNotExist:
        return JsonResponse({
            "ok": False,
            "message": "Cupom nao encontrado.",
        }, status=404)
    except DatabaseError:
        return JsonResponse({
            "ok": False,
            "message": "Nao foi possivel consultar o cupom agora.",
        }, status=503)

    if not cupom.ativo:
        return JsonResponse({
            "ok": False,
            "message": "Este cupom esta inativo.",
        }, status=400)

    if cupom.validade and cupom.validade < timezone.localdate():
        return JsonResponse({
            "ok": False,
            "message": "Este cupom esta vencido.",
        }, status=400)

    desconto_percentual = Decimal(cupom.desconto_percentual)
    valor_desconto = (subtotal * desconto_percentual / Decimal("100")).quantize(Decimal("0.01"))
    total_com_desconto = max(subtotal - valor_desconto, Decimal("0.00"))

    return JsonResponse({
        "ok": True,
        "codigo": cupom.codigo,
        "desconto_percentual": float(desconto_percentual),
        "valor_desconto": float(valor_desconto),
        "total_com_desconto": float(total_com_desconto),
        "message": f"Cupom {cupom.codigo} aplicado com sucesso.",
    })

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
