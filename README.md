# Calendário Escoteiro

Site de calendário de eventos para grupo escoteiro, com listagem de eventos
filtrável por categoria/seção e inscrição de participantes sem necessidade
de login.

## Arquitetura

O projeto é dividido em duas partes **totalmente separadas**, que se
comunicam só por HTTP (requisições `fetch()` devolvendo JSON):

```
Frontend (HTML/CSS/JS puro)  <---- JSON via fetch() ---->  Backend (Django + DRF)
```

- **Backend**: Django + Django REST Framework (DRF), responsável só por
  guardar dados e expor uma API JSON. Não gera HTML nem serve páginas.
- **Frontend**: HTML/CSS/JavaScript puro (sem framework), que consome a
  API via `fetch()` e monta a tela dinamicamente no navegador, sem reload
  de página a cada ação do usuário.

**Por que essa separação em vez do Django tradicional (Views + Templates)?**
Permite um site mais dinâmico: filtros, inscrição e atualização de dados
acontecem sem recarregar a página inteira — só a parte relevante da tela é
atualizada, buscando novos dados sob demanda.

---

## Modelagem de dados (backend)

Cinco models, todos no app `eventos`:

```
Categoria ──1:N──┐
                  ├──> Evento ──M:N──> Secao
                  │       │
                  │      1:N
                  │       ▼
                  │   Inscricao ──N:1──> Participante
```

### `Categoria`
Classifica o tipo de evento (Acampamento, Reunião, Cerimônia, Trilha...).

| Campo | Tipo |
|---|---|
| `nome` | CharField(50) |
| `cor` | CharField(7) |

- `cor`: código hexadecimal (ex: `#2f5233`), usado pra pintar o card no front

**Por quê um model separado, e não um `choices` fixo no `Evento`?**
Assim é possível criar/editar categorias pelo Django Admin sem precisar
mexer em código nem fazer novo deploy.

*Pendência conhecida:* campo de ícone (`icone`) foi propositalmente deixado
de fora por enquanto — pode ser adicionado depois como nova coluna.

### `Secao`
Representa o ramo/seção escoteira (Lobinhos, Escoteiros, Seniors,
Pioneiros...).

| Campo | Tipo |
|---|---|
| `nome` | CharField(30) |

### `Evento`
O evento em si.

| Campo | Tipo |
|---|---|
| `titulo` | CharField(200) |
| `descricao` | TextField, `blank=True` |
| `data_inicio` | DateField |
| `data_fim` | DateField |
| `hora_inicio` / `hora_fim` | TimeField, `null=True, blank=True` |
| `categoria` | ForeignKey(Categoria, `on_delete=SET_NULL`, `null=True`) |
| `secoes` | ManyToManyField(Secao) |
| `local` | CharField(300) |

- `descricao`: opcional
- `data_fim`: obrigatório — em eventos de 1 dia só, repete a mesma data
  de início (decisão consciente: preferiu digitar a data duas vezes a
  ter um campo opcional)
- `hora_inicio` / `hora_fim`: opcionais — a hora de eventos como
  acampamentos costuma ser definida só perto da data, por isso fica
  separada da data e pode ficar em branco até ser decidida
- `categoria`: se a categoria for apagada, o evento continua existindo,
  só perde a categoria (`SET_NULL`)
- `secoes`: um evento pode valer para mais de uma seção ao mesmo tempo
  (ex: acampamento geral)

*Pendência conhecida:* campos cogitados e propositalmente deixados de fora
por enquanto: `o_que_levar`, `responsavel`, `inscricao_necessaria`,
`vagas`. Podem ser adicionados depois via nova migração.

### `Participante`
Quem se inscreve num evento. Não existe sistema de login — o e-mail
funciona como identificador informal da pessoa.

| Campo | Tipo |
|---|---|
| `nome` | CharField(50) |
| `email` | EmailField, `unique=True` |
| `telefone` | CharField(20), `blank=True` |
| `secao` | ForeignKey(Secao, `on_delete=PROTECT`) |

- `email`: chave usada para localizar/reaproveitar o cadastro sem exigir
  login
- `telefone`: opcional
- `secao`: `on_delete=PROTECT` impede apagar uma seção que já tem
  participantes cadastrados nela

### `Inscricao`
Liga um `Participante` a um `Evento`. Existe como tabela própria (em vez
de um `ManyToManyField` direto entre os dois) porque a inscrição carrega
informação própria que um M:N simples não guardaria.

| Campo | Tipo |
|---|---|
| `evento` | ForeignKey(Evento, `on_delete=CASCADE`) |
| `participante` | ForeignKey(Participante, `on_delete=CASCADE`) |
| `status` | CharField com `choices` (`pendente`/`confirmado`/`cancelado`), default `"pendente"` |
| `data_inscricao` | DateTimeField, `auto_now_add=True` |

- `evento` / `participante`: `CASCADE` em ambos — se um dos dois for
  apagado, a inscrição é apagada junto
- `data_inscricao`: preenchida automaticamente na criação, nunca editada
  manualmente

*Decisões conscientes:* sem campo de `observacao` por enquanto; sem
`unique_together` entre `evento` e `participante` — ou seja, o mesmo
participante **pode** se inscrever mais de uma vez no mesmo evento, caso
aconteça.

---

## API — Rotas disponíveis

Todas as rotas abaixo ficam sob o prefixo `/api/` (configurado no
`urls.py` principal do projeto via `include("eventos.urls")`).

### Rotas de CRUD automático (`ModelViewSet` + `DefaultRouter`)

Cada uma das rotas abaixo já responde automaticamente a `GET` (listar),
`GET /<id>/` (detalhe), `POST` (criar), `PUT`/`PATCH` (editar) e `DELETE`
(apagar), sem lógica customizada — o DRF gera tudo a partir do
`queryset` + `serializer_class` de cada `ViewSet`.

| Rota | Model | ViewSet |
|---|---|---|
| `/api/categorias/` | `Categoria` | `CategoriaViewSet` |
| `/api/eventos/` | `Evento` | `EventoViewSet` |
| `/api/secoes/` | `Secao` | `SecaoViewSet` |
| `/api/participantes/` | `Participante` | `ParticipanteViewSet` |
| `/api/inscricoes/` | `Inscricao` | `InscricaoViewSet` |

Todos os serializers usam `fields = "__all__"` (decisão de simplicidade —
se algum campo precisar ser escondido de alguma resposta no futuro, é só
trocar para uma lista explícita naquele serializer específico).

### Rota customizada de inscrição

```
POST /api/eventos/<int:evento_id>/inscrever/
```
View: `InscricaoCreateView` (`APIView`, não `ModelViewSet` — por isso
precisa de uma linha manual de `path()` no `urls.py`, em vez de passar
pelo router).

**Por que essa rota existe separada, e não usa só `/api/inscricoes/`?**
Porque o fluxo de inscrição sem login precisa fazer **duas ações em
sequência**, em **dois models diferentes**, numa única requisição — o que
foge do padrão CRUD de 1 model que o `ModelViewSet` resolve sozinho:

1. Busca um `Participante` pelo `email` enviado. Se não existir, cria um
   novo. Se já existir, **atualiza** os dados dele (nome, telefone, seção)
   com o que veio na requisição — decisão consciente: cadastro sempre
   reflete a informação mais recente, em vez de manter o primeiro
   cadastro para sempre.
2. Cria uma nova `Inscricao` ligando esse participante ao evento da URL.

**Corpo esperado da requisição (JSON):**
```json
{
    "nome": "João Silva",
    "email": "joao@teste.com",
    "telefone": "11999999999",
    "secao": 1
}
```
(`secao` é o ID de uma `Secao` já cadastrada)

**Resposta em caso de sucesso** (`201`):
```json
{
    "detail": "Inscrição realizada com sucesso!",
    "inscricao_id": 6
}
```

**Resposta em caso de dados inválidos** (`400`): erros de validação do
`ParticipanteSerializer` (ex: e-mail em formato inválido, campo
obrigatório ausente).

**Detalhe importante de validação:** o `ParticipanteSerializer` redeclara
o campo `email` manualmente (`email = serializers.EmailField()`) para
manter a validação de *formato* de e-mail, mas remover a validação
automática de *unicidade* que o DRF geraria sozinho a partir do
`unique=True` do model. Sem esse ajuste, tentar se inscrever de novo com
um e-mail já cadastrado seria barrado como "erro de duplicata" antes
mesmo de chegar na lógica de atualização do passo 1 — o que quebraria o
fluxo de reinscrição.

---

## Configuração de infraestrutura

### CORS
Como front e back rodam em endereços diferentes durante o
desenvolvimento, o backend usa `django-cors-headers` para liberar
explicitamente o endereço de onde o front é servido:

```python
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]
```
(porta padrão da extensão Live Server do VS Code)

### Permissões da API
```python
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}
```
Toda a API está aberta por enquanto (sem autenticação), já que não existe
login de participante nem de líder implementado ainda. Ponto de atenção
para revisão futura: quando autenticação de líder for adicionada, as
rotas de escrita (criar/editar/apagar eventos e categorias) devem passar
a exigir permissão, mantendo as rotas de leitura e a de inscrição
públicas.

---

## Ideias para próximos passos (não implementado ainda)

- Adicionar coluna de ícone em `Categoria`
- Adicionar `o_que_levar`, `responsavel`, `inscricao_necessaria`, `vagas`
  em `Evento`
- Autenticação para líderes gerenciarem eventos pela API/admin com mais
  segurança
- E-mail de confirmação de inscrição (reduz risco de e-mail digitado
  errado, já que hoje não há verificação)
- Exportação de eventos para `.ics` (Google Calendar / Apple Calendar)
- + Frontend: formulário de inscrição consumindo a rota
  `/api/eventos/<id>/inscrever/` (calendário visual e filtros de
  categoria/seção já implementados)
