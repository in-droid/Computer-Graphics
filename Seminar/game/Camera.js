const mat4 = glMatrix.mat4;

import Utils from './Utils.js';
import Node from './Node.js';

export default class Camera {

    constructor(options = {}) {
        Utils.init(this, this.constructor.defaults, options);
        this.node = options.node || null;
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();
    }

}

