class MathTools{
  static randomIntRange(max){
    return Math.floor(Math.random() * Math.floor(2 * max + 1) - max);
  }

  static randomInt(max){
    return Math.floor(Math.random() * max);
  }

  static randomFloat(max){
    return Math.random() * Math.floor(2 * max) - max;
  }

  static velocityComponent(x, magnitude){
    let sign = 1;
    if(MathTools.randomInt(2) == 0){
      sign = -1;
    }
    return Math.sqrt(magnitude ** 2 - (x ** 2)) * sign;
  }

}


class Circle{
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
  }
}


class Ball extends Circle{
  static MAX_SPEED = 1;
  static RADIUS = 10;

  constructor(x, y){
    super(x,y);
    this.r = Ball.RADIUS;
    this.vx = MathTools.randomFloat(Ball.MAX_SPEED);
    this.vy = MathTools.velocityComponent(this.vx, Ball.MAX_SPEED);
    this.collision = false;
  }

  move(){
    if(this.x + this.r >= Arena.DEFAULT_WIDTH || this.x - this.r < 0){
      this.vx = -this.vx;
    }
    if(this.y + this.r >= Arena.DEFAULT_HEIGHT || this.y - this.r < 0){
      this.vy = -this.vy;
    }
    this.x += this.vx;
    this.y += this.vy;
  }

  isCollided(b){
    return Math.sqrt((this.x - b.x) ** 2  + (this.y - b.y) ** 2) <=  (2 * b.r);
  }

}


class AABB{

  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  //didn't get to write this method in a better way
  containsBall(b){
    let tempX, tempY;

   if(b.x < this.x){
     tempX = this.x
   }
   else if(b.x > this.x + this.w){
     tempX = this.x + this.w;
   }
   else{
    const condX = b.x + b.r  > this.x && (b.x + b.r - (this.w + this.x) < 0 ||
                                          b.x - b.r - (this.w + this.x) < 0);

    const condY = b.y + b.r > this.y && (b.y + b.r - (this.h + this.y) < 0 ||
                                         b.y - b.r - (this.h + this.y) < 0);

    return condX && condY;

   }
   if(b.y < this.y){
     tempY = this.y;
   }
   else if(b.y > this.y + this.h){
     tempY = this.y + this.h;
   }
   return Math.sqrt((b.x - tempX) ** 2 + (b.y - tempY) ** 2) <= b.r;
  }

  intersectsAABB(aabb){
    return(this.x < aabb.x + aabb.w + aabb.h &&
           this.x + this.w + this.h > aabb.x &&
           this.y < aabb.x + aabb.w + aabb.h &&
           this.y + this.w + this.h > aabb.y)
  }

}

//implemented using pseudocode from wikipedia
class QuadTree {
  static NODE_CAPACITY = 4;

  constructor(aabb){
    this.boundary = aabb;
    this.balls = [];

    this.northEast = null;
    this.northWest = null;
    this.southWest = null;
    this.southEast = null;
  }

  subdivide(){
    let aabb = new AABB(this.boundary.x, this.boundary.y,
                       this.boundary.w / 2, this.boundary.h / 2);
    this.northWest = new QuadTree(aabb);

    aabb = new AABB(this.boundary.x + this.boundary.w / 2, this.boundary.y,
                    this.boundary.w / 2, this.boundary.h / 2);
    this.northEast = new QuadTree(aabb);


    aabb = new AABB(this.boundary.x, this.boundary.y + this.boundary.h / 2,
                    this.boundary.w / 2, this.boundary.h / 2);
                    this.southWest = new QuadTree(aabb);

    aabb = new AABB(this.boundary.x + this.boundary.w / 2, this.boundary.y + this.boundary.h / 2,
                    this.boundary.w / 2, this.boundary.h / 2);
    this.southEast = new QuadTree(aabb);

  }

  insert(b){
    if(!this.boundary.containsBall(b)) {
      return false;
    }
    else if(this.balls.length < QuadTree.NODE_CAPACITY) {
      this.balls.push(b);
    }
    else {
      if(this.northEast == null){
        this.subdivide();
      }
      this.northEast.insert(b);
      this.northWest.insert(b);
      this.southWest.insert(b);
      this.southEast.insert(b);
    }
    return true;
  }


  queryRange(area){
   let ballsInRange = [];
   let cond;
    if(area instanceof AABB){
      cond = !this.boundary.intersectsAABB(area);
    }
    else if(area instanceof Circle){
      cond = !this.boundary.containsBall(area);
    }
    else {
      throw Error("Wrong area type.");
    }
    if(cond){
      return ballsInRange;
    }
    for(const ball of this.balls){
      if(this.boundary.containsBall(ball)){
        ballsInRange.push(ball);
      }
    }

    if(this.northEast == null) {
      return ballsInRange;
    }

    ballsInRange = ballsInRange.concat(this.northEast.queryRange(area));
    ballsInRange = ballsInRange.concat(this.northWest.queryRange(area));
    ballsInRange = ballsInRange.concat(this.southEast.queryRange(area));
    ballsInRange = ballsInRange.concat(this.southWest.queryRange(area));

    return ballsInRange;

  }
}

class Arena {
  static DEFAULT_WIDTH = window.innerWidth;
  static DEFAULT_HEIGHT = window.innerHeight;
  static COLIDED_COLOR = "red";
  static UNCOLIDED_COLOR = "black";
  static drawGrid = true;
  static aabb = new AABB(0, 0, Arena.DEFAULT_WIDTH, Arena.DEFAULT_HEIGHT);

  constructor(canvas) {
    this.balls = [];
    this.canvas = document.getElementById(canvas);
    this.canvas.width = Arena.DEFAULT_WIDTH;
    this.canvas.height = Arena.DEFAULT_HEIGHT;

    this.ctx = this.canvas.getContext("2d");
    this.quad = new QuadTree(Arena.aabb);

    this.addBall = this.addBall.bind(this);

    this.update = this.update.bind(this);
    this.moveAll = this.moveAll.bind(this);
    //this.canvas.addEventListener("click", this.addBall);
    }

  createBalls(n) {
    for(let i = 0; i < n; i++) {
      let x = MathTools.randomInt(Arena.DEFAULT_WIDTH - 2 * Ball.RADIUS) + Ball.RADIUS;
      let y = MathTools.randomInt(Arena.DEFAULT_HEIGHT - 2 * Ball.RADIUS) + Ball.RADIUS;
      this.balls.push(new Ball(x, y));
    }
  }

  addBall(x, y) {
    this.balls.push(new Ball(x, y));
  }

  moveAll() {
    for(const ball of this.balls) {
      ball.move();
    }
  }

  drawBalls() {
    for(const ball of this.balls) {
      this.ctx.fillStyle = Arena.COLIDED_COLOR;
      this.ctx.strokeStyle = Arena.UNCOLIDED_COLOR;
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
      if(ball.collision) {
        this.ctx.fill();
      }
      else {
        this.ctx.stroke();
      }
    }
  }

  drawGrid(qTree){
    const boundary = qTree.boundary;
    this.ctx.strokeRect(boundary.x, boundary.y, boundary.w, boundary.h);

    if(qTree.northEast != null){
      this.drawGrid(qTree.northEast);
      this.drawGrid(qTree.northWest);
      this.drawGrid(qTree.southEast);
      this.drawGrid(qTree.southWest);
    }
  }

  collisionDetection(b){
      let area = new Circle(b.x, b.y, 2 * b.r);
      let possible = this.quad.queryRange(area);
      for(const ball of possible) {
        if(ball !== b && b.isCollided(ball)){
          b.collision = true;
          ball.collision = true;
        }
      }
    }


  frame(){
    this.quad = new QuadTree(Arena.aabb);
    for(const ball of this.balls) {
      this.quad.insert(ball);
    }
    for(const ball of this.balls) {
      ball.collision = false;
      this.collisionDetection(ball);
    }
    this.drawBalls();
    if(Arena.drawGrid){
      this.drawGrid(this.quad);
    }
  }

  update(){
    this.ctx.clearRect(0, 0, Arena.DEFAULT_WIDTH, Arena.DEFAULT_HEIGHT);
    this.frame();
    this.moveAll();
    requestAnimationFrame(this.update);
  }

}
const grid = document.getElementById("grid");
const ballNumber = document.getElementById("ballNumber");
ballNumber.value = 100;
grid.checked = true;
grid.addEventListener("change",() => {
  if(grid.checked){
    Arena.drawGrid = true;
  }
  else{
    Arena.drawGrid = false;
  }
});

const field = new Arena("canvas");
field.createBalls(ballNumber.value);

ballNumber.addEventListener("input", () =>{
  field.balls = [];
  if(ballNumber.value >= 0)
    field.createBalls(ballNumber.value);
  else
    console.error("Invalid number");
});

field.canvas.addEventListener("click",(e)=> {
  field.addBall(e.clientX, e.clientY);
  ballNumber.value++;
});

requestAnimationFrame(field.update);
