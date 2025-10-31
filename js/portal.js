// Portal Effect - Interactive animated portal
class PortalEffect {
  constructor() {
    this.canvas = document.getElementById('portal-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 100;
    this.debris = [];
    this.debrisCount = 15;
    this.mouse = { x: 0, y: 0 };
    this.targetPortalX = 0;
    this.targetPortalY = 0;
    this.portalX = 0;
    this.portalY = 0;
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.portalX = this.canvas.width / 2;
    this.portalY = this.canvas.height / 2;
    this.targetPortalX = this.portalX;
    this.targetPortalY = this.portalY;
    this.createParticles();
    this.createDebris();
    this.bindEvents();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 180 // Cyan-Magenta range for retro theme
      });
    }
  }

  createDebris() {
    this.debris = [];
    for (let i = 0; i < this.debrisCount; i++) {
      this.debris.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 15 + 5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        shape: Math.floor(Math.random() * 3), // 0: square, 1: triangle, 2: hexagon
        opacity: Math.random() * 0.4 + 0.2,
        color: Math.random() < 0.5 ? '#00ffff' : '#ff00ff'
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
      this.createDebris();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.targetPortalX = e.clientX;
      this.targetPortalY = e.clientY;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw and update space debris first (background layer)
    this.debris.forEach((debris) => {
      // Update position
      debris.x += debris.speedX;
      debris.y += debris.speedY;
      debris.rotation += debris.rotationSpeed;
      
      // Wrap around edges
      if (debris.x < -debris.size) debris.x = this.canvas.width + debris.size;
      if (debris.x > this.canvas.width + debris.size) debris.x = -debris.size;
      if (debris.y < -debris.size) debris.y = this.canvas.height + debris.size;
      if (debris.y > this.canvas.height + debris.size) debris.y = -debris.size;
      
      // Draw debris
      this.ctx.save();
      this.ctx.translate(debris.x, debris.y);
      this.ctx.rotate(debris.rotation);
      this.ctx.globalAlpha = debris.opacity;
      this.ctx.strokeStyle = debris.color;
      this.ctx.lineWidth = 1;
      this.ctx.fillStyle = debris.color;
      this.ctx.shadowColor = debris.color;
      this.ctx.shadowBlur = 5;
      
      if (debris.shape === 0) { // Square
        this.ctx.fillRect(-debris.size/2, -debris.size/2, debris.size, debris.size);
      } else if (debris.shape === 1) { // Triangle
        this.ctx.beginPath();
        this.ctx.moveTo(0, -debris.size/2);
        this.ctx.lineTo(-debris.size/2, debris.size/2);
        this.ctx.lineTo(debris.size/2, debris.size/2);
        this.ctx.closePath();
        this.ctx.fill();
      } else { // Hexagon
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * debris.size / 2;
          const y = Math.sin(angle) * debris.size / 2;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });

    // Smooth portal center following mouse
    this.portalX += (this.targetPortalX - this.portalX) * 0.05;
    this.portalY += (this.targetPortalY - this.portalY) * 0.05;

    // Update and draw particles
    this.particles.forEach((particle, i) => {
      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const angle = Math.atan2(dy, dx);
        const force = (150 - distance) / 150;
        particle.speedX -= Math.cos(angle) * force * 0.01;
        particle.speedY -= Math.sin(angle) * force * 0.01;
      }

      // Portal center attraction
      const dxPortal = this.portalX - particle.x;
      const dyPortal = this.portalY - particle.y;
      const distancePortal = Math.sqrt(dxPortal * dxPortal + dyPortal * dyPortal);
      
      if (distancePortal < 300) {
        const anglePortal = Math.atan2(dyPortal, dxPortal);
        const forcePortal = (300 - distancePortal) / 300 * 0.015;
        particle.speedX += Math.cos(anglePortal) * forcePortal;
        particle.speedY += Math.sin(anglePortal) * forcePortal;
      }

      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
      this.ctx.fill();

      // Draw connections
      this.particles.slice(i + 1).forEach(particle2 => {
        const dx = particle.x - particle2.x;
        const dy = particle.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(particle2.x, particle2.y);
          this.ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${0.2 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });

    // Draw portal center (now follows mouse)
    const centerX = this.portalX;
    const centerY = this.portalY;
    const time = Date.now() * 0.001;
    
    // Outer glow
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    gradient.addColorStop(0, 'hsla(180, 100%, 50%, 0.12)');
    gradient.addColorStop(1, 'hsla(180, 100%, 50%, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner portal ring
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 120 + Math.sin(time) * 10, 0, Math.PI * 2);
    this.ctx.strokeStyle = `hsla(${180 + Math.sin(time * 0.5) * 60}, 100%, 50%, 0.6)`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize portal effect when page loads
document.addEventListener('DOMContentLoaded', () => {
  new PortalEffect();
});

