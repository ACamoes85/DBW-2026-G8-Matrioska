document.addEventListener("DOMContentLoaded", () => {
    const mainPreview = document.getElementById('main-preview');
    const gridItems = document.querySelectorAll('.grid-item');

    const avatarAtual = localStorage.getItem('userAvatar');
    
    if (avatarAtual) {
        mainPreview.src = avatarAtual;
        gridItems.forEach(item => {
            if (item.src === mainPreview.src) {
                item.classList.add('active');
            }
        });
    } else if (gridItems.length > 0) {
        gridItems[0].classList.add('active');
    }

    gridItems.forEach(item => {
        item.addEventListener('click', () => {
            gridItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            mainPreview.src = item.src;
            localStorage.setItem('userAvatar', item.src);
        });
    });
});