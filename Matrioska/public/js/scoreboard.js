"use strict";

/* Função auxiliar para obter textos traduzidos */
function t(chave) {
    return window.getTexto ? window.getTexto(chave) : chave;
}

/* Função auxiliar para singular/plural */
function plural(numero, singular, plural) {
    return Number(numero) === 1 ? singular : plural;
}

/* Bloqueia o botão "Jogar novamente" */
function bloquearJogarNovamente(btnPlayAgain, mensagem) {
    if (!btnPlayAgain) return;

    btnPlayAgain.disabled = true;
    btnPlayAgain.style.opacity = "0.5";
    btnPlayAgain.style.cursor = "not-allowed";
    btnPlayAgain.innerText = mensagem || t("leaderLeft");
}

/* Mostra um aviso no scoreboard */
function mostrarAviso(mensagem) {
    let el = document.getElementById("scoreboard-aviso");

    if (!el) {
        el = document.createElement("p");
        el.id = "scoreboard-aviso";
        el.style.cssText =
            "color:#ff6b6b;background:rgba(255,80,80,0.1);border:1px solid rgba(255,80,80,0.3);border-radius:8px;padding:10px 14px;font-weight:600;text-align:center;margin-bottom:12px;";

        const buttons = document.querySelector(".buttons");
        if (buttons) buttons.before(el);
    }

    el.innerText = mensagem;
}

/* Executa quando a página terminar de carregar */
document.addEventListener("DOMContentLoaded", async () => {
    /* Obter dados da partida guardados no navegador */
    const resultado = JSON.parse(localStorage.getItem("resultadoPartida") || "null");

    /* Elementos HTML do scoreboard */
    const displayVencedor = document.getElementById("winner-display");
    const rankingList = document.getElementById("ranking-list");
    const btnPlayAgain = document.getElementById("btn-play-again");

    /* Título onde aparece "Vencedor" ou "Empate" */
    const tituloVencedor =
        document.getElementById("winner-title") ||
        document.querySelector(".subtitle") ||
        document.querySelector("h2");

    /* Criar ligação ao servidor por Socket.io */
    const socket = io();

    /* Se os elementos principais não existirem, interrompe */
    if (!displayVencedor || !rankingList) return;

    /* Se não houver dados da partida, não é possível mostrar resultados */
    if (!resultado || !resultado.codigoSala) {
        displayVencedor.innerText = t("noMatchData");
        rankingList.innerHTML = "";
        return;
    }

    /* Verifica se o líder saiu durante o jogo */
    const liderSaiu = localStorage.getItem("lider-saiu") === "1";

    if (liderSaiu) {
        localStorage.removeItem("lider-saiu");
        mostrarAviso(
            t("leaderLeftGame", "O líder saiu durante o jogo. Não é possível jogar novamente.")
        );
        bloquearJogarNovamente(btnPlayAgain);
    }

    /* Dados do utilizador atual para entrar novamente na sala */
    const userIdScoreboard = resultado.userId || null;
    const usernameScoreboard = resultado.username || localStorage.getItem("user") || "";

    /* Entrar na sala para receber eventos em tempo real */
    socket.emit("join-room", {
        roomCode: resultado.codigoSala.toUpperCase(),
        user: userIdScoreboard
            ? { id: userIdScoreboard, username: usernameScoreboard }
            : undefined,
    });

    /* Evento recebido quando o líder sai */
    socket.on("lider-saiu-jogo", () => {
        mostrarAviso(t("leaderLeftGame", "O líder saiu. Não é possível jogar novamente."));
        bloquearJogarNovamente(btnPlayAgain);
    });

    /* Evento recebido quando o líder reinicia a partida */
    socket.on("voltar-ao-lobby", (codigo) => {
        localStorage.removeItem("lider-saiu");
        window.location.href = `/lobby?code=${codigo}`;
    });

    try {
        /* Buscar scoreboard da partida ao servidor */
        const resposta = await fetch(`/api/partidas/${resultado.codigoSala}/scoreboard`, {
            cache: "no-store",
        });

        const dados = await resposta.json();

        /* Se a resposta der erro, lança exceção */
        if (!resposta.ok) {
            throw new Error(dados.erro || t("scoreboardLoadError"));
        }

        /* Se não houver ranking, mostra mensagem */
        if (!dados.ranking || dados.ranking.length === 0) {
            displayVencedor.innerText = t("noRegisteredPlayers");
            rankingList.innerHTML = "";
            return;
        }

        displayVencedor.dataset.loaded = "true";

        /* Ordenar ranking por pontuação decrescente */
        const rankingOrdenado = [...dados.ranking].sort(
            (a, b) => Number(b.pontuacao) - Number(a.pontuacao)
        );

        /* Encontrar maior pontuação */
        const maxPontos = Math.max(
            ...rankingOrdenado.map((jogador) => Number(jogador.pontuacao))
        );

        /* Jogadores empatados no primeiro lugar */
        const vencedores = rankingOrdenado.filter(
            (jogador) => Number(jogador.pontuacao) === maxPontos
        );

        /* Mostrar vencedor único ou empate no primeiro lugar */
        if (vencedores.length > 1) {
            if (tituloVencedor) {
                tituloVencedor.innerText = "Empate";
            }

            displayVencedor.innerText = `${maxPontos} pts`;
        } else {
            if (tituloVencedor) {
                tituloVencedor.innerText = "Vencedor";
            }

            displayVencedor.innerText = `${vencedores[0].username} - ${maxPontos} pts`;
        }

        /* Variáveis para calcular posições com empate */
        let posicaoAtual = 1;
        let pontosAnteriores = null;

        /* Construir lista de classificação */
        rankingList.innerHTML = rankingOrdenado
            .map((jogador, index) => {
                const pontos = Number(jogador.pontuacao);

                /* Só muda de posição se tiver menos pontos */
                if (pontosAnteriores !== null && pontos < pontosAnteriores) {
                    posicaoAtual = index + 1;
                }

                pontosAnteriores = pontos;

                return `
          <p>
            ${posicaoAtual}. ${jogador.username} - ${pontos} pts
            <br>
            <small>
              ${jogador.palavrasCertas} ${plural(
                    jogador.palavrasCertas,
                    t("correctSingular"),
                    t("correctPlural")
                )}, 
              ${jogador.respostasErradas} ${plural(
                    jogador.respostasErradas,
                    t("wrongSingular"),
                    t("wrongPlural")
                )}
            </small>
          </p>
        `;
            })
            .join("");

        /* Obter utilizador atual */
        const meuUsername = localStorage.getItem("user") || "";

        /* Verificar quem é o líder da partida */
        const liderUsername = await fetch(`/api/partidas/${resultado.codigoSala}/lider`)
            .then((r) => (r.ok ? r.json() : { username: null }))
            .then((d) => d.username)
            .catch(() => null);

        /* Confirmar se o utilizador atual é líder */
        const souLider = !liderSaiu && meuUsername === liderUsername;

        /* Ativar botão caso o líder não tenha saído */
        if (!liderSaiu) {
            btnPlayAgain.disabled = false;
            btnPlayAgain.style.opacity = "1";
            btnPlayAgain.style.cursor = "pointer";
        }
    } catch (err) {
        /* Tratamento de erro ao carregar o scoreboard */
        console.error("Erro ao carregar scoreboard:", err);
        displayVencedor.innerText = t("scoreboardLoadError");
        rankingList.innerHTML = "";
    }

    /* Evento do botão "Jogar novamente" */
    if (btnPlayAgain) {
        btnPlayAgain.addEventListener("click", async () => {
            if (btnPlayAgain.disabled) return;

            /* Obter utilizador atual no momento do clique */
            const meuUsernameAtual = localStorage.getItem("user") || "";

            /* Confirmar novamente quem é o líder */
            const liderAtual = await fetch(`/api/partidas/${resultado.codigoSala}/lider`)
                .then((r) => (r.ok ? r.json() : { username: null }))
                .then((d) => d.username)
                .catch(() => null);

            const souLiderAgora = meuUsernameAtual === liderAtual;

            if (souLiderAgora) {
                try {
                    /* Líder pede ao servidor para reiniciar a partida */
                    const response = await fetch("/api/match/reset", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ codigoSala: resultado.codigoSala }),
                    });

                    /* Se falhar, bloqueia o botão */
                    if (!response.ok) {
                        bloquearJogarNovamente(
                            btnPlayAgain,
                            t("waitingLeader", "À espera do líder...")
                        );
                    }
                } catch (err) {
                    console.error("Erro ao solicitar reinício:", err);
                }
            } else {
                /* Se não for líder, fica à espera */
                bloquearJogarNovamente(
                    btnPlayAgain,
                    t("waitingLeader", "À espera do líder...")
                );
            }
        });
    }
});