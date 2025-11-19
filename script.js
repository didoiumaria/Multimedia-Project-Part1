
document.addEventListener('DOMContentLoaded', () => {
    const points = document.querySelectorAll('.map-point');
    const infoBox = document.getElementById('infoBox');
    const title = document.getElementById('eventTitle');
    const description = document.getElementById('eventDescription');
    const image = document.getElementById('eventImage');

    if (points.length > 0 && infoBox) {
        points.forEach(point => {
            point.addEventListener('click', () => {
                  title.textContent = point.dataset.title;
                description.textContent = point.dataset.description;
                
                
                if (point.dataset.image) {
                    image.style.display = 'block';
                    image.src = point.dataset.image;
                    
                    image.onerror = function() {

                        this.onerror = null;
                        if(point.dataset.altimage){
                            this.src = point.dataset.altimage;
                        }else{
                            this.style.display = 'none';
                        } 
                    };
                } else {
                    image.style.display = 'none';
                }

                
                infoBox.style.display = 'block';
            });
        });
    }
});

function closeInfo() {
    const infoBox = document.getElementById('infoBox');
    const image = document.getElementById('eventImage');
    if (infoBox) {
        infoBox.style.display = 'none';
        if (image) image.src = ""; 
    }
}


const yearSlider = document.getElementById('yearSlider');
const yearDisplay = document.getElementById('yearDisplay');


function updateSliderFill(slider) {
    const min = slider.min;
    const max = slider.max;
    const val = slider.value;
    const percentage = ((val - min) / (max - min)) * 100;
   slider.style.background = `linear-gradient(to right, #a04668 ${percentage}%, #d7ccc8 ${percentage}%)`;

}

if (yearSlider) {
    updateSliderFill(yearSlider); 

    yearSlider.addEventListener('input', (e) => {
        const currentYear = parseInt(e.target.value);
        if (yearDisplay) yearDisplay.textContent = currentYear;
        updateSliderFill(e.target); 

        const allPoints = document.querySelectorAll('.map-point');
        allPoints.forEach(point => {
            const eventYear = parseInt(point.dataset.year);
            if (eventYear && eventYear > currentYear) {
                point.style.opacity = "0";
                point.style.pointerEvents = "none";
            } else {
                point.style.opacity = "1";
                point.style.pointerEvents = "auto";
            }
        });
    });
}

function resetTimeline() {
    if (yearSlider) {
        yearSlider.value = 2000;
        yearSlider.dispatchEvent(new Event('input'));
    }
}


const canvas = document.getElementById('historyCanvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    window.addEventListener('mouseout', function() {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        const container = document.querySelector('.map-container');
        if (container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            initParticles();
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5; 
            this.speedX = Math.random() * 0.5 - 0.25; 
            this.speedY = Math.random() * 0.5 - 0.25; 
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
           ctx.fillStyle = `rgba(210, 180, 140, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000; 
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let gradientX = mouse.x !== null ? mouse.x : canvas.width / 2;
        let gradientY = mouse.y !== null ? mouse.y : canvas.height / 2;
        let currentRadius = mouse.x !== null ? mouse.radius : canvas.width / 2.5;

        const gradient = ctx.createRadialGradient(
            gradientX, gradientY, currentRadius, 
            gradientX, gradientY, canvas.width
        );

        if (mouse.x !== null) {
            gradient.addColorStop(0, "rgba(0,0,0,0)"); 
            gradient.addColorStop(0.2, "rgba(0,0,0,0.1)"); 
            gradient.addColorStop(1, "rgba(0,0,0,0.85)"); 
        } else {
            gradient.addColorStop(0, "rgba(0,0,0,0)");
            gradient.addColorStop(1, "rgba(60,40,20,0.4)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    setTimeout(() => {
        resizeCanvas();
        animate();
    }, 100);
}


const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const allPoints = document.querySelectorAll('.map-point');

    allPoints.forEach(point => {
        const title = point.dataset.title.toLowerCase();
        const desc = point.dataset.description.toLowerCase();

        if (title.includes(query) || desc.includes(query)) {
            point.style.opacity = "1";
            point.style.pointerEvents = "auto";
            point.style.transform = "translate(-50%, -50%) scale(1.5)";
            setTimeout(() => {
                point.style.transform = "translate(-50%, -50%) scale(1)";
            }, 300);
        } else {
            point.style.opacity = "0.1"; 
            point.style.pointerEvents = "none";
        }
    });
}

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
});
}