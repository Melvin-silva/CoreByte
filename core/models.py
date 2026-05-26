from django.db import models
from datetime import datetime
from django.forms import CharField

class Produto(models.Models):
    Nome = models.CharField(20)
    Categoria = models.CharField(50)
    Tipo = models.CharField(20)
    Decrição = models.TextField()
    Valor = models.DecimalField() 



# Create your models here.
