from django.contrib import admin

from .models import Categoria, Comentario, Produto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome",)
    search_fields = ("nome",)


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ("imagem", "nome", "categoria", "tipo", "valor", "em_promocao", "valor_antigo", "criado_em")
    search_fields = ("nome", "categoria__nome", "tipo")
    list_filter = ("categoria", "tipo", "em_promocao")


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ("produto", "usuario", "aprovado", "criado_em")
    search_fields = ("produto__nome", "usuario__username", "texto")
    list_filter = ("aprovado", "criado_em")
    autocomplete_fields = ("produto", "usuario")
