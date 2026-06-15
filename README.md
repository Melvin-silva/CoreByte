# CoreByte

CoreByte e uma loja virtual gamer desenvolvida com Django. O projeto apresenta catalogo de produtos, pagina de detalhes, autenticacao de usuarios, avaliacoes, carrinho de compras, checkout com ViaCEP e CRUD de cupons.

## Integrantes

Adriano Augusto, Ayas Fernando, Diego Henrique, Jalison Moura, Melvin Silva dos Santos e Ruan Araujo.

## Funcionalidades

- Catalogo de produtos com imagem, categoria, tipo, preco e destaque de promocao.
- Pagina dedicada de produtos em `/produtos/`.
- Pagina de detalhes do produto com descricao, preco antigo, desconto e avaliacoes.
- Cadastro, login, logout e pagina de perfil do usuario.
- Comentarios com nota de 1 a 5 estrelas publicados automaticamente.
- Controle de acesso por perfil:
  - usuario comum acessa loja, perfil, carrinho, checkout, comentarios e visualizacao de cupons;
  - gerente/admin acessa cadastro, edicao e exclusao de cupons.
- Carrinho de compras salvo no navegador com `localStorage`.
- Checkout com resumo do pedido, busca de endereco por CEP via ViaCEP e aplicacao real de cupom.
- CRUD de cupons com tela propria e area administrativa do Django.
- Paginas personalizadas para erro 404 e erro 500.
- Configuracao por variaveis de ambiente usando `.env`.

## Tecnologias

- Python
- Django 6
- PostgreSQL / Supabase Database
- HTML, CSS e JavaScript
- Pillow para imagens
- python-decouple para variaveis de ambiente

## Estrutura do projeto

```text
CoreByte/
├── config/              # Configuracoes principais do Django
├── core/                # App principal com models, views, forms e admin
├── media/               # Imagens enviadas dos produtos
├── static/              # Arquivos CSS, JS e imagens estaticas
├── templates/           # Paginas HTML
├── manage.py            # Utilitario de gerenciamento do Django
├── requirements.txt     # Dependencias do projeto
├── .env.example         # Exemplo de variaveis de ambiente
└── README.md
```

## Como executar o projeto

1. Clone o repositorio:

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

3. Instale as dependencias:

```bash
pip install -r requirements.txt
```

4. Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

5. Configure o banco no `.env`.

Exemplo local:

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

Exemplo usando Supabase:

```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=postgres
DB_USER=seu_usuario_supabase
DB_PASSWORD=sua_senha_supabase
DB_HOST=seu_host_supabase
DB_PORT=5432
```

6. Execute as migracoes:

```bash
python manage.py migrate
```

7. Crie um superusuario para acessar o admin:

```bash
python manage.py createsuperuser
```

8. Inicie o servidor:

```bash
python manage.py runserver
```

9. Acesse:

```text
http://127.0.0.1:8000/
```

```text
http://127.0.0.1:8000/admin/
```

## Usuario de teste
Comum

Gmail: teste@gmail.com
Senha: 1234ruan

Admin

Nome: ayas_admin@gmail.com
Senha: A@123456

## Rotas principais

| Rota | Descricao |
| --- | --- |
| `/` | Pagina inicial da loja |
| `/produtos/` | Pagina com catalogo completo de produtos |
| `/produto/<id>/` | Detalhes de um produto |
| `/perfil/` | Perfil do usuario logado |
| `/login/` | Login de usuarios |
| `/cadastro/` | Cadastro de usuarios |
| `/cupons/` | Listagem de cupons |
| `/cupons/novo/` | Cadastro de cupom para gerente/admin |
| `/cupons/<id>/editar/` | Edicao de cupom para gerente/admin |
| `/cupons/<id>/excluir/` | Exclusao de cupom para gerente/admin |
| `/carrinho/` | Carrinho de compras |
| `/checkout/` | Finalizacao do pedido |
| `/checkout/validar-cupom/` | Validacao de cupom no checkout |
| `/logout/` | Encerramento da sessao |
| `/admin/` | Administracao do Django |

## Modelos principais

### Categoria

Representa as categorias dos produtos, como jogos, teclados, mouses, headsets e controles.

### Produto

Armazena os dados dos itens vendidos na loja, incluindo imagem, nome, categoria, tipo, descricao, preco, promocao e preco antigo.

### Comentario

Representa avaliacoes feitas por usuarios autenticados em cada produto, com texto e nota de 1 a 5.

### Cupom

Armazena cupons promocionais com codigo, percentual de desconto, validade e status ativo/inativo.

## Observacoes

- O carrinho e salvo no navegador com a chave `corebyte_carrinho`.
- O cupom aplicado no checkout e salvo temporariamente com a chave `corebyte_cupom_checkout`.
- O checkout consulta CEPs usando a API publica do ViaCEP.
- As imagens dos produtos ficam em `media/produtos/` no ambiente local.
- Em deploy, as imagens devem ser enviadas manualmente para um storage publico, como Supabase Storage.
- O projeto usa sessoes assinadas em cookies por meio de `django.contrib.sessions.backends.signed_cookies`.
- O arquivo `.env` nao deve ser enviado para o repositorio, pois contem dados sensiveis.

## Comandos uteis

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
python manage.py collectstatic
```

## Status

Projeto academico/demonstrativo de e-commerce gamer com funcionalidades essenciais de catalogo, conta de usuario, avaliacoes, cupons, carrinho e checkout.
