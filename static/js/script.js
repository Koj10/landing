document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.landing-header');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const openBtn = document.querySelector('[data-mobile-menu-open]');
    const closeBtn = document.querySelector('[data-mobile-menu-close]');

    function setMenuOpen(open) {
        if (!mobileMenu) return;
        mobileMenu.hidden = !open;
        document.body.style.overflow = open ? 'hidden' : '';
    }

    openBtn?.addEventListener('click', () => setMenuOpen(true));
    closeBtn?.addEventListener('click', () => setMenuOpen(false));
    mobileMenu?.addEventListener('click', (event) => {
        if (event.target === mobileMenu) setMenuOpen(false);
    });
    mobileMenu?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    window.addEventListener('scroll', () => {
        if (!header) return;
        header.classList.toggle('is-scrolled', window.scrollY > 24);
    });
    header?.classList.toggle('is-scrolled', window.scrollY > 24);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            const offset = header ? header.offsetHeight + 12 : 80;
            window.scrollTo({
                top: target.offsetTop - offset,
                behavior: 'smooth',
            });
            setMenuOpen(false);
        });
    });
});
