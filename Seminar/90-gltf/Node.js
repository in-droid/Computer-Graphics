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
        //console.log(this.rotationAngle);
        let maxaabb, minaabb;
        if(this.mesh) {
             maxaabb = this.mesh.primitives[0].attributes.POSITION.max.
             map((e, i) => e * Math.abs(this.scale[i] / 2));
             minaabb = this.mesh.primitives[0].attributes.POSITION.min.
             map((e, i) => e * Math.abs(this.scale[i] / 2));
        }
        else {
            maxaabb = [0, 0, 0];
            minaabb = [0, 0, 0];
        }
       // console.log(aabb);
       // const maxaabb = vec3.create();
       // vec3.sub(minaabb, this.translation, this.scale);
       // vec3.add(maxaabb, this.translation, this.scale);
        this.aabb = {

            min: minaabb,
            max: maxaabb,
            height: maxaabb[1] - minaabb[1]
        }
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
