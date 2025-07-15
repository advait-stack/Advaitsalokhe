document.addEventListener('DOMContentLoaded', () => {
  new CanvasParticleSystem();
  new SectionManager();
  new InteractionManager();
  new TypingEffect('#subtitle', [
    "A Total Perspective Vortex.",
    "A Generalist Mind.",
    "Exploring Science & Philosophy.",
    "Building the Future."
  ]);
});

/**
 * Manages the interactive particle background using HTML5 Canvas.
 * This is significantly more performant than animating individual DOM elements.
 */
class CanvasParticleSystem {
  constructor(selector = '#particles-canvas') {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 100 };

    this.init();
  }

  init() {
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
        this.mouse.x = null;
        this.mouse.y = null;
    });

    this.resizeCanvas();
    this.createParticles();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const particleCount = (this.canvas.width * this.canvas.height) / 9000;
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(this.canvas, this.ctx));
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => p.update(this.mouse));
    requestAnimationFrame(() => this.animate());
  }
}

class Particle {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    
    // Enhancements for space animation
    this.color = 'rgb(0, 255, 225)';
    this.opacity = Math.random() * 0.5 + 0.2;
    this.opacityDirection = 1;
    this.twinkleSpeed = Math.random() * 0.02;
    this.vx = (Math.random() - 0.5) * 0.1; // slow horizontal drift
    this.vy = (Math.random() - 0.5) * 0.1; // slow vertical drift
  }

  draw() {
    this.ctx.fillStyle = `rgba(0, 255, 225, ${this.opacity})`;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  update(mouse) {
    // Twinkling effect
    this.opacity += this.twinkleSpeed * this.opacityDirection;
    if (this.opacity > 0.7 || this.opacity < 0.1) {
      this.opacityDirection *= -1;
    }

    // Drifting effect
    this.baseX += this.vx;
    this.baseY += this.vy;

    // Boundary checks for drift
    if (this.baseX > this.canvas.width + this.size) this.baseX = -this.size;
    if (this.baseX < -this.size) this.baseX = this.canvas.width + this.size;
    if (this.baseY > this.canvas.height + this.size) this.baseY = -this.size;
    if (this.baseY < -this.size) this.baseY = this.canvas.height + this.size;

    // Mouse interaction
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = 0;
    let directionY = 0;

    if (distance < mouse.radius) {
      directionX = -forceDirectionX * force * this.density;
      directionY = -forceDirectionY * force * this.density;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        directionX = -dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        directionY = -dy / 10;
      }
    }

    this.x += directionX;
    this.y += directionY;

    this.draw();
  }
}

/**
 * Manages the opening and closing of the side panel sections.
 */
class SectionManager {
  constructor() {
    this.mainContainer = document.getElementById('mainContainer');
    this.sectionPanel = document.getElementById('sectionPanel');
    this.sectionTitle = document.getElementById('sectionTitle');
    this.closeBtn = document.getElementById('closeBtn');
    this.blackholeOverlay = document.getElementById('blackhole-overlay');
    this.navButtons = document.querySelectorAll('.nav-buttons button');
    
    this.init();
  }

  init() {
    this.navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Bug Fix: Use e.currentTarget to ensure we always reference the button
        // the event listener was attached to. This is more robust than e.target.
        const section = e.currentTarget.dataset.section;
        this.openSection(section);
      });
    });

    this.closeBtn.addEventListener('click', () => this.closeSection());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sectionPanel.classList.contains('active')) {
        this.closeSection();
      }
    });
  }

  openSection(section) {
    const titles = {
      'essays': 'Essays',
      'projects': 'Projects',
      'random': 'Random Stuff'
    };
    this.sectionTitle.textContent = titles[section] || 'Coming Soon';
    this.blackholeOverlay.classList.add('active');
    
    this.mainContainer.classList.add('shifted');
    // Using setTimeout is simple but can be brittle. For this project, it's fine.
    // A more robust solution for complex apps would use the 'transitionend' event.
    setTimeout(() => {
      this.sectionPanel.classList.add('active');
    }, 300);
  }

  closeSection() {
    this.sectionPanel.classList.remove('active');
    this.blackholeOverlay.classList.remove('active');
    setTimeout(() => {
      this.mainContainer.classList.remove('shifted');
    }, 300);
  }
}

/**
 * Manages UI micro-interactions like button ripples.
 */
class InteractionManager {
  constructor() {
    this.init();
  }

  init() {
    const buttons = document.querySelectorAll('.nav-buttons button');
    buttons.forEach(button => {
      // Bug Fix: Ripple should happen on click, not hover, for a better UX.
      button.addEventListener('click', this.createRipple);
    });
  }

  createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    // Remove any existing ripples to prevent clutter
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    button.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }
}

/**
 * Creates a dynamic, looping typing effect for an element.
 */
class TypingEffect {
  constructor(selector, words, wait = 2000) {
    this.el = document.querySelector(selector);
    if (!this.el) return;

    this.words = words;
    this.wait = parseInt(wait, 10);
    this.txt = '';
    this.wordIndex = 0;
    this.isDeleting = false;
    
    this.type();
  }

  type() {
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = `<span class="txt">${this.txt}</span><span class="cursor"></span>`;

    let typeSpeed = 150;
    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}