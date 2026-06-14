# CoreByte

CoreByte é uma loja virtual gamer desenvolvida com Django. O projeto apresenta um catálogo de produtos, páginas de detalhe, autenticação de usuários, avaliações, carrinho de compras e fluxo de checkout.

## Integrantes
Alunos: Adriano Augusto, Ayas Fernando, Diego Henrique, Jalison Moura, Melvin silva dos santos, Ruan Araujo 

## Funcionalidades

- Catálogo de produtos com imagem, categoria, tipo, preço e destaque de promoção.
- Página de detalhes do produto com descrição formatada, preço antigo, desconto e avaliações.
- Cadastro e login de usuários.
- Área administrativa do Django para gerenciar categorias, produtos e comentários.
- Carrinho de compras no navegador usando `localStorage`.
- Checkout com resumo do pedido e busca de endereço por CEP via ViaCEP.
- Páginas personalizadas para erro 404 e erro 500.

## Tecnologias

- Python
- Django 6
- PostgreSQL
- HTML, CSS e JavaScript
- Pillow para imagens
- python-decouple para variáveis de ambiente

## Estrutura do projeto

```text
CoreByte/
├── config/              # Configurações principais do Django
├── core/                # App principal com models, views, forms e admin
├── media/               # Imagens enviadas dos produtos
├── static/              # Arquivos CSS, JS e imagens estáticas
├── templates/           # Páginas HTML
├── manage.py            # Utilitário de gerenciamento do Django
├── requirements.txt     # Dependências do projeto
└── README.md
```

## Pré-requisitos

Antes de começar, tenha instalado:

- Python 3.12 ou superior
- PostgreSQL
- Git

## Como executar o projeto

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd CoreByte
```

2. Crie e ative um ambiente virtual:

```bash
python -m venv .venv
```

No Windows:

```bash
.venv\Scripts\activate
```

No Linux/macOS:

```bash
source .venv/bin/activate
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Crie um arquivo `.env` na raiz do projeto:

```env
SECRET_KEY=sua-chave-secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=CoreByte
DB_USER=postgres
DB_PASSWORD=sua-senha
DB_HOST=localhost
DB_PORT=5432
```

5. Crie o banco de dados no PostgreSQL com o nome configurado em `DB_NAME`.

6. Execute as migrações:

```bash
python manage.py migrate
```

7. Crie um superusuário para acessar o painel administrativo:

```bash
python manage.py createsuperuser
```

8. Inicie o servidor:

```bash
python manage.py runserver
```

9. Acesse no navegador:

```text
http://127.0.0.1:8000/
```

Painel administrativo:

```text
http://127.0.0.1:8000/admin/
```

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Página inicial com catálogo de produtos |
| `/login/` | Login de usuários |
| `/cadastro/` | Cadastro de usuários |
| `/produto/<id>/` | Detalhes de um produto |
| `/carrinho/` | Carrinho de compras |
| `/checkout/` | Finalização do pedido |
| `/logout/` | Encerramento da sessão |
| `/admin/` | Administração do Django |

## Modelos principais

### Categoria

Representa as categorias dos produtos, como jogos, teclados, mouses, headsets e controles.

### Produto

Armazena os dados dos itens vendidos na loja, incluindo imagem, nome, categoria, tipo, descrição, preço, promoção e preço antigo.

### Comentário

Representa as avaliações feitas por usuários autenticados em cada produto, com texto, nota de 1 a 5 e status de aprovação.

## Observações

- O carrinho é salvo no navegador do usuário com a chave `corebyte_carrinho`.
- O checkout consulta CEPs usando a API pública do ViaCEP.
- As imagens dos produtos ficam em `media/produtos/`.
- O projeto usa sessões assinadas em cookies por meio de `django.contrib.sessions.backends.signed_cookies`.
- O arquivo `.env` não deve ser enviado para o repositório, pois contém dados sensíveis.

## Comandos úteis

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Status

Projeto acadêmico/demonstrativo de e-commerce gamer com funcionalidades essenciais de catálogo, conta de usuário, avaliações, carrinho e checkout.
