# EletroRecicla — Frontend

Frontend responsivo da plataforma EletroRecicla, desenvolvido com React, Vite e Tailwind CSS v4.

## Requisitos

- Node.js compatível com a versão do Vite instalada
- npm
- Acesso à internet para instalar dependências e carregar a fonte DM Sans

## Executar localmente

Depois de atualizar o repositório:

```bash
git pull
npm install
npm run dev
```

Abra o endereço local exibido pelo Vite no terminal.

## Build de produção

```bash
npm run build
```

## API

O frontend usa por padrão a API de desenvolvimento do EletroRecicla. Para configurar outro endereço, copie `.env.example` para `.env` e altere:

```env
VITE_API_URL=https://eletrorecicla-backend.onrender.com/api/v1
```

Variáveis `VITE_*` são públicas no bundle do frontend. Não coloque segredos nelas.

## Fluxos disponíveis

- Página inicial e explicação do projeto
- Escolha de perfil
- Cadastro de cidadão
- Cadastro de empresa e ponto de coleta
- Login e acesso à área do cidadão
- Consulta de pontos de coleta
- Painel e histórico de descartes (dependem da API)

Algumas funcionalidades dependem de rotas que precisam existir e estar disponíveis no backend. O cadastro de empresa/ponto usa o endpoint `POST /empresas`, conforme a integração que já existia no projeto.
