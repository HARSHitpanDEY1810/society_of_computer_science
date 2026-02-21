let index = 0;
const slides = document.getElementById('slider');
const dots = document.querySelectorAll('.dot');
const total = 2; // total slides

function update(n) {
    index = (n + total) % total;
    slides.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.style.backgroundColor = i === index ? "white" : "rgba(255,255,255,0.5)");
}

function moveSlide(s) { update(index + s); }
function currentSlide(n) { update(n); }

let auto = setInterval(() => moveSlide(1), 5000);
document.querySelector('.group').addEventListener('mouseenter', () => clearInterval(auto));
document.querySelector('.group').addEventListener('mouseleave', () => auto = setInterval(() => moveSlide(1), 5000));

update(0);
