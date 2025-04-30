# MITG Logistics

Esse aplicativo visa receber um conjunto de arquivos em formato TXT/Text-Plain, em um modelo fixo de dados seguindo um tamanho fixado de colunas

A partir desse arquivo deve se retornar um JSON com os dados estruturados e tratados, prontos para serem utilizados em uma integração.

## Estrutura do projeto

```bash
├── src
│   ├── data
│     ├── protocols
│       ├── file
│       ├── order
│   ├── environment
│   ├── infra
│     ├── file
│     ├── order
│   ├── main
│     ├── adapters
│     ├── config
│     ├── middlewares
│     ├── routes
│   ├── presentation
│     ├── clients
│     ├── controllers
│       ├── orders
│     ├── helpers
│       ├── http
│     ├── protocols
```

## Tecnologias Utilizadas

### Produção

- Node.js
- Typescript
- Express
- Zod
- Vite

### Desenvolvimento

- Vitest
- Husky
- Commitlint
- Prettier
- Eslint
- Lint-staged

## Devops

O projeto conta com um pipeline de CI/CD, que realiza o deploy automático da branch `main` utilizando o `Github Actions` para o ambiente de produção, no qual se encontra hospedado em um painel de controle. Este painel realiza o deploy um container docker.

## Como rodar o projeto

### Pré-requisitos

- Node.js
- PNPM (ou NPM/Yarn) - `Recomendado o PNPM`

### Env

- Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```bash
NODE_ENV="development" # Options: 'development', 'production'
PORT="8080"            # The port your server will listen on
HOST="localhost"       # Hostname for the server
CORS_ORIGIN="*" # Allowed CORS origin, adjust as necessary
```

### Instalação

1. Clone o repositório:

```bash
git clone git@github.com:mitgdev/mitg.logistics.git
cd mitg.logistics
```

2. Instale as dependências:

> É possivel utilizar o `npm` ou o `yarn`, mas o recomendado é o `pnpm`, que é mais rápido e eficiente.

```bash
pnpm install
```

3. Inicie o servidor:

```bash
pnpm start:dev
```

4. Compilação para produção:

> Vale ressaltar a utilização do `vite` como bundler, o qual realiza a compilação do código para produção, otimizando o mesmo e reduzindo o tamanho do bundle.

```bash
pnpm build
pnpm start:prod
```

## Testes

### Testes Unitários

Os testes unitários são realizados utilizando o `vitest`, que é um framework de testes rápido e leve, ideal para projetos em TypeScript.

### Execução dos testes

```bash
pnpm test
```

### Coverage

```bash
pnpm test:coverage
```

## Rotas Disponíveis

<details>
  <summary>
    <code>[POST] /api/orders</code>
    <code>(retorna o agrupamento dos pedidos por usuario)</code>
  </summary>

### Parameters

- `order_id`: ID do pedido. Este campo é opcional e pode ser utilizado para filtrar os pedidos retornados.
  - Exemplo: `?order_id=123`
- `startDate`: Data de início para filtrar os pedidos. Este campo é opcional e pode ser utilizado para filtrar os pedidos retornados.
  - Exemplo: `?startDate=2021-01-01`
- `endDate`: Data de fim para filtrar os pedidos. Este campo é opcional e pode ser utilizado para filtrar os pedidos retornados.
  - Exemplo: `?endDate=2021-12-31`

Combinações de filtros:

- `?order_id=123`
- `?startDate=2021-01-01&endDate=2021-12-31`
- `?order_id=123&startDate=2021-01-01&endDate=2021-12-31`

A datas seguem o formate `YYYY-MM-DD`, e o `order_id` é um número inteiro. Sendo que a data de início deve ser menor que a data de fim.

### Body

- `files`: Arquivo(s) a serem processados. O arquivo deve ser enviado no formato `multipart/form-data` e deve conter os dados no formato fixo especificado.
  - Exemplo: `files: [file1.txt, file2.txt]`, os arquivos devem ser no formato `txt` e devem conter os dados no formato fixo especificado.

### Response

#### Sucesso

```json
{
  {
    "data": [
        {
            "user_id": 49,
            "user_name": "Ken Wintheiser",
            "orders": [
                {
                    "order_id": 531,
                    "total": 2125.89,
                    "date": "2021-03-21",
                    "products": [
                        {
                            "product_id": 4,
                            "value": 400.75
                        },
                        {
                            "product_id": 4,
                            "value": 1725.14
                        }
                    ]
                }
            ]
        }
    ]
  }
}
```

#### Erro

```json
{
  "error": {
    "issues": [
      {
        "message": "Files is required",
        "code": "invalid_type",
        "expected": "array",
        "received": "undefined",
        "path": ["files"],
        "fatal": false
      }
    ],
    "name": "ZodError"
  }
}
```

</details>

## Observações

- Por que da utilização do `pnpm`?
  - O `pnpm` é um gerenciador de pacotes mais rápido e eficiente, que utiliza um cache global para evitar a duplicação de dependências. Isso resulta em uma instalação mais rápida e um uso mais eficiente do espaço em disco.
- Por que da utilização do `vite`?
  - O `vite` é um bundler moderno que oferece uma experiência de desenvolvimento mais rápida e eficiente, com recarregamento instantâneo e otimizações para produção. Ele é especialmente útil para projetos em TypeScript, pois oferece suporte nativo a esse tipo de projeto.
