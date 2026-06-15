from django import forms
from django.contrib.auth.models import User
from django.utils import timezone

from .models import Cupom, PerfilUsuario


class CadastroForm(forms.Form):
    nome = forms.CharField(max_length=150)
    email = forms.EmailField()
    senha = forms.CharField(widget=forms.PasswordInput)
    confirmar_senha = forms.CharField(widget=forms.PasswordInput)

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if (
            User.objects.filter(username__iexact=email).exists()
            or User.objects.filter(email__iexact=email).exists()
        ):
            raise forms.ValidationError("Este e-mail ja esta cadastrado.")

        return email

    def clean(self):
        cleaned_data = super().clean()
        senha = cleaned_data.get("senha")
        confirmar_senha = cleaned_data.get("confirmar_senha")

        if senha and confirmar_senha and senha != confirmar_senha:
            raise forms.ValidationError("As senhas nao coincidem.")

        return cleaned_data


class LoginForm(forms.Form):
    email = forms.CharField(max_length=254)
    senha = forms.CharField(widget=forms.PasswordInput)


class PerfilUsuarioForm(forms.ModelForm):
    class Meta:
        model = PerfilUsuario
        fields = ["imagem"]
        widgets = {
            "imagem": forms.FileInput(attrs={
                "accept": "image/*",
            }),
        }


class CupomForm(forms.ModelForm):
    class Meta:
        model = Cupom
        fields = ["codigo", "desconto_percentual", "ativo", "validade"]
        widgets = {
            "codigo": forms.TextInput(attrs={
                "placeholder": "Ex: GAMER10",
                "autocomplete": "off",
            }),
            "desconto_percentual": forms.NumberInput(attrs={
                "step": "0.01",
                "min": "0",
                "max": "100",
                "placeholder": "Ex: 10.00",
            }),
            "validade": forms.DateInput(
                attrs={"type": "date"},
                format="%Y-%m-%d",
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["validade"].input_formats = ["%Y-%m-%d"]

    def clean_codigo(self):
        return self.cleaned_data["codigo"].strip().upper()

    def clean_desconto_percentual(self):
        desconto = self.cleaned_data["desconto_percentual"]

        if desconto <= 0 or desconto > 100:
            raise forms.ValidationError("Informe um desconto entre 0,01% e 100%.")

        return desconto

    def clean_validade(self):
        validade = self.cleaned_data.get("validade")

        if validade and validade < timezone.localdate():
            raise forms.ValidationError("A validade nao pode ser uma data passada.")

        return validade
