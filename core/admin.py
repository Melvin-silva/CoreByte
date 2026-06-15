from django.contrib import admin

from .models import Categoria, Comentario, Cupom, PerfilUsuario, Produto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome",)
    search_fields = ("nome",)


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ("imagem", "nome", "categoria", "tipo", "valor", "em_promocao", "valor_antigo", "criado_em")
    search_fields = ("nome", "categoria__nome", "tipo")
    list_filter = ("categoria", "tipo", "em_promocao")


@admin.register(Cupom)
class CupomAdmin(admin.ModelAdmin):
    list_display = ("codigo", "desconto_percentual", "ativo", "validade", "criado_em")
    list_editable = ("desconto_percentual", "ativo", "validade")
    search_fields = ("codigo",)
    list_filter = ("ativo", "validade", "criado_em")
    ordering = ("-criado_em",)
    readonly_fields = ("criado_em", "atualizado_em")
    save_on_top = True
    fieldsets = (
        ("Dados do cupom", {
            "fields": ("codigo", "desconto_percentual", "ativo", "validade"),
        }),
        ("Controle", {
            "fields": ("criado_em", "atualizado_em"),
        }),
    )


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ("usuario", "imagem", "atualizado_em")
    search_fields = ("usuario__username", "usuario__email", "usuario__first_name")
    autocomplete_fields = ("usuario",)
    readonly_fields = ("atualizado_em",)


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ("produto", "usuario", "avaliacao", "criado_em")
    search_fields = ("produto__nome", "usuario__username", "texto")
    list_filter = ("avaliacao", "criado_em")
    autocomplete_fields = ("produto", "usuario")
    exclude = ("aprovado",)
