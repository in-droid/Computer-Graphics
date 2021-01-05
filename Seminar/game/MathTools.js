//some math methods organisted in one class
export default class MathTools {

    static degToRad(deg) {
        return deg * Math.PI / 180;
    }

    static radToDeg(rad) {
        return rad * 180 / Math.PI;
    }


  static ifClose(v, u, n){
    return Math.abs(v[0] - u[0]) < n &&
        Math.abs(v[1] - u[1]) < n &&
        Math.abs(v[2] - u[2]) < n
    }
}