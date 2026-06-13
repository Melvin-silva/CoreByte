from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect, render

from .forms import CadastroForm, LoginForm

def index(request):
    return render(request, 'index.html')

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
