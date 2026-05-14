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
import User from "./models/User.js";
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

/**
 * Atualiza os avatares dos jogadores de uma sala com os valores mais recentes da BD.
 * Corrige o problema de avatar não aparecer no lobby após mudança de perfil.
 */
async function jogadoresComAvatarAtualizado(jogadores) {
    return Promise.all(
        jogadores.map(async (j) => {
            try {
                const userDB = await User.findById(j.id || j._id).select("avatar").lean();
                const base = j.toObject ? j.toObject() : { ...j };
                return { ...base, avatar: userDB ? userDB.avatar : (j.avatar || "/images/profile1.png") };
            } catch {
                return j.toObject ? j.toObject() : j;
            }
        })
    );
}

io.on("connection", (socket) => {
    console.log("Novo utilizador ligado:", socket.id);

    socket.on("join-room", async (dados) => {
        const roomCode = typeof dados === "string" ? dados : dados.roomCode;
        const user = typeof dados === "object" ? dados.user : null;
        // O scoreboard envia contexto: "scoreboard" explicitamente
        const contextoCliente = typeof dados === "object" ? dados.contexto : null;

        if (!roomCode) return;

        const codeUpper = roomCode.toUpperCase();
        socket.join(codeUpper);

        if (user && (user.id || user._id)) {
            const userId = String(user.id || user._id);

            let contexto = contextoCliente || "outro";
            try {
                const sala = await Lobby.findOne({ codigoSala: codeUpper });
                if (sala) {
                    if (!contextoCliente) {
                        contexto = sala.estado === "lobby" ? "lobby" : "jogo";
                    }
                    if (sala.estado === "lobby") {
                        const jogadoresAtualizados = await jogadoresComAvatarAtualizado(sala.jogadores);
                        io.to(codeUpper).emit("room-update", {
                            jogadores: jogadoresAtualizados,
                            modoJogo: sala.modoJogo
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao processar join-room:", err);
            }

            socketToUser[socket.id] = { userId, roomCode: codeUpper, contexto };
        }
    });

    socket.on("start-game-request", (roomCode) => {
        const codeUpper = roomCode.toUpperCase();
        io.to(codeUpper).emit("navigate-to-game", codeUpper);
    });

    socket.on("disconnecting", async () => {
        const userData = socketToUser[socket.id];
        if (userData) {
            const { userId, roomCode, contexto } = userData;
            try {
                const sala = await Lobby.findOne({ codigoSala: roomCode });
                if (!sala) return;

                const eraLider = sala.jogadores.length > 0 &&
                    String(sala.jogadores[0].id || sala.jogadores[0]._id) === String(userId);

                if (sala.estado === "lobby" && contexto === "lobby") {
                    // --- Saída do Lobby ---
                    // Usa tolerância de 2s para ignorar F5/recarregamentos.
                    setTimeout(async () => {
                        // Se o utilizador já voltou a ligar, ignora
                        const voltou = Object.values(socketToUser).some(
                            (d) => d.userId === userId && d.roomCode === roomCode && d.contexto === "lobby"
                        );
                        if (voltou) return;

                        try {
                            const salaAtual = await Lobby.findOne({ codigoSala: roomCode });
                            if (!salaAtual || salaAtual.estado !== "lobby") return;

                            const eraLiderAgora = salaAtual.jogadores.length > 0 &&
                                String(salaAtual.jogadores[0].id || salaAtual.jogadores[0]._id) === String(userId);

                            salaAtual.jogadores = salaAtual.jogadores.filter(
                                (j) => String(j.id || j._id) !== String(userId)
                            );

                            if (salaAtual.jogadores.length === 0) {
                                await Lobby.deleteOne({ codigoSala: roomCode });
                                return;
                            }

                            if (eraLiderAgora) {
                                await Lobby.deleteOne({ codigoSala: roomCode });
                                io.to(roomCode).emit("lider-saiu-lobby");
                            } else {
                                await salaAtual.save();
                                io.to(roomCode).emit("player-left", userId);
                                io.to(roomCode).emit("room-update", {
                                    jogadores: salaAtual.jogadores,
                                    modoJogo: salaAtual.modoJogo
                                });
                            }
                        } catch (err) {
                            console.error("Erro ao processar saída do lobby (delayed):", err);
                        }
                    }, 2000); // 2 segundos de tolerância para F5/recarregamentos

                } else if (contexto === "jogo" || contexto === "scoreboard") {
                    // --- Saída durante o jogo ou do scoreboard ---

                    if (contexto === "scoreboard") {
                        // Tolerância de 2s para F5 no scoreboard — só remove se não voltou.
                        setTimeout(async () => {
                            const voltou = Object.values(socketToUser).some(
                                (d) => d.userId === userId && d.roomCode === roomCode && d.contexto === "scoreboard"
                            );
                            if (voltou) return;

                            try {
                                const salaAtual = await Lobby.findOne({ codigoSala: roomCode });
                                if (!salaAtual || salaAtual.estado === "lobby") return;

                                salaAtual.jogadores = salaAtual.jogadores.filter(
                                    (j) => String(j.id || j._id) !== String(userId)
                                );
                                salaAtual.markModified("jogadores");
                                await salaAtual.save();
                                console.log(`[Scoreboard] Jogador ${userId} removido da sala ${roomCode}.`);
                            } catch (err) {
                                console.error("Erro ao remover jogador do scoreboard (delayed):", err);
                            }
                        }, 2000);
                    }

                    // Avisa os outros se o líder saiu (com tolerância para reconexão).
                    // Não emite se a sala já voltou ao lobby (líder clicou "jogar novamente").
                    if (eraLider) {
                        setTimeout(async () => {
                            // Verifica se o líder já tem outro socket ativo na sala
                            const outroSocketDoMesmoUser = Object.entries(socketToUser).some(
                                ([sid, dados]) =>
                                    sid !== socket.id &&
                                    dados.userId === userId &&
                                    dados.roomCode === roomCode
                            );
                            if (outroSocketDoMesmoUser) return;

                            // Verifica o estado atual da sala
                            try {
                                const salaAtual = await Lobby.findOne({ codigoSala: roomCode }).lean();
                                // Só emite se a sala ainda estiver em jogo ou finalizada
                                // (não emite se já voltou ao lobby — líder clicou "jogar novamente")
                                if (salaAtual && salaAtual.estado !== "lobby") {
                                    io.to(roomCode).emit("lider-saiu-jogo");
                                }
                            } catch (_) {
                                // Se não conseguir verificar, não emite para evitar falsos positivos
                            }
                        }, 3000); // 3 segundos de tolerância para a nova ligação chegar
                    }
                }

            } catch (err) {
                console.error("Erro ao processar saída:", err);
            }
            delete socketToUser[socket.id];

            // se não restarem sockets na sala após o scoreboard, apaga a sala
            if (contexto === "scoreboard") {
                setTimeout(async () => {
                    const aindaHaSockets = Object.values(socketToUser).some(
                        (d) => d.roomCode === roomCode
                    );
                    if (!aindaHaSockets) {
                        try {
                            await Lobby.deleteOne({ codigoSala: roomCode, estado: "finalizada" });
                            console.log(`[Cleanup] Sala ${roomCode} apagada após scoreboard.`);
                        } catch (_) {}
                    }
                }, 10_000); // 10 segundos de tolerância para reconexões
            }
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