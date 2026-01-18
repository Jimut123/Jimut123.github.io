function toggleMenu() {
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

navLinks.classList.toggle('active');
hamburger.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
const nav = document.querySelector('nav');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

if (!nav.contains(event.target) && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}
});

// Smooth scroll with offset for sticky nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
        const offset = 100;
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
});
});

