from django.db import migrations, models


def publicar_comentarios_existentes(apps, schema_editor):
    Comentario = apps.get_model("core", "Comentario")
    Comentario.objects.update(aprovado=True)


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_cupom_alter_comentario_aprovado"),
    ]

    operations = [
        migrations.AlterField(
            model_name="comentario",
            name="aprovado",
            field=models.BooleanField(default=True, verbose_name="Aprovado"),
        ),
        migrations.RunPython(publicar_comentarios_existentes, migrations.RunPython.noop),
    ]
