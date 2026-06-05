from django.contrib import admin

<<<<<<< HEAD
# Register your models here.
=======
from .models import Produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ("nome", "categoria", "tipo", "valor", "criado_em")
    search_fields = ("nome", "categoria", "tipo")
    list_filter = ("categoria", "tipo")
>>>>>>> 1a269466f8b708dc39cfe6b8d9d866ae8627679e
