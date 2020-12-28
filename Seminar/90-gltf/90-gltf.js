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
        await this.loader.load('../../common/models/test1/scenery.gltf');
        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');
        this.plane = await this.loader.loadNode('Plane');
        this.scenery = new Set();
        this.scenery.add(this.plane);
        this.scenery.add(await this.loader.loadNode('WallN'));
        this.scenery.add(await this.loader.loadNode('WallS'));
        this.scenery.add(await this.loader.loadNode('WallW'));
        this.scenery.add(this.loader.loadNode('WallE'));
        this.plane.isPlane = true;
        this.scene.addNode(this.camera);
       /*
       await this.loader.load('../../common/models/test1/test1.gltf');
       this.scene = await this.loader.loadScene(this.loader.defaultScene);
       this.camera = await this.loader.loadNode('Camera');
       this.plane = await this.loader.loadNode('Plane');
       this.scene.addNode(this.camera);

       await this.loader.load('../../common/models/test1/obsticles.gltf');
       //this.obsticles = await this.loader.loadScene(this.loader.defaultScene);
      // console.log(this.obsticles);
       if(this.obsticles) {
            for(const obst of this.obsticles.nodes) {
                this.scene.addNode(obst);
            }
            */

        /*
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
        */
        for(const node of this.scene.nodes) {
            if(node.children && node.children[0] instanceof CameraNode){
                node.isCameraParent = true;
            }
        }

        this.physics = new Physics(this.scene,  this.scenery);

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
            this.startTime = this.time;
            this.camera.update(dt, this.plane);
            const ta = this.camera.getGlobalTransform();
            const posa = mat4.getTranslation(vec3.create(), ta);
            console.log(posa);
            console.log(this.plane.aabb);

           // console.log(this.camera.currentHeight);
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
