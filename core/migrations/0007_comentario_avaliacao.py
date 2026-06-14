from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_produto_em_promocao_produto_valor_antigo_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="comentario",
            name="avaliacao",
            field=models.PositiveSmallIntegerField(
                choices=[(1, "1"), (2, "2"), (3, "3"), (4, "4"), (5, "5")],
                default=5,
                verbose_name="Avaliacao",
            ),
        ),
    ]
