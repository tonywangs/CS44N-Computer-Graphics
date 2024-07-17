let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
	background(220, 100);
}

function draw() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

function mouseDragged() {
  let particle = new Particle(mouseX, mouseY);
  particles.push(particle);
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 5);
    this.color = color(random(255), random(255), random(255));
  }

  update() {
    this.y -= this.speed;
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, 10, 10);
  }

  isFinished() {
    return this.y < 0;
  }
}
