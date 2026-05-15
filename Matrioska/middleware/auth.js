"use strict";

/**
 * Middleware que verifica se o utilizador tem sessão activa.
 * Se não tiver, redireciona para a página de login.
 * Usado para proteger rotas que requerem autenticação.
 */
export const protegerRota = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect("/login");
};

/**
 * Middleware que injeta o utilizador da sessão nas variáveis locais do EJS.
 * Permite que todas as views acedam a `user` sem precisar de o passar manualmente.
 */
export const injetarUtilizador = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};
