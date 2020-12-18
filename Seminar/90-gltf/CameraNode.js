import Node from './Node.js';
import MathTools from './MathTools.js';

const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;

export default class CameraNode extends Node {

    constructor(options) {
        super(options);
        Object.assign(this, options);

        this.velocity = [0, 0, 0];
        this.mouseSensitivity = 0.01;
        this.maxSpeed = 10;
        this.friction = 1;
        this.acceleration = 50;
        this.rotationAngle = [-90, 0, 0];

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};

        this.camera.updateMatrix();
    }

    update(dt) {
        const c = this;
       // console.log(c.translation);
       // console.log(c.rotationAngle);
        const forward = vec3.set(vec3.create(),
            Math.sin(MathTools.degToRad(c.rotationAngle[1])),
            -Math.cos(MathTools.degToRad(c.rotationAngle[1])),
            0);
        //const forward = vec3.set(vec3.create(), 0, MathTools.degToRad(c.rotationAngle[1]), 0);

            const right = vec3.set(vec3.create(),
            Math.cos(MathTools.degToRad(c.rotationAngle[1])),
            Math.sin(MathTools.degToRad(c.rotationAngle[1])),
            0);

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc,
                        dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
        vec3.scaleAndAdd(c.translation, c.translation, c.velocity, dt);
        //c.updateTransform();

        }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;
        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;
        const rotacija = c.rotationAngle;
        rotacija[0] -= dy * c.mouseSensitivity;
        rotacija[1] += dx * c.mouseSensitivity;

        if (MathTools.degToRad(rotacija[0]) < -pi) {
            rotacija[0] = -180;
        }
        if (rotacija[0] > 0) {
            rotacija[0] = 0;
        }

        //const axis = quat.create();
       // quat.fromEuler(axis, -90, 0, 0);

        quat.fromEuler(c.rotation, rotacija[0], 0, rotacija[1]);
        rotacija[1] = ((rotacija[1] % MathTools.radToDeg(twopi))
                       + MathTools.radToDeg(twopi)) % MathTools.radToDeg(twopi);
        /*
        if(angle < halfpi){
            quat.rotateX(c.rotation, c.rotation, xMovement);
        }
        else {
            quat.rotateX(c.rotationTemp, c.rotationTemp, -xMovement);
        }
        c.updateMatrix();
       // quat.rotateY(c.rotation, c.rotation, -dx*c.defaults.mouseSensitivity);
        //c.updateTransform();
        c.updateMatrix();
        */
    }
    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
}