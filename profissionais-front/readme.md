# README – Front-end Cadastro de Profissionais

## Descrição

Front-end da aplicação de cadastro de profissionais.
Permite cadastrar e listar profissionais, incluindo campos específicos, conectando-se ao back-end WebFlux (`localhost:8080`).

## Pré-requisitos

* Node.js e npm ([https://nodejs.org/](https://nodejs.org/))
* Navegador (Chrome, Edge, Firefox)
* Back-end WebFlux rodando em `http://localhost:8080`

## Como rodar

1. Abra o terminal na pasta do front

2. Instale o servidor local (se ainda não tiver):

```bash
npm install -g http-server
```

3. Inicie o servidor:

```bash
http-server -p 5500
```

4. Acesse no navegador:

```
http://127.0.0.1:5500/profissionais-front/
```

> ⚠️ Não abra o HTML diretamente pelo editor (`file://`), use o servidor l
