class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isSelected = false;
  }
  static size = 10;
  draw(color, size) {
    if (this.isSelected) {
      ctx.fillStyle = "green";
    } else {
      ctx.fillStyle = color;
    }

    if (this instanceof InterpolatedPoint) {
      ctx.fillRect(this.x - 5, this.y - 5, size, size);
    }

    if (this instanceof AproximatedPoint) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, 2 * Math.PI, false);
      ctx.fill();
    }
  }

  static distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  static reflect(a, origin) {
    return new AproximatedPoint(2 * origin.x - a.x, 2 * origin.y - a.y);
  }

  static drawLine(a, b, dotted = false, selected = false, color = "red") {
    ctx.lineWidth = 1.5;
    if (dotted) {
      ctx.strokeStyle = "grey";
      ctx.setLineDash([3, 4]);
    } else if (!selected) {
      ctx.strokeStyle = "black";
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = color;
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

class InterpolatedPoint extends Point {
  constructor(x, y) {
    super(x, y);
  }
  static color = "blue";
  draw(selected = false) {
    if (selected) {
      super.draw("yellow", InterpolatedPoint.size);
    } else {
      super.draw(InterpolatedPoint.color, InterpolatedPoint.size);
    }
  }
}

class AproximatedPoint extends Point {
  constructor(x, y) {
    super(x, y);
  }
  static points = [];
  static color = "red";
  static size = 5;
  draw() {
    super.draw(AproximatedPoint.color, AproximatedPoint.size);
  }
}

class BezierCurve {
  static curves = [];
  constructor(p0, p1, p2, p3) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.points = [];

    this.previous;
    this.isSelected = false;
    this.color = "black";
  }

  setCurvePoints(p0, p1, p2, p3) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  addCurve() {
    BezierCurve.curves.push(this);
  }

  calculateCubic(acc = 1 / (Point.distance(this.p0, this.p3) * 2)) {
    //acc = accuracy
    let qx, qy;
    for (let t = 0; t <= 1; t += acc) {
      qx =
        Math.pow(1 - t, 3) * this.p0.x +
        3 * Math.pow(1 - t, 2) * t * this.p1.x +
        3 * (1 - t) * t * t * this.p2.x +
        Math.pow(t, 3) * this.p3.x;
      qy =
        Math.pow(1 - t, 3) * this.p0.y +
        3 * Math.pow(1 - t, 2) * t * this.p1.y +
        3 * (1 - t) * t * t * this.p2.y +
        Math.pow(t, 3) * this.p3.y;
      this.points.push(new Point(qx, qy));
    }
  }
  canvasDraw() {
    let prev = this.p0;
    for (const point of this.points) {
      Point.drawLine(prev, point, false, this.isSelected, this.color);
      prev = point;
    }
    Point.drawLine(prev, this.p3);
    Point.drawLine(this.p0, this.p1, true);
    Point.drawLine(this.p2, this.p3, true);
    this.p0.draw();
    this.p1.draw();
    this.p2.draw();
    this.p3.draw();
  }
  static drawCurves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const curve of BezierCurve.curves) {
      curve.canvasDraw();
    }
  }
}

class UserInteractions {
  constructor() {
    this.tempPoints = [];
    this.mode = "draw";

    this.selectPoint = this.selectPoint.bind(this);
    this.modeChange = this.modeChange.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.click = this.click.bind(this);
    this.selectCurve = this.selectCurve.bind(this);
    this.deleteCurves = this.deleteCurves.bind(this);
    this.newCurveSet = this.newCurveSet.bind(this);
    this.getColorValue = this.getColorValue.bind(this);

    this.selectedPoint;
    this.selectedCurves = [];
    this.curvesForDeleting = [];
    this.newCurve = true;
  }

  static collision(point, x, y, dist = 15) {
    return Math.abs(point.x - x) <= dist && Math.abs(point.y - y) <= dist;
  }

  click(e) {
    let p;
    if (this.newCurve) {
      if (this.tempPoints.length <= 1) {
        p = new InterpolatedPoint(e.clientX, e.clientY);
      } else {
        p = new AproximatedPoint(e.clientX, e.clientY);
      }
      p.draw();
      this.tempPoints.push(p);
      if (this.tempPoints.length == 4) {
        this.drawFirst();
        p.draw();
        this.tempPoints = [];
        this.newCurve = false;
      }
    } else {
      if (this.tempPoints.length == 0) {
        p = new InterpolatedPoint(e.clientX, e.clientY);
      } else {
        p = new AproximatedPoint(e.clientX, e.clientY);
      }
      p.draw();
      this.tempPoints.push(p);
      if (this.tempPoints.length == 2) {
        this.drawNext();
        this.tempPoints = [];
      }
    }
  }

  drawFirst() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const curve = new BezierCurve(
      this.tempPoints[0],
      this.tempPoints[2],
      this.tempPoints[3],
      this.tempPoints[1]
    );
    curve.calculateCubic();
    curve.addCurve();
    BezierCurve.drawCurves();
    // curve.canvasDraw();
  }
  drawNext() {
    const prev = BezierCurve.curves[BezierCurve.curves.length - 1];
    const curve = new BezierCurve();
    curve.previous = prev;
    curve.setCurvePoints(
      curve.previous.p3,
      Point.reflect(curve.previous.p2, curve.previous.p3),
      this.tempPoints[1],
      this.tempPoints[0]
    );
    /*
    const curve = new BezierCurve(
      prev.p3,
      Point.reflect(prev.p2, prev.p3),
      this.tempPoints[1],
      this.tempPoints[0]
    );
    */
    curve.calculateCubic();
    curve.addCurve();
    curve.canvasDraw();
  }

  mouseMove(e) {
    if (this.selectedPoint != null && this.selectedCurves.length != 0) {
      this.selectedPoint.x = e.clientX;
      this.selectedPoint.y = e.clientY;
      for (const curve of this.selectedCurves) {
        curve.points = [];
        curve.calculateCubic();
        BezierCurve.drawCurves();
      }
    }
    /*
    if (this.selectedPoint != null) {
      this.selectedPoint.x = e.clientX;
      this.selectedPoint.y = e.clientY;
      this.selectedCurve.points = [];
      this.selectedCurve.calculateCubic();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      BezierCurve.drawCurves();
    }
    */
  }
  mouseUp(e) {
    this.selectedCurves = [];
    this.selectedPoint.isSelected = false;
    this.selectedPoint.draw();
    this.selectedPoint = null;
  }

  selectPoint(e) {
    for (const curve of BezierCurve.curves) {
      for (const point in curve) {
        if (
          curve[point] instanceof Point &&
          UserInteractions.collision(curve[point], e.clientX, e.clientY)
        ) {
          this.selectedPoint = curve[point];
          this.selectedCurves.push(curve);
          curve[point].isSelected = true;
          if (
            this.selectedPoint instanceof InterpolatedPoint &&
            this.selectedCurves[0].prev != null
          ) {
            this.selectedCurves.push(this.selectedCurve[0].previous);
          }
        }
      }
    }
  }

  selectCurve(e) {
    let cond = false;
    for (const curve of BezierCurve.curves) {
      let step = Math.round(curve.points.length / 15);
      for (let i = 0; i < curve.points.length; i += step) {
        if (
          UserInteractions.collision(curve.points[i], e.clientX, e.clientY, 15)
        ) {
          curve.isSelected = true;
          curve.color = this.getColorValue();
          this.curvesForDeleting.push(curve);
          cond = true;
          break;
        }
        if (cond) break;
      }
      BezierCurve.drawCurves();
    }
    /*
    let cond = false;
    for (const curve of BezierCurve.curves) {
      let step = Math.round(curve.point.length)
      for (const point of curve.points) {
        if (UserInteractions.collision(point, e.clientX, e.clientY, 10)) {
          curve.isSelected = true;
          this.curvesForDeleting.push(curve);
          cond = true;
          break;
        }
        if (cond) break;
      }
      BezierCurve.drawCurves();
    }
    */
  }

  deleteCurves() {
    let index;
    while (this.curvesForDeleting.length != 0) {
      let curve = this.curvesForDeleting.pop();
      index = BezierCurve.curves.indexOf(curve);
      BezierCurve.curves.splice(index, 1);
    }
    BezierCurve.drawCurves();
  }

  newCurveSet() {
    this.newCurve = true;
  }

  getColorValue(e) {
    return colorPicker.value;
  }

  modeChange() {
    if (drawButton.checked) {
      this.mode = "draw";
      canvas.addEventListener("click", this.click);
      canvas.removeEventListener("mousedown", this.selectPoint);
      canvas.removeEventListener("mousemove", this.mouseMove);
      canvas.removeEventListener("mousedown", this.selectCurve);
    } else if (moveButton.checked) {
      this.mode = "move";
      canvas.removeEventListener("click", this.click);
      canvas.removeEventListener("mousedown", this.selectCurve);
      canvas.addEventListener("mousedown", this.selectPoint);
      canvas.addEventListener("mousemove", this.mouseMove);
      canvas.addEventListener("mouseup", this.mouseUp);
    } else {
      this.mode = "select";
      canvas.removeEventListener("click", this.click);
      canvas.removeEventListener("mousedown", this.selectPoint);
      canvas.removeEventListener("mousemove", this.mouseMove);
      canvas.removeEventListener("mouseup", this.mouseUp);
      canvas.addEventListener("mousedown", this.selectCurve);
    }
  }
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 150;

const ctx = canvas.getContext("2d");

const ui = new UserInteractions();

canvas.addEventListener("click", ui.click);
const drawButton = document.getElementById("draw");
const moveButton = document.getElementById("move");
const selectButton = document.getElementById("select");
const deleteButton = document.getElementById("delete");
const newCurveButton = document.getElementById("newCurve");
const colorPicker = document.getElementById("colorpicker");
//window.addEventListener("load", startup, false);
moveButton.addEventListener("change", ui.modeChange);
drawButton.addEventListener("change", ui.modeChange);
selectButton.addEventListener("change", ui.modeChange);
deleteButton.addEventListener("click", ui.deleteCurves);
newCurveButton.addEventListener("click", ui.newCurveSet);
colorPicker.addEventListener("input", ui.getColorValue);
/*
function startup() {
  colorWell = document.querySelector("#colorWell");
  colorWell.addEventListener("input", updateFirst, false);
  colorWell.select();
}
*/
