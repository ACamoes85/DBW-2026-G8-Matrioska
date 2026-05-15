"use strict";

import express from "express";
import * as gameController from "../controllers/gameController.js";
import * as userController from "../controllers/userController.js";
import { protegerRota } from "../middleware/auth.js";

/**
 * Exporta uma função que recebe o `io` (instância do Socket.IO).
 * O `io` é necessário nos controllers que precisam de emitir eventos em tempo real.
 */
export default (io) => {
    const router = express.Router();

    // Previne cache em todas as rotas — importante para páginas protegidas
    router.use((req, res, next) => {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        next();
    });

    // ── Rotas Públicas ────────────────────────────────────────────────────────
    router.get(["/", "/homepage"], (req, res) => res.render("homepage"));
    router.get("/login", (req, res) => res.render("login"));
    router.get("/register", (req, res) => res.render("register"));

    // ── Rotas Protegidas (requerem sessão activa) ─────────────────────────────
    router.get("/hub",          protegerRota, userController.getHub);
    router.get("/howtoplay",    protegerRota, userController.getHowToPlay);
    router.get("/leaderboard",  protegerRota, userController.getLeaderboard);
    router.get("/profile",      protegerRota, userController.getProfile);
    router.get("/edit-profile", protegerRota, userController.getEditProfile);
    router.get("/create-match", protegerRota, userController.getCreateMatch);

    // ── API de Jogo ───────────────────────────────────────────────────────────

    // Criar ou entrar numa sala
    router.post("/api/match/create", protegerRota, gameController.criarOuEntrarSala);

    // Iniciar a partida (apenas o líder)
    router.post("/api/match/start", protegerRota, gameController.iniciarPartida);

    // Validar tentativa de palavra — injeta io para emitir eventos em tempo real
    router.post("/api/match/validate-word", protegerRota, (req, res) => {
        gameController.validarPalavraMultiplayer(req, res, io);
    });

    // Reiniciar lobby após scoreboard (Jogar Novamente) — injeta io para redirecionar todos
    router.post("/api/match/reset", protegerRota, (req, res) => {
        gameController.reiniciarLobby(req, res, io);
    });

    // Guardar estatísticas no fim da partida
    router.post("/api/partidas/guardar", protegerRota, gameController.guardarEstatisticasPartida);

    // Obter dados para o scoreboard
    router.get("/api/partidas/:codigoSala/scoreboard", protegerRota, gameController.obterScoreboardPartida);

    // Obter o líder actual da sala
    router.get("/api/partidas/:codigoSala/lider", protegerRota, gameController.obterLiderSala);

    // ── Vistas de Jogo ────────────────────────────────────────────────────────
    router.get("/lobby",          protegerRota, gameController.renderizarLobby);
    router.get("/gamescreen",     protegerRota, gameController.renderizarJogo);
    router.get("/loadingmatch",   protegerRota, userController.getLoadingMatch);
    router.get("/scoreboard",     protegerRota, userController.getScoreboard);
    router.get("/resultsloading", protegerRota, userController.getResultsLoading);

    return router;
};
