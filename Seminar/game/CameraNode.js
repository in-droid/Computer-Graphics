import Node from './Node.js';
import MathTools from './MathTools.js';
import Physics from './Physics.js';

const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;


export default class CameraNode extends Node {
    static inAir = false;

    constructor(options) {
        super(options);
        Object.assign(this, options);
        this.currentHeight = this.translation[2];
        this.startHeight = this.translation[2];

        this.velocity = [0, 0, 0];
        this.mouseSensitivity = 0.01;
        this.maxSpeed = 13.5;
        this.friction = 0.5;
        this.acceleration = 50;
        this.rotationAngle = [-90, 0, 0];

        this.jump = vec3.set(vec3.create(), 0, 0, -100);
        this.jumpCond = 0;

        this.gravity = false;

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.aabb = {
            min : [- 2, -2, -2],
            max : [2, 2, 2]
        }

        //this.camera.updateMatrix();
    }

    update(dt, plane, currentLvl) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            Math.sin(MathTools.degToRad(c.rotationAngle[1])),
            -Math.cos(MathTools.degToRad(c.rotationAngle[1])),
            0);


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
        if(this.keys['Space'] && this.jumpCond < 2) {
            vec3.add(acc, acc, this.jump);
            this.jumpCond++;
            CameraNode.inAir = true;
        }


        if(c.translation[2]  < this.currentHeight) {
            vec3.scaleAndAdd(acc, acc, Physics.CAMERA_GRAVITY, dt *c.acceleration);
        }
        else {
            this.jumpCond = 0;
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

        if(c.translation[2] > this.currentHeight) {
            c.translation[2] = this.currentHeight;
        }

        const ta = c.getGlobalTransform();
        const posa = mat4.getTranslation(vec3.create(), ta);
        let diff;
        const temp = vec3.create();

        if(posa[0] <  (plane.aabb.min[0] * 2 + currentLvl.WALL_WIDTH)) {
           diff = plane.aabb.min[0] * 2 + currentLvl.WALL_WIDTH - posa[0];
           vec3.set(temp, diff, 0, 0);
        }

        if(posa[2] < plane.aabb.min[2]  * 2 + currentLvl.WALL_WIDTH) {
            diff = plane.aabb.min[2] * 2 + currentLvl.WALL_WIDTH  - posa[2];
            vec3.set(temp, 0, diff, 0);
        }

        if(posa[0] >  plane.aabb.max[0] * 2 - currentLvl.WALL_WIDTH) {
            diff = plane.aabb.max[0] * 2 - currentLvl.WALL_WIDTH - posa[0];
            vec3.set(temp, diff, 0, 0);
        }
        vec3.add(c.translation, c.translation, temp);

        if(posa[2]  > plane.aabb.max[2] * 2 - currentLvl.WALL_WIDTH) {
           diff = plane.aabb.max[2] * 2 - currentLvl.WALL_WIDTH - posa[2];
           vec3.set(temp, 0, diff, 0);
        }
        vec3.add(c.translation, c.translation, temp);
        c.updateMatrix();
        return MathTools.checkEquality(posa, currentLvl.FINISH_COORD, 1);
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

        quat.fromEuler(c.rotation, rotacija[0], 0, rotacija[1]);
        rotacija[1] = ((rotacija[1] % MathTools.radToDeg(twopi))
                       + MathTools.radToDeg(twopi)) % MathTools.radToDeg(twopi);
    }
    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    
}