'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Skins de la nave ──────────────────────────────────────────────────────────
const SKINS = [
  {
    id: 'clasica', name: 'Clásica',
    stroke: '#fff', flame: 'rgba(255,130,0,0.85)', boostFlame: 'rgba(80,200,255,0.9)',
    shape: [[20, 0], [-12, -9], [-7, 0], [-12, 9]],
  },
  {
    id: 'neon', name: 'Neón',
    stroke: '#39ff14', flame: 'rgba(57,255,20,0.85)', boostFlame: 'rgba(0,255,200,0.9)',
    shape: [[22, 0], [-10, -11], [-5, 0], [-10, 11]],
  },
  {
    id: 'cazador', name: 'Cazador',
    stroke: '#ff5252', flame: 'rgba(255,190,0,0.9)', boostFlame: 'rgba(255,255,120,0.9)',
    shape: [[24, 0], [2, -6], [-14, -14], [-18, 0], [-14, 14], [2, 6]],
  },
  {
    id: 'fantasma', name: 'Fantasma',
    stroke: '#c77dff', flame: 'rgba(200,120,255,0.8)', boostFlame: 'rgba(120,220,255,0.9)',
    shape: [[18, 0], [-4, -8], [-14, -3], [-9, 0], [-14, 3], [-4, 8]],
  },
  {
    id: 'gigante', name: 'Gigante',
    stroke: '#a020f0', flame: 'rgba(170,40,255,0.85)', boostFlame: 'rgba(210,120,255,0.9)',
    shape: [[40, 0], [-24, -18], [-14, 0], [-24, 18]],  // el doble de la Clásica
    scale: 2, pointsMult: 2,
  },
];

function loadSkinIndex() {
  try {
    const i = parseInt(localStorage.getItem('asteroids.skin'), 10);
    if (Number.isInteger(i) && i >= 0 && i < SKINS.length) return i;
  } catch (_) { /* localStorage bloqueado */ }
  return 0;
}

let skinIndex = loadSkinIndex();
const currentSkin = () => {
  const s = SKINS[skinIndex];
  return { scale: 1, pointsMult: 1, ...s };
};

function cycleSkin() {
  skinIndex = (skinIndex + 1) % SKINS.length;
  try { localStorage.setItem('asteroids.skin', String(skinIndex)); } catch (_) {}
  if (ship) ship.radius = 12 * currentSkin().scale;
}

// ── Ship ──────────────────────────────────────────────────────────────────────
const SHIELD_MAX         = 100;  // energía máxima del escudo
const SHIELD_DRAIN       = 45;   // energía/s mientras está activo
const SHIELD_REGEN       = 18;   // energía/s al regenerar
const SHIELD_REGEN_DELAY = 0.8;  // s de espera tras soltar antes de regenerar
const SHIELD_FLASH_TIME  = 0.25; // duración del destello al bloquear

class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12 * currentSkin().scale;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedBoost    = 0;   // segundos restantes de Velocidad X2
    this.tripleShot    = 5;   // segundos restantes de Triple Shot
    this.shieldEnergy  = SHIELD_MAX;   // energía del escudo (0..SHIELD_MAX)
    this.shieldActive  = false;        // escudo encendido este frame
    this.shieldRegenDelay = 0;         // retardo antes de regenerar
    this.shieldFlash  = 0;             // destello al bloquear un proyectil
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedBoost    > 0) this.speedBoost    -= dt;
    if (this.tripleShot    > 0) this.tripleShot    -= dt;
    if (this.shieldFlash   > 0) this.shieldFlash   -= dt;

    // Escudo: se mantiene con Shift; consume energía y se regenera al soltarlo
    const wantShield = !!(keys['ShiftLeft'] || keys['ShiftRight']);
    this.shieldActive = wantShield && this.shieldEnergy > 0;
    if (this.shieldActive) {
      this.shieldEnergy = Math.max(0, this.shieldEnergy - SHIELD_DRAIN * dt);
      this.shieldRegenDelay = SHIELD_REGEN_DELAY;
    } else if (this.shieldEnergy < SHIELD_MAX) {
      if (this.shieldRegenDelay > 0) this.shieldRegenDelay -= dt;
      else this.shieldEnergy = Math.min(SHIELD_MAX, this.shieldEnergy + SHIELD_REGEN * dt);
    }

    const ROT   = 3.5;   // rad/s
    const THRUST = 260 * (this.speedBoost > 0 ? 2 : 1);  // px/s²
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = currentSkin().shape[0][0];
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (this.tripleShot > 0) {
      const SPREAD = Math.PI / 12;   // ±15°
      return [
        new Bullet(ox, oy, this.angle - SPREAD),
        new Bullet(ox, oy, this.angle),
        new Bullet(ox, oy, this.angle + SPREAD),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const skin = currentSkin();
    ctx.strokeStyle = skin.stroke;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta según la skin activa
    const shape = skin.shape;
    ctx.beginPath();
    ctx.moveTo(shape[0][0], shape[0][1]);
    for (let i = 1; i < shape.length; i++)
      ctx.lineTo(shape[i][0], shape[i][1]);
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor (más larga y azulada con Velocidad X2)
    if (this.thrusting && Math.random() > 0.35) {
      const boost = this.speedBoost > 0;
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(boost ? 14 : 6, boost ? 26 : 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = boost ? skin.boostFlame : skin.flame;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Escudo (se dibuja aparte para no verse afectado por el parpadeo) ───────────
function drawShield(ship) {
  if (ship.dead) return;
  if (!ship.shieldActive && ship.shieldEnergy <= 0) return;

  const t = performance.now() / 1000;
  const baseR = ship.radius * 2.1;
  const pulse = 1 + Math.sin(t * 8) * 0.05;
  const R = baseR * pulse;
  const flash = Math.max(0, ship.shieldFlash / SHIELD_FLASH_TIME);
  const alpha = ship.shieldActive ? 0.85 : 0.25;

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.lineCap = 'round';

  // Halo relleno tenue
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(80,200,255,${(alpha * 0.12 + flash * 0.4).toFixed(2)})`;
  ctx.fill();

  // Anillo con destello al bloquear
  ctx.strokeStyle = `rgba(120,220,255,${Math.min(1, alpha + flash).toFixed(2)})`;
  ctx.lineWidth = 2 + flash * 2;
  ctx.shadowColor = 'rgba(80,200,255,0.9)';
  ctx.shadowBlur = 12 + flash * 20;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();

  // Segmentos giratorios (solo con escudo activo)
  if (ship.shieldActive) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(180,240,255,${(0.6).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a0 = t * 2 + (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, R, a0, a0 + Math.PI / 9);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-up "Velocidad" (ítem flotante) ──────────────────────────────────────
class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.dead = false;
    this.ttl = 12;
    const angle = rand(0, Math.PI * 2);
    const speed = 60;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rot = rand(0, Math.PI * 2);
    this.rotSpeed = rand(-2, 2);
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo cuando está por expirar
    if (this.ttl < 3 && Math.floor(this.ttl * 8) % 2 === 0) return;
    const pulse = 1 + Math.sin(this.ttl * 6) * 0.12;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = '#50c8ff';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo( 2, -9);   // rayo
    ctx.lineTo(-5,  1);
    ctx.lineTo( 1,  1);
    ctx.lineTo(-2,  9);
    ctx.lineTo( 6, -1);
    ctx.lineTo( 0, -1);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz (enemigo) ──────────────────────────────────────────────────
const STAR_POINTS = 250;

class ShootingStar {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const speed = rand(300, 450);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.angle = angle;
    this.radius = 10;
    this.life = rand(2.0, 3.0);
    this.ttl = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = Math.max(0, this.ttl / this.life);
    const dx = Math.cos(this.angle);
    const dy = Math.sin(this.angle);
    const tail = 46;

    ctx.save();
    ctx.lineCap = 'round';

    // Rastro nacarado (rojo -> blanco)
    const grad = ctx.createLinearGradient(
      this.x, this.y,
      this.x - dx * tail, this.y - dy * tail
    );
    grad.addColorStop(0, `rgba(255,255,255,${(alpha * 0.95).toFixed(2)})`);
    grad.addColorStop(0.5, `rgba(255,120,120,${(alpha * 0.6).toFixed(2)})`);
    grad.addColorStop(1, `rgba(255,42,42,0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - dx * tail, this.y - dy * tail);
    ctx.stroke();

    // Estrella roja de 5 puntas, orientada hacia la dirección de avance
    const R1 = 11;
    const R2 = 4.5;
    const spikes = 5;
    const rot = this.angle + Math.PI / 2;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(255,42,42,0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = `rgba(255,50,50,${alpha.toFixed(2)})`;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? R1 : R2;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups, shootingStars;
let powerupTimer, starTimer;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnPowerUp() {
  const SAFE_DIST = 150;
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - ship.x, y - ship.y) < SAFE_DIST);
  powerups.push(new PowerUp(x, y));
  powerupTimer = 15 + rand(-3, 3);
}

function spawnShootingStar() {
  // Origen en el borde superior o izquierdo, rumbo diagonal
  let x, y, angle;
  if (Math.random() < 0.5) {
    x = rand(W * 0.2, W);
    y = 0;
    angle = rand(0.6, 1.0) * Math.PI * 0.5 + rand(0.35, 0.7);
  } else {
    x = 0;
    y = rand(0, H * 0.6);
    angle = rand(0.15, 0.5);
  }
  shootingStars.push(new ShootingStar(x, y, angle));
  starTimer = 5;
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  shootingStars = [];
  powerupTimer = 15;
  starTimer    = 5;
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  shootingStars = [];
  starTimer = 5;
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    shootingStars.forEach(s => s.update(dt));
    shootingStars = shootingStars.filter(s => !s.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    shootingStars.forEach(s => s.update(dt));
    shootingStars = shootingStars.filter(s => !s.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Cambiar skin de la nave
  if (pressed('KeyS')) cycleSkin();

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);

  // Estrella fugaz: 1 a la vez, esporádica
  shootingStars.forEach(s => s.update(dt));
  shootingStars = shootingStars.filter(s => !s.dead);
  starTimer -= dt;
  if (starTimer <= 0 && shootingStars.length === 0) spawnShootingStar();

  // Aparición periódica del power-up "Velocidad"
  powerupTimer -= dt;
  if (powerupTimer <= 0 && powerups.length === 0) spawnPowerUp();

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size] * currentSkin().pointsMult;
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
      }
    }
    for (const s of shootingStars) {
      if (!s.dead && !b.dead && dist(b, s) < s.radius) {
        b.dead = true;
        s.dead = true;
        score += STAR_POINTS * currentSkin().pointsMult;
        explode(s.x, s.y, 10);
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nave vs estrella fugaz (el escudo activo la bloquea)
  if (ship.invincible <= 0) {
    for (const s of shootingStars) {
      if (!s.dead && dist(ship, s) < ship.radius + s.radius) {
        if (ship.shieldActive) {
          s.dead = true;
          ship.shieldFlash = SHIELD_FLASH_TIME;
          explode(s.x, s.y, 10);
        } else {
          killShip();
        }
        break;
      }
    }
    shootingStars = shootingStars.filter(s => !s.dead);
  }

  // Nave vs power-up: atrapar el ítem otorga Velocidad X2 durante 5 s
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      ship.speedBoost = 5;
      explode(p.x, p.y, 6);
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  const shape = currentSkin().shape;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.45, 0.45);
  ctx.strokeStyle = currentSkin().stroke;
  ctx.lineWidth   = 2.6;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(shape[0][0], shape[0][1]);
  for (let i = 1; i < shape.length; i++)
    ctx.lineTo(shape[i][0], shape[i][1]);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawShieldHUD(x, y) {
  const label = ship.shieldActive ? 'ESCUDO' : 'SHIFT  ESCUDO';
  ctx.textAlign = 'left';
  ctx.font = '13px monospace';
  ctx.fillStyle = ship.shieldActive ? '#78dcff' : 'rgba(120,220,255,0.6)';
  ctx.fillText(label, x, y);

  const bx = x + 112, by = y - 9, bw = 110, bh = 8;
  ctx.strokeStyle = 'rgba(120,220,255,0.7)';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, bh);
  const pct = Math.max(0, ship.shieldEnergy / SHIELD_MAX);
  ctx.fillStyle = ship.shieldActive ? '#78dcff' : 'rgba(80,200,255,0.75)';
  ctx.fillRect(bx + 1, by + 1, (bw - 2) * pct, bh - 2);

  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  let hudY = 46;
  if (ship.speedBoost > 0) {
    ctx.fillStyle = '#50c8ff';
    ctx.fillText(`VELOCIDAD X2  ${ship.speedBoost.toFixed(1)}s`, 14, hudY);
    hudY += 20;
  }
  if (ship.tripleShot > 0) {
    ctx.fillStyle = '#ffb347';
    ctx.fillText(`TRIPLE SHOT  ${ship.tripleShot.toFixed(1)}s`, 14, hudY);
    hudY += 20;
  }
  ctx.fillStyle = '#fff';

  drawShieldHUD(14, hudY + 16);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  shootingStars.forEach(s => s.draw());
  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();
  drawShield(ship);

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);