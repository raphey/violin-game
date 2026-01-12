// Celebration system with canvas fireworks
// Creates particle-based fireworks animations
// Copied from math-game (generic, works for violin game too)

const Celebrations = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    level: 'good',
    emojis: ['🦄', '🦕', '🦖', '⭐', '✨', '🌟', '💫', '🎻'],

    // Initialize the canvas
    init: function() {
        this.canvas = document.getElementById('fireworks-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        window.addEventListener('resize', () => this.resizeCanvas());
    },

    // Resize canvas to fill container
    resizeCanvas: function() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    },

    // Start the fireworks animation
    start: function(level) {
        this.level = level;
        this.particles = [];

        if (!this.canvas) {
            this.init();
        }

        this.resizeCanvas();
        this.launchFireworks();
        this.animate();

        // Stop after 5 seconds
        setTimeout(() => {
            this.stop();
        }, 5000);
    },

    // Stop the animation
    stop: function() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    // Launch fireworks based on level
    launchFireworks: function() {
        const count = this.level === 'perfect' ? 8 : this.level === 'great' ? 5 : 3;
        const interval = this.level === 'perfect' ? 200 : 300;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * interval);
        }

        // Keep launching more fireworks for perfect
        if (this.level === 'perfect') {
            setTimeout(() => {
                this.launchFireworks();
            }, count * interval + 500);
        }
    },

    // Create a single firework explosion
    createFirework: function() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * (this.canvas.height * 0.6) + this.canvas.height * 0.1;

        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
            '#f093fb', '#4facfe', '#fa709a', '#fee140'
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        const particleCount = this.level === 'perfect' ? 50 : this.level === 'great' ? 35 : 25;

        // Create explosion particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = Math.random() * 3 + 2;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                life: 1.0,
                decay: Math.random() * 0.015 + 0.01,
                size: Math.random() * 3 + 2
            });
        }

        // Add some emoji particles for perfect score
        if (this.level === 'perfect' && Math.random() > 0.5) {
            const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                emoji: emoji,
                life: 1.0,
                decay: 0.008,
                size: 30
            });
        }
    },

    // Animation loop
    animate: function() {
        if (!this.ctx) return;

        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update physics
            p.vy += 0.1; // gravity
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Draw particle
            this.ctx.globalAlpha = p.life;

            if (p.emoji) {
                // Draw emoji
                this.ctx.font = `${p.size}px Arial`;
                this.ctx.fillText(p.emoji, p.x, p.y);
            } else {
                // Draw colored circle
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.globalAlpha = 1.0;

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};
