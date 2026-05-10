"use strict";

import express from "express";
import * as gameController from "../controllers/gameController.js";
import * as userController from "../controllers/userController.js";

/**
 * Exportamos uma função que recebe o 'io'.
 */
export default (io) => {
  const router = express.Router();

  // Prevenção de Cache
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
  });

  /**
   * Middleware: Proteção de Rotas
   */
  const protegerRota = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    res.redirect("/login");
  };

  // --- Rotas Públicas ---
  router.get(["/", "/homepage"], (req, res) => res.render("homepage"));
  router.get("/login", (req, res) => res.render("login"));
  router.get("/register", (req, res) => res.render("register"));

  // --- Rotas Protegidas ---
  router.get("/hub", protegerRota, userController.getHub);
  router.get("/howtoplay", protegerRota, userController.getHowToPlay);
  router.get("/leaderboard", protegerRota, userController.getLeaderboard);
  router.get("/profile", protegerRota, userController.getProfile);
  router.get("/edit-profile", protegerRota, userController.getEditProfile);
  router.get("/create-match", protegerRota, userController.getCreateMatch);

  // --- Rotas de Lógica de Jogo (APIs e Páginas) ---

  // Criar ou Entrar (POST)
  router.post(
    "/api/match/create",
    protegerRota,
    gameController.criarOuEntrarSala,
  );

  // Rota de Validação (Injetando o IO para que o Controller possa emitir eventos)
  router.post("/api/match/validate-word", protegerRota, (req, res) => {
    gameController.validarPalavraMultiplayer(req, res, io);
  });

  // Iniciar Partida
  router.post("/api/match/start", protegerRota, gameController.iniciarPartida);

  // Renderizar o Lobby
  router.get("/lobby", protegerRota, gameController.renderizarLobby);

  // Renderizar o Ecrã de Jogo
  router.get("/gamescreen", protegerRota, gameController.renderizarJogo);

  // API para guardar estatísticas no fim
  router.post(
    "/api/partidas/guardar",
    protegerRota,
    gameController.guardarEstatisticasPartida,
  );

  router.get(
    "/api/partidas/:codigoSala/scoreboard",
    protegerRota,
    gameController.obterScoreboardPartida,
  );

  // --- Outras Views ---
  router.get("/loadingmatch", protegerRota, userController.getLoadingMatch);
  router.get("/scoreboard", protegerRota, userController.getScoreboard);
  router.get("/resultsloading", protegerRota, userController.getResultsLoading);

  return router;
};
