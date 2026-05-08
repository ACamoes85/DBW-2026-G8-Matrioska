"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const partidaAtual = JSON.parse(localStorage.getItem("partidaAtual"));
    const elRoomCode = document.getElementById("display-room-code");

    if (partidaAtual && partidaAtual.codigo && elRoomCode) {
        elRoomCode.innerText = partidaAtual.codigo;
    }

    setTimeout(() => {
        window.location.href = "/gamescreen";
    }, 3000); 
});