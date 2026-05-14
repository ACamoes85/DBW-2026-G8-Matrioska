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
    btnPlayAgain.innerText = mensagem || t("leaderLeft");
}

/* Mostra um aviso no scoreboard */
function mostrarAviso(mensagem) {
    let el = document.getElementById("scoreboard-aviso");

    if (!el) {
        el = document.createElement("p");
        el.id = "scoreboard-aviso";

        const buttons = document.querySelector(".buttons");
        if (buttons) buttons.before(el);
    }

    el.innerText = mensagem;
}

/* Lança confetti animado */
function lancarConfetti() {
    const container = document.getElementById("sb-confetti");
    if (!container) return;

    const cores = ["#66adff", "#ff45f3", "#ffd966", "#5ec8ef", "#a78bfa", "#ffffff"];
    for (let i = 0; i < 32; i++) {
        const dot = document.createElement("div");
        dot.className = "sb-confetti-dot";
        const size = 4 + Math.random() * 6;
        dot.style.cssText = [
            `left: ${Math.random() * 100}%`,
            `width: ${size}px`,
            `height: ${size}px`,
            `background: ${cores[i % cores.length]}`,
            `border-radius: ${Math.random() > 0.5 ? "50%" : "2px"}`,
            `animation-delay: ${Math.random() * 2}s`,
            `animation-duration: ${2.5 + Math.random() * 2}s`,
        ].join(";");
        container.appendChild(dot);
    }
}

/* Devolve a classe de medalha consoante a posição */
function classeMedalha(posicao) {
    if (posicao === 1) return "sb-medal sb-medal-1";
    if (posicao === 2) return "sb-medal sb-medal-2";
    if (posicao === 3) return "sb-medal sb-medal-3";
    return "sb-medal sb-medal-n";
}

/* Constrói o HTML de uma linha de jogador */
function construirLinhaJogador(jogador, posicao, meuUsername) {
    const pontos = Number(jogador.pontuacao);
    const souEu = jogador.username === meuUsername;
    const avatar = jogador.avatar || "/images/profile1.png";

    return `
        <div class="sb-row${souEu ? " is-me" : ""}">
            <div class="${classeMedalha(posicao)}">${posicao}</div>
            <img class="sb-avatar" src="${avatar}" alt="${jogador.username}" onerror="this.src='/images/profile1.png'">
            <div class="sb-info">
                <div class="sb-username">
                    ${jogador.username}
                    ${souEu ? `<span class="sb-me-badge">(${t("youLabel")})</span>` : ""}
                </div>
                <div class="sb-stats">
                    ${jogador.palavrasCertas} ${plural(jogador.palavrasCertas, t("correctSingular"), t("correctPlural"))}
                    &nbsp;·&nbsp;
                    ${jogador.respostasErradas} ${plural(jogador.respostasErradas, t("wrongSingular"), t("wrongPlural"))}
                </div>
            </div>
            <div class="sb-pts-block">
                <div class="sb-pts-value">${pontos}</div>
                <div class="sb-pts-label">pts</div>
            </div>
        </div>
    `;
}

/* Executa quando a página terminar de carregar */
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigoSalaUrl = urlParams.get("code");
    const resultadoStorage = JSON.parse(localStorage.getItem("resultadoPartida") || "null");

    const resultado = codigoSalaUrl
        ? { ...resultadoStorage, codigoSala: codigoSalaUrl }
        : resultadoStorage;

    const userIdScoreboardRaw =
        document.getElementById("current-user-id")?.value ||
        resultado?.userId ||
        null;
    const usernameScoreboardRaw =
        document.getElementById("current-username")?.value ||
        resultado?.username ||
        localStorage.getItem("user") ||
        "";

    const displayVencedor = document.getElementById("winner-display");
    const winnerPts       = document.getElementById("winner-pts");
    const rankingList     = document.getElementById("ranking-list");
    const btnPlayAgain    = document.getElementById("btn-play-again");

    const tituloVencedor =
        document.getElementById("scoreboard-winner-title") ||
        document.querySelector(".sb-winner-label");

    const socket = io();

    if (!displayVencedor || !rankingList) return;

    if (!resultado || !resultado.codigoSala) {
        displayVencedor.innerText = t("noMatchData");
        rankingList.innerHTML = "";
        return;
    }

    const liderSaiu = localStorage.getItem("lider-saiu") === "1";

    if (liderSaiu) {
        localStorage.removeItem("lider-saiu");
        mostrarAviso(t("leaderLeftGame", "O líder saiu durante o jogo. Não é possível jogar novamente."));
        bloquearJogarNovamente(btnPlayAgain);
    }

    const userIdScoreboard    = userIdScoreboardRaw;
    const usernameScoreboard  = usernameScoreboardRaw;

    socket.emit("join-room", {
        roomCode: resultado.codigoSala.toUpperCase(),
        contexto: "scoreboard",
        user: userIdScoreboard
            ? { id: userIdScoreboard, username: usernameScoreboard }
            : undefined,
    });

    socket.on("lider-saiu-jogo", () => {
        mostrarAviso(t("leaderLeftGame", "O líder saiu. Não é possível jogar novamente."));
        bloquearJogarNovamente(btnPlayAgain);
    });

    socket.on("voltar-ao-lobby", (codigo) => {
        localStorage.removeItem("lider-saiu");
        window.location.href = `/lobby?code=${codigo}`;
    });

    try {
        const resposta = await fetch(`/api/partidas/${resultado.codigoSala}/scoreboard`, {
            cache: "no-store",
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || t("scoreboardLoadError"));
        }

        if (!dados.ranking || dados.ranking.length === 0) {
            displayVencedor.innerText = t("noRegisteredPlayers");
            rankingList.innerHTML = "";
            return;
        }

        displayVencedor.dataset.loaded = "true";

        const rankingOrdenado = [...dados.ranking].sort(
            (a, b) => Number(b.pontuacao) - Number(a.pontuacao)
        );

        const maxPontos = Math.max(...rankingOrdenado.map((j) => Number(j.pontuacao)));

        const vencedores = rankingOrdenado.filter(
            (j) => Number(j.pontuacao) === maxPontos
        );

        /* Vencedor ou empate */
        if (vencedores.length > 1) {
            if (tituloVencedor) tituloVencedor.innerText = t("scoreboardTie");
            displayVencedor.innerText = vencedores.map((v) => v.username).join(" & ");
            if (winnerPts) winnerPts.innerText = `${maxPontos} pts`;
        } else {
            if (tituloVencedor) tituloVencedor.innerText = t("scoreboardWinnerTitle", "Vencedor");
            displayVencedor.innerText = vencedores[0].username;
            if (winnerPts) winnerPts.innerText = `${maxPontos} pts`;
        }

        /* Lança confetti para o vencedor */
        lancarConfetti();

        /* Constrói a lista com posições a ter em conta empates */
        const meuUsername = localStorage.getItem("user") || "";
        let posicaoAtual    = 1;
        let pontosAnteriores = null;

        rankingList.innerHTML = rankingOrdenado
            .map((jogador, index) => {
                const pontos = Number(jogador.pontuacao);
                if (pontosAnteriores !== null && pontos < pontosAnteriores) {
                    posicaoAtual = index + 1;
                }
                pontosAnteriores = pontos;
                return construirLinhaJogador(jogador, posicaoAtual, meuUsername);
            })
            .join("");

        const liderUsername = await fetch(`/api/partidas/${resultado.codigoSala}/lider`)
            .then((r) => (r.ok ? r.json() : { username: null }))
            .then((d) => d.username)
            .catch(() => null);

        if (!liderSaiu) {
            btnPlayAgain.disabled = false;
            btnPlayAgain.style.opacity = "1";
            btnPlayAgain.style.cursor = "pointer";
        }
    } catch (err) {
        console.error("Erro ao carregar scoreboard:", err);
        displayVencedor.innerText = t("scoreboardLoadError");
        rankingList.innerHTML = "";
    }

    if (btnPlayAgain) {
        btnPlayAgain.addEventListener("click", async () => {
            if (btnPlayAgain.disabled) return;

            const meuUsernameAtual = localStorage.getItem("user") || "";

            const liderAtual = await fetch(`/api/partidas/${resultado.codigoSala}/lider`)
                .then((r) => (r.ok ? r.json() : { username: null }))
                .then((d) => d.username)
                .catch(() => null);

            const souLiderAgora = meuUsernameAtual === liderAtual;

            if (souLiderAgora) {
                try {
                    const response = await fetch("/api/match/reset", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ codigoSala: resultado.codigoSala }),
                    });

                    if (!response.ok) {
                        bloquearJogarNovamente(btnPlayAgain, t("waitingLeader", "À espera do líder..."));
                    }
                } catch (err) {
                    console.error("Erro ao solicitar reinício:", err);
                }
            } else {
                bloquearJogarNovamente(btnPlayAgain, t("waitingLeader", "À espera do líder..."));
            }
        });
    }
});