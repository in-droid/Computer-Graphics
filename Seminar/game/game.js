import Application from '../../common/Application.js';
import * as WebGL from './WebGL.js';
import GLTFLoader from './GLTFLoader.js';
import Renderer from './Renderer.js';
import Physics from './Physics.js';
import CameraNode from './CameraNode.js';
//import StartScreen from './StartScreen.js';
import Light from './Light.js';
import MathTools from './MathTools.js';
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;
const vec3 = glMatrix.vec3;

class App extends Application {

    static LEVELS = {
        0: {
            END_TIME: 35,
            FINISH_COORD : [23.7616, 26.409467, -1.840168],
            SCENE : '../../common/models/test1/scenery.gltf',
            GENERATOR : [-15, -15, 0],
            WALL_WIDTH : 1.9,
        },
        1 : {
            END_TIME : 20,
            FINISH_COORD : [23.7616, 26.409467, -1.840168],
            SCENE : '../../common/models/test1/scenery.gltf',
            GENERATOR : [-15, -15, 0],
            WALL_WIDTH : 1.9,
        },
        2 : {
            END_TIME : 15,
            FINISH_COORD : [23.7616, 26.409467, -1.840168],
            SCENE : '../../common/models/test1/scenery.gltf',
            GENERATOR : [-15, -15, 0],
            WALL_WIDTH : 1.9,

        }

    };
    static FAILED = "GAME OVER! PRESS R TO TRY AGAIN!"
    static WIN = "LEVEL PASSED!";
    static LOADING = "LOADING WORLD.....";
    static START = "PRESS SPACE TO START!";
    static FINISH = "CONGRADULATIONS\n YOU COMPLETED THE GAME!";
    static TASK = "The electricity is low, go fix the generator!";
    async start() {

        loading.innerHTML = App.LOADING;
        endMsg.innerHTML = App.START;
        info.innerHTML = App.TASK;

        this.alive = false;
        this.fixes = 0;

        this.taskComplete = false;

        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/test1/scenery.gltf');
        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');
        this.plane = await this.loader.loadNode('Plane');
        this.toruses = [];
        this.toruses.push(await this.loader.loadNode('Torus1'));
        this.toruses.push(await this.loader.loadNode('Torus2'));
        this.finish = await this.loader.loadNode('Finish');
        this.toruses.push(this.finish);

        for(const torus of this.toruses) {
            torus.isAnimated = true;
        }


        this.scenery = new Set();
        this.scenery.add(this.plane);
        this.scenery.add(await this.loader.loadNode('WallN'));
        this.scenery.add(await this.loader.loadNode('WallS'));
        this.scenery.add(await this.loader.loadNode('WallW'));
        this.scenery.add(this.loader.loadNode('WallE'));
        this.plane.isPlane = true;
        this.scene.addNode(this.camera);

        this.light = new Light();
        this.scene.addNode(this.light);

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
        this.timer = Date.now();

        this.levelNum = 0
        this.currentLvl = App.LEVELS[this.levelNum];
        this.pointerLock = false;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        this.restart = this.restart.bind(this);
        this.eventHandler = this.eventHandler.bind(this);

        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);
        document.addEventListener("keydown", this.eventHandler);
        loading.innerHTML = "";
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera, this.light);
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
        if(this.toruses){
            this.animations();
        }
        if(this.alive || this.pointerLock) {
            const t = this.time = Date.now();
            this.task();

            const dt = (this.time - this.startTime) * 0.001;
            if(this.camera) {
                this.startTime = this.time;
                const win = this.camera.update(dt, this.plane, this.currentLvl);

                if(win && this.taskComplete && this.alive) {
                    const nOfLevels = Object.keys(App.LEVELS).length;
                    endMsg.innerHTML = App.WIN;
                    //this.alive = false;
                    this.levelNum++;
                    if(this.levelNum < nOfLevels){
                        this.currentLvl = App.LEVELS[this.levelNum];
                        this.light.turnOff();
                        this.restart();
                    }
                    else {
                        endMsg.innerHTML = App.FINISH;
                        this.alive = false;
                    }
                }
                if(((t - this.timer) * 0.001) > this.currentLvl.END_TIME) {
                    endMsg.innerHTML = App.FAILED;
                    this.alive = false;
                }
                const timeLeft = Math.floor(this.currentLvl.END_TIME - (t - this.timer) * 0.001);
                if(timeLeft >= 0) {
                    timer.innerHTML = Math.floor(this.currentLvl.END_TIME - (t - this.timer) * 0.001);
                }

               // console.log(this.camera.translation);
            }

            if (this.physics) {
                this.physics.update(dt);
            }
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
            this.pointerLock = false;
        }
    }

    animations() {
        for(const torus of this.toruses) {

            quat.rotateY(torus.rotation, torus.rotation, 0.1);
            torus.updateMatrix();
            if(torus !== this.finish) {
            if(torus.scale[0] > 1.1) {
                vec3.scale(torus.scale, torus.scale, 1/1.001);
            }
            else {
                vec3.scale(torus.scale, torus.scale, 1.2);
            }
        }
        }
    }

    restart() {
        vec3.set(this.camera.translation, 0, 0, 0);
        quat.fromEuler(this.camera.rotation, -90, 0, 0);
        this.camera.rotationAngle = [-90, 0, 0];
        this.camera.velocity = [0, 0, 0];
        this.camera.updateMatrix();
        this.timer = Date.now();
        this.light.turnOff();
        this.alive = true;
        endMsg.innerHTML = "";
        info.innerHTML = App.TASK;
    }

    task() {
        const player = this.camera.translation;
        if(!this.light.on && MathTools.checkEquality(player, this.currentLvl.GENERATOR, 5)) {
            this.repairPos = true;
            info.innerHTML = "PRESS E FAST TO FIX IT!";
            if(this.fixes > 20) {
                this.light.turnOn();
                info.innerHTML = "RUN!!!";
                this.fixes = 0;
                this.taskComplete = true;
            }
        }
    }


    eventHandler(e) {
        if(e.code === "KeyR") {
            this.restart();

        }
        if(e.code === "Space") {
            canvas.requestPointerLock();
            this.alive = true;
            this.pointerLock = true;
            endMsg.innerHTML = "";
            //this.timer = Date.now();
        }
        if(e.code === "KeyE" && this.repairPos){
            this.fixes ++;
        }
    }

}

const canvas = document.querySelector('canvas');
document.addEventListener('DOMContentLoaded', () => {
    const app = new App(canvas);
   // canvas.onclick = () => {
   //     canvas.requestPointerLock();
   // }
    //const gui = new dat.GUI();
    //gui.add(app, 'vmro');
});
const timer = document.getElementById("timer");
const endMsg = document.getElementById("end");
const info = document.getElementById("info");
const loading = document.getElementById("loading");
