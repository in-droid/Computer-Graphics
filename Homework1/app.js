class Vector4f {
  constructor(x, y, z, w = 1) {
    if (w == 0) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    } else {
      this.x = x / w;
      this.y = y / w;
      this.z = z / w;
      this.w = 1;
    }
  }

  static negate(v) {
    return this.scalarProduct(-1, v);
  }

  static add(v, u) {
    return new Vector4f(v.x + u.x, v.y + u.y, v.z + u.z, 0);
  }

  static scalarProduct(alpha, v) {
    return new Vector4f(alpha * v.x, alpha * v.y, alpha * v.z, 0);
  }

  static dotProduct(u, v) {
    return u.x * v.x + u.y * v.y + u.z * v.z;
  }

  static crossProduct(u, v) {
    return new Vector4f(
      u.y * v.z - u.z * v.y,
      u.z * v.x - u.x * v.z,
      u.x * v.y - u.y * v.x,
      0
    );
  }

  static length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  static normalize(v) {
    if (this.length(v) == 0) {
      console.error("The length of the vector is 0 (null vector).");
    } else
      return new Vector4f(
        v.x / this.length(v),
        v.y / this.length(v),
        v.z / this.length(v),
        0
      );
  }

  static project(u, v) {
    if (this.length(v) == 0) {
      console.error("The length of the second vector is 0 (null vector)");
    } else
      return this.scalarProduct(
        this.dotProduct(u, v) / this.dotProduct(v, v),
        v
      );
  }

  static cosPhi(u, v) {
    if (this.length(u) == 0 || this.length(v) == 0) {
      console.log("One of the vectors has a length of 0 (null vector)");
    }
    return this.dotProduct(u, v) / (this.length(u) * this.length(v));
  }
}

class Matrix4f {
  constructor(row1, row2, row3, row4) {
    this.row1 = row1;
    this.row2 = row2;
    this.row3 = row3;
    this.row4 = row4;
  }

  static negate(m) {
    return this.multiplyScalar(-1, m);
  }

  static add(m, n) {
    return new Matrix4f(
      m.row1.map((el, i) => el + n.row1[i]),
      m.row2.map((el, i) => el + n.row2[i]),
      m.row3.map((el, i) => el + n.row3[i]),
      m.row4.map((el, i) => el + n.row4[i])
    );
  }

  static transpose(m) {
    let transposed = [];
    for (let i = 0; i < 4; i++) {
      let temp = [];
      for (let row in m) {
        temp.push(m[row][i]);
      }
      transposed.push(temp);
    }
    return new Matrix4f(
      transposed[0],
      transposed[1],
      transposed[2],
      transposed[3]
    );
  }

  static multiplyScalar(alpha, m) {
    return new Matrix4f(
      m.row1.map((el) => el * alpha),
      m.row2.map((el) => el * alpha),
      m.row3.map((el) => el * alpha),
      m.row4.map((el) => el * alpha)
    );
  }

  static multiply(m, n) {
    const transN = Matrix4f.transpose(n);
    let rez = [];
    for (let rowM in m) {
      let newRow = [];
      for (let rowN in transN) {
        newRow.push(sum(m[rowM].map((el, i) => el * transN[rowN][i])));
      }
      rez.push(newRow);
    }
    return new Matrix4f(rez[0], rez[1], rez[2], rez[3]);
  }
}

class PointMenager {
  static readInput() {
    let points = [];
    const input = document.getElementById("in").value;
    for (let vector of input.split(/\n/g)) {
      let coord = vector.split(" ");
      points.push(
        new Vector4f(Number(coord[1]), Number(coord[2]), Number(coord[3]))
      );
    }
    return points;
  }

  static printOutput(points) {
    let outStr = "";
    for (let point of points) {
      outStr += `v ${point.x.toFixed(2)} ${point.y.toFixed(
        2
      )} ${point.z.toFixed(2)}\n`;
    }
    document.getElementById("out").value = outStr;
  }
}

class Transformation {
  constructor() {
    this.transformation = new Matrix4f(
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    );
  }
  translate(v) {
    this.transformation = Matrix4f.multiply(
      new Matrix4f(
        [1, 0, 0, v.x],
        [0, 1, 0, v.y],
        [0, 0, 1, v.z],
        [0, 0, 0, 1]
      ),
      this.transformation
    );
  }

  scale(v) {
    this.transformation = Matrix4f.multiply(
      new Matrix4f(
        [v.x, 0, 0, 0],
        [0, v.y, 0, 0],
        [0, 0, v.z, 0],
        [0, 0, 0, 1]
      ),
      this.transformation
    );
  }
  rotateX(phi) {
    this.transformation = Matrix4f.multiply(
      new Matrix4f(
        [1, 0, 0, 0],
        [0, Math.cos(phi), -Math.sin(phi), 0],
        [0, Math.sin(phi), Math.cos(phi), 0],
        [0, 0, 0, 1]
      ),
      this.transformation
    );
  }

  rotateY(phi) {
    this.transformation = Matrix4f.multiply(
      new Matrix4f(
        [Math.cos(phi), 0, Math.sin(phi), 0],
        [0, 1, 0, 0],
        [-Math.sin(phi), 0, Math.cos(phi), 0],
        [0, 0, 0, 1]
      ),
      this.transformation
    );
  }

  rotateZ(phi) {
    this.transformation = Matrix4f.multiply(
      new Matrix4f(
        [Math.cos(phi), -Math.sin(phi), 0, 0],
        [Math.sin(phi), Math.cos(phi), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ),
      this.transformation
    );
  }

  transformPoint(v) {
    let coordinates = [];
    for (let coor in v) {
      coordinates.push(v[coor]);
    }
    return new Vector4f(
      sum(this.transformation.row1.map((el, i) => el * coordinates[i])),
      sum(this.transformation.row2.map((el, i) => el * coordinates[i])),
      sum(this.transformation.row3.map((el, i) => el * coordinates[i])),
      sum(this.transformation.row4.map((el, i) => el * coordinates[i]))
    );
  }
}

class TransformPoints {
  static transform() {
    let points = PointMenager.readInput();
    let transformation = new Transformation();

    transformation.translate(new Vector4f(1.25, 0, 0));
    transformation.rotateZ(Math.PI / 3);
    transformation.translate(new Vector4f(0, 0, 4.15));
    transformation.translate(new Vector4f(0, 3.14, 0));
    transformation.scale(new Vector4f(1.12, 1.12, 1));
    transformation.rotateY((5 * Math.PI) / 8);
    PointMenager.printOutput(
      points.map((point) => transformation.transformPoint(point))
    );
  }
}

function sum(r1) {
  let rez = 0;
  for (let n of r1) {
    rez += n;
  }
  return rez;
}

const btn = document.getElementById("calculate");
btn.addEventListener("click", TransformPoints.transform);
