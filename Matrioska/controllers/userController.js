"use strict";

import User from "../models/User.js";

/**
 * Leaderboard — top 10 jogadores ordenados por pontuação total.
 * Também carrega os dados actualizados do utilizador actual da BD.
 */
export const getLeaderboard = async (req, res) => {
    try {
        const players = await User.find()
            .sort({ "stats.totalScore": -1 })
            .limit(10)
            .select("username stats.totalScore avatar");

        const userAtualizado = await User.findById(req.session.user.id);

        res.render("leaderboard", { players, user: userAtualizado });
    } catch (err) {
        res.render("leaderboard", { players: [], user: req.session.user });
    }
};

/**
 * Perfil — carrega os dados completos do utilizador da BD.
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect("/login");
        res.render("profile", { user });
    } catch (err) {
        res.redirect("/hub");
    }
};

/**
 * Edição de Perfil — igual ao perfil mas renderiza a view de edição.
 */
export const getEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect("/login");
        res.render("edit-profile", { user });
    } catch (err) {
        res.redirect("/profile");
    }
};

/**
 * Hub principal — página inicial após login.
 */
export const getHub = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render("hub", { user });
    } catch (err) {
        res.render("hub", { user: req.session.user });
    }
};

/**
 * Como Jogar — página estática de instruções.
 */
export const getHowToPlay = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render("howtoplay", { user });
    } catch (err) {
        res.render("howtoplay", { user: req.session.user });
    }
};

/**
 * Criar Partida — página com o formulário de configuração de sala.
 */
export const getCreateMatch = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render("create-match", { user });
    } catch (err) {
        res.render("create-match", { user: req.session.user });
    }
};

/**
 * Loading Match — ecrã de transição enquanto a partida carrega.
 * Passa o código da sala para o cliente continuar o fluxo.
 */
export const getLoadingMatch = async (req, res) => {
    try {
        const codigoSala = req.query.code ? req.query.code.trim().toUpperCase() : "";
        const user = await User.findById(req.session.user.id);
        res.render("loadingmatch", { codigoSala, user: user || req.session.user });
    } catch (err) {
        console.error("Erro no Loading Controller:", err);
        res.redirect("/hub");
    }
};

/**
 * Results Loading — ecrã de transição entre o fim do jogo e o scoreboard.
 */
export const getResultsLoading = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render("resultsloading", { user });
    } catch (err) {
        res.render("resultsloading", { user: req.session.user });
    }
};

/**
 * Scoreboard — ecrã final com os resultados da partida.
 */
export const getScoreboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        res.render("scoreboard", { user });
    } catch (err) {
        res.render("scoreboard", { user: req.session.user });
    }
};
