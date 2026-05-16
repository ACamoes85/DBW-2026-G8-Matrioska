# Matrioska

Projeto desenvolvido no âmbito da unidade curricular de Desenvolvimento Baseado na Web (DBW) 2025/2026, da Universidade da Madeira.

## Grupo
- Afonso Camoes - 2123322
- Rafael Vieira Silva - 2176524
- Teresa Silva - 2028815
  
## Protótipo (Figma)

https://www.figma.com/proto/9WQMXkhvHajC7p8u6XquYu/Matrioska?node-id=156-41&t=pMea9yYYfNJapb3R-1

## Descrição

Matrioska é um jogo multijogador de agilidade linguística onde os jogadores recebem uma Palavra-Mestra e têm 30/60 segundos para descobrir o maior número possível de subpalavras válidas.

A pontuação é baseada no número de letras de cada palavra correta.

## Funcionalidades

- Registo e autenticação de utilizadores
- Salas multijogador com código de acesso
- Modo solo e modo multiplayer
- Jogo em tempo real com Socket.IO
- Pontuação por comprimento de palavra
- Leaderboard global
- Suporte para português e inglês
- Avatares personalizáveis

## Tecnologias Utilizadas

- Node.js + Express: Servidor 
- webSocket.IO: Comunicação em tempo real
- MongoDB + Mongoose: Base de dados
- EJS: Motor de templates
- CSS: Estilização
- express-session: Gestão de sessões
- bcrypt: Hash de passwords

## Instalação e Configuração

1. Clonar o repositório
- git clone https://github.com/ACamoes85/DBW-2026-G8-Matrioska.git
- cd DBW-2026-G8-Matrioska/Matrioska

2. Instalar as dependências
- npm install

3. Arrancar o servidor
- npm start

4. Abrir no browser
- Aceder a http://localhost:3000

## Documentação

Os diagramas abaixo representam o funcionamento do sistema considerando a arquitetura final com Backend (API) e base de dados.

## Diagramas de Sequência

### Autenticação
![Autenticação](Matrioska/docs/Autenticacao.png)

### Criar Partida + Lobby
![Criarartida](Matrioska/docs/Criarpartida.png)

### Game Screen
![Game Screen](Matrioska/docs/Gamescreen.png)

### Resultados / Scoreboard
![Scoreboard](Matrioska/docs/Scoreboard.png)
