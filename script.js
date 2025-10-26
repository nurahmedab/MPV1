function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

// Shooting star background with intro animation
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('shooting-star-bg');

    //expereince 
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach(item => {
    const responsibilities = item.querySelector('.responsibilities');
    if (responsibilities) {
        responsibilities.style.display = 'none'; // collapse initially

        item.addEventListener('click', () => {
            const isVisible = responsibilities.style.display === 'block';
            responsibilities.style.display = isVisible ? 'none' : 'block';
        });
    }
});

    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    window.addEventListener('resize', () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
    });

    // Twinkling background stars
    class BackgroundStar {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.radius = Math.random() * 1.2 + 0.3;
            this.baseAlpha = Math.random() * 0.5 + 0.3;
            this.alpha = this.baseAlpha;
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
        }
        update() {
            this.alpha = this.baseAlpha + Math.sin(Date.now() * this.twinkleSpeed + this.twinklePhase) * 0.3;
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.restore();
        }
    }

    // Random shooting stars
    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }
    class ShootingStar {
        constructor() { this.reset(); }
        reset() {
            this.x = randomBetween(0, w);
            this.y = randomBetween(-h, 0);
            this.len = randomBetween(100, 300);
            this.speed = randomBetween(8, 10);
            this.angle = Math.PI / 4; // 45 degrees
            this.alpha = randomBetween(0.5, 1);
            this.trail = [];
        }
        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);
            if (this.x > w || this.y > h) this.reset();
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const p = this.trail[i];
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    // Special intro shooting star
    let introStar = {
        x: 0,
        y: 0,
        speed: 25,
        angle: Math.atan2(h/2, w/2),
        exploded: false,
        explosionRadius: 0,
        explosionMax: 80,
        explosionAlpha: 1
    };
    let showText = false;
    let textAlpha = 0;
    let introDone = false;

    // Create stars
    const backgroundStars = [];
    for (let i = 0; i < 120; i++) backgroundStars.push(new BackgroundStar());
    const stars = [];
    for (let i = 0; i < 8; i++) stars.push(new ShootingStar());

    function animate() {
        ctx.clearRect(0, 0, w, h);

        // Draw background stars
        for (const star of backgroundStars) {
            star.update();
            star.draw(ctx);
        }

        // Draw random shooting stars only after intro is done
        if (introDone) {
            for (const star of stars) {
                star.update();
                star.draw(ctx);
            }
        }

        // Special intro shooting star and animation
        if (!introDone) {
            if (!introStar.exploded) {
                ctx.save();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(introStar.x, introStar.y);
                ctx.lineTo(introStar.x - 40 * Math.cos(introStar.angle), introStar.y - 40 * Math.sin(introStar.angle));
                ctx.stroke();
                ctx.restore();

                introStar.x += introStar.speed * Math.cos(introStar.angle);
                introStar.y += introStar.speed * Math.sin(introStar.angle);

                if (Math.abs(introStar.x - w/2) < 10 && Math.abs(introStar.y - h/2) < 10) {
                    introStar.exploded = true;
                }
            } else if (introStar.explosionRadius < introStar.explosionMax) {
                ctx.save();
                ctx.globalAlpha = introStar.explosionAlpha;
                ctx.beginPath();
                ctx.arc(w/2, h/2, introStar.explosionRadius, 0, Math.PI * 2);
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.restore();

                introStar.explosionRadius += 4;
                introStar.explosionAlpha *= 0.96;
            } else {
                showText = true;
            }

            // Fade in "welcome..." text
            if (showText && textAlpha < 1) {
                textAlpha += 0.02;
            }
            if (showText) {
                ctx.save();
                ctx.globalAlpha = textAlpha;
                ctx.font = "bold 3rem Poppins, sans-serif";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.fillText("Welcome...", w/2, h/2 + 10);
                ctx.restore();

                // When text is fully visible, show main content and start random shooting stars
                if (textAlpha >= 1 && !introDone) {
                    setTimeout(() => {
                        document.getElementById('main-content').style.display = 'block';
                        // Optional: keep canvas as background, or hide with:
                        // canvas.style.display = 'none';
                        introDone = true;
                    }, 1200);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Start intro star at top-left
    introStar.x = 0;
    introStar.y = 0;

    animate();

/*
const ball = document.getElementById('ball');

// Points along the zigzag pipe
const points = [
  {x:33, y:40},
  {x:33, y:80},
  {x:33, y:120},
  {x:33, y:160},
  {x:33, y:200}
];

let index = 0;
let speed = 0.05;

function animateBall() {
  let target = points[index];
  let cx = parseFloat(ball.getAttribute('cx'));
  let cy = parseFloat(ball.getAttribute('cy'));

  let dx = target.x - cx;
  let dy = target.y - cy;

  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    index = (index + 1) % points.length;
    target = points[index];
  }

  ball.setAttribute('cx', cx + dx * speed);
  ball.setAttribute('cy', cy + dy * speed);

  requestAnimationFrame(animateBall);
}

animateBall();
*/

});

