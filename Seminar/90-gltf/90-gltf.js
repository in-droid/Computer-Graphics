import Application from '../../common/Application.js';
import * as WebGL from './WebGL.js';
import GLTFLoader from './GLTFLoader.js';
import Renderer from './Renderer.js';
import Physics from './Physics.js';
import CameraNode from './CameraNode.js';
import Node from './Node.js'
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;
const vec3 = glMatrix.vec3;

class App extends Application {

    async start() {

        this.cond = true;
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/testMovement/testMovement.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        //this.scene.removeNode(this.camera);
        this.camera = await this.loader.loadNode('Camera');
       // vec3.set(this.camera.scale, 1, 10, 1);
        //this.camera.translation[2] -= 4;
        this.camera.updateMatrix();
        //this.scene.addNode(this.camera);
        this.plane = await this.loader.loadNode('Plane');
        this.plane.plane = true;
        //this.camera = new CameraNode(this.camera);
        //this.scene.addNode(this.camera);
        this.physics = new Physics(this.scene, this.camera);
        //console.log(this.camera);


        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.time = Date.now();
        this.startTime = this.time;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }

    update() {
        const t = this.time = Date.now();
       // console.log(this.physics);
       // console.log(this.startTime);
        const dt = (this.time - this.startTime) * 0.001;
        if(this.camera) {
           // console.log(dt);
            this.startTime = this.time;
            this.camera.update(dt);
            this.camera.updateMatrix();
            const posNode = vec3.create();
            console.log(posNode, this.camera.matrix);
            mat4.getTranslation(posNode, this.camera.matrix);
            this.physics.physicalCamera.setPosition({x : posNode[0], y: posNode[1], z: posNode[2]});
           // console.log(this.physics.physicalCamera.getPosition());
        }
        if (this.physics && this.camera) {
            //this.physics = new Physics(this.scene);
            if(this.cond){
                for(const [k, v] of this.physics.nodes){
                    console.log(v.getPosition())
                }
                this.cond = false;
            }
            //this.camera.updateMatrix();
           this.physics.update(dt);
        }
        if(this.camera) {
           // this.camera.translation[0]++;
            this.camera.updateMatrix();
        }

    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
        } else {
            this.camera.disable();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new dat.GUI();
    gui.add(app, 'enableCamera');
});
