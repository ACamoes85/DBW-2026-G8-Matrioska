"use strict";

import express from 'express';
import * as gameController from '../controllers/gameController.js'; 
import * as userController from '../controllers/userController.js';

const router = express.Router();

/**
 * Middleware: Proteção de Rotas
 */
const protegerRota = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// --- Rotas Públicas ---
router.get(['/', '/homepage'], (req, res) => res.render('homepage'));
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

// --- Rotas Protegidas ---
router.get('/hub', protegerRota, userController.getHub);
router.get('/howtoplay', protegerRota, userController.getHowToPlay);
router.get('/leaderboard', protegerRota, userController.getLeaderboard);
router.get('/profile', protegerRota, userController.getProfile);
router.get('/edit-profile', protegerRota, userController.getEditProfile);
router.get('/create-match', protegerRota, userController.getCreateMatch); 

// --- Rota para Criar/Entrar na Sala (POST) ---
router.post('/api/match/create', protegerRota, gameController.criarOuEntrarSala);

// --- Rota do Lobby ---
router.get('/lobby', protegerRota, gameController.renderizarLobby);

router.get('/loadingmatch', protegerRota, userController.getLoadingMatch);
router.get('/scoreboard', protegerRota, userController.getScoreboard);
router.get('/resultsloading', protegerRota, userController.getResultsLoading);

// Rota Dinâmica do Jogo
router.get('/gamescreen', protegerRota, gameController.renderizarJogo);

// API para guardar estatísticas
router.post('/api/partidas/guardar', protegerRota, gameController.guardarEstatisticasPartida);

// Prevenção de Cache
router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

export default router;