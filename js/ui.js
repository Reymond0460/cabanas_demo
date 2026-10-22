// Animación al hacer scroll para elementos .fade-in-up
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
}

// Cierre de modales con ESC y clic fuera
function initModalBackdropsAndKeys() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            const lb = document.getElementById('image-lightbox');
            if (lb && !lb.classList.contains('hidden')) {
                lb.classList.add('hidden');
                lb.classList.remove('flex');
            }
        }
    });

    const modal = document.getElementById('success-modal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function initCookies() {
    let accepted = false; try { accepted = !!localStorage.getItem('cookiesAccepted'); } catch (e) {}
    if (!accepted) {
        setTimeout(() => {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.remove('translate-y-[150%]', 'opacity-0');
            }
        }, 2500);
    }
}

function acceptCookies() {
    try { localStorage.setItem('cookiesAccepted', 'true'); } catch (e) {}
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.add('translate-y-[150%]', 'opacity-0');
    }
}
