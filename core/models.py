from django.db import models


class Produto(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome")
    categoria = models.CharField(max_length=50, verbose_name="Categoria")
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
