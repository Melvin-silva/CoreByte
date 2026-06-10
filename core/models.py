from django.conf import settings
from django.db import models


class Categoria(models.Model):
    nome = models.CharField(max_length=50, unique=True, verbose_name="Categoria")

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ["nome"]

    def __str__(self):
        return self.nome

class Produto(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome")
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="produtos",
        verbose_name="Categoria",
    )
    tipo = models.CharField(max_length=50, verbose_name="Tipo")
    descricao = models.TextField(verbose_name="Descricao")
    valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Valor",
    )
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")


    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Comentario(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name="comentarios",
        verbose_name="Produto",
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comentarios",
        verbose_name="Usuario",
    )
    texto = models.TextField(verbose_name="Comentario")
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    aprovado = models.BooleanField(default=True, verbose_name="Aprovado")

    class Meta:
        verbose_name = "Comentario"
        verbose_name_plural = "Comentarios"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"{self.usuario} - {self.produto}"
    

