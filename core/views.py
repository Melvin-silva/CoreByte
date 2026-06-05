from django.shortcuts import render
from django.http import HttpResponse

def page_not_found_view(request, exception):
    return render(request, '404.html', status=404)

def internal_server_error_view(request):
    return render(request, '500.html', status=500)

def test_500(request):
    raise Exception("Erro forçado para teste!")

def forcar_erro(request):
    
    return HttpResponse(1 / 0)
