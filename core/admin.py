from django.contrib import admin

from .models import Produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ("nome", "categoria", "tipo", "valor", "criado_em")
    search_fields = ("nome", "categoria", "tipo")
    list_filter = ("categoria", "tipo")
