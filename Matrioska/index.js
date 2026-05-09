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

// Importar Models e Rotas
import Partida from "./models/Partida.js";
import viewRoutes from "./routes/viewRoutes.js";
import authRoutes from "./routes/authRoutes.js"; 

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 
const MongoDBStore = MongoStore(session);

const mongoURI = process.env.MONGO_URI;

const store = new MongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

// CONFIGURAÇÕES
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

// ROTAS 
app.use("/", viewRoutes);
app.use("/api/auth", authRoutes);

// --- LÓGICA DO SOCKET.IO ---

// Mapeamento para saber qual UserID e Room pertencem a qual SocketID
const socketToUser = {}; 

io.on("connection", (socket) => {
    console.log("Novo utilizador ligado:", socket.id);

    socket.on("join-room", (dados) => {
        const { roomCode, user } = dados; 
        
        if (!user || !user.id || !roomCode) return;

        // Guardamos os dados da sessão deste socket
        socketToUser[socket.id] = { userId: user.id, roomCode: roomCode.toUpperCase() };

        socket.join(roomCode.toUpperCase());
        console.log(`Utilizador ${user.username} entrou na sala: ${roomCode}`);
        
        // Avisar os outros na sala que este jogador entrou
        socket.to(roomCode.toUpperCase()).emit("player-joined", user);
    });

    socket.on("disconnecting", async () => {
        const userData = socketToUser[socket.id];
        
        if (userData) {
            const { userId, roomCode } = userData;
            console.log(`Utilizador ${userId} a sair da sala ${roomCode}`);

            try {
                // REMOVER DA BASE DE DADOS (Liberta a vaga na sala)
                await Partida.findOneAndUpdate(
                    { codigoSala: roomCode },
                    { $pull: { jogadores: { id: userId } } }
                );

                // AVISAR OS OUTROS (Para remover o boneco do ecrã)
                io.to(roomCode).emit("player-left", userId);

                // LIMPEZA: Se a sala ficar vazia, podemos apagá-la
                const salaAposSaida = await Partida.findOne({ codigoSala: roomCode });
                if (salaAposSaida && salaAposSaida.jogadores.length === 0) {
                    await Partida.deleteOne({ codigoSala: roomCode });
                    console.log(`Sala ${roomCode} eliminada por estar vazia.`);
                }

            } catch (err) {
                console.error("Erro ao processar saída do jogador:", err);
            }

            // Limpar o mapeamento de memória
            delete socketToUser[socket.id];
        }
    });

    socket.on("disconnect", () => {
        console.log("Conexão socket encerrada.");
    });
});

// LIGAÇÃO AO MONGODB
mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        const PORT = process.env.PORT || 3000; 
        server.listen(PORT, () => {
            console.log(`Servidor a correr em http://localhost:${PORT}`);
        });
    })
    .catch((err) => console.log("Erro ao ligar ao MongoDB:", err));