from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def migrar_categorias(apps, schema_editor):
    Produto = apps.get_model("core", "Produto")
    Categoria = apps.get_model("core", "Categoria")

    for produto in Produto.objects.all():
        nome_categoria = (produto.categoria_nome_legado or "Sem categoria").strip()
        categoria, _ = Categoria.objects.get_or_create(nome=nome_categoria)
        produto.categoria = categoria
        produto.save(update_fields=["categoria"])


def desfazer_migracao_categorias(apps, schema_editor):
    Produto = apps.get_model("core", "Produto")

    for produto in Produto.objects.select_related("categoria"):
        produto.categoria_nome_legado = produto.categoria.nome
        produto.save(update_fields=["categoria_nome_legado"])


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Categoria",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "nome",
                    models.CharField(
                        max_length=50,
                        unique=True,
                        verbose_name="Categoria",
                    ),
                ),
            ],
            options={
                "verbose_name": "Categoria",
                "verbose_name_plural": "Categorias",
                "ordering": ["nome"],
            },
        ),
        migrations.RenameField(
            model_name="produto",
            old_name="categoria",
            new_name="categoria_nome_legado",
        ),
        migrations.AddField(
            model_name="produto",
            name="categoria",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="produtos",
                to="core.categoria",
                verbose_name="Categoria",
            ),
        ),
        migrations.RunPython(migrar_categorias, desfazer_migracao_categorias),
        migrations.AlterField(
            model_name="produto",
            name="categoria",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="produtos",
                to="core.categoria",
                verbose_name="Categoria",
            ),
        ),
        migrations.RemoveField(
            model_name="produto",
            name="categoria_nome_legado",
        ),
        migrations.CreateModel(
            name="Comentario",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("texto", models.TextField(verbose_name="Comentario")),
                (
                    "criado_em",
                    models.DateTimeField(auto_now_add=True, verbose_name="Criado em"),
                ),
                ("aprovado", models.BooleanField(default=True, verbose_name="Aprovado")),
                (
                    "produto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="comentarios",
                        to="core.produto",
                        verbose_name="Produto",
                    ),
                ),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="comentarios",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Usuario",
                    ),
                ),
            ],
            options={
                "verbose_name": "Comentario",
                "verbose_name_plural": "Comentarios",
                "ordering": ["-criado_em"],
            },
        ),
    ]
