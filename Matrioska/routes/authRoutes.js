"use strict";

import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Recebe os dados do formulário de registo
router.post("/register", authController.registrar);

// Autentica o utilizador e cria a sessão
router.post("/login", authController.login);

// Actualiza o avatar do utilizador autenticado
router.post("/update-avatar", authController.updateAvatar);

// Termina a sessão e redireciona para a homepage
router.get("/logout", authController.logout);

export default router;
