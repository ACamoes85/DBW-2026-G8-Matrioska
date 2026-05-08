"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const mainPreview = document.getElementById('main-preview');
    const gridItems = document.querySelectorAll('.grid-item');

    let selectedAvatar = mainPreview.getAttribute('src');

    gridItems.forEach(item => {
        item.addEventListener('click', async () => {
            gridItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedAvatar = item.getAttribute('data-avatar');
            mainPreview.src = selectedAvatar;

            // Guarda imediatamente ao clicar
            await fetch('/api/auth/update-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: selectedAvatar })
            });
        });
    });

    // Interceta qualquer navegação para fora da página
    window.addEventListener('beforeunload', () => {
        navigator.sendBeacon('/api/auth/update-avatar', 
            JSON.stringify({ avatar: selectedAvatar })
        );
    });

    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {

                const response = await fetch('/api/auth/update-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatar: selectedAvatar })
                });

                if (response.ok) {
                    window.location.href = '/profile?v=' + Date.now();
                } else {
                    window.location.href = '/profile';
                }
            } catch (error) {
                console.error("Erro ao atualizar avatar:", error);
                window.location.href = '/profile';
            }
        });
    }
});