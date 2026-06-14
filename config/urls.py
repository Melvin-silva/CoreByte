from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.views import serve as staticfiles_serve
from django.urls import path, re_path
from django.views.static import serve as media_serve

from core import views


urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('cadastro/', views.cadastro_view, name='cadastro'),
    path('produto/<int:produto_id>/', views.produto_detalhe, name='produto_detalhe'),
    path('carrinho/', views.carrinho_view, name='carrinho'),
    path('checkout/', views.checkout_view, name='checkout'),
    path('logout/', views.logout_view, name='logout'),
    path('erro-404/', views.preview_404_view, name='preview_404'),
    path('admin/', admin.site.urls),

    path('test-500/', views.test_500, name='test_500'),
    path('debug-500/', views.forcar_erro, name='debug_500'),

    re_path(r'^static/(?P<path>.*)$', staticfiles_serve, {'insecure': True}),
    re_path(r'^media/(?P<path>.*)$', media_serve, {'document_root': settings.MEDIA_ROOT}),
]

handler404 = 'core.views.page_not_found_view'
handler500 = 'core.views.internal_server_error_view' 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
