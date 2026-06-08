from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

def index(request):
    return render(request, 'index.html')

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        senha = request.POST.get('senha', '')
        email_cadastrado = request.session.get('email_cadastrado')
        senha_cadastrada = request.session.get('senha_cadastrada')
        nome_cadastrado = request.session.get('nome_cadastrado')

        if email and senha and email == email_cadastrado and senha == senha_cadastrada:
            request.session['usuario_logado'] = email
            request.session['usuario_nome'] = nome_cadastrado or email.split('@')[0]
            response = redirect('index')
            response.set_cookie('corebyte_usuario_logado', email)
            response.set_cookie('corebyte_usuario_nome', nome_cadastrado or email.split('@')[0])
            return response

        return redirect('/login/?erro=credenciais')

    return render(request, 'Login.html')

@csrf_exempt
def cadastro_view(request):
    if request.method == 'POST':
        nome = request.POST.get('nome', '').strip()
        email = request.POST.get('email', '').strip()
        senha = request.POST.get('senha', '')
        confirmar_senha = request.POST.get('confirmar_senha', '')

        if senha != confirmar_senha:
            return redirect('cadastro')

        request.session['email_cadastrado'] = email
        request.session['senha_cadastrada'] = senha
        request.session['nome_cadastrado'] = nome or email.split('@')[0]

        return redirect('login')

    return render(request, 'cadastro.html')

def logout_view(request):
    request.session.flush()
    response = redirect('index')
    response.delete_cookie('corebyte_usuario_logado')
    response.delete_cookie('corebyte_usuario_nome')
    return response

def page_not_found_view(request, exception):
    return render(request, '404.html', status=404)

def internal_server_error_view(request):
    return render(request, '500.html', status=500)

def test_500(request):
    raise Exception("Erro forçado para teste!")

def forcar_erro(request):
    
    return HttpResponse(1 / 0)
