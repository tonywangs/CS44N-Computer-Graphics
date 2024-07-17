function setup() {
	createCanvas(windowWidth, windowHeight);
	background(50, 50, 0);
}


let D = 300;

function draw() {
	background(255, 210, 84);
	for(let y=0; y<=mouseY; y+=2*D/3) {
		for(let x=0; x<=mouseX; x+=D) //main row
			drawObject(x, y);
		for(let x=0; x<=mouseX; x+=D) //shifted row
			drawObject(x+D/2, y+D/3);
	}
}

function drawObject(x,y) {
	push();
	{
		stroke(100);
		strokeWeight(15);
		fill(255);
		circle(x, y, 300);
		fill(random(255), random(255), random(255));
		circle(x, y, 280);
		fill(random(255), random(255), random(255));
		circle(x, y, 250);
		fill(random(255), random(255), random(255));
		circle(x, y, 200);
		circle(x, y, 150);
		circle(x, y, 100);
		circle(x, y, 50);
	}
	pop();
}
