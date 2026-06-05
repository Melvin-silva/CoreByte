from django.shortcuts import render
<<<<<<< HEAD

# Create your views here.
=======
from django.http import HttpResponse

def index(request):
    return render(request, 'index.html')

def page_not_found_view(request, exception):
    return render(request, '404.html', status=404)

def internal_server_error_view(request):
    return render(request, '500.html', status=500)

def test_500(request):
    raise Exception("Erro forçado para teste!")

def forcar_erro(request):
    
    return HttpResponse(1 / 0)
>>>>>>> 1a269466f8b708dc39cfe6b8d9d866ae8627679e
