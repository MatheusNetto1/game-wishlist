# Game Wishlist
Aplicação full stack com backend em FastAPI e frontend em React, que permite buscar, visualizar e salvar jogos gratuitos na sua lista de desejos, com dados da [FreeToGame API](https://www.freetogame.com).

---

## Estrutura do Projeto

```
game-wishlist/
├── wishlist-api/         # Backend (FastAPI)
├── wishlist-client/      # Frontend (React + Tailwind CSS)
├── wishlist-tests/       # Testes automatizados com Postman
├── LICENSE
├── README.md
└── .gitignore
```

---

## Executando o Projeto

## Requisitos
- [Python 3.10+](https://www.python.org) com `pip`
- [Node.js + npm](https://nodejs.org/pt)
- [Postman](https://www.postman.com) (para testes)

## Backend - FastAPI
Diretório: **wishlist-api/**

### Instalação
```bash
cd wishlist-api
pip install -r requirements.txt
```

### Execução
```bash
uvicorn main:app --reload
```
O backend estará disponível em **[http://localhost:8000](http://localhost:8000)**

Documentação Swagger **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## Frontend - React
Diretório: **wishlist-client/**

### Estrutura do Frontend
```
wishlist-client/
├── public/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Integração com APIs
│   ├── utils/           # Funções utilitárias
│   ├── App.jsx          # Componente raiz
│   ├── main.jsx         # Ponto de entrada do React
├── index.html
├── vite.config.ts
└── ...
```

### Instalação
```bash
cd wishlist-client
npm install
```

### Execução
```bash
npm run dev
```
O frontend estará disponível em **[http://localhost:5173](http://localhost:5173)**

---

## Teste - Postman
Diretório: **wishlist-tests/**


Os testes automatizados da API foram desenvolvidos utilizando o Postman para definição das requisições e o Newman para execução via linha de comando, com geração de relatório em HTML.

### Execução
```bash
newman run wishlist-tests/game-wishlist-api.postman_collection.json -r htmlextra
```

### Arquivos de Teste

* **game-wishlist-api.postman_collection.json**: coleção contendo todos os testes implementados para os endpoints da API.

* **Game Wishlist API-2025-06-19-22-36-22-712-0.html**: relatório gerado automaticamente com os resultados dos testes (após execução via Newman).

### Testes Implementados

1. **GET /wishlist** – Retornar todos os jogos da wishlist
  - Verifica se a resposta retorna o status **200 OK**.
  - Garante que o endpoint esteja acessível e retorne uma lista (vazia ou populada) de jogos desejados.

2. **POST /wishlist/from-freetogame** – Adicionar jogo real com **game_id** válido
  - Verifica se o status retornado é **201 Created**.
  - Requisição com:
  ```json
  {
    "game_id": 452
  }
  ```
  - Em execuções subsequentes, o mesmo **game_id** causará **500 Internal Server Error**, pois o jogo já estará salvo na wishlist. Esse comportamento é esperado e não é considerado falha

3. **POST /wishlist/from-freetogame** – Tentar adicionar jogo inexistente (**game_id** inválido)
  - Requisição com:
  ```json
  {
    "game_id": 99999999
  }
  ```
  - Verifica se o status retornado é **404 Not Found**, indicando que o jogo com esse ID não existe na API externa.

---

## Arquitetura e Decisões Técnicas

- **SPA** no frontend + **API REST** no backend.
- API externa [FreeToGame](https://www.freetogame.com) consumida pelo backend.
- Banco SQLite por padrão.
- Comunicação entre frontend e backend via Axios.
- Toasts com **useToast**.
- Testes automatizados com Postman.

---

## Tecnologias Utilizadas

### Backend

- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org)
- [httpx](https://www.python-httpx.org)
- [Pydantic](https://docs.pydantic.dev/)
- [Uvicorn](https://www.uvicorn.org)

### Frontend

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [Vite](https://vitejs.dev/)

### Testes

- [Postman](https://www.postman.com/)
- [Newman](https://www.npmjs.com/package/newman)

---

## Licença

Este projeto está licenciado sob os termos da licença [MIT](LICENSE).

Você pode usar, modificar e distribuir livremente, desde que mantenha os créditos do autor.