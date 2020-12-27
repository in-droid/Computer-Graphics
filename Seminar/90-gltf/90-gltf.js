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
        this.c =0;
        await this.loader.load('../../common/models/phy/cube/cube.gltf');
        this.cube = await this.loader.loadScene(this.loader.defaultScene);
        this.cube = await this.loader.loadNode('Cube');
        this.cube.isCube = true;
        await this.loader.load('../../common/models/phy/cube2/cube2.gltf');
        this.cube2 = await this.loader.loadScene(this.loader.defaultScene);
        this.cube2 = await this.loader.loadNode('Cube2');
        this.cube2.isCube2 = true;
        await this.loader.load('../../common/models/phy/plane.gltf');
        this.plane = await this.loader.loadNode('Plane');
        this.plane.isPlane = true;
        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');

        this.scene.addNode(this.camera);
        this.scene.addNode(this.cube);
        this.scene.addNode(this.cube2);

        for(const node of this.scene.nodes){
            if(node.children[0] instanceof CameraNode){
                node.isCameraParent = true;
            }
        }
        /*
        if(this.camera) {
            vec3.set(this.camera.translation, 0, 0, -2.5);
            this.camera.updateMatrix();
        }
        */

        //this.cube = await this.loader.loadNode('Cube');
        //console.log(this.cube);

        //this.camera = await this.loader.loadNode('Camera');

       // console.log(this.camera);
       // this.camera.updateMatrix();
       //this.scene.addNode(this.camera);
        //this.scene.addNode(this.camera);
        //this.cube = await this.loader.loadNode('Cube');
        //this.cube.isCube = true;
        //this.plane = await this.loader.loadNode('Plane');
        //this.plane.plane = true;
        //this.scene.removeNode(this.plane);
        //this.camera = new CameraNode(this.camera);
        //this.scene.addNode(this.camera);
        this.physics = new Physics(this.scene,  this.plane);

        //this.scene.splice()
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
        console.log(this.scene);
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
            console.log(this.camera.translation);
            this.startTime = this.time;
            this.camera.update(dt);
           }

        if (this.physics) {
           this.physics.update(dt);
            //this.camera.updateMatrix();
           // console.log(this.camera.translation, this.camera.currentHeight);
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
