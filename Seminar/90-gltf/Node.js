import Camera from './Camera.js';
const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;

export default class Node {

    constructor(options = {}) {

        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();

        if (options.matrix) {
            this.updateTransform();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }

        this.camera = options.camera || null;

        this.mesh = options.mesh || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;

        this.rotationAngle = [];
        this.rotationAngle.push(quat.getAxisAngle([1, 0, 0], this.rotation));
        this.rotationAngle.push(quat.getAxisAngle([0, 1, 0], this.rotation));
        this.rotationAngle.push(quat.getAxisAngle([0, 0, 1], this.rotation));
        console.log(this.rotationAngle);
    }

    updateTransform() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }


    getGlobalTransform() {
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.matrix);
        }
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    clone() {
        return new Node({
            ...this,
            children: this.children.map(child => child.clone()),
        });
    }

    getGlobalTransform() {
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.matrix);
        }
    }
    /*
    update(dt) {
        const c = this;
        //console.log(c.defaults.velocity);
        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[0]), 0, -Math.cos(c.rotation[0]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[0]), 0, -Math.sin(c.rotation[0]));
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
        vec3.scaleAndAdd(c.defaults.velocity, c.defaults.velocity, acc,
                        dt * c.defaults.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.defaults.velocity, c.defaults.velocity, 1 - c.defaults.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.defaults.velocity);
        if (len > c.defaults.maxSpeed) {
            vec3.scale(c.defaults.velocity, c.defaults.velocity, c.defaults.maxSpeed / len);
        }
        vec3.scaleAndAdd(c.translation, c.translation, c.defaults.velocity, dt);
        this.camera.updateMatrix();

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
        let rotation = quat.create();
        const axis = quat.create();

        quat.fromEuler(axis, -90, 0, 0);
        let prev = quat.create();
       // console.log(this.defaults.rotacija);
        if(this.camera instanceof Camera) {
            const xMovement = -dy * c.defaults.mouseSensitivity;
            quat.rotateX(c.rotationTemp, c.rotationTemp, xMovement);
            let angle = quat.getAngle(axis, c.rotationTemp);
            //angle = angle % halfpi;
            //console.log(angle * 180/pi);
            console.log(c.rotation);
            if(angle < halfpi){
               quat.rotateX(c.rotation, c.rotation, xMovement);
            }
            else{
                quat.rotateX(c.rotationTemp, c.rotationTemp, -xMovement);
            }
            quat.rotateY(c.rotation, c.rotation, -dx*c.defaults.mouseSensitivity);
        }

            //c.defaults.rotacija[0] -= dy * c.defaults.mouseSensitivity;
           // c.defaults.rotacija[1] -= dx * c.defaults.mouseSensitivity;
            // Limit pitch
            /*
            if (c.defaults.rotacija[0] > halfpi) {
                c.defaults.rotacija[0] = halfpi;
            }
            if (c.defaults.rotacija[0] < -halfpi) {
                c.defaults.rotacija[0] = -halfpi;
            }
            */
            // quat.fromEuler(rotation, c.defaults.rotacija[0],
            //              c.defaults.rotacija[1], c.defaults.rotacija[2]);
            //console.log(rotation);
            //const angle = quat.getAngle(axis, );
            //console.log(angle);
            //quat.rotateX(c.rotation,c.rotation ,angle);

           // quat.rotateX(prev, c.rotation, 0);
           /*
            quat.rotateX(rotation, c.rotation, -dy * c.defaults.mouseSensitivity);
            let angle = (quat.getAxisAngle([1, 0, 0], rotation));

            let prevAngle = (quat.getAxisAngle([1, 0, 0], prev));
            console.log(angle);
            console.log(angle * 180 / Math.PI);
            if(angle > 10 *Math.PI / 180 && angle < 170 * Math.PI / 180)
                console.log("VMRO VECNO");
                quat.rotateX(c.rotation, c.rotation, angle);
            }

            quat.rotateY(c.rotation, c.rotation, -dx*c.defaults.mouseSensitivity);
            //console.log(c.rotation);
           //let angle = (quat.getAxisAngle([1, 0, 0], c.rotation));
            // c.rotation[0] -= dy * c.defaults.mouseSensitivity;
           //  c.rotation[1] -= dx * c.defaults.mouseSensitivity;
            const pi = Math.PI;
            const twopi = pi * 2;
            const halfpi = pi / 2;
            /*
            if (angle == 0) {
                quat.rotateX(c.rotation, c.rotation, halfpi - angle);
            }
            */
            /*
            if (c.rotation[0] < -halfpi) {
                c.rotation[0] = -halfpi;
            }

          //  c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
        }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
    */
}
Node.defaults = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    aabb: {
        min: [0, 0, 0],
        max: [0, 0, 0],
    },
}
