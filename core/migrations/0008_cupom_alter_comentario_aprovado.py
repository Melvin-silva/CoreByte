from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_comentario_avaliacao"),
    ]

    operations = [
        migrations.CreateModel(
            name="Cupom",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("codigo", models.CharField(max_length=30, unique=True, verbose_name="Codigo")),
                (
                    "desconto_percentual",
                    models.DecimalField(decimal_places=2, max_digits=5, verbose_name="Desconto percentual"),
                ),
                ("ativo", models.BooleanField(default=True, verbose_name="Ativo")),
                ("validade", models.DateField(blank=True, null=True, verbose_name="Validade")),
                ("criado_em", models.DateTimeField(auto_now_add=True, verbose_name="Criado em")),
                ("atualizado_em", models.DateTimeField(auto_now=True, verbose_name="Atualizado em")),
            ],
            options={
                "verbose_name": "Cupom",
                "verbose_name_plural": "Cupons",
                "ordering": ["-criado_em"],
            },
        ),
        migrations.AlterField(
            model_name="comentario",
            name="aprovado",
            field=models.BooleanField(default=False, verbose_name="Aprovado"),
        ),
    ]
