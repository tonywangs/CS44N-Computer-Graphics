let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < width; i += 20) {
    for (let j = 0; j < height; j += 20) {
      particles.push({ x: i, y: j });
    }
  }
}

function draw() {
  let rainbowColor = color('hsb(' + (frameCount % 360) + ', 100%, 100%)');
  background(rainbowColor);
  noStroke();

  for (let i = 0; i < particles.length; i++) {
    let noiseValX = noise(particles[i].x / 200, particles[i].y / 200, frameCount / 100) * 100;
    let noiseValY = noise(particles[i].x / 100, particles[i].y / 100, frameCount / 100) * 100;

    let distanceToMouse = dist(mouseX, mouseY, particles[i].x, particles[i].y);
    let maxDistance = 100;

    if (distanceToMouse < maxDistance) {
      fill(255, 50, 100, 180);
      ellipse(particles[i].x, particles[i].y, 10); 
      particles[i].x += map(noiseValX, 0, 100, -1, 1);
      particles[i].y += map(noiseValY, 0, 100, -1, 1);
    } else {
      fill(0, 180);
      ellipse(particles[i].x, particles[i].y, 8); 
      particles[i].x += map(noiseValX, 0, 100, -1, 1);
      particles[i].y += map(noiseValY, 0, 100, -1, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  particles = [];
  for (let i = 0; i < width; i += 20) {
    for (let j = 0; j < height; j += 20) {
      particles.push({ x: i, y: j });
    }
  }
}
