"use strict";

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Rotas que recebem os dados dos formulários
router.post('/register', authController.registrar);
router.post('/login', authController.login);
router.post('/update-avatar', authController.updateAvatar);
router.get('/logout', authController.logout);

export default router;