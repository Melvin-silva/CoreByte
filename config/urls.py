from django.contrib import admin
from django.urls import path, re_path 
from django.conf import settings
from django.views.static import serve
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),

    path('test-500/', views.test_500, name='test_500'),
    path('debug-500/', views.forcar_erro, name='debug_500'),

    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATICFILES_DIRS[0]}),
]

handler404 = 'core.views.page_not_found_view'
handler500 = 'core.views.internal_server_error_view' 
