document.addEventListener("DOMContentLoaded", () => {
    const mainPreview = document.getElementById('main-preview');
    const gridItems = document.querySelectorAll('.grid-item');

    // Carregar a imagem que já estava salva (se houver)
    const avatarAtual = localStorage.getItem('userAvatar');
    
    if (avatarAtual) {
        mainPreview.src = avatarAtual;
        
        // Marcar a miniatura correspondente como ativa
        gridItems.forEach(item => {
            if (item.src === mainPreview.src) {
                item.classList.add('active');
            }
        });
    } else {
        // Se não houver nada salvo, a primeira imagem é a ativa por defeito
        gridItems[0].classList.add('active');
    }

    // Lógica de clique nas miniaturas
    gridItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover classe ativa de todos e adicionar ao clicado
            gridItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Mudar a imagem grande de preview
            mainPreview.src = item.src;

            // Salvar no browser:
            // Guardamos o caminho completo da imagem para usar em todas as páginas
            localStorage.setItem('userAvatar', item.src);
            
            console.log("Avatar guardado:", item.src);
        });
    });
});