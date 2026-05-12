"use strict";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import mongoose from "mongoose"; 
import methodOverride from "method-override"; 
import session from "express-session";
import MongoStore from "connect-mongodb-session";
import http from "http"; 
import { Server } from "socket.io"; 

import Lobby from "./models/Lobby.js";
import viewRoutes from "./routes/viewRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 
const MongoDBStore = MongoStore(session);

const mongoURI = process.env.MONGO_URI;
const store = new MongoDBStore({ uri: mongoURI, collection: 'sessions' });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); 

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// --- CONFIGURAÇÃO DE ROTAS ---
app.use("/", viewRoutes(io)); 
app.use("/api/auth", authRoutes);

// --- LÓGICA DO SOCKET.IO ---
const socketToUser = {}; 

io.on("connection", (socket) => {
    console.log("Novo utilizador ligado:", socket.id);

    socket.on("join-room", async (dados) => {
        const roomCode = typeof dados === "string" ? dados : dados.roomCode;
        const user = typeof dados === "object" ? dados.user : null;

        if (!roomCode) return;

        const codeUpper = roomCode.toUpperCase();
        socket.join(codeUpper);

        if (user && (user.id || user._id)) {
            const userId = String(user.id || user._id);
            socketToUser[socket.id] = { userId, roomCode: codeUpper };

            // Só emite room-update quando é uma ligação com utilizador identificado
            // (lobby), não quando é uma ligação anónima do gamescreen/scoreboard
            try {
                const sala = await Lobby.findOne({ codigoSala: codeUpper });
                if (sala && sala.estado === "lobby") {
                    io.to(codeUpper).emit("room-update", {
                        jogadores: sala.jogadores,
                        modoJogo: sala.modoJogo
                    });
                }
            } catch (err) {
                console.error("Erro ao processar join-room:", err);
            }
        }
    });

    socket.on("start-game-request", (roomCode) => {
        const codeUpper = roomCode.toUpperCase();
        io.to(codeUpper).emit("navigate-to-game", codeUpper);
    });

    socket.on("disconnecting", async () => {
        const userData = socketToUser[socket.id];
        if (userData) {
            const { userId, roomCode } = userData;
            try {
                const sala = await Lobby.findOne({ codigoSala: roomCode });
                if (!sala) return;

                const eraLider = sala.jogadores.length > 0 &&
                    String(sala.jogadores[0].id || sala.jogadores[0]._id) === String(userId);

                if (sala.estado === "lobby") {
                    sala.jogadores = sala.jogadores.filter(
                        (j) => String(j.id || j._id) !== String(userId)
                    );

                    if (sala.jogadores.length === 0) {
                        await Lobby.deleteOne({ codigoSala: roomCode });
                        return;
                    }

                    if (eraLider) {
                        // Líder saiu do lobby: avisa os outros e apaga a sala
                        await Lobby.deleteOne({ codigoSala: roomCode });
                        io.to(roomCode).emit("lider-saiu-lobby");
                    } else {
                        await sala.save();
                        io.to(roomCode).emit("player-left", userId);
                        io.to(roomCode).emit("room-update", {
                            jogadores: sala.jogadores,
                            modoJogo: sala.modoJogo
                        });
                    }
                } else {
                    // Em jogo / scoreboard: não remove da sala, mas avisa se era o líder
                    if (eraLider) {
                        io.to(roomCode).emit("lider-saiu-jogo");
                    }
                }

            } catch (err) {
                console.error("Erro ao processar saída:", err);
            }
            delete socketToUser[socket.id];
        }
    });
});

// --- LIGAÇÃO À BASE DE DADOS E SERVIDOR ---
mongoose.connect(mongoURI)
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
            console.log("Servidor e Sockets ativos na porta 3000.");
        });
    })
    .catch(err => console.log("Erro ao ligar ao MongoDB:", err));