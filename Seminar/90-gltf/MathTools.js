export default class MathTools {

  static degToRad(deg){
    return deg * Math.PI / 180;
  }

  static radToDeg(rad){
    return rad * 180 / Math.PI;
  }
}