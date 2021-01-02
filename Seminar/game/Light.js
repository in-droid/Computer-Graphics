import Node from './Node.js';

export default class Light extends Node {

    static Light_ON = {
        position         : [0, 0.48, 0],
        ambientColor     : [255, 255, 255],
        diffuseColor     : [250, 250, 250],
        specularColor    : [250, 250, 250],
        shininess        : 1,
        attenuatuion     : [1.0, 0.04, 0.001],
        on :               true,
        };

    static Light_OFF = {
            position         : [0, 0.48, 0],
            ambientColor     : [50, 50, 55],
            diffuseColor     : [50, 50, 50],
            specularColor    : [50, 50, 50],
            shininess        : 1,
            attenuatuion     : [1.0, 0.4, 0.001],
            on :               false,
    }

    constructor() {
        super();

        Object.assign(this, Light.Light_OFF);
    }

    turnOn() {
        Object.assign(this, Light.Light_ON);

    }

    turnOff() {
        Object.assign(this, Light.Light_OFF);
    }

}