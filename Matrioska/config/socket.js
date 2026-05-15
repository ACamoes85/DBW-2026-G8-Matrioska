"use strict";

import Lobby from "../models/Lobby.js";
import User from "../models/User.js";

/**
 * Mapa que associa cada socket.id ao utilizador e sala correspondentes.
 * Usado para saber quem desligou e de que sala saiu.
 */
const socketToUser = {};

/**
 * Devolve a lista de jogadores com os avatares actualizados da base de dados.
 * Resolve o problema em que um jogador muda de avatar mas o lobby ainda mostra o avatar antigo.
 *
 * @param {Array} jogadores - Lista de jogadores guardada na sala
 * @returns {Promise<Array>} - Lista com avatares actualizados
 */
async function jogadoresComAvatarAtualizado(jogadores) {
    return Promise.all(
        jogadores.map(async (j) => {
            try {
                const userDB = await User.findById(j.id || j._id)
                    .select("avatar")
                    .lean();
                const base = j.toObject ? j.toObject() : { ...j };
                return {
                    ...base,
                    avatar: userDB ? userDB.avatar : j.avatar || "/images/profile1.png",
                };
            } catch {
                return j.toObject ? j.toObject() : j;
            }
        })
    );
}

/**
 * Trata a saída de um jogador do lobby com tolerância de 2s para F5/recarregamentos.
 * Se o jogador for o líder, apaga a sala e notifica os restantes.
 */
async function tratarSaidaLobby(io, userId, roomCode) {
    setTimeout(async () => {
        // Verifica se o jogador já voltou a ligar antes de o remover
        const voltou = Object.values(socketToUser).some(
            (d) => d.userId === userId && d.roomCode === roomCode && d.contexto === "lobby"
        );
        if (voltou) return;

        try {
            const sala = await Lobby.findOne({ codigoSala: roomCode });
            if (!sala || sala.estado !== "lobby") return;

            const eraLider =
                sala.jogadores.length > 0 &&
                String(sala.jogadores[0].id || sala.jogadores[0]._id) === userId;

            sala.jogadores = sala.jogadores.filter(
                (j) => String(j.id || j._id) !== userId
            );

            if (sala.jogadores.length === 0 || eraLider) {
                await Lobby.deleteOne({ codigoSala: roomCode });
                if (eraLider) io.to(roomCode).emit("lider-saiu-lobby");
                return;
            }

            await sala.save();
            io.to(roomCode).emit("player-left", userId);
            io.to(roomCode).emit("room-update", {
                jogadores: sala.jogadores,
                modoJogo: sala.modoJogo,
            });
        } catch (err) {
            console.error("Erro ao processar saída do lobby:", err);
        }
    }, 2000);
}

/**
 * Trata a saída de um jogador do scoreboard com tolerância de 2s.
 * Remove-o da sala após esse período se não tiver voltado.
 */
async function tratarSaidaScoreboard(io, socketId, userId, roomCode) {
    setTimeout(async () => {
        const voltou = Object.values(socketToUser).some(
            (d) => d.userId === userId && d.roomCode === roomCode && d.contexto === "scoreboard"
        );
        if (voltou) return;

        try {
            const sala = await Lobby.findOne({ codigoSala: roomCode });
            if (!sala || sala.estado === "lobby") return;

            sala.jogadores = sala.jogadores.filter(
                (j) => String(j.id || j._id) !== userId
            );
            sala.markModified("jogadores");
            await sala.save();
        } catch (err) {
            console.error("Erro ao remover jogador do scoreboard:", err);
        }
    }, 2000);

    // Limpa a sala inteira se não restar nenhum socket ligado após 10s
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
    }, 10_000);
}

/**
 * Notifica os clientes quando o líder sai durante o jogo ou scoreboard.
 * Tem tolerância de 3s para reconexões (ex: refresh da página).
 */
async function notificarSaidaLider(io, socket, userId, roomCode) {
    setTimeout(async () => {
        // Verifica se o líder já tem outro socket activo na mesma sala
        const outroSocket = Object.entries(socketToUser).some(
            ([sid, d]) =>
                sid !== socket.id && d.userId === userId && d.roomCode === roomCode
        );
        if (outroSocket) return;

        try {
            const sala = await Lobby.findOne({ codigoSala: roomCode }).lean();
            // Só emite se a sala ainda estiver em jogo (não já de volta ao lobby)
            if (sala && sala.estado !== "lobby") {
                io.to(roomCode).emit("lider-saiu-jogo");
            }
        } catch (_) {}
    }, 3000);
}

/**
 * Regista todos os eventos de Socket.IO da aplicação.
 * Centralizado aqui para manter o index.js limpo.
 *
 * @param {import("socket.io").Server} io
 */
const registerSocketEvents = (io) => {
    io.on("connection", (socket) => {
        console.log("Novo utilizador ligado:", socket.id);

        // Jogador entra numa sala (lobby, jogo ou scoreboard)
        socket.on("join-room", async (dados) => {
            const roomCode = typeof dados === "string" ? dados : dados.roomCode;
            const user = typeof dados === "object" ? dados.user : null;
            const contextoCliente = typeof dados === "object" ? dados.contexto : null;

            if (!roomCode) return;

            const codeUpper = roomCode.toUpperCase();
            socket.join(codeUpper);

            if (!user || !(user.id || user._id)) return;

            const userId = String(user.id || user._id);
            let contexto = contextoCliente || "outro";

            try {
                const sala = await Lobby.findOne({ codigoSala: codeUpper });
                if (sala) {
                    if (!contextoCliente) {
                        contexto = sala.estado === "lobby" ? "lobby" : "jogo";
                    }
                    // Emite lista actualizada de jogadores ao entrar no lobby
                    if (sala.estado === "lobby") {
                        const jogadoresAtualizados = await jogadoresComAvatarAtualizado(sala.jogadores);
                        io.to(codeUpper).emit("room-update", {
                            jogadores: jogadoresAtualizados,
                            modoJogo: sala.modoJogo,
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao processar join-room:", err);
            }

            socketToUser[socket.id] = { userId, roomCode: codeUpper, contexto };
        });

        // Líder pede para iniciar o jogo — redireciona todos os jogadores
        socket.on("start-game-request", (roomCode) => {
            const codeUpper = roomCode.toUpperCase();
            io.to(codeUpper).emit("navigate-to-game", codeUpper);
        });

        // Jogador está a desligar — pode ser F5, fecho de aba ou saída intencional
        socket.on("disconnecting", async () => {
            const userData = socketToUser[socket.id];
            if (!userData) return;

            const { userId, roomCode, contexto } = userData;
            delete socketToUser[socket.id];

            try {
                const sala = await Lobby.findOne({ codigoSala: roomCode });
                if (!sala) return;

                const eraLider =
                    sala.jogadores.length > 0 &&
                    String(sala.jogadores[0].id || sala.jogadores[0]._id) === userId;

                if (sala.estado === "lobby" && contexto === "lobby") {
                    await tratarSaidaLobby(io, userId, roomCode);
                } else if (contexto === "jogo" || contexto === "scoreboard") {
                    if (contexto === "scoreboard") {
                        await tratarSaidaScoreboard(io, socket.id, userId, roomCode);
                    }
                    if (eraLider) {
                        await notificarSaidaLider(io, socket, userId, roomCode);
                    }
                }
            } catch (err) {
                console.error("Erro ao processar desconexão:", err);
            }
        });
    });
};

export default registerSocketEvents;
