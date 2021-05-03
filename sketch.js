
let numBalls, numBallsUpdate;
let ballSize, ballSizeUpdate;
let spring = 0.05;
let balls = [];

let probInfection, probInfUpdate;
let probDeath, probDeathUpdate;
let recoverTime, recoverTimeUpdate;
let t = 0;

let numBallsSlider, ballSizeSlider, probInfSlider, probDeathSlider, recTimeSlider;

//generate random whole number
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function appendHist(eventText){
  var ul = document.getElementById("simHistory");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(eventText));
  ul.appendChild(li);
}

function resetSketch(){
  document.getElementById("simHistory").innerHTML = "";
  t = 0;

  numBalls = numBallsUpdate;
  ballSize = ballSizeUpdate;
  probInfection = probInfUpdate;
  probDeath = probDeathUpdate;
  recoverTime = recoverTimeUpdate;

  balls = [];
  for (let i = 0; i < numBalls; i++) {
    balls[i] = new Ball(
      random(ballSize, width - ballSize), // x-value
      random(ballSize, height - ballSize), // y-value
      ballSize, // diameter of ball
      i, //id of ball
      0, //set status to susceptible
    );
  }
  patientZero = getRandomInt(0, numBalls) // generate id of patient zero
  balls[patientZero].status = 1; //infect one random ball
  balls[patientZero].infectedTime = 0;
  appendHist("Node: " + balls[patientZero].id + " is patient zero.");
  noStroke();
  fill(255, 204);
}

function setup() {
  let myCanvas = createCanvas(windowWidth * 1, windowHeight * .7);
  myCanvas.parent("sketchDiv");

  numBallsSlider = createSlider(1, 300, 100);
  numBallsSlider.position(20, 20);
  numBalls = numBallsSlider.value();

  ballSizeSlider = createSlider(10, 40, 30); 
  ballSizeSlider.position(20,50);
  ballSize = ballSizeSlider.value();

  probInfSlider = createSlider(0, 100, 50); 
  probInfSlider.position(20,80);
  probInfection = probInfSlider.value() * 0.01;

  probDeathSlider = createSlider(0, 100, 3);
  probDeathSlider.position(20, 110);
  probDeath = probDeathSlider.value() * 0.01;

  recTimeSlider = createSlider(1, 1000, 200);
  recTimeSlider.position(20, 140);
  recoverTime = recTimeSlider.value();

  t = 0;
  for (let i = 0; i < numBalls; i++) {
    balls[i] = new Ball(
      random(ballSize, width - ballSize), // x-value
      random(ballSize, height - ballSize), // y-value
      ballSize, // diameter of ball
      i, //id of ball
      0, //set status to susceptible
    );
  }
  patientZero = getRandomInt(0, numBalls) // generate id of patient zero
  balls[patientZero].status = 1; //infect one random ball
  balls[patientZero].infectedTime = 0;
  appendHist("Node: " + balls[patientZero].id + " is patient zero.");
  noStroke();
  fill(255, 204);

  let button = createButton("Update Simulation");
  button.parent("sketchDiv");
  button.mousePressed(resetSketch);

  diseaseStopped = false; //for the disease stopped statement in the history

}

function draw() {
  numBallsUpdate = numBallsSlider.value();
  ballSizeUpdate = ballSizeSlider.value();
  probInfUpdate = probInfSlider.value() * 0.01;
  probDeathUpdate = probDeathSlider.value() * 0.01;
  recoverTimeUpdate = recTimeSlider.value();

  background(200);
  fill(0);
  textSize(15);
  text('Number of People', numBallsSlider.x * 2 + numBallsSlider.width, 35);
  text('Person Size', ballSizeSlider.x * 2 + ballSizeSlider.width, 65);
  text('Probability of Infection', probInfSlider.x * 2 + probInfSlider.width, 95);
  text('Probability of Death', probDeathSlider.x * 2 + probDeathSlider.width, 125);
  text('Recovery Time', recTimeSlider.x * 2 + recTimeSlider.width, 155);



  balls.forEach(ball => {
    ball.collide();
    ball.move();
    if(ball.status == 1){
      ball.recover();
    }
    if(ball.status == 3){
      ball.vx = 0;
      ball.vy = 0;
    }
    ball.display();
  });

  t += 1;


  // below: count various statuses
  let numSus = 0;
  let numInf = 0;
  let numRec = 0;
  let numDead = 0;

  for (i = 0; i < numBalls; i++) {
    if (balls[i].status == 0) {
      numSus += 1
    }
    else if (balls[i].status == 1) {
      numInf += 1 
    }
    else if (balls[i].status == 2) {
      numRec += 1
    }
    else {
      numDead += 1
    }
  }

  // display number of statuses on page
  document.getElementById("numSus").innerHTML = "Number of Susceptible: " + numSus.toString();
  document.getElementById("numInf").innerHTML = "Number of Infected: " + numInf.toString();
  document.getElementById("numRec").innerHTML = "Number of Recovered: " + numRec.toString();
  document.getElementById("numDead").innerHTML = "Number of Dead: " + numDead.toString();

  if (numInf == 0){
    if (!diseaseStopped) {
      appendHist("Disease has been stopped.");
      diseaseStopped = true;
    }
  }
  
}

class Ball {
  constructor(xcoord, ycoord, d, id, stat) {
    this.x = xcoord;
    this.y = ycoord;
    this.diameter = d;
    this.id = id;
    this.status = stat;
    this.infectedTime = null;
    this.vx = Math.random(); // magnitude of random x velocity
    this.vx *= Math.round(Math.random()) ? 1 : -1; // randomly select direction of x velocity (same for next two lines)
    this.vy = Math.random();
    this.vy *= Math.round(Math.random()) ? 1 : -1;
  }

  collide() {
    for (let i = 0; i < numBalls; i++) {
      let dx = balls[i].x - this.x;
      let dy = balls[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = balls[i].diameter / 2 + this.diameter / 2;
      if (distance < minDist) {
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - balls[i].x) * spring;
        let ay = (targetY - balls[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        balls[i].vx += ax;
        balls[i].vy += ay;
        if (this.status == 1) {
          this.infect(i) // run infection chance on ball i
        }
      }
    }
  }

  move() {
    this.x += this.vx; // move in x dir
    this.y += this.vy; // move in y dir

    //check boundaries
    if (this.x + this.diameter / 2 > width) {
      this.vx *= -1;
    } 
    else if (this.x - this.diameter / 2 < 0) {
      this.vx *= -1;
    }
    if (this.y + this.diameter / 2 > height) {
      this.vy *= -1;
    } 
    else if (this.y - this.diameter / 2 < 0) {
      this.vy *= -1;
    }
  }

  infect(i) {
    if (this.status == 1) { // if this is infected
      if (balls[i].status == 0){ // if the contacted is susceptible
        let x = Math.random(); //random float
        if (x <= probInfection) { // check if random value is in prob of infection
          balls[i].status = 1;
          balls[i].infectedTime = t;
          appendHist("Node: " + this.id + " infects node: " + balls[i].id + ".");
        } 
      }
    }
  }

  recover() {
    if (this.status == 1){
      if (t - this.infectedTime >= recoverTime) {
        this.status = 2;
        appendHist("Node: " + this.id + " recovers.");
      }
      let x = Math.random(); //random float
      if ((t % numBalls == 0) && (x <= probDeath)) {
        this.status = 3; // kill em
        appendHist("Node: " + this.id + " dies.");
      } 
    }
  }

  display() {
    if (this.status == 0) { // if susceptible
      fill('white');
    }
    else if (this.status == 1) { // if infected
      fill('red');
    }
    else if (this.status == 2) { // if recovered
      fill('green');
    }
    else {
      fill('blue');
    }
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}