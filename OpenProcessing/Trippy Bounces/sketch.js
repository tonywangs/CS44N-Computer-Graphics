let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  createParticles(100);
}

function draw() {
  let lerpAmount = frameCount * 0.01;
  let fromColor = color(0, 0, 255); 
  let toColor = color(255, 255, 0); 
  let lerpColorValue = lerpColor(fromColor, toColor, sin(lerpAmount));

  background(lerpColorValue);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
    for (let j = i + 1; j < particles.length; j++) {
      if (particles[i].intersects(particles[j])) {
        particles[i].changeDirection();
        particles[j].changeDirection();
      }
    }
  }
}

function createParticles(num) {
  for (let i = 0; i < num; i++) {
    let particle = new Particle(
      random(width),
      random(height),
      random(-1, 1),
      random(-1, 1),
      random(5, 20),
      color(random(255), random(255), random(255))
    );
    particles.push(particle);
  }
}

class Particle {
  constructor(x, y, vx, vy, radius, col) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.col = col;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.checkEdges();
  }

  display() {
    fill(this.col);
    ellipse(this.x, this.y, this.radius * 2);
  }

  checkEdges() {
    if (this.x < 0 || this.x > width) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > height) {
      this.vy *= -1;
    }
  }

  intersects(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    return d <= this.radius + other.radius;
  }

  changeDirection() {
    this.vx *= -1;
    this.vy *= -1;
  }
}
