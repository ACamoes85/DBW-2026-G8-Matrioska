"use strict";

/**
 * Ponto de entrada da aplicação Matrioska.
 *
 * Responsabilidades deste ficheiro:
 *  - Carregar variáveis de ambiente (.env)
 *  - Configurar a app Express com os middlewares necessários
 *  - Registar as rotas
 *  - Inicializar o Socket.IO
 *  - Ligar à base de dados e arrancar o servidor
 *
 * A lógica de BD, sessão e sockets foi separada em ficheiros próprios
 * dentro da pasta config/ para maior legibilidade e manutenção.
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import methodOverride from "method-override";
import http from "http";
import { Server } from "socket.io";

// Configurações separadas em ficheiros próprios
import connectDB from "./config/db.js";
import createSessionMiddleware from "./config/session.js";
import registerSocketEvents from "./config/socket.js";

// Middleware reutilizável
import { injetarUtilizador } from "./middleware/auth.js";

// Rotas
import viewRoutes from "./routes/viewRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// --- Inicialização da App ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Motor de Templates ---
app.set("view engine", "ejs");

// --- Middlewares Globais ---
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(createSessionMiddleware()); // sessão com MongoDB store (config/session.js)
app.use(injetarUtilizador);         // injeta req.session.user em res.locals para as views

// --- Rotas ---
app.use("/", viewRoutes(io));       // rotas de vistas e API de jogo (recebe io para emitir eventos)
app.use("/api/auth", authRoutes);   // rotas de autenticação

// --- Socket.IO ---
// Lógica movida para config/socket.js para manter este ficheiro limpo
registerSocketEvents(io);

// --- Ligar à BD e arrancar o servidor ---
connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Servidor e Sockets activos na porta ${PORT}.`);
    });
});
