<<<<<<< HEAD
"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]
=======
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
>>>>>>> 1a269466f8b708dc39cfe6b8d9d866ae8627679e
